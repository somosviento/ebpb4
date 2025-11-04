import httpx, json
from datetime import date

BASE = "http://127.0.0.1:8001"
TOKEN = "1234"

client = httpx.Client()

def p(label, resp):
    try:
        body = resp.json()
    except Exception:
        body = resp.text
    print(f"{label}: {resp.status_code} -> {body}")

# 0) Public health-ish call
resp = client.get(f"{BASE}/api/reservas/disponibilidad/{date.today().isoformat()}")
p("GET disponibilidad", resp)

# 1) Create solicitud (public)
payload = {
    "tipo_solicitud": "investigacion",
    "objetivos": "o",
    "actividades": "a",
    "fecha_inicio_actividad_general": date.today().isoformat(),
    "fecha_fin_actividad_general": date.today().isoformat(),
    "responsable_apellido_nombre": "Admin",
    "responsable_dni": "1",
    "responsable_email_principal": "a@b.com",
    "integrantes": [],
}
resp = client.post(f"{BASE}/api/solicitudes/investigacion", json=payload)
p("POST crear solicitud", resp)
sid = resp.json()["id"]

# 2) Admin: add participante without token (should 401)
payload_p = {"apellido": "Test", "nombres": "User", "dni": "999", "reservas_detalladas": []}
resp = client.post(f"{BASE}/api/admin/solicitudes/{sid}/participantes", json=payload_p)
p("POST admin participante sin token", resp)

# 3) Admin: add participante with token (should 200)
resp = client.post(
    f"{BASE}/api/admin/solicitudes/{sid}/participantes",
    json=payload_p,
    headers={"Authorization": f"Bearer {TOKEN}"},
)
p("POST admin participante con token", resp)
pid = resp.json()["id"]

# 4) Admin: add reserva for participante (should 200)
reserva = {"fecha": date.today().isoformat(), "es_diurno": True, "es_pernocte": False}
resp = client.post(
    f"{BASE}/api/admin/participantes/{pid}/reservas",
    json=reserva,
    headers={"Authorization": f"Bearer {TOKEN}"},
)
p("POST admin reserva con token", resp)
pr_id = resp.json()["id"]

# 5) Admin: delete reserva without token (should 401)
resp = client.delete(f"{BASE}/api/admin/participantes-reservas/{pr_id}")
p("DELETE admin reserva sin token", resp)

# 6) Admin: delete reserva with token (should 204)
resp = client.delete(
    f"{BASE}/api/admin/participantes-reservas/{pr_id}",
    headers={"Authorization": f"Bearer {TOKEN}"},
)
p("DELETE admin reserva con token", resp)
