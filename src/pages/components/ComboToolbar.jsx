import "./styles/ComboToolbar.css";
// import { useState } from "react";
import { useEffect,useRef,useState } from "react";


import iconFlechaC from "./styles/res/iconFlechaC.png";
import iconAmpliarTexto from "./styles/res/iconAmpliarTexto.png";
import iconReducirTexto from "./styles/res/iconReducirTexto.png";
import iconGuardarGrilla from "./styles/res/iconGuardarGrilla.png";

function ComboToolbar({
    icono,
    flecha,
    onClick
})

{

    //variable de estado para asignar el estado de abierto/cerrado y forzar el renderizado
    const [abierto,setAbierto] = useState(false);
    const refCombo = useRef();

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

return (

    <div className="comboToolbarContenedor" ref={refCombo}>

        <button
            className="comboToolbar"
            onClick={() => setAbierto(!abierto)}
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

                    <div className="comboToolbarItem">
                        <div className="comboToolbarItemIcono">
                            <img src={iconAmpliarTexto} />
                        </div>

                        <div className="comboToolbarItemTexto">
                            Ampliar texto
                        </div>
                    </div>

                    <div className="comboToolbarItem">
                        <div className="comboToolbarItemIcono">
                            <img src={iconReducirTexto} />
                        </div>

                        <div className="comboToolbarItemTexto">
                            Reducir texto
                        </div>
                    </div>

                    <div className="comboToolbarItem">
                        <div className="comboToolbarItemIcono">
                            <img src={iconGuardarGrilla} />
                        </div>

                        <div className="comboToolbarItemTexto">
                            Guardar grilla
                        </div>
                    </div>




                    <div className="comboToolbarZonaInferior">

                        <div className="comboToolbarTitulo">

                            Vista actual

                        </div>

                        <div className="comboToolbarSubcombo">

                            <div className="comboToolbarSubcomboTexto">

                                Grilla 1

                            </div>

                            <div className="comboToolbarSubcomboFlecha">

                                <img src={iconFlechaC} />

                            </div>

                        </div>

                    </div>

                </div>

            )
        }

    </div>

);
}

export default ComboToolbar;