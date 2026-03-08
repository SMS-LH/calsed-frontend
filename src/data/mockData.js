// src/data/mockData.js

// Gardez les stats à 0 pour le moment (le bureau les mettra à jour)
export const heroStats = [
  { value: "0", label: "Générations", suffix: "" },
  { value: "0", label: "Membres actifs", suffix: "+" },
  { value: "0", label: "Projets réalisés", suffix: "+" },
  { value: "0", label: "Pays représentés", suffix: "" }
];

// Vider les contenus dynamiques pour la production
export const blogPosts = [];
export const products = [];
export const jobOffers = [];
export const internshipOffers = [];
export const collaborativeProjects = [];
export const testimonials = [];
export const teamMembers = [];

// Garder les structures de base nécessaires au fonctionnement de l'UI
export const subscriptionPlans = [
  {
    id: "mensuel",
    name: "Cotisation Mensuelle",
    price: 5000,
    period: "mois",
    features: ["Accès Dashboard", "Offres d'emploi", "Newsletter"],
    popular: false
  },
  {
    id: "annuel",
    name: "Cotisation Annuelle",
    price: 50000,
    period: "an",
    features: ["Tous les avantages", "Badge Membre Or", "Événements VIP"],
    popular: true
  }
];

export const faqData = [
  {
    question: "Comment devenir membre du CALSED ?",
    answer: "Créez un compte et réglez votre première cotisation via Wave ou Orange Money."
  }
];