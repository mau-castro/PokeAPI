# 🏗️ ARQUITECTURA.md - Decisiones Técnicas

## Visión General

```
CLIENTE (React)         SERVIDOR (FastAPI)        BD (MySQL)
    │                        │                        │
    ├─ Login ───────────────>│                        │
    │                        ├─ Valida ─────────────>│
    │<── JWT Token ─────────┤                        │
    │                        │                        │
    ├─ Buscar Pokémon ─────>│                        │
    │                        ├─ PokéAPI ──────────>  │
    │<─ Datos ──────────────┤                        │
    │                        │                        │
    ├─ Añadir Favorito ────>│                        │
    │                        ├─ INSERT ──────────────>│
    │<─ OK ──────────────────┤                        │
```

## 1. Backend: Arquitectura de Capas

### Patrón: 3-Tier Architecture

```
┌─────────────────────────────────┐
│    API Layer (app/api/*.py)     │ ← FastAPI routes, validación
├─────────────────────────────────┤
│  Service Layer (app/services/)  │ ← Lógica de negocio
├─────────────────────────────────┤
│  Data Layer (SQLAlchemy ORM)    │ ← Acceso a BD
├─────────────────────────────────┤
│  Database (MySQL)               │ ← Persistencia
└─────────────────────────────────┘
```

### Flujo de una Solicitud

```
request POST /favorites/add
  ↓
(app/api/favorites.py) → Validar con Pydantic
  ↓
(core/security.py) → Verificar JWT token
  ↓
(app/services/favorite_service.py) → Ejecutar lógica
  ↓
(app/models/), SQLAlchemy → Acceder BD
  ↓
response 201 Created
```

### Ejemplo: Agregar Favorito

```python
# 1. API Endpoint (app/api/favorites.py)
@router.post("/add")
async def add_favorite(
    fav: PokemonFavoriteCreate,
    user_id: int = Depends(get_current_user_id),
    session: Session = Depends(get_db)
):
    return FavoriteService.add_favorite(
        session=session,
        user_id=user_id,
        pokemon_id=fav.pokemon_id,
        pokemon_name=fav.pokemon_name
    )

# 2. Service Layer (app/services/favorite_service.py)
class FavoriteService:
    @staticmethod
    def add_favorite(session: Session, user_id: int, pokemon_id: int, pokemon_name: str):
        # Crear objeto
        fav = PokemonFavorite(
            user_id=user_id,
            pokemon_id=pokemon_id,
            pokemon_name=pokemon_name
        )
        # Guardar
        session.add(fav)
        session.commit()
        return {"message": "Agregado"}

# 3. Model (app/models/__init__.py)
class PokemonFavorite(Base):
    __tablename__ = "pokemon_favorites"
    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    pokemon_id = Column(Integer)
    pokemon_name = Column(String)
    added_at = Column(DateTime, default=datetime.utcnow)
```

## 2. Autenticación: Flow JWT

```
REGISTRO:
1. Usuario envía: { username, email, password }
   ↓
2. Backend hashea contraseña con bcrypt (10 rounds)
   ↓
3. Guarda en BD: User(username, email, hashed_password)
   ↓
4. Retorna: { user_id, username, email }

LOGIN:
1. Usuario envía: { email, password }
   ↓
2. Backend busca usuario por email
   ↓
3. Verifica: bcrypt.verify(password, hashed_password)
   ↓
4. Genera JWT: jwt.encode({"sub": user_id}, SECRET_KEY)
   ↓
5. Retorna: { access_token, token_type: "bearer" }

SOLICITUD PROTEGIDA:
1. Frontend envía: Authorization: Bearer {token}
   ↓
2. Backend extrae token del header
   ↓
3. Decodifica: jwt.decode(token, SECRET_KEY)
   ↓
4. Obtiene user_id del payload
   ↓
5. Permite acceso al endpoint
```

### Por qué JWT y no Sessions?

| Aspecto | JWT | Sessions |
|--------|-----|----------|
| **Almacenamiento** | Cliente | Servidor |
| **Escalabilidad** | ✅ Microservicios | ❌ Requiere BD |
| **Overhead** | Bajo | Alto (consultas) |
| **Seguridad** | Firmado, inmutable | Seguro pero pesado |
| **Mobile** | ✅ Fácil (header) | ❌ Cookies problémáticas |

## 3. Base de Datos: Schema

```sql
-- Tabla usuarios
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(120) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla favoritos
CREATE TABLE pokemon_favorites (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    pokemon_id INT NOT NULL,
    pokemon_name VARCHAR(100),
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE KEY unique_favorite (user_id, pokemon_id)
);
```

