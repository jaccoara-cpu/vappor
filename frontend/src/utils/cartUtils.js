const CART_STORAGE_KEY = 'vapor_cart';

// Получить корзину из localStorage
export const getCart = () => {
  try {
    const cart = localStorage.getItem(CART_STORAGE_KEY);
    return cart ? JSON.parse(cart) : [];
  } catch (error) {
    console.error('Error getting cart:', error);
    return [];
  }
};

// Сохранить корзину в localStorage
export const saveCart = (cart) => {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch (error) {
    console.error('Error saving cart:', error);
  }
};

// Добавить товар в корзину
export const addToCart = (item) => {
  const cart = getCart();
  const newItem = {
    id: `${item.product.id}_${item.selectedVolume}_${item.selectedFlavor?.name || 'default'}_${Date.now()}`,
    product: item.product,
    selectedVolume: item.selectedVolume,
    selectedFlavor: item.selectedFlavor,
    price: item.price,
    date: item.date,
    slot: item.slot,
    isPickup: item.isPickup || false,
  };
  cart.push(newItem);
  saveCart(cart);
  return cart;
};

// Удалить товар из корзины
export const removeFromCart = (itemId) => {
  const cart = getCart();
  const updatedCart = cart.filter(item => item.id !== itemId);
  saveCart(updatedCart);
  return updatedCart;
};

// Очистить корзину
export const clearCart = () => {
  localStorage.removeItem(CART_STORAGE_KEY);
  return [];
};

// Получить количество товаров в корзине
export const getCartItemCount = () => {
  return getCart().length;
};

// Получить общую стоимость корзины
export const getCartTotal = () => {
  const cart = getCart();
  return cart.reduce((total, item) => total + parseFloat(item.price || 0), 0);
};

