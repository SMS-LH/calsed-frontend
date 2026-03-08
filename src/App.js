import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner"; 
import { Loader2 } from "lucide-react";

// Layout
import Navbar from "./components/layout/Navbar"; 
import Footer from "./components/layout/Footer";

// Utils
import ScrollToTop from "./components/utils/ScrollToTop";

// Pages Publiques & Utilisateurs
import HomePage from "./pages/HomePage";
import BlogPageList from "./pages/BlogPage"; 
import BlogPostPage from "./pages/BlogPostPage"; 
import MemberPage from "./pages/MemberPage";
import DashboardPage from "./pages/DashboardPage";
import DirectoryPage from "./pages/DirectoryPage"; 
import MemberProfilePage from "./pages/MemberProfilePage"; 
import DonatePage from "./pages/DonatePage";
import ContactPage from "./pages/ContactPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import TeamPage from "./pages/TeamPage"; 
import EventsPage from "./pages/EventsPage"; 

// --- NOUVELLES PAGES (MOT DE PASSE OUBLIÉ) ---
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";

// --- BOUTIQUE ---
import ShopPage from "./pages/ShopPage";
import ProductPostPage from "./pages/ProductPostPage";
import ShopCartPage from "./pages/ShopCartPage"; 
import CheckoutPage from "./pages/CheckoutPage";

// --- PAGES ADMINISTRATION (NOUVELLES) ---
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminMembersPage from "./pages/AdminMembersPage";
import AdminOrdersPage from "./pages/AdminOrdersPage";
import AdminBlogPage from "./pages/AdminBlogPage";
import AdminBoutiquePage from "./pages/AdminBoutiquePage";
import AdminConfigPage from "./pages/AdminConfigPage";

// Contexts
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ContentProvider } from "./context/ContentContext"; 
import { CartProvider } from "./context/CartContext"; 

// --- 1. COMPOSANT DE BASE : PROTECTION AUTHENTIFICATION ---
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-white">
        <Loader2 className="h-10 w-10 animate-spin text-[#0A2A5C] mb-4" />
        <p className="text-slate-400 text-[10px] uppercase tracking-widest font-bold">Chargement...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/connexion" replace />;
  }

  if (adminOnly && user?.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// --- 2. PROTECTION COTISATION (VERSION SILENCIEUSE) ---
const RequireMembership = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) return null; 

  // Vérification de sécurité (Date > Aujourd'hui)
  const hasActiveSubscription = user?.paidUntil && new Date(user.paidUntil) > new Date();
  const isAdmin = user?.role === 'admin';

  // Si pas d'abonnement actif ET pas admin
  if (!hasActiveSubscription && !isAdmin) {
    // Redirection sans message d'erreur pour éviter les conflits d'affichage
    return <Navigate to="/membre" replace />;
  }

  return children;
};

function AppContent() {
  return (
    <BrowserRouter>
      <ScrollToTop /> 
      
      <div className="min-h-screen flex flex-col">
        
        <Navbar /> 
        
        <main className="flex-1">
          <Routes>
            {/* --- Routes Publiques --- */}
            <Route path="/" element={<HomePage />} />
            <Route path="/blog" element={<BlogPageList />} />
            <Route path="/blog/:id" element={<BlogPostPage />} />
            <Route path="/don" element={<DonatePage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/equipe" element={<TeamPage />} />
            
            {/* Boutique Publique */}
            <Route path="/boutique" element={<ShopPage />} />
            <Route path="/boutique/:id" element={<ProductPostPage />} />
            <Route path="/panier" element={<ShopCartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />

            {/* Auth & Sécurité */}
            <Route path="/connexion" element={<LoginPage />} />
            <Route path="/inscription" element={<RegisterPage />} />
            
            {/* --- ROUTES MOT DE PASSE OUBLIÉ --- */}
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

            {/* --- Routes Accessibles CONNECTÉ --- */}
            
            {/* Page Membre standard */}
            <Route path="/membre" element={<MemberPage />} />
            
            <Route path="/profile" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />

            {/* --- Routes STRICTES (Bloquées si dette) --- */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <RequireMembership>
                   <DashboardPage />
                </RequireMembership>
              </ProtectedRoute>
            } />

            <Route path="/annuaire" element={
              <ProtectedRoute>
                <RequireMembership>
                   <DirectoryPage />
                </RequireMembership>
              </ProtectedRoute>
            } />

            <Route path="/annuaire/:id" element={
              <ProtectedRoute>
                <RequireMembership>
                   <MemberProfilePage />
                </RequireMembership>
              </ProtectedRoute>
            } />

            <Route path="/evenements" element={
              <ProtectedRoute>
                <RequireMembership>
                   <EventsPage />
                </RequireMembership>
              </ProtectedRoute>
            } /> 
            
            {/* --- ADMINISTRATION --- */}
            <Route path="/admin" element={
              <ProtectedRoute adminOnly={true}>
                <AdminDashboardPage />
              </ProtectedRoute>
            } />
            
            <Route path="/admin/membres" element={
              <ProtectedRoute adminOnly={true}>
                <AdminMembersPage />
              </ProtectedRoute>
            } />
            
            <Route path="/admin/commandes" element={
              <ProtectedRoute adminOnly={true}>
                <AdminOrdersPage />
              </ProtectedRoute>
            } />
            
            <Route path="/admin/blog" element={
              <ProtectedRoute adminOnly={true}>
                <AdminBlogPage />
              </ProtectedRoute>
            } />
            
            <Route path="/admin/boutique" element={
              <ProtectedRoute adminOnly={true}>
                <AdminBoutiquePage />
              </ProtectedRoute>
            } />
            
            <Route path="/admin/config" element={
              <ProtectedRoute adminOnly={true}>
                <AdminConfigPage />
              </ProtectedRoute>
            } />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <Footer />
        
      </div>
      
      <Toaster position="bottom-right" richColors closeButton />
      
    </BrowserRouter>
  );
}

function App() {
  return (
    <AuthProvider>
      <ContentProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </ContentProvider>
    </AuthProvider>
  );
}

export default App;