import { forwardRef } from "react";
import "./ModalHeader.css";

const ModalHeader = forwardRef(function ModalHeader({
    titulo,
    tituloID = "modalTitulo",
    onCerrar,
    ariaLabelCerrar = "Cerrar",
    contenidoAdicional = null,
    tabIndexCerrar
}, ref) {
    return (
        <header className="modalHeader">
            <button
                ref={ref}
                type="button"
                className="modalHeaderCerrar"
                aria-label={ariaLabelCerrar}
                data-modal-cerrar
            onClick={onCerrar}
            tabIndex={tabIndexCerrar}
            >
                <span className="modalHeaderCerrarIcono" aria-hidden="true" />
            </button>
            <div className="modalHeaderTitulo" id={tituloID}>{titulo}</div>
            {contenidoAdicional && (
                <div className="modalHeaderAdicional">{contenidoAdicional}</div>
            )}
        </header>
    );
});

export default ModalHeader;
