import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { 
  Users, CheckCircle, AlertCircle, ShoppingBag,
  FileText, Store, Settings2, ShieldAlert, ArrowRight, Loader2
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";
import api from "../api/axios";

const AdminDashboardPage = () => {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  // États simplifiés juste pour les statistiques
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    pendingUsers: 0,
    pendingOrders: 0
  });
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    if (user?.role === "admin") {
      fetchDashboardStats();
    }
  }, [user]);

  const fetchDashboardStats = async () => {
    try {
      // On récupère juste ce qu'il faut pour les chiffres
      const [usersRes, ordersRes] = await Promise.all([
        api.get('/users'),
        api.get('/orders')
      ]);

      const users = usersRes.data;
      const orders = ordersRes.data;

      const validatedUsers = users.filter(u => u.isValidated);
      
      setStats({
        totalUsers: validatedUsers.length,
        activeUsers: validatedUsers.filter(u => u.paidUntil && new Date(u.paidUntil) > new Date()).length,
        pendingUsers: users.filter(u => !u.isValidated).length,
        pendingOrders: orders.filter(o => !o.isDelivered).length
      });
    } catch (error) {
      console.error("Erreur chargement des statistiques", error);
    } finally {
      setIsLoadingData(false);
    }
  };

  if (authLoading || isLoadingData) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin h-10 w-10 text-[#0A2A5C]"/>
      </div>
    );
  }

  if (!user || user.role !== "admin") return <Navigate to="/dashboard" replace />;

  // Définition du menu de navigation
  const adminModules = [
    {
      title: "Gestion des Membres",
      description: "Annuaire, cotisations et validations.",
      icon: <Users className="h-6 w-6 md:h-8 md:w-8 text-blue-600" />,
      color: "bg-blue-50",
      path: "/admin/membres",
      alert: stats.pendingUsers > 0 ? `${stats.pendingUsers} en attente` : null
    },
    {
      title: "Suivi des Commandes",
      description: "Boutique, livraisons et paiements.",
      icon: <ShoppingBag className="h-6 w-6 md:h-8 md:w-8 text-purple-600" />,
      color: "bg-purple-50",
      path: "/admin/commandes",
      alert: stats.pendingOrders > 0 ? `${stats.pendingOrders} à livrer` : null
    },
    {
      title: "Journal & Blog",
      description: "Publier des actualités et événements.",
      icon: <FileText className="h-6 w-6 md:h-8 md:w-8 text-green-600" />,
      color: "bg-green-50",
      path: "/admin/blog"
    },
    {
      title: "Boutique & Stocks",
      description: "Ajouter et modifier les articles.",
      icon: <Store className="h-6 w-6 md:h-8 md:w-8 text-amber-600" />,
      color: "bg-amber-50",
      path: "/admin/boutique"
    },
    {
      title: "Configuration Site",
      description: "Textes d'accueil et Bureau CALSED.",
      icon: <Settings2 className="h-6 w-6 md:h-8 md:w-8 text-slate-600" />,
      color: "bg-slate-100",
      path: "/admin/config"
    }
  ];

  return (
    <div className="min-h-screen pt-20 md:pt-24 pb-12 bg-slate-50/50 font-sans">
      <div className="container mx-auto px-4 md:px-6 lg:px-8 max-w-6xl">
        
        {/* EN-TÊTE */}
        <div className="mb-6 md:mb-10">
          <div className="flex items-center gap-3 mb-2">
             <div className="bg-amber-100 p-2 md:p-3 rounded-xl hidden sm:block">
                 <ShieldAlert className="h-6 w-6 md:h-8 md:w-8 text-amber-600" />
             </div>
             <h1 className="text-2xl md:text-3xl font-bold font-display text-[#0A2A5C] flex items-center gap-2">
               <ShieldAlert className="h-6 w-6 text-amber-600 sm:hidden" /> Panneau de Contrôle
             </h1>
          </div>
          <p className="text-sm md:text-base text-slate-500">Vue d'ensemble et accès rapide aux modules d'administration.</p>
        </div>

        {/* STATISTIQUES GLOBALES */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8 md:mb-10">
          <Card className="border-0 shadow-sm bg-white overflow-hidden">
            <CardContent className="p-4 md:p-6 flex flex-col items-center text-center">
              <Users className="h-5 w-5 text-blue-500 mb-2 opacity-70" />
              <h3 className="text-2xl md:text-3xl font-black text-[#0A2A5C] mb-1">{stats.totalUsers}</h3>
              <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase text-center">Membres Validés</p>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-sm bg-white overflow-hidden">
            <CardContent className="p-4 md:p-6 flex flex-col items-center text-center">
              <CheckCircle className="h-5 w-5 text-green-500 mb-2 opacity-70" />
              <h3 className="text-2xl md:text-3xl font-black text-green-600 mb-1">{stats.activeUsers}</h3>
              <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase text-center">Cotisations à jour</p>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-sm bg-white border-b-[3px] md:border-b-4 border-amber-500 overflow-hidden relative group cursor-pointer hover:bg-amber-50 transition-colors" onClick={() => navigate('/admin/membres')}>
            <CardContent className="p-4 md:p-6 flex flex-col items-center text-center">
              <AlertCircle className="h-5 w-5 text-amber-500 mb-2 opacity-70" />
              <h3 className="text-2xl md:text-3xl font-black text-amber-600 mb-1">{stats.pendingUsers}</h3>
              <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase text-center">En attente</p>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-sm bg-white border-b-[3px] md:border-b-4 border-purple-500 overflow-hidden relative group cursor-pointer hover:bg-purple-50 transition-colors" onClick={() => navigate('/admin/commandes')}>
            <CardContent className="p-4 md:p-6 flex flex-col items-center text-center">
              <ShoppingBag className="h-5 w-5 text-purple-500 mb-2 opacity-70" />
              <h3 className="text-2xl md:text-3xl font-black text-purple-600 mb-1">{stats.pendingOrders}</h3>
              <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase text-center text-balance">Commandes à livrer</p>
            </CardContent>
          </Card>
        </div>

        {/* MENU DES MODULES */}
        <h2 className="text-lg md:text-xl font-bold text-[#0A2A5C] mb-4 md:mb-6 flex items-center gap-2">
            Modules d'administration
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {adminModules.map((module, index) => (
            <Card 
              key={index} 
              className="border border-slate-100 shadow-sm hover:shadow-md hover:border-[#0A2A5C]/20 transition-all cursor-pointer group hover:-translate-y-1 relative overflow-hidden bg-white"
              onClick={() => navigate(module.path)}
            >
              <CardContent className="p-5 md:p-6 flex flex-col h-full">
                <div className="flex items-start justify-between mb-4 md:mb-5">
                    <div className={`p-3 md:p-4 rounded-xl md:rounded-2xl ${module.color}`}>
                      {module.icon}
                    </div>
                    {module.alert && (
                      <span className="bg-red-50 text-red-600 text-[9px] md:text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider shrink-0 ml-2 border border-red-100">
                        {module.alert}
                      </span>
                    )}
                </div>
                
                <h3 className="text-base md:text-lg font-bold text-[#0A2A5C] mb-1.5 md:mb-2">{module.title}</h3>
                <p className="text-xs md:text-sm text-slate-500 mb-4 md:mb-6 flex-grow leading-relaxed">{module.description}</p>
                
                <div className="flex items-center mt-auto pt-4 border-t border-slate-50">
                  <span className="text-[#0A2A5C] text-xs md:text-sm font-bold flex items-center group-hover:text-blue-600 transition-colors">
                    Ouvrir le module <ArrowRight className="h-3 w-3 md:h-4 md:w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

      </div>
    </div>
  );
};

export default AdminDashboardPage;