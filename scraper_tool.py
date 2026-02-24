"""
scraper_tool.py — Collecteur de Données Externes pour le RL
Fournit des signaux du monde réel à l'agent RL.
Tourne en local, collecte depuis internet, stocke localement.

IMPORTANT : Le RL lui-même n'a PAS besoin d'internet.
Ce module est OPTIONNEL — il enrichit le signal de récompense
mais n'est pas nécessaire au fonctionnement de base.
"""

import asyncio
import json
import logging
import re
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional
from urllib.parse import urlparse, quote_plus

import httpx

logger = logging.getLogger("pme.scraper")

# Dossier de stockage local — les données collectées restent en local
CACHE_DIR = Path("scraper_cache")
CACHE_DIR.mkdir(exist_ok=True)


# ══════════════════════════════════════════════════════════════════
# POURQUOI UN SCRAPER ? — EXPLICATION CLAIRE
# ══════════════════════════════════════════════════════════════════
#
# Sans scraper, le RL optimise selon des règles fixes (schema.org).
# Il sait que aggregateRating est "bien" parce qu'on l'a codé.
#
# Avec scraper, le RL peut apprendre des choses qu'on n'a pas codé :
# - "Les concurrents qui dominent Google ont TOUS cette propriété"
# - "Les gens cherchent 'casque sans fil' pas 'casque Bluetooth'"
# - "Google affiche des rich results pour ce type de schéma"
#
# Le scraper collecte ces signaux → les transforme en récompenses RL.
# C'est la différence entre un RL qui connaît les règles
# et un RL qui observe le monde réel.
#
# ══════════════════════════════════════════════════════════════════


# ── HEADERS pour ne pas se faire bloquer ─────────────────────────
HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8",
    "Accept-Encoding": "gzip, deflate, br",
}


# ══════════════════════════════════════════════════════════════════
# OUTIL 1 — SCRAPER JSON-LD CONCURRENT
# Lit ce que les concurrents déclarent dans leurs pages
# ══════════════════════════════════════════════════════════════════

