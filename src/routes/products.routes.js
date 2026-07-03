import express from "express";
import { createProduct, getAllProducts, getProductById, updateProduct, deleteProduct } from "../controllers/products.controller.js";
import { authentication } from "../middleware/authentication.js"

const productsRouter = express.Router();

productsRouter.get("/products", getAllProducts);

productsRouter.get("/products/:id", getProductById);

productsRouter.post("/products/create", authentication, createProduct)

productsRouter.put("/products/:id", authentication, updateProduct);

productsRouter.delete("/products/:id", authentication, deleteProduct)

export default productsRouter;
