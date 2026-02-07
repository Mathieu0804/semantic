# 🚀 GUIDE D'INSTALLATION COMPLET
## Avec IA Locale (Sans abonnement OpenAI)

---

## 📋 PRÉREQUIS

Vous avez assemblé votre PC avec :
- ✅ Processeur AMD Ryzen 5 5600X (ou mieux)
- ✅ 32GB RAM minimum
- ✅ **Carte graphique NVIDIA RTX 3060 12GB** (ESSENTIEL)
- ✅ SSD 1TB pour le système
- ✅ Connexion Internet fibre

---

## 🖥️ ÉTAPE 1 : INSTALLER LE SYSTÈME D'EXPLOITATION

### **Option A : Ubuntu Desktop 22.04 (Recommandé pour débutants)**

1. **Télécharger Ubuntu**
   - Allez sur : https://ubuntu.com/download/desktop
   - Téléchargez Ubuntu 22.04.3 LTS

2. **Créer une clé USB bootable**
   - Téléchargez Rufus : https://rufus.ie
   - Insérez une clé USB (8GB minimum)
   - Lancez Rufus
   - Sélectionnez votre clé USB
   - Sélectionnez le fichier ISO Ubuntu
   - Cliquez "Démarrer"

3. **Installer Ubuntu**
   - Redémarrez votre PC avec la clé USB
   - Appuyez sur F12 (ou DEL) au démarrage
   - Choisissez "Boot from USB"
   - Suivez l'assistant d'installation
   - Choisissez "Effacer le disque et installer Ubuntu"
   - Créez votre compte utilisateur

4. **Premier démarrage**
   ```bash
   # Mettre à jour le système
   sudo apt update
   sudo apt upgrade -y
   ```

---

## 🎮 ÉTAPE 2 : INSTALLER LES DRIVERS NVIDIA

**TRÈS IMPORTANT pour que la carte graphique fonctionne avec l'IA**

```bash
# Détecter votre carte graphique
ubuntu-drivers devices

# Installer le driver recommandé (généralement nvidia-driver-535)
sudo apt install nvidia-driver-535 -y

# Redémarrer
sudo reboot

# Vérifier que ça fonctionne (après redémarrage)
nvidia-smi
```

Vous devriez voir :
```
+-----------------------------------------------------------------------------+
| NVIDIA-SMI 535.129.03   Driver Version: 535.129.03   CUDA Version: 12.2   |
|-------------------------------+----------------------+----------------------+
| GPU  Name        Persistence-M| Bus-Id        Disp.A | Volatile Uncorr. ECC |
| Fan  Temp  Perf  Pwr:Usage/Cap|         Memory-Usage | GPU-Util  Compute M. |
|===============================+======================+======================|
|   0  NVIDIA GeForce ...  Off  | 00000000:01:00.0 On  |                  N/A |
| 30%   45C    P0    25W / 170W |    500MiB / 12288MiB |      0%      Default |
+-------------------------------+----------------------+----------------------+
```

---

## 🤖 ÉTAPE 3 : INSTALLER OLLAMA (Serveur IA Local)

**Ollama = L'équivalent gratuit d'OpenAI qui tourne sur votre PC**

```bash
# Installer Ollama
curl -fsSL https://ollama.com/install.sh | sh

# Vérifier l'installation
ollama --version
```

---

## 📥 ÉTAPE 4 : TÉLÉCHARGER LES MODÈLES IA

```bash
# Télécharger Llama 3.1 8B (recommandé pour RTX 3060)
# Taille : ~4.7GB, temps de téléchargement : 10-30 min
ollama pull llama3.1:8b

# OU pour RTX 4070 Ti / mieux :
ollama pull llama3.1:70b

# OU Mistral (alternative) :
ollama pull mistral:7b

# Lister les modèles installés
ollama list
```

Vous verrez :
```
NAME              ID              SIZE      MODIFIED
llama3.1:8b       a3b...          4.7 GB    2 minutes ago
```

---

## 🧪 ÉTAPE 5 : TESTER L'IA LOCALE

```bash
# Lancer Ollama en arrière-plan
ollama serve &

# Tester avec une requête simple
ollama run llama3.1:8b "Bonjour, qui es-tu ?"
```

Réponse attendue :
```
Je suis un assistant IA basé sur Llama 3.1, 
un modèle de langage développé par Meta. 
Je peux vous aider avec diverses tâches...
```

**✅ Si ça fonctionne, votre IA locale est opérationnelle !**

---

## 💻 ÉTAPE 6 : INSTALLER NODE.JS ET DÉPENDANCES

