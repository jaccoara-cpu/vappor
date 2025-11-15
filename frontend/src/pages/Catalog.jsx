import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import { getProducts } from '../api';
import { getImageUrl } from '../utils/imageUtils';
import MagicBento, { ParticleCard } from '../components/MagicBento';
import './Catalog.css';

const Catalog = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Loading products from API...');
      const response = await getProducts();
      
      console.log('Full API response:', response);
      console.log('Response data:', response?.data);
      console.log('Response data type:', typeof response?.data);
      console.log('Is array:', Array.isArray(response?.data));
      
      // API возвращает массив напрямую из Laravel
      let productsData = response?.data;
      
      // Обработка разных форматов ответа
      if (!productsData) {
        console.warn('No products data in response. Full response:', response);
        productsData = [];
      } else if (Array.isArray(productsData)) {
        console.log('Products data is array, length:', productsData.length);
        // Это массив - используем как есть
      } else if (typeof productsData === 'object') {
        console.log('Products data is object, keys:', Object.keys(productsData));
        // Это объект - пытаемся извлечь массив
        if (Array.isArray(productsData.data)) {
          console.log('Found products in data property, length:', productsData.data.length);
          productsData = productsData.data;
        } else if (Array.isArray(productsData.items)) {
          console.log('Found products in items property, length:', productsData.items.length);
          productsData = productsData.items;
        } else {
          console.warn('Products data is not an array:', productsData);
          productsData = [];
        }
      } else {
        console.warn('Unexpected products data format:', productsData);
        productsData = [];
      }
      
      console.log('Loaded products:', productsData?.length || 0, 'items');
      
      // Сортируем продукты: стіки і картриджі в конец
      const sortedProducts = Array.isArray(productsData) ? [...productsData].sort((a, b) => {
        const aIsLast = a.category === 'Sticks for IQOS' || a.category === 'Cartridges';
        const bIsLast = b.category === 'Sticks for IQOS' || b.category === 'Cartridges';
        
        if (aIsLast && !bIsLast) return 1;
        if (!aIsLast && bIsLast) return -1;
        return 0;
      }) : [];
      
      setProducts(sortedProducts);
    } catch (err) {
      console.error('Error loading products:', err);
      console.error('Error details:', {
        message: err.message,
        code: err.code,
        response: err.response,
        request: err.request,
        config: err.config
      });
      if (err.response) {
        // Server responded with error status
        console.error('Response status:', err.response.status);
        console.error('Response data:', err.response.data);
        setError(`Помилка завантаження товарів: ${err.response.status}`);
      } else if (err.request) {
        // Request was made but no response received
        console.error('No response received:', err.request);
        console.error('API URL was:', err.config?.url || 'unknown');
        setError('Не вдалося підключитися до сервера. Перевірте, чи запущений бекенд.');
      } else {
        // Something else happened
        console.error('Error:', err.message);
        setError('Не удалось загрузить товары');
      }
    } finally {
      setLoading(false);
    }
  };


  if (loading) {
    return (
      <>
        <Header />
        <div className="catalog-page">
          <div className="container">
            <div className="products-grid">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="product-card skeleton" style={{ height: '400px' }} />
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="catalog-page">
          <div className="container">
            <div className="error-message">
              <p>{error}</p>
              <button onClick={loadProducts} className="btn btn-primary">
                Попробовать снова
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
      <>
        <Header />
        <div className="catalog-page">
          <div className="container">
            {products.length === 0 ? (
            <div className="empty-state">
              <p>Товары скоро появятся</p>
            </div>
          ) : (
            <MagicBento
              textAutoHide={true}
              enableStars={true}
              enableSpotlight={true}
              enableBorderGlow={true}
              enableTilt={false}
              enableMagnetism={true}
              clickEffect={true}
              spotlightRadius={400}
              particleCount={12}
              glowColor="132, 0, 255"
            >
              {products.map((product) => (
                <ParticleCard
                  key={product.id}
                  className="product-card card fade-in magic-product-card magic-product-card--border-glow"
                  particleCount={12}
                  glowColor="132, 0, 255"
                  enableTilt={false}
                  clickEffect={true}
                  enableMagnetism={true}
                  style={{
                    '--glow-color': '132, 0, 255',
                    cursor: 'pointer'
                  }}
                >
                  <div
                    onClick={() => navigate(`/product/${product.id}`)}
                    style={{ 
                      width: '100%', 
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      position: 'relative',
                      zIndex: 2
                    }}
                  >
                    {getImageUrl(product.image_path) && (
                      <div className="product-image">
                        <img
                          src={getImageUrl(product.image_path)}
                          alt={product.name}
                          loading="lazy"
                        />
                      </div>
                    )}
                    <div className="product-info">
                      <h3 className="product-name">{product.name}</h3>
                      <p className="product-price">{product.price} ₴</p>
                    </div>
                  </div>
                </ParticleCard>
              ))}
            </MagicBento>
          )}
        </div>
      </div>
    </>
  );
};

export default Catalog;

