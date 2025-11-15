import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import Header from '../components/Header';
import './ReservationConfirmation.css';

const ReservationConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { product, slot, date, customerName, isPickup } = location.state || {};
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Разрешаем переход без slot для самовывоза
    if (!product) {
      navigate('/catalog');
      return;
    }
    setTimeout(() => setIsVisible(true), 100);
  }, [product, navigate]);

  if (!product) return null;

  // Для самовывоза используем текущую дату
  const reservationDate = (isPickup || !slot) 
    ? new Date() 
    : new Date(`${date} ${slot.start_time.split(' ')[1]}`);

  return (
    <>
      <Header />
      <div className="confirmation-page">
        <div className="container">
          <div className={`confirmation-content ${isVisible ? 'fade-in' : ''}`}>
            <div className="confirmation-icon">
              <CheckCircle size={64} color="#00FF00" />
            </div>
            
            <h1 className="confirmation-title">Резервация оформлена</h1>
            
            <div className="confirmation-details">
              <div className="detail-item">
                <span className="detail-label">Товар:</span>
                <span className="detail-value">{product.name}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">{isPickup || !slot ? 'Тип заказа:' : 'Время:'}</span>
                <span className="detail-value">
                  {isPickup || !slot 
                    ? 'Самовывоз на сегодня'
                    : reservationDate.toLocaleString('uk-UA', {
                        day: 'numeric',
                        month: 'long',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                  }
                </span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Имя:</span>
                <span className="detail-value">{customerName}</span>
              </div>
            </div>

            <div className="confirmation-instruction">
              <p>
                Для продолжения оплаты напишите менеджеру в Telegram:
              </p>
              <p className="telegram-username">@Vapor_managerr</p>
            </div>

            <div className="confirmation-actions">
              <a
                href="https://t.me/Vapor_managerr"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                Перейти в Telegram
              </a>
              <button
                onClick={() => navigate('/catalog')}
                className="btn btn-secondary"
              >
                Вернуться в каталог
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ReservationConfirmation;

