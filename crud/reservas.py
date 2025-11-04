from __future__ import annotations

from datetime import date
from sqlalchemy import select, update
from sqlalchemy.orm import Session

from core.exceptions import PernocteLimitReached
from models.reservas import ReservaDiaria, ParticipanteReserva

PERNOCTE_MAX = 12


def get_or_create_reserva_diaria(db: Session, fecha: date) -> ReservaDiaria:
    reserva = db.execute(select(ReservaDiaria).where(ReservaDiaria.fecha == fecha)).scalar_one_or_none()
    if reserva is None:
        reserva = ReservaDiaria(fecha=fecha, plazas_pernocte_ocupadas=0)
        db.add(reserva)
        db.flush()
    return reserva


def check_pernocte_availability(db: Session, fecha: date) -> int:
    reserva = get_or_create_reserva_diaria(db, fecha)
    return max(0, PERNOCTE_MAX - int(reserva.plazas_pernocte_ocupadas))


def _increment_pernocte_atomically(db: Session, reserva: ReservaDiaria) -> None:
    # Use an atomic UPDATE with a guard to prevent exceeding the limit
    stmt = (
        update(ReservaDiaria)
        .where(ReservaDiaria.id == reserva.id)
        .where(ReservaDiaria.plazas_pernocte_ocupadas < PERNOCTE_MAX)
        .values(plazas_pernocte_ocupadas=ReservaDiaria.plazas_pernocte_ocupadas + 1)
    )
    result = db.execute(stmt)
    if result.rowcount == 0:
        raise PernocteLimitReached(reserva.fecha)


def _decrement_pernocte_atomically(db: Session, reserva: ReservaDiaria) -> None:
    stmt = (
        update(ReservaDiaria)
        .where(ReservaDiaria.id == reserva.id)
        .where(ReservaDiaria.plazas_pernocte_ocupadas > 0)
        .values(plazas_pernocte_ocupadas=ReservaDiaria.plazas_pernocte_ocupadas - 1)
    )
    db.execute(stmt)


def add_participante_reserva(
    db: Session, participante_id: int, fecha: date, es_diurno: bool, es_pernocte: bool
) -> ParticipanteReserva:
    reserva = get_or_create_reserva_diaria(db, fecha)

    # If pernocte requested, atomically increment
    if es_pernocte:
        _increment_pernocte_atomically(db, reserva)
        db.refresh(reserva)

    participante_reserva = ParticipanteReserva(
        participante_id=participante_id,
        reserva_diaria_id=reserva.id,
        es_diurno=bool(es_diurno),
        es_pernocte=bool(es_pernocte),
    )
    db.add(participante_reserva)
    db.flush()

    return participante_reserva


def remove_participante_reserva(db: Session, participante_reserva_id: int) -> None:
    pr = db.get(ParticipanteReserva, participante_reserva_id)
    if not pr:
        return
    reserva = db.get(ReservaDiaria, pr.reserva_diaria_id)
    if pr.es_pernocte and reserva is not None:
        _decrement_pernocte_atomically(db, reserva)
        db.flush()
        db.refresh(reserva)
    db.delete(pr)


def update_participante_reserva(
    db: Session,
    participante_reserva_id: int,
    nueva_fecha: date,
    es_diurno: bool,
    es_pernocte: bool,
) -> ParticipanteReserva | None:
    pr = db.get(ParticipanteReserva, participante_reserva_id)
    if not pr:
        return None

    old_reserva = db.get(ReservaDiaria, pr.reserva_diaria_id)
    assert old_reserva is not None

    moving_date = old_reserva.fecha != nueva_fecha
    target_reserva = old_reserva if not moving_date else get_or_create_reserva_diaria(db, nueva_fecha)

    # Handle pernocte counters
    if pr.es_pernocte:
        # leaving pernocte on old (either turning off or moving date)
        if (not es_pernocte) or moving_date:
            _decrement_pernocte_atomically(db, old_reserva)

    if es_pernocte:
        # entering pernocte on target (either turning on or moving to new date)
        if (not pr.es_pernocte) or moving_date:
            _increment_pernocte_atomically(db, target_reserva)

    # Apply updates
    pr.es_diurno = bool(es_diurno)
    pr.es_pernocte = bool(es_pernocte)
    if moving_date:
        pr.reserva_diaria_id = target_reserva.id

    db.flush()
    db.refresh(pr)
    return pr
