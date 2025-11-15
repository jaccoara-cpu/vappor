import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Aurora from '../components/Aurora';
import { createOrder } from '../api';
import { getImageUrl } from '../utils/imageUtils';
import { useCart } from '../hooks/useCart';
import './Reservation.css';

const Reservation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { product, slot, date, isPickup, cartItems } = location.state || {};
  const { clearCart } = useCart();

  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    customer_telegram: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Определяем, работаем ли с корзиной или одним товаром
  const isCartOrder = cartItems && cartItems.length > 0;

  useEffect(() => {
    // Разрешаем переход без slot для самовывоза или если это заказ из корзины
    if (!product && !isCartOrder) {
      navigate('/catalog');
    }
  }, [product, isCartOrder, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.customer_name.trim()) {
      setError('Имя обязательно для заполнения');
      return;
    }

    try {
      setLoading(true);
      
      const itemsToOrder = isCartOrder ? cartItems : [{
        product,
        slot,
        date,
        isPickup: isPickup || !slot,
        selectedVolume: location.state?.selectedVolume || null,
      }];

      // Создаем заказы для всех товаров
      const orders = [];
      for (const item of itemsToOrder) {
        let reservationTime;
        if (item.isPickup || !item.slot) {
          const now = new Date();
          now.setTime(now.getTime() + 60 * 60 * 1000); // Текущее время + 1 час
          reservationTime = now.toISOString().slice(0, 19).replace('T', ' ');
        } else {
          // Разрешаем заказ на любой выбранный слот
          reservationTime = `${item.date} ${item.slot.start_time.split(' ')[1]}`;
        }
        
        const orderData = {
          product_id: item.product.id,
          customer_name: formData.customer_name,
          customer_phone: formData.customer_phone || null,
          customer_telegram: formData.customer_telegram || null,
          reservation_time: reservationTime,
        };
        
        // Добавляем volume, если он есть
        if (item.selectedVolume) {
          orderData.volume = item.selectedVolume;
        }
        
        try {
          const response = await createOrder(orderData);
          // axios автоматически извлекает data из response
          const order = response.data;
          orders.push(order);
        } catch (orderError) {
          // Если заказ создан (статус 201), но есть ошибка в обработке, все равно продолжаем
          if (orderError.response?.status === 201 || orderError.response?.status === 200) {
            const order = orderError.response?.data;
            if (order) {
        orders.push(order);
            }
          } else {
            // Если это реальная ошибка, пробрасываем дальше
            throw orderError;
          }
        }
      }

      // Очищаем корзину, если заказ был из корзины
      if (isCartOrder) {
        clearCart();
      }

      navigate('/reservation/confirmation', {
        state: {
          product: isCartOrder ? null : product,
          slot: isCartOrder ? null : slot,
          date: isCartOrder ? null : date,
          customerName: formData.customer_name,
          isPickup: isCartOrder ? null : (isPickup || !slot),
          orders: orders,
          isCartOrder: isCartOrder,
        },
      });
    } catch (err) {
      // Проверяем, действительно ли это ошибка или заказ был создан
      if (err.response?.status === 201 || err.response?.status === 200) {
        // Заказ успешно создан, но произошла ошибка при обработке ответа
        // Пытаемся извлечь данные заказа из ответа
        try {
          const orderData = err.response?.data?.data || err.response?.data;
          if (orderData) {
            // Заказ создан, перенаправляем на страницу подтверждения
            if (isCartOrder) {
              clearCart();
            }
            navigate('/reservation/confirmation', {
              state: {
                product: isCartOrder ? null : product,
                slot: isCartOrder ? null : slot,
                date: isCartOrder ? null : date,
                customerName: formData.customer_name,
                isPickup: isCartOrder ? null : (isPickup || !slot),
                orders: [orderData],
                isCartOrder: isCartOrder,
              },
            });
            return;
          }
        } catch (navError) {
          console.error('Navigation error:', navError);
        }
      }
      
      let errorMessage = err.response?.data?.message || err.message || 'Ошибка при создании резервации';
      
      // Переводим ошибки валидации на украинский
      if (errorMessage.includes('reservation time') && errorMessage.includes('after now')) {
        errorMessage = 'Час резервації повинен бути пізніше за поточний момент';
      } else if (errorMessage.includes('reservation time')) {
        errorMessage = 'Невірний формат часу резервації';
      }
      
      setError(errorMessage);
      console.error('Order creation error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!product && !isCartOrder) return null;


  const totalPrice = isCartOrder 
    ? cartItems.reduce((sum, item) => sum + parseFloat(item.price || 0), 0)
    : product?.price || 0;

  const auroraComponent = useMemo(() => (
    <Aurora
      colorStops={["#4A1E6B", "#8B2CF7", "#D946EF"]}
      blend={0.5}
      amplitude={1.0}
      speed={0.5}
    />
  ), []);

  return (
    <>
      <Header showBack onBack={() => isCartOrder ? navigate('/cart') : navigate(`/product/${product.id}`)} />
      <div className="reservation-page">
        <div className="reservation-aurora">
          {auroraComponent}
        </div>
        <div className="container reservation-content-wrapper">
          <div className="reservation-content">
            {isCartOrder ? (
              <div className="reservation-products">
                <h3>Товары в заказе ({cartItems.length})</h3>
                <div className="reservation-products-list">
                  {cartItems.map((item) => {
                    const displayImage = item.selectedFlavor?.image_path 
                      ? getImageUrl(item.selectedFlavor.image_path)
                      : getImageUrl(item.product.image_path);
                    
                    return (
                      <div key={item.id} className="reservation-product-item">
                        {displayImage && (
                          <img
                            src={displayImage}
                            alt={item.product.name}
                            className="reservation-product-image-small"
                          />
                        )}
                        <div className="reservation-product-item-info">
                          <h4>{item.product.name}</h4>
                          {item.selectedFlavor && (
                            <p className="reservation-product-flavor">
                              {item.selectedFlavor.name}{item.selectedVolume ? ` • ${item.selectedVolume}` : ''}
                            </p>
                          )}
                          <p className="reservation-product-price">{item.price} ₴</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="reservation-total">
                  <span>Итого:</span>
                  <span className="reservation-total-price">{totalPrice.toFixed(2)} ₴</span>
                </div>
              </div>
            ) : (
              <>
                <div className="reservation-product">
                  {getImageUrl(product.image_path) && (
                    <img
                      src={getImageUrl(product.image_path)}
                      alt={product.name}
                      className="reservation-product-image"
                    />
                  )}
                  <div className="reservation-product-info">
                    <h3>{product.name}</h3>
                    <p className="reservation-price">{product.price} ₴</p>
                  </div>
                </div>

                <div className="reservation-time">
                  <h4>{isPickup || !slot ? 'Самовывоз' : 'Выбранное время'}</h4>
                  {isPickup || !slot ? (
                    <p>Самовывоз на сегодня</p>
                  ) : (
                    <p>{new Date(`${date} ${slot.start_time.split(' ')[1]}`).toLocaleString('uk-UA', {
                      day: 'numeric',
                      month: 'long',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}</p>
                  )}
                  <button
                    onClick={() => navigate(`/product/${product.id}`)}
                    className="btn btn-ghost"
                  >
                    {isPickup || !slot ? 'Изменить' : 'Изменить время'}
                  </button>
                </div>
              </>
            )}

            <form onSubmit={handleSubmit} className="reservation-form">
              <h3>Ваши данные</h3>
              
              <div className="form-group">
                <label htmlFor="customer_name">Имя/Никнейм *</label>
                <input
                  type="text"
                  id="customer_name"
                  name="customer_name"
                  className="input"
                  value={formData.customer_name}
                  onChange={handleChange}
                  required
                  placeholder="Введите ваше имя"
                />
              </div>

              <div className="form-group">
                <label htmlFor="customer_phone">Телефон</label>
                <input
                  type="tel"
                  id="customer_phone"
                  name="customer_phone"
                  className="input"
                  value={formData.customer_phone}
                  onChange={handleChange}
                  placeholder="+380XXXXXXXXX"
                />
              </div>

              <div className="form-group">
                <label htmlFor="customer_telegram">Telegram username</label>
                <input
                  type="text"
                  id="customer_telegram"
                  name="customer_telegram"
                  className="input"
                  value={formData.customer_telegram}
                  onChange={handleChange}
                  placeholder="@username"
                />
              </div>

              {error && <div className="error-message">{error}</div>}

              <button
                type="submit"
                disabled={loading || !formData.customer_name.trim()}
                className="btn btn-primary btn-submit"
              >
                {loading ? 'Обработка...' : isCartOrder ? `Оформить заказ (${cartItems.length} товаров)` : 'Подтвердить резервацию'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Reservation;

