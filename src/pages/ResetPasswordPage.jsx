import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Lock, Loader2, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

// IMPORT DU PONT API SÉCURISÉ
import api from "@/api/axios";

const ResetPasswordPage = () => {
  const { token } = useParams(); // On récupère le token depuis l'URL
  const navigate = useNavigate();
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      return toast.error("Les mots de passe ne correspondent pas");
    }

    if (password.length < 6) {
      return toast.error("Le mot de passe doit contenir au moins 6 caractères");
    }

    setLoading(true);

    try {
      // APPEL AXIOS AU LIEU DE FETCH
      await api.post(`/auth/reset-password/${token}`, { password });
      
      toast.success("Mot de passe modifié avec succès ! Connectez-vous.");
      navigate("/connexion");
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Lien invalide ou expiré";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-20 relative overflow-hidden">
      
      {/* Décors de fond */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[300px] md:w-[600px] md:h-[600px] bg-blue-600/5 rounded-full blur-[80px] md:blur-[100px] pointer-events-none" />

      {/* CSS pour masquer l'œil natif du navigateur sur Edge/IE */}
      <style>{`
        input::-ms-reveal,
        input::-ms-clear {
          display: none;
        }
      `}</style>

      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="shadow-2xl shadow-blue-900/5 border-slate-100 rounded-3xl overflow-hidden bg-white">
          
          <CardHeader className="text-center pt-8 md:pt-10 pb-4 md:pb-6 px-6 md:px-8">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6 shadow-inner">
              <ShieldCheck className="h-8 w-8 md:h-10 md:w-10" />
            </div>
            <CardTitle className="text-2xl md:text-3xl font-black font-display text-[#0A2A5C] tracking-tight">
              Nouveau départ
            </CardTitle>
            <CardDescription className="text-sm md:text-base mt-2">
              Choisissez votre nouveau mot de passe sécurisé.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="p-6 md:p-8 pt-0 md:pt-2">
            <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
              
              <div className="space-y-4">
                <div className="space-y-1.5 md:space-y-2">
                  <Label htmlFor="password" className="text-xs md:text-sm font-bold text-slate-600">Nouveau mot de passe</Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input 
                      id="password"
                      type={showPassword ? "text" : "password"} 
                      placeholder="Min. 6 caractères" 
                      className="pl-12 pr-12 h-14 bg-slate-50 border-slate-200 focus-visible:ring-[#0A2A5C] rounded-xl text-base tracking-wide"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-2 z-10 rounded-lg hover:bg-slate-100 transition-colors focus:outline-none"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5 md:space-y-2">
                  <Label htmlFor="confirmPassword" className="text-xs md:text-sm font-bold text-slate-600">Confirmer le mot de passe</Label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input 
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"} 
                      placeholder="Répétez le mot de passe" 
                      className="pl-12 pr-12 h-14 bg-slate-50 border-slate-200 focus-visible:ring-[#0A2A5C] rounded-xl text-base tracking-wide"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div className="pt-2">
                <Button 
                  type="submit" 
                  className="w-full h-14 md:h-16 rounded-xl bg-[#0A2A5C] hover:bg-[#08224a] text-white font-bold text-base shadow-lg shadow-blue-900/10 transition-transform active:scale-[0.98]" 
                  disabled={loading}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="animate-spin h-5 w-5" /> Traitement...
                    </div>
                  ) : (
                    "Valider le nouveau mot de passe"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ResetPasswordPage;