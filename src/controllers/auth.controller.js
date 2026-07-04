import { generateToken  } from "../utils/token-generator.js";
import { parseSafeEmail, parseSafePassword } from "../utils/validators.js";

export async function login (req, res) {
    const { email, password } = req.body;

    // 1. Filtro de formato del Email
    const validatedEmail = parseSafeEmail(email);
    if (validatedEmail === null) {
        return res.status(400).json({
            status: "error",
            message: "El formato del correo electrónico ingresado no es válido."
        });
    }
    // 2. Filtro de estructura de la Contraseña
    const validatedPassword = parseSafePassword(password);
    if (validatedPassword === null) {
        return res.status(400).json({
            status: "error",
            message: "La contraseña es requerida y debe tener al menos 6 caracteres."
        });
    }
    // 3. Usuario y contraseña de prueba. Acá puedo cambiar por consulta a una base de datos de usuarios en el futuro.
    if (validatedEmail === "admin@gmail.com" && validatedPassword === "123456") {
        const token = generateToken({ id: 1, email: validatedEmail });
        return res.status(200).json({
            status: "success",
            token });
    } else {
        return res.status(401).json({
            status: "error",
            message: "Credenciales incorrectas. El usuario o la contraseña no coinciden."
        });
    }
}
