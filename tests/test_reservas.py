from datetime import date, timedelta

from sqlalchemy.orm import Session

from crud.reservas import get_or_create_reserva_diaria, check_pernocte_availability, add_participante_reserva
from models.reservas import ReservaDiaria
from models.participantes import Participante
from models.solicitudes import SolicitudInvestigacion


def make_participante(db: Session, solicitud_id: int) -> Participante:
    p = Participante(
        solicitud_id=solicitud_id,
        apellido="Test",
        nombres="User",
        dni="123",
    )
    db.add(p)
    db.flush()
    return p


def make_solicitud(db: Session) -> SolicitudInvestigacion:
    s = SolicitudInvestigacion(
        tipo_solicitud="investigacion",
        objetivos="obj",
        actividades="act",
        fecha_inicio_actividad_general=date.today(),
        fecha_fin_actividad_general=date.today(),
        responsable_apellido_nombre="Resp X",
        responsable_dni="111",
        responsable_email_principal="x@example.com",
    )
    db.add(s)
    db.flush()
    return s


def test_check_pernocte_availability(db_session: Session):
    fecha = date.today()
    reserva = get_or_create_reserva_diaria(db_session, fecha)
    assert isinstance(reserva, ReservaDiaria)
    assert check_pernocte_availability(db_session, fecha) == 12


def test_add_participante_reserva_increments_pernocte(db_session: Session):
    fecha = date.today() + timedelta(days=1)
    s = make_solicitud(db_session)
    p = make_participante(db_session, s.id)

    add_participante_reserva(db_session, p.id, fecha, es_diurno=False, es_pernocte=True)
    db_session.commit()

    reserva = get_or_create_reserva_diaria(db_session, fecha)
    assert reserva.plazas_pernocte_ocupadas == 1


def test_pernocte_limit_reached(db_session: Session):
    fecha = date.today() + timedelta(days=2)
    s = make_solicitud(db_session)
    participantes = [make_participante(db_session, s.id) for _ in range(13)]

    # book 12 pernoctes
    for p in participantes[:12]:
        add_participante_reserva(db_session, p.id, fecha, es_diurno=False, es_pernocte=True)
    db_session.commit()

    # 13th should fail
    try:
        add_participante_reserva(db_session, participantes[12].id, fecha, es_diurno=False, es_pernocte=True)
        assert False, "Expected exception for pernocte limit"
    except Exception as e:
        assert "No hay plazas" in str(e)
