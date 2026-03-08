import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, Linkedin, Github, Globe, ArrowLeft, Mail, Phone, Briefcase, GraduationCap 
} from "lucide-react";

// IMPORT DU PONT API SÉCURISÉ
import api from "@/api/axios";

const MemberProfilePage = () => {
  const { id } = useParams();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);

  // --- CORRECTION DÉPLOIEMENT : Gestion sécurisée des URLs d'images ---
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http') || imagePath.startsWith('data:')) return imagePath;
    const baseUrl = (process.env.REACT_APP_API_URL || import.meta.env.VITE_API_URL || '').replace(/\/api$/, '');
    return `${baseUrl}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
  };

  useEffect(() => {
    const fetchMember = async () => {
      try {
        // APPEL AXIOS
        const res = await api.get(`/users/${id}`);
        setMember(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMember();
  }, [id]);

  if (loading) return <div className="min-h-screen pt-32 text-center text-slate-500 flex items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-[#0A2A5C] border-t-transparent rounded-full"></div></div>;
  if (!member) return <div className="min-h-screen pt-32 text-center text-red-500 font-medium">Ce profil est introuvable.</div>;

  const hasSocials = member.linkedin || member.github || member.website;

  return (
    <div className="min-h-screen pt-24 pb-12 bg-slate-50 font-sans">
      <div className="container mx-auto px-4 max-w-5xl">
        <Link to="/annuaire" className="inline-block mb-6">
          <Button variant="ghost" className="text-slate-600 hover:text-[#0A2A5C] hover:bg-slate-100 pl-0">
            <ArrowLeft className="mr-2 h-4 w-4"/> Retour à l'annuaire
          </Button>
        </Link>

        {/* HEADER PROFIL */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden mb-8">
          
          {/* Bannière Bleue */}
          <div className="h-40 bg-[#0A2A5C] relative overflow-hidden">
             <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
             <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#FFD700]/10 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4" />
          </div>
          
          <div className="px-8 pb-8">
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-end">
              
              {/* Avatar (Remonte sur la bannière grâce à -mt-16) */}
              <div className="-mt-16 shrink-0 mx-auto md:mx-0 relative">
                <Avatar className="w-32 h-32 border-4 border-white shadow-lg bg-white">
                  {/* AJOUT DE getImageUrl() POUR L'AVATAR */}
                  <AvatarImage src={getImageUrl(member.avatar)} className="object-cover" />
                  <AvatarFallback className="text-3xl bg-slate-100 text-[#0A2A5C] font-bold font-display">
                      {member.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
              
              {/* Infos Texte (Reste sur le blanc) */}
              <div className="text-center md:text-left flex-1 pt-2 md:pt-0 md:mb-2">
                  <div className="flex flex-col md:flex-row items-center md:items-center gap-2 md:gap-4 mb-1">
                    <h1 className="text-3xl font-bold font-display text-slate-900">{member.name}</h1>
                    <Badge variant="secondary" className="bg-[#0A2A5C]/5 text-[#0A2A5C] border border-[#0A2A5C]/10 px-3 py-0.5">
                      Promo {member.generation || "N/A"}
                    </Badge>
                  </div>
                  
                  {member.headline && (
                    <p className="text-lg text-slate-600 font-medium mb-2">
                        {member.headline}
                    </p>
                  )}
                  
                  {member.location && (
                    <div className="flex items-center justify-center md:justify-start gap-1.5 text-slate-500 text-sm">
                      <MapPin className="w-4 h-4 text-slate-400" /> {member.location}
                    </div>
                  )}
              </div>

              {/* Boutons Actions (Alignés à droite) */}
              <div className="flex gap-3 w-full md:w-auto justify-center md:justify-end shrink-0 md:mb-4">
                 {member.email && (
                    <a href={`mailto:${member.email}`}>
                        <Button className="bg-[#0A2A5C] text-white hover:bg-[#0A2A5C]/90 shadow-sm px-5">
                            <Mail className="h-4 w-4 mr-2" /> Contacter
                        </Button>
                    </a>
                 )}
                 {member.phone && (
                    <a href={`tel:${member.phone}`}>
                        <Button variant="outline" className="border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-[#0A2A5C]">
                            <Phone className="h-4 w-4 mr-2" /> Appeler
                        </Button>
                    </a>
                 )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          
          {/* COLONNE GAUCHE (BIO & PARCOURS) */}
          <div className="md:col-span-2 space-y-8">
            
            {/* À PROPOS - Affiché uniquement si bio existe */}
            {member.bio && (
                <section>
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <span className="w-1 h-6 bg-[#FFD700] rounded-full block"></span>
                        À propos
                    </h3>
                    <Card className="border-0 shadow-sm bg-white">
                        <CardContent className="pt-6">
                            <p className="text-slate-600 leading-relaxed whitespace-pre-line text-base">
                                {member.bio}
                            </p>
                        </CardContent>
                    </Card>
                </section>
            )}
            
            {/* PARCOURS PROFESSIONNEL */}
            {(member.experiences?.length > 0 || member.company) && (
                <section>
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <span className="w-1 h-6 bg-[#0A2A5C] rounded-full block"></span>
                        Expérience Professionnelle
                    </h3>
                    <Card className="border-0 shadow-sm bg-white">
                        <CardContent className="pt-6">
                            {member.experiences && member.experiences.length > 0 ? (
                                <div className="space-y-8 relative border-l-2 border-slate-100 ml-2 py-1">
                                    {member.experiences.map((exp, index) => (
                                        <div key={index} className="pl-6 relative">
                                            <div className="absolute -left-[9px] top-1.5 w-4 h-4 bg-white border-2 border-[#0A2A5C] rounded-full" />
                                            <h4 className="font-bold text-slate-900 text-lg">{exp.company}</h4>
                                            <p className="text-[#0A2A5C] font-medium mb-1">{exp.position}</p>
                                            <span className="text-xs font-semibold text-slate-500 bg-slate-50 px-2 py-0.5 rounded">
                                                {exp.period}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-[#0A2A5C]">
                                        <Briefcase className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900">{member.company}</h4>
                                        <p className="text-slate-500 text-sm">Poste actuel</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </section>
            )}

            {/* FORMATION */}
            {(member.university || member.education) && (
                <section>
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <span className="w-1 h-6 bg-slate-300 rounded-full block"></span>
                        Formation
                    </h3>
                    <Card className="border-0 shadow-sm bg-white">
                        <CardContent className="pt-6">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-500 mt-1 shrink-0">
                                    <GraduationCap className="h-6 w-6" />
                                </div>
                                <div>
                                    {member.university && (
                                        <h4 className="font-bold text-slate-900 text-lg mb-1">{member.university}</h4>
                                    )}
                                    {member.education && (
                                        <p className="text-slate-600 leading-relaxed whitespace-pre-line text-sm">
                                            {member.education}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </section>
            )}
          </div>

          {/* COLONNE DROITE (SIDEBAR) */}
          <div className="space-y-6">
             {hasSocials && (
                 <Card className="border-0 shadow-sm sticky top-24">
                    <CardHeader className="pb-3 border-b border-slate-50">
                        <CardTitle className="text-base font-bold text-slate-800">Sur le web</CardTitle>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-3">
                        {member.linkedin && (
                            <a href={member.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-slate-600 hover:text-[#0077b5] transition-all p-2 hover:bg-[#0077b5]/5 rounded-lg group">
                                <Linkedin className="w-5 h-5 group-hover:scale-110 transition-transform"/> 
                                <span className="font-medium text-sm">LinkedIn</span>
                            </a>
                        )}

                        {member.github && (
                            <a href={member.github} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-slate-600 hover:text-black transition-all p-2 hover:bg-slate-100 rounded-lg group">
                                <Github className="w-5 h-5 group-hover:scale-110 transition-transform"/> 
                                <span className="font-medium text-sm">GitHub</span>
                            </a>
                        )}

                        {member.website && (
                            <a href={member.website} target="_blank" rel="noreferrer" className="flex items-center gap-3 text-slate-600 hover:text-[#0A2A5C] transition-all p-2 hover:bg-[#0A2A5C]/5 rounded-lg group">
                                <Globe className="w-5 h-5 group-hover:scale-110 transition-transform"/> 
                                <span className="font-medium text-sm">Site Personnel</span>
                            </a>
                        )}
                    </CardContent>
                 </Card>
             )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default MemberProfilePage;