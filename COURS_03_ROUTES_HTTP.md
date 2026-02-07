# 📖 COURS 3 : LES ROUTES HTTP

## Comprendre GET, POST, et le routing complet

---

## 🎯 OBJECTIFS

À la fin de ce cours, vous saurez :
- ✅ La différence entre GET, POST, PUT, DELETE
- ✅ Comment créer des routes
- ✅ Lire les paramètres d'URL
- ✅ Traiter les données envoyées

---

## 🌐 PARTIE 1 : LES VERBES HTTP (MÉTHODES)

### **Analogie avec un restaurant :**

```
GET    = Consulter le menu (lire)
POST   = Passer commande (créer)
PUT    = Modifier votre commande (mettre à jour)
DELETE = Annuler votre commande (supprimer)
```

### **Tableau comparatif :**

| Verbe | Action | Exemple concret | Idempotent? |
|-------|--------|-----------------|-------------|
| **GET** | Lire | Afficher une page | ✅ Oui |
| **POST** | Créer | Envoyer un formulaire | ❌ Non |
| **PUT** | Modifier | Mettre à jour un profil | ✅ Oui |
| **DELETE** | Supprimer | Supprimer un compte | ✅ Oui |

**Idempotent** :
- **Explication** : Faire l'action plusieurs fois = même résultat qu'une fois
- **GET** : Lire 10 fois la même page = même résultat
- **POST** : Créer 10 fois = 10 créations différentes (pas idempotent)

---

## 📖 PARTIE 2 : GET - RÉCUPÉRER DES DONNÉES

### **Structure de base :**

```javascript
app.get('/chemin', function(requete, reponse) {
  // Code à exécuter
});
```

### **Exemple simple :**

```javascript
app.get('/hello', function(req, res) {
  res.send('Bonjour !');
});

// Résultat :
// Navigateur → http://localhost:3000/hello
// Affiche : Bonjour !
```

### **Paramètres expliqués :**

```javascript
function(req, res) {
  // req = request (requête)
  //   Ce que le client envoie
  
  // res = response (réponse)
  //   Ce que vous renvoyez au client
}
```

**req (request) contient :**
```javascript
req.params   // Paramètres d'URL (/user/:id)
req.query    // Query string (?search=...)
req.body     // Corps de la requête (POST)
req.headers  // En-têtes HTTP
req.cookies  // Cookies du client
```

**res (response) permet de :**
```javascript
res.send('texte')           // Envoyer du texte
res.json({ data: '...' })   // Envoyer du JSON
res.sendFile('/path')       // Envoyer un fichier
res.status(404)             // Définir le code statut
res.redirect('/autre-page') // Rediriger
```

---

## 🔢 PARTIE 3 : PARAMÈTRES D'URL

### **Paramètres dynamiques (:param) :**

```javascript
app.get('/user/:id', function(req, res) {
  const userId = req.params.id;
  res.send('Utilisateur ID : ' + userId);
});

// Exemples :
// /user/42    → "Utilisateur ID : 42"
// /user/123   → "Utilisateur ID : 123"
// /user/alice → "Utilisateur ID : alice"
```

**Syntaxe :**
```
/user/:id
      ↑
      Commence par : pour dire "c'est un paramètre"
```

### **Plusieurs paramètres :**

```javascript
app.get('/blog/:year/:month/:day', function(req, res) {
  const year = req.params.year;
  const month = req.params.month;
  const day = req.params.day;
  
  res.send(`Article du ${day}/${month}/${year}`);
});

// Exemple :
// /blog/2025/02/14 → "Article du 14/02/2025"
```

### **Query string (?key=value) :**

```javascript
app.get('/search', function(req, res) {
  const query = req.query.q;
  const page = req.query.page || 1;  // Défaut = 1
  
  res.send(`Recherche : ${query}, Page : ${page}`);
});

// Exemples :
// /search?q=javascript
//   → "Recherche : javascript, Page : 1"
//
// /search?q=nodejs&page=3
//   → "Recherche : nodejs, Page : 3"
```

**Différence params vs query :**

```
URL : /user/42?premium=true

req.params.id    = "42"      (partie de l'URL)
req.query.premium = "true"   (après le ?)
```

---

## 📝 PARTIE 4 : POST - ENVOYER DES DONNÉES

### **Structure de base :**

```javascript
app.post('/chemin', function(req, res) {
  // Lire les données envoyées
  const data = req.body;
  
  // Traiter...
  
  // Répondre
  res.json({ success: true });
});
```

