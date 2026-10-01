import { MODO_ABM } from "../modosABM.js";
import "./ABMIndicadorModo.css";

const PRESENTACION_POR_MODO = Object.freeze({
    [MODO_ABM.ALTA]: {
        texto: "Registro nuevo",
        clase: "abmIndicadorModoAlta"
    },
    [MODO_ABM.EDICION]: {
        texto: "Modo edición",
        clase: "abmIndicadorModoEdicion"
    },
    [MODO_ABM.CONSULTA]: {
        texto: "Modo consulta",
        clase: "abmIndicadorModoConsulta"
    }
});

export default function ABMIndicadorModo({ modo }) {
    const presentacion = PRESENTACION_POR_MODO[modo];
    if (!presentacion) return null;

    return (
        <div className={`abmIndicadorModo ${presentacion.clase}`} role="status">
            <span className="abmIndicadorModoPunto" aria-hidden="true" />
            <span>{presentacion.texto}</span>
        </div>
    );
}
