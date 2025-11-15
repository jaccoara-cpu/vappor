import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminGetFinanceStats, adminGetProducts, adminUpdateProductQuantity, adminUpdateVolumeQuantity, adminLogout } from '../api';
import ASCIIText from '../components/ASCIIText';
import LetterGlitch from '../components/LetterGlitch';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import './AdminFinance.css';

const COLORS = ['#00FF00', '#FF00FF', '#00AAFF', '#FFAA00'];

const AdminFinance = () => {
  const [stats, setStats] = useState(null);
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
    loadData();
  }, [navigate]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsResponse, productsResponse] = await Promise.all([
        adminGetFinanceStats(),
        adminGetProducts(),
      ]);
      setStats(statsResponse.data);
      setProducts(productsResponse.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuantity = async (productId, quantity) => {
    try {
      setUpdatingQuantities(prev => ({ ...prev, [productId]: true }));
      await adminUpdateProductQuantity(productId, quantity);
      await loadData();
    } catch (err) {
      console.error(err);
      alert('Ошибка при обновлении количества');
    } finally {
      setUpdatingQuantities(prev => ({ ...prev, [productId]: false }));
    }
  };

  const handleUpdateVolumeQuantity = async (productId, volume, quantity, purchasePrice) => {
    try {
      const key = `${productId}_${volume}`;
      setUpdatingQuantities(prev => ({ ...prev, [key]: true }));
      await adminUpdateVolumeQuantity(productId, volume, quantity, purchasePrice);
      await loadData();
    } catch (err) {
      console.error(err);
      alert('Ошибка при обновлении количества');
    } finally {
      setUpdatingQuantities(prev => ({ ...prev, [`${productId}_${volume}`]: false }));
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

  const prepareChartData = () => {
    if (!stats?.potential_profit_by_category) return [];
    
    return [
      { name: 'Жижа', value: stats.potential_profit_by_category.Жижа || 0 },
      { name: 'Стики', value: stats.potential_profit_by_category.Стики || 0 },
      { name: 'Картриджи', value: stats.potential_profit_by_category.Картриджи || 0 },
      { name: 'Другое', value: stats.potential_profit_by_category.Другое || 0 },
    ].filter(item => item.value > 0);
  };

  const prepareMonthlyChartData = () => {
    if (!stats?.monthly_profit_by_category) return [];
    
    return [
      { 
        name: 'Жижа', 
        value: stats.monthly_profit_by_category.Жижа || 0,
        revenue: stats.monthly_revenue_by_category?.Жижа || 0
      },
      { 
        name: 'Стики', 
        value: stats.monthly_profit_by_category.Стики || 0,
        revenue: stats.monthly_revenue_by_category?.Стики || 0
      },
      { 
        name: 'Картриджи', 
        value: stats.monthly_profit_by_category.Картриджи || 0,
        revenue: stats.monthly_revenue_by_category?.Картриджи || 0
      },
      { 
        name: 'Другое', 
        value: stats.monthly_profit_by_category.Другое || 0,
        revenue: stats.monthly_revenue_by_category?.Другое || 0
      },
    ].filter(item => item.value > 0);
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const categoryName = data.name;
      const profit = data.value;
      const details = stats?.potential_profit_details?.[categoryName];
      
      return (
        <div className="finance-tooltip">
          <p className="tooltip-category">{categoryName}</p>
          <p className="tooltip-profit">Прибыль: {profit.toFixed(2)} ₴</p>
          {details && (
            <>
              <p className="tooltip-quantity">Количество: {details.quantity} шт.</p>
              {details.quantity > 0 && (
                <p className="tooltip-average">Средняя прибыль за единицу: {(profit / details.quantity).toFixed(2)} ₴</p>
              )}
            </>
          )}
        </div>
      );
    }
    return null;
  };

  const chartData = prepareChartData();
  const monthlyChartData = prepareMonthlyChartData();

  const MonthlyTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const categoryName = data.name;
      const profit = data.value;
      // Получаем revenue из исходных данных графика через замыкание
      const chartDataItem = monthlyChartData.find(item => item.name === categoryName);
      const revenue = chartDataItem?.revenue || 0;
      
      return (
        <div className="finance-tooltip">
          <p className="tooltip-category">{categoryName}</p>
          {revenue > 0 && (
            <p className="tooltip-revenue">Доход: {revenue.toFixed(2)} ₴</p>
          )}
          <p className="tooltip-profit">Прибыль: {profit.toFixed(2)} ₴</p>
        </div>
      );
    }
    return null;
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
                className="btn btn-ghost"
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
                className="btn btn-ghost active"
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
          {loading ? (
            <div className="loading">Загрузка...</div>
          ) : (
            <>
              {/* Статистика за месяц */}
              <div className="finance-section card">
                <h2>Статистика за этот месяц</h2>
                <div className="finance-monthly">
                  <div className="finance-stats-row">
                    <div className="finance-stat-item revenue">
                      <span className="finance-label">Доход:</span>
                      <span className="finance-value revenue-value">{stats?.monthly_revenue?.toFixed(2) || '0.00'} ₴</span>
                    </div>
                    <div className="finance-stat-item profit">
                      <span className="finance-label">Чистая прибыль:</span>
                      <span className="finance-value profit-value">{stats?.monthly_profit?.toFixed(2) || '0.00'} ₴</span>
                    </div>
                  </div>
                  {monthlyChartData.length > 0 ? (
                    <div className="finance-chart">
                      <ResponsiveContainer width="100%" height={400}>
                        <PieChart margin={{ top: 20, right: 200, bottom: 20, left: 20 }}>
                          <Pie
                            data={monthlyChartData}
                            cx="35%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={90}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {monthlyChartData.map((entry, index) => (
                              <Cell key={`cell-monthly-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            content={<MonthlyTooltip />}
                            allowEscapeViewBox={{ x: true, y: true }}
                            cursor={false}
                            offset={20}
                            wrapperStyle={{ outline: 'none', pointerEvents: 'none' }}
                          />
                          <Legend 
                            verticalAlign="middle" 
                            align="right"
                            layout="vertical"
                            wrapperStyle={{ paddingLeft: '20px', width: '180px' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <p className="no-data">Нет данных для отображения</p>
                  )}
                </div>
              </div>

              {/* Потенциальная прибыль */}
              <div className="finance-section card">
                <h2>Потенциальная прибыль (вся партия)</h2>
                <div className="finance-potential">
                  <div className="finance-total">
                    <span className="finance-label">Общая потенциальная прибыль:</span>
                    <span className="finance-value">{stats?.potential_profit?.toFixed(2) || '0.00'} ₴</span>
                  </div>
                  {chartData.length > 0 ? (
                    <div className="finance-chart">
                      <ResponsiveContainer width="100%" height={400}>
                        <PieChart margin={{ top: 20, right: 200, bottom: 20, left: 20 }}>
                          <Pie
                            data={chartData}
                            cx="35%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={90}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip 
                            content={<CustomTooltip />}
                            allowEscapeViewBox={{ x: true, y: true }}
                            cursor={false}
                            offset={20}
                            wrapperStyle={{ outline: 'none', pointerEvents: 'none' }}
                          />
                          <Legend 
                            verticalAlign="middle" 
                            align="right"
                            layout="vertical"
                            wrapperStyle={{ paddingLeft: '20px', width: '180px' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <p className="no-data">Нет данных для отображения</p>
                  )}
                </div>
              </div>

              {/* Управление товарами */}
              <div className="finance-section card">
                <h2>Управление товарами</h2>
                <div className="finance-products">
                  {products.map((product) => (
                    <div key={product.id} className="finance-product-item">
                      <div className="product-info">
                        <h3>{product.name}</h3>
                        <p className="product-category">{getCategoryGroup(product.category)}</p>
                      </div>
                      {product.volumes && typeof product.volumes === 'object' && Object.keys(product.volumes).length > 0 ? (
                        <div className="product-volumes">
                          {Object.entries(product.volumes).map(([volumeKey, volumeData]) => {
                            const volumeStock = (product.volume_stocks || product.volumeStocks || [])?.find(vs => vs.volume === volumeKey);
                            const quantity = volumeStock?.quantity ?? 0;
                            const purchasePrice = volumeStock?.purchase_price ?? null;
                            const key = `${product.id}_${volumeKey}`;
                            
                            return (
                              <div key={volumeKey} className="volume-control">
                                <span className="volume-label">{volumeKey}:</span>
                                <input
                                  type="number"
                                  min="0"
                                  value={quantity}
                                  onChange={(e) => {
                                    const newQuantity = parseInt(e.target.value) || 0;
                                    // Передаем null для purchasePrice, чтобы backend установил значение по умолчанию
                                    handleUpdateVolumeQuantity(product.id, volumeKey, newQuantity, null);
                                  }}
                                  disabled={updatingQuantities[key]}
                                  className="quantity-input"
                                />
                                <span className="quantity-unit">шт.</span>
                                <span className="volume-price">Цена: {volumeData.price} ₴</span>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="product-quantity-control">
                          <input
                            type="number"
                            min="0"
                            value={product.quantity ?? 0}
                            onChange={(e) => {
                              const newQuantity = parseInt(e.target.value) || 0;
                              handleUpdateQuantity(product.id, newQuantity);
                            }}
                            disabled={updatingQuantities[product.id]}
                            className="quantity-input"
                          />
                          <span className="quantity-unit">шт.</span>
                          <span className="product-price">Цена: {product.price} ₴</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminFinance;

