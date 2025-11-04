from __future__ import annotations

from sqlalchemy.orm import Session, selectinload

from models.solicitudes import Solicitud, SolicitudInvestigacion, SolicitudCatedras
from models.participantes import Participante
from models.reservas import ParticipanteReserva
from schemas.solicitudes import SolicitudInvestigacionCreate, SolicitudCatedrasCreate
from crud.participantes import create_participante_with_reservas


def create_solicitud(db: Session, solicitud: SolicitudInvestigacionCreate | SolicitudCatedrasCreate) -> Solicitud:
    # Use nested transaction to play nicely whether a transaction is already active or not
    with db.begin_nested():
        if solicitud.tipo_solicitud == "investigacion":
            model = SolicitudInvestigacion(
                tipo_solicitud="investigacion",
                objetivos=solicitud.objetivos,
                actividades=solicitud.actividades,
                sitios=solicitud.sitios,
                infraestructuras=solicitud.infraestructuras,
                otras_aclaraciones=solicitud.otras_aclaraciones,
                fecha_inicio_actividad_general=solicitud.fecha_inicio_actividad_general,
                fecha_fin_actividad_general=solicitud.fecha_fin_actividad_general,
                responsable_apellido_nombre=solicitud.responsable_apellido_nombre,
                responsable_dni=solicitud.responsable_dni,
                responsable_email_principal=solicitud.responsable_email_principal,
                responsable_email_alternativo=solicitud.responsable_email_alternativo,
                responsable_telefono=solicitud.responsable_telefono,
                responsable_direccion_postal=solicitud.responsable_direccion_postal,
                institucion=solicitud.institucion,
                antecedentes=solicitud.antecedentes,
                requiere_ayudantes=solicitud.requiere_ayudantes,
                requiere_pasajes_descuento=solicitud.requiere_pasajes_descuento,
                requiere_alojamiento_descuento=solicitud.requiere_alojamiento_descuento,
                detalle_alojamiento_descuento=solicitud.detalle_alojamiento_descuento,
                requiere_vianda_restaurant=solicitud.requiere_vianda_restaurant,
            )
        else:
            s = solicitud  # type: ignore[assignment]
            model = SolicitudCatedras(
                tipo_solicitud="catedras",
                objetivos=s.objetivos,
                actividades=s.actividades,
                sitios=s.sitios,
                infraestructuras=s.infraestructuras,
                otras_aclaraciones=s.otras_aclaraciones,
                fecha_inicio_actividad_general=s.fecha_inicio_actividad_general,
                fecha_fin_actividad_general=s.fecha_fin_actividad_general,
                responsable_apellido_nombre=s.responsable_apellido_nombre,
                responsable_dni=s.responsable_dni,
                responsable_email_principal=s.responsable_email_principal,
                responsable_email_alternativo=s.responsable_email_alternativo,
                responsable_telefono=s.responsable_telefono,
                responsable_direccion_postal=s.responsable_direccion_postal,
                institucion=s.institucion,
                antecedentes=s.antecedentes,
                requiere_ayudantes=s.requiere_ayudantes,
                requiere_pasajes_descuento=s.requiere_pasajes_descuento,
                requiere_alojamiento_descuento=s.requiere_alojamiento_descuento,
                detalle_alojamiento_descuento=s.detalle_alojamiento_descuento,
                requiere_vianda_restaurant=s.requiere_vianda_restaurant,
                asignatura=s.asignatura,
                requiere_pasajes=s.requiere_pasajes,
            )

        db.add(model)
        db.flush()  # get model.id

        # Create participants and their reservas
        integrantes = (
            solicitud.integrantes if hasattr(solicitud, "integrantes") else []  # type: ignore[attr-defined]
        )
        for p in integrantes:
            create_participante_with_reservas(db, p, model.id)

        db.refresh(model)
        return model


def get_solicitud(db: Session, solicitud_id: int) -> Solicitud:
    obj = (
        db.query(Solicitud)
        .options(
            selectinload(Solicitud.participantes)
            .selectinload(Participante.participante_reservas)
            .selectinload(ParticipanteReserva.reserva_diaria)
        )
        .filter(Solicitud.id == solicitud_id)
        .first()
    )
    if not obj:
        raise ValueError("Solicitud no encontrada")
    return obj
