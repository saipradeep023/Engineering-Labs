import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getCart, addToCart, updateCartQuantity, removeFromCart } from '../services/api.js';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCart();
      if (data.success) {
        setCartItems(data.cart);
      }
    } catch (err) {
      console.error("Failed to load cart", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addProductToCart = async (productId) => {
    try {
      const data = await addToCart(productId);
      if (data.success) {
        setCartItems(data.cart);
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (err) {
      return { success: false, message: "Unable to add to cart" };
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (quantity < 1) return { success: false, message: "Quantity must be at least 1" };
    try {
      const data = await updateCartQuantity(productId, quantity);
      if (data.success) {
        setCartItems(data.cart);
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (err) {
      return { success: false, message: "Unable to update quantity" };
    }
  };

  const removeProductFromCart = async (productId) => {
    try {
      const data = await removeFromCart(productId);
      if (data.success) {
        setCartItems(data.cart);
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (err) {
      return { success: false, message: "Unable to remove product" };
    }
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const value = {
    cartItems,
    loading,
    error,
    cartCount,
    fetchCart,
    addProductToCart,
    updateQuantity,
    removeProductFromCart,
    clearCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
