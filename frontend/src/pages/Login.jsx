import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { loginCustomer } from "../services/api.js";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const handleChange = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const handleSubmit = async (event) => {
    event.preventDefault(); setError("");
    if (!form.email.trim() || !form.password) return setError("Email and password are required.");
    try { setIsSubmitting(true); await loginCustomer(form); navigate("/home", { replace: true }); }
    catch (_requestError) { setError("Invalid credentials"); }
    finally { setIsSubmitting(false); }
  };

  return <main className="auth-layout"><section className="auth-card" aria-labelledby="login-title">
    <p className="eyebrow">Welcome back</p><h1 id="login-title">Log in to ShopKart</h1><p className="muted">Enter your details to continue shopping.</p>
    {location.state?.message && <p className="form-success" role="status">{location.state.message}</p>}
    <form onSubmit={handleSubmit} noValidate>
      <label htmlFor="email">Email address</label><input id="email" name="email" type="email" value={form.email} onChange={handleChange} autoComplete="email" />
      <label htmlFor="password">Password</label><input id="password" name="password" type="password" value={form.password} onChange={handleChange} autoComplete="current-password" />
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="primary-button" type="submit" disabled={isSubmitting}>{isSubmitting ? "Logging in..." : "Log in"}</button>
    </form><p className="form-footer">New to ShopKart? <Link to="/register">Create an account</Link></p>
  </section></main>;
};

export default Login;
