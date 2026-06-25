import iconEditar from "../../assets/editarG.png"
import iconDel from "../../assets/borrarG.png";
import iconVer from "../../assets/verG.png";
import icon4 from "../../assets/icon4G.png";
import icon5 from "../../assets/icon5G.png";
import icon6 from "../../assets/icon6G.png";

import "./grid.css";
import { useState,useRef,useEffect,useMemo} from "react";
import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors
} from "@dnd-kit/core";
import {
    SortableContext,
    horizontalListSortingStrategy,
    useSortable,
    arrayMove
} from "@dnd-kit/sortable";
import {CSS} from "@dnd-kit/utilities";

import {toggleOrdenamiento,ordenarDatos,obtenerOrdenColumna,obtenerFlechaOrden,obtenerOrdenamientoDefault} from "./gridOrdenamiento";
import {filtrarDatosPorTexto} from "./gridBusqueda";
import {formatearValor} from "../updFormatos";

function HeaderColumnaOrdenable({
    columna,
    estilo,
    clase,
    esDestino,
    onOrdenar,
    onIniciarResize,
    onAlternarAncho,
    children
}) {

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({
        id: columna.campo
    });

    return (
        <th
            ref={setNodeRef}
            className={`
                ${clase}
                ${isDragging ? "thArrastrando" : ""}
                ${esDestino ? "thDestinoArrastre" : ""}
            `}
            key={columna.campo}
            style={{
                ...estilo,
                position:"relative",
                transform: CSS.Transform.toString(transform),
                transition
            }}
            onClick={(e) => {
                if (!e.ctrlKey) {
                    return;
                }

                e.preventDefault();
                e.stopPropagation();
                onAlternarAncho(columna);
            }}
            onDoubleClick={() => onOrdenar(columna.campo)}
            {...attributes}
            {...listeners}
        >
            {children}
            <div
                className="resizeColumnaHandle"
                onPointerDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onIniciarResize(columna,e);
                }}
                onDoubleClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                }}
            ></div>
        </th>
    );

}

