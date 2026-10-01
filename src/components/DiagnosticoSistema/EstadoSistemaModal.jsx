import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import ModalHeader from "../ModalHeader/ModalHeader";
import "./EstadoSistemaModal.css";

const CAPAS_PENDIENTES = ["React", "API", "Aplicación", "Infraestructura", "SQL Server"];

function EstadoSistemaModal({
  onCerrar,
  onVerificar,
  consultando,
  resultado,
  error,
  fechaUltimoDiagnostico
}) {
  const botonCerrarRef = useRef(null);

  useEffect(() => {
    botonCerrarRef.current?.focus();
    const manejarTecla = (evento) => {
      if (evento.key === "Escape") onCerrar();
    };
    document.addEventListener("keydown", manejarTecla);
    return () => document.removeEventListener("keydown", manejarTecla);
  }, [onCerrar]);

  const capas = consultando
    ? CAPAS_PENDIENTES.map((nombre) => ({
        nombre,
        estado: "gris",
        tiempoMs: null,
        mensaje: "Verificando..."
      }))
    : resultado?.capas || [
        {
          nombre: "React",
          estado: "verde",
          tiempoMs: 0,
          mensaje: "La ventana de diagnóstico está operativa."
        },
        {
          nombre: "API",
          estado: "rojo",
          tiempoMs: null,
          mensaje: error
        },
        ...CAPAS_PENDIENTES.slice(2).map((nombre) => ({
          nombre,
          estado: "gris",
          tiempoMs: null,
          mensaje: "No evaluada porque la API no respondió."
        }))
      ];

  return createPortal(
    <div className="estadoSistemaOverlay" role="presentation" onMouseDown={onCerrar}>
      <section
        className="estadoSistemaModal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="estadoSistemaTitulo"
        onMouseDown={(evento) => evento.stopPropagation()}
      >
        <ModalHeader
          ref={botonCerrarRef}
          titulo="Estado del sistema"
          tituloID="estadoSistemaTitulo"
          ariaLabelCerrar="Cerrar estado del sistema"
          onCerrar={onCerrar}
          contenidoAdicional={(
            <span className={`estadoSistemaGeneral estado-${resultado?.estado || "gris"}`}>
              {consultando ? "Verificando" : resultado?.estado || "Sin conexión"}
            </span>
          )}
        />

        <div className="estadoSistemaContenido">
          <p className="estadoSistemaIntroduccion">
            Verificación completa desde la pantalla hasta SQL Server.
          </p>

          <div className="estadoSistemaCapas">
            {capas.map((capa) => (
              <div className="estadoSistemaCapa" key={capa.nombre}>
                <span
                  className={`estadoSistemaSemaforo estado-${capa.estado}`}
                  aria-label={`Estado ${capa.estado}`}
                />
                <strong>{capa.nombre}</strong>
                <span className="estadoSistemaTiempo">
                  {capa.tiempoMs == null ? "—" : `${capa.tiempoMs} ms`}
                </span>
                <span className="estadoSistemaMensaje">{capa.mensaje}</span>
              </div>
            ))}
          </div>

          {(resultado || fechaUltimoDiagnostico) && (
            <div className="estadoSistemaDatos">
              {resultado && (
                <span><strong>Tiempo total:</strong> {resultado.tiempoTotalFrontend} ms</span>
              )}
              {fechaUltimoDiagnostico && (
                <span>
                  <strong>Último control:</strong>{" "}
                  {fechaUltimoDiagnostico.toLocaleString("es-AR")}
                </span>
              )}
              {resultado && (
                <span><strong>Transacción:</strong> {resultado.transactionId || "No informada"}</span>
              )}
              {resultado?.fechaSql && (
                <span><strong>Hora SQL:</strong> {new Date(resultado.fechaSql).toLocaleString()}</span>
              )}
            </div>
          )}
        </div>

        <footer className="estadoSistemaPie">
          <span className="estadoSistemaReferencia">Verde &lt; 1 s · Amarillo 1–3 s · Rojo &gt; 3 s o error</span>
          <button type="button" className="estadoSistemaBoton secundario" onClick={onVerificar} disabled={consultando}>
            VOLVER A PROBAR
          </button>
          <button type="button" className="estadoSistemaBoton primario" onClick={onCerrar}>
            CERRAR
          </button>
        </footer>
      </section>
    </div>,
    document.body
  );
}

export default EstadoSistemaModal;
