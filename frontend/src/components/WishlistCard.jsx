import React, { useState } from "react";
import { Link } from "react-router-dom";
import { removeFromWishlist } from "../services/api.js";

const WishlistCard = ({ product, onRemoved }) => {
  const [isRemoving, setIsRemoving] = useState(false);

  const handleRemove = async () => {
    setIsRemoving(true);
    try {
      const data = await removeFromWishlist(product._id);
      if (data.success) {
        onRemoved(product._id);
      } else {
        alert(data.message || "Failed to remove product from wishlist");
        setIsRemoving(false);
      }
    } catch (error) {
      alert("Unable to remove product. Please try again.");
      setIsRemoving(false);
    }
  };

  return (
    <div className="product-card" style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <img src={product.image} alt={product.name} style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '4px' }} />
      <h3 style={{ margin: '12px 0 8px' }}>{product.name}</h3>
      <p style={{ color: '#666', marginBottom: '8px' }}>{product.category}</p>
      <p style={{ fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '8px' }}>₹{product.price}</p>
      <p style={{ fontSize: '0.9rem', color: product.stock > 0 ? 'green' : 'red', marginBottom: '16px', flexGrow: 1 }}>
        {product.stock > 0 ? `${product.stock} units left` : "Out of stock"}
      </p>
      
      <div style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
        <Link to={`/products/${product._id}`} style={{ flex: 1, textAlign: 'center', backgroundColor: '#007bff', color: 'white', padding: '10px', textDecoration: 'none', borderRadius: '4px' }}>
          View Details
        </Link>
        <button 
          onClick={handleRemove}
          disabled={isRemoving}
          style={{ flex: 1, backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '10px', borderRadius: '4px', cursor: isRemoving ? 'not-allowed' : 'pointer' }}
        >
          {isRemoving ? "Removing..." : "Remove ♥"}
        </button>
      </div>
    </div>
  );
};

export default WishlistCard;
