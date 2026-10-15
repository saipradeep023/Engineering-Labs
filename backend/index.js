import dns from "node:dns";
import { pathToFileURL } from "node:url";
import express from "express";
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import customerRoutes from "./routes/customer.routes.js";
import productRoutes from "./routes/product.routes.js";
import wishlistRoutes from "./routes/wishlist.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import orderRoutes from "./routes/order.routes.js";

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const app = express();
const frontendOrigin = process.env.FRONTEND_ORIGIN || "http://localhost:5173";

app.use((req, res, next) => {
  if (req.headers.origin === frontendOrigin) {
    res.setHeader("Access-Control-Allow-Origin", frontendOrigin);
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Vary", "Origin");
  }

  if (req.method === "OPTIONS") return res.sendStatus(204);
  return next();
});
app.use(express.json());
app.use(cookieParser());

app.get("/", (_req, res) => res.status(200).json({ success: true, message: "ShopKart API is running" }));
app.use("/customers", customerRoutes);
app.use("/products", productRoutes);
app.use("/wishlist", wishlistRoutes);
app.use("/cart", cartRoutes);
app.use("/orders", orderRoutes);

app.use((_req, res) => res.status(404).json({ success: false, message: "Route not found" }));

app.use((error, _req, res, _next) => {
  if (error.name === "ValidationError") {
    return res.status(400).json({ success: false, message: error.message });
  }

  console.error(error);
  return res.status(500).json({ success: false, message: "Internal server error" });
});

const startServer = async () => {
  if (!process.env.MONGODB_URI || !process.env.JWT_SECRET) {
    throw new Error("MONGODB_URI and JWT_SECRET must be set in .env");
  }

  await mongoose.connect(process.env.MONGODB_URI);
  const port = Number(process.env.PORT) || 5000;
  app.listen(port, () => console.log(`ShopKart API listening on port ${port}`));
};

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  startServer().catch((error) => {
    console.error(`Unable to start ShopKart API: ${error.message}`);
    process.exit(1);
  });
}

export { app, startServer };
