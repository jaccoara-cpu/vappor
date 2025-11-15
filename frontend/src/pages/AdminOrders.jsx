import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminGetOrders, adminLogout } from '../api';
import { getImageUrl } from '../utils/imageUtils';
import ASCIIText from '../components/ASCIIText';
import LetterGlitch from '../components/LetterGlitch';
import './AdminOrders.css';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, new, completed, cancelled
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    loadOrders();
  }, [navigate]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const response = await adminGetOrders();
      setOrders(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };


  const getStatusLabel = (status) => {
    const labels = {
      new: 'Новый',
      completed: 'Выполнен',
      cancelled: 'Отменен',
    };
    return labels[status] || status;
  };

  const getStatusClass = (status) => {
    const classes = {
      new: 'status-new',
      completed: 'status-completed',
      cancelled: 'status-cancelled',
    };
    return classes[status] || '';
  };

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(order => order.status === filter);

  const letterGlitchComponent = useMemo(() => (
    <div style={{ width: '100%', height: '100vh', position: 'fixed', top: 0, left: 0, zIndex: 0, pointerEvents: 'none' }}>
      <LetterGlitch
        glitchColors={['#4A1E6B', '#8B2CF7', '#D946EF', '#9333EA', '#A855F7']}
        glitchSpeed={250}
        centerVignette={true}
        outerVignette={true}
        smooth={false}
      />
    </div>
  ), []);

  return (
    <div className="admin-page">
      {letterGlitchComponent}
      <div className="admin-header">
        <div className="container">
          <div className="admin-header-content">
            <div className="admin-header-title">
              <span className="admin-header-vapor">VAPOR</span>
              <div className="admin-header-admin">
                <ASCIIText
                  text="Admin"
                  enableWaves={true}
                  asciiFontSize={2}
                  textFontSize={120}
                  textColor="#fdf9f3"
                  planeBaseHeight={8}
                />
              </div>
            </div>
            <div className="admin-nav">
              <button
                onClick={() => navigate('/admin/products')}
                className="btn btn-ghost"
              >
                Товары
              </button>
              <button
                onClick={() => navigate('/admin/orders')}
                className="btn btn-ghost active"
              >
                Заказы
              </button>
              <button
                onClick={() => navigate('/admin/finance')}
                className="btn btn-ghost"
              >
                Финансы
              </button>
              <button
                onClick={async () => {
                  try {
                    await adminLogout();
                  } catch (err) {
                    console.error('Logout error:', err);
                  } finally {
                    localStorage.removeItem('admin_token');
                    localStorage.removeItem('admin_authenticated');
                    navigate('/admin/login');
                  }
                }}
                className="btn btn-ghost"
              >
                Выход
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="admin-content">
        <div className="container">
          <div className="admin-actions">
            <h2>Заказы</h2>
            <div className="admin-filters">
              <button
                onClick={() => setFilter('all')}
                className={`btn btn-ghost ${filter === 'all' ? 'active' : ''}`}
              >
                Все
              </button>
              <button
                onClick={() => setFilter('new')}
                className={`btn btn-ghost ${filter === 'new' ? 'active' : ''}`}
              >
                Новые
              </button>
              <button
                onClick={() => setFilter('completed')}
                className={`btn btn-ghost ${filter === 'completed' ? 'active' : ''}`}
              >
                Выполненные
              </button>
              <button
                onClick={() => setFilter('cancelled')}
                className={`btn btn-ghost ${filter === 'cancelled' ? 'active' : ''}`}
              >
                Отмененные
              </button>
            </div>
          </div>

          {loading ? (
            <div className="loading">Загрузка...</div>
          ) : filteredOrders.length === 0 ? (
            <div className="empty-state">
              <p>Нет заказов</p>
            </div>
          ) : (
            <div className="admin-orders-list">
              {filteredOrders.map((order) => (
                <div
                  key={order.id}
                  className="admin-order-card card"
                  onClick={() => navigate(`/admin/orders/${order.id}`)}
                >
                  <div className="admin-order-main">
                    <div className="admin-order-product">
                      {getImageUrl(order.product?.image_path) && (
                        <img
                          src={getImageUrl(order.product.image_path)}
                          alt={order.product?.name}
                          className="admin-order-image"
                        />
                      )}
                      <div className="admin-order-product-info">
                        <h3>{order.product?.name || 'Товар удален'}</h3>
                        <p className="admin-order-price">{order.product?.price || 0} ₴</p>
                      </div>
                    </div>
                    <div className="admin-order-customer">
                      <p className="admin-order-customer-name">{order.customer_name}</p>
                      {order.customer_phone && (
                        <p className="admin-order-customer-phone">{order.customer_phone}</p>
                      )}
                      {order.customer_telegram && (
                        <p className="admin-order-customer-telegram">@{order.customer_telegram}</p>
                      )}
                    </div>
                    <div className="admin-order-time">
                      <p className="admin-order-reservation-time">
                        {new Date(order.reservation_time).toLocaleString('uk-UA', {
                          day: 'numeric',
                          month: 'long',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                      <p className="admin-order-created">
                        Создан: {new Date(order.created_at).toLocaleDateString('uk-UA')}
                      </p>
                    </div>
                    <div className={`admin-order-status ${getStatusClass(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;




