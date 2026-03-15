import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Mail, 
  Lock, 
  User,
  Eye,
  EyeOff,
  UserPlus,
  GraduationCap,
  Phone 
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

// IMPORT DU LOGO JPEG
import LogoCalsed from "@/assets/logo.jpeg";

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "", 
    password: "",
    confirmPassword: "",
    generation: ""
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const generations = Array.from({ length: 10 }, (_, i) => `G${i + 1}`);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.phone || !formData.password || !formData.generation) {
      toast.error("Veuillez remplir tous les champs obligatoires");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères");
      return;
    }

    if (!acceptTerms) {
      toast.error("Veuillez accepter les conditions d'utilisation");
      return;
    }

    setIsLoading(true);

    try {
      // Appel au backend
      const result = await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        generation: formData.generation
      });
      
      if (result.success) {
        // --- MODIFICATION ICI : Message personnalisé et redirection ---
        toast.success(result.message || "Inscription réussie !", {
          description: "Votre demande est en cours de validation par le bureau national. Vous recevrez un email sous peu.",
          duration: 8000,
        });
        
        // On redirige vers la page de connexion car le compte n'est pas encore actif
        window.scrollTo(0,0);
        navigate("/connexion"); 
      } else {
        toast.error(result.error || "Une erreur est survenue");
      }
    } catch (error) {
      toast.error("Erreur technique lors de l'inscription");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] pt-16 md:pt-20 flex flex-col items-center justify-center py-8 md:py-12 px-4 bg-slate-50 relative overflow-hidden">
      
      {/* Décors d'arrière-plan */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[300px] md:w-[600px] md:h-[600px] bg-amber-400/10 rounded-full blur-[80px] md:blur-[100px] pointer-events-none" />

      {/* CSS pour masquer l'œil natif du navigateur */}
      <style>{`
        input::-ms-reveal,
        input::-ms-clear {
          display: none;
        }
      `}</style>

      <div className="w-full max-w-md relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: "easeOut" }}>
          
          <div className="text-center mb-6 md:mb-8">
            <Link to="/" className="inline-flex flex-col items-center gap-2 group">
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform overflow-hidden border border-slate-100">
                <img 
                  src={LogoCalsed} 
                  alt="Logo CALSED" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentNode.innerHTML = '<span class="text-xl md:text-2xl font-bold text-[#0A2A5C]">C</span>';
                  }}
                />
              </div>
              <span className="text-xl md:text-2xl font-bold font-display text-[#0A2A5C] mt-2">CALSED</span>
            </Link>
          </div>

          <Card className="border-slate-100 shadow-xl shadow-blue-900/5 rounded-3xl md:rounded-[2.5rem] overflow-hidden bg-white">
            <CardHeader className="text-center pb-2 pt-6 md:pt-8 px-6 md:px-8">
              <CardTitle className="text-2xl md:text-3xl font-display font-black text-[#0A2A5C] tracking-tight">Créer un compte</CardTitle>
              <CardDescription className="text-sm md:text-base mt-1 md:mt-2">Rejoignez la communauté des anciens du LSED</CardDescription>
            </CardHeader>
            
            <CardContent className="p-6 md:p-8 pt-4">
              <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5" autoComplete="off">
                {/* Honeypots */}
                <input type="email" style={{display: 'none'}} aria-hidden="true" />
                <input type="password" style={{display: 'none'}} aria-hidden="true" />

                <div className="space-y-1.5 md:space-y-2">
                  <Label htmlFor="name" className="text-xs md:text-sm font-bold text-slate-600">Nom complet <span className="text-red-500">*</span></Label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Prénom et Nom"
                      className="pl-12 h-14 bg-slate-50 border-slate-200 focus-visible:ring-[#0A2A5C] rounded-xl text-base"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5 md:space-y-2">
                  <Label htmlFor="email" className="text-xs md:text-sm font-bold text-slate-600">Email <span className="text-red-500">*</span></Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="votre@email.com"
                      className="pl-12 h-14 bg-slate-50 border-slate-200 focus-visible:ring-[#0A2A5C] rounded-xl text-base"
                      required
                      data-lpignore="true"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 md:space-y-2">
                  <Label htmlFor="phone" className="text-xs md:text-sm font-bold text-slate-600">Numéro de téléphone <span className="text-red-500">*</span></Label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="+221 77 --- -- --"
                      className="pl-12 h-14 bg-slate-50 border-slate-200 focus-visible:ring-[#0A2A5C] rounded-xl text-base"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5 md:space-y-2">
                  <Label htmlFor="generation" className="text-xs md:text-sm font-bold text-slate-600">Promotion <span className="text-red-500">*</span></Label>
                  <div className="relative">
                    <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 z-10 pointer-events-none" />
                    <Select 
                      value={formData.generation} 
                      onValueChange={(value) => setFormData({...formData, generation: value})}
                    >
                      <SelectTrigger className="pl-12 h-14 bg-slate-50 border-slate-200 focus:ring-[#0A2A5C] rounded-xl text-base">
                        <SelectValue placeholder="Sélectionnez votre promotion" />
                      </SelectTrigger>
                      <SelectContent>
                        {generations.map((gen) => (
                          <SelectItem key={gen} value={gen} className="text-base">{gen}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1.5 md:space-y-2">
                  <Label htmlFor="password" className="text-xs md:text-sm font-bold text-slate-600">Mot de passe <span className="text-red-500">*</span></Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      placeholder="Min. 6 caractères"
                      className="pl-12 pr-12 h-14 bg-slate-50 border-slate-200 focus-visible:ring-[#0A2A5C] rounded-xl text-base tracking-wide"
                      required
                      autoComplete="new-password"
                      data-lpignore="true"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setShowPassword(!showPassword);
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none p-2 z-10 cursor-pointer rounded-lg hover:bg-slate-100 transition-colors"
                      tabIndex={-1}
                      aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 md:space-y-2">
                  <Label htmlFor="confirmPassword" className="text-xs md:text-sm font-bold text-slate-600">Confirmer le mot de passe <span className="text-red-500">*</span></Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                      placeholder="Répétez le mot de passe"
                      className="pl-12 h-14 bg-slate-50 border-slate-200 focus-visible:ring-[#0A2A5C] rounded-xl text-base tracking-wide"
                      required
                      data-lpignore="true"
                    />
                  </div>
                </div>

                <div className="flex items-start space-x-3 pt-2 pb-2">
                  <Checkbox 
                    id="terms" 
                    checked={acceptTerms}
                    onCheckedChange={setAcceptTerms}
                    className="mt-1 border-slate-300 data-[state=checked]:bg-[#0A2A5C] data-[state=checked]:border-[#0A2A5C] rounded-md h-5 w-5 shrink-0"
                  />
                  <Label htmlFor="terms" className="text-xs md:text-sm cursor-pointer leading-snug text-slate-600 font-normal">
                    J'accepte les{" "}
                    <Link to="#" className="text-[#0A2A5C] hover:underline font-bold">conditions d'utilisation</Link>
                  </Label>
                </div>

                <div className="pt-2">
                  <Button 
                    type="submit" 
                    className="w-full h-14 bg-[#FFD700] hover:bg-[#e6c200] text-[#0A2A5C] rounded-xl text-base font-bold shadow-lg shadow-amber-400/20 transition-transform active:scale-[0.98]" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <span className="animate-spin h-5 w-5 border-2 border-[#0A2A5C]/30 border-t-[#0A2A5C] rounded-full"></span>
                        <span>Création en cours...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <UserPlus className="h-5 w-5" />
                        <span>Soumettre la demande</span>
                      </div>
                    )}
                  </Button>
                </div>
              </form>

              <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                <p className="text-sm md:text-base text-slate-500">
                  Déjà inscrit ?{" "}
                  <Link to="/connexion" className="text-[#0A2A5C] font-bold hover:underline transition-colors">
                    Se connecter
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default RegisterPage;