```bash
# Installer Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Vérifier
node --version  # Devrait afficher v20.x.x
npm --version   # Devrait afficher 10.x.x

# Installer Git
sudo apt install git -y

# Installer PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Démarrer PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

---

## 📦 ÉTAPE 7 : INSTALLER LA SEMANTIC PLATFORM

```bash
# Aller dans votre dossier home
cd ~

# Créer le dossier du projet
mkdir semantic-platform
cd semantic-platform

# Copier les fichiers que je vous ai fournis
# (Vous devrez les transférer depuis Windows vers Ubuntu)
# Via clé USB ou réseau partagé

# Installer les dépendances
npm install

# Installer la librairie Ollama pour Node.js
npm install ollama
```

---

## 🔧 ÉTAPE 8 : MODIFIER LE CODE POUR UTILISER OLLAMA

Créez un nouveau fichier : `backend/modules/ollama-client.js`

```javascript
/**
 * CLIENT OLLAMA - Remplace OpenAI
 */

const { Ollama } = require('ollama');

class OllamaClient {
  constructor() {
    this.ollama = new Ollama({ host: 'http://localhost:11434' });
    this.model = 'llama3.1:8b'; // ou mistral:7b
  }

  async chat(messages, options = {}) {
    try {
      const response = await this.ollama.chat({
        model: this.model,
        messages: messages,
        stream: false,
        options: {
          temperature: options.temperature || 0.7,
          num_predict: options.max_tokens || 2000
        }
      });

      return {
        choices: [{
          message: {
            content: response.message.content
          }
        }]
      };
    } catch (error) {
      console.error('Erreur Ollama:', error);
      throw error;
    }
  }

  async generate(prompt, options = {}) {
    const messages = [{ role: 'user', content: prompt }];
    return this.chat(messages, options);
  }
}

module.exports = OllamaClient;
```

Maintenant, modifiez les fichiers existants :

**Dans `backend/modules/data-importer.js`**, remplacez :
```javascript
// ANCIEN
const OpenAI = require('openai');
this.openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// NOUVEAU
const OllamaClient = require('./ollama-client');
this.ollama = new OllamaClient();
```

Et remplacez tous les appels :
```javascript
// ANCIEN
const completion = await this.openai.chat.completions.create({
  model: 'gpt-4o',
  messages: [{ role: 'user', content: prompt }],
  temperature: 0.3
});

// NOUVEAU
const completion = await this.ollama.chat([
  { role: 'user', content: prompt }
], { temperature: 0.3 });
```

**Faites la même chose dans :**
- `backend/modules/brand-dna-manager.js`
- `backend/modules/test-environment.js`

---

## 🔑 ÉTAPE 9 : CONFIGURATION

Créez le fichier `.env` :

```bash
cd ~/semantic-platform
nano .env
```

Contenu :
```env
# Serveur
PORT=3000
NODE_ENV=production

# Base de données PostgreSQL
DATABASE_URL=postgresql://postgres:votre_mot_de_passe@localhost:5432/semantic

# Ollama (IA locale)
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=llama3.1:8b

# URLs
BASE_URL=http://votre-ip-locale:3000
```

Sauvegardez : `Ctrl+X`, puis `Y`, puis `Entrée`

---

## 🚀 ÉTAPE 10 : DÉMARRER LA PLATEFORME

```bash
# S'assurer qu'Ollama tourne
ollama serve &

# Démarrer la plateforme
cd ~/semantic-platform
npm start
```

Vous devriez voir :
```
╔════════════════════════════════════════════════════════════╗
║  🧬 SEMANTIC PLATFORM - Backend Principal                 ║
║  ══════════════════════════════════════════════════════    ║
║  Port : 3000                                               ║
║  IA : Ollama (llama3.1:8b)                                ║
║  Status : ✅ Opérationnel                                  ║
╚════════════════════════════════════════════════════════════╝
```

---

## 🌐 ÉTAPE 11 : ACCÉDER AU DASHBOARD

### **Depuis le même PC :**
Ouvrez un navigateur : `http://localhost:3000/dashboard.html`

### **Depuis un autre PC sur votre réseau local :**

1. **Trouvez l'IP de votre serveur**
   ```bash
   hostname -I
   ```
   Exemple : `192.168.1.50`

2. **Ouvrez le firewall**
   ```bash
   sudo ufw allow 3000
   ```

3. **Sur l'autre PC, ouvrez :**
   `http://192.168.1.50:3000/dashboard.html`

---

## 📊 PERFORMANCE ATTENDUE

### **Avec RTX 3060 12GB + Llama 3.1 8B :**

