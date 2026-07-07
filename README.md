# Trabajo Final — API RESTful de Usuarios (JWT)

## Descripción

API de administración de usuarios construida con **Node.js**, **Express**, **Sequelize** y **PostgreSQL**.
Incluye registro, login, perfil y eliminación de cuenta, con autenticación **JWT**,
contraseñas hasheadas con **bcryptjs** y validación de datos con **express-validator**.

---

## Estructura del proyecto

```
trabajo-final-backend/
├── .env                          ← Variables de entorno (NO subir a git)
├── .env.example                  ← Plantilla de variables de entorno
├── .gitignore
├── package.json                  ← "type": "module" habilitado (ES Modules)
├── README.md
└── src/
    ├── app.js                    ← Punto de entrada: Express + sync + listen
    ├── config/
    │   └── database.js           ← Instancia de Sequelize (PostgreSQL)
    ├── models/
    │   └── User.js               ← Modelo que representa la tabla "Users"
    ├── controllers/
    │   └── authController.js     ← register, login, getProfile, updateProfile, deleteProfile
    ├── middlewares/
    │   ├── authMiddleware.js     ← authenticateToken (JWT)
    │   ├── validators.js         ← Reglas de express-validator
    │   └── errorHandler.js       ← Manejo centralizado de errores
    └── routes/
        └── authRoutes.js         ← Rutas montadas bajo /api
```

---

## Instalación y configuración

```bash
# 1. Instalar dependencias
npm install

# 2. Crear archivo de variables de entorno
cp .env.example .env

# 3. Completar el .env con tus credenciales de PostgreSQL y el JWT secret

# 4. Crear la base de datos en PostgreSQL (el nombre debe coincidir con DB_NAME)

# 5. Levantar el servidor en modo desarrollo
npm run dev
```

### Variables de entorno (.env)

```env
PORT=3000
DB_NAME=tu_base_de_datos
DB_USER=tu_usuario
DB_PASSWORD=tu_password
DB_HOST=localhost
DB_PORT=5432
JWT_SECRET=un_secreto_largo_y_seguro
```

Se cargan con el paquete `dotenv` usando la sintaxis ES Modules:

```js
import "dotenv/config";
// Debe importarse antes de cualquier acceso a process.env
```

---

## Referencia rápida

### Stack

| Tecnología          | Uso en este proyecto                              |
|---------------------|---------------------------------------------------|
| Express             | Servidor HTTP y enrutamiento                      |
| Sequelize           | ORM para PostgreSQL                               |
| jsonwebtoken        | Generar y verificar tokens JWT                    |
| bcryptjs            | Hashear y comparar contraseñas (10 rondas)        |
| express-validator   | Validar body de register, login y update profile  |
| dotenv              | Cargar variables de entorno desde `.env`            |

### Modelo User

| Columna     | Tipo     | Restricciones                    |
|-------------|----------|----------------------------------|
| `id`        | INTEGER  | PK, autoincrement                |
| `name`      | STRING   | obligatorio                      |
| `email`     | STRING   | obligatorio, único, formato email|
| `password`  | STRING   | obligatorio, hasheado            |
| `createdAt` | DATE     | automático (timestamps)          |
| `updatedAt` | DATE     | automático (timestamps)          |

### Autenticación JWT

```js
// Generar token al hacer login
const token = jwt.sign(
  { id: user.id, email: user.email },
  process.env.JWT_SECRET,
  { expiresIn: "2h" }
);

// En rutas protegidas, enviar el header:
// Authorization: Bearer <token>
```

### Validación con express-validator

```js
import { body, validationResult } from "express-validator";

const reglas = [
  body("email").isEmail().withMessage("El email no tiene formato válido"),
  body("password").isLength({ min: 5 }).withMessage("Mínimo 5 caracteres"),
];

// Si falla → 400 con { errors: [...] }
```

### Endpoints disponibles

