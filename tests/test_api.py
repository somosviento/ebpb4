from datetime import date, timedelta


def test_post_investigacion_success(client):
    payload = {
        "tipo_solicitud": "investigacion",
        "objetivos": "obj",
        "actividades": "act",
        "fecha_inicio_actividad_general": date.today().isoformat(),
        "fecha_fin_actividad_general": date.today().isoformat(),
        "responsable_apellido_nombre": "Resp X",
        "responsable_dni": "111",
        "responsable_email_principal": "x@example.com",
        "integrantes": [
            {
                "apellido": "A",
                "nombres": "B",
                "dni": "1",
                "reservas_detalladas": [
                    {
                        "fecha": date.today().isoformat(),
                        "es_diurno": True,
                        "es_pernocte": False,
                    }
                ],
            }
        ],
    }

    r = client.post("/api/solicitudes/investigacion", json=payload)
    assert r.status_code == 201, r.text
    data = r.json()
    assert data["tipo_solicitud"] == "investigacion"
    assert len(data["participantes"]) == 1


def test_disponibilidad_endpoint(client):
    fecha = (date.today() + timedelta(days=5)).isoformat()
    r = client.get(f"/api/reservas/disponibilidad/{fecha}")
    assert r.status_code == 200
    data = r.json()
    assert data["plazas_pernocte_disponibles"] == 12


def test_pernocte_limit_api(client):
    fecha = (date.today() + timedelta(days=10)).isoformat()

    # create 12 participants with pernocte True
    payloads = []
    for i in range(12):
        payloads.append(
            {
                "tipo_solicitud": "investigacion",
                "objetivos": "obj",
                "actividades": "act",
                "fecha_inicio_actividad_general": date.today().isoformat(),
                "fecha_fin_actividad_general": date.today().isoformat(),
                "responsable_apellido_nombre": "Resp X",
                "responsable_dni": "111",
                "responsable_email_principal": "x@example.com",
                "integrantes": [
                    {
                        "apellido": f"A{i}",
                        "nombres": "B",
                        "dni": str(i),
                        "reservas_detalladas": [
                            {
                                "fecha": fecha,
                                "es_diurno": False,
                                "es_pernocte": True,
                            }
                        ],
                    }
                ],
            }
        )

    for p in payloads:
        r = client.post("/api/solicitudes/investigacion", json=p)
        assert r.status_code == 201, r.text

    # 13th should fail
    p13 = payloads[0].copy()
    p13["integrantes"][0]["dni"] = "999"
    resp = client.post("/api/solicitudes/investigacion", json=p13)
    assert resp.status_code in (400, 409)
    assert "No hay plazas" in resp.text
