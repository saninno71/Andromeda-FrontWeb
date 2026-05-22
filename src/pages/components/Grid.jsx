import "./styles/grid.css";
import { useState,useRef,useEffect} from "react";

function Grid({columnasVisibles,dataGrid,mostrarCheck}) {

    const [keysSeleccionadas, setKeysSeleccionadas] = useState([]);
    const refCheckTodos = useRef();
    const [totalesGrid,setTotalesGrid] = useState([]);
    const ANCHO_COLUMNA_CHECK = 20;

    function armarKeyFila(fila) {
        return (
            columnasVisibles
            .filter(columna => columna.key === true)
            .map(columna => fila[columna.campo])
            .join("|")
        );
    }

    const todasLasKeys = dataGrid.map(fila =>
        armarKeyFila(fila)
    );

    const estanTodasSeleccionadas =
        todasLasKeys.length > 0 &&
        todasLasKeys.every(
            key => keysSeleccionadas.includes(key)
        );

    function cambiarCheckTodos() {

        if (estanTodasSeleccionadas) {
            setKeysSeleccionadas([]);
        } else {
            setKeysSeleccionadas(todasLasKeys);
        }
    }

    function cambiarCheckFila(keyFila) {

        setKeysSeleccionadas(function(keysAnteriores) {

            if (keysAnteriores.includes(keyFila)) {
                return keysAnteriores.filter(
                    key => key !== keyFila
                );

            } else {
                return [
                    ...keysAnteriores,
                    keyFila
                ];
            }

        });

    }

    function calcularTotales() {

        const filasASumar =

            keysSeleccionadas.length === 0

            ? dataGrid
            : dataGrid.filter(fila => {

                const keyFila =
                    armarKeyFila(fila);

                return keysSeleccionadas.includes(
                    keyFila
                );

            });

        return (

            columnasVisibles

            .filter(
                columna =>
                columna.suma === true
            )

            .map(columna => {

                const total =
                    filasASumar.reduce(

                    function(
                        acumulador,
                        fila
                    ) {

                        return (
                            acumulador +
                            Number(
                                fila[columna.campo]
                                || 0
                            )
                        );
                    },
                    0
                );

                return {

                    campo:
                        columna.campo,

                    total:
                        Math.round(
                            total * 100
                        ) / 100

                };
            })
        );
    }

    useEffect(() => {

        setTotalesGrid(
            calcularTotales()
        );

    },
    [
        dataGrid,
        keysSeleccionadas,
        columnasVisibles
    ]);

    useEffect(() => {

        if (
            refCheckTodos.current
        ) {
            refCheckTodos.current.indeterminate =

                keysSeleccionadas.length > 0 &&

                !estanTodasSeleccionadas;
        }

    },
    [
        keysSeleccionadas,
        estanTodasSeleccionadas
    ]);

    function estiloColumna(columna) {
    return {
        width: columna.ancho + "px",
        minWidth: columna.ancho + "px",
        maxWidth: columna.ancho + "px",
        textAlign: columna.align
    };
    }

    const cantidadTotalRegistros = dataGrid.length;
    const cantidadSeleccionados = keysSeleccionadas.length;

    const cantidadMostrada =
        cantidadSeleccionados > 0
        ? cantidadSeleccionados
        : cantidadTotalRegistros;

    const textoCantidadRegistros =
        cantidadMostrada + " de " + cantidadTotalRegistros + " registros";

    const indicePrimeraColumnaSuma =
    columnasVisibles.findIndex(
        columna =>
        columna.suma === true
    );

    const columnasTotales =
        indicePrimeraColumnaSuma === -1
        ? []
        : columnasVisibles.slice(indicePrimeraColumnaSuma);



    function anchoColumnasAntesDeSuma() {

        let ancho = 0;

        if (mostrarCheck) {
            ancho = ancho + ANCHO_COLUMNA_CHECK;
        }

        columnasVisibles.forEach(function(columna, indice) {

            if (indice < indicePrimeraColumnaSuma) {
                ancho = ancho + columna.ancho;
            }

        });

        return ancho;
    }
    
    function claseTextoColumna(columna) {

        if (columna.desdoblarTexto === true) {
            return "celdaTextoDesdoblado";
        }

        return "celdaTextoCortado";

    }   

    function claseFila(indiceFila, keyFila) {

        if (keysSeleccionadas.includes(keyFila)) {
            return "filaSeleccionada";
        }

        if (indiceFila % 2 === 0) {
            return "fila-par";
        }

        return "fila-impar";
    }


    return (

    <div className="grilla">

        <div className="grillaDatos">

            <table>
                <thead>
                    <tr>
                    {mostrarCheck && (
                        <th style={{
                            width: ANCHO_COLUMNA_CHECK + "px",
                            minWidth: ANCHO_COLUMNA_CHECK + "px",
                            maxWidth: ANCHO_COLUMNA_CHECK + "px"
                             }}
                        >
                            <input
                                type="checkbox"
                                ref={refCheckTodos}
                                onChange={cambiarCheckTodos}
                                checked={estanTodasSeleccionadas}
                            />
                        </th>
                    )}

                    {
                    columnasVisibles.map(
                    columna => (
                        <th
                            key={columna.campo}
                            style={estiloColumna(columna)}
                        >
                            <span className="contenidoCelda">
                                {columna.titulo}
                            </span>
                        </th>
                    ))
                    }
                    </tr>
                </thead>


                <tbody>
                {
                dataGrid.map(
                (fila,indiceFila) => {

                    const keyFila = armarKeyFila(fila);

                    return (

                    <tr
                        // className="filas"
                        // className={
                        //     (indiceFila % 2 === 0
                        //     ? "fila-par"
                        //     : "fila-impar")
                        // }
                        className={claseFila(indiceFila, keyFila)}
                        key={keyFila}
                        data-key={keyFila}
                    >

                        {mostrarCheck && (
                            <td style={{
                                width: ANCHO_COLUMNA_CHECK + "px",
                                minWidth: ANCHO_COLUMNA_CHECK + "px",
                                maxWidth: ANCHO_COLUMNA_CHECK + "px"
                                }}
                                // className={
                                //     (indiceFila % 2 === 0
                                //     ? "fila-par"
                                //     : "fila-impar")
                                // }
                                                            >
                                <input
                                    type="checkbox"
                                    checked={keysSeleccionadas.includes(keyFila)}
                                    onChange={() =>cambiarCheckFila(keyFila)}
                                />
                            </td>
                        )}

                        {
                        columnasVisibles.map(
                        columna => (
                            <td
                                key={columna.campo}
                                style={estiloColumna(columna)}
                                // className={
                                //     (indiceFila % 2 === 0
                                //     ? "fila-par"
                                //     : "fila-impar")  + " " + claseTextoColumna(columna)
                                // }
                                className={claseTextoColumna(columna) 
                                    // + " " + claseFila(indiceFila, keyFila)
                                }
                            >
                                <span className="contenidoCelda">
                                    {fila[columna.campo]}
                                </span>
                            </td>
                        ))
                        }
                    </tr>
                    );

                })
                }


                </tbody>

            </table>
        </div>

        <div className="grillaTotales">
            <table>
                <tbody>
                    <tr>
                        <td
                            className="totalRegistros"
                            style={{
                                width: anchoColumnasAntesDeSuma() + "px"
                            }}
                        >
                            {textoCantidadRegistros}
                        </td>

                        {
                        columnasVisibles
                        .slice(indicePrimeraColumnaSuma)
                        .map(
                        columna => {
                            const total =
                                totalesGrid.find(
                                    x =>
                                    x.campo ===
                                    columna.campo
                                );

                            return (

                                <td
                                    key={columna.campo}
                                    style={estiloColumna(columna)}
                                >
                                
                                    <span className="contenidoCelda">
                                        {
                                            columna.suma === true
                                            ? total?.total
                                            : ""
                                        }
                                    </span>
                                </td>

                            );
                        })
                        }
                    </tr>
                </tbody>
            </table>
        </div>
    
    </div>
    );
}

export default Grid;