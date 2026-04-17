# 🔥 PokéDex Manager - Gestor de Colecciones Pokémon

> Aplicación web full-stack para gestionar tu colección personal de Pokémon con integración de PokéAPI, autenticación JWT y UI responsiva en React.

## 📋 Contenido

- [Características](#características)
- [Stack Tecnológico](#stack-tecnológico)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Inicio Rápido](#inicio-rápido)
- [Configuración de Ambiente](#configuración-de-ambiente)
- [Documentación de API](#documentación-de-api)
- [Decisiones Técnicas](#decisiones-técnicas)
- [Principios SOLID](#principios-solid)
- [Solución de Problemas](#solución-de-problemas)

## ✨ Características

### Funcionalidad Core
- ✅ **Autenticación de Usuarios**: JWT seguro con hashing Argon2
- ✅ **Búsqueda de Pokémon**: Por nombre o ID con información detallada
- ✅ **Gestión de Favoritos**: Crea y administra tu colección personal
- ✅ **Diseño Responsivo**: UI moderna con Tailwind CSS
- ✅ **Datos en Tiempo Real**: Integración con PokéAPI

### Características Técnicas
- ✅ **Arquitectura Limpia**: Patrón de capas con separación de responsabilidades
- ✅ **SOLID Principles**: Aplicados en todo el código
- ✅ **Clean Code**: Funciones pequeñas, nombres descriptivos, docstrings
- ✅ **Manejo de Errores**: Validación robusta en API y frontend
- ✅ **CORS Configurado**: Listo para comunicación frontend-backend
- ✅ **IA con Vertex/Gemini**: Chat, análisis y recomendaciones con `gemini-2.5-flash-lite`

## 🛠️ Stack Tecnológico

### Backend
- **Framework**: FastAPI (Python 3.11)
- **BD**: MySQL 8.0 con SQLAlchemy ORM
- **Autenticación**: JWT (python-jose)
- **Hash de Contraseña**: Argon2 
- **Servidor**: Uvicorn ASGI
- **HTTP Async**: httpx para llamadas a PokéAPI
- **IA Generativa**: Vertex/Gemini REST API (`generativelanguage.googleapis.com`)
- **Modelo IA por defecto**: `gemini-2.5-flash-lite`

### Frontend
- **Framework**: React 18.2.0
- **Herramienta Build**: Vite 5.0
- **Estilos**: Tailwind CSS 3.4
- **Cliente HTTP**: Axios
- **Enrutamiento**: React Router 6.20
- **Estado Global**: Context API

### DevOps
- **Contenedores**: Docker & Docker Compose
- **BD Container**: MySQL 8.0
- **Testing**: Pytest (Backend)

## 📁 Estructura del Proyecto

```
PokeAPI/
├── backend/
│   ├── app/
│   │   ├── api/                    # Endpoints REST
│   │   │   ├── auth.py            # Registro, Login, Perfil
│   │   │   ├── pokemon.py         # Búsqueda de Pokémon
│   │   │   └── favorites.py       # Gestión de Favoritos
│   │   ├── core/
│   │   │   ├── config.py          # Gestión de configuración
│   │   │   ├── security.py        # JWT y Password utilities
│   │   │   └── database.py        # Conexión MySQL + SQLAlchemy
│   │   ├── models/                # ORM Models (User, Favorito)
│   │   ├── schemas/               # Pydantic Validators (DTO)
│   │   ├── services/              # Lógica de Negocio
│   │   │   ├── user_service.py
│   │   │   ├── pokemon_service.py
│   │   │   └── favorite_service.py
│   │   └── main.py                # FastAPI Factory
│   ├── tests/                     # Suite de Pruebas
│   ├── Dockerfile                 # Config del container
│   ├── requirements.txt           # Dependencias Python
│   ├── .env.example              # Template de variables
│   └── main.py                   # Punto de entrada
│
├── frontend/
│   ├── src/
│   │   ├── components/            # Componentes React
│   │   │   ├── Navbar.jsx
│   │   │   ├── PokemonSearch.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── context/              # Context Providers
│   │   │   └── AuthContext.jsx   # Estado de autenticación
│   │   ├── pages/                # Páginas
│   │   │   ├── HomePage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   └── FavoritesPage.jsx
│   │   ├── services/             # Cliente API
│   │   │   └── api.js           # Configuración Axios
│   │   └── App.jsx               # Componente Principal
│   ├── package.json              # Dependencias Node
│   ├── vite.config.js            # Config de Vite
│   ├── tailwind.config.js        # Config de Tailwind
│   ├── .env.example              # Template de variables
│   └── index.html                # Entry point HTML
│
├── docker-compose.yml            # Orquestación de servicios
└── README_ES.md                 # Este archivo
```

## 🚀 Inicio Rápido

### Opción 1: Docker Compose (Recomendado - 30 segundos)

```bash
# 1. Entrar al directorio
cd PokeAPI

# 2. Crear archivos .env desde templates
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 3. Iniciar aplicación
docker-compose up --build

# 4. Acceder
# Frontend: http://localhost:5173
# Backend API: http://localhost:8000
# Docs: http://localhost:8000/api/docs
```

### Opción 2: Desarrollo Local

#### Backend

```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate
# Mac/Linux: source venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
python main.py
```

#### Frontend (otra terminal)

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

## 🔐 Configuración de Ambiente

### Backend (.env)
```env
# Base de Datos
DB_HOST=localhost
DB_USER=pokeuser
DB_PASSWORD=password_seguro
DB_NAME=pokedex_manager
DB_PORT=3306

# Seguridad
SECRET_KEY=tu-llave-super-secreta-min-32-caracteres
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# PokéAPI
POKEAPI_BASE_URL=https://pokeapi.co/api/v2

# IA (requerido para PokeChat, PokeAnalysis y PokeRecommend)
VERTEX_API_KEY=tu-api-key-de-google
VERTEX_MODEL=gemini-2.5-flash-lite

# Producción
DEBUG=False
```

Si `VERTEX_API_KEY` no está configurada o es inválida, las funciones de IA devolverán error.

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000
```

## 📚 Documentación de API

### Base URL
```
http://localhost:8000
```

### Autenticación

#### POST /auth/register
```json
{
  "username": "usuario",
  "email": "usuario@ejemplo.com",
  "password": "contraseña_segura"
}
```
**Respuesta**: 201 Created con datos del usuario

#### POST /auth/login
```json
{
  "email": "usuario@ejemplo.com",
  "password": "contraseña"
}
```
**Respuesta**: 200 OK con `access_token`

#### GET /auth/me
**Headers**: `Authorization: Bearer {token}`

**Respuesta**: 200 OK con datos del usuario autenticado

### Pokémon

#### GET /pokemon/search/{id_o_nombre}
**Headers**: `Authorization: Bearer {token}`

**Respuesta**: 200 OK
```json
{
  "id": 1,
  "name": "Bulbasaur",
  "types": ["Grass", "Poison"],
  "stats": {
    "hp": 45,
    "attack": 49,
    "defense": 49
  },
  "abilities": ["Overgrow"],
  "image_url": "https://..."
}
```

#### GET /pokemon/list?limit=20&offset=0
**Respuesta**: Lista paginada de Pokémon

### Favoritos

#### POST /favorites/add
```json
{
  "pokemon_id": 1,
  "pokemon_name": "Bulbasaur"
}
```

#### DELETE /favorites/remove/{pokemon_id}

#### GET /favorites/list
**Respuesta**: Lista de favoritos del usuario

#### GET /favorites/count
**Respuesta**: `{ "count": 10 }`

#### GET /favorites/check/{pokemon_id}
**Respuesta**: `{ "is_favorite": true }`

### 📖 Documentación Interactiva
**Swagger UI**: `http://localhost:8000/api/docs`

## 🏗️ Decisiones Técnicas

### 1. ¿Por qué FastAPI?
- **Async nativo**: Mejor rendimiento que Flask/Django
- **Type hints**: Validación automática con Pydantic
- **Auto-documentación**: Swagger incluido
- **Moderno**: Creado con buenas prácticas en mente
- **Alternativa rechazada**: Django (demasiado opinionado para este proyecto)

### 2. ¿Por qué JWT vs Sessions?
- **Stateless**: No requiere almacenamiento en servidor
- **Escalable**: Funciona bien en microservicios
- **Token expiration**: 30 minutos configurable
- **Seguridad**: Firmado con HS256

### 3. ¿Por qué React Context vs Redux?
- **Simplicidad**: Solo necesitamos estado global de autenticación
- **Zero dependencies**: No añade peso al proyecto
- **Suficiente**: Context API es perfecto para este caso de uso
- **Aprendizaje**: Más fácil de entender en entrevista

### 4. ¿Por qué Tailwind CSS?
- **Utility-first**: Desarrollo más rápido
- **Consistencia**: No hay CSS inconsistente
- **Customizable**: Colores Pokémon personalizados
- **Responsive**: Mobile-first incorporado

### 5. Arquitectura de Capas

```
┌─────────────────────────────────────┐
│      API Routes (/api/*)            │ ← Fast, validación automática
├─────────────────────────────────────┤
│      Service Layer (Negocio)        │ ← Lógica reutilizable, testeable
├─────────────────────────────────────┤
│      Data Access (SQLAlchemy)       │ ← ORM, queries type-safe
├─────────────────────────────────────┤
│      Database (MySQL)               │ ← Persistencia
└─────────────────────────────────────┘
```

**Ventajas**:
- ✅ Fácil de testear (mock services)
- ✅ Fácil de extender (agregar features)
- ✅ Separación de responsabilidades clara

## 💎 Principios SOLID

### Single Responsibility
```python
# ✅ BIEN: Cada servicio tiene UNA responsabilidad
class UserService:
    @staticmethod
    def create_user(username, email, password) -> User:
        ...

class PokemonService:
    @staticmethod
    async def get_pokemon(pokemon_id) -> dict:
        ...
```

### Open/Closed
```python
# ✅ BIEN: Abierto a extensión, cerrado a modificación
# Nuevo endpoint sin tocar existentes
@router.get("/pokemon/species/{name}")
async def get_species(name: str):
    ...
```

### Liskov Substitution
```python
# ✅ BIEN: Subclases pueden reemplazar la clase base
class Pokemon:
    def get_info(self) -> dict: pass

class PokemonFromAPI(Pokemon):
    def get_info(self) -> dict: ...
```

### Interface Segregation
```python
# ✅ BIEN: Interfaces pequeñas y específicas
@app.get("/auth/me")
@app.post("/auth/login")
@app.post("/auth/register")
# No un mega endpoint que haga todo
```

### Dependency Inversion
```python
# ✅ BIEN: Depende de abstracciones, no de implementaciones
@router.get("/favorites")
async def get_favorites(
    session: Session = Depends(get_db),  # Inyecta DB
    current_user: User = Depends(get_current_user)  # Inyecta User
):
    ...
```

## 🧪 Testing

### Ejecutar Tests Backend
```bash
cd backend
pytest tests/ -v
```

**Cobertura incluida**:
- ✅ Registro de usuarios
- ✅ Login y verificación JWT
- ✅ Operaciones de favoritos

### Expandir Tests
```bash
# Crear test para nuevo endpoint
# tests/test_pokemon.py
```

## 🐳 Docker

### Comandos Útiles
```bash
# Ver logs en tiempo real
docker-compose logs -f backend

# Ejecutar en background
docker-compose up -d

# Detener
docker-compose down

# Reset completo (elimina BD)
docker-compose down -v
```

## 📂 Estructura de Carpetas - Por qué

```
api/           → Endpoints REST (las rutas)
core/          → Configuración central
models/        → ORM (cómo los datos se mapean a BD)
schemas/       → Validación (qué espera la API)
services/      → Lógica de negocio (el "qué" y "cómo" hacer)
```

**Flujo de una solicitud**:
1. Llega a `api/favorites.py`
2. Valida con `schemas/`
3. Llama a `FavoriteService`
4. Service usa `models/` para acceder BD
5. Retorna respuesta

## 🔄 Flow de Autenticación

```
1. Usuario se registra
   ↓
2. Contraseña hasheada con Argon2
   ↓
3. Guardada en MySQL
   ↓
4. Usuario hace login
   ↓
5. Se verifica contraseña
   ↓
6. JWT token generado
   ↓
7. Token enviado al frontend
   ↓
8. Frontend lo guarda en localStorage
   ↓
9. Cada request incluye: Authorization: Bearer {token}
   ↓
10. Backend verifica el token en cada endpoint protegido
```

## ❓ Solución de Problemas

### Error: "Can't connect to MySQL"
```bash
# Verificar que MySQL está corriendo en Docker
docker-compose ps

# Reiniciar el contenedor
docker-compose restart mysql
```

### Error: "CORS error"
- Verificar que `VITE_API_URL` sea correcto en frontend/.env
- Verificar que backend tiene CORS configurado para localhost:5173

### Error: "Token expirado"
- Tokens JWT expiran en 30 minutos (configurable)
- Haz login de nuevo para obtener nuevo token

### Error IA: 401/403/404/502 en PokeChat
- Contexto: las funciones de IA usan Vertex/Gemini REST con `VERTEX_API_KEY` y modelo `gemini-2.5-flash-lite`.

#### 401 Unauthorized (API key inválida)
- Verifica que `VERTEX_API_KEY` en `backend/.env` esté correcta y sin espacios extra.
- Reinicia backend después de cambiar `.env`.

#### 403 Permission Denied (API deshabilitada o sin permisos)
- Habilita Gemini API en tu proyecto de Google Cloud:
   https://console.developers.google.com/apis/api/generativelanguage.googleapis.com/overview
- Confirma que la API key pertenezca al mismo proyecto.

#### 404 Model not found
- Verifica que `VERTEX_MODEL=gemini-2.5-flash-lite` en `backend/.env`.
- No uses modelos antiguos en `v1beta` que no soporten `generateContent`.

#### 502 Bad Gateway en frontend
- El backend devuelve 502 cuando falla la llamada al proveedor IA.
- Revisa logs del backend para ver el error real de Gemini (401/403/404).
- Prueba rápida desde terminal:
```bash
python -c "import requests;print(requests.post('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=TU_API_KEY',json={'contents':[{'parts':[{'text':'hello'}]}]}).status_code)"
```

### Puerto ya en uso
```bash
# Cambiar puerto en docker-compose.yml o:
docker-compose down
```

## 📞 Recursos

- **PokéAPI Docs**: https://pokeapi.co/docs/v2
- **FastAPI**: https://fastapi.tiangolo.com
- **React**: https://es.react.dev
- **Tailwind CSS**: https://tailwindcss.com

