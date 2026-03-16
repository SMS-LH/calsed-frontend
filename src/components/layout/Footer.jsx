import { useState } from "react"; 
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Facebook, 
  Twitter, 
  Linkedin, 
  Instagram, 
  Mail, 
  Phone, 
  MapPin,
  Send,
  Heart,
  Loader2 
} from "lucide-react";
import { useAuth } from "@/context/AuthContext"; 
import { toast } from "sonner"; 
import logoCalsed from "../../assets/logo.jpeg";

// IMPORT DU PONT API SÉCURISÉ
import api from "@/api/axios";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { isAuthenticated } = useAuth(); 
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    try {
      // APPEL AXIOS (L'URL de base est gérée automatiquement par l'instance api)
      await api.post('/newsletter/subscribe', { email });

      toast.success("Merci ! Vous êtes inscrit à la newsletter.");
      setEmail("");
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Erreur lors de l'inscription.";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const quickLinks = [
    { name: "Accueil", href: "/" },
    { name: "À Propos", href: "/equipe" },
    { name: "Blog", href: "/blog" },
    { name: "Boutique", href: "/boutique" },
    // { name: "Faire un Don", href: "/don" }, // <-- LIEN MASQUÉ TEMPORAIREMENT
    { name: "Contact", href: "/contact" },
  ];

  // Liens visibles uniquement par les membres connectés
  const memberOnlyLinks = [
    { name: "Offres d'emploi", href: "/dashboard" },
    { name: "Stages", href: "/dashboard" },
    { name: "Projets", href: "/dashboard" },
    { name: "Annuaire", href: "/annuaire" },
  ];

  const socialLinks = [
    { name: "Facebook", icon: Facebook, href: "https://www.facebook.com/share/1HiSExEqDm/", color: "hover:text-blue-500" },
    { name: "Twitter", icon: Twitter, href: "https://x.com/LSED_Alumni", color: "hover:text-sky-500" },
    { name: "LinkedIn", icon: Linkedin, href: "https://www.linkedin.com/company/lyc%C3%A9e-scientifique-d-excellence-de-diourbel/", color: "hover:text-blue-600" },
    { name: "Instagram", icon: Instagram, href: "https://www.instagram.com/c.a.lsed?igsh=MWZhbXBycTBqZnRqYQ==", color: "hover:text-pink-500" },
  ];

  return (
    <footer className="bg-primary text-primary-foreground">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          
          {/* Brand Column */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center gap-3 mb-4 group">
              <div className="bg-white p-1 rounded-xl shadow-sm overflow-hidden">
                <img 
                  src={logoCalsed} 
                  alt="Logo CALSED" 
                  className="w-12 h-12 object-contain" 
                />
              </div>
              
              <div>
                <h3 className="text-xl font-bold font-display group-hover:text-secondary transition-colors">CALSED</h3>
                <p className="text-xs text-primary-foreground/70">
                  Collectif des Anciens
                </p>
              </div>
            </Link>
            <p className="text-sm text-primary-foreground/80 mb-6 leading-relaxed">
              Le Collectif des Anciens du Lycée Scientifique d'Excellence de Diourbel 
              réunit les générations G1 à G7 autour de valeurs d'excellence, 
              de solidarité et d'entraide.
            </p>
            {/* Social Links */}
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className={`w-10 h-10 rounded-lg bg-primary-foreground/10 flex items-center justify-center transition-all hover:bg-primary-foreground/20 ${social.color}`}
                  aria-label={social.name}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold font-display mb-4">Navigation</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-sm text-primary-foreground/70 hover:text-secondary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Member Links (Conditionnels) */}
          <div>
            <h4 className="text-lg font-semibold font-display mb-4">Espace Membre</h4>
            <ul className="space-y-2">
              {/* Liens visibles pour tout le monde ou invités */}
              {!isAuthenticated && (
                <>
                  <li>
                    <Link to="/connexion" className="text-sm text-primary-foreground/70 hover:text-secondary transition-colors">
                      Connexion
                    </Link>
                  </li>
                  <li>
                    <Link to="/inscription" className="text-sm text-primary-foreground/70 hover:text-secondary transition-colors">
                      Inscription
                    </Link>
                  </li>
                </>
              )}

              {/* Liens protégés : visibles uniquement si connecté */}
              {isAuthenticated ? (
                memberOnlyLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.href}
                      className="text-sm text-primary-foreground/70 hover:text-secondary transition-colors font-medium"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))
              ) : (
                <li className="pt-2">
                  <p className="text-[11px] text-primary-foreground/40 italic leading-tight">
                    Connectez-vous pour accéder aux offres d'emploi, stages et à l'annuaire.
                  </p>
                </li>
              )}
            </ul>
          </div>

          {/* Newsletter & Contact */}
          <div>
            <h4 className="text-lg font-semibold font-display mb-4">Newsletter</h4>
            <p className="text-sm text-primary-foreground/70 mb-4">
              Restez informé de nos actualités et événements.
            </p>
            
            {/* FORMULAIRE NEWSLETTER CONNECTÉ */}
            <form className="flex gap-2 mb-6" onSubmit={handleSubscribe}>
              <Input
                type="email"
                placeholder="Votre email"
                className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Button 
                type="submit" 
                size="icon"
                disabled={loading}
                className="bg-secondary text-secondary-foreground hover:bg-secondary-light shrink-0"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </form>
            
            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 mt-0.5 text-secondary shrink-0" />
                <span className="text-sm text-primary-foreground/70">
                  Diourbel, Sénégal
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-secondary shrink-0" />
                <a 
                  href="mailto:reseaucalsed@gmail.com" 
                  className="text-sm text-primary-foreground/70 hover:text-secondary transition-colors"
                >
                  reseaucalsed@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-secondary shrink-0" />
                <a 
                  href="tel:+221771234567" 
                  className="text-sm text-primary-foreground/70 hover:text-secondary transition-colors"
                >
                  +221 77 123 45 67
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-primary-foreground/10">
        <div className="container mx-auto px-4 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-primary-foreground/60 text-center sm:text-left">
              © {currentYear} CALSED. Tous droits réservés.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;