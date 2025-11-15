import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminGetProducts, adminDeleteProduct, adminLogout, adminUpdateProductQuantity, adminUpdateVolumeQuantity } from '../api';
import { getImageUrl } from '../utils/imageUtils';
import ASCIIText from '../components/ASCIIText';
import LetterGlitch from '../components/LetterGlitch';
import './AdminProducts.css';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingQuantities, setUpdatingQuantities] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    loadProducts();
  }, [navigate]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const response = await adminGetProducts();
      setProducts(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот товар?')) {
      return;
    }

    try {
      await adminDeleteProduct(id);
      loadProducts();
    } catch (err) {
      console.error(err);
      alert('Ошибка при удалении товара');
    }
  };


  const getCategoryGroup = (category) => {
    const liquidCategories = ['Chaser for pods', 'Chaser My Mint', 'Chaser Mix'];
    if (liquidCategories.includes(category)) {
      return 'Жижа';
    }
    if (category === 'Sticks for IQOS') {
      return 'Стики';
    }
    if (category === 'Cartridges') {
      return 'Картриджи';
    }
    return 'Другое';
  };

  const handleUpdateQuantity = async (productId, quantity) => {
    try {
      setUpdatingQuantities(prev => ({ ...prev, [productId]: true }));
      await adminUpdateProductQuantity(productId, quantity);
      await loadProducts();
    } catch (err) {
      console.error(err);
      alert('Ошибка при обновлении количества');
    } finally {
      setUpdatingQuantities(prev => ({ ...prev, [productId]: false }));
    }
  };

  const handleUpdateVolumeQuantity = async (productId, volume, quantity) => {
    try {
      const key = `${productId}_${volume}`;
      setUpdatingQuantities(prev => ({ ...prev, [key]: true }));
      await adminUpdateVolumeQuantity(productId, volume, quantity, null);
      await loadProducts();
    } catch (err) {
      console.error(err);
      alert('Ошибка при обновлении количества');
    } finally {
      setUpdatingQuantities(prev => ({ ...prev, [`${productId}_${volume}`]: false }));
    }
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
                className="btn btn-ghost active"
              >
                Товары
              </button>
              <button
                onClick={() => navigate('/admin/orders')}
                className="btn btn-ghost"
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
            <h2>Управление товарами</h2>
            <button
              onClick={() => navigate('/admin/products/new')}
              className="btn btn-primary"
            >
              Добавить товар
            </button>
          </div>

          {loading ? (
            <div className="loading">Загрузка...</div>
          ) : products.length === 0 ? (
            <div className="empty-state">
              <p>Нет товаров</p>
              <button
                onClick={() => navigate('/admin/products/new')}
                className="btn btn-primary"
              >
                Добавить первый товар
              </button>
            </div>
          ) : (
            <div className="admin-products-grid">
              {products.map((product) => (
                <div key={product.id} className="admin-product-card card">
                  {getImageUrl(product.image_path) && (
                    <img
                      src={getImageUrl(product.image_path)}
                      alt={product.name}
                      className="admin-product-image"
                    />
                  )}
                  <div className="admin-product-info">
                    <h3>{product.name}</h3>
                    <p className="admin-product-category">{getCategoryGroup(product.category)}</p>
                    <p className="admin-product-price">Цена: {product.price} ₴</p>
                    <p className={`admin-product-status ${product.is_active ? 'active' : 'inactive'}`}>
                      {product.is_active ? 'Активен' : 'Неактивен'}
                    </p>
                    {product.volumes && typeof product.volumes === 'object' && Object.keys(product.volumes).length > 0 ? (
                      <div className="admin-product-quantities">
                        {Object.entries(product.volumes).map(([volumeKey, volumeData]) => {
                          const volumeStock = (product.volume_stocks || product.volumeStocks || [])?.find(vs => vs.volume === volumeKey);
                          const quantity = volumeStock?.quantity ?? 0;
                          const key = `${product.id}_${volumeKey}`;
                          return (
                            <div key={volumeKey} className="admin-quantity-item">
                              <span className="quantity-label">{volumeKey}:</span>
                              <input
                                type="number"
                                min="0"
                                value={quantity}
                                onChange={(e) => {
                                  const newQuantity = parseInt(e.target.value) || 0;
                                  handleUpdateVolumeQuantity(product.id, volumeKey, newQuantity);
                                }}
                                disabled={updatingQuantities[key]}
                                className="quantity-input-small"
                                onClick={(e) => e.stopPropagation()}
                              />
                              <span className="quantity-unit-small">шт.</span>
                              <span className="volume-price">Цена: {volumeData.price} ₴</span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="admin-product-quantity">
                        <span className="quantity-label">Количество:</span>
                        <input
                          type="number"
                          min="0"
                          value={product.quantity ?? 0}
                          onChange={(e) => {
                            const newQuantity = parseInt(e.target.value) || 0;
                            handleUpdateQuantity(product.id, newQuantity);
                          }}
                          disabled={updatingQuantities[product.id]}
                          className="quantity-input-small"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <span className="quantity-unit-small">шт.</span>
                      </div>
                    )}
                  </div>
                  <div className="admin-product-actions">
                    <button
                      onClick={() => navigate(`/admin/products/${product.id}/edit`)}
                      className="btn btn-secondary"
                    >
                      Редактировать
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="btn btn-ghost"
                      style={{ color: 'var(--status-error)' }}
                    >
                      Удалить
                    </button>
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

export default AdminProducts;