class CompetitorScraper:
    """
    Scrape les JSON-LD des pages concurrentes.
    
    Ce que le RL en apprend :
    - Quelles propriétés les concurrents bien classés utilisent
    - Quel niveau de détail ils atteignent
    - Quelles combinaisons semblent efficaces
    
    Les données ne quittent jamais ta machine — elles sont
    juste lues depuis internet et stockées localement.
    """

    def __init__(self):
        self.cache_file = CACHE_DIR / "competitors.json"
        self.data: List[Dict] = self._load_cache()

    def _load_cache(self) -> List[Dict]:
        try:
            return json.loads(self.cache_file.read_text(encoding="utf-8"))
        except: return []

    def _save_cache(self):
        self.cache_file.write_text(
            json.dumps(self.data[-100:], indent=2, ensure_ascii=False),
            encoding="utf-8"
        )

    async def scrape_page(self, url: str) -> Dict:
        """
        Lit le JSON-LD d'une page web concurrente.
        Extrait les données structurées déclarées.
        """
        cached = next((d for d in self.data if d.get("url") == url), None)
        if cached:
            age_hours = (datetime.now() - datetime.fromisoformat(cached["scraped_at"])).total_seconds() / 3600
            if age_hours < 24:  # Cache 24h
                logger.info(f"[SCRAPER] Cache hit: {url[:50]}")
                return cached

        try:
            async with httpx.AsyncClient(
                headers=HEADERS,
                timeout=15.0,
                follow_redirects=True,
            ) as client:
                r = await client.get(url)

            if r.status_code != 200:
                return {"url": url, "error": f"HTTP {r.status_code}", "jsonld": []}

            html = r.text

            # Extraire tous les blocs JSON-LD de la page
            jsonld_blocks = []
            pattern = r'<script[^>]*type=["\']application/ld\+json["\'][^>]*>(.*?)</script>'
            matches = re.findall(pattern, html, re.DOTALL | re.IGNORECASE)

            for match in matches:
                try:
                    data = json.loads(match.strip())
                    if isinstance(data, list):
                        jsonld_blocks.extend(data)
                    else:
                        jsonld_blocks.append(data)
                except json.JSONDecodeError:
                    pass

            # Extraire le title et meta description (signaux SEO)
            title_match = re.search(r'<title[^>]*>(.*?)</title>', html, re.IGNORECASE | re.DOTALL)
            meta_desc = re.search(
                r'<meta[^>]*name=["\']description["\'][^>]*content=["\']([^"\']*)["\']',
                html, re.IGNORECASE
            )

            result = {
                "url": url,
                "scraped_at": datetime.now().isoformat(),
                "jsonld": jsonld_blocks,
                "jsonld_count": len(jsonld_blocks),
                "title": title_match.group(1).strip() if title_match else "",
                "meta_description": meta_desc.group(1).strip() if meta_desc else "",
                "has_faq": any(b.get("@type") == "FAQPage" for b in jsonld_blocks),
                "has_breadcrumb": any(b.get("@type") == "BreadcrumbList" for b in jsonld_blocks),
                "schema_types": list(set(b.get("@type", "") for b in jsonld_blocks if "@type" in b)),
            }

            # Stocker en cache local
            self.data = [d for d in self.data if d.get("url") != url]
            self.data.append(result)
            self._save_cache()

            logger.info(
                f"[SCRAPER] {url[:50]} → "
                f"{len(jsonld_blocks)} blocs JSON-LD | "
                f"Types: {result['schema_types']}"
            )
            return result

        except httpx.TimeoutException:
            return {"url": url, "error": "timeout", "jsonld": []}
        except Exception as e:
            return {"url": url, "error": str(e), "jsonld": []}

    async def scrape_competitors(self, urls: List[str]) -> Dict:
        """
        Scrape plusieurs concurrents et analyse ce qu'ils font.
        Retourne un signal pour le RL : quelles propriétés sont communes
        chez les concurrents bien positionnés.
        """
        results = []
        for url in urls:
            r = await self.scrape_page(url)
            results.append(r)
            await asyncio.sleep(2)  # Politesse — pas de spam

        # Analyser les patterns communs
        all_properties = []
        all_types = []
        for r in results:
            for block in r.get("jsonld", []):
                all_properties.extend([k for k in block.keys() if not k.startswith("@")])
                if "@type" in block:
                    all_types.append(block["@type"])

        # Compter la fréquence de chaque propriété chez les concurrents
        from collections import Counter
        prop_freq = Counter(all_properties)
        type_freq = Counter(all_types)

        # Ce signal sera utilisé comme bonus de récompense dans le RL
        # Une propriété très utilisée par les concurrents = bonus si on l'a aussi
        competitor_signal = {
            "scraped_at": datetime.now().isoformat(),
            "competitors_count": len(results),
            "most_common_properties": prop_freq.most_common(15),
            "most_common_types": type_freq.most_common(10),
            "all_have_faq": all(r.get("has_faq") for r in results if not r.get("error")),
            "all_have_breadcrumb": all(r.get("has_breadcrumb") for r in results if not r.get("error")),
            "results": results,
        }

        # Sauvegarder le signal
        signal_file = CACHE_DIR / "competitor_signal.json"
        signal_file.write_text(
            json.dumps(competitor_signal, indent=2, ensure_ascii=False),
            encoding="utf-8"
        )

        logger.info(
            f"[SCRAPER] {len(results)} concurrents analysés. "
            f"Top props: {[p for p, _ in prop_freq.most_common(5)]}"
        )
        return competitor_signal


# ══════════════════════════════════════════════════════════════════
# OUTIL 2 — SCRAPER DE TENDANCES (Google Suggest)
# Récupère le vocabulaire réel des utilisateurs
# ══════════════════════════════════════════════════════════════════

