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
    onEnter,
    tabIndex,
    disabled = false,
    formatearItem,
    seleccionarAlEnfocar = false
}) {

    const [tieneFoco,setTieneFoco] = useState(false);
    const [indiceActivo,setIndiceActivo] = useState(0);
    const mostrarLista = tieneFoco && !disabled;

    function obtenerTextoItem(item) {
        return formatearItem?.(item) ?? `${item[campoCodigo]} - ${item[campoDescripcion]}`;
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

        if (evento.key === "Enter") {
            if (items[indiceActivo]) {
                evento.preventDefault();
                seleccionarItem(items[indiceActivo]);
                window.setTimeout(() => {
                    onEnter?.();
                },0);
                return;
            }

            onEnter?.();
            return;
        }

        if (evento.key === "Escape") {
            setTieneFoco(false);
        }

    }

    return (

        <div className={`inputComboBusqueda ${disabled ? "inputComboBusquedaDeshabilitado" : ""}`}>

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
                    disabled={disabled}
                    onChange={(e) => {
                        setIndiceActivo(0);
                        onChange(e.target.value);
                    }}
                    onFocus={(evento) => {
                        if (disabled) return;
                        setIndiceActivo(0);
                        setTieneFoco(true);
                        if (seleccionarAlEnfocar) evento.currentTarget.select();
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
                                    indice === indiceActivo ||
                                    obtenerTextoItem(item) === valor ||
                                    item[campoDescripcion] === valor
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
