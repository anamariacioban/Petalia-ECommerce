import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('petalia_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('petalia_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (produs, cantitate = 1) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id_floare === produs.id_floare);
      if (existing) {
        return prev.map(item =>
          item.id_floare === produs.id_floare
            ? { ...item, cantitate: item.cantitate + cantitate }
            : item
        );
      }
      return [...prev, { ...produs, cantitate }];
    });
  };

  const removeFromCart = (id_floare) => {
    setCartItems(prev => prev.filter(item => item.id_floare !== id_floare));
  };

  const updateQuantity = (id_floare, cantitate) => {
    if (cantitate <= 0) {
      removeFromCart(id_floare);
      return;
    }
    setCartItems(prev =>
      prev.map(item =>
        item.id_floare === id_floare ? { ...item, cantitate } : item
      )
    );
  };

  const clearCart = () => setCartItems([]);

  const cartCount = cartItems.reduce((sum, item) => sum + item.cantitate, 0);
  const cartTotal = cartItems.reduce((sum, item) => sum + item.pret * item.cantitate, 0);

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, cartCount, cartTotal }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
