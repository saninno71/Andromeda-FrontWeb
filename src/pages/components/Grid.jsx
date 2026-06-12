import iconEditar from "./styles/res/editarG.png";
import iconDel from "./styles/res/borrarG.png";
import iconVer from "./styles/res/verG.png";
import icon4 from "./styles/res/icon4G.png";
import icon5 from "./styles/res/icon5G.png";
import icon6 from "./styles/res/icon6G.png";

import "./styles/grid.css";
import { useState,useRef,useEffect,useMemo} from "react";

import {toggleOrdenamiento,ordenarDatos,obtenerOrdenColumna,obtenerFlechaOrden,obtenerOrdenamientoDefault} from "./gridOrdenamiento";
import {formatearValor} from "./gridFormatos";

function Grid({columnasVisibles,dataGrid,mostrarCheck,cargando}) {

     const ANCHO_COLUMNA_CHECK = 20;

    // ----------------------------------------------------------------------
    // VARIABLES DE ESTADO PARA FORZAR RENDERIZADOS y VARIABLES DE REFERENCIA
    // ----------------------------------------------------------------------
    
    //coleccion de KEYs seleccionadas por checks
    const [keysSeleccionadas, setKeysSeleccionadas] = useState([]);
    const refCheckTodos = useRef();
    const [totalesGrid,setTotalesGrid] = useState([]);
   
    //variables de estado para sincrinzar scrolls y provocar renderizado posterior
    const refGrillaHeader = useRef(null);
    const refGrillaDatos = useRef(null);
    const refGrillaTotales = useRef(null);
    const refScrollHorizontal = useRef(null);
    const refScrollVertical = useRef(null);

    //variables de estado para adminsitrar la visualización del menu flotante
    const [filaSeleccionada,setFilaSeleccionada] = useState(null);
    const [mostrarMenuFila,setMostrarMenuFila] = useState(false);
    const [topMenuFila,setTopMenuFila] = useState(0);

    //inicializa coleccion de columnas ordenadas por default
    const [ordenamiento,setOrdenamiento] =
    useState(
        obtenerOrdenamientoDefault(
            columnasVisibles
        )
    );

    //logica para adminsitar la seleccion de la fila y visualizacion del menu flotante
    function seleccionarFila(fila,e)
    {
        if(filaSeleccionada === fila)
        {
            //si fila seleccionada la deselecciona
            setFilaSeleccionada(null);
            setMostrarMenuFila(false);

            return;
        }

        const rectFila =
            e.currentTarget.getBoundingClientRect();

        const rectGrilla =
            refGrillaDatos.current.getBoundingClientRect();

        const top =
            rectFila.top
            - rectGrilla.top
            + refGrillaDatos.current.scrollTop;

        setTopMenuFila(top);

        setFilaSeleccionada(fila);
        setMostrarMenuFila(true);
    }

    //determina si es una fila seleccioanda
    function obtenerClaseFila(
        fila
    )
    {
        if(fila === filaSeleccionada)
        {
            return "filaMenuActiva";
        }

        return "";
    }

    // ----------------------------------------------------------------------
    /*INICIO ORDENAMIENTO DE FILAS*/
    // ----------------------------------------------------------------------

    //actava/desactiva el orden con la columna
    function manejarOrden(campo)
    {

            setMostrarMenuFila(false);
    setFilaSeleccionada(null);

    setOrdenamiento(prev =>
            toggleOrdenamiento(prev,campo)
        );
    }

    const dataOrdenada = useMemo(() => {

        return ordenarDatos(
            dataGrid,
            ordenamiento,
            columnasVisibles
        );

    }, [
        dataGrid,
        ordenamiento
    ]);
        
    //visualizacion de columnas ordenadas
    function renderOrdenColumna(campo)
    {
        const orden = obtenerOrdenColumna(
            ordenamiento,
            campo
        );

        if(!orden)
        {
            return null;
        }

        return (
            <span
                style={{
                    marginLeft:"3px"
                }}
            >
                {
                    obtenerFlechaOrden(
                        orden.direccion
                    )
                }
            </span>
        );
    }

    //devuelve marca de columna ordenada
    function obtenerClaseHeader(campo)
    {
        const orden = obtenerOrdenColumna(
            ordenamiento,
            campo
        );

        if(!orden)
        {
            return "";
        }

        return "thOrdenado";
    }

    /*FIN ORDENAMIENTO DE FILAS*/



    const columnasParaMostrar =
        columnasVisibles.filter(
            columna => columna.visible !== false
        );

    const columnasParaKey =
        columnasVisibles.filter(
            columna => columna.key === true
        );

    function armarKeyFila(fila) {
        return (
            columnasParaKey
            .map(columna => fila[columna.campo])
            .join("|")
        );
    }

    const todasLasKeys = dataOrdenada.map(fila =>
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

    //ACTUALIZA COLECCION DE FILAS CHECKEADAS
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

    //CALCULO DE TOTALES
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

            columnasParaMostrar

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

    //SOLO APLICA PRIMER RENDERIZADO
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

    //SOLO APLICA PRIMER RENDERIZADO
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

    //ALINEACION DE COLUMNA Y ANCHO SEGUN PARAMETRIA
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
    columnasParaMostrar.findIndex(
        columna =>
        columna.suma === true
    );

    const columnasTotales =
        indicePrimeraColumnaSuma === -1
        ? []
        : columnasParaMostrar.slice(indicePrimeraColumnaSuma);

    //DEVUELVE EL ESPACIO VISIBLE EN LA GRILLA ANTES DEL PRIMER TOTAL (PARA UBICAR LEYENDA DE TOTALES)
    function anchoColumnasAntesDeSuma() {

        let ancho = 0;

        if (mostrarCheck) {
            ancho = ancho + ANCHO_COLUMNA_CHECK;
        }

        columnasParaMostrar.forEach(function(columna, indice) {

            if (indice < indicePrimeraColumnaSuma) {
                ancho = ancho + columna.ancho;
            }

        });

        return ancho+7;
    }

    //ESTABLECE EL CORTE DE TEXTO EN COLUNNA
    function claseTextoColumna(columna) {

        if (columna.desdoblarTexto === true) {
            return "celdaTextoDesdoblado";
        }

        return "celdaTextoCortado";

    }

    //ESTABLECE PAR / IMPRAR PARA EL ALTERNADO DE COLORES DE LA GRILLA
    function claseFila(indiceFila, keyFila) {

        if (keysSeleccionadas.includes(keyFila)) {
            return "filaSeleccionada";
        }

        if (indiceFila % 2 === 0) {
            return "fila-par";
        }

        return "fila-impar";
    }

    /* SCROLL */
    //SINCROMOZXACION HORIZONTAL DE SCROLL CON LA GRILLA
    function sincronizarDesdeScrollHorizontal() {

        const scrollLeft =
            refScrollHorizontal.current.scrollLeft;

        if (refGrillaDatos.current) {
            refGrillaDatos.current.scrollLeft = scrollLeft;
        }

        if (refGrillaHeader.current) {
            refGrillaHeader.current.scrollLeft = scrollLeft;
        }

        if (refGrillaTotales.current) {
            refGrillaTotales.current.scrollLeft = scrollLeft;
        }

    }

    //SINCROMOZXACION HORIZONTAL DE SCROLL CON LA GRILLA
    function sincronizarDesdeScrollVertical() {

        const scrollTop =
            refScrollVertical.current.scrollTop;

        if (refGrillaDatos.current) {

            refGrillaDatos.current.scrollTop =
                scrollTop;

    setMostrarMenuFila(false);

    setFilaSeleccionada(null);

        }

    }

    function sincronizarDesdeGrillaDatos() {

        const scrollTop =
            refGrillaDatos.current.scrollTop;

        const scrollLeft =
            refGrillaDatos.current.scrollLeft;

        // setMostrarMenuFila(false);
        // setFilaSeleccionada(null);

        if (refScrollVertical.current) {

            refScrollVertical.current.scrollTop =
                scrollTop;

        }

        if (refScrollHorizontal.current) {

            refScrollHorizontal.current.scrollLeft =
                scrollLeft;

        }

        if (refGrillaHeader.current) {

            refGrillaHeader.current.scrollLeft =
                scrollLeft;

        }

        if (refGrillaTotales.current) {

            refGrillaTotales.current.scrollLeft =
                scrollLeft;

        }

    }

    function anchoTotalGrilla() {

        let ancho = 0;

        if (mostrarCheck) {
            ancho = ancho + ANCHO_COLUMNA_CHECK;
        }

        columnasParaMostrar.forEach(function(columna) {
            ancho = ancho + columna.ancho;
        });

        return ancho;

    }

    function manejarRuedaMouse(e)
    {
        e.preventDefault();

        if(refScrollVertical.current)
        {
            refScrollVertical.current.scrollTop += e.deltaY * 0.3;

            sincronizarDesdeScrollVertical();
        }
    }


    return (

    <div className="grilla">

        {cargando && (
            <div className="grillaLoadingOverlay">
                <div className="loader"></div>
                        <div className="loaderTexto">
            Procesando...
        </div>
            </div>
            
            
        )}


        <div
            className="grillaHeader"
            ref={refGrillaHeader}
        >

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
                    columnasParaMostrar.map(
                    columna => (
                        <th
                            className={obtenerClaseHeader(columna.campo)}
                            key={columna.campo}
                            style={estiloColumna(columna)}
                            onDoubleClick={() => manejarOrden(columna.campo) }
                        >
                            <span className="contenidoCelda">
                                {columna.titulo}
                                {renderOrdenColumna(columna.campo)}
                            </span>
                        </th>
                    ))
                    }

                    </tr>
                </thead>
            </table>

        </div>

        <div className="grillaCentro">

            <div
                className="grillaDatos"
                ref={refGrillaDatos}
                onScroll={sincronizarDesdeGrillaDatos}
                onWheel={manejarRuedaMouse}
            >

                <table>
                    <tbody>
                    {
                    dataOrdenada.map(
                    (fila,indiceFila) => {

                        const keyFila = armarKeyFila(fila);

                        return (

                        <tr
                            className={
                                `
                                    ${claseFila(indiceFila, keyFila)}
                                    ${obtenerClaseFila(fila)}
                                `
                            }
                            key={keyFila}
                            data-key={keyFila}
                            onClick={(e) => seleccionarFila(fila,e)}
                        >

                            {mostrarCheck && (
                                <td style={{
                                    width: ANCHO_COLUMNA_CHECK + "px",
                                    minWidth: ANCHO_COLUMNA_CHECK + "px",
                                    maxWidth: ANCHO_COLUMNA_CHECK + "px"
                                    }}
                                >
                                    <input
                                        type="checkbox"
                                        checked={keysSeleccionadas.includes(keyFila)}
                                        onChange={() =>cambiarCheckFila(keyFila)}
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                </td>
                            )}

                            {
                            columnasParaMostrar.map(
                            columna => (
                                <td
                                    key={columna.campo}
                                    style={{
                                            ...estiloColumna(columna),
                                                position:"relative"
                                    }}
                                    className={claseTextoColumna(columna)}
                                >
                                    <span className="contenidoCelda">
                                        {formatearValor(
                                                fila[columna.campo],
                                                columna.formato,
                                                columna.mascara
                                            )
                                        }
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



{
    filaSeleccionada &&
    mostrarMenuFila && (

        <div
    
    className={`
        menuFila
        ${
            claseFila(
                dataOrdenada.findIndex(
                    fila => fila === filaSeleccionada
                ),
                armarKeyFila(filaSeleccionada)
            )
        }
    `}

   style={{
    top:"0px",

    transform:
        `translateY(${
            topMenuFila
            - refGrillaDatos.current.scrollTop
            + 2
        }px)`
}}

    
>

        <img src={iconEditar}
            alt=""
            style={{
                width:"13px",
                height:"13px"
            }}
        />

        <img src={iconDel}
            alt=""
            style={{
                width:"13px",
                height:"13px"
            }}
        />

           <img src={iconVer}
            alt=""
            style={{
                width:"13px",
                height:"13px"
            }}
        />

           <img src={icon4}
            alt=""
            style={{
                width:"13px",
                height:"13px"
            }}
        />

            <img src={icon5}
            alt=""
            style={{
                width:"13px",
                height:"13px"
            }}
        />

          <img src={icon6}
            alt=""
            style={{
                width:"13px",
                height:"13px"
            }}
        />

        </div>
    )
}




            <div
                className="grillaScrollVertical"
                ref={refScrollVertical}
                onScroll={sincronizarDesdeScrollVertical}
            >

                <div
                    className="grillaScrollVerticalContenido"
                    style={{
                        height:
                            refGrillaDatos.current
                            ? refGrillaDatos.current.scrollHeight + "px"
                            : "0px"
                    }}
                ></div>

            </div>

        </div>

        <div
            className="grillaScrollHorizontal"
            ref={refScrollHorizontal}
            onScroll={sincronizarDesdeScrollHorizontal}
        >
            <div
                className="grillaScrollContenido"
                style={{
                    width: anchoTotalGrilla()  -5 + "px"
                }}
            ></div>
        </div>

        <div className="grillaTotalesContenedor">

            <div className="grillaTotales" ref={refGrillaTotales}>

                <table>
                    <tbody>
                        <tr>
                            <td
                                style={{
                                    width: anchoColumnasAntesDeSuma() + "px",
                                    minWidth: anchoColumnasAntesDeSuma() + "px",
                                    maxWidth: anchoColumnasAntesDeSuma() + "px"
                                }}
                            ></td>

                            {
                                columnasParaMostrar
                                .slice(indicePrimeraColumnaSuma)
                                .map(columna => {

                                    const total =
                                        totalesGrid.find(
                                            x => x.campo === columna.campo
                                        );

                                    return (
                                        <td
                                            key={columna.campo}
                                            style={estiloColumna(columna)}
                                        >
                                            {
                                                columna.suma === true
                                                    ? formatearValor(
                                                        total?.total,
                                                        columna.formato,
                                                        columna.mascara
                                                    )
                                                    : ""
                                            }
                                        </td>
                                    );
                                })
                            }
                        </tr>
                    </tbody>
                </table>

            </div>

            <div className="totalRegistrosFlotante">
                {textoCantidadRegistros}
            </div>

        </div>

    </div>

    );
}

export default Grid;