class TrendScraper:
    """
    Collecte les suggestions de recherche Google (Google Suggest API).
    Complètement légal — c'est l'API publique utilisée par
    la barre de recherche Google.
    
    Ce que le RL en apprend :
    - Le vocabulaire exact que les gens utilisent
    - Les questions fréquentes (→ FAQPage)
    - Les termes longue traîne à couvrir
    """

    def __init__(self):
        self.cache_file = CACHE_DIR / "trends.json"
        self.cache: Dict = self._load_cache()

    def _load_cache(self) -> Dict:
        try:
            return json.loads(self.cache_file.read_text(encoding="utf-8"))
        except: return {}

    def _save_cache(self):
        self.cache_file.write_text(
            json.dumps(self.cache, indent=2, ensure_ascii=False),
            encoding="utf-8"
        )

    async def get_suggestions(self, keyword: str, lang: str = "fr") -> List[str]:
        """
        Récupère les suggestions Google pour un mot-clé.
        Utilise l'API publique (pas de clé requise).
        """
        cache_key = f"{keyword}_{lang}"
        if cache_key in self.cache:
            age = (datetime.now() - datetime.fromisoformat(
                self.cache[cache_key].get("fetched_at", "2000-01-01")
            )).total_seconds() / 3600
            if age < 48:  # Cache 48h pour les tendances
                return self.cache[cache_key].get("suggestions", [])

        try:
            url = (
                f"https://suggestqueries.google.com/complete/search"
                f"?client=firefox&hl={lang}&q={quote_plus(keyword)}"
            )
            async with httpx.AsyncClient(headers=HEADERS, timeout=10.0) as client:
                r = await client.get(url)

            if r.status_code == 200:
                data = r.json()
                suggestions = data[1] if len(data) > 1 else []
                self.cache[cache_key] = {
                    "fetched_at": datetime.now().isoformat(),
                    "keyword": keyword,
                    "suggestions": suggestions,
                }
                self._save_cache()
                logger.info(f"[TRENDS] '{keyword}' → {len(suggestions)} suggestions")
                return suggestions
        except Exception as e:
            logger.warning(f"[TRENDS] Erreur pour '{keyword}': {e}")
        return []

    async def get_questions(self, keyword: str) -> List[str]:
        """
        Récupère les questions fréquentes autour d'un mot-clé.
        Utile pour générer des FAQPage pertinentes.
        """
        prefixes = ["comment", "pourquoi", "quand", "quel", "est-ce que"]
        all_questions = []
        for prefix in prefixes:
            suggestions = await self.get_suggestions(f"{prefix} {keyword}")
            questions = [s for s in suggestions if "?" in s or any(p in s.lower() for p in prefixes)]
            all_questions.extend(questions)
            await asyncio.sleep(0.5)
        return list(set(all_questions))[:20]

    async def analyze_for_rl(self, product_name: str, category: str) -> Dict:
        """
        Analyse complète d'un produit pour le RL.
        Retourne un signal de tendances utilisable comme récompense.
        """
        suggestions_product = await self.get_suggestions(product_name)
        suggestions_category = await self.get_suggestions(category)
        questions = await self.get_questions(product_name)

        # Extraire les termes sémantiquement riches
        all_terms = suggestions_product + suggestions_category
        # Termes qui indiquent une intention d'achat forte
        buying_intent_terms = [
            t for t in all_terms
            if any(w in t.lower() for w in ["prix", "acheter", "pas cher", "meilleur", "avis", "test", "comparatif"])
        ]

        signal = {
            "product": product_name,
            "category": category,
            "analyzed_at": datetime.now().isoformat(),
            "vocabulary": all_terms[:30],
            "questions_for_faq": questions,
            "buying_intent_terms": buying_intent_terms,
            "faq_potential": len(questions),
            # Score d'opportunité : plus il y a de questions, plus une FAQPage est utile
            "faq_reward_multiplier": min(len(questions) / 5.0, 2.0),
        }

        trend_file = CACHE_DIR / f"trends_{product_name.replace(' ', '_')}.json"
        trend_file.write_text(json.dumps(signal, indent=2, ensure_ascii=False), encoding="utf-8")

        return signal


# ══════════════════════════════════════════════════════════════════
# OUTIL 3 — LECTEUR DE TES PROPRES ANALYTICS
# Signaux de tes vrais visiteurs (sans envoyer rien à personne)
# ══════════════════════════════════════════════════════════════════

