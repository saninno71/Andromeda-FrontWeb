import BotonToolbar from "../../BotonToolbar/BotonToolbar";
import primero from "../assets/primero.png";
import anterior from "../assets/anterior.png";
import siguiente from "../assets/siguiente.png";
import ultimo from "../assets/ultimo.png";
import "./ABMNavegacionRegistros.css";

function ABMNavegacionRegistros({
    onNavegar,
    puedeAnterior = false,
    puedeSiguiente = false,
    cargando = false,
    atenuada = false
}) {
    const acciones = [
        { id:"primero", icono:primero, titulo:"Primer registro", destino:"primero", disabled:!puedeAnterior },
        { id:"anterior", icono:anterior, titulo:"Registro anterior", destino:"anterior", disabled:!puedeAnterior },
        { id:"siguiente", icono:siguiente, titulo:"Registro siguiente", destino:"siguiente", disabled:!puedeSiguiente },
        { id:"ultimo", icono:ultimo, titulo:"Último registro", destino:"ultimo", disabled:!puedeSiguiente }
    ];

    return (
        <span
            className={`abmNavegacionRegistros ${atenuada ? "abmNavegacionRegistrosAtenuada" : ""}`}
            role="group"
            aria-label="Navegación entre registros"
        >
            {acciones.map(accion => (
                <BotonToolbar
                    key={accion.id}
                    icono={<img src={accion.icono} alt={accion.titulo} />}
                    title={accion.titulo}
                    disabled={cargando || accion.disabled}
                    onClick={() => onNavegar?.(accion.destino)}
                />
            ))}
        </span>
    );
}

export default ABMNavegacionRegistros;
