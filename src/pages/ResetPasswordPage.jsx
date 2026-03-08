import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Lock, Loader2 } from "lucide-react";
import { toast } from "sonner";

// IMPORT DU PONT API SÉCURISÉ
import api from "@/api/axios";

const ResetPasswordPage = () => {
  const { token } = useParams(); // On récupère le token depuis l'URL
  const navigate = useNavigate();
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      return toast.error("Les mots de passe ne correspondent pas");
    }

    setLoading(true);

    try {
      // APPEL AXIOS AU LIEU DE FETCH
      await api.post(`/auth/reset-password/${token}`, { password });
      
      toast.success("Mot de passe modifié ! Connectez-vous.");
      navigate("/connexion");
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Lien invalide ou expiré";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <Card className="w-full max-w-md shadow-lg border-0">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-[#0A2A5C]">Réinitialisation</CardTitle>
          <CardDescription>Choisissez votre nouveau mot de passe</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input 
                    type="password" 
                    placeholder="Nouveau mot de passe" 
                    className="pl-9"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    />
                </div>
                <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input 
                    type="password" 
                    placeholder="Confirmer le mot de passe" 
                    className="pl-9"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    />
                </div>
            </div>
            
            <Button type="submit" className="w-full bg-[#0A2A5C] hover:bg-[#0A2A5C]/90" disabled={loading}>
              {loading ? <Loader2 className="animate-spin h-4 w-4" /> : "Changer le mot de passe"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPasswordPage;