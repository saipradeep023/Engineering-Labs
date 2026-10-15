import React, { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import { getOrders, logoutCustomer } from "../services/api.js";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const navigate = useNavigate();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logoutCustomer();
      navigate("/login");
    } catch (_error) {
      alert("Failed to logout. Please try again.");
      setIsLoggingOut(false);
    }
  };

  const fetchOrdersList = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getOrders();
      if (data.success) {
        setOrders(data.orders || []);
      } else {
        setError(data.message || "Failed to load orders");
      }
    } catch (err) {
      setError(err.message || "Unable to fetch orders. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrdersList();
  }, [fetchOrdersList]);

  const getStatusColor = (status) => {
    switch (status) {
      case "PLACED":
      case "CONFIRMED":
      case "DELIVERED":
        return { bg: "#ecfdf3", text: "#027a48", border: "#a6f4c5" };
      case "SHIPPED":
        return { bg: "#eff8ff", text: "#175cd3", border: "#b2ddff" };
      case "PENDING_PAYMENT":
        return { bg: "#fffaeb", text: "#b54708", border: "#fedf89" };
      default:
        return { bg: "#f2f4f7", text: "#344054", border: "#eaecf0" };
    }
  };

  return (
    <div>
      <Navbar onLogout={handleLogout} isLoggingOut={isLoggingOut} />

      <main style={{ maxWidth: "1000px", margin: "30px auto", padding: "0 20px" }}>
        <h1 style={{ marginBottom: "25px", fontSize: "1.85rem", color: "#101828" }}>My Orders</h1>

        {loading && (
          <div style={{ textAlign: "center", padding: "60px", color: "#667085", fontSize: "1.1rem" }}>
            Loading your orders...
          </div>
        )}

        {error && !loading && (
          <div
            style={{
              textAlign: "center",
              padding: "40px",
              backgroundColor: "#fef3f2",
              borderRadius: "12px",
              border: "1px solid #fecdca",
              color: "#b42318",
              maxWidth: "600px",
              margin: "20px auto",
            }}
          >
            <p style={{ margin: "0 0 15px", fontSize: "1rem" }}>{error}</p>
            <button
              onClick={fetchOrdersList}
              className="primary-button"
              style={{ padding: "8px 20px", fontSize: "0.9rem" }}
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && orders.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "70px 20px",
              backgroundColor: "#fff",
              borderRadius: "16px",
              border: "1px solid #e4e9f2",
              maxWidth: "600px",
              margin: "20px auto",
            }}
          >
            <div style={{ fontSize: "3rem", marginBottom: "15px" }}>📦</div>
            <h2 style={{ fontSize: "1.35rem", marginBottom: "10px", color: "#101828" }}>
              You have not placed any orders yet.
            </h2>
            <p style={{ color: "#667085", marginBottom: "25px", fontSize: "0.95rem" }}>
              Explore our catalogue and pick up what you love!
            </p>
            <Link
              to="/products"
              className="primary-button"
              style={{
                display: "inline-block",
                textDecoration: "none",
                padding: "12px 24px",
                fontSize: "1rem",
              }}
            >
              Start Shopping
            </Link>
          </div>
        )}

        {!loading && !error && orders.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
            {orders.map((order) => {
              const statusStyle = getStatusColor(order.status);
              const formattedDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              });

              return (
                <div
                  key={order._id}
                  style={{
                    backgroundColor: "#fff",
                    borderRadius: "14px",
                    border: "1px solid #e4e9f2",
                    padding: "24px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      borderBottom: "1px solid #f2f4f7",
                      paddingBottom: "15px",
                      marginBottom: "18px",
                      flexWrap: "wrap",
                      gap: "10px",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: "700", fontSize: "1.05rem", color: "#101828" }}>
                        Order #{order._id}
                      </div>
                      <div style={{ color: "#667085", fontSize: "0.85rem", marginTop: "3px" }}>
                        Placed on {formattedDate}
                      </div>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span
                        style={{
                          backgroundColor: statusStyle.bg,
                          color: statusStyle.text,
                          border: `1px solid ${statusStyle.border}`,
                          padding: "4px 10px",
                          borderRadius: "6px",
                          fontSize: "0.82rem",
                          fontWeight: "700",
                        }}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "18px" }}>
                    {order.items.map((item, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          fontSize: "0.93rem",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.name}
                              style={{ width: "45px", height: "45px", objectFit: "cover", borderRadius: "8px" }}
                            />
                          )}
                          <div>
                            <div style={{ fontWeight: "600", color: "#344054" }}>{item.name}</div>
                            <div style={{ color: "#667085", fontSize: "0.82rem" }}>
                              Qty: {item.quantity} × ₹{item.price}
                            </div>
                          </div>
                        </div>
                        <div style={{ fontWeight: "650", color: "#101828" }}>
                          ₹{item.price * item.quantity}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Footer & Address Details */}
                  <div
                    style={{
                      borderTop: "1px solid #f2f4f7",
                      paddingTop: "15px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: "15px",
                    }}
                  >
                    <div style={{ fontSize: "0.85rem", color: "#667085", maxWidth: "450px" }}>
                      <strong>Shipping to:</strong> {order.shippingAddress?.fullName},{" "}
                      {order.shippingAddress?.addressLine1}, {order.shippingAddress?.city},{" "}
                      {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
                    </div>

                    <div style={{ textAlign: "right" }}>
                      <span style={{ color: "#667085", fontSize: "0.9rem", marginRight: "8px" }}>
                        Total:
                      </span>
                      <span style={{ fontSize: "1.25rem", fontWeight: "750", color: "#101828" }}>
                        ₹{order.totalAmount}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default Orders;
