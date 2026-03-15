import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Calendar as CalendarIcon, 
  MapPin, 
  Clock, 
  Plus, 
  Trash2, 
  Loader2,
  AlertCircle,
  Image as ImageIcon
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

// IMPORT DU PONT API SÉCURISÉ
import api from "@/api/axios";

// IMPORT DU COMPOSANT DE RECADRAGE
import ImageCropModal from "@/components/ImageCropModal";

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user, isAdmin } = useAuth();

  // --- ÉTATS POUR LE RECADRAGE D'IMAGE ---
  const [uploading, setUploading] = useState(false);
  const [cropModalSrc, setCropModalSrc] = useState(null);

  // État du formulaire (Avec l'image ajoutée)
  const defaultFormData = {
    title: "",
    description: "",
    date: "",
    time: "",
    location: "",
    type: "Rencontre",
    image: ""
  };
  const [formData, setFormData] = useState(defaultFormData);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await api.get("/events");
      setEvents(res.data);
    } catch (error) {
      toast.error("Erreur lors du chargement des événements");
    } finally {
      setLoading(false);
    }
  };

  // --- UTILITAIRE IMAGE ---
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http') || imagePath.startsWith('data:')) return imagePath;
    const baseUrl = process.env.REACT_APP_API_URL 
      ? process.env.REACT_APP_API_URL.replace(/\/api$/, '') 
      : "https://calsed-api.onrender.com";
    const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    return `${baseUrl}${cleanPath}`;
  };

  // --- LOGIQUE RECADRAGE ET UPLOAD ---
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.addEventListener("load", () => {
      setCropModalSrc(reader.result);
    });
    reader.readAsDataURL(file);
    e.target.value = ""; 
  };

  const handleCroppedUpload = async (croppedFile) => {
    const uploadData = new FormData();
    uploadData.append('image', croppedFile);

    setUploading(true);
    const toastId = toast.loading("Envoi de l'image de l'événement...");

    try {
      const { data } = await api.post('/upload', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success("Image ajoutée avec succès !", { id: toastId });
      
      const imageUrl = typeof data === 'string' ? data : data.url;
      setFormData(prev => ({ ...prev, image: imageUrl }));
      
      setCropModalSrc(null); 
    } catch (error) {
      toast.error("Erreur lors de l'envoi", { id: toastId });
    } finally {
      setUploading(false);
    }
  };

  // --- ACTIONS CRUD ---
  const handleCreateEvent = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const fullDate = new Date(`${formData.date}T${formData.time}`);

      await api.post("/events", {
        ...formData,
        date: fullDate
      });

      toast.success("Événement créé avec succès !");
      setIsModalOpen(false);
      setFormData(defaultFormData);
      fetchEvents();
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Erreur lors de la création";
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteEvent = async (id) => {
    if (!window.confirm("Supprimer cet événement ?")) return;

    try {
      await api.delete(`/events/${id}`);
      toast.success("Événement supprimé");
      setEvents(events.filter(e => e._id !== id));
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Erreur lors de la suppression";
      toast.error(errorMsg);
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'AG': return "bg-red-100 text-red-700 border-red-200";
      case 'Webinaire': return "bg-blue-100 text-blue-700 border-blue-200";
      case 'Rencontre': return "bg-green-100 text-green-700 border-green-200";
      default: return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <div className="min-h-screen pt-20 md:pt-24 pb-12 bg-slate-50 relative">
      <div className="container mx-auto px-4 md:px-6 max-w-5xl">
        
        {/* EN-TÊTE */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 md:mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#0A2A5C] font-display">Calendrier du Collectif</h1>
            <p className="text-sm md:text-base text-slate-600 mt-1">Assemblées, rencontres et webinaires du CALSED</p>
          </div>

          {isAdmin && (
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button className="w-full md:w-auto bg-[#0A2A5C] text-white hover:bg-[#08224a] rounded-xl shadow-md transition-transform active:scale-95 h-12 md:h-10 text-base md:text-sm font-bold md:font-medium">
                  <Plus className="w-5 h-5 md:w-4 md:h-4 mr-2" /> Créer un événement
                </Button>
              </DialogTrigger>
              
              <DialogContent 
                className="w-[95vw] sm:max-w-[500px] rounded-2xl md:rounded-3xl max-h-[90vh] overflow-y-auto custom-scrollbar p-0 border-0"
                onInteractOutside={(e) => e.preventDefault()}
              >
                <DialogHeader className="p-4 md:p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
                  <DialogTitle className="text-lg md:text-2xl font-bold text-[#0A2A5C]">Nouvel Événement</DialogTitle>
                </DialogHeader>

                {/* MODAL DE RECADRAGE */}
                {cropModalSrc && (
                  <ImageCropModal
                    imageSrc={cropModalSrc}
                    aspect={16 / 9}
                    isUploading={uploading}
                    onClose={() => setCropModalSrc(null)}
                    onComplete={handleCroppedUpload}
                  />
                )}

                <form onSubmit={handleCreateEvent} className="p-4 md:p-6 space-y-4 md:space-y-5">
                  
                  {/* IMAGE DE COUVERTURE */}
                  <div className="space-y-2">
                    <Label className="text-[10px] md:text-xs text-slate-500 uppercase font-bold flex items-center gap-2">
                      <ImageIcon className="h-3.5 w-3.5 md:h-4 md:w-4"/> Affiche / Couverture (Optionnel)
                    </Label>
                    <div className="flex flex-col sm:flex-row gap-3 md:gap-4 sm:items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                      {formData.image ? (
                        <div className="relative h-24 w-full sm:h-16 sm:w-24 rounded-lg overflow-hidden border shadow-sm group shrink-0">
                          <img src={getImageUrl(formData.image)} className="h-full w-full object-cover" alt="Preview"/>
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Button type="button" size="sm" variant="destructive" onClick={() => setFormData({...formData, image: ""})} className="h-6 text-[10px] font-bold">Retirer</Button>
                          </div>
                        </div>
                      ) : (
                        <div className="h-20 w-full sm:h-16 sm:w-24 rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center bg-white shrink-0">
                          <ImageIcon className="h-5 w-5 text-slate-300"/>
                        </div>
                      )}
                      <div className="flex-1 w-full">
                        <Input type="file" accept="image/*" onChange={handleFileSelect} disabled={uploading} className="cursor-pointer bg-white text-xs h-9 md:h-10 w-full"/>
                        <p className="text-[9px] md:text-[10px] text-slate-500 mt-1">L'image sera recadrée en 16:9.</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5 md:space-y-2">
                    <Label className="text-sm">Titre de l'événement</Label>
                    <Input required placeholder="Ex: Assemblée Générale 2026" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="h-10 md:h-10" />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5 md:space-y-2">
                      <Label className="text-sm">Date</Label>
                      <Input required type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="h-10 md:h-10" />
                    </div>
                    <div className="space-y-1.5 md:space-y-2">
                      <Label className="text-sm">Heure</Label>
                      <Input required type="time" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} className="h-10 md:h-10" />
                    </div>
                  </div>

                  <div className="space-y-1.5 md:space-y-2">
                    <Label className="text-sm">Type d'événement</Label>
                    <select 
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-1 focus:ring-[#0A2A5C]"
                      value={formData.type}
                      onChange={e => setFormData({...formData, type: e.target.value})}
                    >
                      <option value="Rencontre">Rencontre</option>
                      <option value="AG">Assemblée Générale (AG)</option>
                      <option value="Webinaire">Webinaire</option>
                      <option value="Autre">Autre</option>
                    </select>
                  </div>

                  <div className="space-y-1.5 md:space-y-2">
                    <Label className="text-sm">Lieu / Lien (Zoom...)</Label>
                    <Input placeholder="Ex: Dakar ou Lien Meet" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} className="h-10 md:h-10" />
                  </div>

                  <div className="space-y-1.5 md:space-y-2">
                    <Label className="text-sm">Description</Label>
                    <Textarea placeholder="Ordre du jour, détails..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="min-h-[100px] resize-none" />
                  </div>

                  <Button type="submit" disabled={isSubmitting || uploading} className="w-full bg-[#0A2A5C] text-white hover:bg-[#08224a] h-12 md:h-14 rounded-xl font-bold mt-2">
                    {(isSubmitting || uploading) ? <Loader2 className="animate-spin h-5 w-5" /> : "Publier l'événement"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* LISTE DES ÉVÉNEMENTS */}
        <div className="grid gap-4 md:gap-6">
          {loading ? (
            <div className="flex flex-col items-center py-20">
               <Loader2 className="h-8 w-8 animate-spin text-[#0A2A5C]" />
               <p className="mt-4 text-slate-500 text-sm">Chargement du calendrier...</p>
            </div>
          ) : events.length > 0 ? (
            events.map((event) => (
              <Card key={event._id} className="border-0 shadow-sm overflow-hidden hover:shadow-md transition-all group rounded-2xl md:rounded-xl">
                <div className="flex flex-col md:flex-row h-full">
                  
                  {/* Colonne Date (Haut sur mobile, Gauche sur desktop) */}
                  <div className="bg-[#0A2A5C] text-white py-4 md:py-6 px-6 flex flex-row md:flex-col items-center justify-between md:justify-center md:min-w-[140px] shrink-0 text-center">
                    <div className="flex items-baseline md:flex-col md:items-center gap-1 md:gap-0">
                      <span className="text-3xl md:text-4xl font-bold md:mb-1">{format(new Date(event.date), 'dd')}</span>
                      <span className="text-sm md:text-sm uppercase font-medium tracking-widest">{format(new Date(event.date), 'MMMM', { locale: fr })}</span>
                    </div>
                    <span className="text-xs opacity-80 md:opacity-60 md:mt-1">{format(new Date(event.date), 'yyyy')}</span>
                  </div>

                  {/* Colonne Image (Milieu) */}
                  {event.image && (
                    <div className="w-full md:w-56 h-40 md:h-auto shrink-0 bg-slate-100 border-b md:border-b-0 md:border-r border-slate-100 relative">
                      <img src={getImageUrl(event.image)} alt={event.title} className="absolute inset-0 w-full h-full object-cover" />
                    </div>
                  )}

                  {/* Contenu (Bas sur mobile, Droite sur desktop) */}
                  <CardContent className="p-4 md:p-6 flex-grow relative flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2 md:mb-3">
                        <Badge className={`${getTypeColor(event.type)} border-0 px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wider`} variant="outline">
                          {event.type}
                        </Badge>
                        <div className="flex items-center text-slate-400 text-xs md:text-sm font-medium bg-slate-50 px-2 py-1 rounded-md">
                          <Clock className="w-3 h-3 md:w-4 md:h-4 mr-1.5 text-slate-500" />
                          {format(new Date(event.date), 'HH:mm')}
                        </div>
                      </div>
                      
                      <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-2 leading-tight group-hover:text-[#0A2A5C] transition-colors pr-8">
                        {event.title}
                      </h3>
                      <p className="text-sm md:text-base text-slate-600 mb-4 md:mb-6 leading-relaxed line-clamp-2 italic font-light">
                        {event.description || "Aucun détail supplémentaire."}
                      </p>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3 md:gap-6 text-slate-500 text-xs md:text-sm">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 md:p-2 bg-slate-100 rounded-full shrink-0">
                          <MapPin className="w-3.5 h-3.5 md:w-4 md:h-4 text-[#0A2A5C]" />
                        </div>
                        <span className="font-medium text-slate-700 line-clamp-1">{event.location || "Lieu à définir"}</span>
                      </div>
                    </div>

                    {/* Actions Admin flottantes (Haut droite de la CardContent) */}
                    {isAdmin && (
                      <button 
                        onClick={() => handleDeleteEvent(event._id)}
                        className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-sm rounded-lg text-slate-300 hover:text-red-600 hover:bg-red-50 transition-colors shadow-sm md:shadow-none md:bg-transparent"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                      </button>
                    )}
                  </CardContent>

                </div>
              </Card>
            ))
          ) : (
            <div className="text-center py-16 md:py-24 bg-white rounded-2xl md:rounded-[2rem] border-2 border-dashed border-slate-200 mx-2 md:mx-0">
              <CalendarIcon className="w-12 h-12 md:w-16 md:h-16 text-slate-200 mx-auto mb-4 md:mb-6" />
              <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-2">Aucun événement</h3>
              <p className="text-sm md:text-base text-slate-500 max-w-xs mx-auto px-4">Le calendrier est vide pour le moment. Revenez bientôt !</p>
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default EventsPage;