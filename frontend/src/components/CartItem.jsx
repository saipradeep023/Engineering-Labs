import React, { useState } from 'react';
import { useCart } from '../context/CartContext.jsx';

const CartItem = ({ item }) => {
  const { updateQuantity, removeProductFromCart } = useCart();
  const [isUpdating, setIsUpdating] = useState(false);
  const { product, quantity } = item;
  
  const handleQuantityChange = async (newQuantity) => {
    if (newQuantity < 1) return;
    if (newQuantity > product.stock) {
      alert("Cannot exceed available stock.");
      return;
    }
    setIsUpdating(true);
    await updateQuantity(product._id, newQuantity);
    setIsUpdating(false);
  };

  const handleRemove = async () => {
    setIsUpdating(true);
    await removeProductFromCart(product._id);
  };

  const subtotal = product.price * quantity;

  return (
    <div style={{ display: 'flex', alignItems: 'center', padding: '15px', borderBottom: '1px solid #ccc', gap: '20px' }}>
      <img src={product.image} alt={product.name} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '4px' }} />
      
      <div style={{ flexGrow: 1 }}>
        <h4 style={{ margin: '0 0 5px 0' }}>{product.name}</h4>
        <p style={{ margin: 0, color: '#666' }}>₹{product.price}</p>
        {product.stock < 5 && (
          <p style={{ margin: '5px 0 0', fontSize: '0.8rem', color: '#ff9900' }}>Only {product.stock} left in stock</p>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button 
          onClick={() => handleQuantityChange(quantity - 1)}
          disabled={quantity <= 1 || isUpdating}
          style={{ width: '30px', height: '30px', cursor: (quantity <= 1 || isUpdating) ? 'not-allowed' : 'pointer' }}
        >
          -
        </button>
        <span style={{ minWidth: '20px', textAlign: 'center' }}>{quantity}</span>
        <button 
          onClick={() => handleQuantityChange(quantity + 1)}
          disabled={quantity >= product.stock || isUpdating}
          style={{ width: '30px', height: '30px', cursor: (quantity >= product.stock || isUpdating) ? 'not-allowed' : 'pointer' }}
        >
          +
        </button>
      </div>

      <div style={{ minWidth: '100px', textAlign: 'right', fontWeight: 'bold' }}>
        ₹{subtotal}
      </div>

      <button 
        onClick={handleRemove}
        disabled={isUpdating}
        style={{ background: 'none', border: 'none', color: '#dc3545', cursor: isUpdating ? 'not-allowed' : 'pointer', textDecoration: 'underline' }}
      >
        Remove
      </button>
    </div>
  );
};

export default CartItem;
