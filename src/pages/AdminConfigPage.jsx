import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Settings2, ArrowLeft, Trash2, Loader2, Save, 
  Image as ImageIcon, Users, LayoutTemplate,
  Linkedin, Mail, Briefcase, X, Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { useContent } from "@/context/ContentContext";
import { toast } from "sonner";
import api from "../api/axios";

const AdminConfigPage = () => {
  const navigate = useNavigate();
  const { teamMembers, addTeamMember, removeTeamMember } = useContent();

  const [uploading, setUploading] = useState(false);
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);

  // --- ÉTATS BUREAU ---
  const [newMember, setNewMember] = useState({ 
    name: "", 
    role: "", 
    generation: "", 
    image: "", 
    linkedin: "", 
    email: "" 
  });

  // --- ÉTATS ACCUEIL ---
  const [homeConfig, setHomeConfig] = useState({
    heroTitle: "", heroSubtitle: "", heroImage: "", 
    philoTitle: "", philoText: "", philImage1: "", philImage2: "",
    servicesTitle: "", servicesBadge: "", ctaTitle: ""
  });

  useEffect(() => {
    fetchHomeConfig();
  }, []);

  const fetchHomeConfig = async () => {
    try {
      const { data } = await api.get('/settings');
      if (data && data.data) {
        setHomeConfig(data.data);
      } else if (data && Object.keys(data).length > 0) {
        setHomeConfig(data);
      }
    } catch (e) { 
      console.error("Erreur chargement config", e);
      toast.error("Impossible de charger la configuration de l'accueil");
    } finally {
      setIsLoadingConfig(false);
    }
  };

  const handleSaveHomeConfig = async () => {
    const toastId = toast.loading("Mise à jour du site public...");
    try {
      await api.put('/settings', homeConfig);
      toast.success("Site mis à jour avec succès !", { id: toastId });
      localStorage.setItem("calsed_home_config", JSON.stringify(homeConfig));
    } catch (error) {
      toast.error("Erreur de sauvegarde sur le serveur.", { id: toastId });
    }
  };

  const handleFileUpload = async (e, type = 'config', fieldName = null) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setUploading(true);
    const toastId = toast.loading("Téléchargement de l'image...");

    try {
      const { data } = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success("Image téléchargée !", { id: toastId });
      const imageUrl = typeof data === 'string' ? data : data.url;
      
      if (type === 'config' && fieldName) {
        setHomeConfig(prev => ({ ...prev, [fieldName]: imageUrl }));
      } else if (type === 'member') {
        setNewMember(prev => ({ ...prev, image: imageUrl }));
      }
    } catch (error) {
      toast.error("Erreur serveur", { id: toastId });
    } finally {
      setUploading(false);
    }
  };

  const handleAddMember = () => {
    if (!newMember.name || !newMember.role) return toast.error("Nom et Rôle requis");
    addTeamMember(newMember);
    setNewMember({ name: "", role: "", generation: "", image: "", linkedin: "", email: "" });
    toast.success("Membre ajouté au bureau !");
  };

  if (isLoadingConfig) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin h-10 w-10 text-[#0A2A5C]"/></div>;

  return (
    <div className="min-h-screen pt-24 pb-20 bg-slate-50/50">
      <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
        
        {/* EN-TÊTE ET NAVIGATION */}
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

        <Tabs defaultValue="bureau" className="space-y-6">
          <TabsList className="bg-white p-1 h-auto flex-wrap border shadow-sm rounded-xl">
            <TabsTrigger value="bureau" className="gap-2 text-base px-6 py-3"><Users className="h-4 w-4"/> Le Bureau CALSED</TabsTrigger>
            <TabsTrigger value="accueil" className="gap-2 text-base px-6 py-3"><LayoutTemplate className="h-4 w-4"/> Textes de l'Accueil</TabsTrigger>
          </TabsList>

          {/* ONGLET 1 : LE BUREAU */}
          <TabsContent value="bureau">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Formulaire d'ajout */}
              <Card className="border-0 shadow-sm bg-white h-fit">
                <CardHeader className="bg-[#0A2A5C] text-white rounded-t-xl">
                  <CardTitle className="flex items-center gap-2"><Plus className="h-5 w-5"/> Intégrer un membre</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="flex gap-4 items-center mb-4 bg-slate-50 p-4 rounded-xl border">
                    <Avatar className="h-16 w-16 border-2 border-white shadow-md">
                      <AvatarImage src={newMember.image} />
                      <AvatarFallback className="bg-slate-200 text-slate-500"><ImageIcon className="h-6 w-6"/></AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <Label className="text-xs mb-1 block uppercase font-bold text-slate-500">Photo de profil</Label>
                      <Input type="file" className="text-xs cursor-pointer" accept="image/*" onChange={(e) => handleFileUpload(e, 'member')} disabled={uploading}/>
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
                    <Label className="flex items-center gap-2"><Linkedin className="h-3 w-3"/> Lien LinkedIn</Label>
                    <Input placeholder="https://linkedin.com/in/..." value={newMember.linkedin} onChange={(e) => setNewMember({...newMember, linkedin: e.target.value})} />
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2"><Mail className="h-3 w-3"/> Email (Contact public)</Label>
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
                  <CardDescription>Membres affichés sur la page d'accueil</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y max-h-[600px] overflow-y-auto custom-scrollbar">
                    {teamMembers.map((m, i) => (
                      <div key={i} className="flex justify-between items-center p-4 hover:bg-slate-50 transition-colors group">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-12 w-12 border shadow-sm">
                            <AvatarImage src={m.image} />
                            <AvatarFallback className="bg-blue-100 text-blue-700 font-bold">{m.name ? m.name[0] : '?'}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-bold text-[#0A2A5C] leading-tight">{m.name}</p>
                            <p className="text-xs text-slate-500 font-medium">{m.role} {m.generation && `• Promo ${m.generation}`}</p>
                            <div className="flex gap-3 mt-1">
                              {m.linkedin && <a href={m.linkedin} target="_blank" rel="noreferrer" className="text-[10px] text-blue-600 hover:underline flex items-center gap-1"><Linkedin className="w-3 w-3"/> LinkedIn</a>}
                              {m.email && <a href={`mailto:${m.email}`} className="text-[10px] text-slate-500 hover:underline flex items-center gap-1"><Mail className="w-3 w-3"/> Email</a>}
                            </div>
                          </div>
                        </div>
                        <Button size="icon" variant="ghost" className="text-red-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:text-red-600" onClick={() => removeTeamMember(i)}>
                          <Trash2 className="h-4 w-4"/>
                        </Button>
                      </div>
                    ))}
                    {teamMembers.length === 0 && (
                      <div className="p-8 text-center text-slate-400">
                        <p className="text-sm">Aucun membre dans le bureau.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ONGLET 2 : ACCUEIL */}
          <TabsContent value="accueil">
            <Card className="border-0 shadow-sm bg-white">
              <CardHeader className="bg-slate-100 border-b flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-[#0A2A5C]">Textes et Images de la page principale</CardTitle>
                  <CardDescription>Modifiez les accroches visibles par tous les visiteurs.</CardDescription>
                </div>
                <Button onClick={handleSaveHomeConfig} className="bg-amber-500 hover:bg-amber-600 text-white shadow-md">
                  <Save className="h-4 w-4 mr-2" /> Enregistrer le site
                </Button>
              </CardHeader>
              <CardContent className="p-6 space-y-8">
                
                {/* Section Hero */}
                <div className="space-y-4 p-5 bg-blue-50/50 rounded-xl border border-blue-100">
                  <h4 className="font-bold text-sm uppercase tracking-wider text-[#0A2A5C] flex items-center gap-2">
                    <span className="bg-[#0A2A5C] text-white h-6 w-6 rounded-full flex items-center justify-center text-xs">1</span> 
                    Haut de page (Hero)
                  </h4>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="space-y-2"><Label>Grand Titre</Label><Input value={homeConfig.heroTitle} onChange={(e) => setHomeConfig({...homeConfig, heroTitle: e.target.value})} className="font-bold bg-white" /></div>
                      <div className="space-y-2"><Label>Sous-titre explicatif</Label><Textarea value={homeConfig.heroSubtitle} onChange={(e) => setHomeConfig({...homeConfig, heroSubtitle: e.target.value})} className="bg-white resize-none" /></div>
                    </div>
                    <div className="space-y-2">
                      <Label>Image d'arrière-plan principale</Label>
                      <div className="h-32 w-full bg-slate-200 rounded-lg overflow-hidden border relative">
                        {homeConfig.heroImage ? <img src={homeConfig.heroImage} className="w-full h-full object-cover" alt="Hero"/> : <div className="flex h-full items-center justify-center text-slate-400"><ImageIcon className="h-8 w-8"/></div>}
                      </div>
                      <Input type="file" className="text-xs bg-white cursor-pointer" accept="image/*" onChange={(e) => handleFileUpload(e, 'config', 'heroImage')} disabled={uploading}/>
                    </div>
                  </div>
                </div>

                {/* Section Philosophie */}
                <div className="space-y-4 p-5 bg-emerald-50/50 rounded-xl border border-emerald-100">
                  <h4 className="font-bold text-sm uppercase tracking-wider text-emerald-800 flex items-center gap-2">
                    <span className="bg-emerald-600 text-white h-6 w-6 rounded-full flex items-center justify-center text-xs">2</span> 
                    Bloc Philosophie / Mission
                  </h4>
                  <div className="space-y-4">
                    <div className="space-y-2"><Label>Titre de la section</Label><Input value={homeConfig.philoTitle} onChange={(e) => setHomeConfig({...homeConfig, philoTitle: e.target.value})} className="bg-white" /></div>
                    <div className="space-y-2"><Label>Texte explicatif</Label><Textarea value={homeConfig.philoText} onChange={(e) => setHomeConfig({...homeConfig, philoText: e.target.value})} className="bg-white h-24" /></div>
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div className="space-y-2">
                        <Label className="text-xs">Image Illustrative 1</Label>
                        <div className="flex gap-2 items-center">
                          {homeConfig.philImage1 && <img src={homeConfig.philImage1} className="h-10 w-10 rounded object-cover border"/>}
                          <Input type="file" className="text-xs bg-white cursor-pointer" accept="image/*" onChange={(e) => handleFileUpload(e, 'config', 'philImage1')} disabled={uploading}/>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Image Illustrative 2</Label>
                        <div className="flex gap-2 items-center">
                          {homeConfig.philImage2 && <img src={homeConfig.philImage2} className="h-10 w-10 rounded object-cover border"/>}
                          <Input type="file" className="text-xs bg-white cursor-pointer" accept="image/*" onChange={(e) => handleFileUpload(e, 'config', 'philImage2')} disabled={uploading}/>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section Services */}
                <div className="space-y-4 p-5 bg-amber-50/50 rounded-xl border border-amber-100">
                  <h4 className="font-bold text-sm uppercase tracking-wider text-amber-800 flex items-center gap-2">
                    <span className="bg-amber-600 text-white h-6 w-6 rounded-full flex items-center justify-center text-xs">3</span> 
                    Services & Pied de page
                  </h4>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2"><Label>Petit badge coloré</Label><Input value={homeConfig.servicesBadge} onChange={(e) => setHomeConfig({...homeConfig, servicesBadge: e.target.value})} className="bg-white" /></div>
                    <div className="space-y-2"><Label>Titre de la section Services</Label><Input value={homeConfig.servicesTitle} onChange={(e) => setHomeConfig({...homeConfig, servicesTitle: e.target.value})} className="bg-white" /></div>
                    <div className="space-y-2"><Label>Titre d'appel à l'action (Bas)</Label><Input value={homeConfig.ctaTitle} onChange={(e) => setHomeConfig({...homeConfig, ctaTitle: e.target.value})} className="bg-white font-bold" /></div>
                  </div>
                </div>

              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminConfigPage;