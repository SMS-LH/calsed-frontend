import { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  // Initialisation depuis le localStorage AVEC SÉCURITÉ (try...catch)
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem("calsed_cart");
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.error("Erreur de lecture du panier :", error);
      return []; // Si les données sont corrompues, on repart sur un panier vide
    }
  });

  // Sauvegarde automatique dès que le panier change
  useEffect(() => {
    localStorage.setItem("calsed_cart", JSON.stringify(cart));
  }, [cart]);

  // Ajouter au panier
  const addToCart = (product, quantity = 1) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item._id === product._id);

      if (existingItem) {
        // Vérifier si on dépasse le stock disponible
        if (existingItem.quantity + quantity > product.stock) {
          toast.error(`Stock insuffisant (Max: ${product.stock})`);
          return prevCart;
        }
        toast.success(`Quantité mise à jour : ${product.name}`);
        return prevCart.map((item) =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      toast.success(`${product.name} ajouté au panier`);
      return [...prevCart, { ...product, quantity }];
    });
  };

  // Retirer ou diminuer la quantité
  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item._id !== productId));
    toast.info("Article retiré du panier");
  };

  const updateQuantity = (productId, newQty) => {
    if (newQty < 1) return;
    
    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item._id === productId) {
          // MODIFICATION ICI : Empêcher de dépasser le stock via le bouton "+"
          if (newQty > item.stock) {
            toast.error(`Stock maximum atteint (${item.stock})`);
            return item;
          }
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  const clearCart = () => setCart([]);

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getItemCount = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getItemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);