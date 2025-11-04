from sqlalchemy import inspect


def test_database_tables_created(engine):
    insp = inspect(engine)
    tables = set(insp.get_table_names())
    assert {"solicitudes", "participantes", "reservas_diarias", "participantes_reservas"}.issubset(tables)
