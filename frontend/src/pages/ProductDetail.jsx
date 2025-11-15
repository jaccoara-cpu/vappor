import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Header from '../components/Header';
import Galaxy from '../components/Galaxy';
import { getProduct, getAvailableSlots } from '../api';
import { extractColorFromImage, getFlavorColor } from '../utils/colorExtractor';
import { getImageUrl } from '../utils/imageUtils';
import { useCart } from '../hooks/useCart';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  // Определяем начальную дату - завжди сьогоднішня дата
  const getInitialDate = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today.toISOString().split('T')[0];
  };

  const [selectedDate, setSelectedDate] = useState(getInitialDate());
  const [loading, setLoading] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedFlavor, setSelectedFlavor] = useState(null);
  const [selectedVolume, setSelectedVolume] = useState('30ml'); // За замовчуванням 30 мл
  const [hueShift, setHueShift] = useState(140);
  const [error, setError] = useState(null);
  const { addToCart } = useCart();
  const [addedToCart, setAddedToCart] = useState(false);
  const colorExtractionRef = useRef(null);

  // Оновлюємо selectedDate при завантаженні - завжди встановлюємо сьогоднішню дату
  useEffect(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayString = today.toISOString().split('T')[0];
    setSelectedDate(todayString);
  }, []); // Викликається тільки при монтуванні компонента



  const loadProduct = useCallback(async () => {
    if (!id) {
      console.error('Product ID is missing');
      setError('ID товару не вказано');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      console.log('Loading product with ID:', id);
      const response = await getProduct(id);
      const productData = response.data;
      console.log('Product loaded:', productData);
      
      if (!productData) {
        throw new Error('Product data is empty');
      }
      
      setProduct(productData);
      
      // Встановлюємо перший смак за замовчуванням, якщо є смаки
      // Якщо є об'єми, використовуємо смаки для обраного об'єму
      if (productData.volumes && productData.volumes[selectedVolume]) {
        const volumeFlavors = productData.volumes[selectedVolume].flavors;
        if (volumeFlavors && volumeFlavors.length > 0) {
          const firstFlavor = volumeFlavors[0];
          setSelectedFlavor(firstFlavor);
          // Set initial hueShift based on flavor name
          try {
            const initialHue = getFlavorColor(firstFlavor.name);
            setHueShift(initialHue);
            console.log('Initial hueShift set to:', initialHue, 'for flavor:', firstFlavor.name);
          } catch (error) {
            console.error('Error setting initial hueShift:', error);
            setHueShift(140); // Default purple
          }
        }
      } else if (productData.flavors && productData.flavors.length > 0) {
        const firstFlavor = productData.flavors[0];
        setSelectedFlavor(firstFlavor);
        // Set initial hueShift based on flavor name
        try {
          const initialHue = getFlavorColor(firstFlavor.name);
          setHueShift(initialHue);
          console.log('Initial hueShift set to:', initialHue, 'for flavor:', firstFlavor.name);
        } catch (error) {
          console.error('Error setting initial hueShift:', error);
          setHueShift(140); // Default purple
        }
      } else if (productData.image_path) {
        // If no flavors, set hueShift based on product name
        try {
          const initialHue = getFlavorColor(productData.name);
          setHueShift(initialHue);
          console.log('Initial hueShift set to:', initialHue, 'for product:', productData.name);
        } catch (error) {
          console.error('Error setting initial hueShift:', error);
          setHueShift(140); // Default purple
        }
      } else {
        setHueShift(140); // Default purple
      }
    } catch (err) {
      console.error('Error loading product:', err);
      setError(err.response?.data?.message || err.message || 'Помилка завантаження товару');
      if (err.response?.status === 404) {
        setTimeout(() => {
          navigate('/catalog');
        }, 2000);
      }
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  const loadSlots = useCallback(async () => {
    try {
      setLoadingSlots(true);
      
      // Проверяем, является ли выбранная дата сегодняшней
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayString = today.toISOString().split('T')[0];
      const isToday = selectedDate === todayString;
      
      let slotsData = [];
      
      // Для сегодняшней даты всегда генерируем слоты на фронтенде
      if (isToday) {
        const startHour = 10;
        const endHour = 24;
        const now = new Date();
        const currentHour = now.getHours();
        
        // Если сейчас до 10:00, показываем все слоты
        // Если после 24:00, не показываем слоты (они уже прошли)
        // Иначе показываем слоты начиная с текущего часа
        const minHour = currentHour < startHour ? startHour : (currentHour >= endHour ? endHour : currentHour);
        
        for (let hour = minHour; hour < endHour; hour++) {
          const startTime = `${selectedDate} ${String(hour).padStart(2, '0')}:00:00`;
          const endTime = `${selectedDate} ${String(hour + 1).padStart(2, '0')}:00:00`;
          const formatted = `${String(hour).padStart(2, '0')}:00 - ${String(hour + 1).padStart(2, '0')}:00`;
          
          slotsData.push({
            start_time: startTime,
            end_time: endTime,
            formatted: formatted,
          });
        }
      } else {
        // Для других дат загружаем слоты с сервера
        const response = await getAvailableSlots(id, selectedDate);
        slotsData = response.data || [];
      }
      
      setSlots(slotsData);
      setSelectedSlot(null);
    } catch (err) {
      console.error(err);
      // В случае ошибки для сегодняшней даты все равно генерируем слоты
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayString = today.toISOString().split('T')[0];
      const isToday = selectedDate === todayString;
      
      if (isToday) {
        const startHour = 10;
        const endHour = 20;
        const now = new Date();
        const currentHour = now.getHours();
        const slotsData = [];
        
        // Если сейчас до 10:00, показываем все слоты
        // Если после 20:00, не показываем слоты (они уже прошли)
        // Иначе показываем слоты начиная с текущего часа
        const minHour = currentHour < startHour ? startHour : (currentHour >= endHour ? endHour : currentHour);
        
        for (let hour = minHour; hour < endHour; hour++) {
          const startTime = `${selectedDate} ${String(hour).padStart(2, '0')}:00:00`;
          const endTime = `${selectedDate} ${String(hour + 1).padStart(2, '0')}:00:00`;
          const formatted = `${String(hour).padStart(2, '0')}:00 - ${String(hour + 1).padStart(2, '0')}:00`;
          
          slotsData.push({
            start_time: startTime,
            end_time: endTime,
            formatted: formatted,
          });
        }
        setSlots(slotsData);
      } else {
        setSlots([]);
      }
    } finally {
      setLoadingSlots(false);
    }
  }, [id, selectedDate]);

  useEffect(() => {
    if (!id) {
      setError('ID товару не вказано');
      setLoading(false);
      return;
    }
    loadProduct();
  }, [loadProduct, id]);

  useEffect(() => {
    if (product) {
      loadSlots();
    }
  }, [product, loadSlots]);

  useEffect(() => {
    // Cancel previous color extraction if it's still running
    if (colorExtractionRef.current) {
      colorExtractionRef.current = null;
    }

    // Update hueShift when selected flavor changes
    // First, immediately set fallback color to prevent white flash
    try {
      if (selectedFlavor?.name) {
        const flavorName = selectedFlavor.name;
        try {
          const fallbackHue = getFlavorColor(flavorName);
          setHueShift(fallbackHue); // Set immediately to prevent white flash
        } catch (e) {
          setHueShift(140); // Default purple if getFlavorColor fails
        }
        
        // Если есть изображение, извлекаем цвет из него
        if (selectedFlavor.image_path) {
          const imageUrl = getImageUrl(selectedFlavor.image_path);
          if (imageUrl) {
            const currentRequest = {};
            colorExtractionRef.current = currentRequest;
            
            extractColorFromImage(imageUrl, flavorName).then((hue) => {
              // Only update if this is still the current request
              if (colorExtractionRef.current === currentRequest) {
                console.log('Setting hueShift to:', hue, 'for flavor:', flavorName);
                setHueShift(hue);
              }
            }).catch((error) => {
              console.error('Error extracting color:', error);
              // Fallback already set above
            });
          }
        }
      } else if (product?.image_path) {
        setHueShift(140); // Default purple - set immediately
        
        const imageUrl = getImageUrl(product.image_path);
        if (imageUrl) {
          const currentRequest = {};
          colorExtractionRef.current = currentRequest;
          
          extractColorFromImage(imageUrl, product.name).then((hue) => {
            // Only update if this is still the current request
            if (colorExtractionRef.current === currentRequest) {
              console.log('Setting hueShift to:', hue, 'for product:', product.name);
              setHueShift(hue);
            }
          }).catch((error) => {
            console.error('Error extracting color:', error);
            // Default already set above
          });
        }
      }
    } catch (error) {
      console.error('Error in hueShift effect:', error);
      setHueShift(140); // Default purple on any error
    }
  }, [selectedFlavor?.name, product, getImageUrl]);

  // Оновлюємо смаки при зміні об'єму
  useEffect(() => {
    if (product && product.volumes && product.volumes[selectedVolume]) {
      const volumeFlavors = product.volumes[selectedVolume].flavors;
      if (volumeFlavors && volumeFlavors.length > 0) {
        // Встановлюємо перший смак для нового об'єму
        setSelectedFlavor(volumeFlavors[0]);
      } else {
        setSelectedFlavor(null);
      }
    } else if (product && product.flavors && product.flavors.length > 0) {
      // Якщо немає об'ємів, використовуємо стандартні смаки
      setSelectedFlavor(product.flavors[0]);
    } else {
      setSelectedFlavor(null);
    }
  }, [selectedVolume, product]);

  const handleReserve = () => {
    // Проверяем, является ли выбранная дата сегодняшней
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayString = today.toISOString().split('T')[0];
    const isToday = selectedDate === todayString;
    
    // Для сегодняшней даты разрешаем самовывоз без выбранного слота
    if (selectedSlot || isToday) {
      navigate('/reservation', {
        state: {
          product,
          slot: selectedSlot || null, // null для самовывоза
          date: selectedDate,
          isPickup: isToday && !selectedSlot, // Флаг самовывоза
        },
      });
    }
  };

  const handleAddToCart = () => {
    // Проверяем, является ли выбранная дата сегодняшней
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayString = today.toISOString().split('T')[0];
    const isToday = selectedDate === todayString;
    
    // Для сегодняшней даты разрешаем самовывоз без выбранного слота
    if (selectedSlot || isToday) {
      addToCart({
        product,
        selectedVolume,
        selectedFlavor,
        price: currentPrice,
        date: selectedDate,
        slot: selectedSlot || null,
        isPickup: isToday && !selectedSlot,
      });
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    }
  };

  if (loading) {
    return (
      <>
        <Header showBack onBack={() => navigate('/catalog')} />
        <div className="product-detail-page">
          <div className="container">
            <div className="skeleton" style={{ height: '500px', marginBottom: 'var(--spacing-lg)' }} />
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header showBack onBack={() => navigate('/catalog')} />
        <div className="product-detail-page">
          <div className="container">
            <div className="error-message" style={{ textAlign: 'center', padding: 'var(--spacing-2xl)' }}>
              <p>{error}</p>
              <button onClick={() => navigate('/catalog')} className="btn btn-primary" style={{ marginTop: 'var(--spacing-md)' }}>
                Повернутися до каталогу
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!product) {
    return (
      <>
        <Header showBack onBack={() => navigate('/catalog')} />
        <div className="product-detail-page">
          <div className="container">
            <div className="error-message" style={{ textAlign: 'center', padding: 'var(--spacing-2xl)' }}>
              <p>Товар не знайдено</p>
              <button onClick={() => navigate('/catalog')} className="btn btn-primary" style={{ marginTop: 'var(--spacing-md)' }}>
                Повернутися до каталогу
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Определяем какое изображение показывать
  const displayImage = product ? (
    selectedFlavor?.image_path 
      ? getImageUrl(selectedFlavor.image_path)
      : getImageUrl(product.image_path)
  ) : null;

  // Получаем список смаков залежно від обраного об'єму
  const flavors = product.volumes && product.volumes[selectedVolume]
    ? (product.volumes[selectedVolume].flavors || [])
    : (product.flavors && product.flavors.length > 0 
        ? product.flavors 
        : []);

  // Получаем ціну залежно від обраного об'єму
  const currentPrice = product.volumes && product.volumes[selectedVolume]
    ? product.volumes[selectedVolume].price
    : product.price;

  // Перевіряємо, чи є об'єми для вибору
  const hasVolumes = product.volumes && Object.keys(product.volumes).length > 0;

  return (
    <>
      <Header showBack onBack={() => navigate('/catalog')} />
      <div className="product-detail-page">
        <div className="product-detail-galaxy">
          <Galaxy 
            mouseRepulsion={false}
            mouseInteraction={false}
            density={1}
            glowIntensity={0.5}
            saturation={0.6}
            hueShift={hueShift}
            twinkleIntensity={0.3}
            rotationSpeed={0.1}
            repulsionStrength={2}
            autoCenterRepulsion={0}
            starSpeed={0.5}
            speed={1}
            transparent={true}
          />
        </div>
        <div className="container product-detail-content-wrapper">
          <div className="product-breadcrumbs">
            <button 
              onClick={() => navigate('/catalog')} 
              className="breadcrumb-link"
            >
              Каталог
            </button>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">{product.name}</span>
          </div>
          <div className="product-detail-content">
            <div className="product-detail-image-section">
              <div className="product-header-title">
                <h1 className="product-header-name">{product.name}</h1>
                {product.category && (
                  <span className="product-header-category">{product.category}</span>
                )}
              </div>
              <div className="product-detail-image">
                {displayImage ? (
                  <img 
                    src={displayImage} 
                    alt={product.name}
                  />
                ) : (
                  <div className="no-image">Нет фото</div>
                )}
              </div>
              {hasVolumes && (
                <div className="volume-selection">
                  <h3 className="volume-selection-title">Оберіть об'єм:</h3>
                  <div className="volume-buttons">
                    {Object.keys(product.volumes).map((volume) => (
                      <button
                        key={volume}
                        className={`volume-button ${selectedVolume === volume ? 'active' : ''}`}
                        onClick={() => setSelectedVolume(volume)}
                      >
                        {volume}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {flavors.length > 0 && (
                <div className="flavors-thumbnails">
                  {flavors.map((flavor, index) => {
                    const flavorImage = flavor.image_path ? getImageUrl(flavor.image_path) : null;
                    const isSelected = selectedFlavor?.name === flavor.name;
                    return (
                      <button
                        key={index}
                        className={`flavor-thumbnail ${isSelected ? 'active' : ''}`}
                        onClick={() => setSelectedFlavor(flavor)}
                        title={flavor.name}
                      >
                        {flavorImage ? (
                          <img src={flavorImage} alt={flavor.name} />
                        ) : (
                          <div className="flavor-thumbnail-placeholder">{flavor.name.charAt(0)}</div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            <div className="product-detail-info">
              {product.description && (
                <p className="product-detail-description">{product.description}</p>
              )}
              <p className="product-detail-price">{currentPrice} ₴</p>

              <div className="time-selection">
                <h3>Выберите дату и время</h3>
                <div className="date-buttons">
                  {(() => {
                    const dates = [];
                    
                    // Визначаємо сьогоднішню дату (початок дня)
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const todayString = today.toISOString().split('T')[0];
                    
                    const dayNames = ['Неділя', 'Понеділок', 'Вівторок', 'Середа', 'Четвер', 'П\'ятниця', 'Субота'];
                    
                    // Завжди починаємо з сьогоднішнього дня
                    for (let i = 0; i < 7; i++) {
                      const dayOffset = i;
                      const date = new Date(today);
                      date.setDate(today.getDate() + dayOffset);
                      const dateString = date.toISOString().split('T')[0];
                      const dayOfWeek = date.getDay();
                      
                      // Перша кнопка - "сьогодні", решта - назви днів тижня
                      let label;
                      if (dayOffset === 0) {
                        label = 'сьогодні';
                      } else {
                        label = dayNames[dayOfWeek];
                      }
                      
                      dates.push({ date: dateString, label, dayName: dayNames[dayOfWeek] });
                    }
                    
                    return dates.map((dateItem) => (
                      <button
                        key={dateItem.date}
                        className={`date-button ${selectedDate === dateItem.date ? 'active' : ''}`}
                        onClick={() => setSelectedDate(dateItem.date)}
                      >
                        <span className="date-label">{dateItem.label}</span>
                      </button>
                    ));
                  })()}
                </div>
                
                {loadingSlots ? (
                  <div className="slots-loading">Загрузка...</div>
                ) : slots.length === 0 ? (
                  <div className="slots-empty">Нет доступных слотов на эту дату</div>
                ) : (
                  <div className="slots-grid">
                    {slots.map((slot, index) => (
                      <button
                        key={index}
                        className={`slot-button ${selectedSlot?.start_time === slot.start_time ? 'active' : ''}`}
                        onClick={() => setSelectedSlot(slot)}
                      >
                        {slot.formatted}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="product-actions">
                <button
                  onClick={handleAddToCart}
                  disabled={(() => {
                    // Проверяем, является ли выбранная дата сегодняшней
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const todayString = today.toISOString().split('T')[0];
                    const isToday = selectedDate === todayString;
                    
                    // Для сегодняшней даты разрешаем самовывоз без выбранного слота
                    return !selectedSlot && !isToday;
                  })()}
                  className={`btn btn-secondary ${addedToCart ? 'added' : ''}`}
                >
                  {addedToCart ? '✓ Добавлено в корзину' : 'Добавить в корзину'}
                </button>
                <button
                  onClick={handleReserve}
                  disabled={(() => {
                    // Проверяем, является ли выбранная дата сегодняшней
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const todayString = today.toISOString().split('T')[0];
                    const isToday = selectedDate === todayString;
                    
                    // Для сегодняшней даты разрешаем самовывоз без выбранного слота
                    return !selectedSlot && !isToday;
                  })()}
                  className="btn btn-primary btn-reserve"
                >
                  Зарезервировать
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductDetail;

