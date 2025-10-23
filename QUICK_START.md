# 🥋 Kungfu - Quick Start Guide

## ✅ Extension Status: READY TO USE!

Votre extension Chrome "Kungfu" est complètement développée et construite avec succès !

## 🚀 Installation Rapide (5 minutes)

### Étape 1 : Charger l'extension dans Chrome
```
1. Ouvrir Chrome → chrome://extensions/
2. Activer le "Mode développeur" (en haut à droite)
3. Cliquer "Charger l'extension non empaquetée"
4. Sélectionner le dossier "dist" de ce projet
5. ✅ L'extension est maintenant installée !
```

### Étape 2 : Utiliser l'extension
```
- Cliquer sur l'icône Kungfu dans la barre d'outils Chrome
- Ou utiliser le raccourci : Ctrl+Shift+K (Cmd+Shift+K sur Mac)
- La sidebar s'ouvre sur le côté droit de la page
```

### Étape 3 (Optionnel) : Activer Chrome AI pour les résumés
```
1. chrome://flags/#optimization-guide-on-device-model → Enabled
2. chrome://flags/#prompt-api-for-gemini-nano → Enabled
3. Redémarrer Chrome
4. Ouvrir DevTools (F12) et exécuter :
   await window.ai.languageModel.create()
5. Attendre le téléchargement du modèle (5-10 min)
```

## 🎯 Fonctionnalités Disponibles

### 📝 Notes
- Créer et sauvegarder des notes avec support Markdown
- Association automatique avec l'URL de la page
- Recherche dans vos notes
- Stockage local (IndexedDB)

### 📸 Screenshots
- **Capture pleine page** : Screenshot de toute la zone visible
- **Sélection de zone** : Cliquer-glisser pour capturer une région spécifique
- Téléchargement et gestion des captures
- Stockage local avec métadonnées

### 🎤 Transcription
- Transcription audio en temps réel (Web Speech API)
- Affichage du texte en direct
- Sauvegarde des transcriptions
- Support multilingue (configurable)

### ✨ Résumé IA
- Génération automatique de résumés de page
- Utilise Chrome AI (Gemini Nano) - 100% local
- Extraction intelligente du contenu
- Historique des résumés

## 📁 Structure du Projet

```
kungfu/
├── dist/                    ← CHARGER CE DOSSIER DANS CHROME
│   ├── manifest.json
│   ├── background/
│   ├── content/
│   ├── sidepanel/
│   └── assets/
├── src/                     ← Code source TypeScript
├── public/
├── README.md               ← Documentation complète
├── INSTALLATION.md         ← Guide d'installation détaillé
└── package.json
```

## 🔧 Commandes de Développement

```bash
# Installer les dépendances
npm install

# Mode développement (watch)
npm run dev

# Build production
npm run build

# Vérification TypeScript
npm run type-check
```

## 🐛 Résolution de Problèmes

### L'extension ne se charge pas
- Vérifier que vous avez sélectionné le dossier **dist**, pas la racine
- Reconstruire : `npm run build`
- Vérifier les erreurs dans la console Chrome

### Les screenshots ne fonctionnent pas
- Vérifier les permissions de l'extension (onglet actif)
- Actualiser la page cible
- Certains sites (chrome://) ne peuvent pas être capturés

### La transcription ne démarre pas
- Autoriser l'accès au microphone dans Chrome
- Vérifier que votre navigateur supporte Web Speech API
- Essayer dans une fenêtre de navigation privée

### Le résumé ne se génère pas
- Activer Chrome AI (voir Étape 3 ci-dessus)
- Vérifier que le modèle Gemini Nano est téléchargé
- Tester sur une page avec du contenu textuel substantiel

## 🎨 Personnalisation des Icônes (Optionnel)

L'extension utilise actuellement des icônes placeholder. Pour créer de vraies icônes :

1. Aller sur https://favicon.io/
2. Créer un favicon avec le texte "🥋" et fond bleu (#3B82F6)
3. Télécharger et renommer les fichiers :
   - icon16.png, icon32.png, icon48.png, icon128.png
4. Les placer dans `public/icons/`
5. Rebuild : `npm run build`
6. Recharger l'extension dans Chrome

## 📊 Stack Technique

- **Framework** : Vanilla TypeScript (léger et performant)
- **Build** : Vite 6
- **Styling** : Tailwind CSS (thème shadcn/ui)
- **Storage** : IndexedDB (Dexie.js) + Chrome Storage API
- **IA** : Chrome AI (Gemini Nano) - on-device
- **Transcription** : Web Speech API (natif navigateur)

## 🔒 Confidentialité

- ✅ **Toutes les données restent locales** (IndexedDB)
- ✅ **Aucun serveur externe**
- ✅ **Aucun tracking ou analytics**
- ✅ **IA on-device** (Chrome AI tourne sur votre machine)
- ✅ **Pas de services tiers**

## 📝 Export/Import des Données

Ouvrir DevTools (F12) dans la sidebar et exécuter :

```javascript
// Exporter
const data = await storage.exportData();
console.log(data); // Copier ce JSON

// Importer
await storage.importData('votre JSON ici');

// Tout effacer
await storage.clearAll();
```

## 🎉 C'est Tout !

L'extension est prête à l'emploi. Profitez de votre assistant web IA !

Pour plus de détails, consultez :
- **README.md** : Documentation complète
- **INSTALLATION.md** : Guide d'installation détaillé
- **public/icons/README.md** : Guide de création d'icônes

---

**Astuce** : Épingler l'extension dans la barre d'outils Chrome pour un accès rapide !
