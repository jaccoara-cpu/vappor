import { useNavigate } from 'react-router-dom';
import { useRef, useEffect } from 'react';
import { useCart } from '../hooks/useCart';
import { ShoppingCart } from 'lucide-react';
import './Header.css';

const Header = ({ showBack = false, onBack }) => {
  const navigate = useNavigate();
  const lastClickTime = useRef(0);
  const clickTimeout = useRef(null);
  const { itemCount } = useCart();

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (clickTimeout.current) {
        clearTimeout(clickTimeout.current);
      }
    };
  }, []);

  const handleLogoClick = (e) => {
    e.preventDefault();
    const now = Date.now();
    const timeSinceLastClick = now - lastClickTime.current;

    // Clear any pending single click navigation
    if (clickTimeout.current) {
      clearTimeout(clickTimeout.current);
      clickTimeout.current = null;
    }

    // If double click (within 300ms)
    if (timeSinceLastClick < 300 && timeSinceLastClick > 0) {
      // Double click - navigate to admin panel
      lastClickTime.current = 0;
      navigate('/admin/login');
    } else {
      // Single click - wait to see if it's a double click
      lastClickTime.current = now;
      clickTimeout.current = setTimeout(() => {
        // Single click confirmed - navigate to catalog
        navigate('/catalog');
        lastClickTime.current = 0;
        clickTimeout.current = null;
      }, 300);
    }
  };

  return (
    <header className="header">
      <div className="header-content">
        {showBack && onBack ? (
          <>
            <div className="header-button-wrapper">
              <button onClick={onBack} className="btn-ghost btn-back">
                ← Назад
              </button>
            </div>
            <div className="header-button-wrapper">
              <span 
                className="logo" 
                onClick={handleLogoClick}
              >
                VAPOR
              </span>
            </div>
            <div className="header-button-wrapper">
              <button 
                onClick={() => navigate('/cart')} 
                className="btn-ghost btn-cart"
                title="Корзина"
              >
                <ShoppingCart size={20} />
                {itemCount > 0 && (
                  <span className="cart-badge">{itemCount}</span>
                )}
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="header-button-wrapper">
              <span 
                className="logo" 
                onClick={handleLogoClick}
              >
                VAPOR
              </span>
            </div>
            <div className="header-button-wrapper">
              <button 
                onClick={() => navigate('/cart')} 
                className="btn-ghost btn-cart"
                title="Корзина"
              >
                <ShoppingCart size={20} />
                {itemCount > 0 && (
                  <span className="cart-badge">{itemCount}</span>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;