### **Exemple complet : Créer un utilisateur**

```javascript
app.post('/api/users', function(req, res) {
  // 1. Récupérer les données envoyées
  const name = req.body.name;
  const email = req.body.email;
  
  // 2. Valider
  if (!name || !email) {
    return res.status(400).json({
      error: 'Nom et email requis'
    });
  }
  
  // 3. Sauvegarder en base (simplifié)
  const user = {
    id: Date.now(),  // ID temporaire
    name: name,
    email: email
  };
  
  // 4. Répondre
  res.status(201).json({
    success: true,
    user: user
  });
});
```

**Appel depuis le client (JavaScript) :**

```javascript
// Dans le navigateur
fetch('http://localhost:3000/api/users', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Alice',
    email: 'alice@example.com'
  })
})
.then(response => response.json())
.then(data => {
  console.log(data);
  // { success: true, user: {...} }
});
```

### **Codes de statut HTTP :**

```
200 OK                 → Tout va bien
201 Created            → Ressource créée avec succès
400 Bad Request        → Erreur dans la requête
401 Unauthorized       → Non authentifié
403 Forbidden          → Non autorisé
404 Not Found          → Ressource introuvable
500 Internal Server Error → Erreur serveur
```

**Utilisation :**
```javascript
res.status(201).json({ ... })  // Création réussie
res.status(400).json({ error: '...' })  // Erreur client
res.status(500).json({ error: '...' })  // Erreur serveur
```

---

## 📤 PARTIE 5 : UPLOAD DE FICHIERS

### **Avec Multer :**

```javascript
// Configuration Multer
const upload = multer({ dest: 'uploads/' });

// Route avec upload
app.post('/api/upload', upload.single('file'), function(req, res) {
  //                      ↑                      ↑
  //                      │                      Votre code
  //                      └─ Middleware Multer
  
  // Multer a déjà sauvegardé le fichier
  const file = req.file;
  
  console.log('Fichier reçu :');
  console.log('- Nom original :', file.originalname);
  console.log('- Taille :', file.size, 'octets');
  console.log('- Type MIME :', file.mimetype);
  console.log('- Sauvegardé dans :', file.path);
  
  res.json({
    success: true,
    filename: file.originalname,
    size: file.size
  });
});
```

**upload.single('file') expliqué :**
```javascript
upload.single('file')
//     └──┬──┘ └─┬─┘
//        │      └─ Nom du champ dans le formulaire
//        └─ Un seul fichier
```

**Alternatives :**
```javascript
upload.single('photo')     // Un seul fichier nommé "photo"
upload.array('photos', 5)  // Jusqu'à 5 fichiers nommés "photos"
upload.fields([            // Plusieurs champs différents
  { name: 'avatar', maxCount: 1 },
  { name: 'photos', maxCount: 8 }
])
```

---

## 🔄 PARTIE 6 : ASYNC/AWAIT

### **Problème des opérations asynchrones :**

```javascript
// ❌ Ne fonctionne PAS comme attendu
app.get('/users', function(req, res) {
  let users;
  
  database.query('SELECT * FROM users', function(err, results) {
    users = results;  // S'exécute PLUS TARD
  });
  
  res.json(users);  // users est undefined ici !
});
```

**Pourquoi ?**
- La requête base de données prend du temps
- JavaScript ne attend pas
- Il continue et exécute `res.json(users)` avant que `users` soit rempli

### **Solution 1 : Callbacks (ancien)**

```javascript
app.get('/users', function(req, res) {
  database.query('SELECT * FROM users', function(err, results) {
    if (err) {
      return res.status(500).json({ error: err });
    }
    res.json(results);  // ✅ Maintenant c'est bon
  });
});
```

**Problème des callbacks :** "Callback Hell"
```javascript
operation1(function() {
  operation2(function() {
    operation3(function() {
      operation4(function() {
        // 😱 Illisible !
      });
    });
  });
});
```

### **Solution 2 : Promises (mieux)**

```javascript
database.query('SELECT * FROM users')
  .then(function(results) {
    return res.json(results);
  })
  .catch(function(err) {
    return res.status(500).json({ error: err });
  });
```

### **Solution 3 : Async/Await (moderne - LE MEILLEUR)**

```javascript
app.get('/users', async function(req, res) {
  //                ↑
  //                Mot-clé async
  
  try {
    const users = await database.query('SELECT * FROM users');
    //            ↑
    //            Mot-clé await = "attends que ça finisse"
    
    res.json(users);
    
  } catch (err) {
    res.status(500).json({ error: err });
  }
});
```

