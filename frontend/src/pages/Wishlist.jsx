import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import WishlistCard from "../components/WishlistCard.jsx";
import { getWishlist, logoutCustomer } from "../services/api.js";

const Wishlist = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  const navigate = useNavigate();

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getWishlist();
      if (data.success) {
        setWishlist(data.wishlist);
      } else {
        setError(data.message || "Unable to load wishlist.");
      }
    } catch (err) {
      setError("Something went wrong.\n\nWe couldn't load your wishlist.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

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

  const handleProductRemoved = (productId) => {
    setWishlist(prev => prev.filter(product => product._id !== productId));
  };

  return (
    <div className="wishlist-page">
      <Navbar onLogout={handleLogout} isLoggingOut={isLoggingOut} />
      
      <main className="container" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ marginBottom: '20px' }}>My Wishlist</h1>
        
        {!loading && !error && (
          <p style={{ marginBottom: '20px', color: '#666' }}>{wishlist.length} products saved</p>
        )}

        {loading && <div className="loading-state" style={{ textAlign: 'center', padding: '40px' }}>Loading your wishlist...</div>}
        
        {error && !loading && (
          <div className="error-state" style={{ textAlign: 'center', padding: '40px', color: 'red' }}>
            <p style={{ whiteSpace: 'pre-line' }}>{error}</p>
            <button onClick={fetchWishlist} style={{ marginTop: '15px', padding: '8px 16px' }}>Try Again</button>
          </div>
        )}

        {!loading && !error && wishlist.length === 0 && (
          <div className="empty-state" style={{ textAlign: 'center', padding: '60px' }}>
            <h2 style={{ marginBottom: '20px' }}>❤️</h2>
            <h3>Your wishlist is empty</h3>
            <p style={{ color: '#666', margin: '15px 0' }}>Save products you love and<br />find them here later.</p>
            <Link to="/products" style={{ display: 'inline-block', backgroundColor: '#007bff', color: 'white', padding: '10px 20px', textDecoration: 'none', borderRadius: '4px' }}>
              Browse Products
            </Link>
          </div>
        )}

        {!loading && !error && wishlist.length > 0 && (
          <div 
            className="products-grid" 
            style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
              gap: '20px' 
            }}
          >
            {wishlist.map(product => (
              <WishlistCard key={product._id} product={product} onRemoved={handleProductRemoved} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Wishlist;
