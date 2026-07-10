import "./ModalInfo.css";

function ModalInfo({
    abierto,
    titulo = "Informacion",
    mensaje,
    textoBoton = "Entendido",
    onCerrar
}) {

    if (!abierto) {
        return null;
    }

    return (
        <div className="modalInfoOverlay">
            <div
                className="modalInfo"
                role="dialog"
                aria-modal="true"
                aria-labelledby="modalInfoTitulo"
            >
                <div
                    className="modalInfoTitulo"
                    id="modalInfoTitulo"
                >
                    {titulo}
                </div>

                <div className="modalInfoMensaje">
                    {mensaje}
                </div>

                <div className="modalInfoAcciones">
                    <button
                        type="button"
                        className="modalInfoBoton"
                        onClick={onCerrar}
                        autoFocus
                    >
                        {textoBoton}
                    </button>
                </div>
            </div>
        </div>
    );

}

export default ModalInfo;
