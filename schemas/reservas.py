from __future__ import annotations

from datetime import date
from pydantic import BaseModel
from typing import List


class ReservaDetalleCreate(BaseModel):
    fecha: date
    es_diurno: bool = False
    es_pernocte: bool = False


class ReservaDiariaOut(BaseModel):
    fecha: date
    plazas_pernocte_ocupadas: int
    plazas_pernocte_disponibles: int


class ParticipanteReservaOut(BaseModel):
    id: int
    fecha: date
    es_diurno: bool
    es_pernocte: bool

    class Config:
        from_attributes = True


# --- Admin listing schemas ---
class ParticipanteLite(BaseModel):
    id: int
    apellido: str
    nombres: str
    dni: str


class SolicitudLite(BaseModel):
    id: int
    tipo_solicitud: str


class ReservaAdminItem(BaseModel):
    id: int
    fecha: date
    es_diurno: bool
    es_pernocte: bool
    participante: ParticipanteLite
    solicitud: SolicitudLite


class ReservaAdminListOut(BaseModel):
    total: int
    limit: int
    offset: int
    items: List[ReservaAdminItem]
