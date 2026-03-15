import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

// --- IMPORTS TIPTAP ---
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import LinkExtension from '@tiptap/extension-link';
import ImageResize from 'tiptap-extension-resize-image';
import UnderlineExtension from '@tiptap/extension-underline';
import TextAlignExtension from '@tiptap/extension-text-align';
import YoutubeExtension from '@tiptap/extension-youtube';
import { Node, mergeAttributes } from '@tiptap/core';

// --- IMPORTS ICONS & UI ---
import { 
  FileText, ArrowLeft, Trash2, Pencil, 
  Loader2, Plus, Star, Image as ImageIcon,
  Calendar, Folder, CheckCircle,
  Bold, Italic, Underline as UnderlineIcon, List, ListOrdered, 
  Undo, Redo, Heading1, Heading2, Link as LinkIcon, 
  Quote, AlignLeft, AlignCenter, AlignRight, AlignJustify, Video, Film
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

// IMPORT DU COMPOSANT DE RECADRAGE
import ImageCropModal from "@/components/ImageCropModal";

// --- STYLE CSS IMPÉRATIF POUR LE REDIMENSIONNEMENT TIPTAP ---
const TiptapStyles = () => (
  <style>{`
    .ProseMirror .image-resizer {
      display: inline-block;
      position: relative;
      line-height: 0;
    }
    .ProseMirror .image-resizer__handler {
      position: absolute;
      background: #0A2A5C;
      border: 2px solid white;
      border-radius: 2px;
      width: 12px;
      height: 12px;
      z-index: 1;
    }
    .ProseMirror .image-resizer__handler--tl { top: -6px; left: -6px; cursor: nwse-resize; }
    .ProseMirror .image-resizer__handler--tr { top: -6px; right: -6px; cursor: nesw-resize; }
    .ProseMirror .image-resizer__handler--bl { bottom: -6px; left: -6px; cursor: nesw-resize; }
    .ProseMirror .image-resizer__handler--br { bottom: -6px; right: -6px; cursor: nwse-resize; }
    
    .ProseMirror img {
      transition: box-shadow 0.2s;
    }
    .ProseMirror img.ProseMirror-selectednode {
      outline: 3px solid #0A2A5C;
      box-shadow: 0 0 15px rgba(10, 42, 92, 0.3);
    }
  `}</style>
);

// --- EXTENSION TIPTAP SUR MESURE : VIDÉO LOCALE ---
const CustomVideo = Node.create({
  name: 'customVideo',
  group: 'block',
  selectable: true,
  draggable: true,
  addAttributes() {
    return { src: { default: null } };
  },
  parseHTML() {
    return [{ tag: 'video' }];
  },
  renderHTML({ HTMLAttributes }) {
    return ['video', mergeAttributes(HTMLAttributes, { controls: true, class: 'w-full aspect-video rounded-xl shadow-md my-6 bg-black' })];
  },
  addCommands() {
    return {
      setCustomVideo: (options) => ({ commands }) => {
        return commands.insertContent({ type: this.name, attrs: options });
      },
    };
  },
});

// --- SOUS-COMPOSANT : BARRE D'OUTILS TIPTAP ---
const MenuBar = ({ editor }) => {
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);

  if (!editor) return null;

  // Upload automatique (Image ou Vidéo)
  const uploadMedia = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file); 

    const toastId = toast.loading(`Téléchargement de ${type === 'image' ? "l'image" : "la vidéo"} vers le serveur...`);
    setIsUploadingMedia(true);

    try {
      const { data } = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const url = typeof data === 'string' ? data : data.url;

      if (type === 'image') {
        editor.chain().focus().setImage({ src: url }).run();
      } else {
        editor.chain().focus().setCustomVideo({ src: url }).run();
      }
      toast.success("Média inséré avec succès !", { id: toastId });
    } catch (err) {
      console.error(err);
      toast.error("Erreur lors de l'upload. Fichier trop lourd ou non supporté.", { id: toastId });
    } finally {
      setIsUploadingMedia(false);
      e.target.value = ""; // On réinitialise l'input
    }
  };

  const addLink = () => {
    const url = window.prompt('URL du lien (ex: https://...) :');
    if (url) editor.chain().focus().setLink({ href: url }).run();
  };

  const addYoutubeVideo = () => {
    const url = window.prompt('URL de la vidéo YouTube :');
    if (url) editor.chain().focus().setYoutubeVideo({ src: url }).run();
  };

  return (
    <div className="border-b border-slate-200 p-2 flex flex-wrap gap-1 bg-slate-50 rounded-t-xl items-center justify-center sm:justify-start">
      {/* Titres */}
      <Button size="sm" variant="ghost" type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={editor.isActive('heading', { level: 2 }) ? 'bg-slate-200' : ''} title="Titre 1">
        <Heading1 className="h-4 w-4" />
      </Button>
      <Button size="sm" variant="ghost" type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={editor.isActive('heading', { level: 3 }) ? 'bg-slate-200' : ''} title="Titre 2">
        <Heading2 className="h-4 w-4" />
      </Button>
      
      <div className="hidden sm:block w-px h-6 bg-slate-300 mx-1" />
      
      {/* Style de texte */}
      <Button size="sm" variant="ghost" type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive('bold') ? 'bg-slate-200' : ''} title="Gras">
        <Bold className="h-4 w-4" />
      </Button>
      <Button size="sm" variant="ghost" type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? 'bg-slate-200' : ''} title="Italique">
        <Italic className="h-4 w-4" />
      </Button>
      <Button size="sm" variant="ghost" type="button" onClick={() => editor.chain().focus().toggleUnderline().run()} className={editor.isActive('underline') ? 'bg-slate-200' : ''} title="Souligné">
        <UnderlineIcon className="h-4 w-4" />
      </Button>
      <Button size="sm" variant="ghost" type="button" onClick={() => editor.chain().focus().toggleStrike().run()} className={editor.isActive('strike') ? 'bg-slate-200' : ''} title="Barré">
        <span className="line-through font-bold">S</span>
      </Button>

      <div className="hidden sm:block w-px h-6 bg-slate-300 mx-1" />

      {/* Alignements */}
      <Button size="sm" variant="ghost" type="button" onClick={() => editor.chain().focus().setTextAlign('left').run()} className={editor.isActive({ textAlign: 'left' }) ? 'bg-slate-200' : ''} title="Aligner à gauche">
        <AlignLeft className="h-4 w-4" />
      </Button>
      <Button size="sm" variant="ghost" type="button" onClick={() => editor.chain().focus().setTextAlign('center').run()} className={editor.isActive({ textAlign: 'center' }) ? 'bg-slate-200' : ''} title="Centrer">
        <AlignCenter className="h-4 w-4" />
      </Button>
      <Button size="sm" variant="ghost" type="button" onClick={() => editor.chain().focus().setTextAlign('right').run()} className={editor.isActive({ textAlign: 'right' }) ? 'bg-slate-200' : ''} title="Aligner à droite">
        <AlignRight className="h-4 w-4" />
      </Button>
      <Button size="sm" variant="ghost" type="button" onClick={() => editor.chain().focus().setTextAlign('justify').run()} className={editor.isActive({ textAlign: 'justify' }) ? 'bg-slate-200' : ''} title="Justifier">
        <AlignJustify className="h-4 w-4" />
      </Button>
      
      <div className="hidden sm:block w-px h-6 bg-slate-300 mx-1" />
      
      {/* Listes & Citation */}
      <Button size="sm" variant="ghost" type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={editor.isActive('bulletList') ? 'bg-slate-200' : ''} title="Liste à puces">
        <List className="h-4 w-4" />
      </Button>
      <Button size="sm" variant="ghost" type="button" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={editor.isActive('orderedList') ? 'bg-slate-200' : ''} title="Liste numérotée">
        <ListOrdered className="h-4 w-4" />
      </Button>
      <Button size="sm" variant="ghost" type="button" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={editor.isActive('blockquote') ? 'bg-slate-200' : ''} title="Citation">
        <Quote className="h-4 w-4" />
      </Button>
      
      <div className="hidden sm:block w-px h-6 bg-slate-300 mx-1" />

      {/* Médias & Upload Local */}
      <Button size="sm" variant="ghost" type="button" onClick={addLink} className={editor.isActive('link') ? 'bg-slate-200' : ''} title="Ajouter un lien">
        <LinkIcon className="h-4 w-4" />
      </Button>

      {/* Input caché pour l'image locale */}
      <input type="file" accept="image/*" className="hidden" ref={imageInputRef} onChange={(e) => uploadMedia(e, 'image')} />
      <Button size="sm" variant="ghost" type="button" disabled={isUploadingMedia} onClick={() => imageInputRef.current?.click()} title="Uploader une image depuis le PC">
        {isUploadingMedia ? <Loader2 className="h-4 w-4 animate-spin text-amber-500" /> : <ImageIcon className="h-4 w-4 text-blue-600" />}
      </Button>

      {/* Input caché pour la vidéo locale */}
      <input type="file" accept="video/mp4,video/webm" className="hidden" ref={videoInputRef} onChange={(e) => uploadMedia(e, 'video')} />
      <Button size="sm" variant="ghost" type="button" disabled={isUploadingMedia} onClick={() => videoInputRef.current?.click()} title="Uploader une vidéo depuis le PC">
        {isUploadingMedia ? <Loader2 className="h-4 w-4 animate-spin text-amber-500" /> : <Film className="h-4 w-4 text-purple-600" />}
      </Button>

      {/* Lien YouTube */}
      <Button size="sm" variant="ghost" type="button" onClick={addYoutubeVideo} title="Intégrer une vidéo YouTube">
        <Video className="h-4 w-4 text-red-600" />
      </Button>

      <div className="hidden sm:block flex-1" />

      {/* Historique */}
      <Button size="sm" variant="ghost" type="button" onClick={() => editor.chain().focus().undo().run()} title="Annuler">
        <Undo className="h-4 w-4" />
      </Button>
      <Button size="sm" variant="ghost" type="button" onClick={() => editor.chain().focus().redo().run()} title="Rétablir">
        <Redo className="h-4 w-4" />
      </Button>
    </div>
  );
};


