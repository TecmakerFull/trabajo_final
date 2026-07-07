# Trabajo Final — API RESTful de Usuarios (JWT)

API de administración de usuarios con Node.js, Express, Sequelize, PostgreSQL y autenticación JWT.

## Configuración

1. Copiar `.env.example` a `.env`:
   ```bash
   cp .env.example .env
   ```
2. Completar las variables en `.env` con tus credenciales de PostgreSQL y un secreto para JWT.
3. Crear la base de datos en PostgreSQL (el nombre debe coincidir con `DB_NAME`).
4. Instalar dependencias y levantar el servidor:
   ```bash
   npm install
   npm run dev
   ```

## Endpoints

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
