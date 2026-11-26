
import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("eva-cart")) || [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("eva-cart", JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, quantity = 1) => {
    setCartItems((current) => {
      const existing = current.find(
        (item) => item._id === product._id
      );

      if (existing) {
        return current.map((item) =>
          item._id === product._id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      return [...current, { ...product, quantity }];
    });
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity < 1) return;

    setCartItems((current) =>
      current.map((item) =>
        item._id === productId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const removeFromCart = (productId) => {
    setCartItems((current) =>
      current.filter((item) => item._id !== productId)
    );
  };

  const clearCart = () => setCartItems([]);

  const cartCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const cartTotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        cartTotal,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
}
