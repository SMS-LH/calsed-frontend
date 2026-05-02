import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  GraduationCap, Globe2,
  Users2, HeartHandshake, BookOpen,
  ChevronRight, ArrowUpRight, Lightbulb,
  Building2
} from "lucide-react";
import { useContent } from "@/context/ContentContext";
import api from "../api/axios";

// Animations
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const stagger = {
  hidden: { opacity: 0 },
  visible: { transition: { staggerChildren: 0.15 } }
};

const HomePage = () => {
  const { blogPosts } = useContent();
  const { pathname } = useLocation();

  const [images, setImages] = useState({
    heroImage: "",
    philImage1: "",
    schoolImage: "",
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
          schoolImage: data.schoolImage || "",
        });
      }
    } catch (error) {
      console.error("Erreur de chargement des images.");
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
      
      {/* --- HERO SECTION --- */}
      <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 lg:pt-48 lg:pb-32 overflow-hidden">
  
  {/* IMAGE DE FOND */}
  {images.heroImage && (
    <div className="absolute inset-0 z-0">
      <img 
        src={getImageUrl(images.heroImage)} 
        alt="Fond CALSED" 
        className="w-full h-full object-cover"
      />
    </div>
  )}

  {/* OVERLAY SOMBRE */}
  <div className="absolute inset-0 bg-[#0A2A5C]/70 z-10"></div>

  {/* DECOR */}
  <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-800/40 via-transparent to-transparent z-10"></div>
  <div className="absolute bottom-10 left-10 w-64 h-64 md:w-96 md:h-96 bg-amber-500/10 rounded-full blur-3xl z-10"></div>

  {/* CONTENU */}
  <div className="container mx-auto px-4 md:px-6 lg:px-12 relative z-20">
    <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
      
      {/* TEXTE */}
      <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-2xl text-center lg:text-left mx-auto lg:mx-0">
        <motion.div variants={fadeUp} className="mb-4 md:mb-6">
          <Badge className="bg-white/10 text-amber-400 border border-white/10 px-4 py-1.5 rounded-full text-xs backdrop-blur-sm">
            Association Officielle
          </Badge>
        </motion.div>

        <motion.h1 variants={fadeUp} className="text-4xl md:text-6xl font-black text-white mb-6 leading-tight">
          L'excellence scientifique, <br />
          <span className="text-amber-400">notre engagement commun.</span>
        </motion.h1>

        <motion.p variants={fadeUp} className="text-lg text-blue-100 mb-10">
          Bienvenue sur le site du CALSED. Nous fédérons les talents pour soutenir notre lycée et bâtir un réseau fort.
        </motion.p>

        <motion.div variants={fadeUp} className="flex gap-4 justify-center lg:justify-start">
          <Link to="/inscription">
            <Button className="bg-amber-500 text-slate-900 font-bold px-8 h-12 rounded-xl">
              Espace Alumni
            </Button>
          </Link>

          <Link to="/contact">
            <Button variant="outline" className="border-white text-white px-8 h-12 rounded-xl">
              Contact
            </Button>
          </Link>
        </motion.div>
      </motion.div>

      {/* IMAGE DU LYCEE */}
      <div className="hidden lg:block">
        <div className="rounded-3xl overflow-hidden shadow-2xl border border-white/10 h-[400px]">
          <img 
            src={images.schoolImage ? getImageUrl(images.schoolImage) : "/lycee.jpg"} 
            alt="Lycée"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

    </div>
  </div>

</section>
      {/* --- STATS RAPIDES --- */}
      <section className="py-8 md:py-12 bg-[#08224a] text-white border-t border-white/5">
        <div className="container mx-auto px-4 md:px-6 lg:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 divide-x divide-blue-800/50">
            {[
              { number: "2016", label: "Année de création" },
              { number: "+500", label: "Anciens élèves" },
              { number: "15", label: "Pays de résidence" },
              { number: "100%", label: "Engagement" }
            ].map((stat, i) => (
              <div key={i} className="text-center px-2 md:px-4">
                <p className="text-2xl sm:text-3xl md:text-4xl font-black text-amber-400 mb-1">{stat.number}</p>
                <p className="text-[10px] md:text-sm text-blue-200 font-medium uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- NOS MISSIONS --- */}
      <section className="py-16 md:py-24 bg-slate-50">
        <div className="container mx-auto px-4 md:px-6 lg:px-12">
          <div className="text-center max-w-2xl mx-auto mb-10 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-3 md:mb-4">Pourquoi le CALSED existe ?</h2>
            <p className="text-sm md:text-base text-slate-600">Notre association repose sur trois piliers fondamentaux visant à créer un impact positif et pérenne.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {[
              { icon: BookOpen, color: "text-blue-600", bg: "bg-blue-100", title: "Soutenir notre Lycée", text: "Nous accompagnons le LSED par des dons de matériel pédagogique et l'organisation de journées d'orientation pour les élèves actuels." },
              { icon: Users2, color: "text-amber-600", bg: "bg-amber-100", title: "Fédérer les Alumni", text: "Nous maintenons le lien entre toutes les promotions à travers un annuaire mondial, des événements et des rencontres régulières." },
              { icon: Lightbulb, color: "text-green-600", bg: "bg-green-100", title: "Inspirer l'Excellence", text: "Nous valorisons les parcours inspirants de nos membres pour motiver la jeunesse sénégalaise à embrasser les carrières scientifiques." }
            ].map((feature, i) => (
              <Card key={i} className="bg-white border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 rounded-2xl group hover:-translate-y-1">
                <CardContent className="p-6 md:p-8 text-center flex flex-col items-center">
                  <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center mb-4 md:mb-6 ${feature.bg} ${feature.color} group-hover:scale-110 transition-transform`}>
                    <feature.icon className="w-7 h-7 md:w-8 md:h-8" />
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-2 md:mb-3">{feature.title}</h3>
                  <p className="text-slate-500 text-xs md:text-sm leading-relaxed">{feature.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* --- PARTENARIAT --- */}
      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 md:px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            
            <div className="order-2 lg:order-1 aspect-[4/3] rounded-2xl md:rounded-3xl overflow-hidden shadow-lg md:shadow-xl bg-slate-100 relative">
              {images.philImage1 ? (
                <img src={getImageUrl(images.philImage1)} alt="Actions CALSED" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400">
                    <HeartHandshake className="w-12 h-12 md:w-16 md:h-16 mb-3 md:mb-4 opacity-50" />
                    <p className="font-medium text-xs md:text-sm mt-1 md:mt-2">Image d'action (Admin)</p>
                </div>
              )}
            </div>

            <motion.div className="order-1 lg:order-2" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-none px-3 py-1 mb-3 md:mb-4 text-[10px] md:text-xs">
                Agir ensemble
              </Badge>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-4 md:mb-6 leading-tight">Investissez dans l'excellence.</h2>
              <p className="text-sm md:text-lg text-slate-600 leading-relaxed mb-4 md:mb-6">
                Le CALSED s'implique activement dans l'amélioration du cadre d'apprentissage du lycée en finançant des projets pédagogiques et en contribuant à l'équipement des laboratoires scientifiques.
              </p>
              <p className="text-sm md:text-lg text-slate-600 leading-relaxed mb-6 md:mb-8">
                Devenez partenaire de nos initiatives pour accompagner le développement de l'établissement et soutenir nos projets.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                <Link to="/contact" className="w-full sm:w-auto">
                  <Button className="w-full bg-[#0A2A5C] text-white hover:bg-blue-800 rounded-xl px-6 md:px-8 h-12 text-sm md:text-base">
                    Devenir partenaire
                  </Button>
                </Link>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* --- ACTUALITÉS --- */}
      <section className="py-16 md:py-24 bg-slate-50">
        <div className="container mx-auto px-4 md:px-6 lg:px-12">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 md:mb-12 gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1 md:mb-2">Nos dernières actualités</h2>
              <p className="text-sm md:text-base text-slate-500">Suivez les actions de l'association et la vie du lycée.</p>
            </div>
            <Link to="/blog" className="hidden sm:flex items-center text-[#0A2A5C] font-semibold hover:underline text-sm md:text-base">
              Tout voir <ChevronRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8">
            {featuredArticles.length > 0 ? (
              featuredArticles.map((post) => (
                <Link key={post._id || post.id} to={`/blog/${post._id || post.id}`} className="group">
                  <Card className="bg-white border-0 shadow-sm hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden h-full flex flex-col">
                    <div className="aspect-[16/10] bg-slate-100 overflow-hidden relative">
                      {post.image ? (
                        <img src={getImageUrl(post.image)} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-200"><Globe2 className="w-6 h-6 md:w-8 md:h-8 text-slate-400" /></div>
                      )}
                      <div className="absolute top-3 left-3 md:top-4 md:left-4">
                        <Badge className="bg-white/90 text-slate-900 backdrop-blur-sm border-none shadow-sm text-[10px] md:text-xs px-2 py-0.5 md:py-1">
                          {post.category || "Association"}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-5 md:p-6 flex flex-col flex-1">
                      <p className="text-[10px] md:text-xs text-slate-400 font-medium mb-1.5 md:mb-2">
                        {new Date(post.date || post.createdAt).toLocaleDateString('fr-FR')}
                      </p>
                      <h3 className="text-lg md:text-xl font-bold text-slate-900 mb-2 md:mb-3 group-hover:text-[#0A2A5C] transition-colors line-clamp-2 leading-snug">
                        {post.title}
                      </h3>
                      <p className="text-slate-500 text-xs md:text-sm line-clamp-3 mb-4 flex-1">
                        {post.excerpt || "Découvrez les détails de nos actions en lisant cet article."}
                      </p>
                      <div className="text-[#0A2A5C] font-semibold text-xs md:text-sm flex items-center">
                        Lire la suite <ArrowUpRight className="w-3 h-3 md:w-4 md:h-4 ml-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            ) : (
              <div className="col-span-full py-12 md:py-16 text-center bg-white rounded-2xl border border-dashed border-slate-200">
                <p className="text-sm md:text-base text-slate-500">Aucun article public pour le moment.</p>
              </div>
            )}
          </div>
          
          <div className="mt-6 md:mt-8 text-center sm:hidden">
            <Link to="/blog" className="w-full block">
              <Button variant="outline" className="w-full rounded-xl h-12 border-slate-200 text-slate-700">Voir toutes les actualités</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* --- CTA FINAL --- */}
      <section className="py-16 md:py-20 bg-white border-t border-slate-100">
        <div className="container mx-auto px-4 md:px-6">
            <div className="bg-[#0A2A5C] rounded-2xl md:rounded-3xl p-8 md:p-10 lg:p-16 text-center relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-48 h-48 md:w-64 md:h-64 bg-amber-400/20 rounded-full blur-2xl md:blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3 md:mb-4 relative z-10 leading-tight">Faites partie de l'histoire</h2>
              <p className="text-blue-200 max-w-2xl mx-auto mb-8 md:mb-10 text-sm md:text-lg relative z-10 leading-relaxed">
                Que vous soyez un ancien élève cherchant à retrouver sa promotion ou un partenaire souhaitant nous accompagner.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center gap-3 md:gap-4 relative z-10">
                <Link to="/inscription" className="w-full sm:w-auto">
                  <Button size="lg" className="bg-amber-500 text-slate-900 hover:bg-amber-400 rounded-xl font-bold px-6 md:px-8 h-12 md:h-14 w-full text-sm md:text-base">
                    Je suis un Ancien Élève
                  </Button>
                </Link>
                <Link to="/contact" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 rounded-xl font-medium px-6 md:px-8 h-12 md:h-14 w-full text-sm md:text-base">
                    Nous contacter
                  </Button>
                </Link>
              </div>
            </div>
        </div>
      </section>

    </div>
  );
};

export default HomePage;