class AnalyticsReader:
    """
    Lit tes propres données analytics localement.
    Pas besoin d'internet — ces données sont déjà sur ta machine.
    
    Compatible avec :
    - Matomo (analytics open-source auto-hébergé) ← recommandé
    - Fichiers de log Nginx/Apache
    - Export CSV Google Analytics (si tu l'utilises encore)
    
    Ce que le RL en apprend :
    - Quelles pages ont un taux de rebond élevé (signal non-acheteur)
    - Quelles pages convertissent bien
    - Depuis quels mots-clés les gens arrivent
    """

    def __init__(self, matomo_url: str = "", matomo_token: str = ""):
        self.matomo_url = matomo_url
        self.matomo_token = matomo_token
        self.cache_file = CACHE_DIR / "analytics.json"

    async def get_bounce_signals(self, site_id: int = 1) -> Dict:
        """
        Lit les signaux de rebond depuis Matomo (auto-hébergé).
        Les pages à fort rebond = contenu sémantique insuffisant.
        """
        if not self.matomo_url:
            return self._read_from_log_files()

        try:
            url = (
                f"{self.matomo_url}/index.php"
                f"?module=API&method=Actions.getPageUrls"
                f"&idSite={site_id}&period=week&date=today"
                f"&format=JSON&token_auth={self.matomo_token}"
                f"&filter_limit=50&showColumns=label,bounce_rate,avg_time_on_page,nb_visits"
            )
            async with httpx.AsyncClient(timeout=15.0) as client:
                r = await client.get(url)

            if r.status_code == 200:
                pages = r.json()
                # Identifier les pages à problème
                high_bounce = [
                    p for p in pages
                    if float(p.get("bounce_rate", "0").replace("%", "")) > 70
                ]
                signal = {
                    "fetched_at": datetime.now().isoformat(),
                    "pages_analyzed": len(pages),
                    "high_bounce_pages": high_bounce,
                    # Ces pages ont besoin d'enrichissement sémantique urgent
                    "rl_priority_pages": [p["label"] for p in high_bounce[:5]],
                    "rl_reward_signal": "high_bounce = mauvaise sémantique = priorité RL",
                }
                self.cache_file.write_text(
                    json.dumps(signal, indent=2, ensure_ascii=False), encoding="utf-8"
                )
                return signal
        except Exception as e:
            logger.warning(f"[ANALYTICS] Matomo non accessible: {e}")

        return self._read_from_log_files()

    def _read_from_log_files(self) -> Dict:
        """
        Fallback : lit les logs Nginx/Apache locaux.
        Pas d'internet, pas de service externe.
        """
        log_paths = [
            Path("/var/log/nginx/access.log"),
            Path("/var/log/apache2/access.log"),
            Path("access.log"),
        ]
        for log_path in log_paths:
            if log_path.exists():
                logger.info(f"[ANALYTICS] Lecture log: {log_path}")
                # Analyse basique des logs
                return self._parse_nginx_log(log_path)
        return {"source": "aucun log trouvé", "pages_analyzed": 0, "high_bounce_pages": []}

    def _parse_nginx_log(self, log_path: Path) -> Dict:
        """Parse basique d'un log Nginx pour extraire les patterns."""
        try:
            lines = log_path.read_text(errors="ignore").splitlines()[-1000:]  # 1000 dernières lignes
            page_hits: Dict[str, int] = {}
            for line in lines:
                m = re.search(r'"GET (/[^\s"]*)', line)
                if m:
                    path = m.group(1).split("?")[0]
                    page_hits[path] = page_hits.get(path, 0) + 1
            return {
                "source": str(log_path),
                "total_requests": len(lines),
                "unique_pages": len(page_hits),
                "most_visited": sorted(page_hits.items(), key=lambda x: x[1], reverse=True)[:10],
            }
        except Exception as e:
            return {"error": str(e)}


# ══════════════════════════════════════════════════════════════════
# INTÉGRATION AVEC LE RL — Comment les données nourrissent l'agent
# ══════════════════════════════════════════════════════════════════

