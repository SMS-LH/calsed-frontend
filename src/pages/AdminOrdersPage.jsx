import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ShoppingBag, CheckCircle, Search, Trash2, 
  ArrowLeft, Download, MapPin, Phone, Loader2,
  Package, Truck, Clock, Copy, Receipt 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import api from "../api/axios";

const AdminOrdersPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // États pour les filtres
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data } = await api.get('/orders');
      setOrders(data);
    } catch (e) {
      toast.error("Erreur lors du chargement des commandes");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsDelivered = async (orderId) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status: "Livré", isDelivered: true });
      toast.success("Commande marquée comme livrée ! Le client a été notifié."); 
      fetchOrders();
    } catch (e) { toast.error("Erreur lors de la mise à jour"); }
  };

  const handleDeleteOrder = async (orderId) => {
    if(!window.confirm("Attention, voulez-vous vraiment supprimer cette commande de l'historique ?")) return;
    try {
      await api.delete(`/orders/${orderId}`);
      toast.success("Commande supprimée."); 
      fetchOrders();
    } catch (e) { toast.error("Erreur lors de la suppression"); }
  };

  // --- FONCTIONNALITÉ : COPIE RAPIDE (Pour le livreur) ---
  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    toast.success(`${type} copié !`);
  };

  // --- FONCTIONNALITÉ : EXPORT CSV LOGISTIQUE ---
  const handleExportCSV = () => {
    const headers = ["Date", "Client", "Téléphone", "Adresse de livraison", "Articles", "Total (FCFA)", "Statut"];
    const csvContent = [
      headers.join(";"),
      ...filteredOrders.map(o => {
        const dateOrder = new Date(o.createdAt).toLocaleDateString('fr-FR');
        const items = o.items.map(i => `${i.quantity}x ${i.name}`).join(', ');
        const status = o.isDelivered ? "Livré" : "En attente";
        return `"${dateOrder}";"${o.customerName}";"${o.phone}";"${o.address}, ${o.city}";"${items}";"${o.totalAmount}";"${status}"`;
      })
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", `CALSED_Commandes_${new Date().toLocaleDateString('fr-FR')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Bordereau de livraison généré !");
  };

  // --- LOGIQUE DE FILTRAGE ---
  const filteredOrders = orders.filter(o => {
    const searchMatch = 
      o.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      o.phone?.includes(searchTerm) ||
      o.address?.toLowerCase().includes(searchTerm.toLowerCase());
    
    let statusMatch = true;
    if (statusFilter === "pending") statusMatch = !o.isDelivered;
    if (statusFilter === "delivered") statusMatch = o.isDelivered;

    return searchMatch && statusMatch;
  });

  const pendingOrdersCount = orders.filter(o => !o.isDelivered).length;

  if (isLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin h-10 w-10 text-[#0A2A5C]"/></div>;

  return (
    <div className="min-h-screen pt-20 md:pt-24 pb-12 bg-slate-50/50">
      <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
        
        {/* EN-TÊTE ET NAVIGATION */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-4">
          <div className="w-full md:w-auto">
            <Button variant="ghost" onClick={() => navigate("/admin")} className="mb-2 -ml-2 md:-ml-4 text-slate-500 hover:text-[#0A2A5C] px-2 md:px-4">
              <ArrowLeft className="h-4 w-4 mr-2" /> <span className="hidden sm:inline">Retour au Dashboard</span><span className="sm:hidden">Retour</span>
            </Button>
            <h1 className="text-2xl md:text-3xl font-bold font-display text-[#0A2A5C] flex items-center gap-2 md:gap-3">
              <ShoppingBag className="h-6 w-6 md:h-8 md:w-8 text-purple-600" /> Suivi Commandes
            </h1>
          </div>
          <Button onClick={handleExportCSV} className="w-full md:w-auto bg-purple-600 hover:bg-purple-700 text-white h-12 md:h-10">
            <Download className="h-4 w-4 mr-2" /> Exporter (Bordereau)
          </Button>
        </div>

        {/* BARRE DE RECHERCHE ET FILTRES */}
        <Card className="border-0 shadow-sm bg-white mb-6 md:mb-8">
          <CardContent className="p-3 md:p-4 flex flex-col md:flex-row gap-3 md:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"/>
              <Input 
                placeholder="Chercher par client, adresse ou téléphone..." 
                className="pl-10 bg-slate-50 h-12 md:h-10 text-sm" 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 w-full md:w-[300px]">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full bg-slate-50 h-12 md:h-10 text-sm">
                  <SelectValue placeholder="Filtrer par statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les commandes</SelectItem>
                  <SelectItem value="pending">À livrer ({pendingOrdersCount})</SelectItem>
                  <SelectItem value="delivered">Livrées</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* LISTE DES COMMANDES */}
        <div className="grid lg:grid-cols-2 gap-4 md:gap-6">
          {filteredOrders.map(order => (
            <Card key={order._id} className={`border-0 shadow-sm overflow-hidden transition-all ${order.isDelivered ? 'opacity-75 bg-slate-50' : 'bg-white border-l-4 border-l-amber-500'}`}>
              
              {/* En-tête de la commande */}
              <CardHeader className="p-4 md:p-5 pb-3 border-b bg-slate-50/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                <div className="w-full sm:w-auto">
                  <CardTitle className="text-base md:text-lg text-[#0A2A5C] flex items-center gap-2 leading-tight">
                    <Receipt className="h-4 w-4 md:h-5 md:w-5 text-slate-400 shrink-0" /> 
                    <span className="truncate">{order.customerName}</span>
                  </CardTitle>
                  <p className="text-[11px] md:text-xs text-slate-500 mt-1">
                    Passée le {new Date(order.createdAt).toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>
                <div className="self-end sm:self-auto shrink-0">
                  {order.isDelivered ? (
                    <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 font-bold px-3 py-1 text-[10px] md:text-xs">
                      <CheckCircle className="h-3 w-3 mr-1" /> Livrée
                    </Badge>
                  ) : (
                    <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 font-bold px-3 py-1 text-[10px] md:text-xs">
                      <Clock className="h-3 w-3 mr-1" /> En attente
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="p-0">
                {/* Section Logistique */}
                <div className="p-4 md:p-5 bg-blue-50/30 flex flex-col sm:grid sm:grid-cols-2 gap-4 border-b">
                  <div className="space-y-1.5 md:space-y-2">
                    <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center"><MapPin className="h-3 w-3 mr-1"/> Livraison</p>
                    <p className="text-sm font-medium text-slate-700">{order.address}</p>
                    <p className="text-sm text-slate-600">{order.city}</p>
                    <button onClick={() => copyToClipboard(`${order.address}, ${order.city}`, 'Adresse')} className="text-[10px] md:text-xs text-blue-600 hover:underline flex items-center pt-1">
                      <Copy className="h-3 w-3 mr-1"/> Copier l'adresse
                    </button>
                  </div>
                  <div className="space-y-1.5 md:space-y-2">
                    <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center"><Phone className="h-3 w-3 mr-1"/> Contact</p>
                    <p className="text-sm font-medium text-slate-700">{order.phone}</p>
                    <button onClick={() => copyToClipboard(order.phone, 'Téléphone')} className="text-[10px] md:text-xs text-blue-600 hover:underline flex items-center pt-1">
                      <Copy className="h-3 w-3 mr-1"/> Copier le numéro
                    </button>
                  </div>
                </div>

                {/* Section Articles */}
                <div className="p-4 md:p-5">
                  <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 md:mb-3 flex items-center"><Package className="h-3 w-3 mr-1"/> Contenu du colis</p>
                  <div className="space-y-2">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs md:text-sm">
                        <span className="flex items-center gap-2 min-w-0 pr-2">
                          <Badge variant="outline" className="bg-slate-100 text-slate-600 shrink-0">x{item.quantity}</Badge>
                          <span className="font-medium text-slate-700 truncate">{item.name}</span>
                        </span>
                        <span className="text-slate-500 shrink-0">{(item.price * item.quantity).toLocaleString()} F</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>

              {/* Pied de carte : Actions et Total */}
              <CardFooter className="p-4 md:p-5 bg-slate-50 border-t flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                <div className="flex justify-between sm:block w-full sm:w-auto items-center">
                  <p className="text-[10px] md:text-xs text-slate-500 uppercase tracking-wider font-bold">Total TTC</p>
                  <p className="text-lg md:text-xl font-black text-[#0A2A5C]">{order.totalAmount?.toLocaleString()} FCFA</p>
                </div>
                
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button size="icon" variant="ghost" onClick={() => handleDeleteOrder(order._id)} className="h-12 w-12 md:h-10 md:w-10 text-slate-400 hover:text-red-600 hover:bg-red-50 shrink-0 bg-white md:bg-transparent border md:border-0 shadow-sm md:shadow-none">
                    <Trash2 className="h-5 w-5 md:h-4 md:w-4" />
                  </Button>
                  {!order.isDelivered && (
                    <Button onClick={() => handleMarkAsDelivered(order._id)} className="flex-1 sm:w-auto bg-[#0A2A5C] hover:bg-[#08224a] shadow-md h-12 md:h-10">
                      <Truck className="h-4 w-4 mr-2 shrink-0" /> <span className="truncate">Valider l'expédition</span>
                    </Button>
                  )}
                </div>
              </CardFooter>

            </Card>
          ))}

          {/* État vide */}
          {filteredOrders.length === 0 && (
            <div className="col-span-full py-12 md:py-16 text-center text-slate-500 bg-white rounded-2xl border border-dashed">
              <ShoppingBag className="h-10 w-10 md:h-12 md:w-12 mx-auto text-slate-300 mb-2 md:mb-3" />
              <p className="text-base md:text-lg font-medium">Aucune commande trouvée.</p>
              <p className="text-xs md:text-sm">Essayez de modifier vos filtres de recherche.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminOrdersPage;