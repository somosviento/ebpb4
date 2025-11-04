from fastapi import HTTPException, status
from datetime import date


class BookingException(Exception):
    """Base exception for booking-related domain errors."""


class PernocteLimitReached(BookingException):
    def __init__(self, fecha: date):
        super().__init__(f"No hay plazas de pernocte disponibles para {fecha.isoformat()}")
        self.fecha = fecha


def http_409(detail: str) -> HTTPException:
    return HTTPException(status_code=status.HTTP_409_CONFLICT, detail=detail)


def http_400(detail: str) -> HTTPException:
    return HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)


def http_from_booking_error(err: BookingException) -> HTTPException:
    if isinstance(err, PernocteLimitReached):
        return http_409(str(err))
    return http_400(str(err))
