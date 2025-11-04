from __future__ import annotations

from datetime import date
from sqlalchemy import Boolean, Date, Integer, String, Text
from sqlalchemy.orm import relationship, Mapped, mapped_column

from .base import Base


class Solicitud(Base):
    __tablename__ = "solicitudes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    # Single Table Inheritance discriminator
    tipo_solicitud: Mapped[str] = mapped_column(String(50), nullable=False, index=True)

    # Common fields
    objetivos: Mapped[str] = mapped_column(Text, nullable=False)
    actividades: Mapped[str] = mapped_column(Text, nullable=False)
    sitios: Mapped[str | None] = mapped_column(Text, nullable=True)
    infraestructuras: Mapped[str | None] = mapped_column(Text, nullable=True)
    otras_aclaraciones: Mapped[str | None] = mapped_column(Text, nullable=True)

    fecha_creacion: Mapped[date] = mapped_column(Date, nullable=False, default=date.today)
    fecha_inicio_actividad_general: Mapped[date] = mapped_column(Date, nullable=False)
    fecha_fin_actividad_general: Mapped[date] = mapped_column(Date, nullable=False)

    responsable_apellido_nombre: Mapped[str] = mapped_column(String(255), nullable=False)
    responsable_dni: Mapped[str] = mapped_column(String(50), nullable=False)
    responsable_email_principal: Mapped[str] = mapped_column(String(255), nullable=False)
    responsable_email_alternativo: Mapped[str | None] = mapped_column(String(255), nullable=True)
    responsable_telefono: Mapped[str | None] = mapped_column(String(100), nullable=True)
    responsable_direccion_postal: Mapped[str | None] = mapped_column(String(255), nullable=True)

    institucion: Mapped[str | None] = mapped_column(String(255), nullable=True)
    antecedentes: Mapped[str | None] = mapped_column(Text, nullable=True)
    requiere_ayudantes: Mapped[bool | None] = mapped_column(Boolean, nullable=True, default=False)
    requiere_pasajes_descuento: Mapped[bool | None] = mapped_column(Boolean, nullable=True, default=False)
    requiere_alojamiento_descuento: Mapped[bool | None] = mapped_column(Boolean, nullable=True, default=False)
    detalle_alojamiento_descuento: Mapped[str | None] = mapped_column(Text, nullable=True)
    requiere_vianda_restaurant: Mapped[bool | None] = mapped_column(Boolean, nullable=True, default=False)

    # Cátedras specific
    asignatura: Mapped[str | None] = mapped_column(String(255), nullable=True)
    requiere_pasajes: Mapped[bool | None] = mapped_column(Boolean, nullable=True, default=False)

    # Relationships
    participantes = relationship(
        "Participante",
        back_populates="solicitud",
        cascade="all, delete-orphan",
        passive_deletes=True,
    )

    __mapper_args__ = {
        "polymorphic_on": tipo_solicitud,
        "polymorphic_identity": "solicitud",
    }


class SolicitudInvestigacion(Solicitud):
    __mapper_args__ = {
        "polymorphic_identity": "investigacion",
    }


class SolicitudCatedras(Solicitud):
    __mapper_args__ = {
        "polymorphic_identity": "catedras",
    }
