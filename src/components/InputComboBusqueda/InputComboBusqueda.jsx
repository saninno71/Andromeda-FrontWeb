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
    onSeleccionar,
    tabIndex
}) {

    const [tieneFoco,setTieneFoco] = useState(false);
    const [indiceActivo,setIndiceActivo] = useState(0);
    const mostrarLista = tieneFoco;

    function obtenerTextoItem(item) {
        return `${item[campoCodigo]} - ${item[campoDescripcion]}`;
    }

    function seleccionarItem(item) {

        onSeleccionar(item);
        setTieneFoco(false);

    }

    function manejarTecla(evento) {

        if (evento.key === "ArrowDown") {
            evento.preventDefault();
            setTieneFoco(true);
            setIndiceActivo(indice =>
                Math.min(items.length - 1,indice + 1)
            );
            return;
        }

        if (evento.key === "ArrowUp") {
            evento.preventDefault();
            setTieneFoco(true);
            setIndiceActivo(indice =>
                Math.max(0,indice - 1)
            );
            return;
        }

        if (evento.key === "Enter" && items[indiceActivo]) {
            seleccionarItem(items[indiceActivo]);
            return;
        }

        if (evento.key === "Escape") {
            setTieneFoco(false);
        }

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
                    onChange={(e) => {
                        setIndiceActivo(0);
                        onChange(e.target.value);
                    }}
                    onFocus={() => {
                        setIndiceActivo(0);
                        setTieneFoco(true);
                    }}
                    onBlur={() => setTimeout(() => setTieneFoco(false), 150)}
                    onKeyDown={manejarTecla}
                    tabIndex={tabIndex}
                />

                <div className="inputComboBusquedaIcono">
                    {icono}
                </div>

            </div>

            {mostrarLista && (

                <div className="inputComboBusquedaLista">

                    {items.length > 0 ? (

                        items.map((item,indice) => (

                            <div
                                key={item[campoID]}
                                className={`inputComboBusquedaItem ${
                                    indice === indiceActivo
                                        ? "inputComboBusquedaItemActivo"
                                        : ""
                                }`}
                                onMouseEnter={() => setIndiceActivo(indice)}
                                onMouseDown={() => {
                                    seleccionarItem(item);
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