class RLDataFeeder:
    """
    Convertit les données scrapées en signaux de récompense pour le RL.
    
    C'est le pont entre le monde externe (internet, analytics)
    et le monde interne du RL (vecteurs, récompenses).
    """

    def __init__(self):
        self.competitor_scraper = CompetitorScraper()
        self.trend_scraper = TrendScraper()
        self.analytics = AnalyticsReader()
        self.signals_file = CACHE_DIR / "rl_signals.json"
        self.signals = self._load_signals()

    def _load_signals(self) -> Dict:
        try:
            return json.loads(self.signals_file.read_text(encoding="utf-8"))
        except: return {}

    def _save_signals(self):
        self.signals_file.write_text(
            json.dumps(self.signals, indent=2, ensure_ascii=False),
            encoding="utf-8"
        )

    async def collect_all_signals(
        self,
        competitor_urls: List[str],
        product_name: str,
        category: str,
    ) -> Dict:
        """
        Collecte tous les signaux externes en une fois.
        À appeler en début de nuit, avant le cycle RL.
        """
        logger.info("[FEEDER] Collecte des signaux externes...")

        signals = {}

        # 1. Signaux concurrents
        if competitor_urls:
            logger.info(f"[FEEDER] Scraping {len(competitor_urls)} concurrents...")
            comp_signal = await self.competitor_scraper.scrape_competitors(competitor_urls)
            signals["competitors"] = {
                "top_properties": [p for p, _ in comp_signal.get("most_common_properties", [])[:10]],
                "top_types": [t for t, _ in comp_signal.get("most_common_types", [])[:5]],
                "faq_dominant": comp_signal.get("all_have_faq", False),
            }

        # 2. Signaux tendances
        logger.info(f"[FEEDER] Analyse tendances pour '{product_name}'...")
        trend_signal = await self.trend_scraper.analyze_for_rl(product_name, category)
        signals["trends"] = {
            "faq_questions": trend_signal.get("questions_for_faq", [])[:10],
            "faq_multiplier": trend_signal.get("faq_reward_multiplier", 1.0),
            "buying_terms": trend_signal.get("buying_intent_terms", []),
        }

        # 3. Signaux analytics (local, pas d'internet)
        analytics_signal = await self.analytics.get_bounce_signals()
        signals["analytics"] = {
            "priority_pages": analytics_signal.get("rl_priority_pages", []),
            "high_bounce_count": len(analytics_signal.get("high_bounce_pages", [])),
        }

        self.signals = signals
        self._save_signals()
        logger.info("[FEEDER] Signaux collectés et sauvegardés localement")
        return signals

    def compute_reward_bonus(self, entity: Dict, action_name: str) -> float:
        """
        Calcule un bonus de récompense basé sur les signaux externes.
        Appelé par le RL à chaque step pour enrichir le signal de base.
        
        IMPORTANT : cette fonction est appelée par le RL, pas par internet.
        Internet a été consulté AVANT (lors de collect_all_signals).
        Le RL lui-même ne touche jamais internet.
        """
        bonus = 0.0

        comp = self.signals.get("competitors", {})
        trends = self.signals.get("trends", {})

        # Bonus si l'action ajoute une propriété commune chez les concurrents leaders
        top_props = comp.get("top_properties", [])
        if action_name in top_props:
            rank = top_props.index(action_name)
            bonus += max(0.5 - rank * 0.05, 0.1)  # Plus c'est fréquent, plus le bonus est fort

        # Bonus si on ajoute FAQPage alors que les concurrents l'ont tous
        if action_name == "add_faq_entry":
            if comp.get("faq_dominant"):
                bonus += 0.8  # Concurrents ont tous FAQPage → urgent de l'avoir
            bonus += trends.get("faq_multiplier", 1.0) * 0.3  # Questions fréquentes = FAQPage utile

        # Bonus si action correspond à un type de schéma dominant chez les concurrents
        if action_name == "add_entity":
            top_types = comp.get("top_types", [])
            if any(t in str(entity) for t in top_types):
                bonus += 0.4

        return bonus

    def get_faq_questions_from_trends(self) -> List[str]:
        """
        Retourne les vraies questions des utilisateurs pour remplir la FAQPage.
        Ces questions viennent des suggestions Google (collectées avant).
        """
        return self.signals.get("trends", {}).get("faq_questions", [])


