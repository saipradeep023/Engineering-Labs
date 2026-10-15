import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import { getProductById, logoutCustomer, toggleWishlist, getWishlist } from "../services/api.js";
import { useCart } from "../context/CartContext.jsx";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  
  const { addProductToCart, cartItems } = useCart();
  const inCart = product && cartItems.some(item => item.product._id === product._id || item.product === product._id);

  const handleToggleWishlist = async () => {
    setIsSaving(true);
    try {
      const data = await toggleWishlist(product._id);
      if (data.success) {
        setIsWishlisted(data.saved);
      } else {
        alert(data.message || "Unable to save product.");
      }
    } catch (error) {
      alert("Unable to save product. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddToCart = async () => {
    setIsAddingToCart(true);
    const result = await addProductToCart(product._id);
    if (!result.success) {
      alert(result.message);
    }
    setIsAddingToCart(false);
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getProductById(id);
        if (data.success) {
          setProduct(data.product);
        } else {
          setError(data.message || "Failed to fetch product details");
        }
      } catch (err) {
        setError("Something went wrong while loading product details.");
      } finally {
        setLoading(false);
      }
    };

    const fetchWishlistStatus = async () => {
      try {
        const data = await getWishlist();
        if (data.success) {
          setIsWishlisted(data.wishlist.some(item => item._id === id));
        }
      } catch (err) {
        console.error("Failed to load wishlist status", err);
      }
    };

    fetchProduct();
    fetchWishlistStatus();
  }, [id]);

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

  return (
    <div className="product-details-page">
      <Navbar onLogout={handleLogout} isLoggingOut={isLoggingOut} />
      
      <main className="container" style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
        <button 
          onClick={() => navigate(-1)} 
          style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', padding: 0, fontSize: '1rem', marginBottom: '20px', textDecoration: 'none' }}
        >
          &larr; Go Back
        </button>

        {loading && <div className="loading-state" style={{ textAlign: 'center', padding: '40px' }}>Loading product details...</div>}
        
        {error && !loading && (
          <div className="error-state" style={{ textAlign: 'center', padding: '40px', color: 'red' }}>
            {error}
          </div>
        )}

        {!loading && !error && !product && (
          <div className="empty-state" style={{ textAlign: 'center', padding: '40px' }}>
            Product not found.
          </div>
        )}

        {!loading && !error && product && (
          <div className="product-details-container" style={{ display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
            <div className="product-image" style={{ flex: '1 1 400px' }}>
              <img 
                src={product.image} 
                alt={product.name} 
                style={{ width: '100%', borderRadius: '8px', objectFit: 'cover' }} 
              />
              <div style={{ textAlign: 'right', marginTop: '10px' }}>
                <button 
                  onClick={handleToggleWishlist}
                  disabled={isSaving}
                  style={{
                    background: 'white',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    padding: '8px 16px',
                    cursor: isSaving ? 'not-allowed' : 'pointer',
                  }}
                >
                  {isSaving ? "⏳ Saving..." : isWishlisted ? "♥ Added to Wishlist" : "♡ Add to Wishlist"}
                </button>
              </div>
            </div>
            
            <div className="product-info" style={{ flex: '1 1 400px', display: 'flex', flexDirection: 'column' }}>
              <h1 style={{ marginBottom: '10px' }}>{product.name}</h1>
              <p style={{ color: '#666', fontSize: '1.2rem', marginBottom: '20px' }}>{product.category}</p>
              
              <h2 style={{ fontSize: '2rem', marginBottom: '20px' }}>₹{product.price}</h2>
              
              <div style={{ marginBottom: '20px' }}>
                <span style={{ 
                  display: 'inline-block', 
                  padding: '4px 8px', 
                  borderRadius: '4px', 
                  backgroundColor: product.stock > 0 ? '#e6f4ea' : '#fce8e6',
                  color: product.stock > 0 ? '#137333' : '#c5221f',
                  fontWeight: 'bold'
                }}>
                  {product.stock > 0 ? `In Stock (${product.stock})` : "Out of Stock"}
                </span>
              </div>
              
              <div style={{ marginBottom: '40px' }}>
                <h3>Description</h3>
                <p style={{ lineHeight: '1.6', marginTop: '10px' }}>{product.description}</p>
              </div>
              
              <button 
                onClick={handleAddToCart}
                disabled={product.stock === 0 || isAddingToCart}
                style={{ 
                  padding: '15px 30px', 
                  fontSize: '1.1rem', 
                  backgroundColor: product.stock > 0 ? '#ff9900' : '#ccc', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px',
                  cursor: product.stock > 0 ? (isAddingToCart ? 'wait' : 'pointer') : 'not-allowed',
                  marginTop: 'auto'
                }}
              >
                {isAddingToCart ? "Adding to Cart..." : (inCart ? "Add Another" : "Add to Cart")}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ProductDetails;
