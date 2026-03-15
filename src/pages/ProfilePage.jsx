import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, Linkedin, Github, Globe, Save, Camera, GraduationCap, Phone, Loader2, Plus, Trash2, Briefcase, BookOpen
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

// IMPORT DU PONT API SÉCURISÉ
import api from "@/api/axios";

const ProfilePage = () => {
  const { user, isAuthenticated, updateProfile, updateUserData } = useAuth();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Clé pour forcer le rechargement de l'image
  const [avatarKey, setAvatarKey] = useState(Date.now());
  
  const fileInputRef = useRef(null); 

  // Formulaire
  const [formData, setFormData] = useState({
    name: "", headline: "", location: "", bio: "", 
    university: "", phone: "", website: "", linkedin: "", github: "",
    experiences: [], 
    education: []
  });

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http') || imagePath.startsWith('data:')) return imagePath;
    const baseUrl = (process.env.REACT_APP_API_URL || import.meta.env.VITE_API_URL || '').replace(/\/api$/, '');
    return `${baseUrl}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
  };

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      navigate("/admin"); 
      toast.error("Le compte admin n'a pas de profil public.");
    }
  }, [user, isAuthenticated, navigate]);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        headline: user.headline || "",
        location: user.location || "",
        bio: user.bio || "",
        experiences: Array.isArray(user.experiences) ? user.experiences : [], 
        education: Array.isArray(user.education) ? user.education : [], 
        university: user.university || "", 
        phone: user.phone || "",
        website: user.website || "",
        linkedin: user.linkedin || "",
        github: user.github || ""
      });
    }
  }, [user]);

  // --- GESTION PHOTO ---
  const handleImageClick = () => fileInputRef.current.click();

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("L'image est trop lourde (max 5Mo)");
      return;
    }

    const uploadData = new FormData();
    uploadData.append('image', file); 
    
    const toastId = toast.loading("Mise à jour de la photo...");

    try {
      const uploadRes = await api.post('/upload', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const imageUrl = typeof uploadRes.data === 'string' ? uploadRes.data : uploadRes.data.url;
      const userId = user.id || user._id;

      await api.post(`/users/upload-avatar/${userId}`, { avatar: imageUrl });
      
      updateUserData({ avatar: imageUrl });
      setAvatarKey(Date.now());
      
      toast.success("Photo mise à jour avec succès !", { id: toastId });
    } catch (error) {
      console.error("Erreur upload:", error);
      toast.error("Erreur lors de l'envoi de l'image.", { id: toastId });
    } finally {
      e.target.value = ""; 
    }
  };

  // --- GESTION DES EXPÉRIENCES ---
  const addExperience = () => {
    setFormData({ ...formData, experiences: [...formData.experiences, { company: "", position: "", period: "" }] });
  };
  const removeExperience = (index) => {
    setFormData({ ...formData, experiences: formData.experiences.filter((_, i) => i !== index) });
  };
  const updateExperience = (index, field, value) => {
    const newExp = [...formData.experiences];
    newExp[index][field] = value;
    setFormData({ ...formData, experiences: newExp });
  };

  // --- GESTION DES DIPLÔMES ---
  const addEducation = () => {
    setFormData({ ...formData, education: [...formData.education, { school: "", degree: "", year: "" }] });
  };
  const removeEducation = (index) => {
    setFormData({ ...formData, education: formData.education.filter((_, i) => i !== index) });
  };
  const updateEducation = (index, field, value) => {
    const newEdu = [...formData.education];
    newEdu[index][field] = value;
    setFormData({ ...formData, education: newEdu });
  };

  // --- SAUVEGARDE ---
  const handleSave = async () => {
    setLoading(true);
    try {
      const result = await updateProfile(formData);
      if (result.success) {
        toast.success("Profil mis à jour !");
        setIsEditing(false);
      } else {
        toast.error(result.error || "Erreur.");
      }
    } catch (error) {
      toast.error("Erreur serveur.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 md:pt-24 pb-12 md:pb-20 bg-slate-50">
      <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
        {/* Input fichier caché pour l'avatar */}
        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />

        {/* EN-TÊTE PROFIL */}
        <div className="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-slate-100 overflow-hidden mb-6 md:mb-8">
          <div className="h-24 md:h-32 bg-[#0A2A5C] relative">
             <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
          </div>
          
          <div className="px-5 md:px-8 pb-6 md:pb-8">
            <div className="relative flex flex-col md:flex-row md:justify-between items-center md:items-end -mt-12 md:-mt-12 mb-4 md:mb-6 gap-4 md:gap-0">
              <div className="relative group shrink-0">
                <Avatar className="w-24 h-24 md:w-32 md:h-32 border-4 border-white shadow-lg bg-white">
                  <AvatarImage 
                    src={user?.avatar ? `${getImageUrl(user.avatar)}?t=${avatarKey}` : ""} 
                    className="object-cover" 
                    key={avatarKey} 
                  />
                  <AvatarFallback className="text-2xl md:text-3xl bg-slate-200 text-slate-500 font-bold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <Button size="icon" variant="secondary" onClick={handleImageClick} className="absolute bottom-0 right-0 rounded-full shadow-md h-8 w-8 hover:bg-slate-200">
                    <Camera className="h-4 w-4 text-slate-700" />
                </Button>
              </div>
              
              <div className="flex gap-2 md:gap-3 w-full md:w-auto mt-2 md:mt-0">
                {isEditing ? (
                  <>
                    <Button variant="outline" onClick={() => setIsEditing(false)} className="w-full md:w-auto h-10 md:h-10 text-sm md:text-base">Annuler</Button>
                    <Button onClick={handleSave} className="w-full md:w-auto bg-[#0A2A5C] text-white hover:bg-[#0A2A5C]/90 h-10 md:h-10 text-sm md:text-base" disabled={loading}>
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="w-4 h-4 md:mr-2" /> <span className="hidden md:inline">Enregistrer</span></>}
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => setIsEditing(true)} variant="outline" className="w-full md:w-auto h-10 md:h-10 text-sm md:text-base">Modifier mon profil</Button>
                )}
              </div>
            </div>

            <div className="text-center md:text-left">
              <div className="flex flex-col md:flex-row items-center gap-2 md:gap-3 mb-2 md:mb-1">
                <h1 className="text-2xl md:text-3xl font-bold font-display text-slate-900">{formData.name || user?.name}</h1>
                <Badge variant="secondary" className="bg-[#FFD700]/20 text-amber-700 border-0 text-[10px] md:text-xs px-2 py-0.5 md:px-2.5 md:py-0.5">
                  <GraduationCap className="w-3 h-3 mr-1" /> Promo {user?.generation || "N/A"}
                </Badge>
              </div>
              
              <p className="text-sm md:text-lg text-slate-600 mb-3 md:mb-2 leading-snug">
                {formData.headline || "Membre du CALSED"} 
                {formData.experiences.length > 0 && (
                    <span className="font-semibold text-[#0A2A5C] block sm:inline"> chez {formData.experiences[0].company}</span>
                )}
              </p>
              
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 md:gap-4 text-slate-500 text-xs md:text-sm">
                <span className="flex items-center gap-1 bg-slate-50 md:bg-transparent px-2 py-1 md:p-0 rounded-md border border-slate-100 md:border-0"><MapPin className="w-3.5 h-3.5 md:w-4 md:h-4" /> {formData.location || "Non renseigné"}</span>
                {formData.phone && <span className="flex items-center gap-1 text-[#0A2A5C] font-medium bg-slate-50 md:bg-transparent px-2 py-1 md:p-0 rounded-md border border-slate-100 md:border-0"><Phone className="w-3.5 h-3.5 md:w-4 md:h-4" /> {formData.phone}</span>}
              </div>
            </div>
          </div>
        </div>

        {/* CONTENU PRINCIPAL */}
        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          <div className="md:col-span-2 space-y-6">
            
            {/* CARTE INFOS GÉNÉRALES */}
            <Card className="border-0 shadow-sm rounded-2xl md:rounded-xl">
              <CardHeader className="p-5 md:p-6 pb-2 md:pb-4"><CardTitle className="text-lg md:text-xl text-[#0A2A5C]">Informations & Bio</CardTitle></CardHeader>
              <CardContent className="p-5 md:p-6 pt-0">
                {isEditing ? (
                  <div className="space-y-4 md:space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5 md:space-y-2">
                            <Label className="text-xs md:text-sm font-bold text-slate-600">Nom complet</Label>
                            <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="h-11 md:h-10 bg-slate-50" />
                        </div>
                        <div className="space-y-1.5 md:space-y-2">
                            <Label className="text-xs md:text-sm font-bold text-slate-600 flex items-center gap-2"><Phone className="w-3 h-3" /> Téléphone</Label>
                            <Input value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} className="h-11 md:h-10 bg-slate-50" />
                        </div>
                    </div>
                    <div className="space-y-1.5 md:space-y-2">
                      <Label className="text-xs md:text-sm font-bold text-slate-600">Titre (Headline)</Label>
                      <Input placeholder="Ex: Data Scientist / Étudiant M2" value={formData.headline} onChange={(e) => setFormData({...formData, headline: e.target.value})} className="h-11 md:h-10 bg-slate-50" />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5 md:space-y-2">
                            <Label className="text-xs md:text-sm font-bold text-slate-600 flex items-center gap-2"><MapPin className="w-3 h-3" /> Localisation</Label>
                            <Input value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} className="h-11 md:h-10 bg-slate-50" />
                        </div>
                        <div className="space-y-1.5 md:space-y-2">
                            <Label className="text-xs md:text-sm font-bold text-slate-600 flex items-center gap-2"><GraduationCap className="w-3 h-3" /> Université Actuelle</Label>
                            <Input value={formData.university} onChange={(e) => setFormData({...formData, university: e.target.value})} className="h-11 md:h-10 bg-slate-50" />
                        </div>
                    </div>
                    <div className="space-y-1.5 md:space-y-2">
                      <Label className="text-xs md:text-sm font-bold text-slate-600">Bio</Label>
                      <Textarea placeholder="Présentez-vous..." value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} rows={4} className="bg-slate-50 resize-none text-sm" />
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-600 leading-relaxed whitespace-pre-line text-sm md:text-base">
                    {formData.bio || <span className="italic text-slate-400">Aucune biographie renseignée.</span>}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* EXPÉRIENCES PROFESSIONNELLES */}
            <Card className="border-0 shadow-sm rounded-2xl md:rounded-xl">
              <CardHeader className="flex flex-row items-center justify-between p-5 md:p-6 pb-2 md:pb-4 gap-2">
                 <div className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-[#0A2A5C]" />
                    <CardTitle className="text-lg md:text-xl text-[#0A2A5C]">Expériences</CardTitle>
                 </div>
                 {isEditing && (
                    <Button onClick={addExperience} size="sm" variant="outline" className="text-[#0A2A5C] border-[#0A2A5C] h-8 md:h-9 px-2 md:px-3">
                        <Plus className="w-4 h-4 md:mr-1" /> <span className="hidden sm:inline">Ajouter</span>
                    </Button>
                 )}
              </CardHeader>
              <CardContent className="p-5 md:p-6 pt-0">
                {isEditing ? (
                    <div className="space-y-4 md:space-y-5">
                        {formData.experiences.map((exp, index) => (
                            <div key={index} className="p-4 md:p-5 bg-slate-50 rounded-xl border border-slate-200 relative group">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 mb-3 md:mb-4">
                                    <div>
                                        <Label className="text-[10px] md:text-xs text-slate-500 mb-1.5 block uppercase tracking-wider font-bold">Entreprise</Label>
                                        <Input value={exp.company} onChange={(e) => updateExperience(index, 'company', e.target.value)} className="bg-white h-11 md:h-10 text-sm"/>
                                    </div>
                                    <div>
                                        <Label className="text-[10px] md:text-xs text-slate-500 mb-1.5 block uppercase tracking-wider font-bold">Période</Label>
                                        <Input value={exp.period} onChange={(e) => updateExperience(index, 'period', e.target.value)} className="bg-white h-11 md:h-10 text-sm" placeholder="Ex: 2021 - Présent" />
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-[10px] md:text-xs text-slate-500 mb-1.5 block uppercase tracking-wider font-bold">Poste / Rôle</Label>
                                    <Input value={exp.position} onChange={(e) => updateExperience(index, 'position', e.target.value)} className="bg-white h-11 md:h-10 text-sm"/>
                                </div>
                                {/* Bouton Delete toujours visible sur mobile, hover sur desktop */}
                                <Button size="icon" variant="destructive" className="absolute -top-3 -right-3 md:-top-2 md:-right-2 h-8 w-8 md:h-7 md:w-7 rounded-full shadow-md md:opacity-0 md:group-hover:opacity-100 transition-opacity z-10" onClick={() => removeExperience(index)}>
                                    <Trash2 className="h-4 w-4 md:h-3.5 md:w-3.5" />
                                </Button>
                            </div>
                        ))}
                        {formData.experiences.length === 0 && <p className="text-sm text-slate-400 italic text-center py-4 bg-slate-50 rounded-xl border border-dashed">Aucune expérience ajoutée.</p>}
                    </div>
                ) : (
                    <div className="space-y-6">
                        {formData.experiences.length > 0 ? (
                            <div className="relative border-l-2 border-slate-100 ml-2 md:ml-3 space-y-6 md:space-y-8 py-2">
                                {formData.experiences.map((exp, index) => (
                                    <div key={index} className="relative pl-5 md:pl-6">
                                        <div className="absolute -left-[9px] top-1.5 md:top-1 w-4 h-4 bg-white border-2 border-[#0A2A5C] rounded-full" />
                                        <h4 className="font-bold text-slate-800 text-base md:text-lg leading-none mb-1 md:mb-1.5">{exp.company}</h4>
                                        <p className="text-[#0A2A5C] font-medium text-sm md:text-base mb-1.5">{exp.position}</p>
                                        <span className="text-[10px] md:text-xs font-semibold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">{exp.period}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-slate-400 italic text-sm md:text-base">Aucune expérience renseignée.</div>
                        )}
                    </div>
                )}
              </CardContent>
            </Card>

            {/* PARCOURS ACADÉMIQUE */}
            <Card className="border-0 shadow-sm rounded-2xl md:rounded-xl">
              <CardHeader className="flex flex-row items-center justify-between p-5 md:p-6 pb-2 md:pb-4 gap-2">
                 <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-[#0A2A5C]" />
                    <CardTitle className="text-lg md:text-xl text-[#0A2A5C]">Parcours Académique</CardTitle>
                 </div>
                 {isEditing && (
                    <Button onClick={addEducation} size="sm" variant="outline" className="text-[#0A2A5C] border-[#0A2A5C] h-8 md:h-9 px-2 md:px-3">
                        <Plus className="w-4 h-4 md:mr-1" /> <span className="hidden sm:inline">Ajouter</span>
                    </Button>
                 )}
              </CardHeader>
              <CardContent className="p-5 md:p-6 pt-0">
                {isEditing ? (
                  <div className="space-y-4 md:space-y-5">
                      {formData.education.map((edu, index) => (
                          <div key={index} className="p-4 md:p-5 bg-slate-50 rounded-xl border border-slate-200 relative group">
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 mb-3 md:mb-4">
                                  <div>
                                      <Label className="text-[10px] md:text-xs text-slate-500 mb-1.5 block uppercase tracking-wider font-bold">École / Université</Label>
                                      <Input placeholder="Ex: ESP" value={edu.school} onChange={(e) => updateEducation(index, 'school', e.target.value)} className="bg-white h-11 md:h-10 text-sm"/>
                                  </div>
                                  <div>
                                      <Label className="text-[10px] md:text-xs text-slate-500 mb-1.5 block uppercase tracking-wider font-bold">Année / Période</Label>
                                      <Input placeholder="Ex: 2024" value={edu.year} onChange={(e) => updateEducation(index, 'year', e.target.value)} className="bg-white h-11 md:h-10 text-sm"/>
                                  </div>
                              </div>
                              <div>
                                  <Label className="text-[10px] md:text-xs text-slate-500 mb-1.5 block uppercase tracking-wider font-bold">Diplôme / Filière</Label>
                                  <Input placeholder="Ex: Master Data Science" value={edu.degree} onChange={(e) => updateEducation(index, 'degree', e.target.value)} className="bg-white h-11 md:h-10 text-sm"/>
                              </div>
                              <Button size="icon" variant="destructive" className="absolute -top-3 -right-3 md:-top-2 md:-right-2 h-8 w-8 md:h-7 md:w-7 rounded-full shadow-md md:opacity-0 md:group-hover:opacity-100 transition-opacity z-10" onClick={() => removeEducation(index)}>
                                  <Trash2 className="h-4 w-4 md:h-3.5 md:w-3.5" />
                              </Button>
                          </div>
                      ))}
                      {formData.education.length === 0 && <p className="text-sm text-slate-400 italic text-center py-4 bg-slate-50 rounded-xl border border-dashed">Aucun diplôme ajouté.</p>}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {formData.education.length > 0 ? (
                        <div className="relative border-l-2 border-slate-100 ml-2 md:ml-3 space-y-6 md:space-y-8 py-2">
                            {formData.education.map((edu, index) => (
                                <div key={index} className="relative pl-5 md:pl-6">
                                    <div className="absolute -left-[9px] top-1.5 md:top-1 w-4 h-4 bg-white border-2 border-slate-300 rounded-full" />
                                    <h4 className="font-bold text-slate-800 text-base md:text-lg leading-none mb-1 md:mb-1.5">{edu.school}</h4>
                                    <p className="text-slate-600 font-medium text-sm md:text-base mb-1.5">{edu.degree}</p>
                                    <span className="text-[10px] md:text-xs font-semibold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">{edu.year}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                      <div className="text-slate-400 italic text-sm md:text-base">Aucun parcours renseigné.</div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* COLONNE DROITE : RÉSEAUX */}
          <div className="space-y-6">
            <Card className="border-0 shadow-sm rounded-2xl md:rounded-xl md:sticky md:top-24">
              <CardHeader className="p-5 md:p-6 pb-2 md:pb-3 border-b border-slate-50">
                <CardTitle className="text-base md:text-lg font-bold text-[#0A2A5C]">Sur le web</CardTitle>
              </CardHeader>
              <CardContent className="p-5 md:p-6 pt-4 space-y-3 md:space-y-4">
                {isEditing ? (
                  <div className="space-y-3 md:space-y-4">
                    <div className="flex flex-col gap-1.5">
                        <Label className="text-[10px] md:text-xs font-bold text-slate-500 flex items-center gap-2"><Linkedin className="w-3.5 h-3.5" /> Profil LinkedIn</Label>
                        <Input value={formData.linkedin} onChange={(e) => setFormData({...formData, linkedin: e.target.value})} placeholder="https://linkedin.com/in/..." className="h-11 md:h-10 bg-slate-50" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <Label className="text-[10px] md:text-xs font-bold text-slate-500 flex items-center gap-2"><Github className="w-3.5 h-3.5" /> Compte GitHub</Label>
                        <Input value={formData.github} onChange={(e) => setFormData({...formData, github: e.target.value})} placeholder="https://github.com/..." className="h-11 md:h-10 bg-slate-50" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <Label className="text-[10px] md:text-xs font-bold text-slate-500 flex items-center gap-2"><Globe className="w-3.5 h-3.5" /> Site Personnel</Label>
                        <Input value={formData.website} onChange={(e) => setFormData({...formData, website: e.target.value})} placeholder="https://..." className="h-11 md:h-10 bg-slate-50" />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-row md:flex-col flex-wrap gap-2 md:gap-3">
                    {formData.linkedin ? (
                        <a href={formData.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-2 md:gap-3 text-slate-600 hover:text-[#0077b5] group transition-colors p-2 hover:bg-[#0077b5]/5 rounded-lg w-fit md:w-full">
                            <Linkedin className="w-4 h-4 md:w-5 md:h-5 text-blue-700" /> <span className="text-xs md:text-sm font-medium">LinkedIn</span>
                        </a>
                    ) : <span className="text-xs md:text-sm text-slate-400 italic block w-full">LinkedIn non renseigné</span>}

                    {formData.github ? (
                        <a href={formData.github} target="_blank" rel="noreferrer" className="flex items-center gap-2 md:gap-3 text-slate-600 hover:text-black group transition-colors p-2 hover:bg-slate-100 rounded-lg w-fit md:w-full">
                            <Github className="w-4 h-4 md:w-5 md:h-5 text-slate-800" /> <span className="text-xs md:text-sm font-medium">GitHub</span>
                        </a>
                    ) : <span className="text-xs md:text-sm text-slate-400 italic block w-full">GitHub non renseigné</span>}

                    {formData.website ? (
                        <a href={formData.website} target="_blank" rel="noreferrer" className="flex items-center gap-2 md:gap-3 text-slate-600 hover:text-[#0A2A5C] group transition-colors p-2 hover:bg-[#0A2A5C]/5 rounded-lg w-fit md:w-full">
                            <Globe className="w-4 h-4 md:w-5 md:h-5 text-slate-500" /> <span className="text-xs md:text-sm font-medium">Site Web</span>
                        </a>
                    ) : <span className="text-xs md:text-sm text-slate-400 italic block w-full">Site web non renseigné</span>}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;