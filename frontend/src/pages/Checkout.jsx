import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import { useCart } from "../context/CartContext.jsx";
import { createPaymentOrder, verifyPayment, logoutCustomer } from "../services/api.js";

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      return resolve(true);
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

const Checkout = () => {
  const { cartItems, loading: cartLoading, cartCount, clearCart } = useCart();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    addressLine1: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: null }));
    }
    setGeneralError(null);
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.fullName.trim()) {
      errors.fullName = "Full Name is required";
    }
    const cleanedPhone = formData.phone.trim().replace(/[\s-]/g, "");
    if (!cleanedPhone) {
      errors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(cleanedPhone)) {
      errors.phone = "Phone must be a valid 10-digit number";
    }
    if (!formData.addressLine1.trim()) {
      errors.addressLine1 = "Address is required";
    }
    if (!formData.city.trim()) {
      errors.city = "City is required";
    }
    if (!formData.state.trim()) {
      errors.state = "State is required";
    }
    const cleanedPincode = formData.pincode.trim();
    if (!cleanedPincode) {
      errors.pincode = "Pincode is required";
    } else if (!/^\d{6}$/.test(cleanedPincode)) {
      errors.pincode = "Pincode must contain 6 digits";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError(null);

    if (!validateForm()) {
      return;
    }

    if (cartItems.length === 0) {
      setGeneralError("Your cart is empty. Please add items before checking out.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Create order on backend and initiate Razorpay order
      const orderRes = await createPaymentOrder({
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        addressLine1: formData.addressLine1.trim(),
        city: formData.city.trim(),
        state: formData.state.trim(),
        pincode: formData.pincode.trim(),
      });

      if (!orderRes.success) {
        setGeneralError(orderRes.message || "Failed to initiate order");
        setIsSubmitting(false);
        return;
      }

      // 2. Ensure Razorpay checkout script is loaded
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        setGeneralError("Failed to load Razorpay payment gateway. Please check your internet connection.");
        setIsSubmitting(false);
        return;
      }

      // 3. Configure Razorpay Standard Checkout
      const options = {
        key: orderRes.key,
        amount: orderRes.amount,
        currency: orderRes.currency,
        name: "ShopKart",
        description: `Order #${orderRes.shopKartOrderId}`,
        order_id: orderRes.razorpayOrderId,
        prefill: {
          name: formData.fullName.trim(),
          contact: formData.phone.trim(),
        },
        handler: async (response) => {
          try {
            // 4. Verify payment signature on backend
            const verifyRes = await verifyPayment({
              shopKartOrderId: orderRes.shopKartOrderId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyRes.success) {
              // 5. Clear global cart only after verified payment
              clearCart();
              navigate(`/order-success/${orderRes.shopKartOrderId}`);
            } else {
              setGeneralError(verifyRes.message || "Payment verification failed");
            }
          } catch (verifyErr) {
            setGeneralError(verifyErr.message || "Error verifying payment signature with server");
          } finally {
            setIsSubmitting(false);
          }
        },
        modal: {
          ondismiss: () => {
            setIsSubmitting(false);
          },
        },
        theme: {
          color: "#155eef",
        },
      };

      const paymentObject = new window.Razorpay(options);

      paymentObject.on("payment.failed", (response) => {
        setGeneralError(
          response.error?.description || "Payment failed. Your cart has been preserved. Please try again."
        );
        setIsSubmitting(false);
      });

      paymentObject.open();
    } catch (err) {
      setGeneralError(err.message || "An error occurred while creating your order.");
      setIsSubmitting(false);
    }
  };

  if (cartLoading) {
    return (
      <div>
        <Navbar onLogout={handleLogout} isLoggingOut={isLoggingOut} />
        <div style={{ textAlign: "center", padding: "60px" }}>Loading checkout...</div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div>
        <Navbar onLogout={handleLogout} isLoggingOut={isLoggingOut} />
        <div className="container" style={{ textAlign: "center", padding: "80px 20px", maxWidth: "600px", margin: "0 auto" }}>
          <h2 style={{ marginBottom: "15px" }}>🛒 Your cart is empty</h2>
          <p style={{ color: "#667085", marginBottom: "25px" }}>
            You need at least one product in your cart to proceed to checkout.
          </p>
          <Link
            to="/products"
            className="primary-button"
            style={{ display: "inline-block", textDecoration: "none", padding: "10px 24px" }}
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Navbar onLogout={handleLogout} isLoggingOut={isLoggingOut} />

      <main style={{ maxWidth: "1100px", margin: "30px auto", padding: "0 20px" }}>
        <h1 style={{ marginBottom: "25px", fontSize: "1.85rem" }}>Checkout</h1>

        {generalError && (
          <div
            className="form-error"
            style={{
              marginBottom: "20px",
              padding: "12px 16px",
              borderRadius: "8px",
              backgroundColor: "#fef3f2",
              color: "#b42318",
              border: "1px solid #fecdca",
            }}
          >
            ⚠️ {generalError}
          </div>
        )}

        <div style={{ display: "flex", gap: "30px", flexWrap: "wrap", alignItems: "flex-start" }}>
          {/* Shipping Form */}
          <section
            style={{
              flex: "1 1 520px",
              backgroundColor: "#fff",
              padding: "25px",
              borderRadius: "12px",
              border: "1px solid #e4e9f2",
              boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
            }}
          >
            <h2 style={{ fontSize: "1.3rem", marginBottom: "20px", color: "#101828" }}>
              Shipping Details
            </h2>

            <form onSubmit={handleSubmit} noValidate>
              <div style={{ marginBottom: "16px" }}>
                <label htmlFor="fullName" style={{ display: "block", marginBottom: "6px", fontWeight: "600", fontSize: "0.9rem" }}>
                  Full Name *
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="e.g. Aarav Sharma"
                  value={formData.fullName}
                  onChange={handleChange}
                  style={{
                    borderColor: fieldErrors.fullName ? "#b42318" : "#cfd7e6",
                  }}
                />
                {fieldErrors.fullName && (
                  <p style={{ color: "#b42318", fontSize: "0.82rem", margin: "4px 0 0" }}>
                    {fieldErrors.fullName}
                  </p>
                )}
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label htmlFor="phone" style={{ display: "block", marginBottom: "6px", fontWeight: "600", fontSize: "0.9rem" }}>
                  Phone Number (10 digits) *
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="e.g. 9876543210"
                  value={formData.phone}
                  onChange={handleChange}
                  style={{
                    borderColor: fieldErrors.phone ? "#b42318" : "#cfd7e6",
                  }}
                />
                {fieldErrors.phone && (
                  <p style={{ color: "#b42318", fontSize: "0.82rem", margin: "4px 0 0" }}>
                    {fieldErrors.phone}
                  </p>
                )}
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label htmlFor="addressLine1" style={{ display: "block", marginBottom: "6px", fontWeight: "600", fontSize: "0.9rem" }}>
                  Address Line *
                </label>
                <input
                  id="addressLine1"
                  name="addressLine1"
                  type="text"
                  placeholder="e.g. 22 MG Road, Flat 3B"
                  value={formData.addressLine1}
                  onChange={handleChange}
                  style={{
                    borderColor: fieldErrors.addressLine1 ? "#b42318" : "#cfd7e6",
                  }}
                />
                {fieldErrors.addressLine1 && (
                  <p style={{ color: "#b42318", fontSize: "0.82rem", margin: "4px 0 0" }}>
                    {fieldErrors.addressLine1}
                  </p>
                )}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "16px" }}>
                <div>
                  <label htmlFor="city" style={{ display: "block", marginBottom: "6px", fontWeight: "600", fontSize: "0.9rem" }}>
                    City *
                  </label>
                  <input
                    id="city"
                    name="city"
                    type="text"
                    placeholder="e.g. Bengaluru"
                    value={formData.city}
                    onChange={handleChange}
                    style={{
                      borderColor: fieldErrors.city ? "#b42318" : "#cfd7e6",
                    }}
                  />
                  {fieldErrors.city && (
                    <p style={{ color: "#b42318", fontSize: "0.82rem", margin: "4px 0 0" }}>
                      {fieldErrors.city}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="state" style={{ display: "block", marginBottom: "6px", fontWeight: "600", fontSize: "0.9rem" }}>
                    State *
                  </label>
                  <input
                    id="state"
                    name="state"
                    type="text"
                    placeholder="e.g. Karnataka"
                    value={formData.state}
                    onChange={handleChange}
                    style={{
                      borderColor: fieldErrors.state ? "#b42318" : "#cfd7e6",
                    }}
                  />
                  {fieldErrors.state && (
                    <p style={{ color: "#b42318", fontSize: "0.82rem", margin: "4px 0 0" }}>
                      {fieldErrors.state}
                    </p>
                  )}
                </div>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label htmlFor="pincode" style={{ display: "block", marginBottom: "6px", fontWeight: "600", fontSize: "0.9rem" }}>
                  Pincode (6 digits) *
                </label>
                <input
                  id="pincode"
                  name="pincode"
                  type="text"
                  maxLength={6}
                  placeholder="e.g. 560001"
                  value={formData.pincode}
                  onChange={handleChange}
                  style={{
                    borderColor: fieldErrors.pincode ? "#b42318" : "#cfd7e6",
                  }}
                />
                {fieldErrors.pincode && (
                  <p style={{ color: "#b42318", fontSize: "0.82rem", margin: "4px 0 0" }}>
                    {fieldErrors.pincode}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="primary-button"
                disabled={isSubmitting}
                style={{
                  width: "100%",
                  padding: "14px",
                  fontSize: "1.05rem",
                  backgroundColor: "#28a745",
                }}
              >
                {isSubmitting ? "Processing Payment..." : "Place Order & Pay with Razorpay"}
              </button>
            </form>
          </section>

          {/* Order Summary */}
          <section
            style={{
              flex: "1 1 340px",
              backgroundColor: "#fff",
              padding: "25px",
              borderRadius: "12px",
              border: "1px solid #e4e9f2",
              boxShadow: "0 2px 10px rgba(0,0,0,0.03)",
              position: "sticky",
              top: "20px",
            }}
          >
            <h2 style={{ fontSize: "1.3rem", marginBottom: "18px", color: "#101828", borderBottom: "1px solid #f2f4f7", paddingBottom: "10px" }}>
              Order Summary
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "20px" }}>
              {cartItems.map((item) => (
                <div
                  key={item.product._id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: "0.92rem",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    {item.product.image && (
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        style={{ width: "36px", height: "36px", objectFit: "cover", borderRadius: "6px" }}
                      />
                    )}
                    <div>
                      <div style={{ fontWeight: "600", color: "#344054" }}>{item.product.name}</div>
                      <div style={{ color: "#667085", fontSize: "0.82rem" }}>
                        Qty: {item.quantity} × ₹{item.product.price}
                      </div>
                    </div>
                  </div>
                  <div style={{ fontWeight: "650", color: "#101828" }}>
                    ₹{item.product.price * item.quantity}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ borderTop: "1px solid #eaecf0", paddingTop: "15px", display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <span style={{ color: "#667085" }}>Total Items:</span>
              <span style={{ fontWeight: "600" }}>{cartCount}</span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "1.25rem",
                fontWeight: "750",
                color: "#101828",
                borderTop: "1px solid #eaecf0",
                paddingTop: "15px",
                marginTop: "10px",
              }}
            >
              <span>Total Amount:</span>
              <span>₹{calculateSubtotal()}</span>
            </div>

            <div style={{ marginTop: "20px", padding: "10px", backgroundColor: "#f9fafb", borderRadius: "8px", fontSize: "0.8rem", color: "#667085", textAlign: "center" }}>
              🔒 Secured by Razorpay Test Mode Payment
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Checkout;
