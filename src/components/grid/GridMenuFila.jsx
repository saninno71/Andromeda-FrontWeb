import iconEditar from "../../assets/editarG.png";
import iconDel from "../../assets/borrarG.png";
import iconVer from "../../assets/verG.png";
import icon4 from "../../assets/icon4G.png";
import icon5 from "../../assets/icon5G.png";
import icon6 from "../../assets/icon6G.png";
import { useLayoutEffect,useRef,useState } from "react";

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
    onEditarFila,
    onEliminarFila
}) {

    const refMenu = useRef(null);
    const refIconos = useRef(null);
    const [anchoMenu,setAnchoMenu] = useState(0);
    const [anchoVisible,setAnchoVisible] = useState(anchoContenedor);

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
                <img
                    src={iconEditar}
                    alt=""
                    style={estiloIcono}
                    onClick={(evento) => {
                        evento.stopPropagation();
                        onEditarFila?.();
                    }}
                />
                <img
                    src={iconDel}
                    alt=""
                    style={estiloIcono}
                    onClick={(evento) => {
                        evento.stopPropagation();
                        onEliminarFila?.();
                    }}
                />
                <img src={iconVer} alt="" style={estiloIcono} />
                <img src={icon4} alt="" style={estiloIcono} />
                <img src={icon5} alt="" style={estiloIcono} />
                <img src={icon6} alt="" style={estiloIcono} />
            </div>
        </div>
    );

}

export default GridMenuFila;
