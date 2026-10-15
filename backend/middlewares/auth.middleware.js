import jwt from "jsonwebtoken";
import Customer from "../models/customer.model.js";

const protect = async (req, res, next) => {
  const token = req.cookies.token;

  if (!token || !process.env.JWT_SECRET) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const customer = await Customer.findById(decoded.id);

    if (!customer) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    req.user = customer;
    return next();
  } catch (_error) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
};

export default protect;
