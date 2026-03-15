import { useState, useEffect } from "react"; 
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Mail, Lock, Eye, EyeOff, LogIn, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import LogoCalsed from "@/assets/logo.jpeg";

const LoginPage = () => {
  const navigate = useNavigate();
  // On récupère isAuthenticated et user pour surveiller le statut
  const { login, isAuthenticated, user } = useAuth(); 
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPendingValidation, setIsPendingValidation] = useState(false);

  // --- REDIRECTION AUTOMATIQUE ---
  useEffect(() => {
    if (isAuthenticated && user) {
        if (user.role === 'admin') {
            navigate("/admin", { replace: true });
        } else {
            navigate("/dashboard", { replace: true });
        }
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsPendingValidation(false); 
    
    if (!email || !password) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }

    setIsLoading(true);

    try {
      // La requête API réelle est gérée de manière centralisée dans AuthContext
      const result = await login(email, password, rememberMe);
      
      if (result.success) {
        toast.success(`Bienvenue, ${result.user.name.split(' ')[0]} !`);
        // La redirection est gérée par le useEffect
      } else {
        if (result.error && result.error.includes("attente de validation")) {
            setIsPendingValidation(true);
            toast.warning("Validation en cours...");
        } else {
            toast.error(result.error || "Erreur de connexion");
        }
        setIsLoading(false); 
      }
    } catch (error) {
      toast.error("Erreur de connexion inattendue");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] pt-16 md:pt-20 flex flex-col items-center justify-center py-8 md:py-12 px-4 bg-slate-50 relative overflow-hidden">
      
      {/* Décors d'arrière-plan */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[300px] md:w-[600px] md:h-[600px] bg-blue-600/5 rounded-full blur-[80px] md:blur-[100px] pointer-events-none" />

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
              <CardTitle className="text-2xl md:text-3xl font-display font-black text-[#0A2A5C] tracking-tight">Connexion</CardTitle>
              <CardDescription className="text-sm md:text-base mt-1 md:mt-2">Accédez à votre espace membre sécurisé</CardDescription>
            </CardHeader>
            
            <CardContent className="p-6 md:p-8 pt-4">
              {isPendingValidation && (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mb-6 p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-start gap-3"
                >
                    <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-bold text-amber-800">Compte en attente</p>
                        <p className="text-[11px] md:text-xs text-amber-700/80 leading-relaxed mt-1">
                            Le bureau national doit valider votre identité avant votre première connexion. Vous recevrez l'accès très prochainement.
                        </p>
                    </div>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5" autoComplete="off">
                {/* Honeypots for autocomplete interference */}
                <input type="email" style={{display: 'none'}} aria-hidden="true" />
                <input type="password" style={{display: 'none'}} aria-hidden="true" />

                <div className="space-y-1.5 md:space-y-2">
                  <Label htmlFor="email" className="text-xs md:text-sm font-bold text-slate-600">Adresse Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="votre@email.com"
                      className="pl-11 h-14 bg-slate-50 border-slate-200 focus-visible:ring-[#0A2A5C] rounded-xl text-base"
                      required
                      autoComplete="off"
                      data-lpignore="true"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 md:space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-xs md:text-sm font-bold text-slate-600">Mot de passe</Label>
                    <Link 
                      to="/forgot-password" 
                      className="text-[11px] md:text-xs text-[#0A2A5C] hover:underline font-medium"
                    >
                      Oublié ?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pl-11 pr-12 h-14 bg-slate-50 border-slate-200 focus-visible:ring-[#0A2A5C] rounded-xl text-base tracking-wide"
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

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="remember" 
                      checked={rememberMe}
                      onCheckedChange={setRememberMe}
                      className="border-slate-300 data-[state=checked]:bg-[#0A2A5C] data-[state=checked]:border-[#0A2A5C] rounded-md h-5 w-5"
                    />
                    <Label htmlFor="remember" className="text-xs md:text-sm cursor-pointer font-medium text-slate-600 select-none">
                      Se souvenir de moi
                    </Label>
                  </div>
                </div>

                <div className="pt-2 md:pt-4">
                  <Button 
                    type="submit" 
                    className="w-full h-14 bg-[#0A2A5C] hover:bg-[#08224a] text-white rounded-xl text-base font-bold shadow-lg shadow-blue-900/10 transition-transform active:scale-[0.98]" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <span className="animate-spin h-5 w-5 border-2 border-white/30 border-t-white rounded-full"></span>
                        <span>Connexion...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <LogIn className="h-5 w-5" />
                        <span>Se connecter</span>
                      </div>
                    )}
                  </Button>
                </div>
              </form>

              <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                <p className="text-sm md:text-base text-slate-500">
                  Pas encore de compte ?{" "}
                  <Link to="/inscription" className="text-[#0A2A5C] font-bold hover:underline transition-colors">
                    S'inscrire
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

export default LoginPage;