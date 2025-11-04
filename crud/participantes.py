from __future__ import annotations

from sqlalchemy.orm import Session

from models.participantes import Participante
from schemas.participantes import ParticipanteCreate
from crud.reservas import add_participante_reserva


def create_participante_with_reservas(db: Session, participante_data: ParticipanteCreate, solicitud_id: int) -> Participante:
    participante = Participante(
        solicitud_id=solicitud_id,
        apellido=participante_data.apellido,
        nombres=participante_data.nombres,
        dni=participante_data.dni,
        institucion_cargo=participante_data.institucion_cargo,
        nacionalidad=participante_data.nacionalidad,
        cuil=participante_data.cuil,
        fecha_nacimiento=participante_data.fecha_nacimiento,
        rol=participante_data.rol,
    )
    db.add(participante)
    db.flush()  # get participante.id

    for detalle in participante_data.reservas_detalladas:
        add_participante_reserva(
            db,
            participante_id=participante.id,
            fecha=detalle.fecha,
            es_diurno=detalle.es_diurno,
            es_pernocte=detalle.es_pernocte,
        )

    return participante
