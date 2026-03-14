import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { 
  FileText, ArrowLeft, Trash2, Pencil, 
  Loader2, Plus, Star, Eye, Image as ImageIcon,
  Calendar, Folder, CheckCircle 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import { useContent } from "@/context/ContentContext";
import { toast } from "sonner";
import api from "../api/axios";

const AdminBlogPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { blogPosts, fetchBlogPosts } = useContent();

  const [uploading, setUploading] = useState(false);
  const [editingPostId, setEditingPostId] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  // État initial de l'article
  const defaultArticle = { 
    title: "", 
    excerpt: "", 
    content: "", 
    image: "", 
    category: "Actualité", 
    featured: false 
  };
  const [newArticle, setNewArticle] = useState(defaultArticle);

  // --- CONFIGURATION DE L'ÉDITEUR ---
  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
      ['link', 'image', 'video'], 
      ['clean']
    ],
  };

  // --- UTILITAIRE IMAGE : CORRIGÉ POUR CREATE REACT APP ---
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    
    // Si c'est Cloudinary ou Base64, on ne touche à rien
    if (imagePath.startsWith('http') || imagePath.startsWith('data:')) {
      return imagePath;
    }
    
    // On utilise process.env car tu es sur Create React App
    const baseUrl = process.env.REACT_APP_API_URL 
      ? process.env.REACT_APP_API_URL.replace(/\/api$/, '') 
      : "https://calsed-api.onrender.com";
      
    const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    return `${baseUrl}${cleanPath}`;
  };

  // --- ACTIONS ---
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setUploading(true);
    const toastId = toast.loading("Téléchargement de l'image de couverture...");

    try {
      const { data } = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success("Image téléchargée !", { id: toastId });
      
      // On récupère directement l'URL Cloudinary
      const imageUrl = typeof data === 'string' ? data : data.url;
      setNewArticle(prev => ({ ...prev, image: imageUrl }));
    } catch (error) {
      toast.error("Erreur de téléchargement", { id: toastId });
    } finally {
      setUploading(false);
    }
  };

  const handleSaveArticle = async () => {
    // Nettoyage pour vérifier si l'éditeur n'est pas vide
    const cleanContent = newArticle.content.replace(/<[^>]*>?/gm, '').trim();
    
    if (!newArticle.title || !cleanContent) {
      return toast.error("Le titre et le contenu sont obligatoires.");
    }
    
    const finalArticle = { ...newArticle, featured: Boolean(newArticle.featured) };
    if (!finalArticle.excerpt) {
      finalArticle.excerpt = cleanContent.substring(0, 100) + '...';
    }

    const toastId = toast.loading(editingPostId ? "Mise à jour en cours..." : "Publication en cours...");
    
    try {
      if (editingPostId) {
        await api.put(`/posts/${editingPostId}`, finalArticle);
      } else {
        await api.post('/posts', finalArticle);
      }

      if (fetchBlogPosts) {
        await fetchBlogPosts();
      }

      toast.success(editingPostId ? "Article mis à jour avec succès !" : "Article publié avec succès !", { id: toastId });
      setEditingPostId(null);
      setNewArticle(defaultArticle);
      setShowPreview(false);
      
    } catch (error) {
      console.error("Erreur Backend :", error.response?.data || error);
      toast.error(error.response?.data?.message || "Erreur lors de la sauvegarde", { id: toastId });
    }
  };

  const handleDeleteArticle = async (postId, title) => {
    if (!window.confirm(`Supprimer définitivement l'article "${title}" ?`)) return;
    
    const toastId = toast.loading("Suppression en cours...");
    try {
      await api.delete(`/posts/${postId}`);
      if(fetchBlogPosts) {
        await fetchBlogPosts();
      }
      toast.success("Article supprimé.", { id: toastId });
    } catch (error) { 
      console.error("Erreur Backend Suppression :", error.response?.data || error);
      toast.error("Erreur lors de la suppression.", { id: toastId }); 
    }
  };

  const handleEditClick = (post) => {
    setEditingPostId(post.id || post._id);
    setNewArticle({
      title: post.title || "",
      excerpt: post.excerpt || "",
      content: post.content || "",
      image: post.image || "",
      category: post.category || "Actualité",
      featured: post.featured || false
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingPostId(null);
    setNewArticle(defaultArticle);
    setShowPreview(false);
  };

  return (
    <div className="min-h-screen pt-24 pb-20 bg-slate-50/50">
      <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
        
        {/* EN-TÊTE ET NAVIGATION */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <Button variant="ghost" onClick={() => navigate("/admin")} className="mb-2 -ml-4 text-slate-500 hover:text-[#0A2A5C]">
              <ArrowLeft className="h-4 w-4 mr-2" /> Retour au Dashboard
            </Button>
            <h1 className="text-3xl font-bold font-display text-[#0A2A5C] flex items-center gap-3">
              <FileText className="h-8 w-8 text-green-600" /> Journal & Communication
            </h1>
          </div>
          <Button onClick={() => {handleCancelEdit(); window.scrollTo({ top: 0, behavior: 'smooth' });}} className="bg-[#0A2A5C] hover:bg-[#08224a] text-white">
            <Plus className="h-4 w-4 mr-2" /> Nouvel Article
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 items-start">
          
          {/* COLONNE GAUCHE : L'ÉDITEUR */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-0 shadow-sm bg-white overflow-hidden">
              <CardHeader className={`${editingPostId ? 'bg-amber-50' : 'bg-slate-50'} border-b flex flex-row items-center justify-between`}>
                <CardTitle className="text-[#0A2A5C]">
                  {editingPostId ? "Modifier l'article" : "Rédiger un nouvel article"}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase text-slate-400">Mode Aperçu</span>
                  <Switch checked={showPreview} onCheckedChange={setShowPreview} />
                </div>
              </CardHeader>
              
              <CardContent className="p-6">
                {showPreview ? (
                  // MODE APERÇU (Styles optimisés pour ReactQuill)
                  <div className="bg-white p-6 md:p-10 rounded-xl border border-dashed border-slate-300 min-h-[400px]">
                    <div className="mb-8 text-center">
                      <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 mb-4">{newArticle.category}</Badge>
                      <h1 className="text-3xl md:text-4xl font-black text-[#0A2A5C] leading-tight mb-4">{newArticle.title || "Titre de votre article"}</h1>
                      {newArticle.excerpt && <p className="text-xl text-slate-500 italic font-serif max-w-2xl mx-auto">"{newArticle.excerpt}"</p>}
                    </div>
                    
                    {newArticle.image && (
                      <div className="w-full h-64 md:h-96 rounded-2xl overflow-hidden mb-10 shadow-lg">
                        {/* Application de getImageUrl ici */}
                        <img src={getImageUrl(newArticle.image)} alt="Couverture" className="w-full h-full object-cover" />
                      </div>
                    )}
                    
                    {/* Le conteneur "prose" de Tailwind est indispensable pour que le HTML de ReactQuill soit joli */}
                    <div 
                      className="prose prose-lg max-w-none prose-headings:text-[#0A2A5C] prose-a:text-blue-600 hover:prose-a:text-blue-500 prose-img:rounded-xl"
                      dangerouslySetInnerHTML={{ __html: newArticle.content || "<p class='text-slate-400 text-center italic'>Commencez à rédiger pour voir l'aperçu du contenu...</p>" }} 
                    />
                  </div>
                ) : (
                  // MODE ÉDITION
                  <div className="space-y-8">
                    {/* Titre */}
                    <div>
                      <Input 
                        placeholder="Titre accrocheur..." 
                        value={newArticle.title} 
                        onChange={(e) => setNewArticle({...newArticle, title: e.target.value})} 
                        className="text-2xl font-bold h-14 border-0 border-b-2 border-slate-200 rounded-none focus-visible:ring-0 focus-visible:border-[#0A2A5C] px-0 bg-transparent" 
                      />
                    </div>

                    {/* Catégorie & Mise en avant */}
                    <div className="grid sm:grid-cols-2 gap-6 p-5 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="space-y-3">
                        <Label className="text-xs text-slate-500 uppercase font-bold flex items-center gap-2"><Folder className="h-4 w-4"/> Rubrique</Label>
                        <Select value={newArticle.category} onValueChange={(val) => setNewArticle({...newArticle, category: val})}>
                          <SelectTrigger className="bg-white border-slate-200 shadow-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Actualité">Actualité / Flash info</SelectItem>
                            <SelectItem value="Événement">Événement / Rencontre</SelectItem>
                            <SelectItem value="Portrait">Portrait de membre</SelectItem>
                            <SelectItem value="Tribune">Tribune / Opinion</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-3">
                        <Label className="text-xs text-slate-500 uppercase font-bold flex items-center gap-2"><Star className="h-4 w-4"/> Visibilité</Label>
                        <div className="flex items-center justify-between border border-slate-200 px-4 h-10 rounded-md bg-white shadow-sm">
                          <span className="text-sm font-medium text-slate-700">Mettre à la une</span>
                          <Switch checked={newArticle.featured} onCheckedChange={(val) => setNewArticle({...newArticle, featured: val})} />
                        </div>
                      </div>
                    </div>

                    {/* Image de couverture */}
                    <div className="space-y-3">
                      <Label className="text-xs text-slate-500 uppercase font-bold flex items-center gap-2"><ImageIcon className="h-4 w-4"/> Image de couverture</Label>
                      <div className="flex flex-col sm:flex-row gap-6 items-start p-5 bg-slate-50 rounded-xl border border-slate-100">
                        {newArticle.image ? (
                          <div className="relative h-32 w-48 rounded-lg overflow-hidden border shadow-sm group shrink-0">
                            {/* Application de getImageUrl ici */}
                            <img src={getImageUrl(newArticle.image)} className="h-full w-full object-cover" alt="Preview"/>
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Button size="sm" variant="destructive" onClick={() => setNewArticle({...newArticle, image: ""})} className="h-8 text-xs font-bold">Retirer</Button>
                            </div>
                          </div>
                        ) : (
                          <div className="h-32 w-48 rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center bg-white shrink-0">
                            <ImageIcon className="h-8 w-8 text-slate-300 mb-2"/>
                            <span className="text-[10px] text-slate-400 uppercase font-bold">Aucune image</span>
                          </div>
                        )}
                        
                        <div className="flex-1 space-y-4 w-full">
                          <div>
                            <Input type="file" accept="image/*" onChange={handleFileUpload} disabled={uploading} className="cursor-pointer bg-white"/>
                            <p className="text-[11px] text-slate-500 mt-2">Format recommandé : JPG ou PNG. Max 5MB.</p>
                          </div>
                          <div className="relative">
                            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-200" /></div>
                            <div className="relative flex justify-center text-xs uppercase"><span className="bg-slate-50 px-2 text-slate-400 font-bold">OU</span></div>
                          </div>
                          <Input placeholder="Coller une URL d'image externe..." value={newArticle.image} onChange={(e) => setNewArticle({...newArticle, image: e.target.value})} className="bg-white" />
                        </div>
                      </div>
                    </div>

                    {/* Extrait */}
                    <div className="space-y-3">
                      <Label className="text-xs text-slate-500 uppercase font-bold flex justify-between">
                        <span>Extrait (Résumé affiché sur l'accueil)</span>
                        <span className="text-slate-400 font-normal">Optionnel</span>
                      </Label>
                      <Input 
                        placeholder="Une phrase courte pour donner envie de lire..." 
                        value={newArticle.excerpt} 
                        onChange={(e) => setNewArticle({...newArticle, excerpt: e.target.value})} 
                        className="bg-slate-50 border-slate-200"
                      />
                    </div>

                    {/* Éditeur de texte riche */}
                    <div className="space-y-3 pt-2">
                      <Label className="text-xs text-slate-500 uppercase font-bold">Contenu principal de l'article</Label>
                      <div className="bg-white rounded-xl overflow-hidden border shadow-sm focus-within:ring-2 focus-within:ring-[#0A2A5C] focus-within:border-transparent transition-all">
                        <ReactQuill 
                          theme="snow" 
                          value={newArticle.content} 
                          onChange={(val) => setNewArticle({...newArticle, content: val})} 
                          modules={quillModules} 
                          className="min-h-[300px] border-0 pb-12" 
                          placeholder="Commencez à rédiger votre chef-d'œuvre ici..."
                        />
                      </div>
                    </div>

                  </div>
                )}
              </CardContent>

              <CardFooter className="p-6 bg-slate-50 border-t flex gap-4 justify-end">
                {editingPostId && (
                  <Button variant="outline" onClick={handleCancelEdit} className="border-slate-300 text-slate-600 bg-white">
                    Annuler les modifications
                  </Button>
                )}
                <Button onClick={handleSaveArticle} disabled={uploading || !newArticle.title} className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-[150px] shadow-md">
                  {uploading ? <Loader2 className="animate-spin h-4 w-4 mr-2"/> : <CheckCircle className="h-4 w-4 mr-2"/>}
                  {editingPostId ? "Enregistrer" : "Publier l'article"}
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* COLONNE DROITE : LISTE DES ARTICLES */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-sm bg-white sticky top-24">
              <CardHeader className="border-b bg-[#0A2A5C] text-white rounded-t-xl">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5" /> 
                  Articles publiés ({blogPosts.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y max-h-[calc(100vh-250px)] overflow-y-auto custom-scrollbar">
                  {blogPosts.map(post => (
                    <div key={post.id || post._id} className="p-5 hover:bg-slate-50 transition-colors group">
                      <div className="flex justify-between items-start mb-3">
                        <Badge variant="outline" className={`text-[10px] uppercase font-bold tracking-wider ${post.featured ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-slate-100 text-slate-600'}`}>
                          {post.featured && <Star className="h-3 w-3 mr-1.5 fill-amber-500 text-amber-500" />}
                          {post.category || "Article"}
                        </Badge>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-blue-600 hover:bg-blue-100" onClick={() => handleEditClick(post)} title="Modifier">
                            <Pencil className="h-4 w-4"/>
                          </Button>
                          <Button size="icon" variant="ghost" className="h-8 w-8 text-red-500 hover:bg-red-100" onClick={() => handleDeleteArticle(post.id || post._id, post.title)} title="Supprimer">
                            <Trash2 className="h-4 w-4"/>
                          </Button>
                        </div>
                      </div>
                      
                      <p className="font-bold text-[#0A2A5C] text-base line-clamp-2 leading-snug mb-2 group-hover:text-blue-600 transition-colors cursor-pointer" onClick={() => handleEditClick(post)}>
                        {post.title}
                      </p>
                      
                      <p className="text-[11px] text-slate-500 flex items-center gap-1.5 font-medium">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" /> 
                        {new Date(post.date || post.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  ))}

                  {blogPosts.length === 0 && (
                    <div className="p-10 text-center text-slate-400">
                      <FileText className="h-10 w-10 mx-auto mb-3 opacity-30" />
                      <p className="text-sm font-medium">Aucun article publié.</p>
                      <p className="text-xs mt-1">Vos articles apparaîtront ici.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminBlogPage;