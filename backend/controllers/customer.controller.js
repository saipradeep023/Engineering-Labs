import Customer from "../models/customer.model.js";
import generateToken from "../utils/generateToken.js";

const COOKIE_NAME = "token";
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

const cookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: COOKIE_MAX_AGE,
});

const customerResponse = (customer) => ({
  _id: customer._id,
  fullName: customer.fullName,
  email: customer.email,
  phone: customer.phone,
});

const registerCustomer = async (req, res, next) => {
  try {
    const { fullName, email, password, phone } = req.body || {};

    if (![fullName, email, password, phone].every((value) => typeof value === "string" && value.trim())) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters long" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingCustomer = await Customer.findOne({ email: normalizedEmail });
    if (existingCustomer) {
      return res.status(409).json({ success: false, message: "Email already exists" });
    }

    const customer = await Customer.create({
      fullName: fullName.trim(),
      email: normalizedEmail,
      password,
      phone: phone.trim(),
    });

    return res.status(201).json({
      success: true,
      message: "Customer registered successfully",
      customer: customerResponse(customer),
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: "Email already exists" });
    }
    return next(error);
  }
};

const loginCustomer = async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (typeof email !== "string" || typeof password !== "string") {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const customer = await Customer.findOne({ email: email.trim().toLowerCase() });
    const passwordMatches = customer && (await customer.comparePassword(password));
    if (!passwordMatches) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    const token = generateToken(customer._id.toString());
    res.cookie(COOKIE_NAME, token, cookieOptions());
    return res.status(200).json({
      success: true,
      message: "Login successful",
      customer: customerResponse(customer),
    });
  } catch (error) {
    return next(error);
  }
};

const getMyProfile = (req, res) => res.status(200).json(customerResponse(req.user));

const logoutCustomer = (_req, res) => {
  const { maxAge, ...clearOptions } = cookieOptions();
  res.clearCookie(COOKIE_NAME, clearOptions);
  return res.status(200).json({ success: true, message: "Logged out successfully" });
};

const changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body || {};
    if (typeof oldPassword !== "string" || typeof newPassword !== "string") {
      return res.status(400).json({ success: false, message: "Old and new passwords are required" });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: "New password must be at least 6 characters long" });
    }
    if (!(await req.user.comparePassword(oldPassword))) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    req.user.password = newPassword;
    await req.user.save();
    return res.status(200).json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    return next(error);
  }
};

export {
  registerCustomer,
  loginCustomer,
  getMyProfile,
  logoutCustomer,
  changePassword,
};
