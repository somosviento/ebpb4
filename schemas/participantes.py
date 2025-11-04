from __future__ import annotations

from pydantic import BaseModel
from typing import List

from .common import ParticipanteBase
from .reservas import ReservaDetalleCreate, ParticipanteReservaOut


class ParticipanteCreate(ParticipanteBase):
    reservas_detalladas: List[ReservaDetalleCreate]


class ParticipanteOut(ParticipanteBase):
    id: int
    participante_reservas: list[ParticipanteReservaOut] = []

    class Config:
        from_attributes = True
