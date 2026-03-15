import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight, GraduationCap, Globe2,
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
      
      {/* --- HERO SECTION (Vitrine Publique) --- */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-white">
        {/* Décors d'arrière-plan */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-slate-50 rounded-bl-[100px] -z-10 hidden lg:block"></div>
        <div className="absolute top-20 right-20 w-72 h-72 bg-amber-400/10 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-[#0A2A5C]/5 rounded-full blur-3xl -z-10"></div>

        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            
            {/* Colonne Texte */}
            <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-2xl">
              <motion.div variants={fadeUp} className="mb-6">
                <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-none px-4 py-1.5 rounded-full font-semibold uppercase tracking-wider text-xs">
                  Association Officielle
                </Badge>
              </motion.div>
              
              <motion.h1 variants={fadeUp} className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 mb-6 leading-[1.15] tracking-tight">
                L'excellence scientifique, <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0A2A5C] to-blue-600">notre engagement commun.</span>
              </motion.h1>
              
              <motion.p variants={fadeUp} className="text-lg text-slate-600 mb-10 leading-relaxed font-light">
                Bienvenue sur le site du Collectif des Anciens du Lycée Scientifique d'Excellence de Diourbel (CALSED). Nous fédérons les talents de demain pour soutenir notre lycée et bâtir un réseau solidaire à travers le monde.
              </motion.p>
              
              <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4">
                <Link to="/don">
                  <Button size="lg" className="w-full sm:w-auto bg-[#0A2A5C] hover:bg-blue-800 text-white h-14 px-8 rounded-xl font-bold shadow-lg shadow-blue-900/20 transition-all hover:-translate-y-1">
                    Soutenir nos actions
                  </Button>
                </Link>
                <Link to="/inscription">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto border-slate-200 text-slate-700 hover:bg-slate-50 h-14 px-8 rounded-xl font-semibold transition-all">
                    Espace Alumni
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
                  <img src={getImageUrl(images.heroImage)} alt="Lycée Scientifique d'Excellence de Diourbel" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400">
                    <Building2 className="w-16 h-16 mb-4 opacity-50" />
                    <p className="font-medium">Image du Lycée ou de l'association</p>
                  </div>
                )}
                {/* Petite carte flottante déco (Grand public) */}
                <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-4 animate-bounce hover:animate-none">
                  <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
                    <GraduationCap className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 font-medium">Notre fierté</p>
                    <p className="text-sm font-bold text-slate-900">100% de réussite au BAC</p>
                  </div>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* --- STATS RAPIDES (Impact) --- */}
      <section className="py-12 bg-[#0A2A5C] text-white">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-blue-800/50">
            {[
              { number: "2016", label: "Année de création" },
              { number: "+500", label: "Anciens élèves" },
              { number: "15", label: "Pays de résidence" },
              { number: "100%", label: "Engagement solidaire" }
            ].map((stat, i) => (
              <div key={i} className="text-center px-4">
                <p className="text-3xl md:text-4xl font-black text-amber-400 mb-1">{stat.number}</p>
                <p className="text-sm text-blue-200 font-medium uppercase tracking-wider">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- NOS MISSIONS (Pour le grand public) --- */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Pourquoi le CALSED existe ?</h2>
            <p className="text-slate-600">Notre association repose sur trois piliers fondamentaux visant à créer un impact positif et durable.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: BookOpen, color: "text-blue-600", bg: "bg-blue-100", title: "Soutenir notre Lycée", text: "Nous accompagnons le LSED par des dons de matériel, des bourses d'études et des journées d'orientation pour les élèves actuels." },
              { icon: Users2, color: "text-amber-600", bg: "bg-amber-100", title: "Fédérer les Alumni", text: "Nous maintenons le lien entre toutes les promotions à travers un annuaire mondial, des événements et des rencontres régulières." },
              { icon: Lightbulb, color: "text-green-600", bg: "bg-green-100", title: "Inspirer l'Excellence", text: "Nous valorisons les parcours inspirants de nos membres pour motiver la jeunesse sénégalaise à embrasser les carrières scientifiques." }
            ].map((feature, i) => (
              <Card key={i} className="bg-white border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 rounded-2xl group hover:-translate-y-1">
                <CardContent className="p-8 text-center flex flex-col items-center">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${feature.bg} ${feature.color} group-hover:scale-110 transition-transform`}>
                    <feature.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">{feature.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* --- SOUTIEN & PARTENARIAT (Texte + 1 Image) --- */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            
            <div className="order-2 lg:order-1 aspect-[4/3] rounded-3xl overflow-hidden shadow-xl bg-slate-100 relative">
              {images.philImage1 ? (
                <img src={getImageUrl(images.philImage1)} alt="Actions CALSED" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center"><HeartHandshake className="w-16 h-16 text-slate-300" /></div>
              )}
            </div>

            <motion.div className="order-1 lg:order-2" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-none px-3 py-1 mb-4">
                Agir ensemble
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">Investissez dans la jeunesse scientifique.</h2>
              <p className="text-slate-600 text-lg leading-relaxed mb-6">
                Le CALSED finance régulièrement des projets pédagogiques, équipe les laboratoires du lycée et soutient les étudiants issus de milieux modestes dans leurs études supérieures.
              </p>
              <p className="text-slate-600 text-lg leading-relaxed mb-8">
                Que vous soyez un parent d'élève, une entreprise ou un philanthrope, votre soutien est précieux.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/don">
                  <Button className="bg-[#0A2A5C] text-white hover:bg-blue-800 rounded-xl px-8 h-12 w-full sm:w-auto">
                    Faire un don
                  </Button>
                </Link>
                <Link to="/contact">
                  <Button variant="outline" className="rounded-xl px-8 h-12 w-full sm:w-auto border-slate-300 text-slate-700">
                    Devenir partenaire
                  </Button>
                </Link>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* --- ACTUALITÉS PUBLIQUES --- */}
      <section className="py-24 bg-slate-50">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Nos dernières actualités</h2>
              <p className="text-slate-500">Suivez les actions de l'association et la vie du lycée.</p>
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
                        <div className="w-full h-full flex items-center justify-center bg-slate-200"><Globe2 className="w-8 h-8 text-slate-400" /></div>
                      )}
                      <div className="absolute top-4 left-4">
                        <Badge className="bg-white/90 text-slate-900 backdrop-blur-sm border-none shadow-sm">
                          {post.category || "Association"}
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
                        {post.excerpt || "Découvrez les détails de nos actions en lisant cet article."}
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
                <p className="text-slate-500">Aucun article public pour le moment.</p>
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

      {/* --- CTA FINAL (Double Audience) --- */}
      <section className="py-20 bg-white border-t border-slate-100">
        <div className="container mx-auto px-6">
            <div className="bg-[#0A2A5C] rounded-3xl p-10 md:p-16 text-center relative overflow-hidden shadow-2xl">
              {/* Cercles déco */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-400/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
              
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 relative z-10">Faites partie de l'histoire</h2>
              <p className="text-blue-200 max-w-2xl mx-auto mb-10 text-lg relative z-10">
                Que vous soyez un ancien élève cherchant à retrouver sa promotion ou un partenaire souhaitant nous accompagner.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
                <Link to="/inscription">
                  <Button size="lg" className="bg-amber-500 text-slate-900 hover:bg-amber-400 rounded-xl font-bold px-8 h-14 w-full sm:w-auto">
                    Je suis un Ancien Élève
                  </Button>
                </Link>
                <Link to="/contact">
                  <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 rounded-xl font-medium px-8 h-14 w-full sm:w-auto">
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