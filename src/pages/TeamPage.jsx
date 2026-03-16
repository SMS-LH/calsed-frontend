import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; // <-- AJOUT ICI
import { motion } from "framer-motion";
import { useContent } from "@/context/ContentContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Linkedin,
  Mail,
  Users2,
  School,
  Target,
  Award,
  ArrowRight,
  HeartHandshake,
  Globe2
} from "lucide-react";
import api from "@/api/axios";

// Animations douces
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

const stagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const TeamPage = () => {
  const { teamMembers } = useContent();
  const [schoolImage, setSchoolImage] = useState("");
  const navigate = useNavigate(); // <-- AJOUT ICI

  // Récupération de l'image de l'école configurée par l'admin
  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchSettings = async () => {
      try {
        const { data } = await api.get('/settings');
        if (data) {
          setSchoolImage(data.schoolImage || data.aboutImage || data.philImage1 || "");
        }
      } catch (error) {
        console.error("Erreur de chargement des paramètres.");
      }
    };
    fetchSettings();
  }, []);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http') || imagePath.startsWith('data:')) {
      return imagePath;
    }
    const baseUrl = process.env.REACT_APP_API_URL 
      ? process.env.REACT_APP_API_URL.replace(/\/api$/, '') 
      : "https://calsed-api.onrender.com";
      
    const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    return `${baseUrl}${cleanPath}`;
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 pb-16 md:pb-20">
      
      {/* --- 1. HERO SECTION --- */}
      <section className="pt-24 md:pt-32 pb-16 md:pb-24 lg:pt-40 lg:pb-28 bg-slate-50 relative overflow-hidden">
        {/* Décors d'arrière-plan */}
        <div className="absolute top-10 left-10 w-48 h-48 md:w-72 md:h-72 bg-blue-600/5 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-10 right-10 w-64 h-64 md:w-96 md:h-96 bg-amber-400/10 rounded-full blur-3xl -z-10"></div>
        
        <div className="container mx-auto px-4 md:px-6 relative z-10 text-center max-w-3xl">
          <motion.div initial="hidden" animate="visible" variants={stagger}>
            <motion.div variants={fadeUp} className="mb-4 md:mb-6">
              <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-none px-3 py-1 md:px-4 md:py-1.5 rounded-full font-semibold uppercase tracking-wider text-[10px] md:text-xs">
                Qui sommes-nous ?
              </Badge>
            </motion.div>
            
            <motion.h1 variants={fadeUp} className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-4 md:mb-6 text-slate-900 leading-tight">
              Les visages derrière le <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0A2A5C] to-blue-600">CALSED.</span>
            </motion.h1>
            
            <motion.p variants={fadeUp} className="text-base md:text-xl text-slate-600 font-light leading-relaxed px-2">
              Découvrez l'équipe bénévole qui fait vivre l'association au quotidien, ainsi que l'histoire du lycée qui nous a tous réunis.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* --- 2. L'ÉQUIPE (LE BUREAU) --- */}
      <section className="py-16 md:py-24 bg-white relative">
        <div className="container mx-auto px-4 md:px-6 lg:px-12">
          <div className="text-center max-w-2xl mx-auto mb-10 md:mb-16">
            <h2 className="text-2xl md:text-4xl font-bold text-slate-900 mb-3 md:mb-4">Le Bureau National</h2>
            <p className="text-sm md:text-base text-slate-600">Une équipe passionnée, élue pour représenter les anciens élèves et mener à bien les projets de l'association.</p>
          </div>

          {teamMembers.length > 0 ? (
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8"
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
            >
              {teamMembers.map((member, index) => (
                <motion.div key={member._id || index} variants={fadeUp} className="h-full">
                  <Card className="h-full bg-white border border-slate-100 rounded-2xl md:rounded-3xl overflow-hidden hover:shadow-xl hover:border-blue-100 transition-all duration-300 group flex flex-col">
                    <CardContent className="p-6 md:p-8 flex-1 flex flex-col items-center text-center">
                      
                      {/* Avatar */}
                      <div className="mb-4 md:mb-6 relative">
                        <div className="absolute inset-0 bg-blue-100 rounded-full scale-110 opacity-0 group-hover:opacity-100 group-hover:scale-125 transition-all duration-500 -z-10"></div>
                        <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-white shadow-lg bg-slate-50 relative z-10 transition-transform duration-500 group-hover:scale-105">
                          <AvatarImage src={getImageUrl(member.image)} alt={member.name} className="object-cover" />
                          <AvatarFallback className="bg-slate-100 text-[#0A2A5C] text-2xl md:text-3xl font-black">
                            {member.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </div>

                      {/* Infos */}
                      <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-1 group-hover:text-[#0A2A5C] transition-colors leading-tight">
                        {member.name}
                      </h3>
                      <p className="text-amber-600 font-semibold text-[10px] md:text-xs uppercase tracking-widest mb-2 md:mb-3">
                        {member.role}
                      </p>
                      
                      {member.generation && (
                        <Badge variant="secondary" className="bg-slate-50 text-slate-500 font-medium mb-4 md:mb-6 text-[10px] md:text-xs">
                          Promo {member.generation}
                        </Badge>
                      )}

                      <div className="flex-1"></div>

                      {/* Réseaux / Contact */}
                      <div className="flex justify-center gap-3 w-full pt-4 md:pt-6 border-t border-slate-50 mt-auto">
                        {member.linkedin && (
                          <a href={member.linkedin} target="_blank" rel="noreferrer" className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-white hover:bg-[#0077b5] transition-colors duration-300">
                            <Linkedin className="h-3.5 w-3.5 md:h-4 md:w-4" />
                          </a>
                        )}
                        {member.email && (
                          <a href={`mailto:${member.email}`} className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-white hover:bg-[#0A2A5C] transition-colors duration-300">
                            <Mail className="h-3.5 w-3.5 md:h-4 md:w-4" />
                          </a>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <div className="max-w-md mx-auto py-12 md:py-16 text-center bg-slate-50 rounded-2xl md:rounded-3xl border border-dashed border-slate-200 mx-4">
              <Users2 className="h-10 w-10 md:h-12 md:w-12 text-slate-300 mx-auto mb-3 md:mb-4" />
              <h3 className="text-lg md:text-xl font-bold text-slate-700 mb-1">Bureau en cours de mise à jour</h3>
              <p className="text-xs md:text-sm text-slate-500 font-light px-4">Les membres de l'équipe seront bientôt affichés ici.</p>
            </div>
          )}
        </div>
      </section>

      {/* --- 3. HISTOIRE & LYCÉE --- */}
      <section className="py-16 md:py-24 bg-slate-50 border-y border-slate-100">
        <div className="container mx-auto px-4 md:px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 items-center">
            
            {/* Image du Lycée (En haut sur mobile) */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative order-1 lg:order-2"
            >
              <div className="aspect-[16/10] sm:aspect-[4/3] rounded-2xl md:rounded-3xl overflow-hidden shadow-xl md:shadow-2xl bg-slate-200 relative">
                {schoolImage ? (
                  <img 
                    src={getImageUrl(schoolImage)} 
                    alt="Lycée Scientifique d'Excellence" 
                    className="w-full h-full object-cover transition-transform duration-1000 md:hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                    <School className="w-12 h-12 md:w-16 md:h-16 mb-4 opacity-50" />
                    <p className="font-medium text-xs md:text-sm">Image du Lycée (Admin)</p>
                  </div>
                )}
              </div>
              {/* Déco (Uniquement desktop pour alléger le mobile) */}
              <div className="hidden md:block absolute -top-6 -right-6 w-24 h-24 bg-amber-400/20 rounded-full blur-2xl -z-10"></div>
              <div className="hidden md:block absolute -bottom-8 -left-8 w-32 h-32 bg-blue-600/10 rounded-full blur-2xl -z-10"></div>
            </motion.div>

            {/* Contenu Texte */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="order-2 lg:order-1 text-center lg:text-left"
            >
              <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-none px-3 py-1 mb-4 text-[10px] md:text-xs">
                Nos Origines
              </Badge>
              <h2 className="text-2xl md:text-4xl font-bold text-slate-900 mb-4 md:mb-6 leading-tight px-2 lg:px-0">
                Le berceau de notre communauté.
              </h2>
              <div className="space-y-4 md:space-y-6 text-slate-600 text-sm md:text-lg leading-relaxed font-light px-2 lg:px-0">
                <p>
                  Fondé avec une mission claire : former l'élite scientifique du Sénégal. Le Lycée Scientifique d'Excellence de Diourbel (LSED) est un véritable creuset de rigueur et de dépassement de soi.
                </p>
                <p>
                  C'est entre ses murs que commence notre histoire commune. Au-delà des mathématiques et de la physique, nous y avons appris la solidarité et la force du collectif. Le CALSED est né de cette volonté de ne jamais rompre ce lien unique.
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 md:gap-6 mt-8 md:mt-10">
                <div className="bg-white p-3 md:p-4 rounded-xl md:rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center">
                  <Award className="h-6 w-6 md:h-8 md:w-8 text-amber-500 mb-2" />
                  <p className="text-xl md:text-2xl font-bold text-[#0A2A5C]">100%</p>
                  <p className="text-[10px] md:text-sm text-slate-500 font-medium text-center">Réussite au BAC</p>
                </div>
                <div className="bg-white p-3 md:p-4 rounded-xl md:rounded-2xl border border-slate-100 shadow-sm flex flex-col items-center">
                  <Globe2 className="h-6 w-6 md:h-8 md:w-8 text-blue-600 mb-2" />
                  <p className="text-xl md:text-2xl font-bold text-[#0A2A5C]">Monde</p>
                  <p className="text-[10px] md:text-sm text-slate-500 font-medium text-center">Réseau global</p>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* --- 4. VALEURS --- */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 md:px-6 lg:px-12 text-center">
          <h2 className="text-2xl md:text-4xl font-bold text-slate-900 mb-8 md:mb-12">Nos Valeurs Partagées</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 max-w-5xl mx-auto">
            {[
              {
                icon: HeartHandshake,
                color: "text-amber-600",
                bg: "bg-amber-100",
                title: "Solidarité",
                text: "S'entraider, du partage de cours jusqu'à la recommandation professionnelle."
              },
              {
                icon: Target,
                color: "text-blue-600",
                bg: "bg-blue-100",
                title: "Excellence",
                text: "Viser toujours plus haut, dans nos études comme dans nos carrières respectives."
              },
              {
                icon: Users2,
                color: "text-green-600",
                bg: "bg-green-100",
                title: "Inclusivité",
                text: "Une communauté bienveillante où chaque promotion trouve sa place."
              }
            ].map((item, i) => (
              <div key={i} className="flex flex-col items-center px-4">
                <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center mb-4 md:mb-6 ${item.bg} ${item.color}`}>
                  <item.icon className="h-7 w-7 md:h-8 md:w-8" />
                </div>
                <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-2 md:mb-3">{item.title}</h3>
                <p className="text-slate-500 text-sm font-light leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- 5. CTA CONTACT --- */}
      <section className="container mx-auto px-4 md:px-6 lg:px-12 mt-4 md:mt-8">
        <div className="bg-[#0A2A5C] rounded-2xl md:rounded-3xl p-8 md:p-20 text-center text-white relative overflow-hidden shadow-xl md:shadow-2xl">
          <div className="absolute top-0 right-0 w-48 h-48 md:w-64 md:h-64 bg-amber-400/20 rounded-full blur-2xl md:blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-4xl font-bold mb-4 md:mb-6 leading-tight">Envie de vous investir ?</h2>
            <p className="text-blue-100/90 mb-8 md:mb-10 text-base md:text-lg font-light leading-relaxed">
              Le bureau est toujours à la recherche de bonnes volontés pour animer les commissions ou proposer de nouveaux projets.
            </p>
            <Button 
              size="lg"
              className="w-full sm:w-auto bg-amber-500 text-slate-900 hover:bg-amber-400 h-12 md:h-14 px-8 md:px-10 rounded-xl font-bold shadow-lg transition-transform active:scale-95" 
              onClick={() => navigate('/contact')} /* <-- MODIFICATION ICI */
            >
              Nous écrire <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
            </Button>
          </div>
        </div>
      </section>

    </div>
  );
};

export default TeamPage;