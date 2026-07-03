// ID o Nombre: Valida y limpia strings obligatorios
export const validateRequiredString = (value) => {
    if (!value || typeof value !== "string" || value.trim() === "") {
        return null; // Si no es válido, devolvemos null
    }
    return value.trim(); // Si es válido, lo devolvemos limpito sin espacios
};

// Precios: Valida y limpia precios de productos
export const parseSafePrice = (price) => {
    const clean = typeof price === "string" ? price.trim() : String(price || "");
    const num = Number(clean);
    
    if (clean === "" || isNaN(num) || num <= 0 || num > 1000000) {
        return null; // Bandera de error
    }
    return num;
};

// Stock: Valida y limpia stock de depósitos/balanzas
export const parseSafeStock = (stock) => {
    const clean = typeof stock === "string" ? stock.trim() : String(stock ?? "");
    const num = Number(clean);
    
    if (clean === "" || isNaN(num) || num < 0) {
        return null; // Bandera de error
    }
    return num;
};