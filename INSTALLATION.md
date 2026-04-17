# 📦 INSTALACIÓN.md - Guía de Setup

## ⚡ Inicio rapido: 30 segundos con Docker

```bash
# 1. Entrar al proyecto
cd PokeAPI

# 2. Crear archivos de configuración
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 3. Iniciar todo
docker-compose up --build

# ✅ Listo! Accede a:
# - Frontend: http://localhost:5173
# - Backend API: http://localhost:8000
# - Swagger Docs: http://localhost:8000/api/docs
```

---

## 📋 Requisitos Previos

### Opción 1: Docker (Recomendado)
- Docker Desktop instalado
- 4GB RAM disponibles
- 2GB espacio en disco

### Opción 2: Local
- Python 3.11+
- Node.js 18+
- MySQL 8.0+
- ~5GB espacio en disco

---

## 🐳 Instalación con Docker (RECOMENDADO)

### Paso 1: Preparar Archivos de Configuración

```bash
cd PokeAPI

# Crear .env del backend
cp backend/.env.example backend/.env

# Crear .env del frontend
cp frontend/.env.example frontend/.env
```

### Paso 2: Configurar Variables (Opcional)

**backend/.env** - Las siguientes tienen valores por defecto, pero puedes cambiar:

```env
DB_PASSWORD=securepassword  # Cambiar a algo seguro
SECRET_KEY=...              # Generado automáticamente
DEBUG=False                  # False en producción
```

**frontend/.env** - Generalmente OK como está:

```env
VITE_API_URL=http://localhost:8000
```

### Paso 3: Iniciar Aplicación

```bash
# Opción A: Primera vez (construye images)
docker-compose up --build

# Opción B: Siguientes veces (más rápido)
docker-compose up

# Opción C: En background
docker-compose up -d

# Ver logs
docker-compose logs -f backend
```

### Paso 4: Verificar que Funciona

```bash
# Terminal 1: Ver estado de servicios
docker-compose ps

# Debería mostrar:
# mysql        Up 2 minutes
# backend      Up 1 minute
# frontend     Up 1 minute

# Terminal 2: Probar API
curl http://localhost:8000/health
# Respuesta: {"status":"healthy"}
```

### Paso 5: Usar la Aplicación

1. Abre http://localhost:5173
2. Registra un nuevo usuario
3. Haz login
4. Busca un Pokémon (ej: "pikachu")
5. Añade a favoritos

### Comandos Útiles Docker

```bash
# Detener
docker-compose down

# Detener y eliminar BD (reset completo)
docker-compose down -v

# Ver logs en vivo
docker-compose logs -f backend

# Logs de MySQL
docker-compose logs -f mysql

# Ejecutar comando en contenedor
docker-compose exec backend python -m pytest tests/

# Entrar a terminal de contenedor
docker-compose exec backend bash
```

---

## 💻 Instalación Local (Sin Docker)

### Backend Setup

#### Paso 1: Crear Entorno Virtual

```bash
cd backend

# Windows
python -m venv venv
venv\Scripts\activate

# Mac/Linux
python3 -m venv venv
source venv/bin/activate
```

#### Paso 2: Instalar Dependencias

```bash
pip install -r requirements.txt
```

#### Paso 3: Configurar Base de Datos

**Opción A: Usando Docker solo para MySQL**

```bash
# En otra terminal (en raíz del proyecto)
docker run --name mysql_pokedb \
  -e MYSQL_ROOT_PASSWORD=root \
  -e MYSQL_DATABASE=pokedex_manager \
  -e MYSQL_USER=pokeuser \
  -e MYSQL_PASSWORD=securepassword \
  -p 3306:3306 \
  mysql:8.0
```

**Opción B: MySQL instalado localmente**

```bash
# Crear BD y usuario
mysql -u root -p

CREATE DATABASE pokedex_manager;
CREATE USER 'pokeuser'@'localhost' IDENTIFIED BY 'securepassword';
GRANT ALL PRIVILEGES ON pokedex_manager.* TO 'pokeuser'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

#### Paso 4: Variables de Ambiente

```bash
cp .env.example .env

# Editar .env
nano .env  # o tu editor favorito

# Asegúrate que tenga:
DB_HOST=localhost
DB_USER=pokeuser
DB_PASSWORD=securepassword
DB_NAME=pokedex_manager
SECRET_KEY=tu-llave-super-secreta-min-32-caracteres
```

#### Paso 5: Ejecutar Backend

```bash
python main.py

# Debería mostrar:
# Uvicorn running on http://127.0.0.1:8000
```

### Frontend Setup (Nueva Terminal)

#### Paso 1: Instalar Node

```bash
# Verificar que Node 18+ está instalado
node --version  # v18.0.0 o mayor
npm --version   # 8.0.0 o mayor

# Si no, descargar de: https://nodejs.org/
```

#### Paso 2: Instalar Dependencias

```bash
cd frontend
npm install
```

#### Paso 3: Variables de Ambiente

```bash
cp .env.example .env

# Frontend casi siempre está OK, pero verifica:
# cat .env
# VITE_API_URL=http://localhost:8000
```

#### Paso 4: Ejecutar Frontend

```bash
npm run dev

# Debería mostrar:
# ➜ Local: http://localhost:5173
```

#### Paso 5: Acceder

Abre http://localhost:5173 en tu navegador

---

## 🧪 Testing

### Pruebas Backend

```bash
cd backend

# Ejecutar todos los tests
pytest tests/ -v

# Ejecutar test específico
pytest tests/test_auth.py::test_user_registration -v

# Con reporte de cobertura
pytest tests/ --cov=app --cov-report=html

# Ver reporte: open htmlcov/index.html
```

### Pruebas Manual con API

```bash
# 1. Registrar usuario
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }'

