import express from "express";
import { createProduct, getAllProducts, getProductById, updateProduct, deleteProduct } from "../controllers/products.controller.js";
import { authentication } from "../middleware/authentication.js"

const productsRouter = express.Router();

productsRouter.get("/api/products", getAllProducts);

productsRouter.get("/api/products/:id", getProductById);

productsRouter.post("/api/products/create", authentication, createProduct)

productsRouter.put("/api/products/:id", authentication, updateProduct);

productsRouter.delete("/api/products/:id", authentication, deleteProduct)

export default productsRouter;
