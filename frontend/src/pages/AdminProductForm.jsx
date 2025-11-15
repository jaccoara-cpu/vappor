import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { adminGetProducts, adminCreateProduct, adminUpdateProduct, adminRemoveFlavor, adminAddFlavor, adminAddFlavorToProduct, adminRemoveFlavorFromProduct, adminToggleFlavorStatus, adminToggleFlavorStatusFromProduct, adminLogout, adminUpdateVolumeQuantity } from '../api';
import { getImageUrl } from '../utils/imageUtils';
import ASCIIText from '../components/ASCIIText';
import LetterGlitch from '../components/LetterGlitch';
import './AdminProductForm.css';

const AdminProductForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: '',
    price: '',
    is_active: true,
    quantity: 0,
    purchase_price: '',
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [product, setProduct] = useState(null);
  const [addingFlavor, setAddingFlavor] = useState({});
  const [newFlavorData, setNewFlavorData] = useState({});
  const [selectedVolumes, setSelectedVolumes] = useState({
    '10ml': false,
    '15ml': false,
    '30ml': false,
  });
  const [volumePrices, setVolumePrices] = useState({
    '10ml': '',
    '15ml': '',
    '30ml': '',
  });

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/admin/login');
      return;
    }

    if (isEdit) {
      loadProduct();
    }
  }, [id, isEdit, navigate]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const response = await adminGetProducts();
      const productData = response.data.find((p) => p.id === parseInt(id));
      if (productData) {
        setProduct(productData);
        setFormData({
          name: productData.name,
          category: productData.category || '',
          description: productData.description || '',
          price: productData.price,
          is_active: productData.is_active,
          quantity: productData.quantity ?? 0,
          purchase_price: productData.purchase_price || '',
        });
        if (productData.image_path) {
          const encodedPath = productData.image_path.split('/').map(segment => encodeURIComponent(segment)).join('/');
          setImagePreview(getImageUrl(encodedPath));
        }
        
        // Загружаем объемы, если они есть
        if (productData.volumes && typeof productData.volumes === 'object') {
          const volumes = {};
          const prices = {};
          Object.keys(productData.volumes).forEach(volume => {
            volumes[volume] = true;
            prices[volume] = productData.volumes[volume].price?.toString() || '';
          });
          setSelectedVolumes(prev => ({ ...prev, ...volumes }));
          setVolumePrices(prev => ({ ...prev, ...prices }));
        }
      } else {
        setError('Товар не найден');
      }
    } catch (err) {
      console.error(err);
      setError('Ошибка при загрузке товара');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFlavor = async (volume, flavorName) => {
    if (!window.confirm(`Вы уверены, что хотите удалить вкус "${flavorName}" из объема "${volume}"?`)) {
      return;
    }

    try {
      setLoading(true);
      const response = await adminRemoveFlavor(id, volume, flavorName);
      setProduct(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка при удалении вкуса');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFlavorStatus = async (volume, flavorName, currentStatus) => {
    try {
      setLoading(true);
      const response = await adminToggleFlavorStatus(id, volume, flavorName, !currentStatus);
      setProduct(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка при изменении статуса вкуса');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFlavorStatusFromProduct = async (flavorName, currentStatus) => {
    try {
      setLoading(true);
      const response = await adminToggleFlavorStatusFromProduct(id, flavorName, !currentStatus);
      setProduct(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка при изменении статуса вкуса');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };


  const handleAddFlavor = async (volume) => {
    const flavorName = newFlavorData[volume]?.name?.trim();
    if (!flavorName) {
      setError('Введите название вкуса');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await adminAddFlavor(
        id, 
        volume, 
        flavorName, 
        newFlavorData[volume]?.image || null
      );
      setProduct(response.data);
      // Очищаем форму
      setNewFlavorData(prev => ({
        ...prev,
        [volume]: { name: '', image: null }
      }));
      setAddingFlavor(prev => ({
        ...prev,
        [volume]: false
      }));
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка при добавлении вкуса');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddFlavorToProduct = async () => {
    const flavorName = newFlavorData['product']?.name?.trim();
    if (!flavorName) {
      setError('Введите название вкуса');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await adminAddFlavorToProduct(
        id, 
        flavorName, 
        newFlavorData['product']?.image || null
      );
      setProduct(response.data);
      // Очищаем форму
      setNewFlavorData(prev => ({
        ...prev,
        'product': { name: '', image: null }
      }));
      setAddingFlavor(prev => ({
        ...prev,
        'product': false
      }));
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка при добавлении вкуса');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFlavorFromProduct = async (flavorName) => {
    if (!window.confirm(`Вы уверены, что хотите удалить вкус "${flavorName}"?`)) {
      return;
    }

    try {
      setLoading(true);
      const response = await adminRemoveFlavorFromProduct(id, flavorName);
      setProduct(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Ошибка при удалении вкуса');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleNewFlavorChange = (volume, field, value) => {
    setNewFlavorData(prev => ({
      ...prev,
      [volume]: {
        ...prev[volume],
        [field]: value
      }
    }));
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.type === 'checkbox' ? e.target.checked : e.target.value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Проверка типа файла
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        setError('Неверный формат изображения. Разрешены только: JPG, PNG, GIF, WEBP');
        e.target.value = ''; // Сброс выбора файла
        return;
      }

      // Проверка размера файла (20 МБ)
      const maxSize = 20 * 1024 * 1024; // 20 МБ в байтах
      if (file.size > maxSize) {
        setError('Изображение слишком большое. Максимальный размер: 20 МБ');
        e.target.value = ''; // Сброс выбора файла
        return;
      }

      setImage(file);
      setError(null); // Очищаем ошибки, если файл валиден
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.onerror = () => {
        setError('Ошибка при чтении файла изображения');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Проверяем, что если выбраны объемы, то для каждого указана цена
    const selectedVolumesList = Object.keys(selectedVolumes).filter(v => selectedVolumes[v]);
    if (selectedVolumesList.length > 0) {
      for (const volume of selectedVolumesList) {
        if (!volumePrices[volume] || parseFloat(volumePrices[volume]) <= 0) {
          setError(`Укажите цену для объема ${volume}`);
          return;
        }
      }
    }

    try {
      setLoading(true);
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      if (formData.category) {
        formDataToSend.append('category', formData.category);
      }
      formDataToSend.append('description', formData.description);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('is_active', formData.is_active ? '1' : '0');
      formDataToSend.append('quantity', formData.quantity || 0);
      if (formData.purchase_price) {
        formDataToSend.append('purchase_price', formData.purchase_price);
      }
      
      if (image) {
        formDataToSend.append('image', image);
      }

      // Добавляем объемы, если они выбраны
      if (selectedVolumesList.length > 0) {
        const volumes = {};
        selectedVolumesList.forEach(volume => {
          volumes[volume] = {
            price: parseFloat(volumePrices[volume]),
            flavors: []
          };
        });
        formDataToSend.append('volumes', JSON.stringify(volumes));
      }

      if (isEdit) {
        await adminUpdateProduct(id, formDataToSend);
      } else {
        await adminCreateProduct(formDataToSend);
      }

      navigate('/admin/products');
    } catch (err) {
      console.error('Error saving product:', err);
      
      // Обработка ошибок валидации Laravel
      if (err.response?.data?.errors) {
        const errors = err.response.data.errors;
        // Собираем все ошибки валидации в одну строку
        const errorMessages = [];
        Object.keys(errors).forEach(key => {
          if (Array.isArray(errors[key])) {
            errorMessages.push(...errors[key]);
          } else {
            errorMessages.push(errors[key]);
          }
        });
        setError(errorMessages.join('. ') || 'Ошибка валидации данных');
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError(err.message || 'Ошибка при сохранении товара');
      }
    } finally {
      setLoading(false);
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
          {loading && isEdit ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>Загрузка...</div>
          ) : error && isEdit ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--status-error)' }}>{error}</div>
          ) : (
          <div className="admin-form-container">
            <h2>{isEdit ? 'Редактировать товар' : 'Добавить товар'}</h2>

            <form onSubmit={handleSubmit} className="admin-form card">
              <div className="form-group">
                <label htmlFor="image">Фото товара</label>
                <input
                  type="file"
                  id="image"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="input-file"
                />
                {imagePreview && (
                  <div className="image-preview">
                    <img src={imagePreview} alt="Preview" />
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="name">Название *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="input"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="category">Категория</label>
                <input
                  type="text"
                  id="category"
                  name="category"
                  className="input"
                  value={formData.category}
                  onChange={handleChange}
                  placeholder="Например: Chaser for pods, Sticks for IQOS, Cartridges"
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Описание</label>
                <textarea
                  id="description"
                  name="description"
                  className="input textarea"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                />
              </div>

              <div className="form-group">
                <label htmlFor="price">Цена *</label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  className="input"
                  value={formData.price}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  required
                />
                <small style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', display: 'block' }}>
                  {Object.values(selectedVolumes).some(v => v) 
                    ? 'Цена будет использоваться как базовая. Укажите цены для каждого объема ниже.' 
                    : 'Базовая цена товара (если не используются объемы)'}
                </small>
              </div>

              {!isEdit && (
              <div className="form-group">
                <label>Объемы товара</label>
                <div className="volumes-selection">
                  {['10ml', '15ml', '30ml'].map((volume) => (
                    <div key={volume} className="volume-selection-item">
                      <label className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={selectedVolumes[volume]}
                          onChange={(e) => {
                            setSelectedVolumes(prev => ({
                              ...prev,
                              [volume]: e.target.checked
                            }));
                            if (!e.target.checked) {
                              setVolumePrices(prev => ({
                                ...prev,
                                [volume]: ''
                              }));
                            }
                          }}
                        />
                        <span>{volume}</span>
                      </label>
                      {selectedVolumes[volume] && (
                        <div className="volume-price-input">
                          <label htmlFor={`price-${volume}`} className="volume-price-label">
                            Цена для {volume}:
                          </label>
                          <input
                            type="number"
                            id={`price-${volume}`}
                            className="input input-small"
                            value={volumePrices[volume]}
                            onChange={(e) => {
                              setVolumePrices(prev => ({
                                ...prev,
                                [volume]: e.target.value
                              }));
                            }}
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            required
                          />
                          <span className="currency">₴</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <small style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', display: 'block' }}>
                  Выберите объемы, которые будут доступны для этого товара. После создания товара вы сможете добавить вкусы для каждого объема.
                </small>
              </div>
              )}

              <div className="form-group">
                <label htmlFor="quantity">Количество на складе</label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  className="input"
                  value={formData.quantity}
                  onChange={handleChange}
                  min="0"
                />
              </div>

              <div className="form-group">
                <label htmlFor="purchase_price">Закупочная цена</label>
                <input
                  type="number"
                  id="purchase_price"
                  name="purchase_price"
                  className="input"
                  value={formData.purchase_price}
                  onChange={handleChange}
                  step="0.01"
                  min="0"
                  placeholder="Автоматически устанавливается по категории"
                />
              </div>

              <div className="form-group checkbox-group">
                <label htmlFor="is_active" className="checkbox-label">
                  <input
                    type="checkbox"
                    id="is_active"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleChange}
                  />
                  <span>Товар активен</span>
                </label>
              </div>

              {isEdit && product && (
                <>
                  {/* Товары с объемами */}
                  {product.volumes && Object.keys(product.volumes).length > 0 && (
                    <div className="form-group">
                      <label>Объемы и вкусы</label>
                      <div className="volumes-list">
                        {Object.entries(product.volumes).map(([volume, volumeData]) => {
                          const volumeStock = (product.volume_stocks || product.volumeStocks || [])?.find(vs => vs.volume === volume);
                          const volumeQuantity = volumeStock?.quantity ?? 0;
                          const volumePurchasePrice = volumeStock?.purchase_price ?? null;
                          
                          return (
                          <div key={volume} className="volume-item">
                            <div className="volume-header">
                              <h4>{volume} - {volumeData.price} ₴</h4>
                              <div className="volume-quantity-control">
                                <label className="quantity-label-small">Кол-во:</label>
                                <input
                                  type="number"
                                  min="0"
                                  value={volumeQuantity}
                                  onChange={async (e) => {
                                    const newQuantity = parseInt(e.target.value) || 0;
                                    try {
                                      await adminUpdateVolumeQuantity(product.id, volume, newQuantity, volumePurchasePrice);
                                      await loadProduct();
                                    } catch (err) {
                                      console.error(err);
                                      alert('Ошибка при обновлении количества');
                                    }
                                  }}
                                  className="quantity-input-small"
                                />
                                <span className="quantity-unit-small">шт.</span>
                                {volumePurchasePrice && (
                                  <span className="purchase-price-label">Закупка: {volumePurchasePrice} ₴</span>
                                )}
                              </div>
                            </div>
                            {volumeData.flavors && volumeData.flavors.length > 0 ? (
                              <div className="flavors-list">
                                {volumeData.flavors.map((flavor, index) => {
                                  const isActive = flavor.is_active !== false; // По умолчанию true
                                  return (
                                    <div key={index} className={`flavor-item ${!isActive ? 'flavor-inactive' : ''}`}>
                                    {flavor.image_path && (
                                      <img 
                                        src={getImageUrl(flavor.image_path)} 
                                        alt={flavor.name}
                                        className="flavor-image-small"
                                      />
                                    )}
                                    <span className="flavor-name">{flavor.name}</span>
                                      <button
                                        type="button"
                                        onClick={() => handleToggleFlavorStatus(volume, flavor.name, isActive)}
                                        className={`btn btn-ghost ${isActive ? 'btn-deactivate-flavor' : 'btn-activate-flavor'}`}
                                        disabled={loading}
                                        title={isActive ? 'Деактивировать вкус' : 'Активировать вкус'}
                                      >
                                        {isActive ? '✕' : '✓'}
                                      </button>
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveFlavor(volume, flavor.name)}
                                      className="btn btn-ghost btn-remove-flavor"
                                      disabled={loading}
                                      title="Удалить вкус"
                                    >
                                        🗑
                                    </button>
                                  </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <p className="no-flavors">Нет вкусов для этого объема</p>
                            )}
                            <div className="add-flavor-section">
                              {addingFlavor[volume] ? (
                                <div className="add-flavor-form">
                                  <input
                                    type="text"
                                    placeholder="Название вкуса"
                                    value={newFlavorData[volume]?.name || ''}
                                    onChange={(e) => handleNewFlavorChange(volume, 'name', e.target.value)}
                                    className="input"
                                    disabled={loading}
                                  />
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleNewFlavorChange(volume, 'image', e.target.files[0])}
                                    className="input-file"
                                    disabled={loading}
                                  />
                                  <div className="add-flavor-actions">
                                    <button
                                      type="button"
                                      onClick={() => handleAddFlavor(volume)}
                                      className="btn btn-primary btn-sm"
                                      disabled={loading || !newFlavorData[volume]?.name?.trim()}
                                    >
                                      Добавить
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setAddingFlavor(prev => ({ ...prev, [volume]: false }));
                                        setNewFlavorData(prev => ({
                                          ...prev,
                                          [volume]: { name: '', image: null }
                                        }));
                                      }}
                                      className="btn btn-ghost btn-sm"
                                      disabled={loading}
                                    >
                                      Отмена
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setAddingFlavor(prev => ({ ...prev, [volume]: true }))}
                                  className="btn btn-secondary btn-add-flavor"
                                  disabled={loading}
                                >
                                  + Добавить вкус
                                </button>
                              )}
                            </div>
                          </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Товары без объемов (только flavors) */}
                  {(!product.volumes || Object.keys(product.volumes).length === 0) && (
                    <div className="form-group">
                      <label>Вкусы</label>
                      {product.flavors && product.flavors.length > 0 ? (
                        <div className="flavors-list">
                          {product.flavors.map((flavor, index) => {
                            const isActive = flavor.is_active !== false; // По умолчанию true
                            return (
                              <div key={index} className={`flavor-item ${!isActive ? 'flavor-inactive' : ''}`}>
                              {flavor.image_path && (
                                <img 
                                  src={getImageUrl(flavor.image_path)} 
                                  alt={flavor.name}
                                  className="flavor-image-small"
                                />
                              )}
                              <span className="flavor-name">{flavor.name}</span>
                                <button
                                  type="button"
                                  onClick={() => handleToggleFlavorStatusFromProduct(flavor.name, isActive)}
                                  className={`btn btn-ghost ${isActive ? 'btn-deactivate-flavor' : 'btn-activate-flavor'}`}
                                  disabled={loading}
                                  title={isActive ? 'Деактивировать вкус' : 'Активировать вкус'}
                                >
                                  {isActive ? '✕' : '✓'}
                                </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveFlavorFromProduct(flavor.name)}
                                className="btn btn-ghost btn-remove-flavor"
                                disabled={loading}
                                title="Удалить вкус"
                              >
                                  🗑
                              </button>
                            </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="no-flavors">Нет вкусов</p>
                      )}
                      <div className="add-flavor-section">
                        {addingFlavor['product'] ? (
                          <div className="add-flavor-form">
                            <input
                              type="text"
                              placeholder="Название вкуса"
                              value={newFlavorData['product']?.name || ''}
                              onChange={(e) => handleNewFlavorChange('product', 'name', e.target.value)}
                              className="input"
                              disabled={loading}
                            />
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleNewFlavorChange('product', 'image', e.target.files[0])}
                              className="input-file"
                              disabled={loading}
                            />
                            <div className="add-flavor-actions">
                              <button
                                type="button"
                                onClick={handleAddFlavorToProduct}
                                className="btn btn-primary btn-sm"
                                disabled={loading || !newFlavorData['product']?.name?.trim()}
                              >
                                Добавить
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setAddingFlavor(prev => ({ ...prev, 'product': false }));
                                  setNewFlavorData(prev => ({
                                    ...prev,
                                    'product': { name: '', image: null }
                                  }));
                                }}
                                className="btn btn-ghost btn-sm"
                                disabled={loading}
                              >
                                Отмена
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setAddingFlavor(prev => ({ ...prev, 'product': true }))}
                            className="btn btn-secondary btn-add-flavor"
                            disabled={loading}
                          >
                            + Добавить вкус
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}

              {error && <div className="error-message">{error}</div>}

              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => navigate('/admin/products')}
                  className="btn btn-secondary"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn btn-primary"
                >
                  {loading ? 'Сохранение...' : 'Сохранить'}
                </button>
              </div>
            </form>
          </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminProductForm;

