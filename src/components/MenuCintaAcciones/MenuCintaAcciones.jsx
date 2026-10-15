import BotonToolbar from "../BotonToolbar/BotonToolbar";
import "./MenuCintaAcciones.css";

function MenuCintaAcciones({
    acciones = [],
    deshabilitada = false,
    ariaLabel = "Acciones",
    titulo
}) {
    return (
        <div className="menuCintaAcciones" role="toolbar" aria-label={ariaLabel} title={titulo}>
            {acciones.map(accion => (
                <span className="menuCintaItem" key={accion.id}>
                    {accion.separadorAntes && <span className="menuCintaSeparador" aria-hidden="true" />}
                    {accion.componente ?? (
                        <BotonToolbar
                            texto={accion.texto}
                            icono={accion.icono}
                            onClick={accion.onClick}
                            disabled={deshabilitada || accion.disabled}
                            title={accion.title}
                            className={[
                                accion.className,
                                accion.atenuada ? "menuCintaAccionAtenuada" : ""
                            ].filter(Boolean).join(" ")}
                            tabIndex={accion.tabIndex}
                        />
                    )}
                </span>
            ))}
        </div>
    );
}

export default MenuCintaAcciones;
