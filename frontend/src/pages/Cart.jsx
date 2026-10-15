import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import CartItem from "../components/CartItem.jsx";
import { useCart } from "../context/CartContext.jsx";
import { logoutCustomer } from "../services/api.js";

const Cart = () => {
  const { cartItems, loading, error, cartCount, fetchCart } = useCart();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  const navigate = useNavigate();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logoutCustomer();
      navigate("/login");
    } catch (error) {
      alert("Failed to logout. Please try again.");
      setIsLoggingOut(false);
    }
  };

  const subtotal = cartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);

  return (
    <div className="cart-page">
      <Navbar onLogout={handleLogout} isLoggingOut={isLoggingOut} />
      
      <main className="container" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ marginBottom: '20px' }}>My Cart</h1>

        {loading && <div className="loading-state" style={{ textAlign: 'center', padding: '40px' }}>Loading your cart...</div>}
        
        {error && !loading && (
          <div className="error-state" style={{ textAlign: 'center', padding: '40px', color: 'red' }}>
            <p style={{ whiteSpace: 'pre-line' }}>Unable to load your cart.</p>
            <button onClick={fetchCart} style={{ marginTop: '15px', padding: '8px 16px' }}>Try Again</button>
          </div>
        )}

        {!loading && !error && cartItems.length === 0 && (
          <div className="empty-state" style={{ textAlign: 'center', padding: '60px' }}>
            <h2 style={{ marginBottom: '20px' }}>🛒</h2>
            <h3>Your cart is empty</h3>
            <p style={{ color: '#666', margin: '15px 0' }}>Looks like you haven't added anything yet.</p>
            <Link to="/products" style={{ display: 'inline-block', backgroundColor: '#007bff', color: 'white', padding: '10px 20px', textDecoration: 'none', borderRadius: '4px' }}>
              Browse Products
            </Link>
          </div>
        )}

        {!loading && !error && cartItems.length > 0 && (
          <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
            <div style={{ flex: '1 1 600px', border: '1px solid #e0e0e0', borderRadius: '8px', padding: '20px' }}>
              {cartItems.map(item => (
                <CartItem key={item.product._id} item={item} />
              ))}
            </div>

            <div style={{ flex: '1 1 300px', minWidth: '300px' }}>
              <div style={{ border: '1px solid #e0e0e0', borderRadius: '8px', padding: '20px', position: 'sticky', top: '20px' }}>
                <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '20px' }}>Order Summary</h3>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                  <span>Items:</span>
                  <span>{cartCount}</span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontWeight: 'bold', fontSize: '1.2rem' }}>
                  <span>Subtotal:</span>
                  <span>₹{subtotal}</span>
                </div>
                
                <button 
                  style={{ 
                    width: '100%', 
                    padding: '15px', 
                    backgroundColor: '#28a745', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '4px',
                    fontSize: '1.1rem',
                    cursor: 'pointer'
                  }}
                  onClick={() => navigate("/checkout")}
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Cart;
