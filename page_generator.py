"""
page_generator.py — Générateur de Pages Web Post-RL
Utilise le LLM local (Ollama) — zéro cloud, zéro token payant.
Prend le JSON-LD optimisé par les agents RL et génère des pages HTML
complètes avec SEO on-page, contenu sémantique et balises structurées.
"""

import json
import os
from pathlib import Path
from typing import Optional

from local_llm import call_local_llm, OLLAMA_MODEL


class WebPageGenerator:
    """
    Phase 3 du système : après les cycles RL,
    génère les pages web avec le LLM local.
    Zéro Anthropic, zéro Gemini — tout en local.
    """

    def __init__(self):
        self.model = OLLAMA_MODEL

    async def _call(self, prompt: str, temperature: float = 0.4, max_tokens: int = 4000) -> str:
        return await call_local_llm(prompt, temperature=temperature, max_tokens=max_tokens)

    async def analyze_rl_learnings(self, optimized_jsonld: list, scores_history: list, semantic_report: str) -> dict:
        """Analyse ce que le RL a appris et produit un brief d'optimisation."""
        if scores_history:
            score_debut = scores_history[0].get("composite", 0)
            score_fin   = scores_history[-1].get("composite", 0)
            progression = (score_fin - score_debut) * 100
        else:
            score_debut = score_fin = progression = 0

        prompt = f"""Tu es un expert SEO sémantique. Analyse ces résultats RL et produis un brief JSON.

Score initial: {score_debut:.3f} → Score final: {score_fin:.3f} (+{progression:.1f}%)

JSON-LD optimisé:
{json.dumps(optimized_jsonld[:2], indent=2, ensure_ascii=False)[:2000]}

Produis UNIQUEMENT ce JSON (rien d'autre):
{{
  "brief": {{
    "key_optimizations": ["optimisation 1", "optimisation 2"],
    "seo_signals": {{"title_pattern": "...", "meta_pattern": "..."}},
    "semantic_themes": ["thème 1", "thème 2"],
    "rich_results_opportunities": ["FAQPage", "Product"],
    "keyword_clusters": ["cluster 1", "cluster 2"]
  }}
}}"""

        response = await self._call(prompt, temperature=0.3)
        import re
        try:
            return json.loads(response.strip())
        except:
            m = re.search(r'\{.*\}', response, re.DOTALL)
            if m:
                try: return json.loads(m.group(0))
                except: pass
        return {"brief": {}}

    async def generate_product_page(self, original_content: str, optimized_jsonld: dict, brief: dict, product_info: dict) -> str:
        """Génère une page produit HTML complète avec JSON-LD optimisé."""
        prompt = f"""Génère une page HTML5 produit complète et professionnelle.

JSON-LD optimisé à intégrer dans <script type="application/ld+json">:
{json.dumps(optimized_jsonld, indent=2, ensure_ascii=False)}

Informations produit:
{json.dumps(product_info, indent=2, ensure_ascii=False)}

Brief SEO:
{json.dumps(brief, indent=2, ensure_ascii=False)[:800]}

Règles:
1. <head> complet : title 50-60 chars, meta description 150-160 chars, Open Graph, Twitter Card
2. <script type="application/ld+json"> avec le JSON-LD fourni
3. Structure sémantique : <header>, <main>, <section>, <footer>
4. H1 = name du produit, H2 pour chaque section
5. CSS inline minimaliste et professionnel (pas de framework externe)
6. Section FAQ si applicable, section avis si aggregateRating présent
7. Page complète prête à déployer

Génère uniquement le HTML, rien d'autre."""

        return await self._call(prompt, temperature=0.5, max_tokens=5000)

    async def generate_article_page(self, original_content: str, optimized_jsonld: dict, brief: dict, article_info: dict) -> str:
        """Génère un article optimisé avec JSON-LD Article enrichi."""
        prompt = f"""Génère une page HTML5 article optimisée pour le SEO sémantique.

JSON-LD Article optimisé:
{json.dumps(optimized_jsonld, indent=2, ensure_ascii=False)}

Infos article: {json.dumps(article_info, indent=2, ensure_ascii=False)}
Contenu original à enrichir: {original_content[:1000]}

Règles:
1. JSON-LD Article complet (author, publisher, keywords, datePublished)
2. Structure éditoriale : intro → développement → conclusion
3. Balises HTML5 sémantiques : <article>, <section>, <time datetime="...">
4. FAQ JSON-LD à la fin si pertinent
5. CSS inline professionnel
6. Page complète prête à déployer

Génère uniquement le HTML."""

        return await self._call(prompt, temperature=0.5, max_tokens=5000)

    async def inject_jsonld_into_existing_page(self, html_content: str, optimized_jsonld: list) -> str:
        """
        Option légère pour CMS (WordPress, Shopify...) :
        garde le HTML existant, remplace uniquement les blocs JSON-LD.
        """
        prompt = f"""Tu es un développeur web expert schema.org.
Injecte ce JSON-LD optimisé dans la page HTML existante.
IMPORTANT: ne modifier AUCUN autre élément HTML.

JSON-LD optimisé:
{json.dumps(optimized_jsonld, indent=2, ensure_ascii=False)}

Page HTML existante:
{html_content[:4000]}

Instructions:
1. Si <script type="application/ld+json"> existe → le REMPLACER
2. Sinon → ajouter avant </head>
3. Retourner la page HTML complète modifiée

Retourne uniquement le HTML modifié."""

        return await self._call(prompt, temperature=0.2, max_tokens=5000)

    async def run_full_pipeline(self, rl_outputs_dir: str, pages_to_rewrite: list, output_dir: str = "generated_pages"):
        """
        Pipeline complète post-RL :
        1. Lit les outputs du système RL
        2. Analyse les learnings
        3. Réécrit chaque page
        4. Sauvegarde prêt à déployer
        """
        output_path = Path(output_dir)
        output_path.mkdir(exist_ok=True)

        print("\n🚀 PIPELINE DE RÉÉCRITURE POST-RL (LLM LOCAL)")
        print("═" * 50)

        rl_dir = Path(rl_outputs_dir)
        best_jsonld_path = rl_dir / "jsonld" / "jsonld_best.json"
        scores_path      = rl_dir / "scores.json"
        report_path      = rl_dir / "reports" / "FINAL_SEMANTIC_REPORT.md"

        if not best_jsonld_path.exists():
            print("⚠️  Lancer d'abord : python pme_sovereign.py puis demander 'optimise le JSON-LD'")
            return

        with open(best_jsonld_path, encoding="utf-8") as f:
            best_jsonld = json.load(f)
        with open(scores_path) as f:
            scores_history = json.load(f)
        semantic_report = report_path.read_text(encoding="utf-8") if report_path.exists() else ""

        print(f"✅ JSON-LD chargé : {len(best_jsonld)} entités")

        print("\n🧠 Analyse des learnings RL...")
        analysis = await self.analyze_rl_learnings(best_jsonld, scores_history, semantic_report)
        brief    = analysis.get("brief", {})

        brief_path = output_path / "rl_brief.json"
        with open(brief_path, "w", encoding="utf-8") as f:
            json.dump(analysis, f, indent=2, ensure_ascii=False)
        print(f"📊 Brief : {brief_path}")

        for page in pages_to_rewrite:
            page_type = page.get("type", "product")
            page_name = page.get("name", "page")
            original  = page.get("content", "")
            info      = page.get("info", {})

            print(f"\n📝 Réécriture : {page_name} ({page_type})")

            matching_jsonld = next(
                (e for e in best_jsonld if e.get("@type", "").lower() == page_type.lower()),
                best_jsonld[0] if best_jsonld else {}
            )

            if page_type == "product":
                html = await self.generate_product_page(original, matching_jsonld, brief, info)
            elif page_type == "article":
                html = await self.generate_article_page(original, matching_jsonld, brief, info)
            else:
                html = await self.inject_jsonld_into_existing_page(original, best_jsonld)

            out_file = output_path / f"{page_name}.html"
            out_file.write_text(html, encoding="utf-8")
            print(f"  ✅ {out_file} ({len(html):,} chars)")

        print(f"\n🎉 Pages disponibles dans : {output_path}/")


# ─── Utilisation standalone ──────────────────────────────────────
if __name__ == "__main__":
    import asyncio

    pages = [
        {
            "type": "product",
            "name": "exemple-produit",
            "content": "<h1>Mon Produit</h1><p>Description courte.</p>",
            "info": {"name": "Exemple Produit", "price": 99, "currency": "EUR"},
        }
    ]

    async def main():
        gen = WebPageGenerator()
        if Path("semantic_outputs").exists():
            await gen.run_full_pipeline("semantic_outputs", pages)
        else:
            print("⚠️  Lancer d'abord le système principal pour générer semantic_outputs/")

    asyncio.run(main())
