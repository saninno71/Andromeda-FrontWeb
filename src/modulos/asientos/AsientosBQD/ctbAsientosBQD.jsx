import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ABMAsientos from "../AsientosABM/ABMAsientos.jsx";
import { MODO_ABM } from "../../../components/ABM/modosABM.js";
import { crearColumnasAsientosBQD } from "./asientosBQD.columnas.js";
import { COLUMNAS_RENGLONES_ASIENTO } from "../AsientosABM/abmAsientos.columnas.js";
import "./ctbAsientosBQD.css";

import { useAsientos } from "./useAsientos.js";
import { obtenerDestinoDespuesDeEliminar } from "./asientos.funcional.js";
//componente grilla
import Grid from "../../../components/grid/Grid";

import { useGridPreferencias } from "../../../components/grid/useGridPreferencias";
import ModalInfo from "../../../components/ModalInfo/ModalInfo";
import ModalConfirmacion from "../../../components/ModalConfirmacion/ModalConfirmacion";
import { eliminarAsientoPorId } from "../AsientosABM/abmAsientosService.js";
import { cargarFilaAsientoPorId } from "./asientosService.js";
import { prepararParametrosInformeAsientos } from "./asientos.informes.js";
import {
    abrirVentanaVistaPreviaBQD,
    descargarArchivoBQD,
    mostrarArchivoEnVistaPreviaBQD
} from "../../../components/InformesBQD/vistaPreviaBQD.js";
import ConfiguracionInformeModal from "../../../components/InformesBQD/ConfiguracionInformeModal.jsx";
import { VERSION_APLICACION } from "../../../config/versionAplicacion.js";
//componente filtros
import FiltroAsientos from "./FiltroAsientos";

const GRID_STORAGE_KEY = "andromeda:grid:asientos:views";

function CtbAsientosBQD({
    ejecutarConsultaInicial = false,
    menuLabel = "",
    submenuLabel = ""
})

