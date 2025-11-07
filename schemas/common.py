from __future__ import annotations

from datetime import date
from pydantic import BaseModel, Field, EmailStr
from typing import List, TYPE_CHECKING

if TYPE_CHECKING:
    from .reservas import ReservaDetalleCreate


class FechasUsoGeneral(BaseModel):
    fecha_inicio_actividad_general: date
    fecha_fin_actividad_general: date


class ResponsableInfo(BaseModel):
    responsable_apellido_nombre: str
    responsable_dni: str
    responsable_email_principal: EmailStr
    responsable_email_alternativo: EmailStr | None = None
    responsable_telefono: str | None = None
    responsable_direccion_postal: str | None = None
    responsable_reservas_detalladas: List['ReservaDetalleCreate'] = Field(default_factory=list)


class ParticipanteBase(BaseModel):
    apellido: str
    nombres: str
    dni: str = Field(description="DNI o Pasaporte")
    institucion_cargo: str | None = None
    nacionalidad: str | None = None
    cuil: str | None = None
    fecha_nacimiento: date | None = None
    rol: str | None = None
