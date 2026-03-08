import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Users, CheckCircle, AlertCircle, Search, 
  Trash2, Send, MinusCircle, Plus, UserCheck, 
  ArrowLeft, Download, Mail, Filter, Phone, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import api from "../api/axios";

const AdminMembersPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [allUsers, setAllUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // NOUVEAU : États pour les filtres avancés
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/users');
      setAllUsers(data);
    } catch (e) {
      toast.error("Erreur lors du chargement des membres");
    } finally {
      setIsLoading(false);
    }
  };

  // --- ACTIONS EXISTANTES AMÉLIORÉES ---
  const handleValidateUser = async (id, name) => {
    try {
      await api.put(`/users/${id}/validate`);
      toast.success(`${name} a été validé et ajouté au réseau !`); 
      fetchUsers();
    } catch (e) { toast.error("Erreur lors de la validation"); }
  };

  const handleDeleteUser = async (id, name) => {
    if(!window.confirm(`Es-tu sûr de vouloir supprimer définitivement ${name} du réseau ?`)) return;
    try {
      await api.delete(`/users/${id}`);
      toast.success(`${name} a été supprimé.`); 
      fetchUsers();
    } catch (e) { toast.error("Erreur lors de la suppression"); }
  };

  const handleModifySubscription = async (userId, userName, months) => {
    const toastId = toast.loading("Mise à jour de la cotisation...");
    try {
      await api.put('/users/subscribe', { userId, monthsPaid: months });
      toast.success(`Cotisation de ${userName} mise à jour.`, { id: toastId });
      fetchUsers(); 
    } catch (error) {
      toast.error("Erreur serveur", { id: toastId });
    }
  };

  const handleSendReminder = async (userId, userName, userEmail) => {
    const toastId = toast.loading(`Envoi du rappel à ${userName}...`);
    try {
      await api.post(`/users/${userId}/remind`);
      toast.success("Relance envoyée avec succès !", { id: toastId });
    } catch (error) {
      toast.error("Erreur lors de l'envoi", { id: toastId });
    }
  };

  // --- NOUVELLE FONCTIONNALITÉ : EXPORT CSV ---
  const handleExportCSV = () => {
    const headers = ["Nom", "Email", "Téléphone", "Promotion", "Statut Cotisation", "Date de fin"];
    const csvContent = [
      headers.join(";"),
      ...filteredUsers.map(u => {
        const isOk = u.paidUntil && new Date(u.paidUntil) > new Date();
        const status = !u.isValidated ? "En attente" : (isOk ? "À jour" : "Expirée");
        const dateFin = u.paidUntil ? new Date(u.paidUntil).toLocaleDateString('fr-FR') : "N/A";
        return `"${u.name}";"${u.email}";"${u.phone || ''}";"${u.generation || ''}";"${status}";"${dateFin}"`;
      })
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `CALSED_Membres_${new Date().toLocaleDateString('fr-FR')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Fichier Excel/CSV généré !");
  };

  // --- NOUVELLE FONCTIONNALITÉ : COPIE RAPIDE ---
  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    toast.success(`${type} copié !`);
  };

  // --- LOGIQUE DE FILTRAGE AVANCÉE ---
  const filteredUsers = allUsers.filter(u => {
    const searchMatch = 
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.phone?.includes(searchTerm);

    const isOk = u.paidUntil && new Date(u.paidUntil) > new Date();
    
    let statusMatch = true;
    if (statusFilter === "pending") statusMatch = !u.isValidated;
    if (statusFilter === "active") statusMatch = u.isValidated && isOk;
    if (statusFilter === "expired") statusMatch = u.isValidated && !isOk;

    return searchMatch && statusMatch;
  });

  const pendingUsers = allUsers.filter(u => !u.isValidated);

  if (isLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin h-10 w-10 text-[#0A2A5C]"/></div>;

  return (
    <div className="min-h-screen pt-24 pb-12 bg-slate-50/50">
      <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
        
        {/* EN-TÊTE ET NAVIGATION */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <Button variant="ghost" onClick={() => navigate("/admin")} className="mb-2 -ml-4 text-slate-500 hover:text-[#0A2A5C]">
              <ArrowLeft className="h-4 w-4 mr-2" /> Retour au Dashboard
            </Button>
            <h1 className="text-3xl font-bold font-display text-[#0A2A5C] flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-600" /> Gestion des Membres
            </h1>
          </div>
          <Button onClick={handleExportCSV} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            <Download className="h-4 w-4 mr-2" /> Exporter la liste (CSV)
          </Button>
        </div>

        {/* ALERTES (Membres en attente) */}
        {pendingUsers.length > 0 && (
          <Card className="border-l-4 border-l-amber-500 shadow-sm bg-amber-50/50 mb-8">
            <CardHeader className="pb-2">
              <CardTitle className="text-amber-700 flex items-center gap-2 text-lg">
                <UserCheck className="h-5 w-5"/> {pendingUsers.length} Inscription(s) en attente
              </CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {pendingUsers.map(u => (
                <div key={u._id} className="bg-white p-4 rounded-xl border shadow-sm flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10"><AvatarFallback className="bg-amber-100 text-amber-700 font-bold">{u.name[0]}</AvatarFallback></Avatar>
                    <div>
                      <p className="font-bold text-sm text-[#0A2A5C]">{u.name}</p>
                      <p className="text-xs text-slate-500">Promo {u.generation} • {u.phone}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" className="bg-green-600 hover:bg-green-700 h-8 w-8 rounded-full" onClick={() => handleValidateUser(u._id, u.name)}>
                      <CheckCircle className="h-4 w-4"/>
                    </Button>
                    <Button size="icon" variant="ghost" className="text-red-400 hover:bg-red-50 hover:text-red-600 h-8 w-8 rounded-full" onClick={() => handleDeleteUser(u._id, u.name)}>
                      <Trash2 className="h-4 w-4"/>
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* BARRE DE RECHERCHE ET FILTRES */}
        <Card className="border-0 shadow-sm bg-white mb-6">
          <CardContent className="p-4 flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400"/>
              <Input 
                placeholder="Chercher par nom, email ou téléphone..." 
                className="pl-10 bg-slate-50" 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <Filter className="h-4 w-4 text-slate-400" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[200px] bg-slate-50">
                  <SelectValue placeholder="Filtrer par statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les membres</SelectItem>
                  <SelectItem value="active">Cotisation à jour</SelectItem>
                  <SelectItem value="expired">Cotisation expirée</SelectItem>
                  <SelectItem value="pending">En attente de validation</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* TABLEAU PRINCIPAL */}
        <Card className="border-0 shadow-sm bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 uppercase font-bold text-[10px] text-slate-500 border-b">
                <tr>
                  <th className="px-6 py-4">Membre (Nom & Contact)</th>
                  <th className="px-6 py-4">Promotion</th>
                  <th className="px-6 py-4">État Cotisation</th>
                  <th className="px-6 py-4 text-right">Actions Rapides</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredUsers.filter(u => u.isValidated).map(u => {
                  const isOk = u.paidUntil && new Date(u.paidUntil) > new Date();
                  return (
                    <tr key={u._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-[#0A2A5C] text-base">{u.name}</span>
                          <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                            <span className="flex items-center gap-1 cursor-pointer hover:text-blue-600" onClick={() => copyToClipboard(u.email, 'Email')}>
                              <Mail className="h-3 w-3" /> {u.email}
                            </span>
                            {u.phone && (
                              <span className="flex items-center gap-1 cursor-pointer hover:text-blue-600" onClick={() => copyToClipboard(u.phone, 'Téléphone')}>
                                <Phone className="h-3 w-3" /> {u.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="secondary" className="bg-slate-100 text-slate-600">Promo {u.generation || 'N/A'}</Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col items-start gap-1">
                          <Badge variant="outline" className={isOk ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}>
                            {isOk ? "À jour" : "Expirée"}
                          </Badge>
                          {u.paidUntil && (
                            <span className="text-[10px] text-slate-400">
                              Jusqu'au {new Date(u.paidUntil).toLocaleDateString('fr-FR')}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-end items-center gap-3">
                          {!isOk && (
                            <Button size="sm" variant="ghost" onClick={() => handleSendReminder(u._id, u.name, u.email)} className="h-8 text-xs text-amber-600 hover:bg-amber-50 hover:text-amber-700">
                              <Send className="h-3 w-3 mr-1.5"/> Relancer
                            </Button>
                          )}
                          <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden h-8 bg-white shadow-sm">
                            <Button size="icon" variant="ghost" className="h-full w-8 border-r rounded-none hover:bg-red-50 hover:text-red-600" onClick={() => handleModifySubscription(u._id, u.name, -1)} title="Retirer 1 mois">
                              <MinusCircle className="h-3.5 w-3.5"/>
                            </Button>
                            <Button size="icon" variant="ghost" className="h-full w-8 text-green-600 rounded-none hover:bg-green-50" onClick={() => handleModifySubscription(u._id, u.name, 1)} title="Ajouter 1 mois">
                              <Plus className="h-3.5 w-3.5"/>
                            </Button>
                          </div>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg" onClick={() => handleDeleteUser(u._id, u.name)} title="Supprimer le membre">
                            <Trash2 className="h-4 w-4"/>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredUsers.filter(u => u.isValidated).length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-slate-500">
                      Aucun membre ne correspond à votre recherche.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminMembersPage;