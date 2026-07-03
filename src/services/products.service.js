import {
    readDocuments,
    readDocument,
    createDocument,
    updateDocument,
    deleteDocument,
} from "../models/products.models.js";

// Función que ordena los campos del producto.
const formatProductStructure = (product) => {
    if (!product) return null;

    return {
        id: product.id,
        name: product.name,
        price: product.price,
        category: product.category,
        stock: product.stock,
        description: product.description || "", // Si no tiene descripción, evita que quede undefined
    };
};

// Función que obtiene todos los productos:
export const getAllProductsService = async () => {
    const products = await readDocuments("products");
    return products.map((product) => formatProductStructure(product));
};

// Función que obtiene un productor por id:
export const getProductByIdService = async (id) => {
    const product = await readDocument("products", id);
    return formatProductStructure(product);
};

// Función que filtra productos por un query:
export const getProductsByFiltersService = async ({ category, price }) => {
    const products = await readDocuments("products");

    const filteredProducts = products.filter((product) => {
        let match = true;

        if (category !== undefined) {
            match = match && product.category === category;
        }
        if (price !== undefined) {
            match = match && product.price <= Number(price);
        }

        return match;
    });

    return filteredProducts.map((product) => formatProductStructure(product));
};

export const createProductService = async (producto) =>
    await createDocument("products", producto);
export const updateProductService = async (id, data) =>
    await updateDocument("products", id, data);
export const deleteProductService = async (id) =>
    await deleteDocument("products", id);
