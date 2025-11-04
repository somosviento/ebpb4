# Guía de Deployment - EBPB4 Reservas

Esta guía describe cómo deployar la aplicación EBPB4 (FastAPI backend + React frontend) en un servidor Linux con Apache 2.

## Requisitos Previos

- Servidor Linux (Ubuntu/Debian recomendado)
- Apache 2.4+ instalado
- Python 3.10+ instalado
- Node.js 18+ y npm instalados
- Acceso root o sudo

## 1. Preparación del Servidor

### Instalar dependencias del sistema

```bash
sudo apt update
sudo apt install -y apache2 python3 python3-pip python3-venv nodejs npm
```

### Habilitar módulos de Apache necesarios

```bash
sudo a2enmod proxy
sudo a2enmod proxy_http
sudo a2enmod rewrite
sudo a2enmod ssl  # Si vas a usar HTTPS
sudo systemctl restart apache2
```

## 2. Deployment del Backend

### Crear directorio y clonar/copiar el proyecto

```bash
sudo mkdir -p /var/www/ebpb4
sudo chown -R $USER:$USER /var/www/ebpb4
cd /var/www/ebpb4

# Copiar los archivos del proyecto (ajustar según tu método de deployment)
# Opción 1: Git clone
# git clone https://tu-repositorio.git .

# Opción 2: Copiar archivos
# scp -r /ruta/local/* usuario@servidor:/var/www/ebpb4/
```

### Configurar el entorno virtual de Python

```bash
cd /var/www/ebpb4
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

### Configurar variables de entorno

Crear archivo `.env` en `/var/www/ebpb4/`:

```bash
nano .env
```

Contenido del archivo `.env`:

```env
# API Configuration
API_PREFIX=/api
SECRET_KEY=tu_clave_secreta_muy_segura_cambiala_urgente
ADMIN_TOKEN=tu_token_admin_seguro

# Database (SQLite)
DATABASE_URL=sqlite:///./ebpb.db

# OpenAPI
EXPORT_OPENAPI=false
```

**IMPORTANTE**: Genera claves seguras para `SECRET_KEY` y `ADMIN_TOKEN`:

```bash
# Generar claves aleatorias
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

### Ajustar permisos

```bash
sudo chown -R www-data:www-data /var/www/ebpb4
sudo chmod 600 /var/www/ebpb4/.env
sudo chmod 664 /var/www/ebpb4/ebpb.db  # Si ya existe el archivo de base de datos
```

### Configurar systemd service

Copiar el archivo de servicio:

```bash
sudo cp /var/www/ebpb4/ebpb-api.service /etc/systemd/system/
```

Habilitar e iniciar el servicio:

```bash
sudo systemctl daemon-reload
sudo systemctl enable ebpb-api
sudo systemctl start ebpb-api
sudo systemctl status ebpb-api
```

Verificar logs si hay problemas:

```bash
sudo journalctl -u ebpb-api -f
```

**Nota sobre SQLite**: El archivo `ebpb.db` se creará automáticamente en `/var/www/ebpb4/` al iniciar el servicio. Asegúrate de que el usuario `www-data` tenga permisos de escritura en el directorio.

## 4. Deployment del Frontend

### Build del frontend

```bash
cd /var/www/ebpb4/frontend
npm install
npm run build
```

Esto generará los archivos estáticos en `/var/www/ebpb4/frontend/dist/`

## 5. Configuración de Apache

### Crear configuración del sitio

Crear archivo `/etc/apache2/sites-available/ebpb4.conf`:

```bash
sudo nano /etc/apache2/sites-available/ebpb4.conf
```

Contenido del archivo (ajustar el dominio según tu caso):

```apache
<VirtualHost *:80>
    ServerName tu-dominio.com
    ServerAdmin admin@tu-dominio.com

    # Logs
    ErrorLog ${APACHE_LOG_DIR}/ebpb4-error.log
    CustomLog ${APACHE_LOG_DIR}/ebpb4-access.log combined

    # Servir el frontend estático desde la carpeta dist de Vite
    DocumentRoot /var/www/ebpb4/frontend/dist

    <Directory /var/www/ebpb4/frontend/dist>
        Options -Indexes +FollowSymLinks
        AllowOverride All
        Require all granted

        # React Router: redirigir todas las rutas al index.html
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>

    # Proxy para el API backend (FastAPI en puerto 8000)
    ProxyPreserveHost On
    ProxyPass /api http://127.0.0.1:8000/api
    ProxyPassReverse /api http://127.0.0.1:8000/api

    # Asegurar que los archivos estáticos no pasen por el proxy
    ProxyPass /assets !
    ProxyPass /favicon.ico !
    ProxyPass /robots.txt !

    # Headers de seguridad
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-Frame-Options "DENY"
    Header always set X-XSS-Protection "1; mode=block"
</VirtualHost>
```