| Método | Ruta            | Acceso  | Descripción                    |
|--------|-----------------|---------|--------------------------------|
| POST   | `/api/register` | Público | Registrar un nuevo usuario     |
| POST   | `/api/login`    | Público | Iniciar sesión y obtener token |
| GET    | `/api/profile`  | JWT     | Obtener perfil del usuario     |
| PUT    | `/api/profile`  | JWT     | Actualizar nombre o contraseña |
| DELETE | `/api/profile`  | JWT     | Eliminar la cuenta             |

---

## Endpoints — documentación detallada

### POST /api/register — Público

**Body de ejemplo:**
```json
{
  "name": "Juan Pérez",
  "email": "juan@mail.com",
  "password": "12345"
}
```

**Respuesta exitosa (201):**
```json
{
  "id": 1,
  "name": "Juan Pérez",
  "email": "juan@mail.com"
}
```

**Respuesta de error (400 — validación):**
```json
{
  "errors": [
    {
      "type": "field",
      "value": "123",
      "msg": "La contraseña debe tener al menos 5 caracteres",
      "path": "password",
      "location": "body"
    }
  ]
}
```

**Respuesta de error (400 — email duplicado):**
```json
{
  "error": "El email ya está registrado"
}
```

---

### POST /api/login — Público

**Body de ejemplo:**
```json
{
  "email": "juan@mail.com",
  "password": "12345"
}
```

**Respuesta exitosa (200):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "Juan Pérez",
    "email": "juan@mail.com"
  }
}
```

**Respuesta de error (401):**
```json
{
  "error": "Credenciales inválidas"
}
```

---

### GET /api/profile — Privado (JWT)

**Header requerido:**
```
Authorization: Bearer <token>
```

**Respuesta exitosa (200):**
```json
{
  "id": 1,
  "name": "Juan Pérez",
  "email": "juan@mail.com",
  "createdAt": "2026-07-06T20:00:00.000Z"
}
```

**Respuesta de error (401 — sin token):**
```json
{
  "error": "Token no proporcionado"
}
```

---

### PUT /api/profile — Privado (JWT)

**Header requerido:**
```
Authorization: Bearer <token>
```

**Body de ejemplo (solo nombre):**
```json
{
  "name": "Juan Carlos"
}
```

**Body de ejemplo (cambio de contraseña):**
```json
{
  "password": "nueva123",
  "currentPassword": "12345"
}
```

> Si se envía `password`, también es obligatorio enviar `currentPassword`.

**Respuesta exitosa (200):**
```json
{
  "id": 1,
  "name": "Juan Carlos",
  "email": "juan@mail.com",
  "updatedAt": "2026-07-06T21:00:00.000Z"
}
```

**Respuesta de error (400 — falta currentPassword):**
```json
{
  "errors": [
    {
      "type": "field",
      "msg": "Debe enviar currentPassword para cambiar la contraseña",
      "path": "currentPassword",
      "location": "body"
    }
  ]
}
```

**Respuesta de error (401 — contraseña actual incorrecta):**
```json
{
  "error": "La contraseña actual no es correcta"
}
```

---

### DELETE /api/profile — Privado (JWT)

**Header requerido:**
```
Authorization: Bearer <token>
```

**Respuesta exitosa (200):**
```json
{
  "message": "Usuario eliminado correctamente"
}
```

**Respuesta de error (401):**
```json
{
  "error": "Token no proporcionado"
}
```

---

## Orden de demostración (Thunder Client)

Probar los endpoints en este orden:

### Paso 1 — Registrar usuario
```
POST http://localhost:3000/api/register
Content-Type: application/json

