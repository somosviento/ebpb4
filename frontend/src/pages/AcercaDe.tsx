export default function AcercaDe() {
  return (
    <div className="container py-4">
      {/* <h1 className="mb-4 text-center">Acerca de</h1> */}
      
      <div className="row">
        {/* Columna izquierda - Estación Biológica */}
        <div className="col-lg-6 mb-4">
          <section className="card h-100">
            <div className="card-header">
              <h2 className="h5 mb-0">Estación Biológica de Puerto Blest</h2>
            </div>
            <div className="card-body">
              <h3 className="h6 mb-3">¿Qué es la Estación Biológica de Puerto Blest?</h3>
              <p>
                La Estación Biológica de Puerto Blest es un centro de investigación y docencia ubicado en el corazón del Parque Nacional Nahuel Huapi, en la provincia de Río Negro, Argentina. Este espacio está destinado a actividades de investigación científica y educación en el ámbito de las ciencias naturales.
              </p>
              
              <h3 className="h6 mb-3 mt-4">Instalaciones</h3>
              <p>La estación cuenta con:</p>
              <ul>
                <li>Alojamiento para hasta 12 personas.</li>
                <li>Cocina equipada para uso compartido.</li>
                <li>Baños completos.</li>
                <li>Espacio de trabajo para muestras y análisis básicos.</li>
                <li>Energía solar.</li>
              </ul>

              <h3 className="h6 mb-3 mt-4">¿Quiénes pueden usar la Estación?</h3>
              <p>La estación está disponible para:</p>
              <ul>
                <li>Cátedras universitarias que requieran realizar trabajos de campo.</li>
                <li>Equipos de investigación con proyectos aprobados.</li>
              </ul>

              <h3 className="h6 mb-3 mt-4">Ubicación</h3>
              <p>
                Puerto Blest se encuentra a orillas del Lago Nahuel Huapi, en el extremo oeste del brazo Blest. Se puede acceder únicamente por vía lacustre desde Puerto Pañuelo (Bariloche).
              </p>

              <h3 className="h6 mb-3 mt-4">Requisitos para la reserva</h3>
              <p>Para poder realizar actividades en la Estación Biológica de Puerto Blest, es necesario:</p>
              <ul>
                <li>Completar el formulario de reserva.</li>
                <li>Para investigaciones: contar con proyecto aprobado.</li>
                <li>Para actividades docentes: ser parte de una cátedra universitaria.</li>
                <li>Contar con el permiso correspondiente de la Administración de Parques Nacionales.</li>
              </ul>
            </div>
          </section>
        </div>

        {/* Columna derecha - Contacto y Parque Nacional */}
        <div className="col-lg-6 mb-4">
          <section className="card mb-4">
            <div className="card-header">
              <h2 className="h5 mb-0">Contacto</h2>
            </div>
            <div className="card-body">
              <p><strong>Email:</strong> <a href="mailto:secretaria.investigacion@crub.uncoma.edu.ar">secretaria.investigacion@crub.uncoma.edu.ar</a></p>
              <p><strong>Teléfono:</strong> +54 294 442 3374 / 6368 / 2111 (Int. 303)</p>
              <p><strong>Dirección:</strong> Centro Regional Universitario Bariloche, Universidad Nacional del Comahue.</p>
            </div>
          </section>

          <section className="card">
            <div className="card-header">
              <h2 className="h5 mb-0">Parque Nacional Nahuel Huapi</h2>
            </div>
            <div className="card-body">
              <p>
                Para más información sobre el Parque Nacional Nahuel Huapi, visite el sitio web oficial de la <a href="https://www.argentina.gob.ar/interior/ambiente/parquesnacionales/nahuelhuapi" target="_blank" rel="noopener noreferrer">Administración de Parques Nacionales</a>.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}