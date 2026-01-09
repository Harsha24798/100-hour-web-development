import Product from "../models/product.model.js";
import mongoose from "mongoose";

export const getAllProducts = async (req, res) => {
  try {
    // Add pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const products = await Product.find({})
      .limit(limit)
      .skip(skip)
      .sort({ createdAt: -1 }); // Newest first

    const total = await Product.countDocuments();

    res.status(200).json({
      success: true,
      data: products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ success: false, message: "Failed to fetch products" });
  }
};

export const createProduct = async (req, res) => {
  const product = req.body;

  if (!product || !product.name || !product.price || !product.image) {
    return res.status(400).json({ success: false, message: "Please provide all product data" });
  }

  // Validate price is a positive number
  const price = parseFloat(product.price);
  if (isNaN(price) || price <= 0) {
    return res.status(400).json({ success: false, message: "Price must be a positive number" });
  }

  // Validate image URL format
  try {
    new URL(product.image);
  } catch (error) {
    return res.status(400).json({ success: false, message: "Invalid image URL" });
  }

  // Sanitize product name (basic XSS prevention)
  const sanitizedName = product.name.replace(/<[^>]*>/g, "").trim();

  const newProduct = new Product({ ...product, name: sanitizedName, price });

  try {
    await newProduct.save();

    res.status(201).json({ success: true, data: newProduct });
  } catch (error) {
    console.error("Error in Create product:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const deleteProduct = async (req, res) => {
  const { id } = req.params;

  // Validate MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: "Invalid product ID" });
  }

  try {
    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const updateProduct = async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  // Validate MongoDB ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ success: false, message: "Invalid product ID" });
  }

  // Validate price if provided
  if (updates.price !== undefined) {
    const price = parseFloat(updates.price);
    if (isNaN(price) || price <= 0) {
      return res.status(400).json({ success: false, message: "Price must be a positive number" });
    }
    updates.price = price;
  }

  // Sanitize name if provided
  if (updates.name) {
    updates.name = updates.name.replace(/<[^>]*>/g, "").trim();
  }

  // Validate image URL if provided
  if (updates.image) {
    try {
      new URL(updates.image);
    } catch (error) {
      return res.status(400).json({ success: false, message: "Invalid image URL" });
    }
  }

  try {
    const updatedProduct = await Product.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!updatedProduct) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    res.status(200).json({ success: true, data: updatedProduct });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
