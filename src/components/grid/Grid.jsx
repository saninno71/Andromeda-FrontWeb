import "./grid.css";
import { useState,useRef,useEffect,useMemo,useCallback} from "react";
import {
    DndContext,
    closestCenter
} from "@dnd-kit/core";
import {
    SortableContext,
    horizontalListSortingStrategy
} from "@dnd-kit/sortable";

import GridHeaderColumnaOrdenable from "./GridHeaderColumnaOrdenable";
import {toggleOrdenamiento,ordenarDatos,obtenerOrdenColumna,obtenerFlechaOrden,obtenerOrdenamientoDefault} from "./gridOrdenamiento";
import {filtrarDatosPorTexto} from "./gridBusqueda";
import {crearNavegacionGrid} from "./gridNavegacion";
import {calcularTotalesGrid} from "./gridTotales";
import {useGridSeleccion} from "./useGridSeleccion";
import {useGridColumnas} from "./useGridColumnas";
import {crearResizeColumnas} from "./gridResizeColumnas";
import {useGridDragColumnas} from "./useGridDragColumnas";
import {crearScrollGrid} from "./gridScroll";
import GridTotalesVista from "./GridTotalesVista";
import GridMenuFila from "./GridMenuFila";
import GridFila from "./GridFila";
import {useGridVirtualizacion} from "./useGridVirtualizacion";
import {
    obtenerClaseFilaGrid,
    obtenerClaseFilaMenu,
    obtenerEstiloColumna
} from "./gridEstilos";

