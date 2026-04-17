# Instalación (Prueba Técnica)

Esta guía solo cubre lo necesario para correr la prueba técnica en local.

## Qué está implementado

- Autenticación con JWT.
- Hash de contraseñas con Argon2.
- Búsqueda de Pokémon por nombre o ID.
- Listado paginado y detalle de Pokémon.
- Gestión de favoritos.
- Interfaz web en React + Vite.

## Requisitos

- Python 3.11+
- Node.js 18+
- MySQL 8+

## 1) Backend

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

pip install -r requirements.txt
copy .env.example .env
```

Configura `backend/.env` con estas variables mínimas:

```env
# Opcion recomendada: URL unica de conexion
DATABASE_URL=mysql+aiomysql://root:tu_password@localhost:3306/pokedex

# Opcion alternativa (si no usas DATABASE_URL):
# DB_HOST=localhost
# DB_PORT=3306
# DB_USER=root
# DB_PASSWORD=tu_password
# DB_NAME=pokedex

SECRET_KEY=tu-clave-segura-de-32-caracteres-o-mas
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

POKEAPI_BASE_URL=https://pokeapi.co/api/v2

# IA (requerido para PokeChat, PokeAnalysis y PokeRecommend)
VERTEX_API_KEY=tu-api-key-de-google
VERTEX_MODEL=gemini-2.5-flash-lite
DEBUG=True
```

Nota importante de IA:
- Debes tener habilitada la API de Gemini en tu proyecto de Google Cloud.
- Sin `VERTEX_API_KEY` válida, las funciones de IA no responderán.

Ejecuta el backend:

```bash
python main.py
```

Backend: `http://localhost:8000`  
Swagger: `http://localhost:8000/api/docs`

## 2) Frontend

En otra terminal:

```bash
cd frontend
npm install
copy .env.example .env
```

Verifica en `frontend/.env`:

```env
VITE_API_URL=http://localhost:8000
```

Ejecuta el frontend:

```bash
npm run dev
```

Frontend: `http://localhost:5173`

## 3) Prueba rápida

1. Registrar usuario.
2. Iniciar sesión.
3. Buscar un Pokémon.
4. Abrir detalle.
5. Agregar y quitar favoritos.
6. Probar las rutas IA: PokeChat, PokeAnalysis y PokeRecommend.

## Nota

Este repositorio está documentado para evaluación técnica local, no para despliegue productivo.
