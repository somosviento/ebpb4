from __future__ import annotations

from datetime import date
from typing import List, Literal
from pydantic import BaseModel

from .common import FechasUsoGeneral, ResponsableInfo
from .participantes import ParticipanteCreate, ParticipanteOut
from .reservas import ReservaDetalleCreate

# Rebuild model to resolve forward references
ResponsableInfo.model_rebuild()


class SolicitudBaseCreate(FechasUsoGeneral, ResponsableInfo):
    objetivos: str
    actividades: str
    sitios: str | None = None
    infraestructuras: str | None = None
    otras_aclaraciones: str | None = None

    institucion: str | None = None
    antecedentes: str | None = None
    requiere_ayudantes: bool | None = False
    requiere_pasajes_descuento: bool | None = False
    requiere_alojamiento_descuento: bool | None = False
    detalle_alojamiento_descuento: str | None = None
    requiere_vianda_restaurant: bool | None = False


class SolicitudInvestigacionCreate(SolicitudBaseCreate):
    tipo_solicitud: Literal["investigacion"] = "investigacion"
    integrantes: List[ParticipanteCreate]


class SolicitudCatedrasCreate(SolicitudBaseCreate):
    tipo_solicitud: Literal["catedras"] = "catedras"
    asignatura: str | None = None
    requiere_pasajes: bool | None = False
    integrantes: List[ParticipanteCreate]


class SolicitudParticipanteOut(ParticipanteOut):
    pass


class SolicitudOut(BaseModel):
    id: int
    tipo_solicitud: str
    objetivos: str
    actividades: str
    sitios: str | None = None
    infraestructuras: str | None = None
    otras_aclaraciones: str | None = None

    fecha_creacion: date
    fecha_inicio_actividad_general: date
    fecha_fin_actividad_general: date

    responsable_apellido_nombre: str
    responsable_dni: str
    responsable_email_principal: str
    responsable_email_alternativo: str | None = None
    responsable_telefono: str | None = None
    responsable_direccion_postal: str | None = None

    institucion: str | None = None
    antecedentes: str | None = None
    requiere_ayudantes: bool | None = False
    requiere_pasajes_descuento: bool | None = False
    requiere_alojamiento_descuento: bool | None = False
    detalle_alojamiento_descuento: str | None = None
    requiere_vianda_restaurant: bool | None = False

    asignatura: str | None = None
    requiere_pasajes: bool | None = False

    participantes: List[SolicitudParticipanteOut] = []

    class Config:
        from_attributes = True
