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
    
    if (clean === "" || isNaN(num) || num < 0 || num > 1000000) {
        return null; // Bandera de error
    }
    return num;
};

// Categoría: Valida y normaliza categorías de productos
export const parseSafeCategory = (category) => {
    if (!validateRequiredString(category)) {
        return null; // Error si está vacía, es undefined o espacios en blanco
    }

    const clean = category.trim();
    if (clean.length > 30) {
        return null; 
    }
    return clean.toLowerCase();
};

// Filtra campos fantasma y limpia strings
export const sanitizeProductData = (rawData) => {
    return {
        name: typeof rawData.name === "string" ? rawData.name.trim() : "",
        price: Number(rawData.price),
        stock: Number(rawData.stock),
        category: typeof rawData.category === "string" ? rawData.category.trim().toLowerCase() : ""
    };
};

//
// Usuario y contraseña
// Validar y normalizar email
export const parseSafeEmail = (email) => {
    if (typeof email !== "string") return null;

    const cleanEmail = email.trim().toLowerCase();

    // Expresión regular estándar de estructura: texto + @ + texto + . + texto
    const emailRegEx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegEx.test(cleanEmail)) {
        return null;
    }
    return cleanEmail;
};

// Validar contraseña
export const parseSafePassword = (password) => {
    if (typeof password !== "string") return null;
    if (password.length < 6) {
        return null;
    }
    return password;
};