**Decisiones**:
- ✅ Foreign Key con ON DELETE CASCADE (eliminar favoritos al borrar usuario)
- ✅ Unique constraint en (user_id, pokemon_id) → No duplicados
- ✅ Índices implícitos en primary keys

## 4. Frontend: State Management

### Arquitectura React

```
App.jsx (Routing)
  ├─ AuthProvider (Context)
  │   ├─ user state
  │   ├─ token state
  │   └─ auth functions
  │
  ├─ Router
  │   ├─ HomePage (público)
  │   ├─ LoginPage (público)
  │   ├─ DashboardPage (protegido)
  │   └─ FavoritesPage (protegido)
  │
  └─ Navbar (siempre visible)
```

### Flujo de Autenticación React

```
1. Usuario hace click en "Login"
   ↓
2. React renderiza <LoginPage />
   ↓
3. Usuario completa formulario
   ↓
4. onClick → authService.login(email, password)
   ↓
5. Axios POST /auth/login
   ↓
6. Recibe: { access_token, token_type }
   ↓
7. Guarda en localStorage
   ↓
8. Actualiza AuthContext
   ↓
9. React renderiza <DashboardPage />
   ↓
10. Navbar muestra nombre del usuario
```

### Context API vs Redux

| Aspecto | Context | Redux |
|---------|---------|-------|
| **Setup** | Rápido | Complejo |
| **Boilerplate** | Mínimo | Mucho |
| **Performance** | OK para esto | Mejor con mucho estado |
| **Dependencias** | 0 | +1 lib |
| **Debugging** | Fácil | Redux DevTools |

**Conclusión**: Context API es suficiente para este proyecto (solo autenticación global)

## 5. Comunicación Frontend-Backend

### Axios Interceptores

```javascript
// api.js
const axiosInstance = axios.create({
    baseURL: process.env.VITE_API_URL
});

// Request: Agregar token automáticamente
axiosInstance.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response: Si 401, redirigir a login
axiosInstance.interceptors.response.use(
    response => response,
    error => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);
```

**Ventajas**:
- ✅ No repetir token en cada request
- ✅ Manejo automático de 401 (sesión expirada)
- ✅ Punto centralizado para lógica HTTP

## 6. Integración PokéAPI

```python
# services/pokemon_service.py
class PokemonService:
    @staticmethod
    async def get_pokemon(pokemon_id_or_name: str) -> dict:
        """Obtiene datos de PokéAPI"""
        async with httpx.AsyncClient() as client:
            # URL: https://pokeapi.co/api/v2/pokemon/bulbasaur
            response = await client.get(
                f"{POKEAPI_BASE_URL}/pokemon/{pokemon_id_or_name}"
            )
            return PokemonService._extract_pokemon_data(response.json())
    
    @staticmethod
    def _extract_pokemon_data(raw_data: dict) -> dict:
        """Transforma PokéAPI response a formato interno"""
        return {
            "id": raw_data["id"],
            "name": raw_data["name"].capitalize(),
            "types": [t["type"]["name"] for t in raw_data["types"]],
            "image_url": raw_data["sprites"]["front_default"],
            "stats": {
                stat["stat"]["name"]: stat["base_stat"]
                for stat in raw_data["stats"]
            }
        }
```

**Por qué async httpx?**
- ✅ No bloquea el thread
- ✅ Múltiples requests simultáneos
- ✅ Mejor rendimiento que requests síncrono

## 7. SOLID Principles en Código

### S - Single Responsibility

```python
# ❌ MAL: Service hace demasiado
class UserService:
    def create_user(self, data): ...
    def send_email(self, email): ...      # No es responsabilidad
    def validate_credit_card(self, cc): ...  # No es responsabilidad

# ✅ BIEN: Cada clase una responsabilidad
class UserService:
    def create_user(self, data): ...

class EmailService:
    def send_email(self, email): ...

class PaymentService:
    def validate_credit_card(self, cc): ...
```

### O - Open/Closed (Abierto para extensión, cerrado para modificación)

```python
# ✅ BIEN: Agregar nuevo endpoint sin tocar código existente
@router.get("/pokemon/abilities/{ability_name}")
async def get_ability(ability_name: str):
    # Nuevo endpoint, sin modificar nada anterior
    ...
```

### L - Liskov Substitution

```python
# ✅ BIEN: Subclases pueden reemplazar clase base
class PokemonSource:
    async def get_pokemon(self, id): pass

class PokemonFromAPI(PokemonSource):
    async def get_pokemon(self, id): ...

class PokemonFromCache(PokemonSource):
    async def get_pokemon(self, id): ...

# Ambas funcionan igual
```

