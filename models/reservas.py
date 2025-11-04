from __future__ import annotations

from datetime import date
from sqlalchemy import Boolean, Date, ForeignKey, Integer, UniqueConstraint
from sqlalchemy.orm import relationship, Mapped, mapped_column

from .base import Base


class ReservaDiaria(Base):
    __tablename__ = "reservas_diarias"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    fecha: Mapped[date] = mapped_column(Date, nullable=False, unique=True, index=True)
    plazas_pernocte_ocupadas: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    participante_reservas = relationship(
        "ParticipanteReserva",
        back_populates="reserva_diaria",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )


class ParticipanteReserva(Base):
    __tablename__ = "participantes_reservas"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    participante_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("participantes.id", ondelete="CASCADE"), nullable=False, index=True
    )
    reserva_diaria_id: Mapped[int] = mapped_column(
        Integer, ForeignKey("reservas_diarias.id", ondelete="CASCADE"), nullable=False, index=True
    )
    es_diurno: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    es_pernocte: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    __table_args__ = (
        UniqueConstraint("participante_id", "reserva_diaria_id", name="uq_participante_reserva_diaria"),
    )

    participante = relationship("Participante", back_populates="participante_reservas")
    reserva_diaria = relationship("ReservaDiaria", back_populates="participante_reservas")

    # Expose fecha via related ReservaDiaria for schema serialization
    @property
    def fecha(self) -> date:
        # When object is just created, reserva_diaria may not be loaded; derive from relationship
        return self.reserva_diaria.fecha
