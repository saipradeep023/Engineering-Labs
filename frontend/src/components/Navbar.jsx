import React from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";

const Navbar = ({ onLogout, isLoggingOut }) => {
  const { cartCount } = useCart();
  
  return (
    <header className="navbar">
    <Link className="brand" to="/home" aria-label="ShopKart home">Shop<span>Kart</span></Link>
    <div className="navbar-links" style={{ display: 'flex', alignItems: 'center', gap: '20px', marginLeft: 'auto', marginRight: '20px' }}>
      <Link className="nav-link" to="/products" style={{ color: '#101828', textDecoration: 'none', fontWeight: 650 }}>Products</Link>
      <Link className="nav-link" to="/wishlist" style={{ color: '#101828', textDecoration: 'none', fontWeight: 650 }}>Wishlist</Link>
      <Link className="nav-link" to="/orders" style={{ color: '#101828', textDecoration: 'none', fontWeight: 650 }}>Orders</Link>
      <Link className="nav-link" to="/cart" style={{ color: '#101828', textDecoration: 'none', fontWeight: 650 }}>Cart ({cartCount})</Link>
    </div>
    <button className="logout-button" type="button" onClick={onLogout} disabled={isLoggingOut}>{isLoggingOut ? "Logging out..." : "Logout"}</button>
  </header>
  );
};

export default Navbar;