### Habilitar el sitio

```bash
sudo a2ensite ebpb4.conf
sudo apache2ctl configtest  # Verificar configuración
sudo systemctl reload apache2
```

### Deshabilitar sitio por defecto (opcional)

```bash
sudo a2dissite 000-default.conf
sudo systemctl reload apache2
```

## 6. Configuración HTTPS con Let's Encrypt (Recomendado)

### Instalar Certbot

```bash
sudo apt install -y certbot python3-certbot-apache
```

### Obtener certificado SSL

```bash
sudo certbot --apache -d tu-dominio.com
```

Certbot configurará automáticamente Apache para HTTPS y creará un archivo de configuración adicional.

## 7. Verificación

### Verificar el backend

```bash
curl http://localhost:8000/api/docs
# Debería devolver la documentación de la API
```

### Verificar el sitio completo

Abrir en el navegador:
- `http://tu-dominio.com` - Frontend
- `http://tu-dominio.com/api/docs` - Documentación del API

## 8. Mantenimiento

### Ver logs del backend

```bash
sudo journalctl -u ebpb-api -f
```

### Ver logs de Apache

```bash
sudo tail -f /var/log/apache2/ebpb4-error.log
sudo tail -f /var/log/apache2/ebpb4-access.log
```

### Reiniciar servicios

```bash
# Backend
sudo systemctl restart ebpb-api

# Apache
sudo systemctl restart apache2
```

### Actualizar la aplicación

```bash
# 1. Actualizar código
cd /var/www/ebpb4
git pull  # o copiar archivos nuevos

# 2. Actualizar backend
source .venv/bin/activate
pip install -r requirements.txt
sudo systemctl restart ebpb-api

# 3. Actualizar frontend
cd frontend
npm install
npm run build
sudo systemctl reload apache2
```

## 9. Troubleshooting

### El backend no inicia

```bash
# Verificar logs
sudo journalctl -u ebpb-api -n 50

# Verificar que el puerto no esté en uso
sudo netstat -tulpn | grep 8000

# Probar manualmente
cd /var/www/ebpb4
source .venv/bin/activate
uvicorn main:app --host 127.0.0.1 --port 8000
```

### Error 502 Bad Gateway

- Verificar que el servicio ebpb-api esté corriendo: `sudo systemctl status ebpb-api`
- Verificar que Apache pueda conectarse al puerto 8000
- Revisar logs de Apache y del servicio

### Error 403 Forbidden

- Verificar permisos: `sudo chown -R www-data:www-data /var/www/ebpb4/frontend/dist`
- Verificar configuración de Apache en `<Directory>`

### Frontend no carga rutas correctamente

- Verificar que `RewriteEngine On` esté habilitado en la configuración de Apache
- Verificar que el módulo rewrite esté activo: `sudo a2enmod rewrite`

## 10. Seguridad Adicional

### Configurar firewall

```bash
sudo ufw allow 'Apache Full'
sudo ufw allow OpenSSH
sudo ufw enable
```

### Limitar acceso al endpoint de administración (opcional)

En el archivo de configuración de Apache, agregar:

```apache
<Location /api/admin>
    Require ip 192.168.1.0/24  # Ajustar a tu red
</Location>
```

### Backup de la base de datos

Crear script de backup:

```bash
#!/bin/bash
# /var/www/ebpb4/backup.sh
BACKUP_DIR="/var/backups/ebpb4"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
mkdir -p $BACKUP_DIR

# Backup del archivo SQLite
cp /var/www/ebpb4/ebpb.db "$BACKUP_DIR/ebpb_db_$TIMESTAMP.db"
gzip "$BACKUP_DIR/ebpb_db_$TIMESTAMP.db"

# Mantener solo los últimos 7 días
find $BACKUP_DIR -name "ebpb_db_*.db.gz" -mtime +7 -delete
```

Hacer ejecutable y agregar a cron:

```bash
chmod +x /var/www/ebpb4/backup.sh
sudo crontab -e
# Agregar: 0 2 * * * /var/www/ebpb4/backup.sh
```

## Notas Finales

- **Cambiar todas las contraseñas y tokens por valores seguros**
- Configurar HTTPS para producción (Let's Encrypt es gratuito)
- Monitorear logs regularmente
- Mantener sistema y dependencias actualizadas
- Realizar backups periódicos del archivo `ebpb.db`
- **SQLite**: El archivo de base de datos es portátil, puedes copiarlo fácilmente para backups o migración
- Para producción con alto tráfico, considera migrar a PostgreSQL en el futuro si es necesario
