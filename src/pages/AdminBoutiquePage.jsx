import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Store, ArrowLeft, Trash2, Pencil, 
  Loader2, Plus, Image as ImageIcon,
  Tag, Package, ShoppingBag, CheckCircle, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useContent } from "@/context/ContentContext";
import { toast } from "sonner";
import api from "../api/axios";

const AdminBoutiquePage = () => {
  const navigate = useNavigate();
  const { products, addProduct, removeProduct } = useContent();

  const [uploading, setUploading] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);

  const defaultProduct = { 
    name: "", 
    price: "", 
    category: "Vêtement", 
    stock: "10", 
    description: "", 
    image: "" 
  };
  const [newProduct, setNewProduct] = useState(defaultProduct);

  // --- ACTIONS ---
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    setUploading(true);
    const toastId = toast.loading("Téléchargement de l'image...");

    try {
      const { data } = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success("Image téléchargée !", { id: toastId });
      const imageUrl = typeof data === 'string' ? data : data.url;
      
      // Gestion de plusieurs images (séparées par des virgules si besoin)
      const currentImages = newProduct.image ? newProduct.image + ", " : "";
      setNewProduct(prev => ({ ...prev, image: currentImages + imageUrl }));
    } catch (error) {
      toast.error("Erreur de téléchargement", { id: toastId });
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProduct = async () => {
    if (!newProduct.name || !newProduct.price) {
      return toast.error("Le nom et le prix sont obligatoires.");
    }

    const toastId = toast.loading(editingProductId ? "Mise à jour..." : "Enregistrement...");
    
    // Formatage des données
    const productData = { 
      ...newProduct, 
      price: Number(newProduct.price), 
      stock: Number(newProduct.stock), 
      // S'assure que l'image est un tableau si ton backend l'attend ainsi
      image: newProduct.image ? newProduct.image.split(",").map(s => s.trim()) : []
    };

    try {
      // Si tu as une fonction updateProduct dans ton ContentContext, utilise-la ici.
      // Sinon, on fait une requête directe ou on supprime puis on recrée pour simuler la modif (selon ton backend)
      let success = false;
      
      if (editingProductId) {
         // Si ton backend supporte PUT /products/:id
         await api.put(`/products/${editingProductId}`, productData);
         success = true;
         // Note: il faudra peut-être rafraîchir la liste manuellement ici via une fonction fetchProducts()
         window.location.reload(); // Solution rapide si fetchProducts n'est pas exporté
      } else {
         success = await addProduct(productData);
      }
      
      if(success || editingProductId) {
        toast.success(editingProductId ? "Produit mis à jour !" : "Produit ajouté au catalogue !", { id: toastId });
        setEditingProductId(null);
        setNewProduct(defaultProduct);
      }
    } catch (e) {
      toast.error("Erreur lors de la sauvegarde", { id: toastId });
    }
  };

  const handleDeleteProduct = async (productId, name) => {
    if (!window.confirm(`Supprimer définitivement "${name}" de la boutique ?`)) return;
    try {
      await removeProduct(productId);
      toast.success("Produit supprimé du catalogue.");
    } catch (error) { 
      toast.error("Erreur lors de la suppression."); 
    }
  };

  const handleEditClick = (product) => {
    setEditingProductId(product.id || product._id);
    setNewProduct({
      name: product.name,
      price: product.price,
      stock: product.stock,
      category: product.category || "Vêtement",
      description: product.description || "",
      // Reconvertir le tableau d'images en chaîne pour l'input text
      image: Array.isArray(product.image) ? product.image.join(", ") : (product.image || "")
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingProductId(null);
    setNewProduct(defaultProduct);
  };

  // Extraire la première image pour l'affichage
  const getFirstImage = (imageField) => {
    if (!imageField) return null;
    if (Array.isArray(imageField)) return imageField[0];
    return imageField.split(',')[0].trim();
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
              <Store className="h-8 w-8 text-amber-600" /> Gestion de la Boutique
            </h1>
          </div>
          <Button onClick={() => {handleCancelEdit(); window.scrollTo({ top: 0, behavior: 'smooth' });}} className="bg-amber-600 hover:bg-amber-700 text-white">
            <Plus className="h-4 w-4 mr-2" /> Nouveau Produit
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 items-start">
          
          {/* COLONNE GAUCHE : FORMULAIRE */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-sm bg-white sticky top-24">
              <CardHeader className={`${editingProductId ? 'bg-blue-600' : 'bg-[#0A2A5C]'} text-white rounded-t-xl`}>
                <CardTitle className="flex items-center gap-2 text-lg">
                  {editingProductId ? <Pencil className="h-5 w-5"/> : <ShoppingBag className="h-5 w-5"/>}
                  {editingProductId ? "Modifier le produit" : "Ajouter au catalogue"}
                </CardTitle>
              </CardHeader>
              
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label>Nom du produit <span className="text-red-500">*</span></Label>
                  <Input 
                    placeholder="Ex: T-Shirt CALSED..." 
                    value={newProduct.name} 
                    onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Prix (FCFA) <span className="text-red-500">*</span></Label>
                    <Input 
                      type="number" 
                      placeholder="Ex: 5000" 
                      value={newProduct.price} 
                      onChange={(e) => setNewProduct({...newProduct, price: e.target.value})} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Stock</Label>
                    <Input 
                      type="number" 
                      placeholder="Quantité" 
                      value={newProduct.stock} 
                      onChange={(e) => setNewProduct({...newProduct, stock: e.target.value})} 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Catégorie</Label>
                  <Select value={newProduct.category} onValueChange={(val) => setNewProduct({...newProduct, category: val})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Vêtement">Vêtement (T-shirt, Polo...)</SelectItem>
                      <SelectItem value="Accessoire">Accessoire (Mug, Casquette...)</SelectItem>
                      <SelectItem value="Souvenir">Souvenir (Livre, Pin's...)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea 
                    placeholder="Décrivez le produit..." 
                    value={newProduct.description} 
                    onChange={(e) => setNewProduct({...newProduct, description: e.target.value})} 
                    className="h-24 resize-none"
                  />
                </div>

                <div className="space-y-2 border-t pt-4">
                  <Label className="flex items-center gap-2"><ImageIcon className="h-4 w-4 text-slate-400"/> Image(s) du produit</Label>
                  {getFirstImage(newProduct.image) && (
                    <div className="h-32 w-full rounded-md overflow-hidden border mb-2 bg-slate-50">
                      <img src={getFirstImage(newProduct.image)} alt="Aperçu" className="h-full w-full object-contain" />
                    </div>
                  )}
                  <Input type="file" accept="image/*" onChange={handleFileUpload} disabled={uploading} className="text-xs cursor-pointer"/>
                  <Textarea 
                    placeholder="Ou collez les URLs des images (séparées par des virgules)..." 
                    value={newProduct.image} 
                    onChange={(e) => setNewProduct({...newProduct, image: e.target.value})} 
                    className="text-xs h-16" 
                  />
                </div>
              </CardContent>

              <CardFooter className="p-6 bg-slate-50 border-t flex flex-col gap-2">
                <Button onClick={handleSaveProduct} disabled={uploading || !newProduct.name || !newProduct.price} className="w-full bg-amber-600 hover:bg-amber-700 text-white">
                  {uploading ? <Loader2 className="animate-spin h-4 w-4 mr-2"/> : <CheckCircle className="h-4 w-4 mr-2"/>}
                  {editingProductId ? "Mettre à jour" : "Ajouter au catalogue"}
                </Button>
                {editingProductId && (
                  <Button variant="outline" onClick={handleCancelEdit} className="w-full">
                    Annuler
                  </Button>
                )}
              </CardFooter>
            </Card>
          </div>

          {/* COLONNE DROITE : LE CATALOGUE */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-[#0A2A5C] flex items-center gap-2">
                <Package className="h-5 w-5" /> Produits en ligne ({products.length})
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {products.map(product => {
                const stock = Number(product.stock) || 0;
                const outOfStock = stock <= 0;

                return (
                  <Card key={product.id || product._id} className={`border-0 shadow-sm overflow-hidden group ${outOfStock ? 'opacity-75' : ''}`}>
                    <div className="flex p-4 gap-4 h-full">
                      {/* Image Thumbnail */}
                      <div className="h-24 w-24 rounded-lg bg-slate-100 flex-shrink-0 overflow-hidden relative border border-slate-200">
                        {product.image ? (
                          <img src={getFirstImage(product.image)} alt={product.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-slate-300">
                            <ImageIcon className="h-8 w-8" />
                          </div>
                        )}
                        {outOfStock && (
                          <div className="absolute inset-0 bg-white/60 flex items-center justify-center backdrop-blur-[1px]">
                            <Badge variant="destructive" className="text-[10px] uppercase">Rupture</Badge>
                          </div>
                        )}
                      </div>

                      {/* Infos Produit */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start">
                            <h3 className="font-bold text-[#0A2A5C] text-sm leading-tight mb-1 pr-2 line-clamp-2" title={product.name}>
                              {product.name}
                            </h3>
                            {/* Actions rapides invisibles sauf au hover (sur desktop) */}
                            <div className="flex gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                              <Button size="icon" variant="ghost" className="h-6 w-6 text-blue-600 hover:bg-blue-50" onClick={() => handleEditClick(product)}>
                                <Pencil className="h-3 w-3"/>
                              </Button>
                              <Button size="icon" variant="ghost" className="h-6 w-6 text-red-500 hover:bg-red-50" onClick={() => handleDeleteProduct(product.id || product._id, product.name)}>
                                <Trash2 className="h-3 w-3"/>
                              </Button>
                            </div>
                          </div>
                          
                          <p className="text-[11px] text-slate-500 flex items-center gap-1 mb-2">
                            <Tag className="h-3 w-3" /> {product.category || 'Vêtement'}
                          </p>
                        </div>

                        <div className="flex items-end justify-between mt-auto">
                          <p className="font-black text-amber-600 text-lg">
                            {Number(product.price).toLocaleString()} F
                          </p>
                          {!outOfStock && (
                            <p className={`text-[10px] font-bold ${stock < 5 ? 'text-amber-500' : 'text-emerald-600'}`}>
                              Stock: {stock}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}

              {products.length === 0 && (
                <div className="col-span-full py-16 text-center text-slate-400 bg-white rounded-xl border border-dashed border-slate-300">
                  <ShoppingBag className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-base font-medium text-slate-500">Votre boutique est vide.</p>
                  <p className="text-sm">Ajoutez votre premier produit en utilisant le formulaire.</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminBoutiquePage;