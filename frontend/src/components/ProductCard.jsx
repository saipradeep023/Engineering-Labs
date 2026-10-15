import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toggleWishlist } from "../services/api.js";
import { useCart } from "../context/CartContext.jsx";

const ProductCard = ({ product, initialWishlisted = false }) => {
  const [isWishlisted, setIsWishlisted] = useState(initialWishlisted);
  const [isSaving, setIsSaving] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  const { addProductToCart, cartItems } = useCart();
  const inCart = cartItems.some(item => item.product._id === product._id || item.product === product._id);

  useEffect(() => {
    setIsWishlisted(initialWishlisted);
  }, [initialWishlisted]);

  const handleToggleWishlist = async () => {
    setIsSaving(true);
    setErrorMsg("");
    try {
      const data = await toggleWishlist(product._id);
      if (data.success) {
        setIsWishlisted(data.saved);
      } else {
        setErrorMsg(data.message || "Unable to save product.");
      }
    } catch (error) {
      setErrorMsg("Unable to save product. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddToCart = async () => {
    setIsAddingToCart(true);
    setErrorMsg("");
    const result = await addProductToCart(product._id);
    if (!result.success) {
      setErrorMsg(result.message);
    }
    setIsAddingToCart(false);
  };

  return (
    <div className="product-card" style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ position: 'relative' }}>
        <img src={product.image} alt={product.name} style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '4px' }} />
        <button 
          onClick={handleToggleWishlist}
          disabled={isSaving}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            background: 'white',
            border: '1px solid #ccc',
            borderRadius: '4px',
            padding: '5px 10px',
            cursor: isSaving ? 'not-allowed' : 'pointer',
            opacity: 0.9,
          }}
        >
          {isSaving ? "⏳ Saving..." : isWishlisted ? "♥ Added to Wishlist" : "♡ Add to Wishlist"}
        </button>
      </div>
      
      {errorMsg && <p style={{ color: 'red', fontSize: '0.8rem', marginTop: '5px' }}>{errorMsg}</p>}
      
      <h3 style={{ margin: '12px 0 8px' }}>{product.name}</h3>
      <p style={{ color: '#666', marginBottom: '8px' }}>{product.category}</p>
      <p style={{ fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '8px' }}>₹{product.price}</p>
      <p style={{ fontSize: '0.9rem', color: product.stock > 0 ? 'green' : 'red', marginBottom: '16px', flexGrow: 1 }}>
        {product.stock > 0 ? `${product.stock} units left` : "Out of stock"}
      </p>
      
      <div style={{ display: 'flex', gap: '10px' }}>
        <Link to={`/products/${product._id}`} className="view-details-btn" style={{ flex: 1, textAlign: 'center', backgroundColor: '#007bff', color: 'white', padding: '10px', textDecoration: 'none', borderRadius: '4px' }}>
          View Details
        </Link>
        <button 
          onClick={handleAddToCart}
          disabled={product.stock < 1 || isAddingToCart}
          style={{
            flex: 1, 
            backgroundColor: product.stock > 0 ? '#ff9900' : '#ccc', 
            color: 'white', 
            padding: '10px', 
            border: 'none', 
            borderRadius: '4px',
            cursor: product.stock > 0 ? (isAddingToCart ? 'wait' : 'pointer') : 'not-allowed'
          }}
        >
          {isAddingToCart ? "Adding..." : (inCart ? "Add Another" : "Add to Cart")}
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
