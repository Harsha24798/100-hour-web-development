import dotenv from "dotenv";
import express from "express";
import { connectDB } from "./config/db.js";
import productrouter from "./routes/product.route.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.use("/api/products", productrouter);



app.listen(PORT, () => {
  connectDB();
  console.log(`Server is running on port ${PORT}`);
});
