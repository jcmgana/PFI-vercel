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
import {
    parseSafePrice,
    parseSafeStock,
    validateRequiredString,
    parseSafeCategory,
} from "../utils/validators.js";

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
                productos: products,
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
        // Validación de categoría
        if (categoryQuery !== undefined) {
            const validatedCategory = parseSafeCategory(categoryQuery);
            if (validatedCategory === null) {
                return res.status(400).json({
                    error: "La categoría provista no es válida o supera el máximo de 30 caracteres.",
                });
            }
            filtrosActivos.category = validatedCategory;
        }

        const products = await getProductsByFiltersService(filtrosActivos);

        if (products.length === 0) {
            return res.status(404).json({
                status: "error",
                message:
                    "No se encontraron productos con esos criterios de búsqueda.",
            });
        }

        return res.status(200).json({
            status: "success",
            criterioBusqueda: {
                categoria: filtrosActivos.category || null,
                precio: filtrosActivos.price || null,
            },
            resultadosEncontrados: products.length,
            productos: products,
        });
    } catch (error) {
        console.error("Error en getAllProducts:", error.message);
        return res.status(500).json({
            status: "error",
            message: "Error al obtener los productos.",
        });
    }
};

// 2. Obtener producto específico (Adaptado a IDs de Firestore)
export const getProductById = async (req, res) => {
    try {
        const id = req.params.id;

        // Validamos que el ID no venga vacío o sea algo raro
        if (!validateRequiredString(id)) {
            return res.status(400).json({
                status: "error",
                message: "El ID del producto provisto no es válido.",
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

    if (!validateRequiredString(data.name)) {
        return res.status(400).json({
            status: "error",
            message: "El nombre del producto es requerido.",
        });
    }

    const validatedPrice = parseSafePrice(data.price);
    if (validatedPrice === null) {
        return res.status(400).json({
            status: "error",
            message:
                "Precio inválido. Debe ser un número mayor a cero y menor o igual a 1.000.000.",
        });
    }

    const validatedStock = parseSafeStock(data.stock);
    if (validatedStock === null) {
        return res.status(400).json({
            status: "error",
            message: "Stock inválido. Debe ser un entero entre 0 y 1.000.000.",
        });
    }

    const validatedCategory = parseSafeCategory(data.category);
    if (validatedCategory === null) {
        return res.status(400).json({
            status: "error",
            message:
                "Categoría requerida. Debe ser un texto válido de máximo 30 caracteres.",
        });
    }

    const cleanProduct = sanitizeProductData({
        name: data.name,
        price: validatedPrice,
        stock: validatedStock,
        category: validatedCategory,
    });

    try {
        const newProduct = await createProductService(cleanProduct);
        res.status(201).json({
            status: "success",
            message: "Producto creado con éxito",
            data: newProduct,
        });
    } catch (error) {
        console.error("Fallo crítico en createproduct:", error);
        res.status(500).json({
            status: "error",
            message: "Error interno del servidor al crear el producto",
        });
    }
};

// 4. Crear un lote de productos
export const createProductsBulk = async (req, res) => {
    const products = req.body;

    if (!Array.isArray(products) || products.length === 0) {
        return res.status(400).json({
            status: "error",
            message:
                "Se requiere un lote de productos en formato de array no vacío.",
        });
    }

    const sanitizedBatch = [];

    // Control de calidad estricto antes de impactar el servicio
    for (const prod of products) {
        if (!validateRequiredString(prod.name)) {
            return res.status(400).json({
                status: "error",
                message:
                    "Todos los productos del lote deben incluir un nombre válido.",
            });
        }

        const validatedPrice = parseSafePrice(prod.price);
        if (validatedPrice === null) {
            return res.status(400).json({
                status: "error",
                message: `El producto '${prod.name}' tiene un precio inválido (${prod.price}).`,
            });
        }

        const validatedStock = parseSafeStock(prod.stock);
        if (validatedStock === null) {
            return res.status(400).json({
                status: "error",
                message: `El producto '${prod.name}' tiene un stock inválido (${prod.stock}).`,
            });
        }

        const validatedCategory = parseSafeCategory(prod.category);
        if (validatedCategory === null) {
            return res.status(400).json({
                status: "error",
                message: `El producto '${prod.name}' tiene una categoría inválida.`,
            });
        }

        // Sanitizamos y extraemos solo las propiedades oficiales (Puntos 1 y 3)
        const cleanProd = sanitizeProductData({
            name: prod.name,
            price: validatedPrice,
            stock: validatedStock,
            category: validatedCategory,
        });

        sanitizedBatch.push(cleanProd);
    }

    try {
        const result = await createProductsBulkService(sanitizedBatch);
        return res.status(201).json({
            status: "success",
            message: `${result.length} productos insertados masivamente con éxito.`,
            productos: result,
        });
    } catch (error) {
        console.error("❌ Fallo crítico en createProductsBulk:", error);
        return res.status(500).json({
            status: "error",
            message: "Error interno del servidor en la carga masiva.",
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
            .json({ status: "error", message: "El ID provisto no es válido." });
    }

    const fieldsToUpdate = {};
    if (data.name !== undefined) {
        return res.status(400).json({
            status: "error",
            message: "El nombre provisto no es válido.",
        });
    }
    fieldsToUpdate.name = data.name.trim();

    // Validación del precio
    if (data.price !== undefined) {
        const validatedPrice = parseSafePrice(data.price);
        if (validatedPrice === null) {
            return res.status(400).json({
                status: "error",
                message: "Precio inválido para actualización.",
            });
        }
        fieldsToUpdate.price = validatedPrice;
    }
    // Validación de Stock (si se incluye en la modificación)
    if (data.stock !== undefined) {
        const validatedStock = parseSafeStock(data.stock);
        if (validatedStock === null) {
            return res.status(400).json({
                status: "error",
                message: "Stock inválido para actualización.",
            });
        }
        fieldsToUpdate.stock = validatedStock;
    }
    // Validación de Categoría (si se incluye en la modificación)
    if (data.category !== undefined) {
        const validatedCategory = parseSafeCategory(data.category);
        if (validatedCategory === null) {
            return res.status(400).json({
                status: "error",
                message: "Categoría inválida para actualización.",
            });
        }
        fieldsToUpdate.category = validatedCategory;
    }
    if (Object.keys(fieldsToUpdate).length === 0) {
        return res.status(400).json({
            status: "error",
            message: "No se enviaron campos válidos para actualizar.",
        });
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
        return res.status(400).json({
            status: "error",
            message: "ID del producto válido es requerido.",
        });
    }

    try {
        await deleteProductService(id);
        return res.status(200).json({
            status: "success",
            message: `Producto con ID ${id} eliminado correctamente.`,
        });
    } catch (error) {
        console.error(
            `Fallo crítico en deleteProduct para el ID ${id}:`,
            error,
        );
        return res.status(500).json({
            status: "error",
            message:
                "Error interno del servidor al intentar eliminar el producto.",
        });
    }
};
