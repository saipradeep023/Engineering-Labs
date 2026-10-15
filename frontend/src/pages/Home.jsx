import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import { getCurrentCustomer, logoutCustomer } from "../services/api.js";

const Home = () => {
  const [customer, setCustomer] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    let isMounted = true;
    getCurrentCustomer().then((data) => isMounted && setCustomer(data)).catch(() => isMounted && navigate("/login", { replace: true }));
    return () => { isMounted = false; };
  }, [navigate]);
  const handleLogout = async () => { try { setIsLoggingOut(true); await logoutCustomer(); } finally { navigate("/login", { replace: true }); } };
  if (!customer) return <main className="loading-page">Checking your account...</main>;
  return <><Navbar onLogout={handleLogout} isLoggingOut={isLoggingOut} />
    <main className="home-layout"><section className="welcome-panel"><p className="eyebrow">Your account</p><h1>Welcome back, {customer.fullName.split(" ")[0]}.</h1><p>Your ShopKart account is ready. Here are the details we have on file.</p></section>
      <section className="profile-card" aria-labelledby="profile-title"><h2 id="profile-title">Customer profile</h2><dl>
        <div><dt>Full name</dt><dd>{customer.fullName}</dd></div><div><dt>Email</dt><dd>{customer.email}</dd></div><div><dt>Phone number</dt><dd>{customer.phone}</dd></div>
      </dl></section></main></>;
};

export default Home;
