import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Mail, ArrowLeft, Loader2, KeyRound, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

// IMPORT DU PONT API SÉCURISÉ
import api from "@/api/axios";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // APPEL AXIOS AU LIEU DE FETCH
      await api.post("/auth/forgot-password", { email });
      
      setSent(true);
      toast.success("Email envoyé ! Vérifiez votre boîte de réception.");
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Erreur lors de l'envoi";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-20 relative overflow-hidden">
      
      {/* Décors de fond */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="shadow-2xl shadow-blue-900/5 border-slate-100 rounded-3xl overflow-hidden bg-white">
          
          <CardHeader className="text-center pt-8 md:pt-10 pb-4">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6 shadow-inner">
              <KeyRound className="h-8 w-8 md:h-10 md:w-10" />
            </div>
            <CardTitle className="text-2xl md:text-3xl font-black font-display text-[#0A2A5C] tracking-tight">
              Récupération
            </CardTitle>
            <CardDescription className="text-sm md:text-base mt-2">
              Mot de passe oublié ? Pas de panique.
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 md:p-10 pt-2">
            {!sent ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <p className="text-sm md:text-base text-slate-500 text-center leading-relaxed">
                  Entrez votre adresse email et nous vous enverrons un lien pour créer un nouveau mot de passe.
                </p>
                <div className="space-y-4">
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input 
                      type="email" 
                      placeholder="exemple@email.com" 
                      className="pl-12 h-14 md:h-16 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-[#0A2A5C] text-base" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
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
                      "Recevoir le lien sécurisé"
                    )}
                  </Button>
                </div>
              </form>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-6"
              >
                <div className="bg-green-50 border border-green-100 p-6 rounded-2xl">
                  <CheckCircle2 className="h-8 w-8 text-green-500 mx-auto mb-3" />
                  <p className="text-sm md:text-base text-green-800 leading-relaxed">
                    Si un compte existe avec l'adresse <br/>
                    <strong className="text-green-900 break-all">{email}</strong><br/> 
                    un email vient de vous être envoyé.
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => setSent(false)}
                  className="w-full h-12 md:h-14 rounded-xl border-slate-200 text-slate-600 font-medium"
                >
                  Je n'ai rien reçu, renvoyer
                </Button>
              </motion.div>
            )}
            
            <div className="mt-8 text-center pt-6 border-t border-slate-100">
              <Link 
                to="/connexion" 
                className="text-sm font-medium text-slate-500 hover:text-[#0A2A5C] inline-flex items-center justify-center gap-2 group transition-colors"
              >
                <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" /> 
                Retour à la page de connexion
              </Link>
            </div>
          </CardContent>
          
        </Card>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;