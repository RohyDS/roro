import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { Heart, ShoppingCart, LogIn, LogOut, User } from 'lucide-react';
import './styles/Header.css';

const Header = () => {
  const { getCartCount, wishlist } = useCart();
  const { customer, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/Accueil');
  };

  return (
    <header className="navbar">
      <div className="navbar-logo">
        <Link to="/" alt="Logo">MonApp</Link>
      </div>
      
      <nav className="navbar-links">
        <ul>
          <li>
            <Link to="/Accueil">Accueil</Link>
          </li>
          <li>
            <Link to="/Accueil/ListeCategories">Catégories</Link>
          </li>
          <li>
            <Link to="/orders">Mes Commandes</Link>
          </li>
        </ul>
      </nav>

      <div className="navbar-actions" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {/* Wishlist Icon */}
        <Link to="/wishlist" style={{ textDecoration: 'none', position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Heart size={24} color={wishlist.length > 0 ? "#ef4444" : "currentColor"} fill={wishlist.length > 0 ? "#ef4444" : "none"} />
          {wishlist.length > 0 && (
            <span style={{
              position: 'absolute',
              top: '-8px',
              right: '-8px',
              background: '#2563eb',
              color: 'white',
              borderRadius: '50%',
              width: '18px',
              height: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.7rem',
              fontWeight: 'bold'
            }}>
              {wishlist.length}
            </span>
          )}
        </Link>

        <Link to="/cart" style={{ textDecoration: 'none', position: 'relative', display: 'flex', alignItems: 'center' }}>
          <ShoppingCart size={24} />
          {getCartCount() > 0 && (
            <span className="cart-badge">{getCartCount()}</span>
          )}
        </Link>

        {customer ? (
          <div className="user-menu" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <span style={{ fontSize: '0.9rem', color: '#4b5563', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <User size={18} /> {customer.first_name || customer.name || customer.email}
            </span>
            <button onClick={handleLogout} className="btn-logout" style={{ 
              background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#ef4444' 
            }}>
              <LogOut size={20} />
            </button>
          </div>
        ) : (
          <Link to="/login" className="btn-login" style={{ display: 'flex', alignItems: 'center', gap: '5px', textDecoration: 'none' }}>
            <LogIn size={20} /> Connexion
          </Link>
        )}
      </div>
    </header>
  );
};

export default Header;