{

    const tituloInforme = [menuLabel, submenuLabel].filter(Boolean).join(" - ") || "Informe";
    const columnasVisibles = useMemo(() => crearColumnasAsientosBQD(), []);

    const { modelo, estado, filas:datosEditables, celdasModificadas } = useAsientos({ ejecutarConsultaInicial });
    const [asientoAbierto, setAsientoAbierto] = useState(null);
    const [filaAEliminar, setFilaAEliminar] = useState(null);
    const [eliminandoDesdeConsulta, setEliminandoDesdeConsulta] = useState(false);
    const [errorEliminacion, setErrorEliminacion] = useState("");
    const [imprimiendo, setImprimiendo] = useState(false);
    const [configuracionImpresion, setConfiguracionImpresion] = useState(null);
    const [errorImpresion, setErrorImpresion] = useState("");
    const controlNavegacionGrid = useRef(null);
    const filaPendienteEnfoque = useRef(null);
    const [navegacionABM,setNavegacionABM] = useState({
        fila:null,
        indice:-1,
        cantidad:0,
        puedeAnterior:false,
        puedeSiguiente:false
    });
    const cargaAsientos = estado.consulta;
    const mostrarCheck = true;
    const busquedaGrid = estado.vista.busqueda;
    const gridPreferencias = useGridPreferencias({ storageKey:GRID_STORAGE_KEY });

    useEffect(() => {
        const fila = filaPendienteEnfoque.current;
        if (!fila) return;

        const existe = datosEditables.some(item =>
            Number(item.comprobanteID) === Number(fila.comprobanteID) &&
            String(item.monedaCodigo ?? "") === String(fila.monedaCodigo ?? "")
        );
        if (!existe) return;

        filaPendienteEnfoque.current = null;
        const animacion = window.requestAnimationFrame(() => {
            controlNavegacionGrid.current?.ubicarFila(fila);
        });
        return () => window.cancelAnimationFrame(animacion);
    }, [datosEditables]);

    const actualizarNavegacionABM = useCallback(estadoNavegacion => {
        setNavegacionABM(estadoActual => {
            const mismaFila =
                estadoActual.fila?.comprobanteID === estadoNavegacion.fila?.comprobanteID;
            const mismoEstado =
                mismaFila &&
                estadoActual.indice === estadoNavegacion.indice &&
                estadoActual.cantidad === estadoNavegacion.cantidad &&
                estadoActual.puedeAnterior === estadoNavegacion.puedeAnterior &&
                estadoActual.puedeSiguiente === estadoNavegacion.puedeSiguiente;

            return mismoEstado
                ? estadoActual
                : estadoNavegacion;
        });
    }, []);

    function abrirAsiento(fila, modo) {
        setNavegacionABM(
            controlNavegacionGrid.current?.obtenerEstado() ?? navegacionABM
        );
        setAsientoAbierto({
            comprobanteID: fila.comprobanteID,
            modo,
            instancia: Date.now()
        });
    }

    function abrirNuevoAsiento() {
        setNavegacionABM({
            fila:null,
            indice:-1,
            cantidad:0,
            puedeAnterior:false,
            puedeSiguiente:false
        });
        setAsientoAbierto({
            comprobanteID:null,
            modo:MODO_ABM.ALTA,
            instancia:Date.now()
        });
    }

    function navegarAsiento(destino) {
        const resultado = controlNavegacionGrid.current?.navegar(destino);
        if (!resultado?.fila) {
            return;
        }
        setNavegacionABM(resultado);
        setAsientoAbierto(actual => actual && ({
            ...actual,
            comprobanteID: resultado.fila.comprobanteID
        }));
    }

    async function actualizarDespuesDeGuardar(resultado = {}) {
        const comprobanteGuardadoID = Number(resultado.comprobanteID);
        const esAltaValida =
            resultado.esAlta &&
            Number.isInteger(comprobanteGuardadoID) &&
            comprobanteGuardadoID > 0;

        if (resultado.origen === "aplicar" && esAltaValida) {
            setAsientoAbierto(actual => actual && ({
                ...actual,
                comprobanteID: comprobanteGuardadoID,
                modo: MODO_ABM.EDICION
            }));
        }

        if (esAltaValida) {
            const filaNueva = await cargarFilaAsientoPorId(comprobanteGuardadoID);
            filaPendienteEnfoque.current = filaNueva;
            modelo.inyectarRegistro(filaNueva);
            return;
        }

        await modelo.consultar();
    }

    async function reposicionarDespuesDeEliminar() {
        const navegacionActual =
            controlNavegacionGrid.current?.obtenerEstado() ?? navegacionABM;
        const destino = obtenerDestinoDespuesDeEliminar(navegacionActual);
        const resultado = destino
            ? controlNavegacionGrid.current?.navegar(destino)
            : null;
        const filaDestino = resultado?.fila ?? null;

        await modelo.consultar();

        if (!filaDestino) {
            setAsientoAbierto(null);
            return false;
        }

        setNavegacionABM(resultado);
        setAsientoAbierto(actual => actual && ({
            ...actual,
            comprobanteID:filaDestino.comprobanteID,
            modo:MODO_ABM.CONSULTA
        }));
        return true;
    }

    function solicitarEliminacionDesdeConsulta(fila) {
        setErrorEliminacion("");
        setFilaAEliminar(fila);
    }

    async function confirmarEliminacionDesdeConsulta() {
        if (!filaAEliminar || eliminandoDesdeConsulta) return;

        setEliminandoDesdeConsulta(true);
        setErrorEliminacion("");

        try {
            await eliminarAsientoPorId(filaAEliminar.comprobanteID);

            const navegacionActual =
                controlNavegacionGrid.current?.obtenerEstado() ?? navegacionABM;
            const destino = obtenerDestinoDespuesDeEliminar(navegacionActual);
            const resultado = destino
                ? controlNavegacionGrid.current?.navegar(destino)
                : null;

            setFilaAEliminar(null);
            if (resultado) setNavegacionABM(resultado);
            await modelo.consultar();
        } catch (error) {
            setFilaAEliminar(null);
            setErrorEliminacion(
                error instanceof Error
                    ? error.message
                    : "No se pudo eliminar el asiento."
            );
        } finally {
            setEliminandoDesdeConsulta(false);
        }
    }

    function solicitarImpresion() {
        if (imprimiendo || configuracionImpresion) return;
        setErrorImpresion("");
        const columnasImprimibles = columnasVisibles.filter(
            (columna) => columna.visible !== false
        );
        const camposImprimibles = new Set(
            columnasImprimibles.map((columna) => columna.campo)
        );
        const layoutCabecera = gridPreferencias.layoutActualGrid.filter(
            (columna) => camposImprimibles.has(columna.campo)
        );
        const columnasDetalle = COLUMNAS_RENGLONES_ASIENTO.filter(
            (columna) => columna.visible !== false
        );
        setConfiguracionImpresion({
            destino:"vistaPrevia",
            nombreFormato:"Diseño actual de la grilla",
            nombreEstilo:"Predeterminado",
            columnas:columnasImprimibles,
            layoutColumnas:layoutCabecera,
            grillas:[{
                grillaID:"principal",
                nombre:"Principal",
                incluida:true,
                secciones:[
                    {
                        seccionID:"cabecera",
                        nombre:"Cabecera",
                        tipo:"cabecera",
                        obligatoria:true,
                        incluida:true,
                        imprimirTitulos:true,
                        imprimirTotales:true,
                        columnas:columnasImprimibles,
                        layoutColumnas:layoutCabecera
                    },
                    {
                        seccionID:"detalle",
                        nombre:"Detalle del asiento",
                        tipo:"hija",
                        incluida:true,
                        imprimirTitulos:true,
                        imprimirTotales:true,
                        columnas:columnasDetalle,
                        layoutColumnas:columnasDetalle.map((columna) => ({
                            campo:columna.campo,
                            ancho:columna.ancho
                        }))
                    }
                ]
            }]
        });
    }

    async function imprimirConsulta(configuracion) {
        if (imprimiendo) return;

        let ventanaVistaPrevia = null;
        setImprimiendo(true);
        setErrorImpresion("");

        try {
            const destino = configuracion.destino || "vistaPrevia";
            if (destino === "vistaPrevia") {
                ventanaVistaPrevia = abrirVentanaVistaPreviaBQD();
            }
            const grillaPrincipal = configuracion.grillas?.[0];
            const cabecera = grillaPrincipal?.secciones?.find(
                (seccion) => seccion.tipo === "cabecera"
            );
            const detalle = grillaPrincipal?.secciones?.find(
                (seccion) => seccion.seccionID === "detalle"
            );
            const cargaGenerador = destino === "excel"
                ? import("../../../components/InformesBQD/generarInformeExcelBQD.js")
                : import("../../../components/InformesBQD/generarInformeBQD.js");
            const [parametrosInforme, generador] = await Promise.all([
                prepararParametrosInformeAsientos(modelo, {
                    titulo:tituloInforme,
                    layoutColumnas:cabecera?.layoutColumnas || configuracion.layoutColumnas,
                    interlineado:configuracion.interlineado,
                    versionAplicacion:VERSION_APLICACION,
                    incluirGrilla:grillaPrincipal?.incluida !== false,
                    incluirDetalle:grillaPrincipal?.incluida !== false
                        && detalle?.incluida !== false,
                    configuracionDetalle:detalle
                }),
                cargaGenerador
            ]);

            const archivo = destino === "excel"
                ? await generador.generarArchivoExcelBQD(parametrosInforme)
                : await generador.generarArchivoInformeBQD(parametrosInforme);
            if (destino === "pdf" || destino === "excel") {
                descargarArchivoBQD(archivo, configuracion.nombreArchivo);
            } else {
                mostrarArchivoEnVistaPreviaBQD(ventanaVistaPrevia, archivo);
            }
        } catch (error) {
            if (ventanaVistaPrevia && !ventanaVistaPrevia.closed) {
                ventanaVistaPrevia.close();
            }
            setErrorImpresion(
                error instanceof Error
                    ? error.message
                    : "No se pudo generar el informe."
            );
        } finally {
            setImprimiendo(false);
        }
    }

  return (

    <div className="asientosContent">
        <div className="contenedorFiltros">
            <FiltroAsientos
                modelo={modelo}
                filtros={estado.filtros}
                gridPreferencias={gridPreferencias}
                busquedaGrid={busquedaGrid}
                onBusquedaGridChange={modelo.actualizarBusqueda}
                onNuevo={abrirNuevoAsiento}
                onImprimir={solicitarImpresion}
                imprimiendo={imprimiendo}
            />
        </div>


        <div className="contenedorGrilla">
            
            <Grid   columnasVisibles={columnasVisibles}
                    dataGrid={datosEditables}
                    filasAlFinal={cargaAsientos.filasAlFinal}
                    onEditarRegistro={fila => abrirAsiento(fila, MODO_ABM.EDICION)}
                    onVerRegistro={fila => abrirAsiento(fila, MODO_ABM.CONSULTA)}
                    onDeleteRow={({ fila }) => solicitarEliminacionDesdeConsulta(fila)}
                    controlNavegacionRef={controlNavegacionGrid}
                    onNavegacionChange={actualizarNavegacionABM}
                    onOrdenChange={modelo.actualizarOrden}
                    celdasModificadas={celdasModificadas}
                    mostrarCheck={mostrarCheck}
                    cargando={cargaAsientos.cargando}
                    demoraIndicadorCargaMs={50}
                    mostrarSinDatos={cargaAsientos.consultaEjecutada}
                    cargandoPaginas={cargaAsientos.cargandoPaginas}
                    totalRegistrosRemotos={cargaAsientos.totalRegistrosRemotos}
                    registrosCargados={cargaAsientos.registrosCargados}
                    enfoqueVersion={cargaAsientos.versionEnfoqueGrid}
                    tamanoFuente={gridPreferencias.tamanoFuenteGrid}
                    layoutColumnas={gridPreferencias.layoutColumnasGrid}
                    layoutVersion={gridPreferencias.layoutVersion}
                    onLayoutChange={gridPreferencias.actualizarLayoutActualGrid}
                    textoBusqueda={busquedaGrid}
            />
        </div>

        {asientoAbierto != null && (
            <ABMAsientos
                key={asientoAbierto.instancia}
                comprobanteID={asientoAbierto.comprobanteID}
                modo={asientoAbierto.modo}
                navegacion={navegacionABM}
                onNavegar={navegarAsiento}
                mostrarMensajeCarga={false}
                onGuardado={actualizarDespuesDeGuardar}
                onEliminado={reposicionarDespuesDeEliminar}
                onNuevo={abrirNuevoAsiento}
                onCerrar={() => setAsientoAbierto(null)}
            />
        )}
        {cargaAsientos.error && <p role="alert">{cargaAsientos.error}</p>}
        {errorEliminacion && <p role="alert">{errorEliminacion}</p>}
        {errorImpresion && <p role="alert">{errorImpresion}</p>}
        <ModalConfirmacion
            abierto={Boolean(filaAEliminar)}
            titulo="Confirmar"
            mensaje="¿Desea eliminar definitivamente el registro?"
            procesando={eliminandoDesdeConsulta}
            onConfirmar={confirmarEliminacionDesdeConsulta}
            onCancelar={() => setFilaAEliminar(null)}
        />
        <ModalInfo
            abierto={Boolean(cargaAsientos.avisoTopeRegistros)}
            titulo="Cantidad de registros"
            mensaje={
                cargaAsientos.avisoTopeRegistros
                    ? (
                        "La cantidad de registros encontrados (" +
                        cargaAsientos.avisoTopeRegistros.totalRegistros +
                        ") supera el tope configurado para esta pagina. " +
                        "Se cargaron los primeros " +
                        cargaAsientos.avisoTopeRegistros.topeRegistros +
                        " registros."
                    )
                    : ""
            }
            onCerrar={modelo.cerrarAviso}
        />
        <ConfiguracionInformeModal
            abierto={Boolean(configuracionImpresion)}
            configuracion={configuracionImpresion}
            onAceptar={imprimirConsulta}
            onCancelar={() => setConfiguracionImpresion(null)}
        />


    </div>
  );

}

export default CtbAsientosBQD;

