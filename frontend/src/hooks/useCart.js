import { useState, useEffect } from 'react';
import { getCart, saveCart, addToCart as addItem, removeFromCart as removeItem, clearCart as clear, getCartItemCount, getCartTotal } from '../utils/cartUtils';

export const useCart = () => {
  const [cart, setCart] = useState([]);
  const [itemCount, setItemCount] = useState(0);
  const [total, setTotal] = useState(0);

  // Загрузить корзину при монтировании
  useEffect(() => {
    updateCart();
  }, []);

  const updateCart = () => {
    const currentCart = getCart();
    setCart(currentCart);
    setItemCount(getCartItemCount());
    setTotal(getCartTotal());
  };

  const addToCart = (item) => {
    const newCart = addItem(item);
    setCart(newCart);
    setItemCount(getCartItemCount());
    setTotal(getCartTotal());
    return newCart;
  };

  const removeFromCart = (itemId) => {
    const newCart = removeItem(itemId);
    setCart(newCart);
    setItemCount(getCartItemCount());
    setTotal(getCartTotal());
    return newCart;
  };

  const clearCart = () => {
    clear();
    setCart([]);
    setItemCount(0);
    setTotal(0);
  };

  return {
    cart,
    itemCount,
    total,
    addToCart,
    removeFromCart,
    clearCart,
    updateCart,
  };
};

