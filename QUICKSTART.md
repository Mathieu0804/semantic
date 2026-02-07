# 🚀 GUIDE DE DÉMARRAGE RAPIDE

## De zéro à opérationnel en 30 minutes

---

## 📦 **CE QUE VOUS ALLEZ INSTALLER**

✅ Ollama (serveur IA local - gratuit)  
✅ Llama 3.1 8B (modèle IA - gratuit, ~4.7GB)  
✅ Node.js 20 (runtime JavaScript)  
✅ PostgreSQL 14 (base de données)  
✅ Semantic Platform (cette plateforme)  

**Espace disque requis :** ~10GB  
**Temps total :** 20-40 minutes (selon votre connexion Internet)

---

## 🖥️ **CHOIX DU SYSTÈME D'EXPLOITATION**

Choisissez votre système :

### **🐧 LINUX (Ubuntu/Debian)** → [Aller à la section Linux](#installation-linux)
### **🍎 MACOS** → [Aller à la section macOS](#installation-macos)
### **🪟 WINDOWS** → [Aller à la section Windows](#installation-windows)

---

## 🐧 **INSTALLATION LINUX**

### **Prérequis**
- Ubuntu 20.04+ ou Debian 11+
- 8GB+ RAM
- Carte graphique NVIDIA (optionnel mais recommandé)

### **Installation en 1 commande** ⚡

```bash
# 1. Télécharger le projet (si pas encore fait)
# Vous avez déjà les fichiers, donc passez cette étape

# 2. Aller dans le dossier
cd semantic-platform

# 3. Rendre le script exécutable
chmod +x install.sh

# 4. Lancer l'installation automatique
./install.sh
```

Le script va :
- ✅ Installer Ollama
- ✅ Télécharger Llama 3.1 8B (~4.7GB, 10-30 min)
- ✅ Installer Node.js 20
- ✅ Installer PostgreSQL
- ✅ Configurer tout automatiquement

### **Démarrage**

```bash
# Lancer le serveur
npm start
```

Ouvrez votre navigateur : **http://localhost:3000/dashboard.html**

### **Vérification du GPU (optionnel)**

```bash
# Vérifier que votre GPU NVIDIA est détecté
nvidia-smi

# Si vous voyez votre carte graphique, c'est bon ! 🎉
```

---

## 🍎 **INSTALLATION MACOS**

### **Prérequis**
- macOS 11+ (Big Sur ou plus récent)
- 8GB+ RAM
- Processeur Apple Silicon (M1/M2/M3) ou Intel

### **Installation en 1 commande** ⚡

```bash
# 1. Aller dans le dossier du projet
cd semantic-platform

# 2. Rendre le script exécutable
chmod +x install.sh

# 3. Lancer l'installation
./install.sh
```

**Note :** Le script va installer Homebrew si vous ne l'avez pas déjà.

### **Démarrage**

```bash
# Lancer le serveur
npm start
```

Ouvrez Safari/Chrome : **http://localhost:3000/dashboard.html**

### **Note sur Apple Silicon (M1/M2/M3)**

Ollama fonctionne nativement sur Apple Silicon et utilise le Neural Engine intégré. Pas besoin de GPU dédié ! 🚀

---

## 🪟 **INSTALLATION WINDOWS**

### **Prérequis**
- Windows 10/11 (64-bit)
- 8GB+ RAM
- Carte graphique NVIDIA (optionnel mais recommandé)

### **Installation automatique** ⚡

**Étape 1 : Ouvrir PowerShell en Administrateur**
- Cliquer droit sur le menu Démarrer
- Sélectionner "Windows PowerShell (Admin)" ou "Terminal (Admin)"

**Étape 2 : Autoriser l'exécution de scripts**
```powershell
Set-ExecutionPolicy Bypass -Scope Process -Force
```

**Étape 3 : Aller dans le dossier du projet**
```powershell
cd semantic-platform
```

**Étape 4 : Lancer l'installation**
```powershell
.\install-windows.ps1
```

Le script va tout installer automatiquement (~30 minutes).

### **Démarrage**

