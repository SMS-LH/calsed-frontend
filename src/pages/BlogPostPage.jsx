import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { 
  ArrowLeft, Calendar, Clock, Facebook, Twitter, Linkedin, 
  Link2, MessageCircle, Send, Heart, FileText, Lock, Trash2, ChevronDown, Share2, X
} from "lucide-react";

import { useContent } from "@/context/ContentContext"; 
import { useAuth } from "@/context/AuthContext";

// IMPORT DU PONT API SÉCURISÉ
import api from "@/api/axios";

const BlogPostPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { blogPosts, refreshContent } = useContent(); 

  const [newComment, setNewComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [visibleCount, setVisibleCount] = useState(3);
  const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);
  const shareMenuRef = useRef(null);

  const post = blogPosts.find(p => (p._id || p.id).toString() === id);
  const [likes, setLikes] = useState([]);

  // --- CORRECTION : Spécifique pour Create React App (.env avec REACT_APP_) ---
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    // Si c'est une image Cloudinary ou Base64, on ne touche à rien
    if (imagePath.startsWith('http') || imagePath.startsWith('data:')) {
      return imagePath;
    }
    
    // Fallback sécurisé pour Create React App
    const baseUrl = process.env.REACT_APP_API_URL 
      ? process.env.REACT_APP_API_URL.replace(/\/api$/, '') 
      : "https://calsed-api.onrender.com";
      
    const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    return `${baseUrl}${cleanPath}`;
  };

  // --- LOGIQUE VISITEUR ---
  const getUserId = () => {
    if (user) return user._id || user.id;
    let visitorId = localStorage.getItem("calsed_visitor_id");
    if (!visitorId) {
      visitorId = "visitor_" + Math.random().toString(36).substr(2, 9);
      localStorage.setItem("calsed_visitor_id", visitorId);
    }
    return visitorId;
  };

  const currentUserId = getUserId();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    if (post?.likes) {
      setLikes(post.likes);
    }
  }, [post]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target)) {
        setIsShareMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="bg-white p-8 rounded-3xl shadow-sm text-center">
          <FileText className="h-16 w-16 mx-auto text-slate-200 mb-4" />
          <h1 className="text-2xl font-bold text-[#0A2A5C] mb-2">Article introuvable</h1>
          <p className="text-slate-500 mb-6">Cette publication n'existe plus ou a été déplacée.</p>
          <Link to="/blog"><Button className="bg-[#0A2A5C] rounded-full px-8">Retour au journal</Button></Link>
        </div>
      </div>
    );
  }

  const isLiked = likes.includes(currentUserId);

  const handleLike = async () => {
    // Optimistic UI Update
    let newLikes;
    if (isLiked) {
      newLikes = likes.filter(uid => uid !== currentUserId);
    } else {
      newLikes = [...likes, currentUserId];
    }
    setLikes(newLikes);

    try {
      // API call
      await api.put(`/posts/${id}/like`, { userId: currentUserId });
      
      refreshContent();
      if (!isLiked) toast.success("Vous aimez cet article !");
    } catch (err) {
      setLikes(post.likes || []);
      toast.error("Erreur lors de l'action");
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) return navigate("/connexion");
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      // Appel API via Axios (le token est envoyé automatiquement)
      await api.post(`/posts/${id}/comment`, {
        author: user.name,
        authorId: user._id || user.id,
        content: newComment
      });
      
      setNewComment("");
      refreshContent();
      toast.success("Commentaire publié !");
    } catch (err) {
      toast.error("Erreur d'envoi");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm("Supprimer ce commentaire ?")) return;
    try {
      await api.delete(`/posts/${id}/comment/${commentId}`);
      refreshContent();
      toast.success("Commentaire supprimé");
    } catch (err) {
      toast.error("Erreur de suppression");
    }
  };

  const handleShare = (platform) => {
    const url = window.location.href;
    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
      twitter: `https://twitter.com/intent/tweet?url=${url}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
    };
    if (platform === 'copy') {
      navigator.clipboard.writeText(url);
      toast.success("Lien copié dans le presse-papier");
    } else {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
    setIsShareMenuOpen(false); 
  };

  const allComments = post.comments || [];
  const sortedComments = [...allComments].reverse();
  const displayedComments = sortedComments.slice(0, visibleCount);
  const hasMore = visibleCount < allComments.length;
  const relatedPosts = blogPosts.filter(p => (p._id || p.id).toString() !== id).slice(0, 2);

  const formattedDate = new Date(post.date || Date.now()).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 pt-24 pb-20">
      
      <div className="container mx-auto px-4 lg:px-8 max-w-5xl">
        <div className="mb-8">
          <Link to="/blog" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-[#0A2A5C] transition-colors mb-6 group">
            <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" /> Retour au journal
          </Link>
          
          <div className="flex items-center gap-3 mb-6">
            <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-0 px-3 py-1 font-bold tracking-wide uppercase text-[10px]">
              {post.category}
            </Badge>
            <span className="text-slate-300 text-sm">•</span>
            <span className="text-slate-500 text-sm font-medium flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" /> {formattedDate}
            </span>
            {post.readTime && (
              <>
                <span className="text-slate-300 text-sm">•</span>
                <span className="text-slate-500 text-sm font-medium flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" /> {post.readTime}
                </span>
              </>
            )}
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black font-display text-[#0A2A5C] leading-[1.1] mb-8 max-w-4xl">
            {post.title}
          </h1>
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 max-w-6xl mb-16">
        <div className="relative aspect-video w-full overflow-hidden rounded-[2rem] shadow-xl">
          {post.image ? (
            <img src={getImageUrl(post.image)} alt={post.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-[#0A2A5C] flex items-center justify-center">
              <FileText className="h-20 w-20 text-white/20" />
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 lg:px-8 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-32 flex flex-col gap-6 items-center">
              <div className="flex flex-col gap-3 p-2 bg-white shadow-lg rounded-full border border-slate-100 items-center">
                
                <Button 
                  onClick={handleLike} 
                  size="icon"
                  className={`h-12 w-12 rounded-full transition-all duration-300 shadow-sm ${
                    isLiked 
                    ? 'bg-red-500 hover:bg-red-600 border-red-500 text-white scale-110' 
                    : 'bg-white border text-slate-400 hover:text-red-500 hover:bg-red-50 hover:border-red-200'
                  }`}
                >
                  <Heart className={`h-6 w-6 ${isLiked ? "fill-current" : ""}`} />
                </Button>
                <div className="text-center text-[10px] font-bold text-slate-400">{likes.length}</div>
                
                <div className="w-6 h-[1px] bg-slate-100 my-1" />

                <div className="relative" ref={shareMenuRef}>
                  <Button 
                    onClick={() => setIsShareMenuOpen(!isShareMenuOpen)} 
                    size="icon" 
                    variant="outline"
                    className={`h-12 w-12 rounded-full border-slate-200 text-slate-600 hover:bg-[#0A2A5C] hover:text-white hover:border-[#0A2A5C] transition-all ${isShareMenuOpen ? 'bg-[#0A2A5C] text-white border-[#0A2A5C]' : ''}`}
                  >
                    {isShareMenuOpen ? <X className="h-5 w-5"/> : <Share2 className="h-5 w-5" />}
                  </Button>

                  <AnimatePresence>
                    {isShareMenuOpen && (
                      <motion.div 
                        initial={{ opacity: 0, x: -20, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: -20, scale: 0.9 }}
                        className="absolute left-14 top-0 bg-white shadow-xl rounded-2xl border border-slate-100 p-2 flex flex-col gap-2 w-40 z-50"
                      >
                        <p className="text-[10px] uppercase font-bold text-slate-400 px-3 py-1">Partager sur</p>
                        <Button variant="ghost" onClick={() => handleShare('facebook')} className="justify-start text-sm h-10 rounded-xl hover:bg-blue-50 text-slate-700">
                          <Facebook className="h-4 w-4 mr-3 text-blue-600" /> Facebook
                        </Button>
                        <Button variant="ghost" onClick={() => handleShare('twitter')} className="justify-start text-sm h-10 rounded-xl hover:bg-sky-50 text-slate-700">
                          <Twitter className="h-4 w-4 mr-3 text-sky-500" /> Twitter
                        </Button>
                        <Button variant="ghost" onClick={() => handleShare('linkedin')} className="justify-start text-sm h-10 rounded-xl hover:bg-blue-50 text-slate-700">
                          <Linkedin className="h-4 w-4 mr-3 text-blue-700" /> LinkedIn
                        </Button>
                        <div className="h-[1px] bg-slate-100 my-1" />
                        <Button variant="ghost" onClick={() => handleShare('copy')} className="justify-start text-sm h-10 rounded-xl hover:bg-slate-50 text-slate-700">
                          <Link2 className="h-4 w-4 mr-3" /> Copier lien
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-10 lg:col-start-3">
            <div 
              className="prose prose-lg prose-slate max-w-none 
              prose-headings:font-display prose-headings:text-[#0A2A5C] prose-headings:font-bold
              prose-p:text-slate-600 prose-p:leading-relaxed prose-p:text-lg
              prose-a:text-amber-600 prose-a:no-underline hover:prose-a:underline
              prose-img:rounded-3xl prose-img:shadow-lg prose-blockquote:border-l-amber-400 prose-blockquote:bg-amber-50/30 prose-blockquote:py-2 prose-blockquote:px-6 prose-blockquote:rounded-r-lg"
              dangerouslySetInnerHTML={{ __html: post.content || post.excerpt }} 
            />

            <div className="mt-16 pt-8 border-t border-slate-100">
              <p className="text-sm font-bold text-slate-900 mb-3">Sujets abordés :</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-slate-500 border-slate-200 hover:border-[#0A2A5C] hover:text-[#0A2A5C] transition-colors cursor-pointer">#CALSED</Badge>
                <Badge variant="outline" className="text-slate-500 border-slate-200 hover:border-[#0A2A5C] hover:text-[#0A2A5C] transition-colors cursor-pointer">#{post.category}</Badge>
              </div>
            </div>

            <div className="lg:hidden mt-12 flex flex-col gap-4">
               <Button 
                 onClick={handleLike} 
                 className={`w-full rounded-xl h-14 text-lg font-bold shadow-lg ${
                   isLiked 
                   ? 'bg-red-500 hover:bg-red-600 text-white' 
                   : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
                 }`}
               >
                  <Heart className={`mr-2 h-6 w-6 ${isLiked ? "fill-current" : ""}`} /> 
                  {isLiked ? "Vous avez aimé" : "J'aime cet article"}
               </Button>
               
               <div className="grid grid-cols-4 gap-2">
                 <Button variant="outline" onClick={() => handleShare('facebook')} className="h-12 rounded-xl"><Facebook className="h-5 w-5 text-blue-600"/></Button>
                 <Button variant="outline" onClick={() => handleShare('twitter')} className="h-12 rounded-xl"><Twitter className="h-5 w-5 text-sky-500"/></Button>
                 <Button variant="outline" onClick={() => handleShare('linkedin')} className="h-12 rounded-xl"><Linkedin className="h-5 w-5 text-blue-700"/></Button>
                 <Button variant="outline" onClick={() => handleShare('copy')} className="h-12 rounded-xl"><Link2 className="h-5 w-5 text-slate-600"/></Button>
               </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-50 py-20 mt-20 border-t border-slate-200">
        <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
          <div className="flex items-center gap-4 mb-10">
            <h3 className="text-2xl font-bold text-[#0A2A5C]">Discussion</h3>
            <Badge variant="secondary" className="bg-white border border-slate-200 text-slate-600 rounded-full px-3">{allComments.length}</Badge>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6 md:p-8 mb-12">
            <form onSubmit={handleSubmitComment} className="relative">
              <Textarea
                placeholder={isAuthenticated ? "Partagez votre avis..." : "Connectez-vous pour rejoindre la discussion."}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="bg-slate-50 border-0 rounded-xl min-h-[100px] p-4 text-base focus-visible:ring-1 focus-visible:ring-[#0A2A5C] resize-none"
                disabled={!isAuthenticated || isSubmitting}
              />
              <div className="flex justify-between items-center mt-4">
                <p className="text-xs text-slate-400 hidden sm:block">Soyez respectueux et constructif.</p>
                {isAuthenticated ? (
                  <Button type="submit" disabled={isSubmitting || !newComment.trim()} className="bg-[#0A2A5C] text-white hover:bg-blue-900 rounded-full px-6">
                    {isSubmitting ? "Envoi..." : "Publier"} <Send className="ml-2 h-3.5 w-3.5" />
                  </Button>
                ) : (
                  <Link to="/connexion"><Button type="button" variant="outline" className="border-slate-200 rounded-full text-slate-600"><Lock className="mr-2 h-3.5 w-3.5" /> Se connecter</Button></Link>
                )}
              </div>
            </form>
          </div>

          <div className="space-y-8">
            <AnimatePresence>
              {displayedComments.map((comment) => (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} key={comment._id} className="group">
                  <div className="flex gap-4">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center text-amber-800 font-bold text-sm shrink-0 border-2 border-white shadow-sm">
                      {comment.author?.[0].toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="bg-white p-5 rounded-2xl rounded-tl-none shadow-sm border border-slate-100 relative">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <span className="font-bold text-slate-900 text-sm block">{comment.author}</span>
                            <span className="text-[10px] text-slate-400">{new Date(comment.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                          </div>
                          {isAuthenticated && (comment.authorId === (user?._id || user?.id) || user?.role === 'admin') && (
                            <button onClick={() => handleDeleteComment(comment._id)} className="text-slate-300 hover:text-red-500 transition-colors">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                        <p className="text-slate-600 text-sm leading-relaxed">{comment.content}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {hasMore && (
              <div className="text-center pt-6">
                <Button variant="ghost" onClick={() => setVisibleCount(prev => prev + 5)} className="text-slate-500 hover:text-[#0A2A5C] hover:bg-transparent font-medium">
                  Voir plus de commentaires <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </div>
            )}

            {allComments.length === 0 && (
              <div className="text-center py-10 opacity-50">
                <MessageCircle className="h-10 w-10 mx-auto mb-2 text-slate-300" />
                <p>Aucun commentaire.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {relatedPosts.length > 0 && (
        <div className="container mx-auto px-4 lg:px-8 max-w-6xl mt-20 pt-10 border-t border-slate-100">
          <h3 className="text-xl font-bold text-[#0A2A5C] mb-8">À lire aussi</h3>
          <div className="grid md:grid-cols-2 gap-8">
            {relatedPosts.map((relatedPost) => (
              <Link key={relatedPost._id || relatedPost.id} to={`/blog/${relatedPost._id || relatedPost.id}`} className="group flex gap-6 items-start">
                <div className="w-32 h-24 rounded-xl bg-slate-100 overflow-hidden shrink-0">
                  {relatedPost.image && <img src={getImageUrl(relatedPost.image)} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />}
                </div>
                <div>
                  <Badge variant="outline" className="mb-2 text-[10px] border-slate-200 text-slate-500">{relatedPost.category}</Badge>
                  <h4 className="font-bold text-slate-900 group-hover:text-[#0A2A5C] transition-colors leading-snug mb-1 line-clamp-2">{relatedPost.title}</h4>
                  <p className="text-xs text-slate-400">Lecture : 5 min</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogPostPage;