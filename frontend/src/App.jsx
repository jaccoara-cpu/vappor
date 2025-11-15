import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Welcome from './pages/Welcome';
import Catalog from './pages/Catalog';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Reservation from './pages/Reservation';
import ReservationConfirmation from './pages/ReservationConfirmation';
import AdminLogin from './pages/AdminLogin';
import AdminProducts from './pages/AdminProducts';
import AdminProductForm from './pages/AdminProductForm';
import AdminOrders from './pages/AdminOrders';
import AdminOrderDetail from './pages/AdminOrderDetail';
import AdminFinance from './pages/AdminFinance';
import Galaxy from './components/Galaxy';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-wrapper">
        <div className="galaxy-background-global">
          <Galaxy 
            mouseRepulsion={false}
            mouseInteraction={false}
            density={1}
            glowIntensity={0.3}
            saturation={0}
            hueShift={140}
            twinkleIntensity={0.3}
            rotationSpeed={0.1}
            repulsionStrength={2}
            autoCenterRepulsion={0}
            starSpeed={0.5}
            speed={1}
            transparent={true}
          />
        </div>
        <div className="app-content">
          <Routes>
            <Route path="/" element={<Welcome />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/product" element={<Catalog />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/reservation" element={<Reservation />} />
            <Route path="/reservation/confirmation" element={<ReservationConfirmation />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/products" element={<AdminProducts />} />
            <Route path="/admin/products/new" element={<AdminProductForm />} />
            <Route path="/admin/products/:id/edit" element={<AdminProductForm />} />
            <Route path="/admin/orders" element={<AdminOrders />} />
            <Route path="/admin/orders/:id" element={<AdminOrderDetail />} />
            <Route path="/admin/finance" element={<AdminFinance />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
