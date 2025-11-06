# Troubleshooting - EBPB4

## Error 404 al crear solicitud en producción

### Síntomas
- Al hacer clic en "Crear Solicitud" aparece en consola: `Failed to load resource: the server responded with a status of 404 (Not Found)`
- El frontend funciona pero las llamadas al API fallan

### Causas comunes y soluciones

#### 1. ROOT_PATH no configurado correctamente

**Verificar:**
```bash
# En el servidor
cat /var/www/ebpb4/.env | grep ROOT_PATH
```

**Solución:**
- Si servís desde la raíz (`http://tudominio.com/`): `ROOT_PATH=` (vacío o comentado)
- Si servís desde subdirectorio (`http://tudominio.com/ebpb/`): `ROOT_PATH=/ebpb`

Después de cambiar, reiniciar el servicio:
```bash
sudo systemctl restart ebpb-api
```

#### 2. Proxy de Apache mal configurado

**Verificar la configuración de Apache:**
```bash
sudo cat /etc/apache2/sites-available/ebpb4.conf
```

**Debe tener estas líneas:**
```apache
# Proxy para el API (ANTES de las exclusiones de archivos estáticos)
ProxyPreserveHost On
ProxyPass /api http://127.0.0.1:8000/api
ProxyPassReverse /api http://127.0.0.1:8000/api

# Exclusiones (DESPUÉS del proxy)
ProxyPass /assets !
ProxyPass /favicon.ico !
ProxyPass /robots.txt !
```

**IMPORTANTE:** El orden importa. Las reglas `ProxyPass /api` deben estar ANTES de las exclusiones (`ProxyPass /assets !`).

Después de cambiar:
```bash
sudo apache2ctl configtest
sudo systemctl reload apache2
```

#### 3. Backend no está corriendo

**Verificar:**
```bash
sudo systemctl status ebpb-api
```

**Si no está corriendo:**
```bash
sudo systemctl start ebpb-api
sudo journalctl -u ebpb-api -f  # Ver logs
```

**Verificar que el puerto 8000 esté escuchando:**
```bash
sudo netstat -tulpn | grep 8000
```

Deberías ver algo como:
```
tcp        0      0 127.0.0.1:8000          0.0.0.0:*               LISTEN      12345/python
```

#### 4. Probar el API directamente

**Desde el servidor:**
```bash
curl http://127.0.0.1:8000/api/docs
```

Debería devolver HTML de la documentación de FastAPI.

**Desde el navegador:**
```
http://tudominio.com/api/docs
```

Si esto funciona, el proxy está bien configurado.

#### 5. Revisar logs

**Logs del backend:**
```bash
sudo journalctl -u ebpb-api -n 50 --no-pager
```

**Logs de Apache:**
```bash
sudo tail -f /var/log/apache2/ebpb4-error.log
sudo tail -f /var/log/apache2/ebpb4-access.log
```

#### 6. Módulos de Apache necesarios

Verificar que estén habilitados:
```bash
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo a2enmod rewrite
sudo systemctl restart apache2
```

### Verificación completa paso a paso

```bash
# 1. Verificar configuración del backend
cat /var/www/ebpb4/.env

# 2. Verificar que el servicio esté corriendo
sudo systemctl status ebpb-api

# 3. Probar el API directamente
curl http://127.0.0.1:8000/api/docs

# 4. Verificar configuración de Apache
sudo apache2ctl -S  # Ver todos los virtual hosts
sudo apache2ctl configtest  # Verificar sintaxis

# 5. Ver logs en tiempo real
sudo journalctl -u ebpb-api -f &
sudo tail -f /var/log/apache2/ebpb4-error.log
```

Luego intentar crear una solicitud y observar los logs.

### Configuración de ejemplo para deployment en raíz del dominio

**Backend `.env`:**
```env
API_PREFIX=/api
ROOT_PATH=
SECRET_KEY=tu_clave_super_secreta
DATABASE_URL=sqlite:///./ebpb.db
```

**Apache `/etc/apache2/sites-available/ebpb4.conf`:**
```apache
<VirtualHost *:80>
    ServerName tudominio.com
    DocumentRoot /var/www/ebpb4/frontend/dist

    <Directory /var/www/ebpb4/frontend/dist>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted
        
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>

    ProxyPreserveHost On
    ProxyPass /api http://127.0.0.1:8000/api
    ProxyPassReverse /api http://127.0.0.1:8000/api

    ProxyPass /assets !
    ProxyPass /favicon.ico !
    ProxyPass /robots.txt !
    
    ErrorLog ${APACHE_LOG_DIR}/ebpb4-error.log
    CustomLog ${APACHE_LOG_DIR}/ebpb4-access.log combined
</VirtualHost>
```

**Build del frontend:**
```bash
cd /var/www/ebpb4/frontend
npm run build  # Sin variables de entorno adicionales
```

## Otros problemas comunes

### Frontend muestra página en blanco

**Causa:** Archivos JavaScript no se cargan correctamente por paths incorrectos.

**Solución:**
- Verificar que `index.html` tenga los scripts correctamente referenciados
- Si servís desde subdirectorio, verificar que hayas buildeado con `VITE_BASE=/subdirectorio/`

### Errores CORS

**Síntoma:** En consola del navegador aparece error de CORS.

**Solución:**
El backend ya tiene CORS configurado para permitir todos los orígenes en desarrollo. En producción, considera restringirlo:

En `main.py`:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://tudominio.com"],  # Especificar dominio
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Base de datos SQLite locked

**Síntoma:** Error "database is locked"

**Solución:**
```bash
# Verificar permisos
sudo chown www-data:www-data /var/www/ebpb4/ebpb.db
sudo chmod 664 /var/www/ebpb4/ebpb.db

# Verificar que el directorio también tenga permisos
sudo chown www-data:www-data /var/www/ebpb4
```
