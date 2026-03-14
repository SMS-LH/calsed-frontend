import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight, Briefcase, Network, GraduationCap,
  ShieldCheck, Users2, Image as ImageIcon,
  Building2, Lightbulb, ChevronRight, Quote
} from "lucide-react";
import { useContent } from "@/context/ContentContext";
import api from "../api/axios";

// Animations institutionnelles (douces et fluides)
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }
};

const stagger = {
  hidden: { opacity: 0 },
  visible: { transition: { staggerChildren: 0.15 } }
};

const HomePage = () => {
  const { blogPosts } = useContent();
  const { pathname } = useLocation();

  // On ne stocke plus que les images configurables par l'admin
  const [images, setImages] = useState({
    heroImage: "",
    philImage1: "",
    philImage2: "",
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchHomeImages();
  }, [pathname]);

  const fetchHomeImages = async () => {
    try {
      const { data } = await api.get('/settings');
      
      // On extrait directement depuis 'data' puisque le backend a été corrigé
      if (data) {
        setImages({
          heroImage: data.heroImage || "",
          philImage1: data.philImage1 || "",
          philImage2: data.philImage2 || "",
        });
      }
    } catch (error) {
      console.error("Erreur de chargement des images de la page d'accueil.");
    }
  };

  const featuredArticles = blogPosts
    .filter(post => post.featured === true || post.featured === "true")
    .slice(0, 3);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;

    // Si l'image vient de Cloudinary, on l'affiche telle quelle !
    if (imagePath.startsWith('http')) {
      return imagePath;
    }

    // Fallback dynamique pour les anciennes images (au cas où)
    const baseUrl = import.meta.env.VITE_API_URL 
      ? import.meta.env.VITE_API_URL.replace(/\/api$/, '') 
      : "https://calsed-api.onrender.com";
      
    const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    return `${baseUrl}${cleanPath}`;
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 antialiased selection:bg-[#0A2A5C] selection:text-white">
      
      {/* --- HERO SECTION (Haut de gamme) --- */}
      <section className="relative pt-32 pb-32 lg:pt-48 lg:pb-40 bg-[#0A2A5C] overflow-hidden">
        {/* Overlay premium */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A2A5C] to-[#051630] z-0"></div>
        
        {images.heroImage ? (
           <div className="absolute inset-0 opacity-30 z-0 mix-blend-overlay">
             <img src={getImageUrl(images.heroImage)} alt="Fond Hero" className="w-full h-full object-cover" />
           </div>
        ) : (
          <div className="absolute inset-0 opacity-10 z-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '48px 48px' }}></div>
        )}
        
        <div className="container mx-auto px-6 lg:px-12 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div initial="hidden" animate="visible" variants={stagger}>
              <motion.div variants={fadeUp} className="flex justify-center mb-8">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md text-amber-400 text-xs font-bold tracking-widest uppercase">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                  Réseau Officiel
                </div>
              </motion.div>
              
              <motion.h1 variants={fadeUp} className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-8 leading-[1.1] tracking-tight drop-shadow-lg">
                L'Excellence comme Héritage.
              </motion.h1>
              
              <motion.p variants={fadeUp} className="text-lg md:text-xl text-blue-100/80 mb-12 leading-relaxed max-w-2xl mx-auto font-light">
                Plateforme officielle du Collectif des Anciens du Lycée Scientifique d'Excellence de Diourbel. Fédérer les talents, servir la communauté.
              </motion.p>
              
              <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link to="/inscription">
                  <Button size="lg" className="bg-amber-500 text-white hover:bg-amber-600 h-14 px-8 text-base font-bold rounded-none shadow-xl transition-all hover:-translate-y-1">
                    Intégrer le Réseau
                  </Button>
                </Link>
                <Link to="/don">
                  <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 h-14 px-8 text-base font-medium rounded-none backdrop-blur-sm transition-all">
                    Soutenir le Lycée
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* --- STATISTIQUES EN CHEVAUCHEMENT --- */}
      <section className="relative z-20 -mt-16 mb-16 hidden md:block">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="bg-white rounded-none shadow-2xl border border-slate-100 p-8 flex justify-around items-center divide-x divide-slate-100">
            <div className="text-center px-8">
              <p className="text-4xl font-black text-[#0A2A5C] mb-1">+500</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Alumni Actifs</p>
            </div>
            <div className="text-center px-8">
              <p className="text-4xl font-black text-[#0A2A5C] mb-1">7</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Promotions</p>
            </div>
            <div className="text-center px-8">
              <p className="text-4xl font-black text-[#0A2A5C] mb-1">+15</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Pays d'influence</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- MISSION & PRESENTATION (Style Éditorial) --- */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-12 gap-16 items-center">
            
            {/* Contenu Texte */}
            <motion.div className="lg:col-span-5" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp}>
              <div className="flex items-center gap-4 mb-6">
                <div className="h-px w-12 bg-amber-500"></div>
                <span className="text-amber-600 font-bold text-sm uppercase tracking-widest">Notre Mission</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-[#0A2A5C] mb-8 leading-tight tracking-tight">
                Une Vision Commune
              </h2>
              <p className="text-slate-600 text-lg leading-relaxed mb-10 font-light">
                Le CALSED structure la force de son réseau pour catalyser les opportunités professionnelles et soutenir le développement de notre alma mater.
              </p>
              
              <div className="space-y-8">
                <div className="flex gap-5 items-start">
                    <div className="w-12 h-12 rounded-none bg-[#0A2A5C]/5 flex items-center justify-center text-[#0A2A5C] shrink-0 border border-[#0A2A5C]/10">
                        <GraduationCap className="w-6 h-6"/>
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-900 text-lg">Héritage d'Excellence</h4>
                        <p className="text-slate-500 mt-2 leading-relaxed font-light">Perpétuer les valeurs de rigueur et de travail inculquées au sein du LSED depuis sa création.</p>
                    </div>
                </div>
                <div className="flex gap-5 items-start">
                    <div className="w-12 h-12 rounded-none bg-amber-500/10 flex items-center justify-center text-amber-600 shrink-0 border border-amber-500/20">
                        <Network className="w-6 h-6"/>
                    </div>
                    <div>
                        <h4 className="font-bold text-slate-900 text-lg">Solidarité Active</h4>
                        <p className="text-slate-500 mt-2 leading-relaxed font-light">Un système de mentorat et d'entraide concret entre toutes les générations d'anciens élèves.</p>
                    </div>
                </div>
              </div>
            </motion.div>

            {/* Images Mosaïque Institutionnelle */}
            <div className="lg:col-span-7 grid grid-cols-2 gap-6 relative">
                {/* Décoration arrière-plan */}
                <div className="absolute -inset-4 bg-slate-50 z-0"></div>
                
                <div className="space-y-6 z-10 pt-12">
                      <div className="aspect-[3/4] bg-slate-100 rounded-none overflow-hidden shadow-lg border border-white">
                        {images.philImage1 ? (
                          <img src={getImageUrl(images.philImage1)} className="w-full h-full object-cover" alt="Mission 1" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center"><Building2 className="w-10 h-10 text-slate-400"/></div>
                        )}
                      </div>
                </div>
                <div className="space-y-6 z-10">
                      <div className="aspect-[3/4] bg-slate-100 rounded-none overflow-hidden shadow-lg border border-white">
                        {images.philImage2 ? (
                          <img src={getImageUrl(images.philImage2)} className="w-full h-full object-cover" alt="Communauté" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-[#0A2A5C]/10 to-[#0A2A5C]/30 flex items-center justify-center"><Users2 className="w-10 h-10 text-[#0A2A5C]/40"/></div>
                        )}
                      </div>
                      <div className="bg-[#0A2A5C] p-8 text-white shadow-xl relative overflow-hidden">
                        <Quote className="absolute -bottom-4 -right-4 w-24 h-24 text-white/10 rotate-12" />
                        <p className="text-lg font-medium leading-relaxed italic relative z-10">"L'excellence n'est pas un acte, mais une habitude."</p>
                      </div>
                </div>
            </div>

          </div>
        </div>
      </section>

      {/* --- SERVICES (Cartes Premium) --- */}
      <section className="py-24 bg-slate-50 border-t border-slate-100">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <div className="max-w-2xl">
              <span className="text-amber-600 font-bold text-sm uppercase tracking-widest mb-4 block">Missions CALSED</span>
              <h2 className="text-3xl md:text-5xl font-black text-[#0A2A5C] tracking-tight">
                Nos Piliers d'Action
              </h2>
            </div>
            <Link to="/membre">
                <Button variant="ghost" className="text-[#0A2A5C] font-bold hover:bg-white rounded-none group">
                    Espace Connecté <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform"/>
                </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Briefcase, title: "Carrière & Opportunités", text: "Accédez à un marché caché de l'emploi, des offres de stage exclusives et un réseau de professionnels établis." },
              { icon: Lightbulb, title: "Projets & Innovation", text: "Participez aux groupes de réflexion techniques et trouvez des associés pour vos projets entrepreneuriaux." },
              { icon: ShieldCheck, title: "Financement Solidaire", text: "Contribuez au fonds de solidarité pour soutenir les projets du lycée et les étudiants méritants." }
            ].map((item, i) => (
              <Card key={i} className="bg-white border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(10,42,92,0.1)] transition-shadow duration-500 rounded-none group">
                <CardContent className="p-10">
                  <div className="w-14 h-14 bg-slate-50 flex items-center justify-center mb-8 text-[#0A2A5C] group-hover:bg-[#0A2A5C] group-hover:text-white transition-colors duration-300">
                    <item.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-4">{item.title}</h3>
                  <p className="text-slate-500 font-light leading-relaxed">{item.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* --- ACTUALITÉS (Style Magazine) --- */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="flex justify-between items-end mb-12 border-b border-slate-200 pb-6">
            <h2 className="text-3xl font-black text-[#0A2A5C] tracking-tight">Journal du Réseau</h2>
            <Link to="/blog" className="hidden md:flex items-center text-sm font-bold text-amber-600 hover:text-amber-700 uppercase tracking-widest">
                Toutes les actualités <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {featuredArticles.length > 0 ? (
              featuredArticles.map((post) => (
                <Link key={post._id || post.id} to={`/blog/${post._id || post.id}`} className="group block">
                  <article className="h-full flex flex-col">
                    <div className="aspect-[4/3] bg-slate-100 mb-6 overflow-hidden relative">
                      {post.image ? (
                        <img src={getImageUrl(post.image)} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                            <ImageIcon className="w-10 h-10 text-slate-300" />
                        </div>
                      )}
                      <div className="absolute top-4 left-4">
                          <Badge className="bg-white/90 text-[#0A2A5C] hover:bg-white rounded-none font-bold text-xs px-3 py-1 shadow-sm backdrop-blur-sm">
                             {post.category || "Actualité"}
                          </Badge>
                      </div>
                    </div>
                    
                    <div className="flex flex-col flex-1">
                      <p className="text-xs text-slate-400 font-semibold mb-3 uppercase tracking-wider">
                        {new Date(post.date || post.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                      <h3 className="text-2xl font-bold text-slate-900 mb-4 group-hover:text-amber-600 transition-colors leading-snug line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-slate-600 font-light line-clamp-3 mb-6 flex-1">
                        {post.excerpt || "Découvrez les détails de cette actualité dans notre article complet."}
                      </p>
                      <span className="text-sm font-bold text-[#0A2A5C] flex items-center mt-auto group-hover:underline underline-offset-4">
                        Lire l'article <ArrowRight className="ml-2 w-4 h-4"/>
                      </span>
                    </div>
                  </article>
                </Link>
              ))
            ) : (
              <div className="col-span-full py-20 bg-slate-50 border border-slate-200 text-center">
                  <p className="text-slate-500 font-medium">Le journal est en cours de rédaction.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* --- CTA FINAL INSTITUTIONNEL --- */}
      <section className="py-24 bg-[#0A2A5C] relative overflow-hidden">
        {/* Cercles décoratifs */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-white/5 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2 pointer-events-none"></div>

        <div className="container mx-auto px-6 text-center relative z-10">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-8 tracking-tight">Rejoignez le Mouvement</h2>
            <p className="text-blue-100 max-w-2xl mx-auto mb-12 text-xl font-light leading-relaxed">
                Rejoignez la plateforme, accédez à l'annuaire mondial des anciens élèves et participez à nos événements exclusifs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/inscription">
                <Button size="lg" className="bg-amber-500 text-white hover:bg-amber-600 rounded-none font-bold px-10 h-14 text-base shadow-lg transition-transform hover:-translate-y-1">
                  Intégrer le réseau
                </Button>
              </Link>
              <Link to="/contact">
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 rounded-none h-14 px-10 text-base font-medium">
                  Nous contacter
                </Button>
              </Link>
            </div>
        </div>
      </section>

    </div>
  );
};

export default HomePage;