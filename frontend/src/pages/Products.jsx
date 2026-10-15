import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import ProductCard from "../components/ProductCard.jsx";
import SearchBar from "../components/SearchBar.jsx";
import { getProducts, getWishlist, logoutCustomer } from "../services/api.js";

const Products = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [wishlistIds, setWishlistIds] = useState([]);
  
  const navigate = useNavigate();

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getProducts(search, category, sort);
      if (data.success) {
        setProducts(data.products);
      } else {
        setError(data.message || "Failed to fetch products");
      }
    } catch (err) {
      setError("Something went wrong while loading products.");
    } finally {
      setLoading(false);
    }
  }, [search, category, sort]);

  useEffect(() => {
    // Fetch wishlist IDs to sync initial state
    const fetchWishlistIds = async () => {
      try {
        const data = await getWishlist();
        if (data.success) {
          setWishlistIds(data.wishlist.map(item => item._id));
        }
      } catch (err) {
        console.error("Failed to load wishlist status", err);
      }
    };
    fetchWishlistIds();

    // Debounce search slightly
    const delayDebounceFn = setTimeout(() => {
      fetchProducts();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [fetchProducts]);

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
    <div className="products-page">
      <Navbar onLogout={handleLogout} isLoggingOut={isLoggingOut} />
      
      <main className="container" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ marginBottom: '20px' }}>Discover Products</h1>
        
        <SearchBar 
          search={search} setSearch={setSearch}
          category={category} setCategory={setCategory}
          sort={sort} setSort={setSort}
        />

        {loading && <div className="loading-state" style={{ textAlign: 'center', padding: '40px' }}>Loading products...</div>}
        
        {error && !loading && (
          <div className="error-state" style={{ textAlign: 'center', padding: '40px', color: 'red' }}>
            {error}
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <div className="empty-state" style={{ textAlign: 'center', padding: '40px' }}>
            No products found.
          </div>
        )}

        {!loading && !error && products.length > 0 && (
          <div 
            className="products-grid" 
            style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
              gap: '20px' 
            }}
          >
            {products.map(product => (
              <ProductCard key={product._id} product={product} initialWishlisted={wishlistIds.includes(product._id)} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Products;