# ══════════════════════════════════════════════════════════════════
# PIPELINE NOCTURNE COMPLÈTE
# ══════════════════════════════════════════════════════════════════

async def nightly_data_collection(
    competitor_urls: List[str],
    product_name: str,
    category: str,
) -> Dict:
    """
    Séquence nocturne complète :
    
    1. 01h00 : Collecte données externes (scraper) → stockage local
    2. 02h00 : Le RL lit les signaux stockés → optimise
    3. 03h00 : LLM génère les pages avec JSON-LD optimisé
    
    Chaque étape est indépendante.
    Le RL ne touche JAMAIS internet directement.
    """
    feeder = RLDataFeeder()

    logger.info("=" * 50)
    logger.info("PIPELINE NOCTURNE — Collecte des signaux")
    logger.info("=" * 50)

    signals = await feeder.collect_all_signals(
        competitor_urls=competitor_urls,
        product_name=product_name,
        category=category,
    )

    # Résumé de ce qui a été collecté
    summary = {
        "collected_at": datetime.now().isoformat(),
        "competitor_properties_found": len(signals.get("competitors", {}).get("top_properties", [])),
        "faq_questions_found": len(signals.get("trends", {}).get("faq_questions", [])),
        "high_bounce_pages": signals.get("analytics", {}).get("high_bounce_count", 0),
        "ready_for_rl": True,
    }

    logger.info(f"Signaux prêts pour le RL: {json.dumps(summary, indent=2)}")
    return summary


# ══════════════════════════════════════════════════════════════════
# OUTIL PME BRAIN — Intégrable dans TOOLS de pme_sovereign.py
# ══════════════════════════════════════════════════════════════════

async def t_configurer_scrapers(
    concurrent_urls: str = "",
    produit_principal: str = "",
    categorie: str = "",
):
    """
    Outil Gemini/Ollama : configure les scrapers via le chat.
    
    Exemple d'utilisation :
    "Configure les scrapers pour surveiller amazon.fr/casques et fnac.com/casques"
    """
    urls = [u.strip() for u in concurrent_urls.split(",") if u.strip()]

    if not urls:
        return {
            "success": False,
            "question": "Donnez-moi les URLs des concurrents à surveiller (séparées par des virgules) ?"
        }
    if not produit_principal:
        return {"success": False, "question": "Quel est votre produit principal ?"}

    # Sauvegarder la configuration
    config = {
        "competitor_urls": urls,
        "product_name": produit_principal,
        "category": categorie or "général",
        "configured_at": datetime.now().isoformat(),
    }
    config_file = CACHE_DIR / "scraper_config.json"
    config_file.write_text(json.dumps(config, indent=2, ensure_ascii=False), encoding="utf-8")

    return {
        "success": True,
        "message": (
            f"Scrapers configurés. {len(urls)} concurrent(s) à surveiller. "
            f"Première collecte cette nuit à 1h00. "
            f"Les données resteront sur votre machine."
        ),
        "config": config,
    }


async def t_lancer_collecte():
    """Lance manuellement une collecte de données (sans attendre la nuit)."""
    config_file = CACHE_DIR / "scraper_config.json"
    if not config_file.exists():
        return {
            "success": False,
            "message": "Scrapers non configurés. Dites-moi d'abord : 'configure les scrapers pour [URLs concurrents]'"
        }

    config = json.loads(config_file.read_text())
    logger.info("[SCRAPER] Lancement manuel de la collecte...")

    # Lancer en arrière-plan pour ne pas bloquer le chat
    asyncio.create_task(nightly_data_collection(
        competitor_urls=config["competitor_urls"],
        product_name=config["product_name"],
        category=config["category"],
    ))

    return {
        "success": True,
        "message": (
            f"Collecte lancée en arrière-plan pour {len(config['competitor_urls'])} concurrent(s). "
            f"Terminée dans 2-5 minutes. Les données sont stockées localement."
        )
    }
