import express from "express";
import {
    createProductService,
    getAllProductsService,
    getProductByIdService,
    getProductsByFiltersService,
    updateProductService,
    deleteProductService
} from "../services/products.service.js";

// 1. Obtener todos los productos, o con filtro.
export const getAllProducts = async (req, res) => {
    try {
        const categoryQuery = req.query.category;
        const priceQuery = req.query.price;

        if (categoryQuery === undefined && priceQuery === undefined) {
            const products = await getAllProductsService();
            return res.status(200).json(products);
        }

        const filtrosActivos = {};

        if (priceQuery !== undefined) {
            const cleanPrice = typeof priceQuery === "string" ? priceQuery.trim() : "";
            if (
                cleanPrice === "" ||
                isNaN(Number(cleanPrice)) ||
                Number(cleanPrice) <= 0
            ) {
                return res.status(400).json({
                    error: "El precio debe ser un número válido y mayor a cero.",
                });
            }
            filtrosActivos.price = Number(cleanPrice);
        }

        if (categoryQuery !== undefined) {
            if (
                typeof categoryQuery !== "string" ||
                categoryQuery.trim() === ""
            ) {
                return res
                    .status(400)
                    .json({ error: "La categoría provista no es válida." });
            }

            if (categoryQuery.length > 30) {
                return res.status(400).json({
                    error: "Bad Request",
                    mensaje: "El nombre de la categoría es demasiado largo (máximo 30 caracteres).",
                });
            }

            filtrosActivos.category = categoryQuery.trim().toLowerCase();
        }

        // 📝 ✅ Se eliminó el caracter 'á;' que estaba suelto acá.

        const products = await getProductsByFiltersService(filtrosActivos);

        if (products.length === 0) {
            return res.status(404).json({
                error: "No se encontraron productos con esos filtros.",
            });
        }

        return res.status(200).json({
            criterioBusqueda: {
                categoria: categoryQuery || null,
                precio: filtrosActivos.price || null,
            },
            resultadosEncontrados: products.length,
            productos: products,
        });
    } catch (error) {
        console.error("🔥 DETALLE COMPLETO DEL ERROR 500:", error);
        return res.status(500).json({ error: "Error interno del servidor" });
    }
};

// 2. Obtener producto específico (Adaptado a IDs de Firestore)
export const getProductById = async (req, res) => {
    try {
        const id = req.params.id; 

        // Validamos que el ID no venga vacío o sea algo raro
        if (!id || typeof id !== "string" || id.trim() === "") {
            return res.status(400).json({
                error: "Bad Request",
                mensaje: "El ID del producto provisto no es válido.",
            });
        }

        const product = await getProductByIdService(id);

        if (product) {
            return res.status(200).json(product);
        } else {
            return res.status(404).json({ message: "Producto no encontrado." });
        }
    } catch (error) {
        console.error("Error en getProductById:", error.message);
        return res.status(500).json({ error: "Error al obtener el producto." });
    }
};

// 3. Crear un producto
export const createProduct = async (req, res) => {
    const producto = req.body;
    if (!producto || !producto.name) {
        return res
            .status(400)
            .json({ message: "Información del producto inválida" });
    }
    try {
        const id = await createProductService(producto);
        producto.id = id; 
        return res.status(201).json(producto); 
    } catch (error) {
        return res.status(500).json({ message: "Error al crear el producto" });
    }
};

// 4. Actualizar un producto
export const updateProduct = async (req, res) => {
    const id = req.params.id;
    const data = req.body;

    if (!id || typeof id !== "string" || id.trim() === "") {
        return res
            .status(400)
            .json({ message: "ID del producto válido es requerido" });
    }

    try {
        await updateProductService(id, data);
        res.status(200).json({ message: "Producto actualizado correctamente" });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error al actualizar el producto" });
    }
};

// 5. Eliminar un producto
export const deleteProduct = async (req, res) => {
    const id = req.params.id;
    try {
        await deleteProductService(id);
        return res
            .status(200)
            .json({ message: "Producto eliminado correctamente" });
    } catch (error) {
        return res
            .status(500)
            .json({ message: "Error al eliminar el producto" });
    }
};