# DEPLOYMENT.md - Gu�a de Despliegue a Producci�n

## Variables de Entorno (Producci�n)

### Backend (.env.production)

```env
DB_HOST=host-produccion
DB_USER=usuario_prod
DB_PASSWORD=contrasena_segura
DB_NAME=pokedex_manager_prod
DB_PORT=3306

SECRET_KEY=generar-con-python-secrets
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

POKEAPI_BASE_URL=https://pokeapi.co/api/v2

CLAUDE_API_KEY=tu_clave_claude
CLAUDE_MODEL=claude-3-5-sonnet-20241022

DEBUG=False
```

### Frontend (.env.production)

```env
VITE_API_URL=https://api.tu-dominio.com
```

## Estrategia Recomendada

Desplegar con Docker Compose en servidor Linux + Nginx como reverse proxy.

## Opci�n 1: VPS (Docker + Nginx)

1. Instalar Docker y Docker Compose.
2. Clonar repositorio.
3. Configurar `.env.production`.
4. Levantar servicios con `docker-compose -f docker-compose.yml up -d --build`.
5. Configurar HTTPS con Let's Encrypt y Nginx.

### Comandos base

```bash
# Build y deploy
docker-compose up -d --build

# Ver estado
docker-compose ps

# Logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mysql

# Reinicio de servicio
docker-compose restart backend
```

## Opci�n 2: AWS EC2 + RDS

- EC2 para frontend/backend (containers)
- RDS MySQL para base de datos administrada
- Security Groups: 80/443 abiertos, 3306 restringido
- Certificado TLS con ACM o Let's Encrypt

## Opci�n 3: DigitalOcean / Render / Railway

- Compatible con la arquitectura actual
- Recomendado separar BD gestionada del runtime de app

## Nginx (Reverse Proxy)

Ejemplo base:

```nginx
server {
    listen 80;
    server_name tu-dominio.com;

    location / {
        proxy_pass http://frontend:5173;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Checklist de Seguridad

- [ ] `SECRET_KEY` robusta (32+ chars)
- [ ] `DEBUG=False`
- [ ] HTTPS habilitado
- [ ] Contrase�as seguras en BD
- [ ] Variables sensibles fuera de Git
- [ ] CORS restringido a dominios reales
- [ ] Backups autom�ticos de MySQL

## Backups

### Crear backup

```bash
docker-compose exec -T mysql mysqldump -u$DB_USER -p$DB_PASSWORD $DB_NAME > backup.sql
```

### Restaurar backup

```bash
docker-compose exec -T mysql mysql -u$DB_USER -p$DB_PASSWORD $DB_NAME < backup.sql
```

## Observabilidad

Recomendado agregar:

- Uptime monitor (UptimeRobot)
- Error tracking (Sentry)
- Logs centralizados
- Endpoint de salud (`/health`) en uptime checks

## Escalado

### Horizontal

- M�ltiples r�plicas del backend detr�s de Nginx/LB
- JWT permite escalar sin estado de sesi�n

### Base de datos

- �ndices para consultas frecuentes
- Read replicas si crece carga de lectura
- Pool de conexiones configurado en SQLAlchemy

## CI/CD (Sugerido)

Pipeline m�nimo:

1. Ejecutar tests backend/frontend
2. Build de im�genes Docker
3. Push a registry
4. Deploy autom�tico en servidor

## Verificaci�n Post-Deploy

- [ ] Registro y login funcionan
- [ ] B�squeda de Pok�mon responde correctamente
- [ ] Favoritos persisten en BD
- [ ] `/api/docs` disponible
- [ ] `/health` devuelve estado OK
- [ ] Certificado SSL v�lido

## Plan de Recuperaci�n

- Definir RTO y RPO
- Mantener backups diarios
- Probar restauraci�n peri�dicamente
- Documentar procedimiento de rollback
