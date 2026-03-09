import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useContent } from "@/context/ContentContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Linkedin,
  Mail,
  ShieldCheck,
  Users,
  School,
  Target,
  Globe2,
  Award,
  ArrowRight
} from "lucide-react";
import api from "@/api/axios";

// Animations institutionnelles
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const TeamPage = () => {
  const { teamMembers } = useContent();
  const [schoolImage, setSchoolImage] = useState("");

  // Récupération de l'image de l'école configurée par l'admin
  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchSettings = async () => {
      try {
        const { data } = await api.get('/settings');
        const settingsData = data?.data || data || {};
        // On cherche une image configurée pour l'école/à propos. 
        // Si elle n'existe pas, on garde la chaîne vide pour utiliser le fallback
        setSchoolImage(settingsData.schoolImage || settingsData.aboutImage || settingsData.philImage1 || "");
      } catch (error) {
        console.error("Erreur de chargement des paramètres de la page.");
      }
    };
    fetchSettings();
  }, []);

  // Gestion sécurisée des URLs d'images (Membres + École)
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http') || imagePath.startsWith('data:')) return imagePath;
    const baseUrl = (process.env.REACT_APP_API_URL || import.meta.env.VITE_API_URL || '').replace(/\/api$/, '');
    return `${baseUrl}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 pb-24">
      
      {/* 1. HERO SECTION - INSTITUTIONNEL */}
      <section className="bg-[#0A2A5C] text-white pt-40 pb-32 relative overflow-hidden">
        {/* Overlay premium */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A2A5C] to-[#051630] z-0"></div>
        <div className="absolute inset-0 opacity-5 z-0" 
             style={{ 
                 backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)', 
                 backgroundSize: '48px 48px' 
             }} 
        />
        
        <div className="container mx-auto px-6 relative z-10 text-center max-w-4xl">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
            <motion.div variants={fadeInUp} className="flex justify-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-amber-400 text-xs font-bold tracking-widest uppercase">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                Notre Identité
              </div>
            </motion.div>
            
            <motion.h1 variants={fadeInUp} className="text-4xl md:text-6xl font-black tracking-tight mb-8 leading-[1.1]">
              L'Excellence comme <span className="text-amber-500">Héritage.</span>
            </motion.h1>
            
            <motion.p variants={fadeInUp} className="text-lg md:text-xl text-blue-100/80 font-light leading-relaxed max-w-2xl mx-auto">
              Nous fédérons les talents issus du Lycée Scientifique d'Excellence de Diourbel pour bâtir un réseau d'influence et impacter durablement notre société.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* 2. L'ÉCOLE (LSED) - PRÉSENTATION SOBRE */}
      <section className="py-24 bg-white border-b border-slate-100">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            {/* Image dynamique configurée par l'admin */}
            <motion.div 
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative order-2 lg:order-1"
            >
              <div className="aspect-[4/3] rounded-none overflow-hidden shadow-2xl border border-slate-100 relative group bg-slate-100">
                <div className="absolute inset-0 bg-[#0A2A5C]/10 group-hover:bg-transparent transition-colors duration-700 z-10" />
                <img 
                  src={schoolImage ? getImageUrl(schoolImage) : "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?q=80&w=1000&auto=format&fit=crop"} 
                  alt="Architecture LSED" 
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-1000 ease-out"
                />
                
                {/* Badge Flottant */}
                <div className="absolute bottom-0 left-0 bg-white border-t border-r border-slate-200 p-6 shadow-sm max-w-xs z-20">
                    <div className="flex items-start gap-4">
                        <School className="h-6 w-6 text-[#0A2A5C] mt-1" />
                        <div>
                            <p className="font-bold text-slate-900 text-sm uppercase tracking-wider">Alma Mater</p>
                            <p className="text-xs text-slate-500 mt-1 font-medium">Lycée Scientifique d'Excellence</p>
                        </div>
                    </div>
                </div>
              </div>
              {/* Élément décoratif géométrique */}
              <div className="absolute -top-4 -left-4 w-24 h-24 border-t-4 border-l-4 border-amber-500 -z-10"></div>
            </motion.div>

            {/* Contenu Texte */}
            <motion.div 
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="order-1 lg:order-2"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="h-px w-12 bg-amber-500"></div>
                <span className="text-amber-600 font-bold text-sm uppercase tracking-widest">Nos Origines</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-[#0A2A5C] mb-8 tracking-tight leading-tight">
                Le Berceau de l'Élite Scientifique
              </h2>
              <div className="space-y-6 text-slate-600 text-lg leading-relaxed font-light">
                <p>
                  Fondé avec une mission claire : former l'élite scientifique du Sénégal. Le LSED est un creuset de rigueur, de discipline et de dépassement de soi.
                </p>
                <p>
                  C'est ici que commence notre histoire commune. Chaque année, les meilleurs élèves du pays y sont sélectionnés pour recevoir un encadrement de pointe, cultivant le savoir académique et les valeurs citoyennes.
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-8 mt-12 pt-10 border-t border-slate-100">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="h-6 w-6 text-amber-500" />
                    <span className="font-black text-4xl text-[#0A2A5C]">100%</span>
                  </div>
                  <p className="text-sm text-slate-500 font-medium uppercase tracking-wider">Réussite au Baccalauréat</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Globe2 className="h-6 w-6 text-amber-500" />
                    <span className="font-black text-4xl text-[#0A2A5C]">Intl.</span>
                  </div>
                  <p className="text-sm text-slate-500 font-medium uppercase tracking-wider">Présence Mondiale</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 3. LE CALSED (VALEURS) - DESIGN GRILLE PREMIUM */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="max-w-3xl mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-[#0A2A5C] mb-6 tracking-tight">
              Notre Mission
            </h2>
            <p className="text-slate-600 text-lg font-light leading-relaxed">
              Le CALSED structure la force de son réseau autour de trois piliers fondamentaux pour accompagner ses membres tout au long de leur parcours.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: "Fédérer",
                text: "Unir les alumni autour d'une plateforme commune pour faciliter les échanges, le partage d'expérience et le networking de haut niveau."
              },
              {
                icon: Target,
                title: "Accompagner",
                text: "Mentorat actif, orientation académique et bourses d'études pour soutenir l'ascension professionnelle des jeunes promotions."
              },
              {
                icon: ShieldCheck,
                title: "Pérenniser",
                text: "Garantir la durabilité de l'esprit d'excellence à travers des actions institutionnelles fortes et un soutien constant au Lycée."
              }
            ].map((item, i) => (
              <div key={i} className="bg-white p-10 rounded-none border border-slate-200 shadow-sm hover:border-[#0A2A5C] hover:shadow-lg transition-all duration-500 group">
                <div className="w-14 h-14 bg-slate-50 border border-slate-100 text-[#0A2A5C] flex items-center justify-center mb-8 group-hover:bg-[#0A2A5C] group-hover:text-white transition-colors duration-300">
                  <item.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">{item.title}</h3>
                <p className="text-slate-500 font-light leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. LE BUREAU (L'ÉQUIPE) - CARTES "EXECUTIVE" */}
      <section className="py-24 container mx-auto px-6 lg:px-12">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 border-b border-slate-200 pb-8 gap-6">
          <div>
            <span className="text-amber-600 font-bold uppercase tracking-widest text-xs block mb-3">Gouvernance</span>
            <h2 className="text-3xl md:text-5xl font-black text-[#0A2A5C] tracking-tight">
              Le Bureau National
            </h2>
          </div>
          <p className="text-slate-500 text-base max-w-md md:text-right font-light leading-relaxed">
            Une équipe exécutive engagée pour porter la vision stratégique et le développement du collectif.
          </p>
        </div>

        {teamMembers.length > 0 ? (
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            {teamMembers.map((member, index) => (
              <motion.div key={index} variants={fadeInUp} className="h-full">
                <div className="h-full bg-white border border-slate-200 rounded-none overflow-hidden hover:border-[#0A2A5C] hover:shadow-xl transition-all duration-500 group flex flex-col">
                  
                  {/* Bandeau Supérieur Coloré */}
                  <div className="h-1.5 w-full bg-slate-200 group-hover:bg-[#0A2A5C] transition-colors duration-500"></div>

                  <div className="p-8 flex-1 flex flex-col items-center text-center">
                    {/* Avatar Premium */}
                    <div className="mb-6 relative">
                      <Avatar className="h-28 w-28 border-4 border-white shadow-md">
                        <AvatarImage src={getImageUrl(member.image)} alt={member.name} className="object-cover" />
                        <AvatarFallback className="bg-slate-100 text-[#0A2A5C] text-2xl font-black">
                          {member.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute bottom-1 right-1 bg-white rounded-full p-1.5 shadow-sm border border-slate-100">
                         <div className="bg-amber-500 w-3.5 h-3.5 rounded-full"></div>
                      </div>
                    </div>

                    {/* Info */}
                    <h3 className="text-xl font-bold text-slate-900 mb-1">
                      {member.name}
                    </h3>
                    <p className="text-[#0A2A5C] text-xs font-black uppercase tracking-widest mb-4">
                      {member.role}
                    </p>
                    
                    <Badge variant="outline" className="bg-slate-50 text-slate-600 font-medium border-slate-200 mb-6 rounded-none px-3 py-1">
                        Promo {member.generation}
                    </Badge>

                    <Separator className="bg-slate-100 w-full mb-6" />

                    {/* Actions de contact */}
                    <div className="flex justify-center gap-5 mt-auto">
                      {member.linkedin && (
                        <a href={member.linkedin} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-white hover:bg-[#0077b5] hover:border-[#0077b5] transition-all duration-300">
                            <Linkedin className="h-4 w-4" />
                        </a>
                      )}
                      {member.email && (
                        <a href={`mailto:${member.email}`} className="w-10 h-10 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-white hover:bg-[#0A2A5C] hover:border-[#0A2A5C] transition-all duration-300">
                            <Mail className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="col-span-full py-24 text-center bg-slate-50 border border-slate-200">
            <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">Gouvernance en cours d'élection</h3>
            <p className="text-slate-500 font-light">La composition officielle du bureau sera publiée très prochainement.</p>
          </div>
        )}
      </section>

      {/* 5. CTA CONTACT - CALSED STYLE */}
      <section className="container mx-auto px-6 lg:px-12 mt-8">
        <div className="bg-[#0A2A5C] rounded-none p-12 md:p-20 text-center text-white relative overflow-hidden shadow-2xl">
          {/* Cercles décoratifs */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-black mb-6 tracking-tight">Rejoindre la dynamique</h2>
            <p className="text-blue-100/90 mb-10 text-lg md:text-xl font-light leading-relaxed">
              Vous souhaitez contribuer activement aux commissions du bureau, proposer un partenariat ou structurer une nouvelle initiative ?
            </p>
            <Button 
                size="lg"
                className="bg-amber-500 text-white hover:bg-amber-600 h-14 px-10 rounded-none font-bold shadow-xl transition-transform hover:-translate-y-1 text-base" 
                onClick={() => window.location.href = 'mailto:contact@calsed.sn'}
            >
              Contactez le Bureau <ArrowRight className="ml-3 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

    </div>
  );
};

export default TeamPage;