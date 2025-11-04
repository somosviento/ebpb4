from __future__ import annotations

from datetime import date
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from schemas.reservas import ReservaDiariaOut
from crud.reservas import get_or_create_reserva_diaria, check_pernocte_availability

router = APIRouter()


@router.get("/disponibilidad/{fecha}", response_model=ReservaDiariaOut)
def disponibilidad_pernocte(fecha: date, db: Session = Depends(get_db)):
    reserva = get_or_create_reserva_diaria(db, fecha)
    disponibles = check_pernocte_availability(db, fecha)
    return ReservaDiariaOut(
        fecha=fecha, plazas_pernocte_ocupadas=reserva.plazas_pernocte_ocupadas, plazas_pernocte_disponibles=disponibles
    )