**async/await expliqué :**

```javascript
async function maFonction() {
// ↑ async = Cette fonction peut utiliser await
  
  const resultat = await operationLongue();
  //               ↑ await = Attends que ça finisse
  //                         avant de continuer
  
  console.log(resultat);  // S'exécute APRÈS
}
```

**Analogie :**
```
Sans await (asynchrone) :
  Vous : "Apporte-moi un café"
  Serveur : "D'accord !"
  Vous : [continuez à parler sans attendre]
  Serveur : [revient 2 minutes après]

Avec await :
  Vous : "Apporte-moi un café" [await]
  [VOUS ATTENDEZ]
  Serveur : [revient avec le café]
  Vous : [buvez le café puis continuez]
```

---

## 🎯 PARTIE 7 : NOTRE ROUTE D'IMPORT COMPLÈTE

Analysons une vraie route de notre projet :

```javascript
app.post('/api/import/analyze', upload.single('file'), async (req, res) => {
  //    ↑ Verbe HTTP    ↑ Chemin      ↑ Middleware   ↑ async
  
  try {
    // 1. Vérifier qu'un fichier est fourni
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'Aucun fichier fourni'
      });
    }

    console.log(`📊 Analyse du fichier : ${req.file.originalname}`);

    // 2. L'IA analyse le fichier
    const analysis = await dataImporter.analyzeFile({
      //               ↑ await car analyzeFile prend du temps
      path: req.file.path,
      filename: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size
    });

    // 3. Renvoyer les résultats
    res.json({
      success: true,
      analysis: {
        format: analysis.detectedFormat,
        confidence: analysis.confidence,
        structure: analysis.schema,
        sampleData: analysis.preview,
        estimatedProducts: analysis.rowCount,
        recommendations: analysis.suggestions
      }
    });

  } catch (error) {
    // 4. En cas d'erreur
    console.error('Erreur analyse fichier:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});
```

**Flux complet :**

```
1. Client envoie fichier
   ↓
2. Multer intercepte et sauvegarde → req.file
   ↓
3. Notre code s'exécute
   ↓
4. On vérifie que req.file existe
   ↓
5. On appelle dataImporter.analyzeFile() [await]
   ↓
6. L'IA analyse (peut prendre 10-30 secondes)
   ↓
7. On reçoit le résultat
   ↓
8. On renvoie au client en JSON
   ↓
9. Client reçoit la réponse
```

---

## 🎓 EXERCICE PRATIQUE

Créez une route qui :
1. Accepte un nom et un email en POST
2. Vérifie que les deux champs sont fournis
3. Sauvegarde dans un tableau (en mémoire)
4. Renvoie l'utilisateur créé

**Solution :**

```javascript
// Tableau pour stocker (en mémoire)
const users = [];

app.post('/api/users', function(req, res) {
  // 1. Récupérer les données
  const { name, email } = req.body;
  
  // 2. Valider
  if (!name || !email) {
    return res.status(400).json({
      error: 'Nom et email requis'
    });
  }
  
  // 3. Créer l'utilisateur
  const user = {
    id: users.length + 1,
    name: name,
    email: email,
    createdAt: new Date()
  };
  
  // 4. Sauvegarder
  users.push(user);
  
  // 5. Répondre
  res.status(201).json({
    success: true,
    user: user
  });
});

// Route pour lister tous les utilisateurs
app.get('/api/users', function(req, res) {
  res.json({
    success: true,
    users: users
  });
});
```

**Tester avec curl :**

```bash
# Créer un utilisateur
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Alice","email":"alice@example.com"}'

# Lister les utilisateurs
curl http://localhost:3000/api/users
```

---

## ✅ POINTS CLÉS À RETENIR

1. **GET** = Lire (paramètres dans l'URL)
2. **POST** = Créer (données dans req.body)
3. **Paramètres URL** : `/user/:id` → `req.params.id`
4. **Query string** : `/search?q=test` → `req.query.q`
5. **async/await** = Attendre les opérations longues
6. **try/catch** = Gérer les erreurs
7. **Codes statut** : 200 OK, 400 Bad Request, 500 Error

---

## 📚 PROCHAINE ÉTAPE

**Cours 4 : L'Intelligence Artificielle - Ollama & Llama expliqués**

Nous verrons :
- Comment fonctionne Ollama
- Appeler l'IA depuis Node.js
- Prompts et génération de texte
- Fine-tuning expliqué simplement

