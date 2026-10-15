import Customer from "../models/customer.model.js";
import Product from "../models/product.model.js";

// @route   POST /wishlist/:productId
// @desc    Add a product to the authenticated user's wishlist
// @access  Protected
export const addToWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const customer = await Customer.findById(userId);
    
    // Check if already in wishlist
    if (customer.wishlist.includes(productId)) {
      return res.status(409).json({ success: false, message: "Product already in wishlist" });
    }

    customer.wishlist.push(productId);
    await customer.save();

    res.status(201).json({
      success: true,
      message: "Product added to wishlist",
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }
    next(error);
  }
};

// @route   GET /wishlist
// @desc    Get the current user's wishlist
// @access  Protected
export const getWishlist = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const customer = await Customer.findById(userId).populate({
      path: "wishlist",
      select: "name price category image stock",
    });

    res.status(200).json({
      success: true,
      count: customer.wishlist.length,
      wishlist: customer.wishlist,
    });
  } catch (error) {
    next(error);
  }
};

// @route   DELETE /wishlist/:productId
// @desc    Remove a product from the wishlist
// @access  Protected
export const removeFromWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id;

    const customer = await Customer.findById(userId);

    // Check if product is in wishlist
    if (!customer.wishlist.includes(productId)) {
      return res.status(404).json({ success: false, message: "Product not found in wishlist" });
    }

    customer.wishlist = customer.wishlist.filter((id) => id.toString() !== productId);
    await customer.save();

    res.status(200).json({
      success: true,
      message: "Product removed from wishlist",
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }
    next(error);
  }
};

// @route   PATCH /wishlist/:productId/toggle
// @desc    Toggle a product in the wishlist (Add if missing, Remove if present)
// @access  Protected
export const toggleWishlist = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const customer = await Customer.findById(userId);
    const isInWishlist = customer.wishlist.includes(productId);

    if (isInWishlist) {
      customer.wishlist = customer.wishlist.filter((id) => id.toString() !== productId);
    } else {
      customer.wishlist.push(productId);
    }

    await customer.save();

    res.status(200).json({
      success: true,
      saved: !isInWishlist,
      message: !isInWishlist ? "Product added to wishlist" : "Product removed from wishlist",
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }
    next(error);
  }
};
