import { obtenerCambiosFila } from "./gridEditorCampos";
import "./grid.css";
import { useState,useRef,useEffect,useMemo,useCallback,useImperativeHandle} from "react";
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
import { ACCIONES_MENU_FILA_DEFAULT } from "./gridMenuAcciones";
import GridFila from "./GridFila";
import {useGridVirtualizacion} from "./useGridVirtualizacion";
import {
    obtenerClaseFilaGrid,
    obtenerClaseFilaMenu,
    obtenerEstiloColumna
} from "./gridEstilos";
import { aplicarDependenciasColumnasCalculadas } from "./gridValores.js";
import { separarFilasAlFinal } from "./gridFilasAlFinal.js";
import {
    calcularScrollFilaVisible,
    calcularScrollIndiceFila
} from "./gridVisibilidadFila.js";

const FILAS_AL_FINAL_VACIAS = [];

function Grid({
    columnasVisibles,
    dataGrid,
    mostrarCheck,
    cargando,
    mostrarSinDatos = true,
    cargandoPaginas = false,
    totalRegistrosRemotos = null,
    registrosCargados = null,
    enfoqueVersion = null,
    tamanoFuente = 13,
    layoutColumnas = null,
    layoutVersion = 0,
    onLayoutChange,
    textoBusqueda = "",
    editable = false,
    accionesMenuFila = ACCIONES_MENU_FILA_DEFAULT,
    onEditarRegistro,
    onVerRegistro,
    onCellChange,
    onRowChange,
    onEdicionChange,
    onOrdenChange,
    onDeleteRow,
    celdasModificadas = null,
    ajustarColumnasAlAncho = false,
    altoFila = 30,
    demoraIndicadorCargaMs = 0,
    formatoCantidadRegistros = "cargados-total",
    ajustarAlturaAContenido = false,
    alturaMinima = 0,
    contextoCalculos = null,
    filasAlFinal = FILAS_AL_FINAL_VACIAS,
    controlNavegacionRef = null,
    onNavegacionChange
}) {

     const ANCHO_COLUMNA_CHECK = 26;
     const ANCHO_MINIMO_COLUMNA = 12;
     const ANCHO_SCROLL_VERTICAL = 8;
     const ANCHO_ESPACIO_FINAL = ajustarColumnasAlAncho ? 0 : 40;
     const estiloEspacioFinal = useMemo(() => ({
        width: ANCHO_ESPACIO_FINAL + "px",
        minWidth: ANCHO_ESPACIO_FINAL + "px",
        maxWidth: ANCHO_ESPACIO_FINAL + "px"
     }), [ANCHO_ESPACIO_FINAL]);

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
    const animacionUbicacionFila = useRef(null);

    //variables de estado para adminsitrar la visualización del menu flotante
    const [filaSeleccionada,setFilaSeleccionada] = useState(null);
    const [mostrarMenuFila,setMostrarMenuFila] = useState(false);
    const [topMenuFila,setTopMenuFila] = useState(0);
    const [filaEditandoKey,setFilaEditandoKey] = useState(null);
    const [filaEditandoOriginal,setFilaEditandoOriginal] = useState(null);
    const [filaEditandoDraft,setFilaEditandoDraft] = useState(null);
    const [campoFocoEdicion,setCampoFocoEdicion] = useState(null);
    const [mostrarIndicadorCarga,setMostrarIndicadorCarga] = useState(false);

    const ocultarMenuFila = useCallback(function ocultarMenuFila() {
        setMostrarMenuFila(false);
    }, []);

    useEffect(() => {
        const demora = cargando
            ? Math.max(0, Number(demoraIndicadorCargaMs) || 0)
            : 0;
        const temporizador = window.setTimeout(
            () => setMostrarIndicadorCarga(Boolean(cargando)),
            demora
        );

        return () => window.clearTimeout(temporizador);
    }, [cargando,demoraIndicadorCargaMs]);

    const cerrarMenuFila = useCallback(function cerrarMenuFila() {

        ocultarMenuFila();
        setFilaSeleccionada(null);

    }, [ocultarMenuFila]);

    //inicializa coleccion de columnas ordenadas por default
    const [ordenamiento,setOrdenamiento] =
    useState(
        obtenerOrdenamientoDefault(
            columnasVisibles
        )
    );

    // Reparto proporcional opcional; las demás grillas mantienen sus anchos.
    const [anchoDisponible, setAnchoDisponible] = useState(0);
    useEffect(() => {
        if (!ajustarColumnasAlAncho || !refGrillaDatos.current) return;
        const elemento = refGrillaDatos.current;
        const medir = () => setAnchoDisponible(elemento.clientWidth);
        medir();
        const observador = new ResizeObserver(medir);
        observador.observe(elemento);
        return () => observador.disconnect();
    }, [ajustarColumnasAlAncho]);
    const layoutProporcional = useMemo(() => {
        if (!ajustarColumnasAlAncho || !anchoDisponible) return layoutColumnas;
        const visibles = columnasVisibles.filter(columna => columna.visible !== false);
        const total = visibles.reduce((suma, columna) => suma + (columna.proporcion ?? 1), 0);
        const disponible = Math.max(0, anchoDisponible - (mostrarCheck ? ANCHO_COLUMNA_CHECK : 0));
        let acumulado = 0;
        return visibles.map((columna, indice) => {
            const ancho = indice === visibles.length - 1
                ? disponible - acumulado
                : Math.floor(disponible * (columna.proporcion ?? 1) / total);
            acumulado += ancho;
            return { campo: columna.campo, ancho };
        });
    }, [ajustarColumnasAlAncho, anchoDisponible, columnasVisibles, layoutColumnas, mostrarCheck]);

    const {
        setColumnasOrdenadas,
        columnasParaMostrar
    } = useGridColumnas({
        columnasVisibles,
        layoutColumnas: layoutProporcional,
        layoutVersion: ajustarColumnasAlAncho ? `${layoutVersion}:${anchoDisponible}` : layoutVersion,
        onLayoutChange
    });

    //logica para adminsitar la seleccion de la fila y visualizacion del menu flotante
    function seleccionarFila(fila,elementoFila)
    {
        if (!elementoFila) {
            return;
        }

        const rectFila =
            elementoFila.getBoundingClientRect();

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

    useEffect(() => {
        onEdicionChange?.(filaEditandoKey == null ? null : {
            keyFila:filaEditandoKey, original:filaEditandoOriginal, borrador:filaEditandoDraft
        });
    }, [filaEditandoKey, filaEditandoOriginal, filaEditandoDraft, onEdicionChange]);

    useEffect(() => { onOrdenChange?.(ordenamiento); }, [ordenamiento, onOrdenChange]);

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

            cerrarMenuFila();

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

    const columnasParaKey = useMemo(() =>
        columnasVisibles.filter(
            columna => columna.key === true
        ),
        [columnasVisibles]
    );

    const armarKeyFila = useCallback(function armarKeyFila(fila) {
        return columnasParaKey
            .map(columna => fila?.[columna.campo])
            .join("|");
    }, [columnasParaKey]);

    const { base:dataBase, alFinal:dataAlFinal } = useMemo(() =>
        separarFilasAlFinal(dataGrid, filasAlFinal, armarKeyFila),
        [dataGrid,filasAlFinal,armarKeyFila]
    );

    const dataBaseFiltrada = useMemo(() => {

        return filtrarDatosPorTexto(
            dataBase,
            columnasParaMostrar,
            textoBusqueda,
            contextoCalculos
        );

    }, [
        dataBase,
        columnasParaMostrar,
        textoBusqueda,
        contextoCalculos
    ]);

    const dataFiltrada = useMemo(() => [
        ...dataBaseFiltrada,
        ...dataAlFinal
    ], [dataBaseFiltrada,dataAlFinal]);

    const dataOrdenada = useMemo(() => {

        return [
            ...ordenarDatos(
                dataBaseFiltrada,
                ordenamiento,
                columnasVisibles,
                contextoCalculos
            ),
            ...dataAlFinal
        ];

    }, [
        dataBaseFiltrada,
        dataAlFinal,
        ordenamiento,
        columnasVisibles,
        contextoCalculos
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
            armarKeyFila,
            contextoCalculos
        }),
        [
            columnasParaMostrar,
            dataFiltrada,
            keysSeleccionadas,
            keysSeleccionadasSet,
            armarKeyFila,
            contextoCalculos
        ]
    );

useEffect(() =>
{
    setMostrarMenuFila(false);
    limpiarSeleccion();
    setFilaSeleccionada(null);
    setFilaEditandoKey(null);
    setFilaEditandoOriginal(null);
    setFilaEditandoDraft(null);
    setCampoFocoEdicion(null);
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
    const cantidadRegistrosCargados =
        cargandoPaginas && registrosCargados != null
            ? registrosCargados
            : cantidadTotalRegistros;
    const cantidadRegistrosFiltrados = dataFiltrada.length;
    const cantidadSeleccionados = keysSeleccionadas.length;

    const cantidadTotalDisponible =
        totalRegistrosRemotos == null
            ? cantidadTotalRegistros
            : totalRegistrosRemotos;

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

    if (formatoCantidadRegistros === "cantidad") {
        segmentosCantidad.push(
            cantidadTotalRegistros +
            (cantidadTotalRegistros === 1 ? " registro" : " registros")
        );
    } else {
        segmentosCantidad.push(
            cantidadRegistrosCargados +
            " de " +
            cantidadTotalDisponible +
            " registros"
        );
    }

    const textoCantidadRegistros =
        segmentosCantidad.join(" / ");

    const claseFila = useCallback(function claseFila(indiceFila, keyFila) {

        const claseBase = obtenerClaseFilaGrid({
            indiceFila,
            keyFila,
            keysSeleccionadasSet
        });

        return keyFila === filaEditandoKey
            ? `${claseBase} filaEditando`
            : claseBase;
    }, [keysSeleccionadasSet,filaEditandoKey]);

    function iniciarEdicionFila(fila,keyFila,campoFoco = null) {

        if (!editable) {
            return;
        }

        setFilaEditandoKey(keyFila);
        setFilaEditandoOriginal({...fila});
        setFilaEditandoDraft({...fila});
        setCampoFocoEdicion(campoFoco);
        cerrarMenuFila();

    }

    function cambiarDraftFila(campo,valorNuevo) {

        setFilaEditandoDraft(draftActual =>
            aplicarDependenciasColumnasCalculadas({
                filaOriginal:filaEditandoOriginal,
                filaDraft:{ ...draftActual, [campo]:valorNuevo },
                columnas:columnasVisibles
            })
        );

    }

    function cambiarDraftCampos(cambios) {
        setFilaEditandoDraft(actual =>
            aplicarDependenciasColumnasCalculadas({
                filaOriginal:filaEditandoOriginal,
                filaDraft:{ ...actual, ...cambios },
                columnas:columnasVisibles
            })
        );
    }

    const confirmarEdicionFila = useCallback(function confirmarEdicionFila() {

        if (filaEditandoKey == null || !filaEditandoOriginal || !filaEditandoDraft) {
            return false;
        }

        const cambios = obtenerCambiosFila(filaEditandoOriginal, filaEditandoDraft, columnasVisibles);

        if (cambios.length > 0) {
            onRowChange?.({
                keyFila:filaEditandoKey,
                filaOriginal:filaEditandoOriginal,
                filaNueva:filaEditandoDraft,
                cambios
            });

            cambios.forEach(cambio => {
                onCellChange?.({
                    fila:filaEditandoOriginal,
                    keyFila:filaEditandoKey,
                    campo:cambio.campo,
                    valorAnterior:cambio.valorAnterior,
                    valorNuevo:cambio.valorNuevo,
                    columna:cambio.columna
                });
            });
        }

        setFilaEditandoKey(null);
        setFilaEditandoOriginal(null);
        setFilaEditandoDraft(null);
        setCampoFocoEdicion(null);

        return true;

    }, [
        filaEditandoKey,
        filaEditandoOriginal,
        filaEditandoDraft,
        columnasVisibles,
        onRowChange,
        onCellChange,
        setFilaEditandoKey,
        setFilaEditandoOriginal,
        setFilaEditandoDraft,
        setCampoFocoEdicion
    ]);

    function cancelarEdicionFila() {

        setFilaEditandoKey(null);
        setFilaEditandoOriginal(null);
        setFilaEditandoDraft(null);
        setCampoFocoEdicion(null);

    }

    function manejarClickSimpleFila(fila,keyFila,elementoFila) {

        if (filaEditandoKey === keyFila) {
            return;
        }

        if (filaEditandoKey) {
            confirmarEdicionFila();
        }

        seleccionarFila(fila,elementoFila);

    }

    function manejarDobleClickFila(fila,keyFila,campo) {

        if (!editable || filaEditandoKey === keyFila) {
            return;
        }

        iniciarEdicionFila(fila,keyFila,campo);

    }

    function eliminarFilaSeleccionada() {

        if (!filaSeleccionada) {
            return;
        }

        onDeleteRow?.({
            fila:filaSeleccionada,
            keyFila:armarKeyFila(filaSeleccionada)
        });

        cerrarMenuFila();

    }

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
        anchoScrollVertical:ajustarAlturaAContenido ? 0 : ANCHO_SCROLL_VERTICAL,
        onOcultarMenuFila:ocultarMenuFila
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
        sincronizarDesdeGrillaDatos,
        onOcultarMenuFila:ocultarMenuFila,
        onConfirmarEdicionActiva:confirmarEdicionFila
    });

    const {
        filasVirtuales,
        altoTotal,
        altoFilaMedido,
        offsetY,
        altoInferior,
        actualizarScrollTop
    } = useGridVirtualizacion({
        filas:dataOrdenada,
        refContenedor:refGrillaDatos,
        altoFilaEstimado:altoFila
    });

    const asegurarFilaVisible = useCallback(function asegurarFilaVisible(keyFila) {
        if (animacionUbicacionFila.current != null) {
            window.cancelAnimationFrame(animacionUbicacionFila.current);
        }

        animacionUbicacionFila.current = window.requestAnimationFrame(() => {
            animacionUbicacionFila.current = window.requestAnimationFrame(() => {
                animacionUbicacionFila.current = null;
                const contenedor = refGrillaDatos.current;
                if (!contenedor) return;

                const fila = [...contenedor.querySelectorAll("tbody tr[data-key]")]
                    .find(elemento => elemento.dataset.key === keyFila);
                if (!fila) return;

                const rectContenedor = contenedor.getBoundingClientRect();
                const rectFila = fila.getBoundingClientRect();
                const limiteSuperior = rectContenedor.top + contenedor.clientTop;
                const limiteInferior = limiteSuperior + contenedor.clientHeight;
                const siguienteScroll = calcularScrollFilaVisible({
                    scrollTop:contenedor.scrollTop,
                    scrollMaximo:Math.max(0, contenedor.scrollHeight - contenedor.clientHeight),
                    filaSuperior:rectFila.top,
                    filaInferior:rectFila.bottom,
                    limiteSuperior,
                    limiteInferior
                });

                if (siguienteScroll === contenedor.scrollTop) return;
                contenedor.scrollTop = siguienteScroll;
                if (refScrollVertical.current) {
                    refScrollVertical.current.scrollTop = siguienteScroll;
                }
                actualizarScrollTop(siguienteScroll);
            });
        });
    }, [actualizarScrollTop]);

    useEffect(() => () => {
        if (animacionUbicacionFila.current != null) {
            window.cancelAnimationFrame(animacionUbicacionFila.current);
        }
    }, []);

    const obtenerEstadoNavegacion = useCallback(function obtenerEstadoNavegacion() {
        const keySeleccionada = filaSeleccionada
            ? armarKeyFila(filaSeleccionada)
            : null;
        const indice = keySeleccionada == null
            ? -1
            : dataOrdenada.findIndex(
                fila => armarKeyFila(fila) === keySeleccionada
            );
        const fila = indice >= 0 ? dataOrdenada[indice] : null;

        return {
            fila,
            indice,
            cantidad:dataOrdenada.length,
            puedeAnterior:indice > 0,
            puedeSiguiente:indice >= 0 && indice < dataOrdenada.length - 1
        };
    }, [filaSeleccionada,armarKeyFila,dataOrdenada]);

    const ubicarFilaNavegada = useCallback(function ubicarFilaNavegada(indice) {
        if (indice < 0 || indice >= dataOrdenada.length) {
            return obtenerEstadoNavegacion();
        }

        const fila = dataOrdenada[indice];
        const contenedor = refGrillaDatos.current;
        const scrollActual = contenedor?.scrollTop ?? 0;
        const altoViewport = contenedor?.clientHeight ?? 0;
        const scrollVertical = refScrollVertical.current;
        const scrollMaximo = scrollVertical
            ? Math.max(0, scrollVertical.scrollHeight - scrollVertical.clientHeight)
            : Math.max(0, altoTotal - altoViewport);
        const siguienteScroll = calcularScrollIndiceFila({
            indice,
            cantidadFilas:dataOrdenada.length,
            altoFila:altoFilaMedido,
            altoViewport,
            scrollActual,
            scrollMaximo
        });

        setMostrarMenuFila(false);
        setFilaSeleccionada(fila);

        if (contenedor) {
            contenedor.scrollTop = siguienteScroll;
        }
        if (refScrollVertical.current) {
            refScrollVertical.current.scrollTop = siguienteScroll;
        }
        actualizarScrollTop(siguienteScroll);
        asegurarFilaVisible(armarKeyFila(fila));

        return {
            fila,
            indice,
            cantidad:dataOrdenada.length,
            puedeAnterior:indice > 0,
            puedeSiguiente:indice < dataOrdenada.length - 1
        };
    }, [
        dataOrdenada,
        altoFilaMedido,
        altoTotal,
        actualizarScrollTop,
        obtenerEstadoNavegacion,
        asegurarFilaVisible,
        armarKeyFila
    ]);

    const navegarRegistro = useCallback(function navegarRegistro(destino) {
        if (dataOrdenada.length === 0) {
            return obtenerEstadoNavegacion();
        }

        const actual = obtenerEstadoNavegacion();
        let indiceDestino = actual.indice;

        if (destino === "primero") {
            indiceDestino = 0;
        } else if (destino === "ultimo") {
            indiceDestino = dataOrdenada.length - 1;
        } else if (destino === "anterior") {
            indiceDestino = actual.indice < 0 ? 0 : Math.max(0, actual.indice - 1);
        } else if (destino === "siguiente") {
            indiceDestino = actual.indice < 0
                ? 0
                : Math.min(dataOrdenada.length - 1, actual.indice + 1);
        } else {
            return actual;
        }

        return ubicarFilaNavegada(indiceDestino);
    }, [dataOrdenada,obtenerEstadoNavegacion,ubicarFilaNavegada]);

    const ubicarFila = useCallback(function ubicarFila(filaSolicitada) {
        if (!filaSolicitada) {
            return obtenerEstadoNavegacion();
        }

        const keySolicitada = armarKeyFila(filaSolicitada);
        const indice = dataOrdenada.findIndex(
            fila => armarKeyFila(fila) === keySolicitada
        );

        return indice >= 0
            ? ubicarFilaNavegada(indice)
            : obtenerEstadoNavegacion();
    }, [armarKeyFila,dataOrdenada,obtenerEstadoNavegacion,ubicarFilaNavegada]);

    const editarFila = useCallback(function editarFila(filaSolicitada) {
        if (!editable || !filaSolicitada) {
            return false;
        }

        const keySolicitada = armarKeyFila(filaSolicitada);
        const indice = dataOrdenada.findIndex(
            fila => armarKeyFila(fila) === keySolicitada
        );

        if (indice < 0) {
            return false;
        }

        const fila = dataOrdenada[indice];
        ubicarFilaNavegada(indice);
        setFilaEditandoKey(keySolicitada);
        setFilaEditandoOriginal({ ...fila });
        setFilaEditandoDraft({ ...fila });
        setCampoFocoEdicion(null);
        cerrarMenuFila();
        return true;
    }, [
        editable,
        armarKeyFila,
        dataOrdenada,
        ubicarFilaNavegada,
        cerrarMenuFila,
        setFilaEditandoKey,
        setFilaEditandoOriginal,
        setFilaEditandoDraft,
        setCampoFocoEdicion
    ]);

    useImperativeHandle(controlNavegacionRef, () => ({
        obtenerEstado:obtenerEstadoNavegacion,
        navegar:navegarRegistro,
        ubicarFila,
        editarFila,
        confirmarEdicion:confirmarEdicionFila
    }), [
        obtenerEstadoNavegacion,
        navegarRegistro,
        ubicarFila,
        editarFila,
        confirmarEdicionFila
    ]);

    useEffect(() => {
        onNavegacionChange?.(obtenerEstadoNavegacion());
    }, [obtenerEstadoNavegacion,onNavegacionChange]);

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

    const alturaContenido = ajustarAlturaAContenido
        ? Math.max(
            Math.max(0, Number(alturaMinima) || 0),
            (dataOrdenada.length + 2) * altoFila + 8
        )
        : null;

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
        className={`grilla ${ajustarAlturaAContenido ? "grillaAlturaContenido" : ""}`}
        ref={refGrilla}
        tabIndex={0}
        onKeyDown={manejarTeclaScroll}
        style={{
            "--grid-font-size": tamanoFuente + "px",
            "--grid-total-font-size": (tamanoFuente + 1) + "px",
            "--grid-row-height": altoFila + "px",
            height: alturaContenido == null ? undefined : alturaContenido + "px"
        }}
    >
        {mostrarIndicadorCarga && (
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
                                <th
                                    className="grillaCheckCelda"
                                    style={{
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
                                contextoCalculos={contextoCalculos}
                                checked={checked}
                                cambiarCheckFila={cambiarCheckFila}
                                refPrimeraCeldaDatos={refPrimeraCeldaDatos}
                                estiloColumna={estiloColumna}
                                estiloEspacioFinal={estiloEspacioFinal}
                                editable={editable}
                                onCellChange={onCellChange}
                                celdasModificadas={celdasModificadas}
                                filaEditando={filaEditandoKey === keyFila}
                                filaDraft={
                                    filaEditandoKey === keyFila
                                        ? filaEditandoDraft
                                        : null
                                }
                                campoFocoEdicion={
                                    filaEditandoKey === keyFila
                                        ? campoFocoEdicion
                                        : null
                                }
                                onDraftChange={cambiarDraftFila}
                                onDraftPatch={cambiarDraftCampos}
                                onConfirmarEdicionFila={confirmarEdicionFila}
                                onCancelarEdicionFila={cancelarEdicionFila}
                                onClickSimpleFila={manejarClickSimpleFila}
                                onDobleClickFila={manejarDobleClickFila}
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
                mostrarMenuFila={mostrarMenuFila && !filaEditandoKey}
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
                scrollLeft={refGrillaDatos.current?.scrollLeft ?? 0}
                anchoContenido={anchoContenidoScrollHorizontal}
                anchoContenedor={refGrillaDatos.current?.clientWidth ?? 0}
                acciones={accionesMenuFila}
                onEditarFila={() => {
                    if (!filaSeleccionada) {
                        return;
                    }

                    if (onEditarRegistro) {
                        setMostrarMenuFila(false);
                        onEditarRegistro(filaSeleccionada);
                        return;
                    }
                    iniciarEdicionFila(
                        filaSeleccionada,
                        armarKeyFila(filaSeleccionada)
                    );
                }}
                onVerFila={() => {
                    if (!filaSeleccionada || !onVerRegistro) return;
                    setMostrarMenuFila(false);
                    onVerRegistro(filaSeleccionada);
                }}
                onEliminarFila={eliminarFilaSeleccionada}
            />


            {!ajustarAlturaAContenido && (
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
            )}

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
