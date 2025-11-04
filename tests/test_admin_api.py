from datetime import date
import os


def test_admin_routes_protected(client):
    r = client.post("/api/admin/participantes/1/reservas", json={"fecha": date.today().isoformat(), "es_diurno": True, "es_pernocte": False})
    assert r.status_code == 401


def test_admin_add_participante_and_reservas(client):
    # set admin token for this test client context
    admin_token = "test-admin"
    os.environ["ADMIN_TOKEN"] = admin_token

    # create a solicitud first via public endpoint
    payload = {
        "tipo_solicitud": "investigacion",
        "objetivos": "obj",
        "actividades": "act",
        "fecha_inicio_actividad_general": date.today().isoformat(),
        "fecha_fin_actividad_general": date.today().isoformat(),
        "responsable_apellido_nombre": "Resp X",
        "responsable_dni": "111",
        "responsable_email_principal": "x@example.com",
        "integrantes": [],
    }
    r = client.post("/api/solicitudes/investigacion", json=payload)
    assert r.status_code == 201
    solicitud_id = r.json()["id"]

    # add participante as admin
    participante = {
        "apellido": "Admin",
        "nombres": "User",
        "dni": "999",
        "reservas_detalladas": [],
    }
    r = client.post(
        f"/api/admin/solicitudes/{solicitud_id}/participantes",
        json=participante,
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert r.status_code == 200, r.text
    participante_id = r.json()["id"]

    # add a reserva for that participante
    reserva = {"fecha": date.today().isoformat(), "es_diurno": True, "es_pernocte": False}
    r = client.post(
        f"/api/admin/participantes/{participante_id}/reservas",
        json=reserva,
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert r.status_code == 200
    pr_id = r.json()["id"]

    # delete the reserva
    r = client.delete(
        f"/api/admin/participantes-reservas/{pr_id}",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert r.status_code == 204
