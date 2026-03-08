import { useState, useEffect } from "react";
import { Navigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, 
  MapPin, 
  Briefcase, 
  Linkedin, 
  Mail, 
  Filter,
  GraduationCap,
  Phone,
  Users as UsersIcon,
  ArrowRight
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

// IMPORT DU PONT API SÉCURISÉ
import api from "@/api/axios";

const DirectoryPage = () => {
  const { isAuthenticated, isMember, loading: authLoading } = useAuth();
  const [members, setMembers] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  
  // États des filtres
  const [searchTerm, setSearchTerm] = useState("");
  const [filterGen, setFilterGen] = useState("all");

  // --- CORRECTION DÉPLOIEMENT : Gestion sécurisée des URLs d'images ---
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    const baseUrl = (process.env.REACT_APP_API_URL || import.meta.env.VITE_API_URL || '').replace(/\/api$/, '');
    return `${baseUrl}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
  };

  // 1. Charger les données depuis le Backend via Axios
  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const response = await api.get('/users');
        // Axios place les données JSON directement dans response.data
        setMembers(response.data);
      } catch (error) {
        console.error("Erreur chargement annuaire:", error);
      } finally {
        setLoadingData(false);
      }
    };

    if (isAuthenticated) {
      fetchMembers();
    }
  }, [isAuthenticated]);

  // Sécurité
  if (authLoading) return <div className="min-h-screen pt-32 text-center flex items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-[#0A2A5C] border-t-transparent rounded-full"></div></div>;
  if (!isAuthenticated) return <Navigate to="/connexion" replace />;
  if (!isMember) return <Navigate to="/membre" replace />;

  // 2. Logique de filtrage
  const filteredMembers = members.filter(member => {
    const searchString = `
      ${member.name} 
      ${member.headline || ""} 
      ${member.company || ""} 
      ${member.university || ""} 
      ${member.location || ""}
    `.toLowerCase();

    const matchSearch = searchString.includes(searchTerm.toLowerCase());
    const matchGen = filterGen === "all" || member.generation === filterGen;

    return matchSearch && matchGen;
  });

  return (
    <div className="min-h-screen pt-20 bg-slate-50/50 font-sans">
      
      {/* HEADER PREMIUM */}
      <div className="bg-[#0A2A5C] pt-16 pb-24 text-center shadow-md relative overflow-hidden">
        {/* Fond abstrait */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1e40af] via-[#0A2A5C] to-[#0A2A5C] opacity-80"></div>
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <Badge className="mb-6 bg-white/10 text-white hover:bg-white/20 border-white/10 px-4 py-1 backdrop-blur-sm transition-all">
            <UsersIcon className="w-3 h-3 mr-2 text-[#FFD700]" /> Annuaire Officiel
          </Badge>
          <h1 className="text-3xl md:text-5xl font-bold font-display text-white mb-6 tracking-tight">
            Le Réseau CALSED
          </h1>
          <p className="text-blue-100/80 text-lg max-w-xl mx-auto font-light leading-relaxed">
            Connectez-vous avec les talents de notre communauté. Retrouvez vos camarades et élargissez votre réseau professionnel.
          </p>
        </div>
      </div>

      {/* BARRE DE RECHERCHE FLOTTANTE */}
      <div className="container mx-auto px-4 lg:px-8 -mt-12 relative z-20">
        <Card className="border-0 shadow-2xl shadow-blue-900/10 bg-white rounded-2xl overflow-hidden">
          <CardContent className="p-2 md:p-3">
            <div className="grid md:grid-cols-12 gap-2 items-center">
              
              {/* Recherche Texte */}
              <div className="md:col-span-8 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input 
                  placeholder="Rechercher par nom, expertise, entreprise..." 
                  className="pl-12 h-14 bg-transparent border-0 focus-visible:ring-0 text-base placeholder:text-slate-400"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Séparateur Vertical (Desktop uniquement) */}
              <div className="hidden md:block w-px h-8 bg-slate-200 mx-auto"></div>

              {/* Filtre Génération */}
              <div className="md:col-span-3">
                <Select value={filterGen} onValueChange={setFilterGen}>
                  <SelectTrigger className="h-14 border-0 bg-transparent focus:ring-0 text-base text-slate-600 font-medium">
                    <SelectValue placeholder="Promo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les promos</SelectItem>
                    {Array.from({ length: 10 }, (_, i) => `G${i + 1}`).map(g => (
                      <SelectItem key={g} value={g}>Promotion {g}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Bouton Reset */}
              <div className="md:col-span-1 flex justify-center">
                {searchTerm || filterGen !== 'all' ? (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => { setSearchTerm(""); setFilterGen("all"); }}
                      className="text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full h-10 w-10"
                      title="Effacer les filtres"
                    >
                      <Filter className="h-5 w-5" />
                    </Button>
                ) : (
                    <div className="h-10 w-10 flex items-center justify-center text-slate-300">
                        <Filter className="h-5 w-5" />
                    </div>
                )}
              </div>

            </div>
          </CardContent>
        </Card>
      </div>

      {/* GRILLE DES RÉSULTATS */}
      <div className="container mx-auto px-4 lg:px-8 py-16">
        <div className="mb-8 flex items-center justify-between border-b border-slate-200 pb-4">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            Résultats <span className="bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-full">{filteredMembers.length}</span>
          </h2>
        </div>

        {loadingData ? (
           <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
             {[1,2,3,4].map(i => (
               <div key={i} className="h-80 bg-white rounded-2xl border border-slate-100 shadow-sm animate-pulse"></div>
             ))}
           </div>
        ) : filteredMembers.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMembers.map((member) => (
              <motion.div
                key={member._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all h-full bg-white group overflow-hidden flex flex-col rounded-2xl">
                  
                  {/* Partie Supérieure (Header Carte) */}
                  <div className="p-6 pb-0 flex flex-col items-center flex-1">
                    <div className="relative mb-4">
                      <Avatar className="h-24 w-24 border-4 border-white shadow-md bg-slate-50">
                        <AvatarImage src={getImageUrl(member.avatar)} alt={member.name} className="object-cover" />
                        <AvatarFallback className="bg-slate-100 text-[#0A2A5C] text-2xl font-display font-bold">
                            {member.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {member.generation && (
                        <Badge className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-white text-[#0A2A5C] border border-slate-200 shadow-sm px-3 py-0.5 text-xs whitespace-nowrap hover:bg-white">
                          Promo {member.generation}
                        </Badge>
                      )}
                    </div>

                    <div className="text-center w-full mt-2">
                        <h3 className="font-bold text-lg text-slate-900 line-clamp-1 group-hover:text-[#0A2A5C] transition-colors">
                            {member.name}
                        </h3>
                        
                        {/* HEADLINE (Si renseigné) */}
                        {member.headline && (
                            <p className="text-[#0A2A5C] font-medium text-sm mt-1 line-clamp-2 min-h-[1.25rem]">
                                {member.headline}
                            </p>
                        )}

                        {/* INFO SECONDAIRE (Entreprise ou Université) - Masqué si vide */}
                        {(member.company || member.university) && (
                            <div className="text-slate-500 text-xs flex items-center justify-center gap-1.5 mt-3">
                                {member.company ? (
                                    <><Briefcase className="h-3 w-3 shrink-0" /> <span className="line-clamp-1">{member.company}</span></>
                                ) : (
                                    <><GraduationCap className="h-3 w-3 shrink-0" /> <span className="line-clamp-1">{member.university}</span></>
                                )}
                            </div>
                        )}

                        {/* LOCALISATION - Masqué si vide */}
                        {member.location && (
                            <div className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded-md">
                                <MapPin className="h-3 w-3" /> {member.location}
                            </div>
                        )}
                    </div>
                  </div>

                  <div className="flex-1"></div> {/* Spacer pour pousser le footer vers le bas */}

                  {/* FOOTER : ACTIONS */}
                  <CardFooter className="p-4 pt-4 border-t border-slate-50 bg-slate-50/50 mt-4 flex justify-between items-center gap-2">
                    
                    {/* Icônes de contact (Gauche) */}
                    <div className="flex gap-1">
                        {member.phone && (
                            <a href={`tel:${member.phone}`} title="Appeler">
                                <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full text-slate-400 hover:text-green-600 hover:bg-green-50">
                                    <Phone className="h-4 w-4" />
                                </Button>
                            </a>
                        )}
                        <a href={`mailto:${member.email}`} title="Envoyer un email">
                            <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full text-slate-400 hover:text-blue-600 hover:bg-blue-50">
                                <Mail className="h-4 w-4" />
                            </Button>
                        </a>
                        {member.linkedin && (
                            <a href={member.linkedin} target="_blank" rel="noreferrer" title="LinkedIn">
                                <Button size="icon" variant="ghost" className="h-8 w-8 rounded-full text-slate-400 hover:text-[#0077b5] hover:bg-blue-50">
                                    <Linkedin className="h-4 w-4" />
                                </Button>
                            </a>
                        )}
                    </div>

                    {/* Bouton Voir Profil (Droite) */}
                    <Link to={`/annuaire/${member._id}`}>
                        <Button size="sm" className="bg-white border border-slate-200 text-slate-700 hover:bg-[#0A2A5C] hover:text-white hover:border-[#0A2A5C] transition-all shadow-sm h-8 px-3 text-xs font-medium group/btn">
                            Voir profil <ArrowRight className="h-3 w-3 ml-1 group-hover/btn:translate-x-0.5 transition-transform" />
                        </Button>
                    </Link>

                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          /* ÉTAT VIDE */
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
            <div className="bg-slate-50 p-4 rounded-full mb-4">
                <UsersIcon className="h-10 w-10 text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-700 mb-2">Aucun résultat trouvé</h3>
            <p className="text-slate-500 max-w-xs text-center mb-6">Nous n'avons trouvé aucun membre correspondant à votre recherche.</p>
            <Button 
              variant="outline" 
              onClick={() => { setSearchTerm(""); setFilterGen("all"); }}
              className="border-slate-200 text-[#0A2A5C]"
            >
              Réinitialiser les filtres
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default DirectoryPage;