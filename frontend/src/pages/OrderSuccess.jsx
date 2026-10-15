import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import { getOrderById, logoutCustomer } from "../services/api.js";

const OrderSuccess = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

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

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const data = await getOrderById(id);
        if (data.success) {
          setOrder(data.order);
        }
      } catch (err) {
        console.error("Failed to load order details", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrder();
    }
  }, [id]);

  return (
    <div>
      <Navbar onLogout={handleLogout} isLoggingOut={isLoggingOut} />

      <main style={{ maxWidth: "600px", margin: "50px auto", padding: "0 20px" }}>
        <div
          style={{
            backgroundColor: "#fff",
            padding: "40px 30px",
            borderRadius: "16px",
            border: "1px solid #e4e9f2",
            boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "3.5rem", marginBottom: "15px" }}>✅</div>
          <h1 style={{ fontSize: "1.75rem", color: "#101828", marginBottom: "10px" }}>
            Order Placed Successfully!
          </h1>
          <p style={{ color: "#667085", marginBottom: "30px", fontSize: "0.95rem" }}>
            Thank you for your purchase. Your order has been placed and confirmed.
          </p>

          <div
            style={{
              backgroundColor: "#f9fafb",
              borderRadius: "12px",
              padding: "20px",
              marginBottom: "30px",
              textAlign: "left",
              border: "1px solid #eaecf0",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
              <span style={{ color: "#667085", fontSize: "0.9rem" }}>Order ID:</span>
              <span style={{ fontWeight: "600", fontFamily: "monospace", fontSize: "0.9rem", color: "#101828" }}>
                {id}
              </span>
            </div>

            {order && (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                  <span style={{ color: "#667085", fontSize: "0.9rem" }}>Total Amount:</span>
                  <span style={{ fontWeight: "700", color: "#101828" }}>₹{order.totalAmount}</span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                  <span style={{ color: "#667085", fontSize: "0.9rem" }}>Payment Status:</span>
                  <span style={{ fontWeight: "650", color: "#027a48" }}>{order.paymentStatus}</span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "#667085", fontSize: "0.9rem" }}>Order Status:</span>
                  <span
                    style={{
                      fontWeight: "650",
                      backgroundColor: "#ecfdf3",
                      color: "#027a48",
                      padding: "2px 8px",
                      borderRadius: "6px",
                      fontSize: "0.85rem",
                    }}
                  >
                    {order.status}
                  </span>
                </div>
              </>
            )}

            {!order && !loading && (
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#667085", fontSize: "0.9rem" }}>Status:</span>
                <span style={{ fontWeight: "650", color: "#027a48" }}>PLACED</span>
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: "15px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link
              to="/orders"
              className="primary-button"
              style={{
                textDecoration: "none",
                display: "inline-block",
                padding: "12px 24px",
                fontSize: "0.95rem",
              }}
            >
              View My Orders
            </Link>

            <Link
              to="/products"
              style={{
                textDecoration: "none",
                display: "inline-block",
                padding: "12px 24px",
                fontSize: "0.95rem",
                borderRadius: "9px",
                fontWeight: "700",
                backgroundColor: "#edf4ff",
                color: "#155eef",
                transition: "background 0.15s ease",
              }}
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OrderSuccess;
