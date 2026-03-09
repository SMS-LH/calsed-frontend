import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"; 
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"; 

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext"; 
import { 
  Menu, 
  User, 
  LogOut, 
  LayoutDashboard,
  ChevronDown,
  Heart,
  BookOpen,
  Users,
  Mail,
  ShieldAlert,
  CreditCard,
  Calendar,
  ShoppingBag,
  Store,
  ShoppingCart
} from "lucide-react";

import logoCalsed from "../../assets/logo.jpeg";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const { getItemCount } = useCart(); 

  const isTransparent = location.pathname === "/" && !isScrolled;
  const cartCount = getItemCount(); 

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http') || imagePath.startsWith('data:')) return imagePath;
    const baseUrl = (process.env.REACT_APP_API_URL || import.meta.env.VITE_API_URL || '').replace(/\/api$/, '');
    return `${baseUrl}${imagePath.startsWith('/') ? '' : '/'}${imagePath}`;
  };

  // --- LOGIQUE DE LIENS DYNAMIQUES (DON MASQUÉ) ---
  const commonLinks = [
    { name: "Accueil", href: "/" },
    { name: "À Propos", href: "/equipe", icon: Users },
    ...(isAuthenticated ? [{ name: "Événements", href: "/evenements", icon: Calendar }] : []),
    { name: "Blog", href: "/blog", icon: BookOpen },
    { name: "Boutique", href: "/boutique", icon: Store },
    // { name: "Faire un Don", href: "/don", icon: Heart }, // <-- MASQUÉ TEMPORAIREMENT
    { name: "Contact", href: "/contact", icon: Mail },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const isActive = (href) => {
    if (href === "/") return location.pathname === "/";
    return location.pathname.startsWith(href);
  };

  const handleLogout = () => {
    logout();
    navigate("/connexion");
    setIsMobileMenuOpen(false);
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isTransparent
          ? "bg-transparent py-4"
          : "bg-background/95 backdrop-blur-md shadow-sm border-b border-border py-2"
      }`}
    >
      <nav className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* LOGO */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="bg-white p-1 rounded-lg shadow-sm border border-white/20">
              <img src={logoCalsed} alt="Logo CALSED" className="h-10 w-auto object-contain" />
            </div>
            <div className="hidden sm:block">
              <h1 className={`text-lg font-bold font-display transition-colors leading-none ${isTransparent ? "text-white" : "text-[#0A2A5C]"}`}>
                CALSED
              </h1>
              <p className={`text-[10px] transition-colors font-medium tracking-wide ${isTransparent ? "text-white/80" : "text-slate-500"}`}>
                Excellence & Solidarité
              </p>
            </div>
          </Link>

          {/* NAVIGATION DESKTOP */}
          <div className="hidden lg:flex items-center gap-1">
            {commonLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  isActive(link.href)
                    ? "bg-[#FFD700] text-[#0A2A5C] font-bold shadow-sm"
                    : isTransparent 
                      ? "text-white hover:bg-white/10"
                      : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                {link.name}
              </Link>
            ))}
            
            {!isAuthenticated && (
              <Link
                to="/membre"
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                   isActive("/membre")
                     ? "bg-[#FFD700] text-[#0A2A5C] font-bold shadow-sm"
                     : isTransparent 
                       ? "text-white hover:bg-white/10" 
                       : "text-slate-700 hover:bg-slate-100"
                }`}
              >
                Adhésion
              </Link>
            )}
          </div>

          {/* ACTIONS DROITE */}
          <div className="flex items-center gap-2 lg:gap-4">

            <Link to="/panier">
              <Button variant="ghost" size="icon" className={`relative transition-all ${isTransparent ? "text-white hover:bg-white/10" : "text-slate-700 hover:bg-slate-100"}`}>
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-red-500 text-white border-2 border-white text-[9px] font-black animate-in zoom-in">
                    {cartCount}
                  </Badge>
                )}
              </Button>
            </Link>
            
            <div className="hidden lg:block">
              {isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className={`flex items-center gap-2 px-2 rounded-full ${isTransparent ? "text-white hover:bg-white/10" : ""}`}>
                      <Avatar className="h-8 w-8 border-2 border-white/20">
                        <AvatarImage src={getImageUrl(user?.avatar)} alt={user?.name} />
                        <AvatarFallback className={user?.role === 'admin' ? "bg-red-600 text-white text-xs" : "bg-[#0A2A5C] text-white text-xs"}>
                            {user?.role === 'admin' ? <ShieldAlert className="h-4 w-4" /> : user?.name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden md:block text-sm font-medium">
                        {user?.role === 'admin' ? 'Administration' : user?.name?.split(' ')[0]}
                      </span>
                      <ChevronDown className="h-4 w-4 hidden md:block" />
                    </Button>
                  </DropdownMenuTrigger>
                  
                  <DropdownMenuContent align="end" className="w-56 mt-2">
                    <div className="px-2 py-1.5 bg-slate-50 rounded-t-md">
                      <p className="text-sm font-bold text-[#0A2A5C] truncate">{user?.name}</p>
                      {user?.role === 'admin' ? (
                          <Badge className="mt-1 bg-red-100 text-red-700 border-0 text-[10px]">Compte de Gestion</Badge>
                      ) : (
                          <p className="text-[10px] text-slate-500">Compte Personnel</p>
                      )}
                    </div>
                    <DropdownMenuSeparator />

                    {user?.role === "admin" ? (
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="text-red-600 focus:text-red-600 bg-red-50 focus:bg-red-100 cursor-pointer font-bold">
                          <ShieldAlert className="mr-2 h-4 w-4" /> Gestion du Bureau
                        </Link>
                      </DropdownMenuItem>
                    ) : (
                      <>
                        <DropdownMenuItem asChild>
                          <Link to="/dashboard" className="cursor-pointer">
                            <LayoutDashboard className="mr-2 h-4 w-4 text-slate-500" /> Mon Espace
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to="/profile" className="cursor-pointer">
                            <User className="mr-2 h-4 w-4 text-slate-500" /> Mon Profil
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to="/membre" className="cursor-pointer">
                            <CreditCard className="mr-2 h-4 w-4 text-slate-500" /> Ma Cotisation
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600 cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" /> Déconnexion
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/connexion">
                    <Button variant="ghost" size="sm" className={isTransparent ? "text-white hover:bg-white/10" : ""}>Connexion</Button>
                  </Link>
                  <Link to="/inscription">
                    <Button size="sm" className="bg-[#FFD700] text-[#0A2A5C] hover:bg-[#FFD700]/90 font-bold">Rejoindre</Button>
                  </Link>
                </div>
              )}
            </div>

            {/* MENU MOBILE */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className={`lg:hidden ${isTransparent ? "text-white hover:bg-white/10" : ""}`}>
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] p-0 flex flex-col">
                <div className="p-5 border-b bg-slate-50/50 flex items-center gap-3">
                  <img src={logoCalsed} alt="Logo" className="h-8 w-auto rounded" />
                  <h2 className="font-bold font-display text-[#0A2A5C]">CALSED</h2>
                </div>

                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
                  {commonLinks.map((link) => (
                    <Link 
                      key={link.href} 
                      to={link.href} 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${
                        isActive(link.href) ? "bg-slate-100 text-[#0A2A5C]" : "text-slate-600"
                      }`}
                    >
                      {link.icon && <link.icon className="h-5 w-5 opacity-70" />} 
                      {link.name}
                    </Link>
                  ))}

                  <Separator />

                  {isAuthenticated ? (
                    <div className="space-y-1">
                      {user?.role === 'admin' ? (
                        <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-600 bg-red-50">
                          <ShieldAlert className="h-5 w-5" /> Gestion Bureau
                        </Link>
                      ) : (
                        <>
                          <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-700">
                            <LayoutDashboard className="h-5 w-5 text-blue-600" /> Mon Espace
                          </Link>
                          <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-700">
                            <User className="h-5 w-5 text-slate-500" /> Mon Profil
                          </Link>
                        </>
                      )}
                      <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 mt-4">
                        <LogOut className="h-5 w-5" /> Déconnexion
                      </button>
                    </div>
                  ) : (
                    <div className="grid gap-2 p-2">
                      <Link to="/connexion" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button variant="outline" className="w-full">Connexion</Button>
                      </Link>
                      <Link to="/inscription" onClick={() => setIsMobileMenuOpen(false)}>
                        <Button className="w-full bg-[#0A2A5C]">S'inscrire</Button>
                      </Link>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>

          </div>
        </div>
      </nav>
    </motion.header>
  );
};

export default Navbar;