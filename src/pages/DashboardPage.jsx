import { useState, useEffect } from "react";
import { Navigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

// IMPORT DES ICÔNES
import { 
  Briefcase, 
  GraduationCap, 
  MapPin, 
  Clock, 
  ExternalLink, 
  LogOut, 
  CheckCircle, 
  AlertCircle, 
  Plus,
  Building,
  X,
  Users,
  Trash2 
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";

// IMPORT DU PONT API SÉCURISÉ
import api from "@/api/axios";

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const DashboardPage = () => {
  const { user, isAuthenticated, isMember, loading, logout } = useAuth();
  
  // États pour les offres
  const [offers, setOffers] = useState([]);
  const [activeTab, setActiveTab] = useState("all");
  const [showModal, setShowModal] = useState(false); 
  
  // État du formulaire d'ajout
  const [newOffer, setNewOffer] = useState({
    title: "",
    company: "",
    type: "Emploi",
    location: "",
    description: "",
    link: "",
    contactEmail: ""
  });

  // --- CORRECTION DÉPLOIEMENT : Gestion sécurisée des URLs d'images ---
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    const baseUrl = (process.env.REACT_APP_API_URL || import.meta.env.VITE_API_URL || '').replace(/\/api$/, '');
    return `${baseUrl}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
  };

  // 1. Charger les offres au démarrage (VIA AXIOS)
  const fetchOffers = async () => {
    try {
      const { data } = await api.get('/offers');
      setOffers(data);
    } catch (e) { 
      console.error("Erreur chargement offres", e); 
    }
  };

  useEffect(() => {
    if (isAuthenticated) fetchOffers();
  }, [isAuthenticated]);

  // 2. Fonction pour publier une offre (VIA AXIOS)
  const handleCreateOffer = async (e) => {
    e.preventDefault();
    
    if (!newOffer.title || !newOffer.company || !newOffer.description) {
      toast.error("Veuillez remplir les champs obligatoires");
      return;
    }

    try {
      await api.post('/offers', { ...newOffer, authorId: user.id || user._id });

      toast.success("Offre publiée avec succès !");
      setShowModal(false); 
      fetchOffers(); 
      setNewOffer({ title: "", company: "", type: "Emploi", location: "", description: "", link: "", contactEmail: "" });
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Erreur lors de la publication";
      toast.error(errorMsg);
    }
  };

  // 3. Fonction pour SUPPRIMER une offre (VIA AXIOS)
  const handleDeleteOffer = async (offerId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette offre ?")) return;

    try {
      await api.delete(`/offers/${offerId}`);

      toast.success("Offre supprimée.");
      // Mise à jour locale pour éviter de recharger toute la page
      setOffers(offers.filter(offer => (offer._id || offer.id) !== offerId));
    } catch (error) {
      toast.error("Erreur serveur lors de la suppression.");
    }
  };

  // Sécurité
  if (loading) return <div className="min-h-screen flex items-center justify-center">Chargement...</div>;
  if (!isAuthenticated) return <Navigate to="/connexion" replace />;

  // Filtrage des offres
  const filteredOffers = offers.filter(o => {
    if (activeTab === "all") return true;
    if (activeTab === "jobs") return o.type === "Emploi" || o.type === "Freelance";
    if (activeTab === "internships") return o.type === "Stage" || o.type === "Alternance";
    return true;
  });

  // Calcul des stats dynamiques
  const statsData = [
    { label: "Offres d'emploi", count: offers.filter(o => o.type === 'Emploi' || o.type === 'Freelance').length, icon: Briefcase, color: "text-blue-600", bg: "bg-blue-100", link: null },
    { label: "Stages & Alternance", count: offers.filter(o => o.type === 'Stage' || o.type === 'Alternance').length, icon: GraduationCap, color: "text-green-600", bg: "bg-green-100", link: null },
    { label: "Réseau Alumni", count: "Accéder", icon: Users, color: "text-amber-600", bg: "bg-amber-100", link: "/annuaire" }
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-20 relative">
      
      {/* HEADER */}
      <div className="bg-[#0A2A5C] pt-28 pb-16 text-white shadow-lg relative overflow-hidden">
         <div className="absolute top-0 right-0 w-64 h-64 bg-[#FFD700] opacity-5 rounded-full blur-[80px]" />
         <div className="container mx-auto px-4 lg:px-8 relative z-10">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
             <div className="flex items-center gap-5">
               <Avatar className="h-20 w-20 border-4 border-[#FFD700] shadow-xl">
                 <AvatarImage src={getImageUrl(user?.avatar)} />
                 <AvatarFallback className="bg-white text-[#0A2A5C] font-bold text-2xl">{user?.name?.charAt(0).toUpperCase()}</AvatarFallback>
               </Avatar>
               <div>
                 <h1 className="text-3xl font-bold">Bienvenue, {user?.name?.split(' ')[0]} !</h1>
                 <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-blue-200 border-blue-400">Promo {user?.generation || "N/A"}</Badge>
                    {isMember ? 
                      <Badge className="bg-green-500 hover:bg-green-600 border-0"><CheckCircle className="w-3 h-3 mr-1"/> Cotisation à jour</Badge> 
                      : 
                      <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1"/> Compte restreint</Badge>
                    }
                 </div>
               </div>
             </div>
             <Button variant="destructive" onClick={logout} className="bg-red-500/80 hover:bg-red-600">
               <LogOut className="h-4 w-4 mr-2"/> Déconnexion
             </Button>
           </div>
         </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 -mt-10 relative z-10">
        
        {/* STATISTIQUES */}
        <motion.div
            initial="hidden" animate="visible" variants={fadeInUp}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
            {statsData.map((stat, i) => {
                const CardInner = (
                    <CardContent className="p-5 flex items-center justify-between h-full">
                        <div>
                            <p className="text-xl md:text-2xl font-bold text-slate-800">{stat.count}</p>
                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{stat.label}</p>
                        </div>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.bg}`}>
                            <stat.icon className={`h-5 w-5 ${stat.color}`} />
                        </div>
                    </CardContent>
                );

                return stat.link ? (
                    <Link key={i} to={stat.link} className="block h-full">
                        <Card className="border-0 shadow-lg hover:-translate-y-1 transition-transform h-full cursor-pointer border-b-4 border-b-transparent hover:border-b-[#FFD700]">
                            {CardInner}
                        </Card>
                    </Link>
                ) : (
                    <Card key={i} className="border-0 shadow-lg hover:-translate-y-1 transition-transform h-full">
                        {CardInner}
                    </Card>
                );
            })}
        </motion.div>

        {/* BOUTON D'ACTION PRINCIPAL */}
        <div className="flex justify-end mb-6">
            <Button 
              onClick={() => setShowModal(true)} 
              className="bg-[#FFD700] text-[#0A2A5C] hover:bg-[#FFD700]/90 font-bold shadow-lg h-12 px-6"
            >
                <Plus className="mr-2 h-5 w-5" /> Publier une opportunité
            </Button>
        </div>

        {/* CONTENU : LISTE DES OFFRES */}
        <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="bg-white border p-1 rounded-xl mb-6 shadow-sm h-auto flex flex-wrap">
              <TabsTrigger value="all" className="px-6 py-2">Toutes</TabsTrigger>
              <TabsTrigger value="jobs" className="px-6 py-2">Emplois & Missions</TabsTrigger>
              <TabsTrigger value="internships" className="px-6 py-2">Stages & Alternance</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-4">
                {filteredOffers.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-300">
                      <Briefcase className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500 text-lg">Aucune offre disponible pour le moment.</p>
                      <p className="text-sm text-slate-400">Soyez le premier à en publier une !</p>
                    </div>
                ) : (
                    filteredOffers.map((offer) => {
                      // --- LOGIQUE DE VÉRIFICATION CORRIGÉE ---
                      const currentUserId = (user?._id || user?.id || "").toString();
                      const offerAuthorId = (offer.author?._id || offer.authorId || offer.author)?.toString() || "";
                      
                      const isAuthor = (currentUserId !== "" && currentUserId === offerAuthorId) || user?.role === 'admin';
                      // ----------------------------------------

                      return (
                        <Card key={offer._id || offer.id} className="border-0 shadow-sm hover:shadow-md transition-all group relative">
                          <CardContent className="p-6">
                            
                            {/* BOUTON SUPPRIMER (Visible seulement pour l'auteur) */}
                            {isAuthor && (
                              <div className="absolute top-4 right-4 z-10">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                  onClick={(e) => {
                                    e.preventDefault(); // Important: empêche le clic de traverser la carte
                                    handleDeleteOffer(offer._id || offer.id);
                                  }}
                                  title="Supprimer cette offre"
                                >
                                  <Trash2 className="h-5 w-5" />
                                </Button>
                              </div>
                            )}

                            <div className="flex flex-col md:flex-row gap-6">
                              {/* Logo Entreprise */}
                              <div className="w-16 h-16 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200">
                                {offer.author?.avatar ? (
                                   <img src={getImageUrl(offer.author.avatar)} alt="Logo" className="w-full h-full object-cover rounded-xl" />
                                ) : (
                                   <Building className="h-8 w-8 text-slate-400" />
                                )}
                              </div>
                              
                              <div className="flex-1 pr-10"> {/* Padding Right pour ne pas chevaucher le bouton supprimer */}
                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                                  <div>
                                    <h3 className="text-xl font-bold text-[#0A2A5C] group-hover:text-blue-700 transition-colors">
                                      {offer.title}
                                    </h3>
                                    <p className="text-slate-600 font-medium text-lg">{offer.company}</p>
                                  </div>
                                  <Badge className={
                                    offer.type === 'Stage' || offer.type === 'Alternance' 
                                      ? "bg-green-100 text-green-700 hover:bg-green-200" 
                                      : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                                  }>
                                    {offer.type}
                                  </Badge>
                                </div>

                                <div className="flex flex-wrap gap-4 text-sm text-slate-500 mb-4">
                                    <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {offer.location}</span>
                                    <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {new Date(offer.createdAt).toLocaleDateString('fr-FR')}</span>
                                    {offer.author && <span className="flex items-center gap-1 text-xs bg-slate-100 px-2 py-1 rounded-full">Publié par {offer.author.name}</span>}
                                </div>

                                <p className="text-slate-600 leading-relaxed mb-6 whitespace-pre-line">
                                  {offer.description}
                                </p>

                                <div className="flex gap-3 pt-4 border-t border-slate-100">
                                    {offer.link && (
                                        <a href={offer.link} target="_blank" rel="noreferrer">
                                            <Button size="sm" className="bg-[#0A2A5C] hover:bg-[#0A2A5C]/90">
                                              Postuler <ExternalLink className="ml-2 h-4 w-4" />
                                            </Button>
                                        </a>
                                    )}
                                    {offer.contactEmail && (
                                        <a href={`mailto:${offer.contactEmail}`}>
                                            <Button size="sm" variant="outline" className="border-slate-300">
                                              Contacter par Email
                                            </Button>
                                        </a>
                                    )}
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })
                )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      {/* MODAL (FORMULAIRE D'AJOUT) */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold text-[#0A2A5C]">Publier une opportunité</h2>
              <Button variant="ghost" size="icon" onClick={() => setShowModal(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <form onSubmit={handleCreateOffer} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                  <div>
                      <Label className="mb-2 block">Titre du poste *</Label>
                      <Input required value={newOffer.title} onChange={e => setNewOffer({...newOffer, title: e.target.value})} placeholder="Ex: Développeur React" />
                  </div>
                  <div>
                      <Label className="mb-2 block">Entreprise *</Label>
                      <Input required value={newOffer.company} onChange={e => setNewOffer({...newOffer, company: e.target.value})} placeholder="Ex: Wave" />
                  </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                  <div>
                      <Label className="mb-2 block">Type de contrat *</Label>
                      <Select value={newOffer.type} onValueChange={v => setNewOffer({...newOffer, type: v})}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                              <SelectItem value="Emploi">Emploi / CDI / CDD</SelectItem>
                              <SelectItem value="Stage">Stage</SelectItem>
                              <SelectItem value="Alternance">Alternance</SelectItem>
                              <SelectItem value="Freelance">Freelance</SelectItem>
                          </SelectContent>
                      </Select>
                  </div>
                  <div>
                      <Label className="mb-2 block">Lieu *</Label>
                      <Input required value={newOffer.location} onChange={e => setNewOffer({...newOffer, location: e.target.value})} placeholder="Ex: Dakar / Remote" />
                  </div>
              </div>

              <div>
                  <Label className="mb-2 block">Description de l'offre *</Label>
                  <Textarea required className="min-h-[120px]" value={newOffer.description} onChange={e => setNewOffer({...newOffer, description: e.target.value})} placeholder="Détails, missions, profil recherché..." />
              </div>

              <div>
                  <Label className="mb-2 block">Lien pour postuler (Optionnel)</Label>
                  <Input value={newOffer.link} onChange={e => setNewOffer({...newOffer, link: e.target.value})} placeholder="https://..." />
              </div>

              <div>
                  <Label className="mb-2 block">Email de contact (Optionnel)</Label>
                  <Input value={newOffer.contactEmail} onChange={e => setNewOffer({...newOffer, contactEmail: e.target.value})} placeholder="rh@entreprise.com" />
              </div>

              <div className="pt-4">
                <Button type="submit" className="w-full bg-[#0A2A5C] hover:bg-[#0A2A5C]/90 h-12 text-lg font-medium">
                  Publier l'annonce
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

    </div>
  );
};

export default DashboardPage;