import iconEditar from "../../assets/editarG.png";
import iconDel from "../../assets/borrarG.png";
import iconVer from "../../assets/verG.png";
import icon4 from "../../assets/icon4G.png";
import icon5 from "../../assets/icon5G.png";
import icon6 from "../../assets/icon6G.png";

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
    scrollTop
}) {

    if (!filaSeleccionada || !mostrarMenuFila) {
        return null;
    }

    return (
        <div
            className={`
                menuFila
                ${claseFila(indiceFila,keyFila)}
            `}
            style={{
                top:"0px",
                transform:
                    `translateY(${
                        topMenuFila -
                        scrollTop +
                        2
                    }px)`
            }}
        >
            <img src={iconEditar} alt="" style={estiloIcono} />
            <img src={iconDel} alt="" style={estiloIcono} />
            <img src={iconVer} alt="" style={estiloIcono} />
            <img src={icon4} alt="" style={estiloIcono} />
            <img src={icon5} alt="" style={estiloIcono} />
            <img src={icon6} alt="" style={estiloIcono} />
        </div>
    );

}

export default GridMenuFila;
