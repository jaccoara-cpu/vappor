import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { adminGetOrder, adminUpdateOrder, adminLogout } from '../api';
import { getImageUrl } from '../utils/imageUtils';
import ASCIIText from '../components/ASCIIText';
import LetterGlitch from '../components/LetterGlitch';
import './AdminOrderDetail.css';

const AdminOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    loadOrder();
  }, [id, navigate]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const response = await adminGetOrder(id);
      setOrder(response.data);
    } catch (err) {
      console.error(err);
      alert('Ошибка при загрузке заказа');
      navigate('/admin/orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!window.confirm(`Изменить статус заказа на "${newStatus}"?`)) {
      return;
    }

    try {
      setUpdating(true);
      await adminUpdateOrder(id, { status: newStatus });
      loadOrder();
    } catch (err) {
      console.error(err);
      alert('Ошибка при обновлении статуса');
    } finally {
      setUpdating(false);
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

  if (loading) {
    return (
      <div className="admin-page">
        {letterGlitchComponent}
        <div className="admin-content">
          <div className="container">
            <div className="loading">Загрузка...</div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) return null;

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
          <div className="admin-order-detail">
            <button
              onClick={() => navigate('/admin/orders')}
              className="btn btn-ghost btn-back"
            >
              ← Назад к заказам
            </button>

            <div className="admin-order-detail-content">
              <div className="admin-order-detail-section card">
                <h2>Информация о товаре</h2>
                <div className="admin-order-detail-product">
                  {getImageUrl(order.product?.image_path) && (
                    <img
                      src={getImageUrl(order.product.image_path)}
                      alt={order.product?.name}
                      className="admin-order-detail-image"
                    />
                  )}
                  <div className="admin-order-detail-product-info">
                    <h3>{order.product?.name || 'Товар удален'}</h3>
                    <p className="admin-order-detail-price">
                      {order.product?.price || 0} ₴
                    </p>
                    {order.product?.description && (
                      <p className="admin-order-detail-description">
                        {order.product.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="admin-order-detail-section card">
                <h2>Информация о клиенте</h2>
                <div className="admin-order-detail-info">
                  <div className="detail-row">
                    <span className="detail-label">Имя/Ник:</span>
                    <span className="detail-value">{order.customer_name}</span>
                  </div>
                  {order.customer_phone && (
                    <div className="detail-row">
                      <span className="detail-label">Телефон:</span>
                      <span className="detail-value">{order.customer_phone}</span>
                    </div>
                  )}
                  {order.customer_telegram && (
                    <div className="detail-row">
                      <span className="detail-label">Telegram:</span>
                      <span className="detail-value">
                        <a
                          href={`https://t.me/${order.customer_telegram.replace('@', '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="telegram-link"
                        >
                          @{order.customer_telegram.replace('@', '')}
                        </a>
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="admin-order-detail-section card">
                <h2>Информация о резервации</h2>
                <div className="admin-order-detail-info">
                  <div className="detail-row">
                    <span className="detail-label">Время резервации:</span>
                    <span className="detail-value">
                      {new Date(order.reservation_time).toLocaleString('uk-UA', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Дата создания:</span>
                    <span className="detail-value">
                      {new Date(order.created_at).toLocaleString('uk-UA', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">Статус:</span>
                    <span className={`detail-value status-badge status-${order.status}`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="admin-order-detail-actions">
                {order.status === 'new' && (
                  <>
                    <button
                      onClick={() => handleStatusChange('completed')}
                      disabled={updating}
                      className="btn btn-primary"
                    >
                      {updating ? 'Обновление...' : 'Отметить выполненным'}
                    </button>
                    <button
                      onClick={() => handleStatusChange('cancelled')}
                      disabled={updating}
                      className="btn btn-secondary"
                    >
                      Отменить
                    </button>
                  </>
                )}
                {order.status === 'completed' && (
                  <button
                    onClick={() => handleStatusChange('cancelled')}
                    disabled={updating}
                    className="btn btn-secondary"
                  >
                    Отменить
                  </button>
                )}
                {order.status === 'cancelled' && (
                  <button
                    onClick={() => handleStatusChange('new')}
                    disabled={updating}
                    className="btn btn-primary"
                  >
                    {updating ? 'Обновление...' : 'Вернуть в новые'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetail;




