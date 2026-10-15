const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const request = async (path, options = {}) => {
  const response = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Something went wrong. Please try again.");
  return data;
};

export const registerCustomer = (customer) => request("/customers/register", { method: "POST", body: JSON.stringify(customer) });
export const loginCustomer = (credentials) => request("/customers/login", { method: "POST", body: JSON.stringify(credentials) });
export const getCurrentCustomer = () => request("/customers/me");
export const logoutCustomer = () => request("/customers/logout", { method: "POST" });

export const getProducts = (search = "", category = "", sort = "") => {
  const params = new URLSearchParams();
  if (search) params.append("search", search);
  if (category) params.append("category", category);
  if (sort) params.append("sort", sort);
  const queryString = params.toString();
  const url = queryString ? `/products?${queryString}` : "/products";
  return request(url);
};

export const getProductById = (id) => request(`/products/${id}`);

export const getWishlist = () => request("/wishlist");
export const toggleWishlist = (productId) => request(`/wishlist/${productId}/toggle`, { method: "PATCH" });
export const removeFromWishlist = (productId) => request(`/wishlist/${productId}`, { method: "DELETE" });

export const getCart = () => request("/cart");
export const addToCart = (productId) => request(`/cart/${productId}`, { method: "POST" });
export const updateCartQuantity = (productId, quantity) => request(`/cart/${productId}`, { method: "PATCH", body: JSON.stringify({ quantity }) });
export const removeFromCart = (productId) => request(`/cart/${productId}`, { method: "DELETE" });

export const createPaymentOrder = (shippingAddress) => request("/orders/create-payment-order", { method: "POST", body: JSON.stringify({ shippingAddress }) });
export const verifyPayment = (paymentData) => request("/orders/verify-payment", { method: "POST", body: JSON.stringify(paymentData) });
export const getOrders = () => request("/orders");
export const getOrderById = (id) => request(`/orders/${id}`);
