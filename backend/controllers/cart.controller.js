import Customer from "../models/customer.model.js";
import Product from "../models/product.model.js";

// @route   POST /cart/:productId
// @desc    Add a product to the cart or increment quantity
// @access  Protected
export const addToCart = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    const customer = await Customer.findById(userId);
    const cartItemIndex = customer.cart.findIndex(item => item.product.toString() === productId);

    if (cartItemIndex > -1) {
      // Product already in cart, increment quantity
      const newQuantity = customer.cart[cartItemIndex].quantity + 1;
      
      if (newQuantity > product.stock) {
        return res.status(400).json({ success: false, message: "Cannot exceed available stock" });
      }
      
      customer.cart[cartItemIndex].quantity = newQuantity;
    } else {
      // Product not in cart, add it
      if (product.stock < 1) {
        return res.status(400).json({ success: false, message: "Product is out of stock" });
      }
      customer.cart.push({ product: productId, quantity: 1 });
    }

    await customer.save();

    // Populate for the response
    await customer.populate({
      path: "cart.product",
      select: "name price image stock category",
    });

    res.status(201).json({
      success: true,
      message: "Cart updated",
      cart: customer.cart,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }
    next(error);
  }
};

// @route   GET /cart
// @desc    Get the current user's cart
// @access  Protected
export const getCart = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const customer = await Customer.findById(userId).populate({
      path: "cart.product",
      select: "name price image stock category",
    });

    res.status(200).json({
      success: true,
      cart: customer.cart,
    });
  } catch (error) {
    next(error);
  }
};

// @route   PATCH /cart/:productId
// @desc    Update product quantity in the cart
// @access  Protected
export const updateCartQuantity = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    const userId = req.user._id;

    if (typeof quantity !== "number" || quantity < 1) {
      return res.status(400).json({ success: false, message: "Quantity must be a number at least 1" });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: "Product not found" });
    }

    if (quantity > product.stock) {
      return res.status(400).json({ success: false, message: "Cannot exceed available stock" });
    }

    const customer = await Customer.findById(userId);
    const cartItemIndex = customer.cart.findIndex(item => item.product.toString() === productId);

    if (cartItemIndex === -1) {
      return res.status(404).json({ success: false, message: "Product not found in cart" });
    }

    customer.cart[cartItemIndex].quantity = quantity;
    await customer.save();

    await customer.populate({
      path: "cart.product",
      select: "name price image stock category",
    });

    res.status(200).json({
      success: true,
      message: "Cart quantity updated",
      cart: customer.cart,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }
    next(error);
  }
};

// @route   DELETE /cart/:productId
// @desc    Remove a product from the cart
// @access  Protected
export const removeFromCart = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const userId = req.user._id;

    const customer = await Customer.findById(userId);

    customer.cart = customer.cart.filter(item => item.product.toString() !== productId);
    await customer.save();

    await customer.populate({
      path: "cart.product",
      select: "name price image stock category",
    });

    res.status(200).json({
      success: true,
      message: "Product removed from cart",
      cart: customer.cart,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid product ID" });
    }
    next(error);
  }
};
