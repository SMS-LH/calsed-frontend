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
    <div className="min-h-screen pt-24 pb-12 bg-slate-50 relative">
      <div className="container mx-auto px-4 max-w-5xl">
        
        {/* EN-TÊTE */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#0A2A5C] font-display">Calendrier du Collectif</h1>
            <p className="text-slate-600">Assemblées, rencontres et webinaires du CALSED</p>
          </div>

          {isAdmin && (
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#0A2A5C] text-white hover:bg-[#0A2A5C]/90 rounded-xl shadow-lg transition-transform active:scale-95">
                  <Plus className="w-4 h-4 mr-2" /> Créer un événement
                </Button>
              </DialogTrigger>
              
              {/* CORRECTION ICI : onInteractOutside pour bloquer la fermeture automatique */}
              <DialogContent 
                className="sm:max-w-[500px] rounded-3xl max-h-[90vh] overflow-y-auto custom-scrollbar"
                onInteractOutside={(e) => e.preventDefault()}
              >
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold text-[#0A2A5C]">Nouvel Événement</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateEvent} className="space-y-4 pt-4">
                  
                  {/* IMAGE DE COUVERTURE */}
                  <div className="space-y-2">
                    <Label className="text-xs text-slate-500 uppercase font-bold flex items-center gap-2">
                      <ImageIcon className="h-4 w-4"/> Affiche / Couverture (Optionnel)
                    </Label>
                    <div className="flex gap-4 items-center p-3 bg-slate-50 rounded-xl border border-slate-100">
                      {formData.image ? (
                        <div className="relative h-16 w-24 rounded-lg overflow-hidden border shadow-sm group shrink-0">
                          <img src={getImageUrl(formData.image)} className="h-full w-full object-cover" alt="Preview"/>
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Button type="button" size="sm" variant="destructive" onClick={() => setFormData({...formData, image: ""})} className="h-6 text-[10px] font-bold">Retirer</Button>
                          </div>
                        </div>
                      ) : (
                        <div className="h-16 w-24 rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center bg-white shrink-0">
                          <ImageIcon className="h-5 w-5 text-slate-300"/>
                        </div>
                      )}
                      <div className="flex-1">
                        <Input type="file" accept="image/*" onChange={handleFileSelect} disabled={uploading} className="cursor-pointer bg-white text-xs"/>
                        <p className="text-[10px] text-slate-500 mt-1">L'image sera recadrée en 16:9.</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Titre de l'événement</Label>
                    <Input required placeholder="Ex: Assemblée Générale 2026" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Date</Label>
                      <Input required type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label>Heure</Label>
                      <Input required type="time" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Type d'événement</Label>
                    <select 
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-[#0A2A5C]"
                      value={formData.type}
                      onChange={e => setFormData({...formData, type: e.target.value})}
                    >
                      <option value="Rencontre">Rencontre</option>
                      <option value="AG">Assemblée Générale (AG)</option>
                      <option value="Webinaire">Webinaire</option>
                      <option value="Autre">Autre</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Lieu / Lien (Zoom...)</Label>
                    <Input placeholder="Ex: Dakar ou Lien Meet" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea placeholder="Ordre du jour, détails..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                  </div>
                  <Button type="submit" disabled={isSubmitting || uploading} className="w-full bg-[#0A2A5C] text-white py-6 rounded-xl font-bold">
                    {(isSubmitting || uploading) ? <Loader2 className="animate-spin" /> : "Publier l'événement"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        {/* LISTE DES ÉVÉNEMENTS */}
        <div className="grid gap-6">
          {loading ? (
            <div className="flex flex-col items-center py-20">
               <Loader2 className="h-8 w-8 animate-spin text-[#0A2A5C]" />
               <p className="mt-4 text-slate-500">Chargement du calendrier...</p>
            </div>
          ) : events.length > 0 ? (
            events.map((event) => (
              <Card key={event._id} className="border-0 shadow-sm overflow-hidden hover:shadow-md transition-all group">
                <div className="flex flex-col md:flex-row">
                  
                  {/* Colonne Date */}
                  <div className="bg-[#0A2A5C] text-white p-6 flex flex-col items-center justify-center min-w-[140px] shrink-0 text-center">
                    <span className="text-4xl font-bold mb-1">{format(new Date(event.date), 'dd')}</span>
                    <span className="text-sm uppercase font-medium tracking-widest">{format(new Date(event.date), 'MMMM', { locale: fr })}</span>
                    <span className="text-xs opacity-60 mt-1">{format(new Date(event.date), 'yyyy')}</span>
                  </div>

                  {/* Colonne Image */}
                  {event.image && (
                    <div className="w-full md:w-64 h-48 md:h-auto shrink-0 bg-slate-100 border-r border-slate-100">
                      <img src={getImageUrl(event.image)} alt={event.title} className="w-full h-full object-cover" />
                    </div>
                  )}

                  {/* Contenu */}
                  <CardContent className="p-6 flex-grow relative">
                    <div className="flex justify-between items-start mb-3">
                      <Badge className={`${getTypeColor(event.type)} border-0 px-3 py-1 rounded-full`} variant="outline">
                        {event.type}
                      </Badge>
                      <div className="flex items-center text-slate-400 text-sm font-medium">
                        <Clock className="w-4 h-4 mr-1.5" />
                        {format(new Date(event.date), 'HH:mm')}
                      </div>
                    </div>
                    
                    <h3 className="text-2xl font-bold text-slate-900 mb-2 group-hover:text-[#0A2A5C] transition-colors">
                      {event.title}
                    </h3>
                    <p className="text-slate-600 mb-6 leading-relaxed line-clamp-2 italic">
                      {event.description || "Aucun détail supplémentaire."}
                    </p>
                    
                    <div className="flex flex-wrap items-center gap-6 text-slate-500 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-slate-100 rounded-full">
                          <MapPin className="w-4 h-4 text-[#0A2A5C]" />
                        </div>
                        <span className="font-medium text-slate-700">{event.location || "Lieu à définir"}</span>
                      </div>
                    </div>

                    {/* Actions Admin flottantes */}
                    {isAdmin && (
                      <button 
                        onClick={() => handleDeleteEvent(event._id)}
                        className="absolute bottom-6 right-6 p-2 text-slate-300 hover:text-red-600 transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </CardContent>
                </div>
              </Card>
            ))
          ) : (
            <div className="text-center py-24 bg-white rounded-[2rem] border-2 border-dashed border-slate-200">
              <CalendarIcon className="w-16 h-16 text-slate-200 mx-auto mb-6" />
              <h3 className="text-xl font-bold text-slate-900 mb-2">Aucun événement</h3>
              <p className="text-slate-500 max-w-xs mx-auto">Le calendrier est vide pour le moment. Revenez bientôt !</p>
            </div>
          )}
        </div>
      </div>

      {/* MODALE DE RECADRAGE */}
      {cropModalSrc && (
        <ImageCropModal
          imageSrc={cropModalSrc}
          aspect={16 / 9}
          isUploading={uploading}
          onClose={() => setCropModalSrc(null)}
          onComplete={handleCroppedUpload}
        />
      )}

    </div>
  );
};

export default EventsPage;