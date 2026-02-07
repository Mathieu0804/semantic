# SEMANTIC PLATFORM - Installation Windows
# =========================================
# 
# Ce script installe tout ce dont vous avez besoin sur Windows
# 
# Usage : 
# 1. Ouvrir PowerShell en tant qu'Administrateur
# 2. Exécuter : .\install-windows.ps1

Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  🧬 SEMANTIC PLATFORM - Installation Windows                ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# Vérifier les droits admin
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "❌ Ce script doit être exécuté en tant qu'Administrateur" -ForegroundColor Red
    Write-Host "   Faites clic-droit > Exécuter en tant qu'administrateur" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Droits administrateur confirmés" -ForegroundColor Green
Write-Host ""

# ============================================================================
# ÉTAPE 1 : Chocolatey (gestionnaire de packages Windows)
# ============================================================================

Write-Host "══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  ÉTAPE 1/6 : Installation de Chocolatey" -ForegroundColor Cyan
Write-Host "══════════════════════════════════════════════════════════════" -ForegroundColor Cyan

if (Get-Command choco -ErrorAction SilentlyContinue) {
    Write-Host "✅ Chocolatey déjà installé" -ForegroundColor Green
} else {
    Write-Host "📥 Installation de Chocolatey..." -ForegroundColor Yellow
    Set-ExecutionPolicy Bypass -Scope Process -Force
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
    Invoke-Expression ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
    Write-Host "✅ Chocolatey installé" -ForegroundColor Green
}

# ============================================================================
# ÉTAPE 2 : Node.js
# ============================================================================

Write-Host ""
Write-Host "══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  ÉTAPE 2/6 : Installation de Node.js 20" -ForegroundColor Cyan
Write-Host "══════════════════════════════════════════════════════════════" -ForegroundColor Cyan

if (Get-Command node -ErrorAction SilentlyContinue) {
    $nodeVersion = (node --version).Replace('v', '').Split('.')[0]
    if ([int]$nodeVersion -ge 18) {
        Write-Host "✅ Node.js $nodeVersion déjà installé" -ForegroundColor Green
    } else {
        Write-Host "📥 Installation de Node.js 20..." -ForegroundColor Yellow
        choco install nodejs-lts -y
        Write-Host "✅ Node.js installé" -ForegroundColor Green
    }
} else {
    Write-Host "📥 Installation de Node.js 20..." -ForegroundColor Yellow
    choco install nodejs-lts -y
    Write-Host "✅ Node.js installé" -ForegroundColor Green
}

# Rafraîchir les variables d'environnement
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# ============================================================================
# ÉTAPE 3 : PostgreSQL
# ============================================================================

Write-Host ""
Write-Host "══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  ÉTAPE 3/6 : Installation de PostgreSQL" -ForegroundColor Cyan
Write-Host "══════════════════════════════════════════════════════════════" -ForegroundColor Cyan

if (Get-Command psql -ErrorAction SilentlyContinue) {
    Write-Host "✅ PostgreSQL déjà installé" -ForegroundColor Green
} else {
    Write-Host "📥 Installation de PostgreSQL..." -ForegroundColor Yellow
    choco install postgresql14 -y --params '/Password:postgres123'
    Write-Host "✅ PostgreSQL installé" -ForegroundColor Green
}

# ============================================================================
# ÉTAPE 4 : Ollama
# ============================================================================

Write-Host ""
Write-Host "══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  ÉTAPE 4/6 : Installation de Ollama (IA locale)" -ForegroundColor Cyan
Write-Host "══════════════════════════════════════════════════════════════" -ForegroundColor Cyan

$ollamaPath = "$env:LOCALAPPDATA\Programs\Ollama\ollama.exe"
if (Test-Path $ollamaPath) {
    Write-Host "✅ Ollama déjà installé" -ForegroundColor Green
} else {
    Write-Host "📥 Téléchargement de Ollama..." -ForegroundColor Yellow
    $ollamaInstaller = "$env:TEMP\OllamaSetup.exe"
    Invoke-WebRequest -Uri "https://ollama.com/download/OllamaSetup.exe" -OutFile $ollamaInstaller
    Write-Host "📦 Installation de Ollama..." -ForegroundColor Yellow
    Start-Process -FilePath $ollamaInstaller -ArgumentList "/S" -Wait
    Remove-Item $ollamaInstaller
    Write-Host "✅ Ollama installé" -ForegroundColor Green
}

