# 📝 E-Commerce API - Proyecto Final Integrador Node.js Talento Tech
Alumno: Joaquín Gana || Comisión: 26132
¡Bienvenido! Este es mi Proyecto Final Integrador para el curso de Back-End **Node.JS**. Desarrollamos una API Rest para un cliente que tiene diversos productos en catálogo y precisa administrarlos, habilitando la posibilidad de Leer, Crear, Actualizar y Eliminar la información sobre los mismos. Utiliza **Firestore (Firebase)** como base de datos en la nube y está protegida mediante autenticación por tokens **JWT (JSON Web Tokens)**.

El servidor está configurado para ser desplegado en **Vercel**

---

## 🛠️ Stack Tecnológico

*   **Runtime:** Node.js (ES Modules)
*   **Framework:** Express.js
*   **Base de Datos:** Firestore (Firebase Admin / SDK)
*   **Seguridad:** JSON Web Tokens (JWT) & bcrypt
*   **Variables de Entorno:** dotenv

---

## 🏗️ Arquitectura del Proyecto (Patrón de 6 Capas)
Para que sea escalable, se separaron las distintas responsabilidades de la aplicación en capas que permitan establecer rutas, controladores, servicios y modelos de forma clara y prolija, además de definir las carpetas necesarias para guardar middlewares y configuración a servicios externos.

1.  **Base de Datos (`src/data/`):** Conexión e inicialización centralizada del SDK de Firebase.
2.  **Modelos (`src/models/`):** Capa que interactúa directo con las colecciones de Firestore.
3.  **Servicios (`src/services/`):** Lógica de negocio: aquí se procesan los datos, se aplican reglas y se mapean las estructuras (ej. formateo de campos a inglés).
4.  **Middlewares (`src/middleware/`):** Validación de JWT.
5.  **Controladores (`src/controllers/`):** Manejo de peticiones (`req`) y respuestas (`res`), validación estricta de tipos de datos, query params y códigos de estado HTTP.
6.  **Rutas (`src/routes/`):** Mapeo semántico de los endpoints (Públicos y Protegidos).

---

## 🚦 Endpoints de la API

### 📦 Productos (`/api/products`)

| Método | Endpoint | Acceso | Descripción |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/products` | 🔓 Público | Obtiene todos los productos. Soporta filtros opcionales por Query Params (`?category=...&price=...`). |
| **GET** | `/api/products/:id` | 🔓 Público | Obtiene un producto específico por su ID alfanumérico de Firestore. |
| **POST** | `/api/products` | 🔒 Protegido | Crea un nuevo producto. Requiere JWT. |
| **PUT** | `/api/products/:id` | 🔒 Protegido | Modifica los campos de un producto existente por ID. Requiere JWT. |
| **DELETE**| `/api/products/:id` | 🔒 Protegido | Elimina un producto de la base de datos por ID. Requiere JWT. |

### 🔑 Autenticación (`/api/auth`)
*   **POST** `/auth/login`: Autentica al usuario y devuelve el token JWT firmado para usar en los headers de las rutas protegidas (`Authorization: Bearer <token>`).

---

