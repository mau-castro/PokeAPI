# CONTRIBUTING.md - Gu�a de Contribuci�n

## Objetivo

Mantener un est�ndar profesional de c�digo para el proyecto Pok�Dex Manager, priorizando Clean Code, SOLID y mantenibilidad.

## Est�ndares de C�digo

### Backend (Python)

- Nombres descriptivos en ingl�s para funciones, clases y variables.
- Type hints obligatorios en funciones p�blicas.
- Docstrings obligatorias en servicios, utilidades y endpoints no triviales.
- Funciones con responsabilidad �nica.
- Evitar duplicaci�n de l�gica (DRY).

Ejemplo de convenciones:

```python
class UserService:
    pass

def get_user_by_id(user_id: int) -> User | None:
    pass

MAX_RETRY_ATTEMPTS = 3
```

### Frontend (React)

- Componentes peque�os y reutilizables.
- Separar UI, estado y l�gica de llamadas HTTP.
- Evitar componentes monol�ticos con demasiada responsabilidad.
- Mantener consistencia con Tailwind.

### Comentarios y Documentaci�n

- Los comentarios deben explicar el por qu�, no solo el qu�.
- Evitar comentarios redundantes.
- Mantener documentaci�n actualizada cuando cambie el comportamiento.

## Flujo de Trabajo con Git

1. Crear rama desde `main`:

```bash
git checkout -b feature/nombre-corto
```

2. Realizar cambios peque�os y coherentes.
3. Ejecutar pruebas antes de commit.
4. Hacer commit con mensaje claro:

```bash
git commit -m "feat: add favorites pagination"
```

5. Abrir Pull Request con descripci�n funcional y t�cnica.

## Convenci�n de Commits

Usar estilo sem�ntico:

- `feat:` nueva funcionalidad
- `fix:` correcci�n de bug
- `refactor:` mejora interna sin cambiar comportamiento
- `docs:` cambios de documentaci�n
- `test:` pruebas
- `chore:` tareas de mantenimiento

Ejemplos:

- `feat: add JWT refresh endpoint`
- `fix: handle null pokemon image`
- `refactor: extract auth token parser`

## Pull Request Checklist

- [ ] El c�digo compila y ejecuta correctamente.
- [ ] Las pruebas existentes pasan.
- [ ] Se agregaron pruebas para comportamiento nuevo (si aplica).
- [ ] No se rompe compatibilidad de endpoints actuales.
- [ ] Se actualizaron docs relevantes.
- [ ] Se valid� manejo de errores.

## Gu�a de Pruebas

### Backend

```bash
cd backend
pytest tests/ -v
```

### Frontend

```bash
cd frontend
npm test
```

## Dise�o y Arquitectura

Antes de agregar nuevas features:

1. Definir si pertenece a API, servicio o capa de datos.
2. Evitar l�gica de negocio en routers/controladores.
3. Reusar servicios existentes cuando sea posible.
4. Si un archivo crece demasiado, dividir en m�dulos.

## Seguridad

- Nunca hardcodear secretos.
- Usar variables de entorno.
- Validar entradas en backend.
- Mantener tokens fuera de logs.
- Sanitizar inputs cuando corresponda.

## Issues Comunes

- Cambios grandes en un solo PR: dividir en entregas m�s peque�as.
- Falta de pruebas de regresi�n: agregar casos m�nimos.
- Duplicaci�n de l�gica entre servicios: extraer utilidades compartidas.

## Recursos

- FastAPI: https://fastapi.tiangolo.com
- SQLAlchemy: https://docs.sqlalchemy.org
- React: https://react.dev
- Tailwind CSS: https://tailwindcss.com