### I - Interface Segregation

```python
# ❌ MAL: Una interfaz hace todo
class UserRepository:
    def create() ...
    def read() ...
    def update() ...
    def delete() ...
    def export_excel() ...     # ¿Por qué acá?
    def send_email() ...       # ¿Por qué acá?

# ✅ BIEN: Interfaces específicas
class UserRepository:
    def create() ...
    def read() ...
    def update() ...
    def delete() ...

class UserExporter:
    def export_excel() ...

class UserNotifier:
    def send_email() ...
```

### D - Dependency Inversion

```python
# ❌ MAL: Depende de implementación
class FavoriteService:
    def __init__(self):
        self.db = MySQLDatabase()  # Acoplado a MySQL

# ✅ BIEN: Depende de abstracción (inyectada)
class FavoriteService:
    def __init__(self, db: Database):
        self.db = db

# En FastAPI:
@router.post("/favorites")
def add_favorite(
    fav: PokemonFavoriteCreate,
    db: Session = Depends(get_db)  # Inyectada
):
    return FavoriteService(db).add(fav)
```

## 8. Validación con Pydantic

```python
# schemas/__init__.py
class UserCreate(BaseModel):
    """Validación automática"""
    username: str  # Requerido
    email: EmailStr  # Valida formato email
    password: str
    
    @field_validator('username')
    def username_valid(cls, v):
        if len(v) < 3:
            raise ValueError('Mínimo 3 caracteres')
        return v

class Config:
    from_attributes = True  # Convertir ORM a dict

# En endpoint:
@router.post("/users")
def create_user(user: UserCreate):
    # Si no cumple validación, retorna 422 automáticamente
    # Si cumple, user es instancia de UserCreate con datos validados
    ...
```

## 9. Manejo de Errores

```python
# ✅ BIEN: Errores específicos
@router.post("/auth/login")
def login(credentials: UserLogin):
    user = UserService.get_user_by_email(credentials.email)
    
    if not user:
        raise HTTPException(
            status_code=404,
            detail="Usuario no encontrado"
        )
    
    if not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=401,
            detail="Contraseña incorrecta"
        )
    
    return {"access_token": create_token(user.id)}
```

## 10. Docker: Por qué Compose?

```yaml
# docker-compose.yml organiza 3 servicios
services:
  mysql:
    image: mysql:8.0
    # Backend puede acceder como: mysql:3306
  
  backend:
    build: ./backend
    depends_on:
      - mysql
    # Frontend puede acceder como: backend:8000
  
  frontend:
    build: ./frontend
    depends_on:
      - backend
```

**Ventajas**:
- ✅ Un comando: `docker-compose up`
- ✅ Red interna automática entre servicios
- ✅ Coordina startup (waits for dependencies)
- ✅ Volumes para desarrollo en vivo

## 11. Performance: Conexión BD

```python
# core/database.py
engine = create_engine(
    DATABASE_URL,
    poolclass=QueuePool,
    pool_size=5,        # Máximo 5 conexiones
    max_overflow=10,    # +10 más si necesario
    pool_recycle=3600   # Recicla cada hora
)
```

**Por qué pooling?**
- ✅ Reutiliza conexiones (abrir es caro)
- ✅ Máximo de conexiones limitado
- ✅ Mejor throughput

## 12. Seguridad

### Contraseñas

```python
# ✅ Bcrypt con 10 rounds (slow hash)
hashed = pwd_context.hash(password)
# Resultado: $2b$10$... (no reversible)

# Verificación
is_valid = pwd_context.verify(password, hashed)
```

### CORS

```python
# ✅ Solo permite localhost:5173
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Validación de entrada

```python
# ✅ Pydantic valida automáticamente
# POST /auth/register
{
    "username": "usuario",      # ✅ string
    "email": "invalid",         # ❌ No es email válido → 422
    "password": "corta"         # ❌ < 8 caracteres → 422
}
```

---

## Resumen: ¿Por qué estas decisiones?

| Decisión | Razón |
|----------|-------|
| **FastAPI** | Async + Validación automática |
| **JWT** | Stateless, escalable |
| **MySQL** | ACID, confiable, ampliamente usado |
| **SQLAlchemy** | Type-safe, migraciones, relaciones |
| **React** | Popular, componentes reutilizables |
| **Context API** | Suficiente para estado global |
| **Tailwind** | Desarrollo rápido, consistente |
| **Docker** | Reproducible, mismo en dev y prod |
| **Capas** | Separación clara de responsabilidades |

