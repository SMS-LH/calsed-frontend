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
  
  // États pour les filtres avancés
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

  // --- ACTIONS ---
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

  // --- EXPORT CSV ---
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

  // --- COPIE RAPIDE ---
  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    toast.success(`${type} copié !`);
  };

  // --- LOGIQUE DE FILTRAGE ---
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
    <div className="min-h-screen pt-20 md:pt-24 pb-12 bg-slate-50/50">
      <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
        
        {/* EN-TÊTE ET NAVIGATION */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-4">
          <div className="w-full md:w-auto">
            <Button variant="ghost" onClick={() => navigate("/admin")} className="mb-2 -ml-2 md:-ml-4 text-slate-500 hover:text-[#0A2A5C] px-2 md:px-4">
              <ArrowLeft className="h-4 w-4 mr-2" /> <span className="hidden sm:inline">Retour au Dashboard</span><span className="sm:hidden">Retour</span>
            </Button>
            <h1 className="text-2xl md:text-3xl font-bold font-display text-[#0A2A5C] flex items-center gap-2 md:gap-3">
              <Users className="h-6 w-6 md:h-8 md:w-8 text-blue-600" /> Gestion Membres
            </h1>
          </div>
          <Button onClick={handleExportCSV} className="w-full md:w-auto bg-emerald-600 hover:bg-emerald-700 text-white h-12 md:h-10">
            <Download className="h-4 w-4 mr-2" /> Exporter (CSV)
          </Button>
        </div>

        {/* ALERTES (Membres en attente) */}
        {pendingUsers.length > 0 && (
          <Card className="border-l-4 border-l-amber-500 shadow-sm bg-amber-50/50 mb-6 md:mb-8">
            <CardHeader className="pb-2 p-4 md:p-6">
              <CardTitle className="text-amber-700 flex items-center gap-2 text-base md:text-lg">
                <UserCheck className="h-5 w-5"/> {pendingUsers.length} Inscription(s) en attente
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 p-4 md:p-6 pt-0 md:pt-2">
              {pendingUsers.map(u => (
                <div key={u._id} className="bg-white p-3 md:p-4 rounded-xl border shadow-sm flex justify-between items-center gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="h-10 w-10 shrink-0"><AvatarFallback className="bg-amber-100 text-amber-700 font-bold">{u.name[0]}</AvatarFallback></Avatar>
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-[#0A2A5C] truncate">{u.name}</p>
                      <p className="text-xs text-slate-500 truncate">Promo {u.generation || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex gap-1 shrink-0">
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
          <CardContent className="p-3 md:p-4 flex flex-col md:flex-row gap-3 md:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"/>
              <Input 
                placeholder="Chercher par nom, email ou téléphone..." 
                className="pl-10 bg-slate-50 h-12 md:h-10 text-sm" 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <Filter className="h-4 w-4 text-slate-400 hidden md:block" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[220px] bg-slate-50 h-12 md:h-10 text-sm">
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

        {/* TABLEAU PRINCIPAL (Refactorisé en Grid Responsive) */}
        <Card className="border-0 shadow-sm bg-white overflow-hidden">
          
          {/* En-tête Desktop (Caché sur Mobile) */}
          <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-slate-50 border-b text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            <div className="col-span-5">Membre (Nom & Contact)</div>
            <div className="col-span-2">Promotion</div>
            <div className="col-span-2">État Cotisation</div>
            <div className="col-span-3 text-right">Actions Rapides</div>
          </div>

          {/* Liste des Membres */}
          <div className="divide-y divide-slate-100">
            {filteredUsers.filter(u => u.isValidated).map(u => {
              const isOk = u.paidUntil && new Date(u.paidUntil) > new Date();
              
              return (
                <div key={u._id} className="flex flex-col md:grid md:grid-cols-12 gap-4 p-4 md:p-4 hover:bg-slate-50/80 transition-colors">
                  
                  {/* Info Membre */}
                  <div className="md:col-span-5 flex flex-col justify-center">
                    <div className="flex justify-between items-start md:block">
                      <span className="font-bold text-[#0A2A5C] text-base">{u.name}</span>
                      {/* Badge Promo visible en haut à droite sur Mobile uniquement */}
                      <Badge variant="secondary" className="md:hidden bg-slate-100 text-slate-600 text-[10px]">Promo {u.generation || 'N/A'}</Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-slate-500">
                      <span className="flex items-center gap-1 cursor-pointer hover:text-blue-600 truncate" onClick={() => copyToClipboard(u.email, 'Email')}>
                        <Mail className="h-3 w-3 shrink-0" /> {u.email}
                      </span>
                      {u.phone && (
                        <span className="flex items-center gap-1 cursor-pointer hover:text-blue-600 shrink-0" onClick={() => copyToClipboard(u.phone, 'Téléphone')}>
                          <Phone className="h-3 w-3 shrink-0" /> {u.phone}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Promo (Desktop) */}
                  <div className="hidden md:flex md:col-span-2 items-center">
                    <Badge variant="secondary" className="bg-slate-100 text-slate-600">Promo {u.generation || 'N/A'}</Badge>
                  </div>

                  {/* Cotisation */}
                  <div className="md:col-span-2 flex flex-row md:flex-col items-center md:items-start justify-between md:justify-center mt-2 md:mt-0 pt-2 md:pt-0 border-t border-slate-100 md:border-0">
                    <span className="text-xs text-slate-500 md:hidden font-medium">Cotisation :</span>
                    <div className="flex flex-col items-end md:items-start gap-1">
                      <Badge variant="outline" className={isOk ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}>
                        {isOk ? "À jour" : "Expirée"}
                      </Badge>
                      {u.paidUntil && (
                        <span className="text-[10px] text-slate-400">
                          Jusqu'au {new Date(u.paidUntil).toLocaleDateString('fr-FR')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="md:col-span-3 flex flex-wrap justify-end items-center gap-2 mt-2 md:mt-0">
                    {!isOk && (
                      <Button size="sm" variant="ghost" onClick={() => handleSendReminder(u._id, u.name, u.email)} className="h-8 md:h-9 text-xs text-amber-600 hover:bg-amber-50 hover:text-amber-700 w-full sm:w-auto justify-center mb-2 sm:mb-0 bg-amber-50 md:bg-transparent">
                        <Send className="h-3 w-3 mr-1.5"/> Relancer
                      </Button>
                    )}
                    
                    <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden h-8 md:h-9 bg-white shadow-sm shrink-0">
                      <Button size="icon" variant="ghost" className="h-full w-8 md:w-9 border-r rounded-none hover:bg-red-50 hover:text-red-600" onClick={() => handleModifySubscription(u._id, u.name, -1)} title="Retirer 1 mois">
                        <MinusCircle className="h-3.5 w-3.5"/>
                      </Button>
                      <Button size="icon" variant="ghost" className="h-full w-8 md:w-9 text-green-600 rounded-none hover:bg-green-50" onClick={() => handleModifySubscription(u._id, u.name, 1)} title="Ajouter 1 mois">
                        <Plus className="h-3.5 w-3.5"/>
                      </Button>
                    </div>
                    
                    <Button size="icon" variant="ghost" className="h-8 w-8 md:h-9 md:w-9 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg shrink-0" onClick={() => handleDeleteUser(u._id, u.name)} title="Supprimer le membre">
                      <Trash2 className="h-4 w-4"/>
                    </Button>
                  </div>

                </div>
              );
            })}

            {/* État vide */}
            {filteredUsers.filter(u => u.isValidated).length === 0 && (
              <div className="p-12 text-center text-slate-500 flex flex-col items-center">
                <Users className="h-10 w-10 text-slate-300 mb-3" />
                <p className="font-medium">Aucun membre ne correspond à votre recherche.</p>
                <Button variant="link" onClick={() => {setSearchTerm(""); setStatusFilter("all")}} className="text-[#0A2A5C] mt-2">Réinitialiser les filtres</Button>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminMembersPage;