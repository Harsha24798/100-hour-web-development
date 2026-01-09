import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    image: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Add indexes for better query performance
productSchema.index({ createdAt: -1 });
productSchema.index({ name: "text" }); // For text search

const Product = mongoose.model("Product", productSchema);

export default Product;