**Ouvrir un NOUVEAU terminal** (pour recharger les variables d'environnement)

```powershell
cd semantic-platform
npm start
```

Ouvrez Edge/Chrome : **http://localhost:3000/dashboard.html**

### **Vérification du GPU (optionnel)**

Ouvrez un terminal et tapez :
```powershell
nvidia-smi
```

Si vous voyez votre carte NVIDIA, l'IA utilisera le GPU ! 🎉

---

## ✅ **VÉRIFICATION DE L'INSTALLATION**

Une fois le serveur démarré, vous devriez voir :

```
╔════════════════════════════════════════════════════════════╗
║  🧬 SEMANTIC PLATFORM - Backend Principal                 ║
║  ══════════════════════════════════════════════════════    ║
║  Port : 3000                                               ║
║  IA : Ollama (llama3.1:8b)                                ║
║  Status : ✅ Opérationnel                                  ║
╚════════════════════════════════════════════════════════════╝
```

### **Test rapide**

**1. Tester l'IA en ligne de commande :**

```bash
# Linux/Mac
ollama run llama3.1:8b "Bonjour, présente-toi en une phrase"

# Windows (PowerShell)
& "$env:LOCALAPPDATA\Programs\Ollama\ollama.exe" run llama3.1:8b "Bonjour"
```

Vous devriez voir une réponse de l'IA ! 🤖

**2. Tester le serveur :**

Ouvrez http://localhost:3000/health dans votre navigateur.

Vous devriez voir :
```json
{
  "status": "ok",
  "services": {
    "dataImporter": true,
    "brandDNA": true,
    "testEnv": true
  }
}
```

**3. Ouvrir le dashboard :**

http://localhost:3000/dashboard.html

Vous devriez voir l'interface avec 4 étapes ! 🎨

---

## 🎯 **PREMIER TEST : Importer des données**

### **Créer un fichier CSV de test**

Créez un fichier `produits_test.csv` :

```csv
nom,description,prix,categorie
Sérum Lumière,Sérum anti-âge à l'acide hyaluronique,45.90,Soins visage
Crème de Nuit,Crème régénérante pour la nuit,52.00,Soins visage
Gel Nettoyant,Nettoyant doux pour tous types de peau,22.50,Nettoyage
```

### **L'importer via le dashboard**

1. Ouvrir http://localhost:3000/dashboard.html
2. Glisser le fichier CSV dans la zone
3. Attendre l'analyse (~10 secondes)
4. Cliquer "Transformer les données"
5. ✅ Vos produits sont importés !

---

## 🧬 **DEUXIÈME TEST : Créer votre ADN de marque**

Dans la section 2 du dashboard, écrivez :

```
Notre marque s'appelle BeautyTech.

Nous vendons des cosmétiques high-tech.

Notre ton : Innovant, scientifique, moderne.

Nos valeurs :
- Innovation technologique
- Efficacité prouvée
- Transparence totale

Ce qu'on évite de dire :
- "Miracle", "instantané", "garanti"

Ce qu'on préfère :
- "Scientifiquement prouvé", "testé cliniquement", "résultats mesurables"
```

Cliquez sur "🧬 Générer l'ADN automatiquement"

L'IA va structurer votre ADN automatiquement ! 🎉

---

## 🧪 **TROISIÈME TEST : Simuler un visiteur**

Cliquez sur "🔬 Simuler un visiteur Scientifique"

Vous verrez une page générée avec :
- Des chiffres et statistiques
- Un ton scientifique
- Des arguments basés sur des preuves

Essayez aussi "❤️ Émotionnel" et "⚡ Pratique" pour comparer !

---

## 🚀 **QUATRIÈME TEST : Déployer**

Cliquez sur "🚀 Déployer en production"

Vos modifications sont maintenant actives ! 🎊

---

## 🆘 **DÉPANNAGE**

### **Problème : "command not found: ollama"**

**Solution :**
```bash
# Linux/Mac : Réinstaller Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Windows : Télécharger depuis https://ollama.com/download
```

### **Problème : "Cannot connect to Ollama"**

**Solution :** Démarrer Ollama manuellement
```bash
# Linux/Mac
ollama serve &

# Windows
& "$env:LOCALAPPDATA\Programs\Ollama\ollama.exe" serve
```

### **Problème : "Port 3000 already in use"**

**Solution :** Changer le port dans `.env`
```bash
PORT=8080
```

Puis relancer : `npm start`

### **Problème : "Out of memory" lors du téléchargement du modèle**

**Solution :** Utiliser le modèle 3B (plus petit)
```bash
ollama pull llama3.1:3b
```

Puis modifier `.env` :
```
OLLAMA_MODEL=llama3.1:3b
```

### **Problème : "GPU not detected"**

**Solution :** L'IA fonctionnera quand même sur CPU, juste plus lentement.

Pour activer le GPU sur Linux :
```bash
# Installer les drivers NVIDIA
sudo ubuntu-drivers autoinstall
sudo reboot
```

### **Problème : Le dashboard ne se charge pas**

**Solution :**
1. Vérifier que le serveur est démarré (`npm start`)
2. Ouvrir http://localhost:3000/health
3. Si erreur, regarder les logs dans le terminal

---

## 📊 **COMMANDES UTILES**

```bash
# Démarrer le serveur
npm start

# Démarrer en mode développement (redémarre automatiquement)
npm run dev

# Voir les logs
tail -f data/logs/$(date +%Y-%m-%d).log

# Lister les modèles IA installés
ollama list

# Tester l'IA directement
ollama run llama3.1:8b "Test"

# Arrêter Ollama
pkill ollama  # Linux/Mac
taskkill /IM ollama.exe /F  # Windows

# Sauvegarder vos données
tar -czf backup-$(date +%Y%m%d).tar.gz data/

# Restaurer depuis une sauvegarde
tar -xzf backup-20250203.tar.gz
```

---

## 📚 **PROCHAINES ÉTAPES**

Une fois que tout fonctionne :

1. ✅ **Lire la documentation complète**
   - `docs/GUIDE_UTILISATION.md` - Comment utiliser au quotidien
   - `docs/ARCHITECTURE_ET_FINETUNING.md` - Comprendre l'auto-apprentissage
   - `docs/GUIDE_INTEGRATION.md` - Matériel et coûts détaillés

2. ✅ **Importer vos vrais produits**
   - Exporter depuis Shopify/WooCommerce/etc.
   - Utiliser le dashboard pour importer

3. ✅ **Créer votre vrai ADN de marque**
   - Voir `docs/EXEMPLES_PROMPTS.md` pour des exemples

4. ✅ **Laisser tourner 2 semaines**
   - L'IA collectera les données
   - Premier fine-tuning automatique après 100 conversions

5. ✅ **Monitorer les performances**
   - Dashboard analytics (à venir)
   - Vérifier les logs quotidiens

---

## 🎓 **RESSOURCES SUPPLÉMENTAIRES**

### **Documentation officielle**
- Ollama : https://ollama.com/docs
- Llama 3.1 : https://ai.meta.com/llama
- Node.js : https://nodejs.org/docs
- PostgreSQL : https://postgresql.org/docs

### **Communautés**
- Discord Ollama : https://discord.gg/ollama
- Reddit r/LocalLLaMA : https://reddit.com/r/LocalLLaMA
- GitHub Discussions : (lien de votre repo)

### **Vidéos tutoriels**
- Installation Ollama : https://youtube.com/watch?v=...
- Utilisation Llama 3 : https://youtube.com/watch?v=...

---

## 💬 **BESOIN D'AIDE ?**

- 📧 Email : support@semanticplatform.com
- 💬 Discord : (lien de votre serveur)
- 🐛 Issues : (lien GitHub)
- 📞 Téléphone : +33 1 XX XX XX XX

---

## ✅ **CHECKLIST DE DÉMARRAGE**

- [ ] Script d'installation exécuté sans erreur
- [ ] Ollama installé et fonctionnel
- [ ] Llama 3.1 8B téléchargé
- [ ] Node.js installé (v18+)
- [ ] PostgreSQL installé et démarré
- [ ] Serveur démarre avec `npm start`
- [ ] Dashboard accessible à http://localhost:3000/dashboard.html
- [ ] Test import CSV réussi
- [ ] Test génération ADN réussi
- [ ] Test simulation visiteur réussi

**Si toutes les cases sont cochées : BRAVO ! 🎉**

Vous êtes prêt à utiliser la Semantic Platform ! 🚀

---

*Dernière mise à jour : Février 2025*  
*Version : 1.0.0*
