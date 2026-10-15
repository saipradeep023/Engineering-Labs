import Product from "../models/product.model.js";

// @route   POST /products
// @desc    Create a new product
// @access  Public (for now)
export const createProduct = async (req, res, next) => {
  try {
    const { name, description, price, category, image, stock } = req.body;

    const product = new Product({
      name,
      description,
      price,
      category,
      image,
      stock,
    });

    const savedProduct = await product.save();

    res.status(201).json({
      success: true,
      product: savedProduct,
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /products
// @desc    Get all products (with optional search and category filters, and sorting)
// @access  Public
export const getProducts = async (req, res, next) => {
  try {
    const { search, category, sort } = req.query;

    const query = {};

    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    if (category) {
      query.category = category;
    }

    let productQuery = Product.find(query);

    // Bonus: Implement sorting
    if (sort) {
      if (sort === "price_asc") {
        productQuery = productQuery.sort({ price: 1 });
      } else if (sort === "price_desc") {
        productQuery = productQuery.sort({ price: -1 });
      }
    } else {
      // Default sort by newest if no sort provided
      productQuery = productQuery.sort({ createdAt: -1 });
    }

    const products = await productQuery;

    res.status(200).json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    next(error);
  }
};

// @route   GET /products/:id
// @desc    Get a single product by ID
// @access  Public
export const getProductById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    res.status(200).json({
      success: true,
      product,
    });
  } catch (error) {
    // If id is invalid format, mongoose throws CastError which is handled nicely if we catch it, or send as 400
    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }
    next(error);
  }
};