| Opération | Temps |
|-----------|-------|
| Analyse fichier (100 produits) | ~30 secondes |
| Génération ADN de marque | ~5-10 secondes |
| Transformation produit | ~2 secondes/produit |
| Simulation visiteur | ~3-5 secondes |

**Total pour setup complet : ~5-10 minutes** (vs 30 secondes avec OpenAI)

### **Avec RTX 4070 Ti 12GB + Llama 3.1 70B :**

**3x plus rapide**, presque équivalent à GPT-4 !

---

## 🔧 OPTIMISATIONS POSSIBLES

### **1. Augmenter la vitesse**

Éditez `/etc/ollama/config.json` :
```json
{
  "num_gpu": 1,
  "gpu_layers": 40,
  "num_thread": 8
}
```

### **2. Mode "service" (démarrage automatique)**

```bash
# Créer un service systemd
sudo nano /etc/systemd/system/ollama.service
```

Contenu :
```ini
[Unit]
Description=Ollama AI Service
After=network.target

[Service]
Type=simple
User=votre_username
ExecStart=/usr/local/bin/ollama serve
Restart=always

[Install]
WantedBy=multi-user.target
```

Activer :
```bash
sudo systemctl daemon-reload
sudo systemctl enable ollama
sudo systemctl start ollama
```

### **3. Monitoring GPU**

```bash
# Installer nvtop (comme htop pour GPU)
sudo apt install nvtop -y

# Lancer
nvtop
```

Vous verrez l'utilisation en temps réel de votre GPU.

---

## 🆘 DÉPANNAGE

### **Problème : "nvidia-smi" ne fonctionne pas**

```bash
# Réinstaller le driver
sudo apt purge nvidia-* -y
sudo apt autoremove -y
sudo apt install nvidia-driver-535 -y
sudo reboot
```

### **Problème : Ollama lent**

```bash
# Vérifier que le GPU est utilisé
ollama show llama3.1:8b --verbose

# Devrait montrer "gpu_layers: 40" ou plus
```

### **Problème : Out of memory**

```bash
# Utiliser un modèle plus petit
ollama pull llama3.1:8b-q4_0  # Version quantifiée (4GB au lieu de 5GB)
```

### **Problème : Port 3000 déjà utilisé**

```bash
# Changer le port dans .env
PORT=8080
```

---

## ✅ CHECKLIST FINALE

- [ ] Ubuntu installé et à jour
- [ ] Driver NVIDIA installé (`nvidia-smi` fonctionne)
- [ ] Ollama installé (`ollama list` fonctionne)
- [ ] Modèle IA téléchargé (llama3.1:8b)
- [ ] Node.js 20 installé
- [ ] PostgreSQL installé et démarré
- [ ] Semantic Platform clonée et `npm install` fait
- [ ] Code modifié pour utiliser Ollama
- [ ] Fichier `.env` configuré
- [ ] Serveur démarre sans erreur
- [ ] Dashboard accessible

---

## 💰 COÛT TOTAL RÉEL

```
MATÉRIEL (one-time)
───────────────────────────────────
PC (config mini)        : 1,068€
Réseau                  :    95€
Onduleur                :   115€
───────────────────────────────────
TOTAL INITIAL           : 1,278€

RÉCURRENT (mensuel)
───────────────────────────────────
Fibre 300 Mbps          :    30€
Électricité PC 24/7     :    15€
───────────────────────────────────
TOTAL MENSUEL           :    45€/mois

LOGICIELS
───────────────────────────────────
Ubuntu                  :     0€
Ollama                  :     0€
Llama 3.1               :     0€
PostgreSQL              :     0€
Node.js                 :     0€
───────────────────────────────────
TOTAL LOGICIELS         :     0€
```

**📊 COMPARAISON :**

| Solution | Coût initial | Coût mensuel | Total an 1 |
|----------|--------------|--------------|------------|
| **IA Locale** | 1,278€ | 45€ | **1,818€** |
| OpenAI API | 0€ | 150-1,500€ | **1,800-18,000€** |

**✅ IA Locale = Rentable dès le mois 1 si vous avez >100 utilisateurs/jour**

---

## 🎓 FORMATION RECOMMANDÉE

### **Ressources gratuites pour apprendre :**

1. **Linux** : https://ubuntu.com/tutorials
2. **Ollama** : https://ollama.com/blog
3. **Node.js** : https://nodejs.dev/learn

### **Communautés d'aide :**

- Reddit : r/ollama, r/LocalLLaMA
- Discord : Ollama Official Server
- GitHub : https://github.com/ollama/ollama/discussions

---

**🎉 Félicitations ! Vous avez maintenant une plateforme IA 100% autonome et gratuite !**

*Prochaine étape : Ouvrez le dashboard et testez !*
