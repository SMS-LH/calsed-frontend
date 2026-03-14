import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Settings2, ArrowLeft, Trash2, Loader2, Save, 
  Image as ImageIcon, Users, ImagePlus,
  Linkedin, Mail, Briefcase, Plus, School, LayoutTemplate
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { useContent } from "@/context/ContentContext";
import { toast } from "sonner";
import api from "../api/axios";

// IMPORT DU COMPOSANT DE RECADRAGE
import ImageCropModal from "@/components/ImageCropModal";

const AdminConfigPage = () => {
  const navigate = useNavigate();
  const { teamMembers, addTeamMember, removeTeamMember } = useContent();

  const [uploading, setUploading] = useState(false);
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);

  // --- NOUVEAUX ÉTATS POUR LE RECADRAGE ---
  const [cropModalSrc, setCropModalSrc] = useState(null);
  const [cropConfig, setCropConfig] = useState({ aspect: 1, type: '', target: '' }); // Stocke le ratio et la cible

  // --- ÉTATS BUREAU ---
  const [newMember, setNewMember] = useState({ 
    name: "", 
    role: "", 
    generation: "", 
    image: "", 
    linkedin: "", 
    email: "" 
  });

  // --- ÉTATS IMAGES DU SITE ---
  const [siteImages, setSiteImages] = useState({
    heroImage: "", 
    philImage1: "", 
    philImage2: "",
    schoolImage: "" 
  });

  useEffect(() => {
    fetchSiteImages();
  }, []);

  const fetchSiteImages = async () => {
    try {
      const { data } = await api.get('/settings');
      if (data) {
        setSiteImages({
          heroImage: data.heroImage || "",
          philImage1: data.philImage1 || "",
          philImage2: data.philImage2 || "" ,
          schoolImage: data.schoolImage || ""
        });
      }
    } catch (e) { 
      toast.error("Erreur de chargement des images");
    } finally {
      setIsLoadingConfig(false);
    }
  };

  const handleSaveImages = async () => {
    const toastId = toast.loading("Mise à jour des images en cours...");
    try {
      await api.put('/settings', siteImages);
      toast.success("Images mises à jour avec succès !", { id: toastId });
    } catch (error) {
      toast.error("Erreur de sauvegarde sur le serveur.", { id: toastId });
    }
  };

  // --- LOGIQUE DE RECADRAGE ---
  
  // 1. Ouvre l'image avec le bon format (aspect)
  const handleFileSelect = (e, type, target, aspect) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.addEventListener("load", () => {
      setCropModalSrc(reader.result);
      setCropConfig({ aspect, type, target });
    });
    reader.readAsDataURL(file);
    e.target.value = ""; 
  };

  // 2. Upload l'image recadrée au bon endroit
  const handleCroppedUpload = async (croppedFile) => {
    const formData = new FormData();
    formData.append('image', croppedFile);

    setUploading(true);
    const toastId = toast.loading("Envoi de l'image...");

    try {
      const { data } = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const imageUrl = typeof data === 'string' ? data : data.url;
      
      if (cropConfig.type === 'config') {
        setSiteImages(prev => ({ ...prev, [cropConfig.target]: imageUrl }));
      } else if (cropConfig.type === 'member') {
        setNewMember(prev => ({ ...prev, [cropConfig.target]: imageUrl }));
      }

      toast.success("Image recadrée et sauvegardée !", { id: toastId });
      setCropModalSrc(null); // On ferme la modale
    } catch (error) {
      toast.error("Erreur lors de l'envoi", { id: toastId });
    } finally {
      setUploading(false);
    }
  };

  const handleAddMember = async () => {
    if (!newMember.name || !newMember.role) return toast.error("Nom et Rôle requis");
    
    const success = await addTeamMember(newMember);
    if (success) {
      setNewMember({ name: "", role: "", generation: "", image: "", linkedin: "", email: "" });
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http') || imagePath.startsWith('data:')) return imagePath;
    const baseUrl = process.env.REACT_APP_API_URL 
      ? process.env.REACT_APP_API_URL.replace(/\/api$/, '') 
      : "https://calsed-api.onrender.com";
    const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    return `${baseUrl}${cleanPath}`;
  };

  if (isLoadingConfig) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin h-10 w-10 text-[#0A2A5C]"/></div>;

  return (
    <div className="min-h-screen pt-24 pb-20 bg-slate-50/50 relative">
      <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <Button variant="ghost" onClick={() => navigate("/admin")} className="mb-2 -ml-4 text-slate-500 hover:text-[#0A2A5C]">
              <ArrowLeft className="h-4 w-4 mr-2" /> Retour au Dashboard
            </Button>
            <h1 className="text-3xl font-bold font-display text-[#0A2A5C] flex items-center gap-3">
              <Settings2 className="h-8 w-8 text-slate-600" /> Configuration du Site
            </h1>
          </div>
        </div>

        <Tabs defaultValue="images" className="space-y-6">
          <TabsList className="bg-white p-1 h-auto flex-wrap border shadow-sm rounded-xl">
            <TabsTrigger value="images" className="gap-2 text-base px-6 py-3"><ImagePlus className="h-4 w-4"/> Médias & Images</TabsTrigger>
            <TabsTrigger value="bureau" className="gap-2 text-base px-6 py-3"><Users className="h-4 w-4"/> Le Bureau CALSED</TabsTrigger>
          </TabsList>

          {/* ONGLET 1 : IMAGES DU SITE */}
          <TabsContent value="images">
            <Card className="border-0 shadow-sm bg-white">
              <CardHeader className="bg-slate-100/50 border-b flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-[#0A2A5C] text-xl">Images institutionnelles</CardTitle>
                  <CardDescription>Gérez les photos principales affichées sur les pages publiques.</CardDescription>
                </div>
                <Button onClick={handleSaveImages} className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-md">
                  <Save className="h-4 w-4 mr-2" /> Enregistrer les images
                </Button>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid md:grid-cols-2 gap-10">
                  
                  {/* Image Accueil - Hero (Format panoramique 16:9 ou 21:9) */}
                  <div className="space-y-3">
                    <Label className="text-sm font-bold text-slate-700 uppercase flex items-center gap-2">
                      <LayoutTemplate className="h-4 w-4 text-[#0A2A5C]" /> Accueil : Bannière Principale
                    </Label>
                    <p className="text-xs text-slate-500 mb-2">Idéalement un format très large (16:9).</p>
                    <div className="h-48 w-full bg-slate-100 rounded-xl overflow-hidden border-2 border-dashed border-slate-300 relative group">
                      {siteImages.heroImage ? (
                        <img src={getImageUrl(siteImages.heroImage)} className="w-full h-full object-cover" alt="Hero"/>
                      ) : (
                        <div className="flex flex-col h-full items-center justify-center text-slate-400">
                          <ImageIcon className="h-8 w-8 mb-2 opacity-50"/>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*" onChange={(e) => handleFileSelect(e, 'config', 'heroImage', 16/9)} disabled={uploading}/>
                        <Button variant="secondary" className="pointer-events-none">Modifier</Button>
                      </div>
                    </div>
                  </div>

                  {/* Image Lycée (Format classique 4:3) */}
                  <div className="space-y-3">
                    <Label className="text-sm font-bold text-slate-700 uppercase flex items-center gap-2">
                      <School className="h-4 w-4 text-[#0A2A5C]" /> Équipe : Photo du Lycée
                    </Label>
                    <p className="text-xs text-slate-500 mb-2">Image illustrative du LSED (Format 4:3).</p>
                    <div className="h-48 w-full bg-slate-100 rounded-xl overflow-hidden border-2 border-dashed border-slate-300 relative group">
                      {siteImages.schoolImage ? (
                        <img src={getImageUrl(siteImages.schoolImage)} className="w-full h-full object-cover" alt="Lycée"/>
                      ) : (
                        <div className="flex flex-col h-full items-center justify-center text-slate-400">
                          <ImageIcon className="h-8 w-8 mb-2 opacity-50"/>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*" onChange={(e) => handleFileSelect(e, 'config', 'schoolImage', 4/3)} disabled={uploading}/>
                        <Button variant="secondary" className="pointer-events-none">Modifier</Button>
                      </div>
                    </div>
                  </div>

                  {/* Image Mission 1 (Format vertical 3:4) */}
                  <div className="space-y-3">
                    <Label className="text-sm font-bold text-slate-700 uppercase">Accueil : Mission 1 (Verticale)</Label>
                    <p className="text-xs text-slate-500 mb-2">Format vertical (3:4).</p>
                    <div className="h-64 w-48 bg-slate-100 rounded-xl overflow-hidden border-2 border-dashed border-slate-300 relative group">
                      {siteImages.philImage1 ? (
                        <img src={getImageUrl(siteImages.philImage1)} className="w-full h-full object-cover" alt="Mission 1"/>
                      ) : (
                        <div className="flex flex-col h-full items-center justify-center text-slate-400"><ImageIcon className="h-8 w-8 mb-2 opacity-50"/></div>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*" onChange={(e) => handleFileSelect(e, 'config', 'philImage1', 3/4)} disabled={uploading}/>
                        <Button size="sm" variant="secondary" className="pointer-events-none text-xs">Modifier</Button>
                      </div>
                    </div>
                  </div>

                  {/* Image Mission 2 (Format vertical 3:4) */}
                  <div className="space-y-3">
                    <Label className="text-sm font-bold text-slate-700 uppercase">Accueil : Mission 2 (Verticale)</Label>
                    <p className="text-xs text-slate-500 mb-2">Format vertical (3:4).</p>
                    <div className="h-64 w-48 bg-slate-100 rounded-xl overflow-hidden border-2 border-dashed border-slate-300 relative group">
                      {siteImages.philImage2 ? (
                        <img src={getImageUrl(siteImages.philImage2)} className="w-full h-full object-cover" alt="Mission 2"/>
                      ) : (
                        <div className="flex flex-col h-full items-center justify-center text-slate-400"><ImageIcon className="h-8 w-8 mb-2 opacity-50"/></div>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*" onChange={(e) => handleFileSelect(e, 'config', 'philImage2', 3/4)} disabled={uploading}/>
                        <Button size="sm" variant="secondary" className="pointer-events-none text-xs">Modifier</Button>
                      </div>
                    </div>
                  </div>

                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ONGLET 2 : LE BUREAU */}
          <TabsContent value="bureau">
            <div className="grid lg:grid-cols-2 gap-8">
              <Card className="border-0 shadow-sm bg-white h-fit">
                <CardHeader className="bg-[#0A2A5C] text-white rounded-t-xl">
                  <CardTitle className="flex items-center gap-2"><Plus className="h-5 w-5"/> Intégrer un membre</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="flex gap-4 items-center mb-4 bg-slate-50 p-4 rounded-xl border">
                    <Avatar className="h-16 w-16 border-2 border-white shadow-md">
                      <AvatarImage src={getImageUrl(newMember.image)} />
                      <AvatarFallback className="bg-slate-200 text-slate-500"><ImageIcon className="h-6 w-6"/></AvatarFallback>
                    </Avatar>
                    <div className="flex-1 relative overflow-hidden group">
                      <Label className="text-xs mb-1 block uppercase font-bold text-slate-500">Photo de profil (Carrée)</Label>
                      {/* Ici on force le ratio 1 (carré parfait) */}
                      <Input type="file" className="text-xs cursor-pointer bg-white relative z-10" accept="image/*" onChange={(e) => handleFileSelect(e, 'member', 'image', 1)} disabled={uploading}/>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Nom complet <span className="text-red-500">*</span></Label>
                    <Input placeholder="Ex: Moussa Diop" value={newMember.name} onChange={(e) => setNewMember({...newMember, name: e.target.value})} />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Rôle <span className="text-red-500">*</span></Label>
                      <Input placeholder="Ex: Président" value={newMember.role} onChange={(e) => setNewMember({...newMember, role: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label>Promotion</Label>
                      <Input placeholder="Ex: G1" value={newMember.generation} onChange={(e) => setNewMember({...newMember, generation: e.target.value})} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><Linkedin className="h-3 w-3 text-blue-600"/> Lien LinkedIn</Label>
                    <Input placeholder="https://linkedin.com/in/..." value={newMember.linkedin} onChange={(e) => setNewMember({...newMember, linkedin: e.target.value})} />
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><Mail className="h-3 w-3 text-slate-500"/> Email (Contact public)</Label>
                    <Input placeholder="contact@domaine.com" value={newMember.email} onChange={(e) => setNewMember({...newMember, email: e.target.value})} />
                  </div>

                  <Button onClick={handleAddMember} disabled={uploading} className="w-full bg-[#0A2A5C] hover:bg-[#08224a] mt-4">
                    {uploading ? <Loader2 className="animate-spin h-4 w-4 mr-2"/> : "Ajouter au bureau"}
                  </Button>
                </CardContent>
              </Card>

              {/* Liste des membres actuels */}
              <Card className="border-0 shadow-sm bg-white">
                <CardHeader className="border-b bg-slate-50/50">
                  <CardTitle className="flex items-center gap-2 text-[#0A2A5C]"><Briefcase className="h-5 w-5"/> Bureau Actuel</CardTitle>
                  <CardDescription>Membres affichés sur la page Équipe</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y max-h-[600px] overflow-y-auto custom-scrollbar">
                    {teamMembers.map((m, i) => (
                      <div key={m._id || i} className="flex justify-between items-center p-4 hover:bg-slate-50 transition-colors group">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12 border shadow-sm">
                            <AvatarImage src={getImageUrl(m.image)} />
                            <AvatarFallback className="bg-[#0A2A5C] text-white font-bold">{m.name ? m.name[0] : '?'}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-bold text-[#0A2A5C] leading-tight">{m.name}</p>
                            <p className="text-xs text-slate-500 font-medium">{m.role} {m.generation && `• Promo ${m.generation}`}</p>
                          </div>
                        </div>
                        <Button size="icon" variant="ghost" className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:text-red-600" onClick={() => removeTeamMember(m._id || i)}>
                          <Trash2 className="h-4 w-4"/>
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

        </Tabs>
      </div>

      {/* MODALE DE RECADRAGE */}
      {cropModalSrc && (
        <ImageCropModal
          imageSrc={cropModalSrc}
          aspect={cropConfig.aspect}
          isUploading={uploading}
          onClose={() => setCropModalSrc(null)}
          onComplete={handleCroppedUpload}
        />
      )}

    </div>
  );
};

export default AdminConfigPage;