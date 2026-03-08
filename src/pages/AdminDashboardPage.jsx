import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { 
  Users, CheckCircle, AlertCircle, ShoppingBag,
  FileText, Store, Settings2, ShieldAlert, ArrowRight, Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
      icon: <Users className="h-8 w-8 text-blue-600" />,
      color: "bg-blue-50",
      path: "/admin/membres",
      alert: stats.pendingUsers > 0 ? `${stats.pendingUsers} en attente` : null
    },
    {
      title: "Suivi des Commandes",
      description: "Boutique, livraisons et paiements.",
      icon: <ShoppingBag className="h-8 w-8 text-purple-600" />,
      color: "bg-purple-50",
      path: "/admin/commandes",
      alert: stats.pendingOrders > 0 ? `${stats.pendingOrders} à livrer` : null
    },
    {
      title: "Journal & Blog",
      description: "Publier des actualités et événements.",
      icon: <FileText className="h-8 w-8 text-green-600" />,
      color: "bg-green-50",
      path: "/admin/blog"
    },
    {
      title: "Boutique & Stocks",
      description: "Ajouter et modifier les articles.",
      icon: <Store className="h-8 w-8 text-amber-600" />,
      color: "bg-amber-50",
      path: "/admin/boutique"
    },
    {
      title: "Configuration Site",
      description: "Textes d'accueil et Bureau CALSED.",
      icon: <Settings2 className="h-8 w-8 text-slate-600" />,
      color: "bg-slate-100",
      path: "/admin/config"
    }
  ];

  return (
    <div className="min-h-screen pt-24 pb-12 bg-slate-50/50 font-sans">
      <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
        
        {/* EN-TÊTE */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold font-display text-[#0A2A5C] flex items-center gap-3">
            <ShieldAlert className="h-8 w-8 text-amber-500" /> Panneau de Contrôle CALSED
          </h1>
          <p className="text-slate-500 mt-2">Vue d'ensemble et accès rapide aux modules d'administration.</p>
        </div>

        {/* STATISTIQUES GLOBALES */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <Card className="border-0 shadow-sm bg-white">
            <CardContent className="p-6">
              <p className="text-xs font-bold text-slate-400 uppercase mb-1">Membres Validés</p>
              <h3 className="text-3xl font-black text-[#0A2A5C]">{stats.totalUsers}</h3>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm bg-white">
            <CardContent className="p-6">
              <p className="text-xs font-bold text-slate-400 uppercase mb-1">Cotisations à jour</p>
              <h3 className="text-3xl font-black text-green-600">{stats.activeUsers}</h3>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm bg-white border-b-4 border-amber-500">
            <CardContent className="p-6">
              <p className="text-xs font-bold text-slate-400 uppercase mb-1">En attente</p>
              <h3 className="text-3xl font-black text-amber-600">{stats.pendingUsers}</h3>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm bg-white border-b-4 border-purple-500">
            <CardContent className="p-6">
              <p className="text-xs font-bold text-slate-400 uppercase mb-1">Commandes à livrer</p>
              <h3 className="text-3xl font-black text-purple-600">{stats.pendingOrders}</h3>
            </CardContent>
          </Card>
        </div>

        {/* MENU DES MODULES */}
        <h2 className="text-xl font-bold text-[#0A2A5C] mb-6">Modules d'administration</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminModules.map((module, index) => (
            <Card 
              key={index} 
              className="border-0 shadow-sm hover:shadow-md transition-all cursor-pointer group hover:-translate-y-1 relative overflow-hidden"
              onClick={() => navigate(module.path)}
            >
              <CardContent className="p-6 flex flex-col h-full">
                <div className={`p-4 rounded-2xl w-fit mb-4 ${module.color}`}>
                  {module.icon}
                </div>
                <h3 className="text-lg font-bold text-[#0A2A5C] mb-2">{module.title}</h3>
                <p className="text-sm text-slate-500 mb-6 flex-grow">{module.description}</p>
                
                <div className="flex items-center justify-between mt-auto">
                  <span className="text-[#0A2A5C] text-sm font-bold flex items-center group-hover:underline">
                    Ouvrir <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </span>
                  {module.alert && (
                    <span className="bg-red-50 text-red-600 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                      {module.alert}
                    </span>
                  )}
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