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
    <div className="min-h-screen pt-20 flex items-center justify-center py-12 px-4 bg-slate-50">
      
      {/* CSS pour masquer l'œil natif du navigateur */}
      <style>{`
        input::-ms-reveal,
        input::-ms-clear {
          display: none;
        }
      `}</style>

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
              <CardTitle className="text-2xl font-display text-[#0A2A5C]">Connexion</CardTitle>
              <CardDescription>Accédez à votre espace membre sécurisé</CardDescription>
            </CardHeader>
            
            <CardContent className="pt-4">
              {isPendingValidation && (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3"
                >
                    <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-bold text-amber-800">Compte en attente</p>
                        <p className="text-xs text-amber-700 leading-relaxed mt-1">
                            Le bureau national doit valider votre identité avant votre première connexion. Vous recevrez l'accès très prochainement.
                        </p>
                    </div>
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">
                <input type="email" style={{display: 'none'}} />
                <input type="password" style={{display: 'none'}} />

                <div>
                  <Label htmlFor="email">Email</Label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="votre@email.com"
                      className="pl-10 focus:ring-[#0A2A5C]"
                      required
                      autoComplete="off"
                      data-lpignore="true"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="password">Mot de passe</Label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="pl-10 pr-10 focus:ring-[#0A2A5C]"
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
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none p-1 z-10 cursor-pointer"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="remember" 
                      checked={rememberMe}
                      onCheckedChange={setRememberMe}
                    />
                    <Label htmlFor="remember" className="text-sm cursor-pointer font-normal text-slate-600">
                      Se souvenir de moi
                    </Label>
                  </div>
                  
                  <Link 
                    to="/forgot-password" 
                    className="text-sm text-[#0A2A5C] hover:underline font-medium"
                  >
                    Mot de passe oublié ?
                  </Link>
                  
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-[#0A2A5C] hover:bg-[#0A2A5C]/90 text-white h-11" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                      Connexion...
                    </>
                  ) : (
                    <>
                      <LogIn className="mr-2 h-5 w-5" />
                      Se connecter
                    </>
                  )}
                </Button>
              </form>

              <Separator className="my-6" />

              <p className="text-center text-sm text-slate-500">
                Pas encore de compte ?{" "}
                <Link to="/inscription" className="text-[#0A2A5C] font-bold hover:underline">
                  S'inscrire
                </Link>
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;