# Démarrer Ollama
Write-Host "🚀 Démarrage de Ollama..." -ForegroundColor Yellow
Start-Process -FilePath $ollamaPath -ArgumentList "serve" -WindowStyle Hidden
Start-Sleep -Seconds 3

# ============================================================================
# ÉTAPE 5 : Téléchargement du modèle IA
# ============================================================================

Write-Host ""
Write-Host "══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  ÉTAPE 5/6 : Téléchargement Llama 3.1 8B (~4.7GB)" -ForegroundColor Cyan
Write-Host "══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "⚠️  Cela peut prendre 10-30 minutes selon votre connexion" -ForegroundColor Yellow
Write-Host ""

$ollamaModels = & $ollamaPath list 2>$null
if ($ollamaModels -match "llama3.1:8b") {
    Write-Host "✅ Llama 3.1 8B déjà téléchargé" -ForegroundColor Green
} else {
    Write-Host "📥 Téléchargement en cours..." -ForegroundColor Yellow
    & $ollamaPath pull llama3.1:8b
    Write-Host "✅ Modèle téléchargé" -ForegroundColor Green
}

# ============================================================================
# ÉTAPE 6 : Configuration du projet
# ============================================================================

Write-Host ""
Write-Host "══════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  ÉTAPE 6/6 : Configuration du projet" -ForegroundColor Cyan
Write-Host "══════════════════════════════════════════════════════════════" -ForegroundColor Cyan

Write-Host "📦 Installation des dépendances npm..." -ForegroundColor Yellow
npm install

Write-Host "📝 Création du fichier .env..." -ForegroundColor Yellow
if (-not (Test-Path .env)) {
    @"
# Serveur
PORT=3000
NODE_ENV=development

# Base de données
DATABASE_URL=postgresql://postgres:postgres123@localhost:5432/semantic

# Ollama (IA locale)
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=llama3.1:8b

# URLs
BASE_URL=http://localhost:3000
"@ | Out-File -FilePath .env -Encoding UTF8
    Write-Host "✅ Fichier .env créé" -ForegroundColor Green
} else {
    Write-Host "✅ Fichier .env déjà existant" -ForegroundColor Green
}

# Créer les dossiers
$folders = @("data/logs", "data/imports", "data/brand-dna", "data/fine-tuning", "data/learning", "uploads")
foreach ($folder in $folders) {
    New-Item -ItemType Directory -Force -Path $folder | Out-Null
}
Write-Host "✅ Dossiers créés" -ForegroundColor Green

# Configurer PostgreSQL
Write-Host "🗄️  Configuration de PostgreSQL..." -ForegroundColor Yellow
$pgPass = "postgres123"
$env:PGPASSWORD = $pgPass

# Attendre que PostgreSQL démarre
Start-Sleep -Seconds 5

# Créer la base de données
& psql -U postgres -c "CREATE DATABASE semantic;" 2>$null
Write-Host "✅ Base de données créée" -ForegroundColor Green

# ============================================================================
# FIN
# ============================================================================

Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║  ✅ INSTALLATION TERMINÉE !                                  ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "🎉 Tout est prêt !" -ForegroundColor Green
Write-Host ""
Write-Host "Pour démarrer la plateforme :" -ForegroundColor Cyan
Write-Host ""
Write-Host "  1. Ouvrir un nouveau terminal (pour recharger les variables)" -ForegroundColor Yellow
Write-Host "  2. Lancer : npm start" -ForegroundColor Yellow
Write-Host "  3. Ouvrir : http://localhost:3000/dashboard.html" -ForegroundColor Yellow
Write-Host ""
Write-Host "📚 Documentation dans le dossier /docs/" -ForegroundColor Cyan
Write-Host ""