function Grid({
    columnasVisibles,
    dataGrid,
    mostrarCheck,
    cargando,
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
     const estiloEspacioFinal = {
        width: ANCHO_ESPACIO_FINAL + "px",
        minWidth: ANCHO_ESPACIO_FINAL + "px",
        maxWidth: ANCHO_ESPACIO_FINAL + "px"
     };
     const sensoresColumnas = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 6
            }
        })
     );

    // ----------------------------------------------------------------------
    // VARIABLES DE ESTADO PARA FORZAR RENDERIZADOS y VARIABLES DE REFERENCIA
    // ----------------------------------------------------------------------
    
    //coleccion de KEYs seleccionadas por checks
    const [keysSeleccionadas, setKeysSeleccionadas] = useState([]);
    const [keyAnclaSeleccion,setKeyAnclaSeleccion] = useState(null);
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

    // Orden visual editable: drag y resize sin modificar la definición base.
    const [columnasOrdenadas,setColumnasOrdenadas] =
    useState(columnasVisibles);
    const [columnaDestino,setColumnaDestino] = useState(null);

    function aplicarLayoutColumnas(layout) {

        if (!layout) {
            return columnasVisibles;
        }

        const columnasPorCampo =
            new Map(
                columnasVisibles.map(columna => [
                    columna.campo,
                    columna
                ])
            );

        const columnasLayout =
            layout
            .map(columnaLayout => {
                const columnaBase =
                    columnasPorCampo.get(columnaLayout.campo);

                if (!columnaBase) {
                    return null;
                }

                return {
                    ...columnaBase,
                    ancho:
                        columnaLayout.ancho ??
                        columnaBase.ancho
                };
            })
            .filter(Boolean);

        const camposLayout =
            new Set(
                columnasLayout.map(columna => columna.campo)
            );

        const columnasNuevas =
            columnasVisibles.filter(
                columna => !camposLayout.has(columna.campo)
            );

        return [
            ...columnasLayout,
            ...columnasNuevas
        ];

    }

    useEffect(() => {

        setColumnasOrdenadas(columnasActuales => {

            const camposActuales =
                columnasActuales.map(columna => columna.campo);

            const camposNuevos =
                columnasVisibles.map(columna => columna.campo);

            const mismosCampos =
                camposActuales.length === camposNuevos.length &&
                camposActuales.every(campo =>
                    camposNuevos.includes(campo)
                );

            if (mismosCampos) {
                return columnasActuales;
            }

            return columnasVisibles;

        });

    }, [columnasVisibles]);

    useEffect(() => {

        setColumnasOrdenadas(
            aplicarLayoutColumnas(layoutColumnas)
        );

    }, [layoutVersion]);

    useEffect(() => {

        if (!onLayoutChange) {
            return;
        }

        onLayoutChange(
            columnasOrdenadas.map(columna => ({
                campo:columna.campo,
                ancho:columna.ancho
            }))
        );

    }, [columnasOrdenadas,onLayoutChange]);

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

    function manejarFinArrastreColumnas(event) {

        const {active,over} = event;
        setColumnaDestino(null);

        if (!over || active.id === over.id) {
            return;
        }

        setColumnasOrdenadas(columnasActuales => {

            const indiceOrigen =
                columnasActuales.findIndex(
                    columna => columna.campo === active.id
                );

            const indiceDestino =
                columnasActuales.findIndex(
                    columna => columna.campo === over.id
                );

            if (indiceOrigen === -1 || indiceDestino === -1) {
                return columnasActuales;
            }

            return arrayMove(
                columnasActuales,
                indiceOrigen,
                indiceDestino
            );

        });

    }

    function manejarArrastreSobreColumnas(event) {

        const {active,over} = event;

        if (!over || active.id === over.id) {
            setColumnaDestino(null);
            return;
        }

        setColumnaDestino(over.id);

    }

    function manejarCancelarArrastreColumnas() {

        setColumnaDestino(null);

    }

    // Resize manual de columnas sobre la copia visual interna.
    function iniciarResizeColumna(columna,e) {

        const xInicial = e.clientX;
        const anchoInicial = columna.ancho;

        function manejarMovimiento(event) {

            const nuevoAncho =
                Math.max(
                    ANCHO_MINIMO_COLUMNA,
                    anchoInicial + event.clientX - xInicial
                );

            setColumnasOrdenadas(columnasActuales =>
                columnasActuales.map(columnaActual =>
                    columnaActual.campo === columna.campo
                        ? {
                            ...columnaActual,
                            ancho:nuevoAncho
                        }
                        : columnaActual
                )
            );

        }

        function terminarResize() {

            window.removeEventListener(
                "pointermove",
                manejarMovimiento
            );

            window.removeEventListener(
                "pointerup",
                terminarResize
            );

        }

        window.addEventListener(
            "pointermove",
            manejarMovimiento
        );

        window.addEventListener(
            "pointerup",
            terminarResize
        );

    }

    function alternarAnchoColumna(columna) {

        const columnaDefault =
            columnasVisibles.find(
                columnaVisible =>
                    columnaVisible.campo === columna.campo
            );

        if (!columnaDefault) {
            return;
        }

        const estaEnDefault =
            Math.abs(columna.ancho - columnaDefault.ancho) <= 1;

        const nuevoAncho =
            estaEnDefault
                ? ANCHO_MINIMO_COLUMNA
                : columnaDefault.ancho;

        setColumnasOrdenadas(columnasActuales =>
            columnasActuales.map(columnaActual =>
                columnaActual.campo === columna.campo
                    ? {
                        ...columnaActual,
                        ancho:nuevoAncho
                    }
                    : columnaActual
            )
        );

    }

    const columnasParaMostrar =
        columnasOrdenadas.filter(
            columna => columna.visible !== false
        );

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

    // Shift + click selecciona rangos sobre el orden visible actual.
    function cambiarCheckFila(keyFila,e) {

        if (e.shiftKey && keyAnclaSeleccion) {

            const indiceAncla =
                todasLasKeys.findIndex(
                    key => key === keyAnclaSeleccion
                );

            const indiceFila =
                todasLasKeys.findIndex(
                    key => key === keyFila
                );

            if (indiceAncla !== -1 && indiceFila !== -1) {

                const inicio =
                    Math.min(indiceAncla,indiceFila);

                const fin =
                    Math.max(indiceAncla,indiceFila);

                const keysRango =
                    todasLasKeys.slice(inicio,fin + 1);

                setKeysSeleccionadas(function(keysAnteriores) {

                    return Array.from(
                        new Set([
                            ...keysAnteriores,
                            ...keysRango
                        ])
                    );

                });

                return;

            }

        }

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

        setKeyAnclaSeleccion(keyFila);
    }

    //CALCULO DE TOTALES
    function calcularTotales() {

        const filasASumar =

            keysSeleccionadas.length === 0

            ? dataFiltrada
            : dataFiltrada.filter(fila => {

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
        dataFiltrada,
        keysSeleccionadas,
        columnasOrdenadas
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

useEffect(() =>
{
    setMostrarMenuFila(false);
    setKeysSeleccionadas([]);
    setKeyAnclaSeleccion(null);
    setFilaSeleccionada(null);
},
[dataGrid,textoBusqueda]);


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
    const cantidadRegistrosFiltrados = dataFiltrada.length;
    const cantidadSeleccionados = keysSeleccionadas.length;

    const cantidadMostrada =
        cantidadSeleccionados > 0
        ? cantidadSeleccionados
        : cantidadRegistrosFiltrados;

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

    <div
        className="grilla"
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

        {!cargando && dataOrdenada.length === 0 && (
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
                                <HeaderColumnaOrdenable
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
                                </HeaderColumnaOrdenable>
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
                                        onChange={() => {}}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            cambiarCheckFila(keyFila,e);
                                        }}
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

                            <td style={estiloEspacioFinal}></td>

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
                    width: anchoTotalGrilla() + ANCHO_ESPACIO_FINAL + ANCHO_SCROLL_VERTICAL + "px"
                }}
            ></div>
        </div>

        <div className="grillaTotalesContenedor">

            <div className="grillaTotales" ref={refGrillaTotales}>

                <table>
                    <tbody>
                        <tr>
                            {mostrarCheck && (
                                <td
                                    style={{
                                        width: ANCHO_COLUMNA_CHECK + "px",
                                        minWidth: ANCHO_COLUMNA_CHECK + "px",
                                        maxWidth: ANCHO_COLUMNA_CHECK + "px"
                                    }}
                                ></td>
                            )}

                            {
                                columnasParaMostrar.map(columna => {

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
                                                    ? (
                                                        <span className="contenidoCelda">
                                                            {formatearValor(
                                                                total?.total,
                                                                columna.formato,
                                                                columna.mascara
                                                            )}
                                                        </span>
                                                    )
                                                    : ""
                                            }
                                        </td>
                                    );
                                })
                            }

                            <td style={estiloEspacioFinal}></td>
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
