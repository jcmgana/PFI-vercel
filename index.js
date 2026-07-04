import express from "express";
import cors from "cors";
import 'dotenv/config';
import productsRouter from "./src/routes/products.routes.js";
import authRouter from "./src/routes/auth.routes.js";
import { authentication } from "./src/middleware/authentication.js";
import bodyParser from "body-parser";

const app = express();

// CORS
const ACCEPTED_ORIGINS = [
    'http://localhost:5173',  // ◄ Tu React en desarrollo local (Vite)
    'http://localhost:3001',  // ◄ Por si usás Create React App o el puerto cambia
    // ◄ Cuando subas tu React a producción, clavás la URL acá
];
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || ACCEPTED_ORIGINS.includes(origin)) {
            callback(null, true);
        } else {
            callback (new Error("Acceso no permitido por la política de CORS de esta API."))
        }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());

// Middleware que examina las solicitudes entrantes
app.use((req, res, next) => {
    console.log(`Datos recibidos: ${req.method} ${req.url}`);
    next();
})

// Rutas
// Página de inicio
app.get("/", (req, res) => {
    res.status(200).json({
        mensaje: "Bienvenido a la API del Proyecto Final Integrador de Joaquín Gana para la Comisión 26132 de Back-End NodeJS de Talento Tech",
        estado: "Online",
        versión: "2.5.0",
        documentación: "Escribí api/products para ver el catálogo."
    });
});

app.use(bodyParser.json());

// Auth Router
app.use('/auth', authRouter);
// Productos Router
app.use(productsRouter);

// Manejo de error 404 (Ruta no encontrada)
app.use(function(req, res, next) {
    res.status(404)
    res.send("Lo siento, no se encontró la página que buscas. (╯‵□′)╯︵┻━┻");
});

// Inicialización del servidor
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

