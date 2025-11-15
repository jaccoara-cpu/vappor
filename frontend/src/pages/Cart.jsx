import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Galaxy from '../components/Galaxy';
import { getImageUrl } from '../utils/imageUtils';
import { useCart } from '../hooks/useCart';
import './Cart.css';

const Cart = () => {
  const navigate = useNavigate();
  const { cart, removeFromCart, clearCart, total } = useCart();


  const handleCheckout = () => {
    if (cart.length === 0) return;
    navigate('/reservation', {
      state: {
        cartItems: cart,
      },
    });
  };

  if (cart.length === 0) {
    return (
      <>
        <Header showBack onBack={() => navigate('/catalog')} />
        <div className="cart-page">
          <div className="cart-galaxy">
            <Galaxy 
              mouseRepulsion={false}
              mouseInteraction={false}
              density={1}
              glowIntensity={0.5}
              saturation={0.6}
              hueShift={140}
              twinkleIntensity={0.3}
              rotationSpeed={0.1}
              repulsionStrength={2}
              autoCenterRepulsion={0}
              starSpeed={0.5}
              speed={1}
              transparent={true}
            />
          </div>
          <div className="container cart-content-wrapper">
            <div className="cart-empty">
              <h2>Корзина пуста</h2>
              <p>Добавьте товары в корзину, чтобы оформить заказ</p>
              <button onClick={() => navigate('/catalog')} className="btn btn-primary">
                Перейти в каталог
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header showBack onBack={() => navigate('/catalog')} />
      <div className="cart-page">
        <div className="cart-galaxy">
          <Galaxy 
            mouseRepulsion={false}
            mouseInteraction={false}
            density={1}
            glowIntensity={0.5}
            saturation={0.6}
            hueShift={140}
            twinkleIntensity={0.3}
            rotationSpeed={0.1}
            repulsionStrength={2}
            autoCenterRepulsion={0}
            starSpeed={0.5}
            speed={1}
            transparent={true}
          />
        </div>
        <div className="container cart-content-wrapper">
          <div className="cart-header">
            <h1>Корзина</h1>
            <button onClick={clearCart} className="btn btn-ghost btn-clear">
              Очистить корзину
            </button>
          </div>

          <div className="cart-items">
            {cart.map((item) => {
              const displayImage = item.selectedFlavor?.image_path 
                ? getImageUrl(item.selectedFlavor.image_path)
                : getImageUrl(item.product.image_path);
              
              const flavorName = item.selectedFlavor?.name || '';
              const volumeText = item.selectedVolume ? ` • ${item.selectedVolume}` : '';
              
              return (
                <div key={item.id} className="cart-item">
                  <div className="cart-item-image">
                    {displayImage ? (
                      <img src={displayImage} alt={item.product.name} />
                    ) : (
                      <div className="no-image">Нет фото</div>
                    )}
                  </div>
                  <div className="cart-item-info">
                    <h3>{item.product.name}</h3>
                    {flavorName && (
                      <p className="cart-item-flavor">Вкус: {flavorName}{volumeText}</p>
                    )}
                    <div className="cart-item-details">
                      <span className="cart-item-date">
                        {item.isPickup ? 'Самовывоз на сегодня' : 
                         item.slot ? new Date(`${item.date} ${item.slot.start_time.split(' ')[1]}`).toLocaleString('uk-UA', {
                           day: 'numeric',
                           month: 'long',
                           hour: '2-digit',
                           minute: '2-digit',
                         }) : item.date}
                      </span>
                      <span className="cart-item-price">{item.price} ₴</span>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="btn btn-ghost btn-remove"
                    title="Удалить"
                  >
                    ×
                  </button>
                </div>
              );
            })}
          </div>

          <div className="cart-footer">
            <div className="cart-total">
              <span className="cart-total-label">Итого:</span>
              <span className="cart-total-value">{total.toFixed(2)} ₴</span>
            </div>
            <button onClick={handleCheckout} className="btn btn-primary btn-checkout">
              Оформить заказ
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Cart;

