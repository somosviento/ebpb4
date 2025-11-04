from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from core.exceptions import http_from_booking_error, BookingException
from schemas.solicitudes import (
    SolicitudInvestigacionCreate,
    SolicitudCatedrasCreate,
    SolicitudOut,
)
from crud.solicitudes import create_solicitud, get_solicitud

router = APIRouter()


@router.post("/investigacion", response_model=SolicitudOut, status_code=201)
def crear_solicitud_investigacion(
    payload: SolicitudInvestigacionCreate, db: Session = Depends(get_db)
):
    try:
        return create_solicitud(db, payload)
    except BookingException as be:
        raise http_from_booking_error(be)


@router.post("/catedras", response_model=SolicitudOut, status_code=201)
def crear_solicitud_catedras(
    payload: SolicitudCatedrasCreate, db: Session = Depends(get_db)
):
    try:
        return create_solicitud(db, payload)
    except BookingException as be:
        raise http_from_booking_error(be)


@router.get("/{solicitud_id}", response_model=SolicitudOut)
def obtener_solicitud(solicitud_id: int, db: Session = Depends(get_db)):
    return get_solicitud(db, solicitud_id)
