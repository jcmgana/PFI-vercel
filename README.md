# 📝 E-Commerce API - Proyecto Final Integrador Node.js Talento Tech

¡Bienvenido! Este proyecto es una API RESTful desarrollada en **Node.js** y **Express**, diseñada bajo una arquitectura limpia y robusta dividida en **6 Capas independientes**. Utiliza **Firestore (Firebase)** como base de datos en la nube y está protegida mediante autenticación por tokens **JWT (JSON Web Tokens)**.

El servidor está optimizado y configurado para ser desplegado en **Vercel**

---

## 🛠️ Stack Tecnológico

*   **Runtime:** Node.js (ES Modules)
*   **Framework:** Express.js
*   **Base de Datos:** Firestore (Firebase Admin / SDK)
*   **Seguridad:** JSON Web Tokens (JWT) & bcrypt
*   **Variables de Entorno:** dotenv
*   **CORS:** Configurado para integración con Frontend

---

## 🏗️ Arquitectura del Proyecto (Patrón de 6 Capas)

1.  **Base de Datos (`src/data/`):** Conexión e inicialización centralizada del SDK de Firebase.
2.  **Modelos (`src/models/`):** Capa genérica de persistencia de datos. Interactúa directo con las colecciones de Firestore.
3.  **Servicios (`src/services/`):** Lógica de negocio pura. Aquí se procesan los datos, se aplican reglas y se mapean las estructuras (ej. formateo de campos a inglés).
4.  **Middlewares (`src/middleware/`):** Búnker de seguridad y control de acceso (Validación robusta de JWT).
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

