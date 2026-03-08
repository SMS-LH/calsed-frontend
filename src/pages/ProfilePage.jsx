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
  
  // NOUVEAU : Clé pour forcer le rechargement de l'image
  const [avatarKey, setAvatarKey] = useState(Date.now());
  
  const fileInputRef = useRef(null); 

  // Formulaire
  const [formData, setFormData] = useState({
    name: "", headline: "", location: "", bio: "", 
    university: "", phone: "", website: "", linkedin: "", github: "",
    experiences: [], 
    education: []
  });

  // --- CORRECTION DÉPLOIEMENT : Gestion sécurisée des URLs d'images ---
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http') || imagePath.startsWith('data:')) return imagePath;
    const baseUrl = (process.env.REACT_APP_API_URL || import.meta.env.VITE_API_URL || '').replace(/\/api$/, '');
    return `${baseUrl}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
  };

  // --- SÉCURITÉ ---
  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      navigate("/admin"); 
      toast.error("Le compte admin n'a pas de profil public.");
    }
  }, [user, isAuthenticated, navigate]);

  // --- CHARGEMENT DES DONNÉES ---
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

    if (file.size > 2 * 1024 * 1024) {
      toast.error("L'image est trop lourde (max 2Mo)");
      return;
    }

    const data = new FormData();
    data.append('image', file); 
    
    const toastId = toast.loading("Mise à jour de la photo...");

    try {
      // APPEL AXIOS (Gère automatiquement le FormData et les headers multipart)
      const response = await api.post(`/upload/avatar/${user.id || user._id}`, data);
      
      const result = response.data;
      
      // 1. Mise à jour du contexte
      updateUserData({ avatar: result.avatar });
      
      // 2. Mise à jour de la clé pour forcer l'affichage immédiat
      setAvatarKey(Date.now());
      
      toast.success("Photo mise à jour !", { id: toastId });
    } catch (error) {
      console.error("Erreur upload:", error);
      const errorMsg = error.response?.data?.message || "Erreur lors de l'envoi";
      toast.error(errorMsg, { id: toastId });
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
    <div className="min-h-screen pt-24 pb-12 bg-slate-50">
      <div className="container mx-auto px-4 max-w-4xl">
        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />

        {/* EN-TÊTE PROFIL */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden mb-8">
          <div className="h-32 bg-[#0A2A5C] relative">
             <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
          </div>
          
          <div className="px-8 pb-8">
            <div className="relative flex justify-between items-end -mt-12 mb-6">
              <div className="relative group">
                <Avatar className="w-32 h-32 border-4 border-white shadow-lg bg-white">
                  {/* Utilisation de getImageUrl() */}
                  <AvatarImage 
                    src={user?.avatar ? `${getImageUrl(user.avatar)}?t=${avatarKey}` : ""} 
                    className="object-cover" 
                    key={avatarKey} 
                  />
                  <AvatarFallback className="text-3xl bg-slate-200 text-slate-500 font-bold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <Button size="icon" variant="secondary" onClick={handleImageClick} className="absolute bottom-0 right-0 rounded-full shadow-md h-8 w-8 hover:bg-slate-200">
                    <Camera className="h-4 w-4 text-slate-700" />
                </Button>
              </div>
              
              <div className="flex gap-3">
                {isEditing ? (
                  <>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>Annuler</Button>
                    <Button onClick={handleSave} className="bg-[#0A2A5C] text-white hover:bg-[#0A2A5C]/90" disabled={loading}>
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Save className="w-4 h-4 mr-2" /> Enregistrer</>}
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => setIsEditing(true)} variant="outline">Modifier mon profil</Button>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-3xl font-bold font-display text-slate-900">{formData.name || user?.name}</h1>
                <Badge variant="secondary" className="bg-[#FFD700]/20 text-amber-700 border-0">
                  <GraduationCap className="w-3 h-3 mr-1" /> Promo {user?.generation || "N/A"}
                </Badge>
              </div>
              
              <p className="text-lg text-slate-600 mb-2">
                {formData.headline || "Membre du CALSED"} 
                {formData.experiences.length > 0 && (
                    <span className="font-semibold text-[#0A2A5C]"> chez {formData.experiences[0].company}</span>
                )}
              </p>
              
              <div className="flex flex-wrap items-center gap-4 text-slate-500 text-sm">
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {formData.location || "Non renseigné"}</span>
                {formData.phone && <span className="flex items-center gap-1 text-[#0A2A5C] font-medium"><Phone className="w-4 h-4" /> {formData.phone}</span>}
              </div>
            </div>
          </div>
        </div>

        {/* CONTENU PRINCIPAL */}
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            
            {/* CARTE INFOS GÉNÉRALES */}
            <Card className="border-0 shadow-sm">
              <CardHeader><CardTitle>Informations & Bio</CardTitle></CardHeader>
              <CardContent>
                {isEditing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label className="mb-2 block">Nom complet</Label>
                            <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                        </div>
                        <div>
                            <Label className="mb-2 block flex items-center gap-2"><Phone className="w-3 h-3" /> Téléphone</Label>
                            <Input value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                        </div>
                    </div>
                    <div>
                      <Label className="mb-2 block">Titre (Headline)</Label>
                      <Input placeholder="Ex: Data Scientist / Étudiant M2" value={formData.headline} onChange={(e) => setFormData({...formData, headline: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label className="mb-2 block flex items-center gap-2"><MapPin className="w-3 h-3" /> Localisation</Label>
                            <Input value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} />
                        </div>
                        <div>
                            <Label className="mb-2 block flex items-center gap-2"><GraduationCap className="w-3 h-3" /> Université Actuelle</Label>
                            <Input value={formData.university} onChange={(e) => setFormData({...formData, university: e.target.value})} />
                        </div>
                    </div>
                    <div>
                      <Label className="mb-2 block">Bio</Label>
                      <Textarea placeholder="Présentez-vous..." value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} rows={3} />
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                    {formData.bio || "Aucune biographie renseignée."}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* EXPÉRIENCES PROFESSIONNELLES */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                 <div className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-[#0A2A5C]" />
                    <CardTitle>Expériences Professionnelles</CardTitle>
                 </div>
                 {isEditing && (
                    <Button onClick={addExperience} size="sm" variant="outline" className="text-[#0A2A5C] border-[#0A2A5C]">
                        <Plus className="w-4 h-4 mr-1" /> Ajouter
                    </Button>
                 )}
              </CardHeader>
              <CardContent>
                {isEditing ? (
                    <div className="space-y-4">
                        {formData.experiences.map((exp, index) => (
                            <div key={index} className="p-4 bg-slate-50 rounded-lg border border-slate-200 relative group">
                                <div className="grid grid-cols-2 gap-4 mb-3">
                                    <div>
                                        <Label className="text-xs text-slate-500 mb-1 block">Entreprise</Label>
                                        <Input value={exp.company} onChange={(e) => updateExperience(index, 'company', e.target.value)} className="bg-white h-9"/>
                                    </div>
                                    <div>
                                        <Label className="text-xs text-slate-500 mb-1 block">Période</Label>
                                        <Input value={exp.period} onChange={(e) => updateExperience(index, 'period', e.target.value)} className="bg-white h-9"/>
                                    </div>
                                </div>
                                <div>
                                    <Label className="text-xs text-slate-500 mb-1 block">Poste / Rôle</Label>
                                    <Input value={exp.position} onChange={(e) => updateExperience(index, 'position', e.target.value)} className="bg-white h-9"/>
                                </div>
                                <Button size="icon" variant="destructive" className="absolute -top-2 -right-2 h-6 w-6 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeExperience(index)}>
                                    <Trash2 className="h-3 w-3" />
                                </Button>
                            </div>
                        ))}
                        {formData.experiences.length === 0 && <p className="text-sm text-slate-400 italic text-center">Aucune expérience ajoutée.</p>}
                    </div>
                ) : (
                    <div className="space-y-6">
                        {formData.experiences.length > 0 ? (
                            <div className="relative border-l-2 border-slate-100 ml-3 space-y-8 py-2">
                                {formData.experiences.map((exp, index) => (
                                    <div key={index} className="relative pl-6">
                                        <div className="absolute -left-[9px] top-1 w-4 h-4 bg-white border-2 border-[#0A2A5C] rounded-full" />
                                        <h4 className="font-bold text-slate-800 text-lg leading-none mb-1">{exp.company}</h4>
                                        <p className="text-[#0A2A5C] font-medium mb-1">{exp.position}</p>
                                        <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{exp.period}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-slate-400 italic">Aucune expérience renseignée.</div>
                        )}
                    </div>
                )}
              </CardContent>
            </Card>

            {/* PARCOURS ACADÉMIQUE */}
            <Card className="border-0 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                 <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-[#0A2A5C]" />
                    <CardTitle>Parcours Académique</CardTitle>
                 </div>
                 {isEditing && (
                    <Button onClick={addEducation} size="sm" variant="outline" className="text-[#0A2A5C] border-[#0A2A5C]">
                        <Plus className="w-4 h-4 mr-1" /> Ajouter
                    </Button>
                 )}
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <div className="space-y-4">
                      {formData.education.map((edu, index) => (
                          <div key={index} className="p-4 bg-slate-50 rounded-lg border border-slate-200 relative group">
                              <div className="grid grid-cols-2 gap-4 mb-3">
                                  <div>
                                      <Label className="text-xs text-slate-500 mb-1 block">École / Université</Label>
                                      <Input placeholder="Ex: ESP" value={edu.school} onChange={(e) => updateEducation(index, 'school', e.target.value)} className="bg-white h-9"/>
                                  </div>
                                  <div>
                                      <Label className="text-xs text-slate-500 mb-1 block">Année / Période</Label>
                                      <Input placeholder="Ex: 2024" value={edu.year} onChange={(e) => updateEducation(index, 'year', e.target.value)} className="bg-white h-9"/>
                                  </div>
                              </div>
                              <div>
                                  <Label className="text-xs text-slate-500 mb-1 block">Diplôme / Filière</Label>
                                  <Input placeholder="Ex: Master Data Science" value={edu.degree} onChange={(e) => updateEducation(index, 'degree', e.target.value)} className="bg-white h-9"/>
                              </div>
                              <Button size="icon" variant="destructive" className="absolute -top-2 -right-2 h-6 w-6 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeEducation(index)}>
                                  <Trash2 className="h-3 w-3" />
                              </Button>
                          </div>
                      ))}
                      {formData.education.length === 0 && <p className="text-sm text-slate-400 italic text-center">Aucun diplôme ajouté.</p>}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {formData.education.length > 0 ? (
                        <div className="relative border-l-2 border-slate-100 ml-3 space-y-8 py-2">
                            {formData.education.map((edu, index) => (
                                <div key={index} className="relative pl-6">
                                    <div className="absolute -left-[9px] top-1 w-4 h-4 bg-white border-2 border-slate-300 rounded-full" />
                                    <h4 className="font-bold text-slate-800 text-lg leading-none mb-1">{edu.school}</h4>
                                    <p className="text-slate-600 font-medium mb-1">{edu.degree}</p>
                                    <span className="text-xs font-semibold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-full">{edu.year}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                      <div className="text-slate-400 italic">Aucun parcours renseigné.</div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* COLONNE DROITE : RÉSEAUX */}
          <div className="space-y-6">
            <Card className="border-0 shadow-sm">
              <CardHeader><CardTitle>Réseaux & Liens</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <>
                    <div className="flex items-center gap-3"><Linkedin className="w-5 h-5 text-blue-700 shrink-0" /><Input value={formData.linkedin} onChange={(e) => setFormData({...formData, linkedin: e.target.value})} placeholder="URL LinkedIn" /></div>
                    <div className="flex items-center gap-3"><Github className="w-5 h-5 text-slate-800 shrink-0" /><Input value={formData.github} onChange={(e) => setFormData({...formData, github: e.target.value})} placeholder="URL GitHub" /></div>
                    <div className="flex items-center gap-3"><Globe className="w-5 h-5 text-slate-500 shrink-0" /><Input value={formData.website} onChange={(e) => setFormData({...formData, website: e.target.value})} placeholder="Site Web Perso" /></div>
                  </>
                ) : (
                  <div className="space-y-4">
                    {formData.linkedin ? (
                        <a href={formData.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-slate-600 hover:text-[#0A2A5C] group transition-colors">
                            <Linkedin className="w-5 h-5 text-blue-700" /> <span className="text-sm font-medium">LinkedIn</span>
                        </a>
                    ) : <span className="text-sm text-slate-400 italic block">LinkedIn non renseigné</span>}

                    {formData.github ? (
                        <a href={formData.github} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-slate-600 hover:text-[#0A2A5C] group transition-colors">
                            <Github className="w-5 h-5 text-slate-800" /> <span className="text-sm font-medium">GitHub</span>
                        </a>
                    ) : <span className="text-sm text-slate-400 italic block">GitHub non renseigné</span>}

                    {formData.website ? (
                        <a href={formData.website} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-slate-600 hover:text-[#0A2A5C] group transition-colors">
                            <Globe className="w-5 h-5 text-slate-500" /> <span className="text-sm font-medium">Site Web</span>
                        </a>
                    ) : <span className="text-sm text-slate-400 italic block">Site web non renseigné</span>}
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