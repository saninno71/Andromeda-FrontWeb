import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import ModalHeader from "../ModalHeader/ModalHeader";
import "./ModalConfirmacion.css";

function ModalConfirmacion({
    abierto,
    titulo = "Confirmar",
    mensaje,
    textoConfirmar = "Sí",
    textoCancelar = "No",
    procesando = false,
    onConfirmar,
    onCancelar
}) {
    const dialogo = useRef(null);
    const botonConfirmar = useRef(null);

    useEffect(() => {
        if (!abierto) return;
        botonConfirmar.current?.focus();
    }, [abierto]);

    if (!abierto) return null;

    function manejarTeclado(evento) {
        evento.stopPropagation();
        if (evento.key === "Escape" && !procesando) {
            evento.preventDefault();
            onCancelar?.();
            return;
        }
        if (evento.key !== "Tab") return;
        const controles = [...dialogo.current.querySelectorAll("button")]
            .filter(control => !control.disabled);
        const primero = controles[0];
        const ultimo = controles.at(-1);
        if (evento.shiftKey && document.activeElement === primero) {
            evento.preventDefault();
            ultimo?.focus();
        } else if (!evento.shiftKey && document.activeElement === ultimo) {
            evento.preventDefault();
            primero?.focus();
        }
    }

    return createPortal(
        <div className="modalConfirmacionOverlay">
            <section
                ref={dialogo}
                className="modalConfirmacion"
                role="alertdialog"
                aria-modal="true"
                aria-labelledby="modalConfirmacionTitulo"
                aria-describedby="modalConfirmacionMensaje"
                onKeyDown={manejarTeclado}
            >
                <ModalHeader
                    titulo={titulo}
                    tituloID="modalConfirmacionTitulo"
                    ariaLabelCerrar="Cancelar confirmación"
                    onCerrar={procesando ? undefined : onCancelar}
                    tabIndexCerrar={procesando ? -1 : undefined}
                />
                <div className="modalConfirmacionCuerpo">
                    <span className="modalConfirmacionIcono" aria-hidden="true">i</span>
                    <p id="modalConfirmacionMensaje">{mensaje}</p>
                </div>
                <div className="modalConfirmacionAcciones">
                    <button
                        ref={botonConfirmar}
                        type="button"
                        onClick={onConfirmar}
                        disabled={procesando}
                    >
                        {textoConfirmar}
                    </button>
                    <button type="button" onClick={onCancelar} disabled={procesando}>
                        {textoCancelar}
                    </button>
                </div>
            </section>
        </div>,
        document.body
    );
}

export default ModalConfirmacion;
