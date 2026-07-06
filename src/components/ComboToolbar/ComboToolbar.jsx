import "./ComboToolbar.css";
// import { useState } from "react";
import { useEffect,useRef,useState } from "react";


import iconFlechaC from "../../assets/iconFlechaC.png";
import iconAmpliarTexto from "../../assets/iconAmpliarTexto.png";
import iconReducirTexto from "../../assets/iconReducirTexto.png";
import iconGuardarGrilla from "../../assets/iconGuardarGrilla.png";

function ComboToolbar({
    icono,
    flecha,
    onAmpliarTexto,
    onReducirTexto,
    onGuardarGrilla,
    onGuardarComoNueva,
    vistas = [],
    vistaActualID,
    onSeleccionarVista,
    tabIndex
})

{

    //variable de estado para asignar el estado de abierto/cerrado y forzar el renderizado
    const [abierto,setAbierto] = useState(false);
    const [abiertoVistas,setAbiertoVistas] = useState(false);
    const [mensajeGuardado,setMensajeGuardado] = useState("");
    const refCombo = useRef();

    const vistaActual =
        vistas.find(vista => vista.id === vistaActualID);

    useEffect(() => {

function clickFuera(evento)

    {

        if (
            refCombo.current &&
            !refCombo.current.contains(evento.target)
        )

        {

            setAbierto(false);

        }

    }

    document.addEventListener("mousedown",clickFuera);

    return () => {

        document.removeEventListener("mousedown",clickFuera);

    };

},[]);

function mostrarMensajeGuardado(mensaje) {

    setMensajeGuardado(mensaje);

    setTimeout(() => {
        setMensajeGuardado("");
    }, 1500);

}

return (

    <div className="comboToolbarContenedor" ref={refCombo}>

        <button
            className="comboToolbar"
            onClick={() => setAbierto(!abierto)}
            tabIndex={tabIndex}
        >

            <div className="comboToolbarIcono">

                {icono}

            </div>

            <div className={`comboToolbarFlecha ${abierto ? "abierto" : ""}`}>

                {flecha}

            </div>

        </button>

        {
            abierto && (

                <div className="comboToolbarPopup">

                    <div
                        className="comboToolbarItem"
                        onClick={() => onAmpliarTexto?.()}
                    >
                        <div className="comboToolbarItemIcono">
                            <img src={iconAmpliarTexto} />
                        </div>

                        <div className="comboToolbarItemTexto">
                            Ampliar texto
                        </div>
                    </div>

                    <div
                        className="comboToolbarItem"
                        onClick={() => onReducirTexto?.()}
                    >
                        <div className="comboToolbarItemIcono">
                            <img src={iconReducirTexto} />
                        </div>

                        <div className="comboToolbarItemTexto">
                            Reducir texto
                        </div>
                    </div>

                    <div
                        className="comboToolbarItem"
                        onClick={() => {
                            onGuardarGrilla?.();
                            mostrarMensajeGuardado("Grilla guardada");
                        }}
                    >
                        <div className="comboToolbarItemIcono">
                            <img src={iconGuardarGrilla} />
                        </div>

                        <div className="comboToolbarItemTexto">
                            {
                                mensajeGuardado ||
                                "Guardar grilla"
                            }
                        </div>
                    </div>

                    <div
                        className="comboToolbarItem"
                        onClick={() => {
                            onGuardarComoNueva?.();
                            mostrarMensajeGuardado("Nueva grilla guardada");
                        }}
                    >
                        <div className="comboToolbarItemIcono">
                            <img src={iconGuardarGrilla} />
                        </div>

                        <div className="comboToolbarItemTexto">
                            Guardar como nueva
                        </div>
                    </div>




                    <div className="comboToolbarZonaInferior">

                        <div className="comboToolbarTitulo">

                            Vista actual

                        </div>

                        <div
                            className="comboToolbarSubcombo"
                            onClick={() => setAbiertoVistas(!abiertoVistas)}
                        >

                            <div className="comboToolbarSubcomboTexto">

                                {vistaActual?.nombre || "Default"}

                            </div>

                            <div className="comboToolbarSubcomboFlecha">

                                <img src={iconFlechaC} />

                            </div>

                        </div>

                        {abiertoVistas && (

                            <div className="comboToolbarVistasLista">

                                {vistas.map(vista => (

                                    <div
                                        key={vista.id}
                                        className={`comboToolbarVistaItem ${
                                            vista.id === vistaActualID
                                                ? "comboToolbarVistaItemActivo"
                                                : ""
                                        }`}
                                        onClick={() => {
                                            onSeleccionarVista?.(vista.id);
                                            setAbiertoVistas(false);
                                        }}
                                    >
                                        {vista.nombre}
                                    </div>

                                ))}

                            </div>

                        )}

                    </div>

                </div>

            )
        }

    </div>

);
}

export default ComboToolbar;
