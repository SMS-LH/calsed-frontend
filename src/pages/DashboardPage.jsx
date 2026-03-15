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
  Trash2,
  Pencil
} from "lucide-react";

import { useAuth } from "@/context/AuthContext";
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
  const [editingOfferId, setEditingOfferId] = useState(null); 
  
  // État du formulaire
  const defaultOfferState = {
    title: "",
    company: "",
    type: "Emploi",
    location: "",
    description: "",
    link: "",
    contactEmail: ""
  };
  const [newOffer, setNewOffer] = useState(defaultOfferState);

  // Gestion des URLs d'images
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    const baseUrl = (process.env.REACT_APP_API_URL || import.meta.env.VITE_API_URL || '').replace(/\/api$/, '');
    return `${baseUrl}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
  };

  // 1. Charger les offres
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

  // 2. Créer ou Modifier une offre
  const handleCreateOrUpdateOffer = async (e) => {
    e.preventDefault();
    
    if (!newOffer.title || !newOffer.company || !newOffer.description) {
      toast.error("Veuillez remplir les champs obligatoires");
      return;
    }

    try {
      if (editingOfferId) {
        await api.put(`/offers/${editingOfferId}`, newOffer);
        toast.success("Offre modifiée avec succès !");
      } else {
        await api.post('/offers', { ...newOffer, authorId: user.id || user._id });
        toast.success("Offre publiée avec succès !");
      }

      closeModal();
      fetchOffers(); 
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Erreur lors de la sauvegarde";
      toast.error(errorMsg);
    }
  };

  // 3. Ouvrir le modal en mode "Modification"
  const handleEditClick = (offer) => {
    setEditingOfferId(offer._id || offer.id);
    setNewOffer({
      title: offer.title || "",
      company: offer.company || "",
      type: offer.type || "Emploi",
      location: offer.location || "",
      description: offer.description || "",
      link: offer.link || "",
      contactEmail: offer.contactEmail || ""
    });
    setShowModal(true);
  };

  // 4. Supprimer une offre
  const handleDeleteOffer = async (offerId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette offre ?")) return;

    try {
      await api.delete(`/offers/${offerId}`);
      toast.success("Offre supprimée.");
      setOffers(offers.filter(offer => (offer._id || offer.id) !== offerId));
    } catch (error) {
      toast.error("Erreur serveur lors de la suppression.");
    }
  };

  // 5. Fermer et réinitialiser le modal
  const closeModal = () => {
    setShowModal(false);
    setEditingOfferId(null);
    setNewOffer(defaultOfferState);
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
      
      {/* HEADER UTILISATEUR */}
      <div className="bg-[#0A2A5C] pt-24 md:pt-28 pb-12 md:pb-16 text-white shadow-lg relative overflow-hidden">
         <div className="absolute top-0 right-0 w-48 h-48 md:w-64 md:h-64 bg-[#FFD700] opacity-5 rounded-full blur-[60px] md:blur-[80px]" />
         
         <div className="container mx-auto px-4 md:px-6 lg:px-8 relative z-10">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-6 text-center md:text-left">
             <div className="flex flex-col md:flex-row items-center md:items-center gap-4 md:gap-5">
               <Avatar className="h-20 w-20 md:h-24 md:w-24 border-4 border-[#FFD700] shadow-xl shrink-0">
                 <AvatarImage src={getImageUrl(user?.avatar)} className="object-cover" />
                 <AvatarFallback className="bg-white text-[#0A2A5C] font-bold text-2xl md:text-3xl">{user?.name?.charAt(0).toUpperCase()}</AvatarFallback>
               </Avatar>
               
               <div>
                 <h1 className="text-2xl md:text-3xl font-bold mb-2">Bienvenue, {user?.name?.split(' ')[0]} !</h1>
                 <div className="flex flex-wrap justify-center md:justify-start items-center gap-2">
                    <Badge variant="outline" className="text-blue-200 border-blue-400">Promo {user?.generation || "N/A"}</Badge>
                    {isMember ? 
                      <Badge className="bg-green-500 hover:bg-green-600 border-0"><CheckCircle className="w-3 h-3 mr-1"/> Cotisation à jour</Badge> 
                      : 
                      <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1"/> Compte restreint</Badge>
                    }
                 </div>
               </div>
             </div>
             
             <Button variant="destructive" onClick={logout} className="bg-red-500/80 hover:bg-red-600 w-full md:w-auto h-12 md:h-10 mt-2 md:mt-0">
               <LogOut className="h-4 w-4 mr-2"/> Déconnexion
             </Button>
           </div>
         </div>
      </div>

      <div className="container mx-auto px-4 md:px-6 lg:px-8 -mt-6 md:-mt-10 relative z-10">
        
        {/* STATISTIQUES */}
        <motion.div
            initial="hidden" animate="visible" variants={fadeInUp}
            className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8"
        >
            {statsData.map((stat, i) => {
                const CardInner = (
                    <CardContent className="p-4 md:p-5 flex items-center justify-between h-full">
                        <div>
                            <p className="text-xl md:text-2xl font-bold text-slate-800">{stat.count}</p>
                            <p className="text-[10px] md:text-xs font-medium text-slate-500 uppercase tracking-wide">{stat.label}</p>
                        </div>
                        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center shrink-0 ${stat.bg}`}>
                            <stat.icon className={`h-5 w-5 md:h-6 md:w-6 ${stat.color}`} />
                        </div>
                    </CardContent>
                );

                return stat.link ? (
                    <Link key={i} to={stat.link} className="block h-full">
                        <Card className="border-0 shadow-md md:shadow-lg hover:-translate-y-1 transition-transform h-full cursor-pointer border-b-4 border-b-transparent hover:border-b-[#FFD700]">
                            {CardInner}
                        </Card>
                    </Link>
                ) : (
                    <Card key={i} className="border-0 shadow-md md:shadow-lg hover:-translate-y-1 transition-transform h-full">
                        {CardInner}
                    </Card>
                );
            })}
        </motion.div>

        {/* BOUTON D'ACTION PRINCIPAL */}
        <div className="flex justify-end mb-6">
            <Button 
              onClick={() => {
                setEditingOfferId(null);
                setNewOffer(defaultOfferState);
                setShowModal(true);
              }} 
              className="w-full sm:w-auto bg-[#FFD700] text-[#0A2A5C] hover:bg-[#FFD700]/90 font-bold shadow-lg h-12 px-6 rounded-xl md:rounded-lg"
            >
                <Plus className="mr-2 h-5 w-5" /> Publier une opportunité
            </Button>
        </div>

        {/* CONTENU : LISTE DES OFFRES */}
        <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 custom-scrollbar mb-4 md:mb-6">
              <TabsList className="bg-white border p-1 rounded-xl shadow-sm h-auto inline-flex md:flex min-w-max">
                <TabsTrigger value="all" className="px-4 md:px-6 py-2.5 md:py-2 text-sm">Toutes</TabsTrigger>
                <TabsTrigger value="jobs" className="px-4 md:px-6 py-2.5 md:py-2 text-sm">Emplois & Missions</TabsTrigger>
                <TabsTrigger value="internships" className="px-4 md:px-6 py-2.5 md:py-2 text-sm">Stages & Alternance</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value={activeTab} className="space-y-4">
                {filteredOffers.length === 0 ? (
                    <div className="text-center py-12 md:py-16 bg-white rounded-2xl border border-dashed border-slate-300 mx-1 md:mx-0">
                      <Briefcase className="h-10 w-10 md:h-12 md:w-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500 text-base md:text-lg font-medium">Aucune offre disponible.</p>
                      <p className="text-xs md:text-sm text-slate-400 mt-1">Soyez le premier à en publier une !</p>
                    </div>
                ) : (
                    filteredOffers.map((offer) => {
                      const currentUserId = (user?._id || user?.id || "").toString();
                      const offerAuthorId = (offer.author?._id || offer.authorId || offer.author)?.toString() || "";
                      
                      const isAuthor = (currentUserId !== "" && currentUserId === offerAuthorId) || user?.role === 'admin';
                      const authorName = offer.author?.name || offer.authorName || "un membre du réseau";

                      return (
                        <Card key={offer._id || offer.id} className="border-0 shadow-sm hover:shadow-md transition-all group relative rounded-2xl md:rounded-xl">
                          <CardContent className="p-4 md:p-6">
                            
                            {/* BOUTONS D'ACTION (Éditer / Supprimer) - Mobile en haut à droite */}
                            {isAuthor && (
                              <div className="absolute top-2 right-2 md:top-4 md:right-4 z-10 flex gap-1 bg-white/80 backdrop-blur-sm rounded-lg p-1">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 md:h-10 md:w-10 text-slate-400 hover:text-[#0A2A5C] hover:bg-blue-50 transition-colors"
                                  onClick={(e) => { e.preventDefault(); handleEditClick(offer); }}
                                >
                                  <Pencil className="h-4 w-4 md:h-5 md:w-5" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 md:h-10 md:w-10 text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                                  onClick={(e) => { e.preventDefault(); handleDeleteOffer(offer._id || offer.id); }}
                                >
                                  <Trash2 className="h-4 w-4 md:h-5 md:w-5" />
                                </Button>
                              </div>
                            )}

                            <div className="flex flex-col md:flex-row gap-4 md:gap-6 mt-6 md:mt-0">
                              
                              {/* Logo Entreprise / Avatar */}
                              <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 border border-slate-200">
                                {offer.author?.avatar ? (
                                   <img src={getImageUrl(offer.author.avatar)} alt="Logo" className="w-full h-full object-cover rounded-xl" />
                                ) : (
                                   <Building className="h-6 w-6 md:h-8 md:w-8 text-slate-400" />
                                )}
                              </div>
                              
                              <div className="flex-1 min-w-0 md:pr-24"> 
                                <div className="flex flex-col items-start gap-2 mb-3">
                                  <div className="w-full pr-12 md:pr-0">
                                    <h3 className="text-lg md:text-xl font-bold text-[#0A2A5C] group-hover:text-blue-700 transition-colors leading-tight">
                                      {offer.title}
                                    </h3>
                                    <p className="text-slate-600 font-medium text-sm md:text-lg mt-0.5">{offer.company}</p>
                                  </div>
                                  <Badge className={`text-[10px] md:text-xs py-0.5 ${
                                    offer.type === 'Stage' || offer.type === 'Alternance' 
                                      ? "bg-green-100 text-green-700 hover:bg-green-200" 
                                      : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                                  }`}>
                                    {offer.type}
                                  </Badge>
                                </div>

                                <div className="flex flex-wrap gap-2 md:gap-4 text-xs md:text-sm text-slate-500 mb-4">
                                    <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-md border border-slate-100"><MapPin className="h-3 w-3 md:h-4 md:w-4 text-slate-400" /> {offer.location}</span>
                                    <span className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-md border border-slate-100"><Clock className="h-3 w-3 md:h-4 md:w-4 text-slate-400" /> {new Date(offer.createdAt).toLocaleDateString('fr-FR')}</span>
                                    {offer.author && <span className="flex items-center gap-1 text-[10px] md:text-xs bg-slate-50 px-2 py-1 rounded-md border border-slate-100 truncate max-w-full">Par {authorName}</span>}
                                </div>

                                <p className="text-sm md:text-base text-slate-600 leading-relaxed mb-4 md:mb-6 whitespace-pre-line line-clamp-4 md:line-clamp-none">
                                  {offer.description}
                                </p>

                                <div className="flex flex-col sm:flex-row gap-2 md:gap-3 pt-4 border-t border-slate-100">
                                    {offer.link && (
                                        <a href={offer.link} target="_blank" rel="noreferrer" className="w-full sm:w-auto">
                                            <Button size="sm" className="w-full sm:w-auto bg-[#0A2A5C] hover:bg-[#0A2A5C]/90 h-10 md:h-9">
                                              Postuler <ExternalLink className="ml-2 h-3.5 w-3.5 md:h-4 md:w-4" />
                                            </Button>
                                        </a>
                                    )}
                                    {offer.contactEmail && (
                                        <a href={`mailto:${offer.contactEmail}`} className="w-full sm:w-auto">
                                            <Button size="sm" variant="outline" className="w-full sm:w-auto border-slate-300 h-10 md:h-9">
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

      {/* MODAL (FORMULAIRE D'AJOUT / MODIFICATION) */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm p-0 md:p-4">
          <motion.div 
            initial={{ opacity: 0, y: 100, scale: 1 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="bg-white rounded-t-3xl md:rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col"
          >
            <div className="p-4 md:p-6 border-b border-slate-100 flex justify-between items-center bg-white z-10 shrink-0 rounded-t-3xl md:rounded-t-2xl">
              <h2 className="text-lg md:text-xl font-bold text-[#0A2A5C]">
                {editingOfferId ? "Modifier l'opportunité" : "Publier une opportunité"}
              </h2>
              <Button variant="ghost" size="icon" onClick={closeModal} className="h-8 w-8 rounded-full bg-slate-100 hover:bg-slate-200">
                <X className="h-4 w-4 text-slate-500" />
              </Button>
            </div>
            
            <div className="p-4 md:p-6 overflow-y-auto custom-scrollbar flex-1">
              <form onSubmit={handleCreateOrUpdateOffer} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5 md:space-y-2">
                        <Label className="text-xs md:text-sm font-bold text-slate-700">Titre du poste <span className="text-red-500">*</span></Label>
                        <Input required value={newOffer.title} onChange={e => setNewOffer({...newOffer, title: e.target.value})} placeholder="Ex: Développeur React" className="h-11 md:h-10 bg-slate-50" />
                    </div>
                    <div className="space-y-1.5 md:space-y-2">
                        <Label className="text-xs md:text-sm font-bold text-slate-700">Entreprise <span className="text-red-500">*</span></Label>
                        <Input required value={newOffer.company} onChange={e => setNewOffer({...newOffer, company: e.target.value})} placeholder="Ex: Wave" className="h-11 md:h-10 bg-slate-50" />
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5 md:space-y-2">
                        <Label className="text-xs md:text-sm font-bold text-slate-700">Type de contrat <span className="text-red-500">*</span></Label>
                        <Select value={newOffer.type} onValueChange={v => setNewOffer({...newOffer, type: v})}>
                            <SelectTrigger className="h-11 md:h-10 bg-slate-50"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Emploi">Emploi / CDI / CDD</SelectItem>
                                <SelectItem value="Stage">Stage</SelectItem>
                                <SelectItem value="Alternance">Alternance</SelectItem>
                                <SelectItem value="Freelance">Freelance</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1.5 md:space-y-2">
                        <Label className="text-xs md:text-sm font-bold text-slate-700">Lieu <span className="text-red-500">*</span></Label>
                        <Input required value={newOffer.location} onChange={e => setNewOffer({...newOffer, location: e.target.value})} placeholder="Ex: Dakar / Remote" className="h-11 md:h-10 bg-slate-50" />
                    </div>
                </div>

                <div className="space-y-1.5 md:space-y-2">
                    <Label className="text-xs md:text-sm font-bold text-slate-700">Description <span className="text-red-500">*</span></Label>
                    <Textarea required className="min-h-[100px] md:min-h-[120px] bg-slate-50 resize-none" value={newOffer.description} onChange={e => setNewOffer({...newOffer, description: e.target.value})} placeholder="Détails, missions, profil recherché..." />
                </div>

                <div className="space-y-1.5 md:space-y-2">
                    <Label className="text-xs md:text-sm font-bold text-slate-700">Lien pour postuler (Optionnel)</Label>
                    <Input value={newOffer.link} onChange={e => setNewOffer({...newOffer, link: e.target.value})} placeholder="https://..." className="h-11 md:h-10 bg-slate-50" />
                </div>

                <div className="space-y-1.5 md:space-y-2">
                    <Label className="text-xs md:text-sm font-bold text-slate-700">Email de contact (Optionnel)</Label>
                    <Input value={newOffer.contactEmail} onChange={e => setNewOffer({...newOffer, contactEmail: e.target.value})} placeholder="rh@entreprise.com" className="h-11 md:h-10 bg-slate-50" />
                </div>

                <div className="pt-2 md:pt-4 pb-4 md:pb-0">
                  <Button type="submit" className="w-full bg-[#0A2A5C] hover:bg-[#08224a] h-12 md:h-12 text-base font-bold rounded-xl shadow-lg transition-transform active:scale-[0.98]">
                    {editingOfferId ? "Enregistrer les modifications" : "Publier l'annonce"}
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
};

export default DashboardPage;