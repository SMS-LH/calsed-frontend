import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Mail, ArrowLeft, Loader2 } from "lucide-react";
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
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <Card className="w-full max-w-md shadow-lg border-0">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-[#0A2A5C]">Récupération</CardTitle>
          <CardDescription>Mot de passe oublié ?</CardDescription>
        </CardHeader>
        <CardContent>
          {!sent ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <p className="text-sm text-slate-500 text-center mb-4">
                Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
              </p>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input 
                  type="email" 
                  placeholder="exemple@email.com" 
                  className="pl-9" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full bg-[#0A2A5C] hover:bg-[#0A2A5C]/90" disabled={loading}>
                {loading ? <Loader2 className="animate-spin h-4 w-4" /> : "Envoyer le lien"}
              </Button>
            </form>
          ) : (
            <div className="text-center space-y-4">
              <div className="bg-green-100 text-green-700 p-4 rounded-lg text-sm">
                Si un compte existe avec l'adresse <strong>{email}</strong>, un email vient d'être envoyé.
              </div>
              <Button variant="outline" onClick={() => setSent(false)}>Renvoyer</Button>
            </div>
          )}
          
          <div className="mt-6 text-center">
            <Link to="/connexion" className="text-sm text-slate-500 hover:text-[#0A2A5C] flex items-center justify-center gap-2">
              <ArrowLeft className="h-4 w-4" /> Retour à la connexion
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPasswordPage;