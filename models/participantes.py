from __future__ import annotations

from datetime import date
from sqlalchemy import Date, ForeignKey, Integer, String
from sqlalchemy.orm import relationship, Mapped, mapped_column

from .base import Base


class Participante(Base):
    __tablename__ = "participantes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    solicitud_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("solicitudes.id", ondelete="CASCADE"), nullable=False, index=True
    )

    apellido: Mapped[str] = mapped_column(String(120), nullable=False)
    nombres: Mapped[str] = mapped_column(String(120), nullable=False)
    dni: Mapped[str] = mapped_column(String(50), nullable=False)
    institucion_cargo: Mapped[str | None] = mapped_column(String(255), nullable=True)
    nacionalidad: Mapped[str | None] = mapped_column(String(100), nullable=True)
    cuil: Mapped[str | None] = mapped_column(String(50), nullable=True)
    fecha_nacimiento: Mapped[date | None] = mapped_column(Date, nullable=True)
    rol: Mapped[str | None] = mapped_column(String(100), nullable=True)

    solicitud = relationship("Solicitud", back_populates="participantes")
    participante_reservas = relationship(
        "ParticipanteReserva",
        back_populates="participante",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )
