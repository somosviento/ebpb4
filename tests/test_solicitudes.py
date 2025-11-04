from datetime import date

from sqlalchemy.orm import Session

from schemas.solicitudes import SolicitudInvestigacionCreate, SolicitudCatedrasCreate
from schemas.participantes import ParticipanteCreate
from schemas.reservas import ReservaDetalleCreate
from crud.solicitudes import create_solicitud


def test_create_solicitud_investigacion(db_session: Session):
    payload = SolicitudInvestigacionCreate(
        objetivos="obj",
        actividades="act",
        sitios=None,
        infraestructuras=None,
        otras_aclaraciones=None,
        fecha_inicio_actividad_general=date.today(),
        fecha_fin_actividad_general=date.today(),
        responsable_apellido_nombre="Resp X",
        responsable_dni="111",
        responsable_email_principal="x@example.com",
        integrantes=[
            ParticipanteCreate(
                apellido="A",
                nombres="B",
                dni="1",
                reservas_detalladas=[
                    ReservaDetalleCreate(
                        fecha=date.today(), es_diurno=True, es_pernocte=False
                    )
                ],
            )
        ],
    )

    s = create_solicitud(db_session, payload)
    db_session.commit()

    assert s.id is not None
    assert s.tipo_solicitud == "investigacion"
    assert len(s.participantes) == 1


def test_create_solicitud_catedras(db_session: Session):
    payload = SolicitudCatedrasCreate(
        objetivos="obj",
        actividades="act",
        sitios=None,
        infraestructuras=None,
        otras_aclaraciones=None,
        fecha_inicio_actividad_general=date.today(),
        fecha_fin_actividad_general=date.today(),
        responsable_apellido_nombre="Resp X",
        responsable_dni="111",
        responsable_email_principal="x@example.com",
        asignatura="Biologia",
        requiere_pasajes=True,
        integrantes=[],
    )

    s = create_solicitud(db_session, payload)
    db_session.commit()

    assert s.id is not None
    assert s.tipo_solicitud == "catedras"
