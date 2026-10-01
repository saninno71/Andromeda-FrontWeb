import BotonToolbar from "../../BotonToolbar/BotonToolbar";
import {
    MODO_ABM,
    mostrarAccionesPieABM,
    mostrarAplicarPieABM
} from "../modosABM.js";
import "./ABMPieAcciones.css";

function ABMPieAcciones({
    onCancelar,
    onAplicar,
    onAceptar,
    aplicarDeshabilitado = false,
    aceptarDeshabilitado = false,
    textoCancelar = "CANCELAR",
    textoAplicar = "APLICAR",
    textoAceptar = "ACEPTAR",
    tituloDeshabilitado,
    modo = MODO_ABM.EDICION
}) {
    const mostrarAcciones = mostrarAccionesPieABM(modo);
    const mostrarAplicar = mostrarAplicarPieABM(modo);

    return (
        <footer className="abmPieAcciones">
            <BotonToolbar texto={mostrarAcciones ? textoCancelar : "CERRAR"} onClick={onCancelar} />
            {mostrarAcciones && (
                <div className="abmPieAccionesDerecha" title={tituloDeshabilitado}>
                    {mostrarAplicar && (
                        <BotonToolbar texto={textoAplicar} onClick={onAplicar} disabled={aplicarDeshabilitado} />
                    )}
                    <BotonToolbar texto={textoAceptar} onClick={onAceptar} disabled={aceptarDeshabilitado} variante="primario" />
                </div>
            )}
        </footer>
    );
}

export default ABMPieAcciones;
