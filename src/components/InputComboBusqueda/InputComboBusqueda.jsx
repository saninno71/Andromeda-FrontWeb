import "./InputComboBusqueda.css";

import { useState } from "react";

function InputComboBusqueda({
    titulo,
    valor,
    items = [],
    campoID,
    campoCodigo,
    campoDescripcion,
    icono,
    onChange,
    onSeleccionar
}) {

    const [tieneFoco,setTieneFoco] = useState(false);
    const mostrarLista = tieneFoco;

    function obtenerTextoItem(item) {
        return `${item[campoCodigo]} - ${item[campoDescripcion]}`;
    }

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
                    onBlur={() => setTimeout(() => setTieneFoco(false), 150)}
                />

                <div className="inputComboBusquedaIcono">
                    {icono}
                </div>

            </div>

            {mostrarLista && (

                <div className="inputComboBusquedaLista">

                    {items.length > 0 ? (

                        items.map((item) => (

                            <div
                                key={item[campoID]}
                                className="inputComboBusquedaItem"
                                onMouseDown={() => {
                                    onSeleccionar(item);
                                    setTieneFoco(false);
                                }}
                            >
                                {obtenerTextoItem(item)}
                            </div>

                        ))

                    ) : (

                        <div className="inputComboBusquedaItem inputComboBusquedaItemVacio">
                            Sin Resultados
                        </div>

                    )}

                </div>

            )}

        </div>

    );

}

export default InputComboBusqueda;
