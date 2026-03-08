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
    <div className="min-h-screen pt-20 flex items-center justify-center py-12 px-4 bg-slate-50">
      <div className="w-full max-w-md">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex flex-col items-center gap-2 group">
              <div className="w-20 h-20 rounded-2xl bg-white flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform overflow-hidden border border-slate-100">
                <img 
                  src={LogoCalsed} 
                  alt="Logo CALSED" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentNode.innerHTML = '<span class="text-2xl font-bold text-[#0A2A5C]">C</span>';
                  }}
                />
              </div>
              <span className="text-2xl font-bold font-display text-[#0A2A5C] mt-2">CALSED</span>
            </Link>
          </div>

          <Card className="border-0 shadow-xl">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl font-display text-[#0A2A5C]">Créer un compte</CardTitle>
              <CardDescription>Rejoignez la communauté des anciens du LSED</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                
                <div>
                  <Label htmlFor="name">Nom complet *</Label>
                  <div className="relative mt-1">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Prénom et Nom"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email *</Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      placeholder="votre@email.com"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="phone">Numéro de téléphone *</Label>
                  <div className="relative mt-1">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="+221 77 --- -- --"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="generation">Promotion *</Label>
                  <div className="relative mt-1">
                    <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 z-10" />
                    <Select 
                      value={formData.generation} 
                      onValueChange={(value) => setFormData({...formData, generation: value})}
                    >
                      <SelectTrigger className="pl-10">
                        <SelectValue placeholder="Sélectionnez votre promotion" />
                      </SelectTrigger>
                      <SelectContent>
                        {generations.map((gen) => (
                          <SelectItem key={gen} value={gen}>{gen}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="password">Mot de passe *</Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      placeholder="Min. 6 caractères"
                      className="pl-10 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <Label htmlFor="confirmPassword">Confirmer le mot de passe *</Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                      placeholder="Répétez le mot de passe"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="flex items-start space-x-2">
                  <Checkbox 
                    id="terms" 
                    checked={acceptTerms}
                    onCheckedChange={setAcceptTerms}
                    className="mt-0.5"
                  />
                  <Label htmlFor="terms" className="text-sm cursor-pointer leading-tight text-slate-600 font-normal">
                    J'accepte les{" "}
                    <Link to="#" className="text-[#0A2A5C] hover:underline font-medium">conditions d'utilisation</Link>
                  </Label>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-[#FFD700] text-[#0A2A5C] hover:bg-[#FFD700]/90 font-bold h-11 shadow-md" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="animate-spin mr-2 h-4 w-4 border-2 border-[#0A2A5C] border-t-transparent rounded-full"></span>
                      Création du compte...
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-5 w-5" />
                      Créer mon compte
                    </>
                  )}
                </Button>
              </form>

              <Separator className="my-6" />

              <p className="text-center text-sm text-slate-500">
                Déjà inscrit ?{" "}
                <Link to="/connexion" className="text-[#0A2A5C] font-bold hover:underline">
                  Se connecter
                </Link>
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default RegisterPage;