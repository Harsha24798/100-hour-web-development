import request from "supertest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../app.js";
import Product from "../models/product.model.js";

let mongoServer;

// Setup - runs before all tests
beforeAll(async () => {
  // Create in-memory MongoDB instance
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  await mongoose.connect(mongoUri);
});

// Teardown - runs after all tests
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// Clear database between tests
afterEach(async () => {
  await Product.deleteMany({});
});

describe("Product API Tests", () => {
  // Test data
  const validProduct = {
    name: "Test Product",
    price: 29.99,
    image: "https://example.com/image.jpg",
  };

  describe("POST /api/products", () => {
    it("should create a new product with valid data", async () => {
      const res = await request(app)
        .post("/api/products")
        .send(validProduct)
        .expect(201);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty("_id");
      expect(res.body.data.name).toBe(validProduct.name);
      expect(res.body.data.price).toBe(validProduct.price);
    });

    it("should reject product without name", async () => {
      const invalidProduct = { price: 29.99, image: "https://example.com/image.jpg" };
      
      const res = await request(app)
        .post("/api/products")
        .send(invalidProduct)
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("all product data");
    });

    it("should reject product with invalid price", async () => {
      const invalidProduct = { ...validProduct, price: -10 };
      
      const res = await request(app)
        .post("/api/products")
        .send(invalidProduct)
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("positive number");
    });

    it("should reject product with invalid image URL", async () => {
      const invalidProduct = { ...validProduct, image: "not-a-url" };
      
      const res = await request(app)
        .post("/api/products")
        .send(invalidProduct)
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("Invalid image URL");
    });

    it("should reject product with string price", async () => {
      const invalidProduct = { ...validProduct, price: "abc" };
      
      const res = await request(app)
        .post("/api/products")
        .send(invalidProduct)
        .expect(400);

      expect(res.body.success).toBe(false);
    });
  });

  describe("GET /api/products", () => {
    it("should return empty array when no products exist", async () => {
      const res = await request(app)
        .get("/api/products")
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual([]);
    });

    it("should return all products", async () => {
      // Create test products
      await Product.create([
        { name: "Product 1", price: 10, image: "https://example.com/1.jpg" },
        { name: "Product 2", price: 20, image: "https://example.com/2.jpg" },
      ]);

      const res = await request(app)
        .get("/api/products")
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(2);
      expect(res.body.data[0].name).toBe("Product 1");
      expect(res.body.data[1].name).toBe("Product 2");
    });
  });

  describe("PUT /api/products/:id", () => {
    it("should update an existing product", async () => {
      const product = await Product.create(validProduct);
      const updates = { name: "Updated Product", price: 39.99 };

      const res = await request(app)
        .put(`/api/products/${product._id}`)
        .send(updates)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe(updates.name);
      expect(res.body.data.price).toBe(updates.price);
      expect(res.body.data.image).toBe(validProduct.image); // Should remain unchanged
    });

    it("should reject update with invalid product ID", async () => {
      const res = await request(app)
        .put("/api/products/invalid-id")
        .send({ name: "Updated" })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("Invalid product ID");
    });

    it("should return 404 for non-existent product", async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .put(`/api/products/${fakeId}`)
        .send({ name: "Updated" })
        .expect(404);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("not found");
    });

    it("should reject update with invalid price", async () => {
      const product = await Product.create(validProduct);

      const res = await request(app)
        .put(`/api/products/${product._id}`)
        .send({ price: -50 })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("positive number");
    });

    it("should reject update with invalid image URL", async () => {
      const product = await Product.create(validProduct);

      const res = await request(app)
        .put(`/api/products/${product._id}`)
        .send({ image: "not-a-valid-url" })
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("Invalid image URL");
    });
  });

  describe("DELETE /api/products/:id", () => {
    it("should delete an existing product", async () => {
      const product = await Product.create(validProduct);

      const res = await request(app)
        .delete(`/api/products/${product._id}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain("deleted successfully");

      // Verify product was deleted
      const deletedProduct = await Product.findById(product._id);
      expect(deletedProduct).toBeNull();
    });

    it("should reject delete with invalid product ID", async () => {
      const res = await request(app)
        .delete("/api/products/invalid-id")
        .expect(400);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("Invalid product ID");
    });

    it("should return 404 for non-existent product", async () => {
      const fakeId = new mongoose.Types.ObjectId();

      const res = await request(app)
        .delete(`/api/products/${fakeId}`)
        .expect(404);

      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("not found");
    });
  });

  describe("Edge Cases & Security", () => {
    it("should handle very long product names", async () => {
      const longName = "A".repeat(300);
      const product = { ...validProduct, name: longName };

      const res = await request(app)
        .post("/api/products")
        .send(product)
        .expect(400); // Should fail due to maxlength validation

      expect(res.body.success).toBe(false);
    });

    it("should handle concurrent requests", async () => {
      const requests = Array(5).fill(null).map((_, i) => 
        request(app)
          .post("/api/products")
          .send({ ...validProduct, name: `Product ${i}` })
      );

      const responses = await Promise.all(requests);
      
      responses.forEach(res => {
        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
      });

      const products = await Product.find({});
      expect(products).toHaveLength(5);
    });

    it("should sanitize XSS attempts in product name", async () => {
      const xssProduct = {
        ...validProduct,
        name: "<script>alert('xss')</script>",
      };

      const res = await request(app)
        .post("/api/products")
        .send(xssProduct)
        .expect(201);

      expect(res.body.data.name).toBe(xssProduct.name); // Should be stored as-is
      // Note: In production, add sanitization middleware
    });
  });
});
