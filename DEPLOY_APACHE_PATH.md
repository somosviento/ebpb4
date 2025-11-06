# Deployment Guide (Apache, path-based at /ebpb)

This guide describes how to deploy the EBPB4 app (FastAPI backend + React frontend) under a base path `/ebpb` on an existing Apache vhost, coexisting with other apps on the same host.

- Example final URLs:
  - Frontend (SPA): https://your-domain/ebpb/
  - API: https://your-domain/ebpb/api/
  - API docs: https://your-domain/ebpb/api/docs

## 0) Prerequisites

- Apache 2.4+ with modules: proxy, proxy_http, headers, expires, dir
- Python 3.10+, Node.js 18+ on the build machine
- A directory to host the app code, e.g. `/opt/ebpb4` on the server
- A directory to host the built frontend, e.g. `/var/www/ebpb/`

## 1) Backend setup (systemd + uvicorn)

1. Copy or checkout the project to `/opt/ebpb4`.

2. Create a Python virtualenv and install dependencies:

```bash
cd /opt/ebpb4
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

3. Create `.env` in `/opt/ebpb4` with at least:

```env
# Backend
API_PREFIX=/api
ROOT_PATH=/ebpb
SECRET_KEY=CHANGE_ME
ADMIN_TOKEN=CHANGE_ME
DATABASE_URL=sqlite:///./ebpb.db
EXPORT_OPENAPI=0
```

4. Create a systemd unit `/etc/systemd/system/ebpb-api.service` (adjust paths):

```ini
[Unit]
Description=EBPB FastAPI (Uvicorn)
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/opt/ebpb4
EnvironmentFile=-/opt/ebpb4/.env
ExecStart=/opt/ebpb4/.venv/bin/uvicorn main:app --host 127.0.0.1 --port 8000 --workers 3
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

Enable and start:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now ebpb-api
sudo journalctl -u ebpb-api -f
```

## 2) Frontend build for /ebpb

Build artifacts must use `/ebpb/` as base and call the API under `/ebpb/api`.

From `/opt/ebpb4/frontend`:

```bash
npm install
VITE_BASE=/ebpb/ VITE_API_BASE=/ebpb/api npm run build
```

Copy the built files to Apache's document directory:

```bash
sudo mkdir -p /var/www/ebpb
sudo rsync -a --delete dist/ /var/www/ebpb/
sudo chown -R www-data:www-data /var/www/ebpb
```

## 3) Apache config (coexisting with other apps)

Add this to your existing SSL vhost (inside `<VirtualHost *:443>`), alongside your other apps. Adjust paths and domain as needed.

```apache
# 1) Serve SPA under /ebpb/
Alias /ebpb/ "/var/www/ebpb/"
<Directory "/var/www/ebpb/">
    Options -Indexes +FollowSymLinks
    AllowOverride None
    Require all granted

    <IfModule mod_expires.c>
        ExpiresActive On
        ExpiresDefault "access plus 30 days"
    </IfModule>
    <IfModule mod_headers.c>
        Header set Cache-Control "public, max-age=2592000, immutable"
    </IfModule>

    # SPA fallback
    <IfModule mod_dir.c>
        FallbackResource /ebpb/index.html
    </IfModule>
</Directory>

# 2) Reverse proxy API under /ebpb/api/ → uvicorn at 127.0.0.1:8000
# Forward to backend /api/ path to match the app's API_PREFIX
ProxyPreserveHost On
RequestHeader set X-Forwarded-Proto "https"

ProxyPass        /ebpb/api/ http://127.0.0.1:8000/api/
ProxyPassReverse /ebpb/api/ http://127.0.0.1:8000/api/
```

Reload Apache:

```bash
sudo apache2ctl configtest
sudo systemctl reload apache2
```

## 4) Verify

- Frontend: https://your-domain/ebpb/
- API docs: https://your-domain/ebpb/api/docs

If docs show wrong base URLs, ensure systemd has `EnvironmentFile` with `ROOT_PATH=/ebpb` and the service has been restarted.

## 5) Updating (resync flow)

When pushing a new version:

```bash
# On server
cd /opt/ebpb4
# update code (git pull or rsync your release)
# git pull

# Backend update
source .venv/bin/activate
pip install -r requirements.txt
sudo systemctl restart ebpb-api

# Frontend rebuild
cd frontend
npm install
VITE_BASE=/ebpb/ VITE_API_BASE=/ebpb/api npm run build

# Deploy static files
sudo rsync -a --delete dist/ /var/www/ebpb/
sudo chown -R www-data:www-data /var/www/ebpb

# Reload Apache (usually not required for static changes, but safe)
sudo systemctl reload apache2
```

## 6) Troubleshooting

- 502 from /ebpb/api/ → check `sudo systemctl status ebpb-api` and `journalctl -u ebpb-api -n 100`.
- SPA deep-link 404 → ensure `FallbackResource /ebpb/index.html` is active and `mod_dir` is enabled.
- Assets 404 under /ebpb/ → verify you built with `VITE_BASE=/ebpb/` and uploaded `dist/` to `/var/www/ebpb/`.
- OpenAPI shows wrong server URLs → confirm `ROOT_PATH=/ebpb` is in `.env` and the service restarted.

## 7) Notes

- If you prefer to run uvicorn on a different port, adjust Apache `ProxyPass` lines accordingly.
- For PostgreSQL, set `DATABASE_URL` accordingly in `.env`.
- CORS is set permissive by default; since frontend and backend share host and scheme, CORS should not be necessary for browser use.
