import "./InputComboBusqueda.css";

import { useState } from "react";

function InputComboBusqueda({
    titulo,
    valor,
    icono,
    onChange
}) {

    const [tieneFoco,setTieneFoco] = useState(false);

    return (

        <div className="inputComboBusqueda">

            <div
                className={`inputComboBusquedaTitulo ${
                    tieneFoco || valor
                        ? "inputComboBusquedaTituloActivo"
                        : ""
                }`}
            >
                {titulo}
            </div>

            <div className="inputComboBusquedaContenido">

                <input
                    className="inputComboBusquedaInput"
                    value={valor}
                    onChange={(e) => onChange(e.target.value)}
                    onFocus={() => setTieneFoco(true)}
                    onBlur={() => setTieneFoco(false)}
                />

                <div className="inputComboBusquedaIcono">
                    {icono}
                </div>

            </div>

        </div>

    );

}

export default InputComboBusqueda;