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
import { parseSafePrice, parseSafeStock, validateRequiredString } from "../utils/validators.js";

// 1. Obtener todos los productos, o con filtro.
export const getAllProducts = async (req, res) => {
    try {
        const categoryQuery = req.query.category;
        const priceQuery = req.query.price;
        // Si no hay filtros, vienen todos los productos
        if (categoryQuery === undefined && priceQuery === undefined) {
            const products = await getAllProductsService();
            return res.status(200).json({
                enInventario: products.length,
                productos: products
            });
        }

        const filtrosActivos = {};
        // Validación del precio
        if (priceQuery !== undefined) {
            const validatedPrice = parseSafePrice(priceQuery);
            if (validatedPrice === null) {
                return res.status(400).json({
                    error: "El precio debe ser un número válido, mayor a cero y menor o igual a 1.000.000.",
                });
            }
            filtrosActivos.price = validatedPrice;
        }

        if (categoryQuery !== undefined) {
            const cleanCategory = validateRequiredString(categoryQuery);
            if (!cleanCategory) {
                return res.status(400).json({ error: "La categoría provista no es válida." });
            }

            if (cleanCategory.length > 30) {
                return res.status(400).json({
                    error: "Bad Request",
                    mensaje:
                        "El nombre de la categoría es demasiado largo (máximo 30 caracteres).",
                });
            }

            filtrosActivos.category = cleanCategory.toLowerCase();
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
        if (!validateRequiredString(id)) {
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
    const data = req.body;

    // 1. Validar Nombre
    if (!validateRequiredString(data.name)) {
        return res
            .status(400)
            .json({
                message:
                    "El nombre del producto es requerido y debe ser válido.",
            });
    }

    // 2. Validar y parsear Precio
    const validatedPrice = parseSafePrice(data.price);
    if (validatedPrice === null) {
        return res
            .status(400)
            .json({
                message:
                    "Precio inválido. Debe ser un número mayor a cero y menor a 1.000.000.",
            });
    }
    data.price = validatedPrice;

    // 3. Validar y parsear Stock
    const validatedStock = parseSafeStock(data.stock);
    if (validatedStock === null) {
        return res
            .status(400)
            .json({
                message:
                    "Stock inválido. Debe ser un número mayor o igual a cero, y menor a 1.000.000. ",
            });
    }
    data.stock = validatedStock;

    try {
        const newProduct = await createProductService(data);
        res.status(201).json({
            message: "Producto creado con éxito",
            data: newProduct,
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error al crear el producto" });
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
            if (!validateRequiredString(prod.name)) {
                return res.status(400).json({
                    error: "Todos los productos del lote deben incluir un nombre válido.",
                });
            }

            // Validación del precio
            const validatedPrice = parseSafePrice(prod.price);
            if (validatedPrice === null) {
                return res.status(400).json({
                    error: `El producto '${prod.name}' tiene un precio inválido (${prod.price}). Debe ser un número mayor a cero y menor o igual a 1.000.000.`,
                });
            }
            prod.price = validatedPrice; // Asignamos el precio limpio

            // Validación del stock
            const validatedStock = parseSafeStock(prod.stock);
            if (validatedStock === null) {
                return res.status(400).json({
                    error: `El producto '${prod.name}' tiene un stock inválido (${prod.stock}). Debe ser un número mayor o igual a cero, y menor a 1.000.000. `,
                });
            }
            prod.stock = validatedStock; // Asignamos el stock limpio
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
    if (!validateRequiredString(id)) {
        return res
            .status(400)
            .json({ message: "ID del producto válido es requerido" });
    }
    // Validación del precio
    if (data.price !== undefined) {
        const validatedPrice = parseSafePrice(data.price);
        if (validatedPrice === null) {
            return res.status(400).json({
                error: `Precio inválido (${data.price}). Debe ser un número mayor a cero y menor o igual a 1.000.000.`,
            });
        }
        data.price = validatedPrice;
    }
    // Validación de Stock (si se incluye en la modificación)
    if (data.stock !== undefined) {
        const validatedStock = parseSafeStock(data.stock);
        if (validatedStock === null) {
            return res.status(400).json({
                error: `Stock inválido (${data.stock}). Debe ser un número mayor o igual a cero, y menor a 1.000.000.`,
            });
        }
        data.stock = validatedStock;
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
    if (!validateRequiredString(id)) {
        return res
            .status(400)
            .json({ message: "ID del producto válido es requerido." });
    }
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
