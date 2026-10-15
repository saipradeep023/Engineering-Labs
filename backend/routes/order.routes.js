import express from "express";
import protect from "../middlewares/auth.middleware.js";
import {
  createPaymentOrder,
  verifyPayment,
  getOrders,
  getOrderById,
} from "../controllers/order.controller.js";

const router = express.Router();

router.post("/create-payment-order", protect, createPaymentOrder);
router.post("/verify-payment", protect, verifyPayment);
router.get("/", protect, getOrders);
router.get("/:id", protect, getOrderById);

export default router;
