import BotonToolbar from "../../BotonToolbar/BotonToolbar";
import "./ABMCintaAcciones.css";

function ABMCintaAcciones({
    acciones = [],
    deshabilitada = false,
    ariaLabel = "Acciones",
    titulo
}) {
    return (
        <div className="abmCintaAcciones" role="toolbar" aria-label={ariaLabel} title={titulo}>
            {acciones.map(accion => (
                <span className="abmCintaItem" key={accion.id}>
                    {accion.separadorAntes && <span className="abmCintaSeparador" aria-hidden="true" />}
                    {accion.componente ?? (
                        <BotonToolbar
                            texto={accion.texto}
                            icono={accion.icono}
                            onClick={accion.onClick}
                            disabled={deshabilitada || accion.disabled}
                            title={accion.title}
                            className={[
                                accion.className,
                                accion.atenuada ? "abmCintaAccionAtenuada" : ""
                            ].filter(Boolean).join(" ")}
                            tabIndex={accion.tabIndex}
                        />
                    )}
                </span>
            ))}
        </div>
    );
}

export default ABMCintaAcciones;
