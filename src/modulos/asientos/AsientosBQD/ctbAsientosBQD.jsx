import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ABMAsientos from "../AsientosABM/ABMAsientos.jsx";
import { MODO_ABM } from "../../../components/ABM/modosABM.js";
import { configurarEditoresAsientos } from "./asientosEditores";
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
//componente filtros
import FiltroAsientos from "./FiltroAsientos";

const GRID_STORAGE_KEY = "andromeda:grid:asientos:views";

function CtbAsientosBQD({
    ejecutarConsultaInicial = false
})

{

    /*definicion de columnas */
    const columnasVisibles = useMemo(() => configurarEditoresAsientos([
    {campo: "comprobanteID", titulo: "ID", visible: true, formato: "entero", mascara: "", key: true, suma: false, ancho: 100, align: "right", desdoblarTexto: false, ordenDefault: "", direccionDefault: ""},
    {campo: "fecha", titulo: "Fecha", visible: true, formato: "fecha", mascara: "DD/MM/YYYY", key: false, suma: false, ancho: 110, align: "center", desdoblarTexto: false, ordenDefault: "1", direccionDefault: "desc"},
    {campo: "numeraTipoID", titulo: "NumeraTipoID", visible: false, formato: "entero", mascara: "", key: false, suma: false, ancho: 100, align: "right", desdoblarTexto: false, ordenDefault: "", direccionDefault: ""},
    {campo: "numeraTipoSimbolo", titulo: "Tipo", visible: true, formato: "texto", mascara: "", key: false, suma: false, ancho: 60, align: "left", desdoblarTexto: false, ordenDefault: "", direccionDefault: ""},
    {campo: "numero", titulo: "Numero", visible: true, formato: "entero", mascara: "", key: false, suma: false, ancho: 90, align: "right", desdoblarTexto: false, ordenDefault: "", direccionDefault: ""},
    {campo: "debeCuentaID", titulo: "CuentaDebeID", visible: false, formato: "entero", mascara: "", key: false, suma: false, ancho: 100, align: "right", desdoblarTexto: false, ordenDefault: "", direccionDefault: ""},
    {campo: "debeCuentaCodigo", titulo: "Cuenta debe", visible: true, formato: "texto", mascara: "", key: false, suma: false, ancho: 110, align: "left", desdoblarTexto: false, ordenDefault: "", direccionDefault: ""},
    {campo: "debeCuentaNombre", titulo: "Cuenta debe nombre", visible: true, formato: "texto", mascara: "", key: false, suma: false, ancho: 160, align: "left", desdoblarTexto: false, ordenDefault: "", direccionDefault: ""},
    {campo: "monedaCodigo", titulo: "Moneda", visible: true, formato: "texto", mascara: "", key: true, suma: false, ancho: 60, align: "left", desdoblarTexto: false, ordenDefault: "", direccionDefault: ""},
    {campo: "debeImporte", titulo: "Debito", visible: true, formato: "decimal", mascara: "0.0,00", key: false, suma: true, ancho: 150, align: "right", desdoblarTexto: false, ordenDefault: "", direccionDefault: ""},
    {campo: "debeImpLocal", titulo: "Debito en ARS", visible: true, formato: "decimal", mascara: "0.0,00", key: false, suma: true, ancho: 150, align: "right", desdoblarTexto: false, ordenDefault: "", direccionDefault: ""},
    {campo: "debeImpReferencia", titulo: "Debito en U$S", visible: true, formato: "decimal", mascara: "0.0,00", key: false, suma: true, ancho: 140, align: "right", desdoblarTexto: false, ordenDefault: "", direccionDefault: ""},
    {campo: "debeClienteID", titulo: "ClienteID", visible: false, formato: "entero", mascara: "", key: false, suma: false, ancho: 100, align: "right", desdoblarTexto: false, ordenDefault: "", direccionDefault: ""},
    {campo: "debeClienteCodigo", titulo: "Cliente", visible: true, formato: "entero", mascara: "", key: false, suma: false, ancho: 110, align: "right", desdoblarTexto: false, ordenDefault: "", direccionDefault: ""},
    {campo: "debeClienteNombre", titulo: "Cliente nombre", visible: true, formato: "texto", mascara: "", key: false, suma: false, ancho: 160, align: "left", desdoblarTexto: false, ordenDefault: "", direccionDefault: ""},
    {campo: "debeProveedorID", titulo: "ProveedorID", visible: false, formato: "entero", mascara: "", key: false, suma: false, ancho: 100, align: "right", desdoblarTexto: false, ordenDefault: "", direccionDefault: ""},
    {campo: "debeProveedorCodigo", titulo: "Proveedor", visible: true, formato: "entero", mascara: "", key: false, suma: false, ancho: 110, align: "right", desdoblarTexto: false, ordenDefault: "", direccionDefault: ""},
    {campo: "debeProveedorNombre", titulo: "Proveedor nombre", visible: true, formato: "texto", mascara: "", key: false, suma: false, ancho: 160, align: "left", desdoblarTexto: false, ordenDefault: "", direccionDefault: ""},
    {campo: "debeCajaID", titulo: "CajaID", visible: false, formato: "entero", mascara: "", key: false, suma: false, ancho: 100, align: "right", desdoblarTexto: false, ordenDefault: "", direccionDefault: ""},
    {campo: "debeCajaCodigo", titulo: "Caja", visible: true, formato: "texto", mascara: "", key: false, suma: false, ancho: 110, align: "right", desdoblarTexto: false, ordenDefault: "", direccionDefault: ""},
    {campo: "debeCajaNombre", titulo: "Caja nombre", visible: true, formato: "texto", mascara: "", key: false, suma: false, ancho: 160, align: "left", desdoblarTexto: false, ordenDefault: "", direccionDefault: ""},
    {campo: "haberCuentaID", titulo: "CuentaHaberID", visible: false, formato: "entero", mascara: "", key: false, suma: false, ancho: 100, align: "right", desdoblarTexto: false, ordenDefault: "", direccionDefault: ""},
    {campo: "haberCuentaCodigo", titulo: "Cuenta haber", visible: true, formato: "texto", mascara: "", key: false, suma: false, ancho: 110, align: "left", desdoblarTexto: false, ordenDefault: "", direccionDefault: ""},
    {campo: "haberCuentaNombre", titulo: "Cuenta haber nombre", visible: true, formato: "texto", mascara: "", key: false, suma: false, ancho: 160, align: "left", desdoblarTexto: false, ordenDefault: "", direccionDefault: ""},
    {campo: "haberImporte", titulo: "Credito", visible: true, formato: "decimal", mascara: "0.0,00", key: false, suma: true, ancho: 150, align: "right", desdoblarTexto: false, ordenDefault: "", direccionDefault: ""},
    {campo: "haberImpLocal", titulo: "Credito en ARS", visible: true, formato: "decimal", mascara: "0.0,00", key: false, suma: true, ancho: 150, align: "right", desdoblarTexto: false, ordenDefault: "", direccionDefault: ""},
    {campo: "haberImpReferencia", titulo: "Credito en U$S", visible: true, formato: "decimal", mascara: "0.0,00", key: false, suma: true, ancho: 140, align: "right", desdoblarTexto: false, ordenDefault: "", direccionDefault: ""},
    {campo: "haberClienteID", titulo: "ClienteID", visible: false, formato: "entero", mascara: "", key: false, suma: false, ancho: 100, align: "right", desdoblarTexto: false, ordenDefault: "", direccionDefault: ""},
    {campo: "haberClienteCodigo", titulo: "Cliente", visible: true, formato: "entero", mascara: "", key: false, suma: false, ancho: 110, align: "right", desdoblarTexto: false, ordenDefault: "", direccionDefault: ""},
    {campo: "haberClienteNombre", titulo: "Cliente nombre", visible: true, formato: "texto", mascara: "", key: false, suma: false, ancho: 160, align: "left", desdoblarTexto: false, ordenDefault: "", direccionDefault: ""},
    {campo: "haberProveedorID", titulo: "ProveedorID", visible: false, formato: "entero", mascara: "", key: false, suma: false, ancho: 100, align: "right", desdoblarTexto: false, ordenDefault: "", direccionDefault: ""},
    {campo: "haberProveedorCodigo", titulo: "Proveedor", visible: true, formato: "entero", mascara: "", key: false, suma: false, ancho: 110, align: "right", desdoblarTexto: false, ordenDefault: "", direccionDefault: ""},
    {campo: "haberProveedorNombre", titulo: "Proveedor nombre", visible: true, formato: "texto", mascara: "", key: false, suma: false, ancho: 160, align: "left", desdoblarTexto: false, ordenDefault: "", direccionDefault: ""},
    {campo: "haberCajaID", titulo: "CajaID", visible: false, formato: "entero", mascara: "", key: false, suma: false, ancho: 100, align: "right", desdoblarTexto: false, ordenDefault: "", direccionDefault: ""},
    {campo: "haberCajaCodigo", titulo: "Caja", visible: true, formato: "texto", mascara: "", key: false, suma: false, ancho: 110, align: "right", desdoblarTexto: false, ordenDefault: "", direccionDefault: ""},
    {campo: "haberCajaNombre", titulo: "Caja nombre", visible: true, formato: "texto", mascara: "", key: false, suma: false, ancho: 160, align: "left", desdoblarTexto: false, ordenDefault: "", direccionDefault: ""},
    {campo: "detalle", titulo: "Detalle", visible: true, formato: "texto", mascara: "", key: false, suma: false, ancho: 240, align: "left", desdoblarTexto: false, ordenDefault: "", direccionDefault: ""},
    {campo: "empresaID", titulo: "EmpresaID", visible: false, formato: "entero", mascara: "", key: false, suma: false, ancho: 100, align: "right", desdoblarTexto: false, ordenDefault: "", direccionDefault: ""},
    {campo: "empresaCodigo", titulo: "Empresa", visible: true, formato: "entero", mascara: "", key: false, suma: false, ancho: 80, align: "right", desdoblarTexto: false, ordenDefault: "", direccionDefault: ""},
    {campo: "empresaNombre", titulo: "Empresa Nombre", visible: true, formato: "texto", mascara: "", key: false, suma: false, ancho: 220, align: "left", desdoblarTexto: false, ordenDefault: "", direccionDefault: ""}
    ]), []);

    const { modelo, estado, filas:datosEditables, celdasModificadas } = useAsientos({ ejecutarConsultaInicial });
    const [asientoAbierto, setAsientoAbierto] = useState(null);
    const [filaAEliminar, setFilaAEliminar] = useState(null);
    const [eliminandoDesdeConsulta, setEliminandoDesdeConsulta] = useState(false);
    const [errorEliminacion, setErrorEliminacion] = useState("");
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


    </div>
  );

}

export default CtbAsientosBQD;

