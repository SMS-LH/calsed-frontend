import { motion } from "framer-motion";
import { useContent } from "@/context/ContentContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  GraduationCap,
  Linkedin,
  Mail,
  ShieldCheck,
  Users,
  Quote,
  School,
  Target,
  Globe2,
  Award,
  ArrowRight
} from "lucide-react";

// Animation Variants - Plus douces et professionnelles
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const TeamPage = () => {
  const { teamMembers } = useContent();

  // --- CORRECTION DÉPLOIEMENT : Gestion sécurisée des URLs d'images ---
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http') || imagePath.startsWith('data:')) return imagePath;
    const baseUrl = (process.env.REACT_APP_API_URL || import.meta.env.VITE_API_URL || '').replace(/\/api$/, '');
    return `${baseUrl}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 pb-24">
      
      {/* 1. HERO SECTION - INSTITUTIONNEL */}
      <section className="bg-[#0A2A5C] text-white pt-40 pb-28 relative overflow-hidden">
        {/* Motif de fond "Ingénierie/Grille" très subtil */}
        <div className="absolute inset-0 opacity-10" 
             style={{ 
                 backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)', 
                 backgroundSize: '40px 40px' 
             }} 
        />
        
        <div className="container mx-auto px-6 relative z-10 text-center max-w-4xl">
          <motion.div initial="hidden" animate="visible" variants={fadeInUp}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm mb-8">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
              <span className="text-xs font-semibold tracking-widest uppercase text-blue-50">Notre Identité</span>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 leading-tight">
              L'Excellence comme <span className="text-amber-400">Héritage.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-blue-100/80 font-normal leading-relaxed max-w-2xl mx-auto">
              Nous fédérons les talents issus du Lycée Scientifique d'Excellence de Diourbel pour bâtir un réseau d'influence et impacter durablement notre société.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 2. L'ÉCOLE (LSED) - PRÉSENTATION SOBRE */}
      <section className="py-24 bg-white border-b border-slate-100">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            {/* Image avec cadre strict */}
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative order-2 lg:order-1"
            >
              <div className="aspect-[4/3] rounded-sm overflow-hidden shadow-2xl border border-slate-200 relative group">
                <div className="absolute inset-0 bg-[#0A2A5C]/10 group-hover:bg-transparent transition-colors duration-500" />
                <img 
                  src="https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?q=80&w=1000&auto=format&fit=crop" 
                  alt="Architecture LSED" 
                  className="w-full h-full object-cover"
                />
                
                {/* Badge Flottant */}
                <div className="absolute bottom-0 left-0 bg-white border-t border-r border-slate-200 p-6 shadow-sm max-w-xs">
                    <div className="flex items-start gap-4">
                        <School className="h-6 w-6 text-[#0A2A5C] mt-1" />
                        <div>
                            <p className="font-bold text-slate-900 text-sm uppercase tracking-wide">Alma Mater</p>
                            <p className="text-xs text-slate-500 mt-1">Lycée Scientifique d'Excellence de Diourbel</p>
                        </div>
                    </div>
                </div>
              </div>
              {/* Élément décoratif géométrique */}
              <div className="absolute -top-4 -left-4 w-24 h-24 border-t-2 border-l-2 border-amber-400 -z-10"></div>
            </motion.div>

            {/* Contenu Texte */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-1 lg:order-2"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-[#0A2A5C] mb-6 tracking-tight">
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
              
              <div className="grid grid-cols-2 gap-8 mt-10 pt-10 border-t border-slate-100">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="h-5 w-5 text-amber-500" />
                    <span className="font-bold text-3xl text-slate-900">100%</span>
                  </div>
                  <p className="text-sm text-slate-500 font-medium">Réussite au Baccalauréat</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Globe2 className="h-5 w-5 text-[#0A2A5C]" />
                    <span className="font-bold text-3xl text-slate-900">Intl.</span>
                  </div>
                  <p className="text-sm text-slate-500 font-medium">Présence Mondiale</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 3. LE CALSED (VALEURS) - DESIGN GRILLE */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="max-w-3xl mb-16">
            <h2 className="text-3xl font-bold text-[#0A2A5C] mb-4">
              Notre Mission
            </h2>
            <p className="text-slate-600 text-lg">
              Le CALSED structure la force de son réseau autour de trois piliers fondamentaux.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Users,
                title: "Fédérer",
                text: "Unir les alumni autour d'une plateforme commune pour faciliter les échanges et le networking."
              },
              {
                icon: Target,
                title: "Accompagner",
                text: "Mentorat actif et bourses d'études pour soutenir l'ascension des jeunes promotions."
              },
              {
                icon: ShieldCheck,
                title: "Pérenniser",
                text: "Garantir la durabilité de l'esprit d'excellence à travers des actions institutionnelles fortes."
              }
            ].map((item, i) => (
              <div key={i} className="bg-white p-8 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-[#0A2A5C] text-white rounded-md flex items-center justify-center mb-6">
                  <item.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                <p className="text-slate-500 leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. LE BUREAU (L'ÉQUIPE) - CARTES "EXECUTIVE" */}
      <section className="py-24 container mx-auto px-6 lg:px-12">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 border-b border-slate-200 pb-8">
          <div>
            <span className="text-[#0A2A5C] font-bold uppercase tracking-widest text-xs block mb-2">Gouvernance</span>
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
              Le Bureau National
            </h2>
          </div>
          <p className="text-slate-500 text-sm max-w-md text-right hidden md:block">
            Une équipe engagée pour porter la vision stratégique du collectif.
          </p>
        </div>

        {teamMembers.length > 0 ? (
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            {teamMembers.map((member, index) => (
              <motion.div key={index} variants={fadeInUp} className="h-full">
                <div className="h-full bg-white border border-slate-200 rounded-lg overflow-hidden hover:border-[#0A2A5C] hover:shadow-lg transition-all duration-300 group flex flex-col">
                  
                  {/* Bandeau Supérieur Coloré */}
                  <div className="h-1 w-full bg-gradient-to-r from-[#0A2A5C] to-blue-600"></div>

                  <div className="p-6 flex-1 flex flex-col items-center text-center">
                    {/* Avatar */}
                    <div className="mb-5 relative">
                      <Avatar className="h-24 w-24 border border-slate-100 shadow-sm">
                        {/* Utilisation de getImageUrl() ici */}
                        <AvatarImage src={getImageUrl(member.image)} alt={member.name} className="object-cover" />
                        <AvatarFallback className="bg-slate-50 text-[#0A2A5C] text-xl font-bold">
                          {member.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="absolute bottom-0 right-0 bg-white rounded-full p-1 border border-slate-100 shadow-sm">
                         <div className="bg-amber-400 w-3 h-3 rounded-full"></div>
                      </div>
                    </div>

                    {/* Info */}
                    <h3 className="text-lg font-bold text-slate-900 mb-1">
                      {member.name}
                    </h3>
                    <p className="text-[#0A2A5C] text-xs font-bold uppercase tracking-wider mb-4">
                      {member.role}
                    </p>
                    
                    <Badge variant="secondary" className="bg-slate-50 text-slate-600 hover:bg-slate-100 font-normal border border-slate-100 mb-6">
                       Promo {member.generation}
                    </Badge>

                    <Separator className="bg-slate-100 w-full mb-6" />

                    {/* Actions - Plus discrètes */}
                    <div className="flex justify-center gap-4 mt-auto">
                      {member.linkedin && (
                        <a href={member.linkedin} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-[#0077b5] transition-colors">
                            <Linkedin className="h-5 w-5" />
                        </a>
                      )}
                      {member.email && (
                        <a href={`mailto:${member.email}`} className="text-slate-400 hover:text-[#0A2A5C] transition-colors">
                            <Mail className="h-5 w-5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="col-span-full py-20 text-center bg-slate-50 rounded-lg border border-dashed border-slate-300">
            <Users className="h-10 w-10 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-900 mb-1">Équipe en cours de constitution</h3>
            <p className="text-slate-500 text-sm">La composition officielle du bureau sera bientôt publiée.</p>
          </div>
        )}
      </section>

      {/* 5. CTA CONTACT - CALSED STYLE */}
      <section className="container mx-auto px-6 lg:px-12 mt-12">
        <div className="bg-[#0A2A5C] rounded-2xl p-10 md:p-16 text-center text-white relative overflow-hidden shadow-2xl">
          {/* Cercles décoratifs */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl"></div>
          
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">Rejoindre la dynamique</h2>
            <p className="text-blue-100/80 mb-8 text-lg font-light">
              Vous souhaitez contribuer aux activités du bureau ou proposer un partenariat ?
            </p>
            <Button 
                className="bg-white text-[#0A2A5C] hover:bg-blue-50 h-12 px-8 rounded-md font-bold shadow-lg transition-transform hover:-translate-y-1" 
                onClick={() => window.location.href = 'mailto:bureau@calsed.com'}
            >
              Nous contacter <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

    </div>
  );
};

export default TeamPage;