function Grid({
    columnasVisibles,
    dataGrid,
    mostrarCheck,
    cargando,
    mostrarSinDatos = true,
    cargandoPaginas = false,
    totalRegistrosRemotos = null,
    enfoqueVersion = null,
    tamanoFuente = 13,
    layoutColumnas = null,
    layoutVersion = 0,
    onLayoutChange,
    textoBusqueda = ""
}) {

     const ANCHO_COLUMNA_CHECK = 20;
     const ANCHO_MINIMO_COLUMNA = 12;
     const ANCHO_SCROLL_VERTICAL = 8;
     const ANCHO_ESPACIO_FINAL = 40;
     const estiloEspacioFinal = useMemo(() => ({
        width: ANCHO_ESPACIO_FINAL + "px",
        minWidth: ANCHO_ESPACIO_FINAL + "px",
        maxWidth: ANCHO_ESPACIO_FINAL + "px"
     }), []);

    // ----------------------------------------------------------------------
    // VARIABLES DE ESTADO PARA FORZAR RENDERIZADOS y VARIABLES DE REFERENCIA
    // ----------------------------------------------------------------------
    
    //variables de estado para sincrinzar scrolls y provocar renderizado posterior
    const refGrillaHeader = useRef(null);
    const refGrillaDatos = useRef(null);
    const refGrillaTotales = useRef(null);
    const refScrollHorizontal = useRef(null);
    const refScrollVertical = useRef(null);
    const refGrilla = useRef(null);
    const refPrimeraCeldaDatos = useRef(null);

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

    const {
        setColumnasOrdenadas,
        columnasParaMostrar
    } = useGridColumnas({
        columnasVisibles,
        layoutColumnas,
        layoutVersion,
        onLayoutChange
    });

    //logica para adminsitar la seleccion de la fila y visualizacion del menu flotante
    const seleccionarFila = useCallback(function seleccionarFila(fila,e)
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
    }, [filaSeleccionada]);

    //determina si es una fila seleccioanda
    const obtenerClaseFila = useCallback(function obtenerClaseFila(
        fila
    )
    {
        return obtenerClaseFilaMenu({
            fila,
            filaSeleccionada
        });
    }, [filaSeleccionada]);

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

    const {
        columnaDestino,
        sensoresColumnas,
        manejarFinArrastreColumnas,
        manejarArrastreSobreColumnas,
        manejarCancelarArrastreColumnas
    } = useGridDragColumnas({
        setColumnasOrdenadas
    });

    const {
        iniciarResizeColumna,
        alternarAnchoColumna
    } = crearResizeColumnas({
        columnasVisibles,
        setColumnasOrdenadas,
        anchoMinimoColumna:ANCHO_MINIMO_COLUMNA
    });

    const dataFiltrada = useMemo(() => {

        return filtrarDatosPorTexto(
            dataGrid,
            columnasParaMostrar,
            textoBusqueda
        );

    }, [
        dataGrid,
        columnasParaMostrar,
        textoBusqueda
    ]);

    const dataOrdenada = useMemo(() => {

        return ordenarDatos(
            dataFiltrada,
            ordenamiento,
            columnasVisibles
        );

    }, [
        dataFiltrada,
        ordenamiento,
        columnasVisibles
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


    const columnasParaKey = useMemo(() =>
        columnasVisibles.filter(
            columna => columna.key === true
        ),
        [columnasVisibles]
    );

    const armarKeyFila = useCallback(function armarKeyFila(fila) {
        return (
            columnasParaKey
            .map(columna => fila[columna.campo])
            .join("|")
        );
    }, [columnasParaKey]);

    const todasLasKeys = useMemo(() =>
        dataOrdenada.map(fila =>
            armarKeyFila(fila)
        ),
        [dataOrdenada,armarKeyFila]
    );

    const {
        keysSeleccionadas,
        keysSeleccionadasSet,
        refCheckTodos,
        estanTodasSeleccionadas,
        cambiarCheckTodos,
        cambiarCheckFila,
        limpiarSeleccion
    } = useGridSeleccion({
        todasLasKeys
    });

    const totalesGrid = useMemo(() =>
        calcularTotalesGrid({
            columnas:columnasParaMostrar,
            filas:dataFiltrada,
            keysSeleccionadas,
            keysSeleccionadasSet,
            armarKeyFila
        }),
        [
            columnasParaMostrar,
            dataFiltrada,
            keysSeleccionadas,
            keysSeleccionadasSet,
            armarKeyFila
        ]
    );

useEffect(() =>
{
    setMostrarMenuFila(false);
    limpiarSeleccion();
    setFilaSeleccionada(null);
},
[
    enfoqueVersion == null
        ? dataGrid
        : enfoqueVersion,
    textoBusqueda,
    limpiarSeleccion
]);

useEffect(() => {

    if (dataOrdenada.length === 0) {
        return;
    }

    window.setTimeout(() => {
        refPrimeraCeldaDatos.current?.focus?.();
    },0);

}, [
    enfoqueVersion == null
        ? dataGrid
        : enfoqueVersion
]);

    const estiloColumna = obtenerEstiloColumna;

    const cantidadTotalRegistros = dataGrid.length;
    const cantidadRegistrosFiltrados = dataFiltrada.length;
    const cantidadSeleccionados = keysSeleccionadas.length;

    const cantidadTotalDisponible =
        totalRegistrosRemotos ?? cantidadTotalRegistros;

    const segmentosCantidad = [];

    if (cantidadSeleccionados > 0) {
        segmentosCantidad.push(
            cantidadSeleccionados + " seleccionados"
        );
    }

    if (
        textoBusqueda &&
        cantidadSeleccionados === 0 &&
        cantidadRegistrosFiltrados !== cantidadTotalRegistros
    ) {
        segmentosCantidad.push(
            cantidadRegistrosFiltrados + " filtrados"
        );
    }

    segmentosCantidad.push(
        cantidadTotalRegistros +
        " de " +
        cantidadTotalDisponible +
        " registros"
    );

    const textoCantidadRegistros =
        segmentosCantidad.join(" / ");

    const claseFila = useCallback(function claseFila(indiceFila, keyFila) {

        return obtenerClaseFilaGrid({
            indiceFila,
            keyFila,
            keysSeleccionadasSet
        });
    }, [keysSeleccionadasSet]);

    const {
        anchoContenidoScrollHorizontal,
        sincronizarDesdeScrollHorizontal,
        sincronizarDesdeScrollVertical,
        sincronizarDesdeGrillaDatos
    } = crearScrollGrid({
        refGrillaDatos,
        refGrillaHeader,
        refGrillaTotales,
        refScrollHorizontal,
        refScrollVertical,
        columnasParaMostrar,
        mostrarCheck,
        anchoColumnaCheck:ANCHO_COLUMNA_CHECK,
        anchoEspacioFinal:ANCHO_ESPACIO_FINAL,
        anchoScrollVertical:ANCHO_SCROLL_VERTICAL,
        onOcultarMenuFila:() => {
            setMostrarMenuFila(false);
            setFilaSeleccionada(null);
        }
    });

    const {
        manejarRuedaMouse,
        manejarTeclaScroll,
        manejarTeclaGlobal
    } = crearNavegacionGrid({
        refGrilla,
        refGrillaDatos,
        refScrollVertical,
        refScrollHorizontal,
        dataOrdenada,
        columnasParaMostrar,
        sincronizarDesdeScrollVertical,
        sincronizarDesdeScrollHorizontal,
        sincronizarDesdeGrillaDatos
    });

    const {
        filasVirtuales,
        altoTotal,
        offsetY,
        altoInferior,
        actualizarScrollTop
    } = useGridVirtualizacion({
        filas:dataOrdenada,
        refContenedor:refGrillaDatos
    });

    useEffect(() => {

        if (refGrillaDatos.current) {
            refGrillaDatos.current.scrollTop = 0;
        }

        if (refScrollVertical.current) {
            refScrollVertical.current.scrollTop = 0;
        }

        actualizarScrollTop(0);

    }, [
        enfoqueVersion == null
            ? dataGrid
            : enfoqueVersion,
        actualizarScrollTop
    ]);

    function manejarScrollGrillaDatos() {

        actualizarScrollTop(
            refGrillaDatos.current?.scrollTop ?? 0
        );
        sincronizarDesdeGrillaDatos();

    }

    function manejarScrollVertical() {

        sincronizarDesdeScrollVertical();
        actualizarScrollTop(
            refScrollVertical.current?.scrollTop ?? 0
        );

    }

    const cantidadColumnasTabla =
        columnasParaMostrar.length +
        (mostrarCheck ? 1 : 0) +
        1;

    useEffect(() => {

        document.addEventListener(
            "keydown",
            manejarTeclaGlobal
        );

        return () => {
            document.removeEventListener(
                "keydown",
                manejarTeclaGlobal
            );
        };

    }, [manejarTeclaGlobal]);


    return (

    <div
        className="grilla"
        ref={refGrilla}
        tabIndex={0}
        onKeyDown={manejarTeclaScroll}
        style={{
            "--grid-font-size": tamanoFuente + "px",
            "--grid-total-font-size": (tamanoFuente + 1) + "px"
        }}
    >
        {cargando && (
            <div className="grillaLoadingOverlay">
                <div className="loader"></div>
                <div className="loaderTexto">
                    Procesando...
                </div>
            </div>
        )}

        {!cargando && mostrarSinDatos && dataOrdenada.length === 0 && (
            <div className="grillaSinDatosOverlay">

                <div className="grillaSinDatosIcono">
                    🔍
                </div>

                <div className="grillaSinDatosTexto">
                    No se encontraron registros
                </div>

            </div>
        )}

        <div
            className="grillaHeader"
            ref={refGrillaHeader}
        >

            <DndContext
                collisionDetection={closestCenter}
                sensors={sensoresColumnas}
                onDragOver={manejarArrastreSobreColumnas}
                onDragEnd={manejarFinArrastreColumnas}
                onDragCancel={manejarCancelarArrastreColumnas}
            >
                <SortableContext
                    items={columnasParaMostrar.map(columna => columna.campo)}
                    strategy={horizontalListSortingStrategy}
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
                                <GridHeaderColumnaOrdenable
                                    clase={obtenerClaseHeader(columna.campo)}
                                    columna={columna}
                                    esDestino={columnaDestino === columna.campo}
                                    key={columna.campo}
                                    estilo={estiloColumna(columna)}
                                    onOrdenar={manejarOrden}
                                    onIniciarResize={iniciarResizeColumna}
                                    onAlternarAncho={alternarAnchoColumna}
                                >
                                    <span className="contenidoCelda">
                                        {columna.titulo}
                                        {renderOrdenColumna(columna.campo)}
                                    </span>
                                </GridHeaderColumnaOrdenable>
                            ))
                            }

                            <th style={estiloEspacioFinal}></th>

                            </tr>
                        </thead>
                    </table>
                </SortableContext>
            </DndContext>

        </div>

        <div className="grillaCentro">

            <div
                className="grillaDatos"
                ref={refGrillaDatos}
                onScroll={manejarScrollGrillaDatos}
                onWheel={manejarRuedaMouse}
                onClick={(e) => {
                    if (e.target === e.currentTarget) {
                        refGrilla.current?.focus?.();
                    }
                }}
            >

                <table>
                    <tbody>
                    {offsetY > 0 && (
                        <tr className="grillaFilaEspaciadora">
                            <td
                                colSpan={cantidadColumnasTabla}
                                style={{height:offsetY + "px"}}
                            ></td>
                        </tr>
                    )}
                    {
                    filasVirtuales.map(
                    ({fila,indice:indiceFila}) => {

                        const keyFila = armarKeyFila(fila);
                        const claseFilaActual =
                            claseFila(indiceFila,keyFila);
                        const checked =
                            keysSeleccionadasSet.has(keyFila);

                        return (
                            <GridFila
                                key={keyFila}
                                fila={fila}
                                indiceFila={indiceFila}
                                keyFila={keyFila}
                                claseFila={claseFilaActual}
                                claseMenuFila={obtenerClaseFila(fila)}
                                mostrarCheck={mostrarCheck}
                                anchoColumnaCheck={ANCHO_COLUMNA_CHECK}
                                columnas={columnasParaMostrar}
                                checked={checked}
                                cambiarCheckFila={cambiarCheckFila}
                                seleccionarFila={seleccionarFila}
                                refPrimeraCeldaDatos={refPrimeraCeldaDatos}
                                estiloColumna={estiloColumna}
                                estiloEspacioFinal={estiloEspacioFinal}
                            />
                        );
                    })
                    }
                    {altoInferior > 0 && (
                        <tr className="grillaFilaEspaciadora">
                            <td
                                colSpan={cantidadColumnasTabla}
                                style={{height:altoInferior + "px"}}
                            ></td>
                        </tr>
                    )}
                    </tbody>
                </table>


            </div>



            <GridMenuFila
                filaSeleccionada={filaSeleccionada}
                mostrarMenuFila={mostrarMenuFila}
                claseFila={claseFila}
                indiceFila={
                    dataOrdenada.findIndex(
                        fila => fila === filaSeleccionada
                    )
                }
                keyFila={
                    filaSeleccionada
                        ? armarKeyFila(filaSeleccionada)
                        : ""
                }
                topMenuFila={topMenuFila}
                scrollTop={refGrillaDatos.current?.scrollTop ?? 0}
            />


            <div
                className="grillaScrollVertical"
                ref={refScrollVertical}
                onScroll={manejarScrollVertical}
            >

                <div
                    className="grillaScrollVerticalContenido"
                    style={{
                        height:altoTotal + "px"
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
                    width: anchoContenidoScrollHorizontal + "px"
                }}
            ></div>
        </div>

        <GridTotalesVista
            refGrillaTotales={refGrillaTotales}
            mostrarCheck={mostrarCheck}
            anchoColumnaCheck={ANCHO_COLUMNA_CHECK}
            columnas={columnasParaMostrar}
            totales={totalesGrid}
            estiloColumna={estiloColumna}
            estiloEspacioFinal={estiloEspacioFinal}
            textoCantidadRegistros={textoCantidadRegistros}
            cargandoPaginas={cargandoPaginas}
        />

    </div>

    );
}

export default Grid;
