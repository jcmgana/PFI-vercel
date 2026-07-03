import express from "express";
import {
    createProductService,
    createProductsBulkService,
    getAllProductsService,
    getProductByIdService,
    getProductsByFiltersService,
    updateProductService,
    deleteProductService,

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
                Number(cleanPrice) <= 0 || Number(cleanPrice) > 1000000
            ) {
                return res.status(400).json({
                    error: "El precio debe ser un número válido, mayor a cero y menor o igual a 1.000.000.",
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
        console.error("Detalle completo del error 500:", error);
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

// 4. Crear un lote de productos
export const createProductsBulk = async (req, res) => {
    try {
        const products = req.body;

        // 1. Validación de un array y no vacío
        if (!Array.isArray(products) || products.length === 0) {
            return res.status(400).json({
                error: "El cuerpo de la petición debe ser un array de productos y no estar vacío.",
            });
        }

        // 2. Control de calidad de los productos antes de invocar al servicio
        for (const prod of products) {
            // Validación del nombre
            if (!prod.name || typeof prod.name !== "string" || prod.name.trim() === "") {
                return res.status(400).json({
                    error: "Todos los productos del lote deben incluir un nombre válido.",
                });
            }

            // Validación del precio
            const cleanPrice = typeof prod.price === "string" ? prod.price.trim() : String(prod.price || "");
            const priceNum = Number(cleanPrice);
            if (cleanPrice === "" || isNaN(priceNum) || priceNum <= 0 || priceNum > 1000000) {
                return res.status(400).json({
                    error: `El producto '${prod.name}' tiene un precio inválido (${prod.price}). Debe ser un número mayor a cero y menor o igual a 1.000.000.`,
                });
            }
            prod.price = priceNum;

            // Control estricto de Stock Numérico
            const cleanStock = typeof prod.stock === "string" ? prod.stock.trim() : String(prod.stock ?? "");
            const stockNum = Number(cleanStock);

            // Validamos que no esté vacío, que sea un número real y que no sea negativo
            if (cleanStock === "" || isNaN(stockNum) || stockNum < 0) {
                return res.status(400).json({
                    error: `El producto '${prod.name}' tiene un stock inválido (${prod.stock}). Debe ser un número mayor o igual a cero.`,
                });
            }
            prod.stock = stockNum; // Guardamos el número limpio (acepta enteros o flotantes tipo 1.5)
        }

        // 3. Si las validaciones son superadas, se llama al servicio
        const cantidad = await createProductsBulkService(products);

        return res.status(201).json({
            status: "success",
            message: `Carga masiva completada con éxito. Se agregaron ${cantidad} productos al catálogo.`,
        });
    } catch (error) {
        console.error("Error en el controlador bulk create:", error);
        return res.status(500).json({
            error: "Error interno en el servidor al procesar la carga masiva.",
        });
    }
};

// 5. Actualizar un producto
export const updateProduct = async (req, res) => {
    const id = req.params.id;
    const data = req.body;
    // Validación básica del ID
    if (!id || typeof id !== "string" || id.trim() === "") {
        return res
            .status(400)
            .json({ message: "ID del producto válido es requerido" });
    }
    // Validación del precio
    if (data.price !== undefined) {
        const cleanPrice = typeof data.price === "string" ? data.price.trim() : String(data.price || "");
        const priceNum = Number(cleanPrice);

        if (cleanPrice === "" || isNaN(priceNum) || priceNum <= 0 || priceNum > 1000000) {
            return res.status(400).json({
                error: `Precio inválido (${data.price}). Debe ser un número mayor a cero y menor o igual a 1.000.000.`,
            });
        }
        data.price = priceNum; // Guardamos el número limpio
    }
    // Validación de Stock (si se incluye en la modificación)
    if (data.stock !== undefined) {
        const cleanStock = typeof data.stock === "string" ? data.stock.trim() : String(data.stock ?? "");
        const stockNum = Number(cleanStock);
        if (cleanStock === "" || isNaN(stockNum) || stockNum < 0) {
            return res.status(400).json({
                error: `Stock inválido (${data.stock}). Debe ser un número mayor o igual a cero.`,
            });
        }
        data.stock = stockNum; // Guardamos el número limpio
    }
    try {
        await updateProductService(id, data);
        const successMessage = data.name 
            ? `Producto '${data.name}' (id: ${id}) actualizado correctamente`
            : `Producto con ID: ${id} actualizado correctamente`;

        res.status(200).json({ message: successMessage });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error al actualizar el producto" });
    }
};

// 6. Eliminar un producto
export const deleteProduct = async (req, res) => {
    const id = req.params.id;
    try {
        await deleteProductService(id);
        return res
            .status(200)
            .json({ message: `Producto id: ${id} eliminado correctamente` });
    } catch (error) {
        return res
            .status(500)
            .json({ message: "Error al eliminar el producto" });
    }
};