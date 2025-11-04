from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, Query
from datetime import date
from sqlalchemy import select, func
from sqlalchemy.orm import Session, selectinload

from core.security import admin_required
from database import get_db
from models.solicitudes import Solicitud
from models.participantes import Participante
from models.reservas import ParticipanteReserva, ReservaDiaria
from schemas.participantes import ParticipanteCreate, ParticipanteOut
from schemas.reservas import (
    ReservaDetalleCreate,
    ReservaAdminListOut,
    ReservaAdminItem,
)
from crud.participantes import create_participante_with_reservas
from crud.reservas import add_participante_reserva, remove_participante_reserva, update_participante_reserva

router = APIRouter(prefix="/admin", tags=["admin"])


@router.post("/solicitudes/{solicitud_id}/participantes", response_model=ParticipanteOut)
def admin_add_participante(
    solicitud_id: int,
    payload: ParticipanteCreate,
    db: Session = Depends(get_db),
    _: bool = Depends(admin_required),
):
    solicitud = db.get(Solicitud, solicitud_id)
    if not solicitud:
        raise HTTPException(status_code=404, detail="Solicitud no encontrada")
    p = create_participante_with_reservas(db, payload, solicitud_id)
    db.commit()
    db.refresh(p)
    return p


@router.post("/participantes/{participante_id}/reservas", response_model=dict)
def admin_add_reserva(
    participante_id: int,
    detalle: ReservaDetalleCreate,
    db: Session = Depends(get_db),
    _: bool = Depends(admin_required),
):
    participante = db.get(Participante, participante_id)
    if not participante:
        raise HTTPException(status_code=404, detail="Participante no encontrado")
    pr = add_participante_reserva(
        db,
        participante_id=participante_id,
        fecha=detalle.fecha,
        es_diurno=detalle.es_diurno,
        es_pernocte=detalle.es_pernocte,
    )
    db.commit()
    db.refresh(pr)
    return {"id": pr.id, "participante_id": pr.participante_id, "reserva_diaria_id": pr.reserva_diaria_id, "es_diurno": pr.es_diurno, "es_pernocte": pr.es_pernocte}


@router.delete("/participantes-reservas/{participante_reserva_id}", status_code=204)
def admin_delete_reserva(
    participante_reserva_id: int,
    db: Session = Depends(get_db),
    _: bool = Depends(admin_required),
):
    remove_participante_reserva(db, participante_reserva_id)
    db.commit()
    return None


@router.put("/participantes-reservas/{participante_reserva_id}", response_model=dict)
def admin_update_reserva(
    participante_reserva_id: int,
    detalle: ReservaDetalleCreate,
    db: Session = Depends(get_db),
    _: bool = Depends(admin_required),
):
    pr = update_participante_reserva(
        db,
        participante_reserva_id=participante_reserva_id,
        nueva_fecha=detalle.fecha,
        es_diurno=detalle.es_diurno,
        es_pernocte=detalle.es_pernocte,
    )
    if pr is None:
        raise HTTPException(status_code=404, detail="ParticipanteReserva no encontrada")
    db.commit()
    db.refresh(pr)
    return {"id": pr.id, "participante_id": pr.participante_id, "reserva_diaria_id": pr.reserva_diaria_id, "es_diurno": pr.es_diurno, "es_pernocte": pr.es_pernocte}


@router.get("/reservas", response_model=ReservaAdminListOut)
def admin_list_reservas(
    db: Session = Depends(get_db),
    _: bool = Depends(admin_required),
    # Filters
    fecha_desde: date | None = Query(None),
    fecha_hasta: date | None = Query(None),
    es_diurno: bool | None = Query(None),
    es_pernocte: bool | None = Query(None),
    participante_dni: str | None = Query(None),
    participante_apellido: str | None = Query(None),
    solicitud_id: int | None = Query(None),
    # Pagination
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
):
    # Base selectable with joins for eager loading
    stmt = (
        select(ParticipanteReserva)
        .join(ParticipanteReserva.reserva_diaria)
        .join(ParticipanteReserva.participante)
        .options(
            selectinload(ParticipanteReserva.participante).selectinload(Participante.solicitud),
            selectinload(ParticipanteReserva.reserva_diaria),
        )
    )

    # Apply filters
    if fecha_desde is not None:
        stmt = stmt.where(ReservaDiaria.fecha >= fecha_desde)
    if fecha_hasta is not None:
        stmt = stmt.where(ReservaDiaria.fecha <= fecha_hasta)
    if es_diurno is not None:
        stmt = stmt.where(ParticipanteReserva.es_diurno == bool(es_diurno))
    if es_pernocte is not None:
        stmt = stmt.where(ParticipanteReserva.es_pernocte == bool(es_pernocte))
    if participante_dni:
        stmt = stmt.where(func.lower(Participante.dni).like(f"%{participante_dni.lower()}%"))
    if participante_apellido:
        stmt = stmt.where(func.lower(Participante.apellido).like(f"%{participante_apellido.lower()}%"))
    if solicitud_id is not None:
        stmt = stmt.where(Participante.solicitud_id == solicitud_id)

    # Count total using a dedicated query to avoid loader option side-effects
    count_q = (
        select(func.count())
        .select_from(ParticipanteReserva)
        .join(ParticipanteReserva.reserva_diaria)
        .join(ParticipanteReserva.participante)
    )
    if fecha_desde is not None:
        count_q = count_q.where(ReservaDiaria.fecha >= fecha_desde)
    if fecha_hasta is not None:
        count_q = count_q.where(ReservaDiaria.fecha <= fecha_hasta)
    if es_diurno is not None:
        count_q = count_q.where(ParticipanteReserva.es_diurno == bool(es_diurno))
    if es_pernocte is not None:
        count_q = count_q.where(ParticipanteReserva.es_pernocte == bool(es_pernocte))
    if participante_dni:
        count_q = count_q.where(func.lower(Participante.dni).like(f"%{participante_dni.lower()}%"))
    if participante_apellido:
        count_q = count_q.where(func.lower(Participante.apellido).like(f"%{participante_apellido.lower()}%"))
    if solicitud_id is not None:
        count_q = count_q.where(Participante.solicitud_id == solicitud_id)

    total = db.execute(count_q).scalar_one()

    # Page
    stmt = stmt.order_by(ReservaDiaria.fecha.desc(), ParticipanteReserva.id.desc()).limit(limit).offset(offset)
    rows = db.execute(stmt).scalars().all()

    # Build payload
    items: list[ReservaAdminItem] = []
    for pr in rows:
        p = pr.participante
        rd = pr.reserva_diaria
        sol = p.solicitud  # eager loaded
        items.append(
            ReservaAdminItem(
                id=pr.id,
                fecha=rd.fecha,
                es_diurno=bool(pr.es_diurno),
                es_pernocte=bool(pr.es_pernocte),
                participante={
                    "id": p.id,
                    "apellido": p.apellido,
                    "nombres": p.nombres,
                    "dni": p.dni,
                },
                solicitud={
                    "id": sol.id if sol else p.solicitud_id,
                    "tipo_solicitud": sol.tipo_solicitud if sol else "solicitud",
                },
            )
        )

    return {"total": int(total), "limit": limit, "offset": offset, "items": items}
