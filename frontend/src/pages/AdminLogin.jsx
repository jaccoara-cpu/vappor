import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminRequestCode, adminVerifyCode, adminCheckSession } from '../api';
import './AdminLogin.css';

const AdminLogin = () => {
  const [step, setStep] = useState('request'); // 'request' or 'verify'
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Check if already authenticated
    const token = localStorage.getItem('admin_token');
    if (token) {
      checkSession();
    }
  }, []);

  const checkSession = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      if (!token) return;

      const response = await adminCheckSession();
      if (response.data.authenticated) {
        navigate('/admin/products');
      } else {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_authenticated');
      }
    } catch (err) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_authenticated');
    }
  };

  const handleRequestCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await adminRequestCode();
      if (response.data.success) {
        setMessage('Код отправлен в Telegram! Проверьте ваш Telegram аккаунт.');
        setStep('verify');
      } else {
        setError(response.data.message || 'Ошибка при отправке кода');
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 
        'Ошибка при отправке кода. Проверьте настройки Telegram бота.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (code.length !== 6) {
      setError('Код должен состоять из 6 цифр');
      setLoading(false);
      return;
    }

    try {
      const response = await adminVerifyCode(code);
      if (response.data.success && response.data.token) {
        // Save token to localStorage
        localStorage.setItem('admin_token', response.data.token);
        localStorage.setItem('admin_authenticated', 'true');
        
        // Redirect to admin panel
        navigate('/admin/products');
      } else {
        setError(response.data.message || 'Неверный код');
        setCode('');
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 
        'Неверный код или код истек. Попробуйте запросить новый код.'
      );
      setCode('');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setStep('request');
    setCode('');
    setError('');
    setMessage('');
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-content">
        <h1 className="admin-login-title">VAPOR Admin</h1>
        
        {step === 'request' ? (
          <form onSubmit={handleRequestCode} className="admin-login-form">
            <div className="form-group">
              <p style={{ marginBottom: '20px', color: 'var(--text-secondary)' }}>
                Для входа в админ-панель необходимо получить код авторизации через Telegram.
              </p>
              <p style={{ marginBottom: '20px', color: 'var(--text-secondary)', fontSize: '14px' }}>
                Код будет отправлен на ваш Telegram аккаунт
              </p>
            </div>
            
            {error && (
              <div style={{ 
                padding: '12px', 
                marginBottom: '20px', 
                backgroundColor: 'rgba(255, 0, 0, 0.1)', 
                border: '1px solid rgba(255, 0, 0, 0.3)',
                borderRadius: '8px',
                color: '#ff4444'
              }}>
                {error}
              </div>
            )}
            
            <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%' }}>
              {loading ? 'Отправка...' : 'Получить код в Telegram'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyCode} className="admin-login-form">
            <div className="form-group">
              <label htmlFor="code">Код из Telegram</label>
              <input
                type="text"
                id="code"
                className="input"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                maxLength={6}
                required
                autoFocus
                style={{ 
                  textAlign: 'center', 
                  fontSize: '24px', 
                  letterSpacing: '8px',
                  fontFamily: 'monospace'
                }}
              />
              <small style={{ marginTop: '8px', color: 'var(--text-secondary)', display: 'block' }}>
                Введите 6-значный код, отправленный в Telegram
              </small>
            </div>
            
            {message && (
              <div style={{ 
                padding: '12px', 
                marginBottom: '20px', 
                backgroundColor: 'rgba(0, 255, 0, 0.1)', 
                border: '1px solid rgba(0, 255, 0, 0.3)',
                borderRadius: '8px',
                color: '#00ff00'
              }}>
                {message}
              </div>
            )}
            
            {error && (
              <div style={{ 
                padding: '12px', 
                marginBottom: '20px', 
                backgroundColor: 'rgba(255, 0, 0, 0.1)', 
                border: '1px solid rgba(255, 0, 0, 0.3)',
                borderRadius: '8px',
                color: '#ff4444'
              }}>
                {error}
              </div>
            )}
            
            <button type="submit" disabled={loading || code.length !== 6} className="btn btn-primary" style={{ width: '100%', marginBottom: '12px' }}>
              {loading ? 'Проверка...' : 'Войти'}
            </button>
            
            <button 
              type="button" 
              onClick={handleBack} 
              className="btn btn-secondary" 
              style={{ width: '100%' }}
              disabled={loading}
            >
              Назад
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AdminLogin;