{ "name": "Juan Pérez", "email": "juan@mail.com", "password": "12345" }
```
Esperado: `201` con `{ id, name, email }` (sin password).

### Paso 2 — Registrar email duplicado
Repetir el Paso 1 con el mismo email.
Esperado: `400` con `{ error: "El email ya está registrado" }`.

### Paso 3 — Registrar con password corto
```json
{ "name": "Test", "email": "otro@mail.com", "password": "123" }
```
Esperado: `400` con `{ errors: [...] }`.

### Paso 4 — Login con credenciales correctas
```
POST http://localhost:3000/api/login
Content-Type: application/json

{ "email": "juan@mail.com", "password": "12345" }
```
Esperado: `200` con `{ token, user }`. Copiar el `token` para los siguientes pasos.

### Paso 5 — Login con password incorrecto
Esperado: `401` con `{ error: "Credenciales inválidas" }`.

### Paso 6 — GET profile sin token
```
GET http://localhost:3000/api/profile
```
Esperado: `401` con `{ error: "Token no proporcionado" }`.

### Paso 7 — GET profile con token válido
```
GET http://localhost:3000/api/profile
Authorization: Bearer <token>
```
Esperado: `200` con `{ id, name, email, createdAt }`.

### Paso 8 — PUT profile cambiando solo name
```
PUT http://localhost:3000/api/profile
Authorization: Bearer <token>
Content-Type: application/json

{ "name": "Juan Carlos" }
```
Esperado: `200` con el nombre actualizado.

### Paso 9 — PUT profile cambiando password sin currentPassword
```json
{ "password": "nueva123" }
```
Esperado: `400` con error de validación en `currentPassword`.

### Paso 10 — PUT profile con currentPassword incorrecto
```json
{ "password": "nueva123", "currentPassword": "incorrecta" }
```
Esperado: `401` con `{ error: "La contraseña actual no es correcta" }`.

### Paso 11 — PUT profile con currentPassword correcto
```json
{ "password": "nueva123", "currentPassword": "12345" }
```
Esperado: `200`.

### Paso 12 — DELETE profile
```
DELETE http://localhost:3000/api/profile
Authorization: Bearer <token>
```
Esperado: `200` con `{ message: "Usuario eliminado correctamente" }`.
Luego repetir el Paso 7 con el mismo token → debe fallar (usuario ya no existe).

---

## Conceptos clave

| Concepto                    | Dónde se ve                              |
|-----------------------------|------------------------------------------|
| `"type": "module"` (ESM)    | `package.json`                           |
| `import "dotenv/config"`    | `src/config/database.js`, `src/app.js`   |
| Instancia de Sequelize      | `src/config/database.js`                 |
| `dialect: "postgres"`       | `src/config/database.js`                 |
| Modelo con `DataTypes`      | `src/models/User.js`                     |
| `sequelize.sync({ force: false })` | `src/app.js`                      |
| `bcrypt.hash()` / `compare()` | `src/controllers/authController.js`    |
| `jwt.sign()` / `jwt.verify()` | `authController.js`, `authMiddleware.js` |
| `express-validator`         | `src/middlewares/validators.js`          |
| Middleware JWT (`Bearer`)   | `src/middlewares/authMiddleware.js`      |
| Rutas públicas vs privadas  | `src/routes/authRoutes.js`               |
| Error handler (4 params)    | `src/middlewares/errorHandler.js`        |
| Password nunca en respuesta | Todos los controllers                    |

---

## Errores comunes

| Error                              | Causa                                      | Solución                              |
|------------------------------------|--------------------------------------------|---------------------------------------|
| `ECONNREFUSED`                     | PostgreSQL no está corriendo               | Iniciar el servicio de PostgreSQL     |
| `password authentication failed`   | Usuario o contraseña incorrectos en `.env` | Verificar credenciales                |
| `database "..." does not exist`    | La BD no fue creada                        | Crear la BD con el nombre de `DB_NAME`|
| `Token no proporcionado`           | Falta el header Authorization              | Enviar `Bearer <token>`               |
| `Token inválido o expirado`        | Token mal formado o vencido (2h)           | Hacer login de nuevo                  |
