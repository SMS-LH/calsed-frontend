# 🎓 CALSED - Interface Client (Frontend)

Bienvenue sur le code source de l'interface utilisateur du projet **CALSED** (Collectif des Anciens du Lycée Scientifique d'Excellence de Diourbel).

> ⚠️ **Avertissement :** Ce code est partagé uniquement pour que l'on puisse m'aider à le lire et le corriger. Ce n'est pas un projet open-source collaboratif. Merci de ne pas modifier le code sans m'en parler.

## 🚀 Ce que fait ce dossier (Frontend)
C'est la partie visuelle du site (le design, les boutons, les pages).
* S'inscrire et se connecter à son espace membre.
* Consulter l'annuaire des anciens élèves.
* Accéder au tableau de bord pour publier des offres d'emploi ou de stage.
* Naviguer sur la boutique officielle et commander des articles.
* Lire les actualités et l'agenda.

## 🛠️ Technologies utilisées
* **React.js** (Vite/CRA)
* **Tailwind CSS** (pour le design)
* **Axios** (pour parler au backend)
* **Context API** (AuthContext, CartContext, ContentContext)

## ⚙️ Comment lancer ce code sur ton ordinateur pour m'aider ?
1. Installe les dépendances avec la commande : `npm install`
2. Crée un fichier `.env` à la racine et mets ce lien :
   `REACT_APP_API_URL=http://localhost:5000/api` (ou le lien de l'API en ligne)
3. Lance le projet avec : `npm start` (ou `npm run dev`)
