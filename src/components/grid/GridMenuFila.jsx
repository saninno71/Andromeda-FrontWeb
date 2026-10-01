import iconEditar from "../../assets/editarG.png";
import iconDel from "../../assets/borrarG.png";
import iconVer from "../../assets/verG.png";
import icon4 from "../../assets/icon4G.png";
import icon5 from "../../assets/icon5G.png";
import icon6 from "../../assets/icon6G.png";
import { useLayoutEffect,useRef,useState } from "react";
import { ACCIONES_MENU_FILA_DEFAULT } from "./gridMenuAcciones";

const estiloIcono = {
    width:"13px",
    height:"13px"
};

function GridMenuFila({
    filaSeleccionada,
    mostrarMenuFila,
    claseFila,
    indiceFila,
    keyFila,
    topMenuFila,
    scrollTop,
    scrollLeft = 0,
    anchoContenido = 0,
    anchoContenedor = 0,
    acciones = ACCIONES_MENU_FILA_DEFAULT,
    onEditarFila,
    onVerFila,
    onEliminarFila
}) {

    const refMenu = useRef(null);
    const refIconos = useRef(null);
    const [anchoMenu,setAnchoMenu] = useState(0);
    const [anchoVisible,setAnchoVisible] = useState(anchoContenedor);
    const accionesVisibles = new Set(acciones);

    useLayoutEffect(() => {

        if (!mostrarMenuFila) {
            return;
        }

        function medirEspacioVisible() {
            setAnchoMenu(refIconos.current?.scrollWidth ?? 0);
            const contenedor = refMenu.current?.offsetParent;
            const izquierda = contenedor?.getBoundingClientRect().left ?? 0;
            setAnchoVisible(Math.max(0, Math.min(anchoContenedor, document.documentElement.clientWidth - izquierda)));
        }
        medirEspacioVisible();
        window.addEventListener("resize", medirEspacioVisible);
        window.addEventListener("scroll", medirEspacioVisible, true);
        return () => {
            window.removeEventListener("resize", medirEspacioVisible);
            window.removeEventListener("scroll", medirEspacioVisible, true);
        };

    }, [mostrarMenuFila, anchoContenedor]);

    if (!filaSeleccionada || !mostrarMenuFila) {
        return null;
    }

    const margenDerecho = 12;
    const limiteVisibleDerecho =
        scrollLeft + anchoVisible - margenDerecho;
    const limiteContenidoDerecho =
        anchoContenido - margenDerecho;
    const posicionDerecha =
        Math.min(
            limiteVisibleDerecho,
            limiteContenidoDerecho
        );
    const leftMenu =
        Math.max(
            0,
            posicionDerecha - anchoMenu - scrollLeft
        );
    const anchoFondoMenu =
        Math.max(
            anchoMenu,
            posicionDerecha - scrollLeft - leftMenu
        );

    return (
        <div
            ref={refMenu}
            className={`
                menuFila
                ${claseFila(indiceFila,keyFila)}
            `}
            style={{
                top:"0px",
                left:leftMenu + "px",
                width:anchoFondoMenu + "px",
                transform:
                    `translateY(${
                        topMenuFila -
                        scrollTop +
                        2
                    }px)`
            }}
        >
            <div className="menuFilaFondo"></div>

            <div className="menuFilaIconos" ref={refIconos}>
                {accionesVisibles.has("editar") && <img
                    src={iconEditar}
                    alt="Editar"
                    style={estiloIcono}
                    onClick={(evento) => {
                        evento.stopPropagation();
                        onEditarFila?.();
                    }}
                />}
                {accionesVisibles.has("eliminar") && <img
                    src={iconDel}
                    alt="Eliminar"
                    style={estiloIcono}
                    onClick={(evento) => {
                        evento.stopPropagation();
                        onEliminarFila?.();
                    }}
                />}
                {accionesVisibles.has("ver") && <img
                    src={iconVer}
                    alt="Ver"
                    style={estiloIcono}
                    onClick={(evento) => {
                        evento.stopPropagation();
                        onVerFila?.();
                    }}
                />}
                {accionesVisibles.has("accion4") && <img src={icon4} alt="Acción 4" style={estiloIcono} />}
                {accionesVisibles.has("accion5") && <img src={icon5} alt="Acción 5" style={estiloIcono} />}
                {accionesVisibles.has("accion6") && <img src={icon6} alt="Acción 6" style={estiloIcono} />}
            </div>
        </div>
    );

}

export default GridMenuFila;
