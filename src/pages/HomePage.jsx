import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight, Briefcase, GraduationCap,
  Users2, Calendar, HeartHandshake,
  ChevronRight, ArrowUpRight
} from "lucide-react";
import { useContent } from "@/context/ContentContext";
import api from "../api/axios";

// Animations
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
};

const stagger = {
  hidden: { opacity: 0 },
  visible: { transition: { staggerChildren: 0.1 } }
};

const HomePage = () => {
  const { blogPosts } = useContent();
  const { pathname } = useLocation();

  const [images, setImages] = useState({
    heroImage: "",
    philImage1: "",
  });

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchHomeImages();
  }, [pathname]);

  const fetchHomeImages = async () => {
    try {
      const { data } = await api.get('/settings');
      if (data) {
        setImages({
          heroImage: data.heroImage || "",
          philImage1: data.philImage1 || "",
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
    if (imagePath.startsWith('http') || imagePath.startsWith('data:')) return imagePath;
    const baseUrl = process.env.REACT_APP_API_URL 
      ? process.env.REACT_APP_API_URL.replace(/\/api$/, '') 
      : "https://calsed-api.onrender.com";
    return `${baseUrl}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased">
      
      {/* --- HERO SECTION (Moderne & Lumineux) --- */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-white">
        {/* Décors d'arrière-plan */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-slate-50 rounded-bl-[100px] -z-10 hidden lg:block"></div>
        <div className="absolute top-20 right-20 w-72 h-72 bg-amber-400/10 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl -z-10"></div>

        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            
            {/* Colonne Texte */}
            <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-2xl">
              <motion.div variants={fadeUp} className="mb-6">
                <Badge className="bg-blue-50 text-[#0A2A5C] hover:bg-blue-100 border-none px-4 py-1.5 rounded-full font-semibold">
                  🚀 Le réseau officiel des anciens du LSED
                </Badge>
              </motion.div>
              
              <motion.h1 variants={fadeUp} className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 mb-6 leading-[1.15] tracking-tight">
                Votre réseau. <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0A2A5C] to-blue-600">Votre force.</span>
              </motion.h1>
              
              <motion.p variants={fadeUp} className="text-lg text-slate-600 mb-10 leading-relaxed font-light">
                Bienvenue sur la plateforme du CALSED. Retrouvez vos camarades de promotion, découvrez des opportunités professionnelles exclusives et participez au rayonnement de notre lycée.
              </motion.p>
              
              <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4">
                <Link to="/inscription">
                  <Button size="lg" className="w-full sm:w-auto bg-[#0A2A5C] hover:bg-blue-800 text-white h-14 px-8 rounded-xl font-bold shadow-lg shadow-blue-900/20 transition-all hover:-translate-y-1">
                    Rejoindre l'annuaire
                  </Button>
                </Link>
                <Link to="/connexion">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto border-slate-200 text-slate-700 hover:bg-slate-50 h-14 px-8 rounded-xl font-semibold transition-all">
                    Se connecter
                  </Button>
                </Link>
              </motion.div>
            </motion.div>

            {/* Colonne Image (Hero) */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative hidden md:block"
            >
              <div className="aspect-square md:aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border-8 border-white bg-slate-100 relative">
                {images.heroImage ? (
                  <img src={getImageUrl(images.heroImage)} alt="Communauté CALSED" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400">
                    <Users2 className="w-16 h-16 mb-4 opacity-50" />
                    <p className="font-medium">Image de couverture (Admin)</p>
                  </div>
                )}
                {/* Petite carte flottante déco */}
                <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-4 animate-bounce hover:animate-none">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Nouveau poste</p>
                    <p className="text-sm font-bold text-slate-900">Ingénieur chez Wave</p>
                  </div>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* --- STATS RAPIDES --- */}
      <section className="py-12 bg-white border-b border-slate-100">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-slate-100">
            {[
              { number: "+500", label: "Membres" },
              { number: "7", label: "Promotions" },
              { number: "+50", label: "Offres partagées" },
              { number: "1", label: "Seule famille" }
            ].map((stat, i) => (
              <div key={i} className="text-center px-4">
                <p className="text-3xl md:text-4xl font-black text-[#0A2A5C] mb-1">{stat.number}</p>
                <p className="text-sm text-slate-500 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- POURQUOI NOUS REJOINDRE (Valeur ajoutée) --- */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Ce que le réseau vous apporte</h2>
            <p className="text-slate-600">Plus qu'une simple association, le CALSED est un véritable tremplin pour votre carrière et vos projets.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Users2, color: "text-blue-600", bg: "bg-blue-100", title: "Annuaire Global", text: "Retrouvez facilement les anciens élèves par promotion, ville ou domaine d'expertise." },
              { icon: Briefcase, color: "text-amber-600", bg: "bg-amber-100", title: "Opportunités", text: "Accédez à des offres de stages et d'emplois partagées exclusivement entre membres." },
              { icon: Calendar, color: "text-purple-600", bg: "bg-purple-100", title: "Événements", text: "Participez à nos afterworks, webinaires et rencontres de networking professionnels." },
              { icon: HeartHandshake, color: "text-green-600", bg: "bg-green-100", title: "Entraide & Mentorat", text: "Bénéficiez des conseils de vos aînés ou devenez mentor pour les plus jeunes." }
            ].map((feature, i) => (
              <Card key={i} className="bg-white border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 rounded-2xl group hover:-translate-y-1">
                <CardContent className="p-8">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${feature.bg} ${feature.color} group-hover:scale-110 transition-transform`}>
                    <feature.icon className="w-7 h-7" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-3">{feature.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{feature.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* --- NOTRE ENGAGEMENT (Texte + 1 Image) --- */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">Redonner à notre Lycée</h2>
              <p className="text-slate-600 text-lg leading-relaxed mb-6">
                Le Lycée Scientifique d'Excellence de Diourbel nous a donné les fondations de notre réussite. Aujourd'hui, c'est à notre tour de l'accompagner.
              </p>
              <ul className="space-y-4 mb-8">
                {[
                  "Financement de bourses pour les étudiants méritants",
                  "Achat de matériel pour les laboratoires",
                  "Journées d'orientation et de partage d'expérience"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-700 font-medium">
                    <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
                      <ArrowRight className="w-3 h-3" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
              <Link to="/don">
                <Button className="bg-[#0A2A5C] text-white hover:bg-blue-800 rounded-xl px-6">
                  Faire un don solidaire
                </Button>
              </Link>
            </motion.div>

            <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-xl bg-slate-100 relative">
              {images.philImage1 ? (
                <img src={getImageUrl(images.philImage1)} alt="Engagement CALSED" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center"><GraduationCap className="w-16 h-16 text-slate-300" /></div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* --- ACTUALITÉS --- */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Dernières actualités</h2>
              <p className="text-slate-500">La vie du réseau et du lycée.</p>
            </div>
            <Link to="/blog" className="hidden md:flex items-center text-[#0A2A5C] font-semibold hover:underline">
              Tout voir <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {featuredArticles.length > 0 ? (
              featuredArticles.map((post) => (
                <Link key={post._id || post.id} to={`/blog/${post._id || post.id}`} className="group">
                  <Card className="bg-white border-0 shadow-sm hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden h-full flex flex-col">
                    <div className="aspect-[16/10] bg-slate-100 overflow-hidden relative">
                      {post.image ? (
                        <img src={getImageUrl(post.image)} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-200"><ImageIcon className="w-8 h-8 text-slate-400" /></div>
                      )}
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-white/90 text-slate-900 backdrop-blur-sm border-none shadow-sm">
                          {post.category || "Actualité"}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-6 flex flex-col flex-1">
                      <p className="text-xs text-slate-400 font-medium mb-2">
                        {new Date(post.date || post.createdAt).toLocaleDateString('fr-FR')}
                      </p>
                      <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-[#0A2A5C] transition-colors line-clamp-2">
                        {post.title}
                      </h3>
                      <p className="text-slate-500 text-sm line-clamp-3 mb-4 flex-1">
                        {post.excerpt || "Découvrez les détails de cette actualité en lisant l'article complet."}
                      </p>
                      <div className="text-[#0A2A5C] font-semibold text-sm flex items-center">
                        Lire la suite <ArrowUpRight className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            ) : (
              <div className="col-span-full py-16 text-center bg-white rounded-2xl border border-dashed border-slate-200">
                <p className="text-slate-500">Aucun article à la une pour le moment.</p>
              </div>
            )}
          </div>
          
          <div className="mt-8 text-center md:hidden">
            <Link to="/blog">
              <Button variant="outline" className="w-full rounded-xl">Voir toutes les actualités</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* --- CTA FINAL (Simple et efficace) --- */}
      <section className="py-20 bg-[#0A2A5C]">
        <div className="container mx-auto px-6 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Prêt à rejoindre la communauté ?</h2>
            <p className="text-blue-200 max-w-2xl mx-auto mb-10 text-lg">
              Créez votre profil en 2 minutes, mettez à jour vos informations professionnelles et commencez à réseauter.
            </p>
            <Link to="/inscription">
              <Button size="lg" className="bg-amber-500 text-slate-900 hover:bg-amber-400 rounded-xl font-bold px-10 h-14 text-base shadow-lg">
                Créer mon compte
              </Button>
            </Link>
        </div>
      </section>

    </div>
  );
};

export default HomePage;