# 2. Login
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# Copia el access_token de la respuesta

# 3. Buscar Pokémon
curl -X GET http://localhost:8000/pokemon/search/pikachu \
  -H "Authorization: Bearer TU_TOKEN_AQUI"

# 4. Agregar a Favoritos
curl -X POST http://localhost:8000/favorites/add \
  -H "Authorization: Bearer TU_TOKEN_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "pokemon_id": 25,
    "pokemon_name": "Pikachu"
  }'

# 5. Ver Favoritos
curl -X GET http://localhost:8000/favorites/list \
  -H "Authorization: Bearer TU_TOKEN_AQUI"
```

### Explorar API con Swagger

Simplemente abre: http://localhost:8000/api/docs

- Puedes probar todos los endpoints
- Rellena los parámetros
- Haz click en "Try it out"
- Ver las respuestas

---

## ❌ Troubleshooting

### Error: "Puerto 5173 ya en uso"

```bash
# Opción 1: Encontrar qué lo usa
# Windows:
netstat -ano | findstr :5173

# Mac/Linux:
lsof -i :5173

# Opción 2: Usar otro puerto
cd frontend
npm run dev -- --port 3000
```

### Error: "Can't connect to MySQL"

```bash
# Docker Compose:
docker-compose restart mysql

# Local:
# Verificar que MySQL está corriendo
# Windows: En Task Manager busca mysqld
# Mac: brew services list
# Linux: sudo systemctl status mysql
```

### Error: "CORS error en frontend"

**Síntomas**: 
```
Access to XMLHttpRequest at 'http://localhost:8000/auth/login' 
from origin 'http://localhost:5173' has been blocked
```

**Solución**:
1. Verificar `VITE_API_URL` en frontend/.env
2. Reiniciar frontend: `npm run dev`
3. Limpiar localStorage: Developer Tools → Application → Clear Storage

### Error: "Token expirado"

```
Respuesta 401: "Token expired"
```

**Solución**:
- El token JWT expira cada 30 minutos
- Haz login de nuevo para obtener un nuevo token

### Error: "Invalid credentials" en login

1. Verificar que el usuario fue registrado
2. Que la contraseña sea correcta (case-sensitive)
3. Que uses el email, no el username en login

### BD no se crea automáticamente

```bash
# Si usas Docker Compose, debe crearse solo
# Si no se crea, verifica:
docker-compose logs mysql

# Si usas MySQL local, crea la BD manualmente:
mysql -u root -p < schema.sql
```

### "ModuleNotFoundError: No module named 'fastapi'"

```bash
# Activar virtual env
# Windows:
venv\Scripts\activate

# Mac/Linux:
source venv/bin/activate

# Reinstalar
pip install -r requirements.txt
```

### "npm: command not found"

```bash
# Node.js no instalado
# Descargar: https://nodejs.org/ (LTS)

# Verificar después
node --version
npm --version
```

---

## ✅ Checklist de Verificación

### Backend

- [ ] `docker-compose up` completa sin errores
- [ ] `http://localhost:8000/health` retorna estado
- [ ] `http://localhost:8000/api/docs` abre Swagger
- [ ] Puedo registrar un usuario
- [ ] Puedo hacer login y recibo token
- [ ] Puedo buscar un Pokémon
- [ ] Puedo agregar a favoritos

### Frontend

- [ ] Frontend abre en `http://localhost:5173`
- [ ] Puedo hacer click en "Registrarse"
- [ ] Puedo llenar el formulario y registrarme
- [ ] Soy redirigido al login automáticamente
- [ ] Puedo hacer login
- [ ] Veo el dashboard con búsqueda
- [ ] Puedo buscar "pikachu" y ver detalles
- [ ] Puedo agregar a favoritos (el corazón se llena)
- [ ] Puedo ver mis favoritos en la pestaña

### API

- [ ] GET /health funciona
- [ ] POST /auth/register funciona
- [ ] POST /auth/login retorna token
- [ ] GET /auth/me funciona con token
- [ ] GET /pokemon/search/{name} funciona
- [ ] POST /favorites/add funciona
- [ ] GET /favorites/list funciona
- [ ] DELETE /favorites/remove/{id} funciona

---

## 📝 Notas Importantes

### Seguridad en Desarrollo

```env
# ⚠️ NUNCA uses esto en PRODUCCIÓN
SECRET_KEY=dev-key-not-secure  # Generar una real
DEBUG=True                     # Nunca en producción
DB_PASSWORD=password           # Usar contraseña segura
```

### Performance

- Primera llamada a PokéAPI tarda más (~1 segundo)
- Siguientes son más rápidas (cachés del servidor)
- Búsquedas locales (BD) son rápidas

### Límites

- La API de PokéAPI es GRATIS pero tiene límites
- No bombardear con requests muy rápido
- Máximo 1000 Pokémon en la BD

---

## 🚀 Siguientes Pasos

### Para Desarrollar

1. Leer `ARQUITECTURA_ES.md` para entender el diseño
2. Explorar código en `backend/app/services/`
3. Hacer cambios y ver reflejados en vivo
4. Agregar nuevas features

### Para Deployar

1. Leer `DEPLOYMENT_ES.md` (por crear)
2. Elegir plataforma (AWS, Heroku, DigitalOcean)
3. Configurar variables de producción
4. Push a GitHub
5. Deploy

### Para Mejorar

1. Agregar más tests
2. Implementar Claude AI (bonus)
3. Agregar analytics
4. Mejorar UI/UX

---

**¿Atorado? Preguntas? Revisa los logs:**

```bash
# Backend
docker-compose logs -f backend

# Frontend (en consola del navegador)
F12 → Console

# MySQL
docker-compose logs -f mysql
```