// --- COMPOSANT PRINCIPAL ---
const AdminBlogPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { blogPosts, fetchBlogPosts } = useContent();

  const [uploading, setUploading] = useState(false);
  const [editingPostId, setEditingPostId] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  // --- ÉTATS POUR LE RECADRAGE ---
  const [cropModalSrc, setCropModalSrc] = useState(null);

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

  // --- INITIALISATION TIPTAP ---
  const editor = useEditor({
    extensions: [
      StarterKit,
      LinkExtension.configure({ openOnClick: false }),
      ImageResize.configure({ 
        allowBase64: true,
        HTMLAttributes: {
          class: 'rounded-xl shadow-md my-6',
        },
      }),
      UnderlineExtension,
      TextAlignExtension.configure({ types: ['heading', 'paragraph', 'image'] }),
      CustomVideo,
      YoutubeExtension.configure({ 
        inline: false,
        width: 840,
        height: 472.5,
        HTMLAttributes: {
          class: 'w-full aspect-video rounded-xl shadow-md my-6', 
        },
      }),
    ],
    content: newArticle.content,
    onUpdate: ({ editor }) => {
      setNewArticle(prev => ({ ...prev, content: editor.getHTML() }));
    },
    editorProps: {
      attributes: {
        class: 'prose prose-slate max-w-none focus:outline-none min-h-[300px] md:min-h-[400px] p-4 md:p-6 text-slate-700 bg-white rounded-b-xl',
      },
    },
  });

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http') || imagePath.startsWith('data:')) return imagePath;
    
    const baseUrl = process.env.REACT_APP_API_URL 
      ? process.env.REACT_APP_API_URL.replace(/\/api$/, '') 
      : "https://calsed-api.onrender.com";
      
    const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    return `${baseUrl}${cleanPath}`;
  };

  // --- ACTIONS IMAGES ---
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.addEventListener("load", () => {
      setCropModalSrc(reader.result);
    });
    reader.readAsDataURL(file);
    e.target.value = ""; 
  };

  const handleCroppedUpload = async (croppedFile) => {
    const formData = new FormData();
    formData.append('image', croppedFile);

    setUploading(true);
    const toastId = toast.loading("Envoi de l'image de couverture...");

    try {
      const { data } = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success("Image parfaite !", { id: toastId });
      
      const imageUrl = typeof data === 'string' ? data : data.url;
      setNewArticle(prev => ({ ...prev, image: imageUrl }));
      
      setCropModalSrc(null); 
    } catch (error) {
      toast.error("Erreur lors de l'envoi", { id: toastId });
    } finally {
      setUploading(false);
    }
  };


  const handleSaveArticle = async () => {
    const cleanContent = newArticle.content.replace(/<[^>]*>?/gm, '').trim();
    
    if (!newArticle.title || !cleanContent) {
      return toast.error("Le titre et le contenu sont obligatoires.");
    }
    
    const finalArticle = { 
      ...newArticle, 
      featured: Boolean(newArticle.featured),
      author: user?.name || "Admin CALSED",
      user: user?._id || user?.id
    };

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
      if (editor) editor.commands.setContent(""); 
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
    const postContent = post.content || "";
    
    setNewArticle({
      title: post.title || "",
      excerpt: post.excerpt || "",
      content: postContent,
      image: post.image || "",
      category: post.category || "Actualité",
      featured: post.featured || false
    });

    if (editor) {
      editor.commands.setContent(postContent);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingPostId(null);
    setNewArticle(defaultArticle);
    if (editor) editor.commands.setContent("");
    setShowPreview(false);
  };

  return (
    <div className="min-h-screen pt-20 md:pt-24 pb-20 bg-slate-50/50 relative">
      <TiptapStyles />

      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-7xl">
        
        {/* EN-TÊTE ET NAVIGATION */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-4">
          <div className="w-full md:w-auto">
            <Button variant="ghost" onClick={() => navigate("/admin")} className="mb-2 -ml-2 md:-ml-4 text-slate-500 hover:text-[#0A2A5C] px-2 md:px-4">
              <ArrowLeft className="h-4 w-4 mr-2" /> <span className="hidden sm:inline">Retour au Dashboard</span><span className="sm:hidden">Retour</span>
            </Button>
            <h1 className="text-2xl md:text-3xl font-bold font-display text-[#0A2A5C] flex items-center gap-2 md:gap-3">
              <FileText className="h-6 w-6 md:h-8 md:w-8 text-green-600" /> Journal & Comm.
            </h1>
          </div>
          <Button 
            onClick={() => {handleCancelEdit(); window.scrollTo({ top: 0, behavior: 'smooth' });}} 
            className="w-full md:w-auto bg-[#0A2A5C] hover:bg-[#08224a] text-white h-12 md:h-10"
          >
            <Plus className="h-4 w-4 mr-2" /> Nouvel Article
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 md:gap-8 items-start">
          
          {/* COLONNE GAUCHE : L'ÉDITEUR */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-0 shadow-sm bg-white overflow-hidden">
              <CardHeader className={`${editingPostId ? 'bg-amber-50' : 'bg-slate-50'} border-b flex flex-row items-center justify-between p-4 md:p-6`}>
                <CardTitle className="text-[#0A2A5C] text-lg md:text-xl">
                  {editingPostId ? "Modifier l'article" : "Rédiger un article"}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <span className="hidden sm:inline text-xs font-bold uppercase text-slate-400">Mode Aperçu</span>
                  <span className="sm:hidden text-xs font-bold uppercase text-slate-400">Aperçu</span>
                  <Switch checked={showPreview} onCheckedChange={setShowPreview} />
                </div>
              </CardHeader>
              
              <CardContent className="p-4 md:p-6">
                {showPreview ? (
                  // MODE APERÇU 
                  <div className="bg-white p-4 md:p-10 rounded-xl border border-dashed border-slate-300 min-h-[400px]">
                    <div className="mb-6 md:mb-8 text-center">
                      <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 mb-3 md:mb-4">{newArticle.category}</Badge>
                      <h1 className="text-2xl md:text-4xl font-black text-[#0A2A5C] leading-tight mb-3 md:mb-4">{newArticle.title || "Titre de votre article"}</h1>
                      {newArticle.excerpt && <p className="text-lg md:text-xl text-slate-500 italic font-serif max-w-2xl mx-auto">"{newArticle.excerpt}"</p>}
                    </div>
                    
                    {newArticle.image && (
                      <div className="w-full h-48 md:h-96 rounded-xl md:rounded-2xl overflow-hidden mb-8 md:mb-10 shadow-lg">
                        <img src={getImageUrl(newArticle.image)} alt="Couverture" className="w-full h-full object-cover" />
                      </div>
                    )}
                    
                    <div 
                      className="prose prose-base md:prose-lg prose-slate mx-auto max-w-3xl
                      [overflow-wrap:anywhere] [hyphens:none]
                      prose-headings:font-display prose-headings:text-[#0A2A5C] prose-headings:font-bold
                      prose-p:text-slate-600 prose-p:leading-relaxed prose-p:text-justify
                      prose-a:text-amber-600 prose-a:no-underline hover:prose-a:underline
                      prose-img:rounded-xl md:prose-img:rounded-3xl prose-img:shadow-lg prose-img:mx-auto
                      prose-blockquote:border-l-amber-400 prose-blockquote:bg-amber-50/30 prose-blockquote:py-2 prose-blockquote:px-4 md:prose-blockquote:px-6 prose-blockquote:rounded-r-lg"
                      dangerouslySetInnerHTML={{ __html: newArticle.content || "<p class='text-slate-400 text-center italic'>Commencez à rédiger pour voir l'aperçu du contenu...</p>" }} 
                    />
                  </div>
                ) : (
                  // MODE ÉDITION
                  <div className="space-y-6 md:space-y-8">
                    {/* Titre */}
                    <div>
                      <Input 
                        placeholder="Titre accrocheur..." 
                        value={newArticle.title} 
                        onChange={(e) => setNewArticle({...newArticle, title: e.target.value})} 
                        className="text-xl md:text-2xl font-bold h-12 md:h-14 border-0 border-b-2 border-slate-200 rounded-none focus-visible:ring-0 focus-visible:border-[#0A2A5C] px-0 bg-transparent" 
                      />
                    </div>

                    {/* Catégorie & Mise en avant (Empilé sur mobile) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 p-4 md:p-5 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="space-y-2 md:space-y-3">
                        <Label className="text-xs text-slate-500 uppercase font-bold flex items-center gap-2"><Folder className="h-4 w-4"/> Rubrique</Label>
                        <Select value={newArticle.category} onValueChange={(val) => setNewArticle({...newArticle, category: val})}>
                          <SelectTrigger className="bg-white border-slate-200 shadow-sm h-10 md:h-10">
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
                      <div className="space-y-2 md:space-y-3">
                        <Label className="text-xs text-slate-500 uppercase font-bold flex items-center gap-2"><Star className="h-4 w-4"/> Visibilité</Label>
                        <div className="flex items-center justify-between border border-slate-200 px-4 h-10 rounded-md bg-white shadow-sm">
                          <span className="text-sm font-medium text-slate-700">Mettre à la une</span>
                          <Switch checked={newArticle.featured} onCheckedChange={(val) => setNewArticle({...newArticle, featured: val})} />
                        </div>
                      </div>
                    </div>

                    {/* Image de couverture (Responsive direction) */}
                    <div className="space-y-2 md:space-y-3">
                      <Label className="text-xs text-slate-500 uppercase font-bold flex items-center gap-2"><ImageIcon className="h-4 w-4"/> Image de couverture</Label>
                      <div className="flex flex-col sm:flex-row gap-4 md:gap-6 items-start p-4 md:p-5 bg-slate-50 rounded-xl border border-slate-100">
                        {newArticle.image ? (
                          <div className="relative h-32 w-full sm:w-48 rounded-lg overflow-hidden border shadow-sm group shrink-0">
                            <img src={getImageUrl(newArticle.image)} className="h-full w-full object-cover" alt="Preview"/>
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Button size="sm" variant="destructive" onClick={() => setNewArticle({...newArticle, image: ""})} className="h-8 text-xs font-bold">Retirer</Button>
                            </div>
                          </div>
                        ) : (
                          <div className="h-32 w-full sm:w-48 rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center bg-white shrink-0">
                            <ImageIcon className="h-8 w-8 text-slate-300 mb-2"/>
                            <span className="text-[10px] text-slate-400 uppercase font-bold">Aucune image</span>
                          </div>
                        )}
                        
                        <div className="flex-1 space-y-3 md:space-y-4 w-full">
                          <div>
                            <Input type="file" accept="image/*" onChange={handleFileSelect} disabled={uploading} className="cursor-pointer bg-white h-10 md:h-10 text-xs md:text-sm"/>
                            <p className="text-[10px] md:text-[11px] text-slate-500 mt-2">L'image sera automatiquement recadrée au format 16:9.</p>
                          </div>
                          <div className="relative">
                            <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-200" /></div>
                            <div className="relative flex justify-center text-xs uppercase"><span className="bg-slate-50 px-2 text-slate-400 font-bold">OU</span></div>
                          </div>
                          <Input placeholder="Coller une URL d'image externe..." value={newArticle.image} onChange={(e) => setNewArticle({...newArticle, image: e.target.value})} className="bg-white h-10 md:h-10 text-xs md:text-sm" />
                        </div>
                      </div>
                    </div>

                    {/* Extrait */}
                    <div className="space-y-2 md:space-y-3">
                      <Label className="text-xs text-slate-500 uppercase font-bold flex justify-between">
                        <span>Extrait (Résumé)</span>
                        <span className="text-slate-400 font-normal">Optionnel</span>
                      </Label>
                      <Input 
                        placeholder="Une phrase courte pour donner envie de lire..." 
                        value={newArticle.excerpt} 
                        onChange={(e) => setNewArticle({...newArticle, excerpt: e.target.value})} 
                        className="bg-slate-50 border-slate-200 h-10 md:h-10 text-xs md:text-sm"
                      />
                    </div>

                    {/* TIPTAP EDITOR */}
                    <div className="space-y-2 md:space-y-3 pt-2">
                      <Label className="text-xs text-slate-500 uppercase font-bold">Contenu principal de l'article</Label>
                      <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm focus-within:ring-2 focus-within:ring-[#0A2A5C] transition-all flex flex-col">
                        <MenuBar editor={editor} />
                        <EditorContent editor={editor} className="flex-1" />
                      </div>
                    </div>

                  </div>
                )}
              </CardContent>

              <CardFooter className="p-4 md:p-6 bg-slate-50 border-t flex flex-col sm:flex-row gap-3 sm:gap-4 justify-end">
                {editingPostId && (
                  <Button variant="outline" onClick={handleCancelEdit} className="w-full sm:w-auto border-slate-300 text-slate-600 bg-white h-12 sm:h-10">
                    Annuler les modifications
                  </Button>
                )}
                <Button onClick={handleSaveArticle} disabled={uploading || !newArticle.title} className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white min-w-[150px] shadow-md h-12 sm:h-10">
                  {uploading ? <Loader2 className="animate-spin h-4 w-4 mr-2"/> : <CheckCircle className="h-4 w-4 mr-2"/>}
                  {editingPostId ? "Enregistrer" : "Publier l'article"}
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* COLONNE DROITE : LISTE DES ARTICLES */}
          <div className="lg:col-span-1">
            {/* Conditionnel sticky pour écrans larges uniquement pour éviter les bugs scroll mobile */}
            <Card className="border-0 shadow-sm bg-white lg:sticky lg:top-24">
              <CardHeader className="border-b bg-[#0A2A5C] text-white rounded-t-xl p-4 md:p-6">
                <CardTitle className="flex items-center gap-2 text-base md:text-lg">
                  <FileText className="h-5 w-5" /> 
                  Articles publiés ({blogPosts.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y max-h-[400px] lg:max-h-[calc(100vh-250px)] overflow-y-auto custom-scrollbar">
                  {blogPosts.map(post => (
                    <div key={post.id || post._id} className="p-4 md:p-5 hover:bg-slate-50 transition-colors group">
                      <div className="flex justify-between items-start mb-2 md:mb-3 gap-2">
                        <Badge variant="outline" className={`text-[9px] md:text-[10px] uppercase font-bold tracking-wider whitespace-nowrap ${post.featured ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-slate-100 text-slate-600'}`}>
                          {post.featured && <Star className="h-3 w-3 mr-1.5 fill-amber-500 text-amber-500" />}
                          {post.category || "Article"}
                        </Badge>
                        <div className="flex gap-1 md:opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button size="icon" variant="ghost" className="h-7 w-7 md:h-8 md:w-8 text-blue-600 hover:bg-blue-100" onClick={() => handleEditClick(post)} title="Modifier">
                            <Pencil className="h-3 w-3 md:h-4 md:w-4"/>
                          </Button>
                          <Button size="icon" variant="ghost" className="h-7 w-7 md:h-8 md:w-8 text-red-500 hover:bg-red-100" onClick={() => handleDeleteArticle(post.id || post._id, post.title)} title="Supprimer">
                            <Trash2 className="h-3 w-3 md:h-4 md:w-4"/>
                          </Button>
                        </div>
                      </div>
                      
                      <p className="font-bold text-[#0A2A5C] text-sm md:text-base line-clamp-2 leading-snug mb-2 group-hover:text-blue-600 transition-colors cursor-pointer" onClick={() => handleEditClick(post)}>
                        {post.title}
                      </p>
                      
                      <p className="text-[10px] md:text-[11px] text-slate-500 flex items-center gap-1.5 font-medium">
                        <Calendar className="h-3 w-3 md:h-3.5 md:w-3.5 text-slate-400" /> 
                        {new Date(post.date || post.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  ))}

                  {blogPosts.length === 0 && (
                    <div className="p-8 md:p-10 text-center text-slate-400">
                      <FileText className="h-8 w-8 md:h-10 md:w-10 mx-auto mb-3 opacity-30" />
                      <p className="text-xs md:text-sm font-medium">Aucun article publié.</p>
                      <p className="text-[10px] md:text-xs mt-1">Vos articles apparaîtront ici.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>

      {/* MODALE DE RECADRAGE */}
      {cropModalSrc && (
        <ImageCropModal
          imageSrc={cropModalSrc}
          aspect={16 / 9}
          isUploading={uploading}
          onClose={() => setCropModalSrc(null)}
          onComplete={handleCroppedUpload}
        />
      )}

    </div>
  );
};

export default AdminBlogPage;