import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerCustomer } from "../services/api.js";

const initialForm = { fullName: "", email: "", password: "", phone: "" };

const Register = () => {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const handleChange = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    if (Object.values(form).some((value) => !value.trim())) return setError("All fields are required.");
    if (form.password.length < 6) return setError("Password must be at least 6 characters long.");
    try {
      setIsSubmitting(true);
      await registerCustomer(form);
      navigate("/login", { replace: true, state: { message: "Account created. Please log in." } });
    } catch (requestError) {
      setError(requestError.message);
    } finally { setIsSubmitting(false); }
  };

  return <main className="auth-layout"><section className="auth-card" aria-labelledby="register-title">
    <p className="eyebrow">Join ShopKart</p><h1 id="register-title">Create your account</h1><p className="muted">Everything you need for a smoother shopping experience.</p>
    <form onSubmit={handleSubmit} noValidate>
      <label htmlFor="fullName">Full name</label><input id="fullName" name="fullName" value={form.fullName} onChange={handleChange} autoComplete="name" />
      <label htmlFor="email">Email address</label><input id="email" name="email" type="email" value={form.email} onChange={handleChange} autoComplete="email" />
      <label htmlFor="phone">Phone number</label><input id="phone" name="phone" type="tel" value={form.phone} onChange={handleChange} autoComplete="tel" />
      <label htmlFor="password">Password</label><input id="password" name="password" type="password" value={form.password} onChange={handleChange} autoComplete="new-password" />
      {error && <p className="form-error" role="alert">{error}</p>}
      <button className="primary-button" type="submit" disabled={isSubmitting}>{isSubmitting ? "Creating account..." : "Create account"}</button>
    </form><p className="form-footer">Already have an account? <Link to="/login">Log in</Link></p>
  </section></main>;
};

export default Register;
