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

  if (loading) return <div className="min-h-screen pt-32 text-center flex items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-[#0A2A5C] border-t-transparent rounded-full"></div></div>;
  if (!member) return <div className="min-h-screen pt-32 text-center text-red-500 font-medium px-4">Ce profil est introuvable.</div>;

  const hasSocials = member.linkedin || member.github || member.website;

  return (
    <div className="min-h-screen pt-20 md:pt-24 pb-12 bg-slate-50 font-sans">
      <div className="container mx-auto px-4 max-w-5xl">
        <Link to="/annuaire" className="inline-block mb-4 md:mb-6">
          <Button variant="ghost" className="text-slate-600 hover:text-[#0A2A5C] hover:bg-slate-100 pl-0 md:pl-2">
            <ArrowLeft className="mr-2 h-4 w-4"/> Retour à l'annuaire
          </Button>
        </Link>

        {/* HEADER PROFIL */}
        <div className="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-slate-100 overflow-hidden mb-6 md:mb-8">
          
          {/* Bannière Bleue */}
          <div className="h-32 md:h-40 bg-[#0A2A5C] relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96 bg-white/5 rounded-full blur-2xl md:blur-3xl -translate-y-1/2 translate-x-1/3" />
             <div className="absolute bottom-0 left-0 w-48 h-48 md:w-64 md:h-64 bg-[#FFD700]/10 rounded-full blur-xl md:blur-2xl translate-y-1/3 -translate-x-1/4" />
          </div>
          
          <div className="px-4 md:px-8 pb-6 md:pb-8">
            <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-center md:items-end text-center md:text-left">
              
              {/* Avatar */}
              <div className="-mt-12 md:-mt-16 shrink-0 relative z-10">
                <Avatar className="w-24 h-24 md:w-32 md:h-32 border-4 border-white shadow-lg bg-white">
                  <AvatarImage src={getImageUrl(member.avatar)} className="object-cover" />
                  <AvatarFallback className="text-2xl md:text-3xl bg-slate-100 text-[#0A2A5C] font-bold font-display">
                      {member.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
              
              {/* Infos Texte */}
              <div className="flex-1 w-full pt-1 md:pt-0 md:mb-2">
                  <div className="flex flex-col md:flex-row items-center md:items-center justify-center md:justify-start gap-2 md:gap-4 mb-2 md:mb-1">
                    <h1 className="text-2xl md:text-3xl font-bold font-display text-slate-900">{member.name}</h1>
                    <Badge variant="secondary" className="bg-[#0A2A5C]/5 text-[#0A2A5C] border border-[#0A2A5C]/10 px-2 md:px-3 py-0.5 text-[10px] md:text-xs">
                      Promo {member.generation || "N/A"}
                    </Badge>
                  </div>
                  
                  {member.headline && (
                    <p className="text-sm md:text-lg text-slate-600 font-medium mb-2 md:mb-2 px-2 md:px-0">
                        {member.headline}
                    </p>
                  )}
                  
                  {member.location && (
                    <div className="flex items-center justify-center md:justify-start gap-1.5 text-slate-500 text-xs md:text-sm mt-2 md:mt-0">
                      <MapPin className="w-3.5 h-3.5 md:w-4 md:h-4 text-slate-400" /> {member.location}
                    </div>
                  )}
              </div>

              {/* Boutons Actions (Alignés à droite sur desktop, pleine largeur sur mobile) */}
              <div className="flex flex-col sm:flex-row gap-2 md:gap-3 w-full md:w-auto justify-center md:justify-end shrink-0 mt-4 md:mt-0 md:mb-4">
                 {member.email && (
                    <a href={`mailto:${member.email}`} className="w-full sm:w-auto">
                        <Button className="w-full bg-[#0A2A5C] text-white hover:bg-[#0A2A5C]/90 shadow-sm px-5 h-11 md:h-10">
                            <Mail className="h-4 w-4 mr-2" /> Contacter
                        </Button>
                    </a>
                 )}
                 {member.phone && (
                    <a href={`tel:${member.phone}`} className="w-full sm:w-auto">
                        <Button variant="outline" className="w-full border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-[#0A2A5C] h-11 md:h-10">
                            <Phone className="h-4 w-4 mr-2" /> Appeler
                        </Button>
                    </a>
                 )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          
          {/* COLONNE GAUCHE (BIO & PARCOURS) */}
          <div className="md:col-span-2 space-y-6 md:space-y-8 order-2 md:order-1">
            
            {/* À PROPOS */}
            {member.bio && (
                <section>
                    <h3 className="text-base md:text-lg font-bold text-slate-800 mb-3 md:mb-4 flex items-center gap-2">
                        <span className="w-1 h-5 md:h-6 bg-[#FFD700] rounded-full block"></span>
                        À propos
                    </h3>
                    <Card className="border-0 shadow-sm bg-white rounded-2xl md:rounded-xl">
                        <CardContent className="p-5 md:p-6">
                            <p className="text-slate-600 leading-relaxed whitespace-pre-line text-sm md:text-base">
                                {member.bio}
                            </p>
                        </CardContent>
                    </Card>
                </section>
            )}
            
            {/* PARCOURS PROFESSIONNEL */}
            {(member.experiences?.length > 0 || member.company) && (
                <section>
                    <h3 className="text-base md:text-lg font-bold text-slate-800 mb-3 md:mb-4 flex items-center gap-2">
                        <span className="w-1 h-5 md:h-6 bg-[#0A2A5C] rounded-full block"></span>
                        Expérience Professionnelle
                    </h3>
                    <Card className="border-0 shadow-sm bg-white rounded-2xl md:rounded-xl">
                        <CardContent className="p-5 md:p-6">
                            {member.experiences && member.experiences.length > 0 ? (
                                <div className="space-y-6 md:space-y-8 relative border-l-2 border-slate-100 ml-2 py-1">
                                    {member.experiences.map((exp, index) => (
                                        <div key={index} className="pl-5 md:pl-6 relative">
                                            <div className="absolute -left-[9px] top-1.5 w-4 h-4 bg-white border-2 border-[#0A2A5C] rounded-full" />
                                            <h4 className="font-bold text-slate-900 text-base md:text-lg">{exp.company}</h4>
                                            <p className="text-[#0A2A5C] font-medium text-sm md:text-base mb-1.5">{exp.position}</p>
                                            <span className="text-[10px] md:text-xs font-semibold text-slate-500 bg-slate-50 px-2 py-0.5 rounded">
                                                {exp.period}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex items-center gap-3 md:gap-4">
                                    <div className="w-10 h-10 md:w-12 md:h-12 bg-slate-50 rounded-xl flex items-center justify-center text-[#0A2A5C] shrink-0">
                                        <Briefcase className="h-5 w-5 md:h-6 md:w-6" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 text-sm md:text-base">{member.company}</h4>
                                        <p className="text-slate-500 text-xs md:text-sm mt-0.5">Poste actuel</p>
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
                    <h3 className="text-base md:text-lg font-bold text-slate-800 mb-3 md:mb-4 flex items-center gap-2">
                        <span className="w-1 h-5 md:h-6 bg-slate-300 rounded-full block"></span>
                        Formation
                    </h3>
                    <Card className="border-0 shadow-sm bg-white rounded-2xl md:rounded-xl">
                        <CardContent className="p-5 md:p-6">
                            <div className="flex items-start gap-3 md:gap-4">
                                <div className="w-10 h-10 md:w-12 md:h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-500 mt-0.5 md:mt-1 shrink-0">
                                    <GraduationCap className="h-5 w-5 md:h-6 md:w-6" />
                                </div>
                                <div className="flex-1">
                                    {member.university && (
                                        <h4 className="font-bold text-slate-900 text-sm md:text-lg mb-1.5">{member.university}</h4>
                                    )}
                                    {member.education && (
                                        <p className="text-slate-600 leading-relaxed whitespace-pre-line text-xs md:text-sm">
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
          <div className="space-y-6 order-1 md:order-2">
             {hasSocials && (
                 <Card className="border-0 shadow-sm md:sticky md:top-24 rounded-2xl md:rounded-xl">
                    <CardHeader className="p-5 md:p-6 pb-3 md:pb-3 border-b border-slate-50">
                        <CardTitle className="text-sm md:text-base font-bold text-slate-800">Sur le web</CardTitle>
                    </CardHeader>
                    <CardContent className="p-5 md:p-6 pt-4 space-y-2 md:space-y-3 flex flex-row md:flex-col flex-wrap gap-2 md:gap-0">
                        {member.linkedin && (
                            <a href={member.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-2 md:gap-3 text-slate-600 hover:text-[#0077b5] transition-all p-2 hover:bg-[#0077b5]/5 rounded-lg group w-fit md:w-full">
                                <Linkedin className="w-4 h-4 md:w-5 md:h-5 group-hover:scale-110 transition-transform"/> 
                                <span className="font-medium text-xs md:text-sm">LinkedIn</span>
                            </a>
                        )}

                        {member.github && (
                            <a href={member.github} target="_blank" rel="noreferrer" className="flex items-center gap-2 md:gap-3 text-slate-600 hover:text-black transition-all p-2 hover:bg-slate-100 rounded-lg group w-fit md:w-full">
                                <Github className="w-4 h-4 md:w-5 md:h-5 group-hover:scale-110 transition-transform"/> 
                                <span className="font-medium text-xs md:text-sm">GitHub</span>
                            </a>
                        )}

                        {member.website && (
                            <a href={member.website} target="_blank" rel="noreferrer" className="flex items-center gap-2 md:gap-3 text-slate-600 hover:text-[#0A2A5C] transition-all p-2 hover:bg-[#0A2A5C]/5 rounded-lg group w-fit md:w-full">
                                <Globe className="w-4 h-4 md:w-5 md:h-5 group-hover:scale-110 transition-transform"/> 
                                <span className="font-medium text-xs md:text-sm">Site Personnel</span>
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