import "./ctbAsientosBQD.css";

import { useState } from "react";
//componente grilla
import Grid from "../../components/grid/Grid";
import { useGridCargaPaginada } from "../../components/grid/useGridCargaPaginada";
import { useGridPreferencias } from "../../components/grid/useGridPreferencias";
import ModalInfo from "../../components/ModalInfo/ModalInfo";
//componente filtros
import FiltroAsientos from "./FiltroAsientos";

import {
    cargarAsientos,
    CONFIG_CARGA_ASIENTOS
} from "./asientosService";
import { primerDiaMesActual } from "../../components/fechas";
import { fechaAEntero } from "../../components/updFormatos";

const GRID_STORAGE_KEY = "andromeda:grid:asientos:views";

function CtbAsientosBQD({
    ejecutarConsultaInicial = false
})

{

    /*definicion de columnas */
    const columnasVisibles  = [
    {campo: "comprobanteID", titulo: "ID", visible: false, formato: "entero", mascara: "", key: true, suma: false, ancho: 100, align: "right", desdoblarTexto: false, ordenDefault: "", direccionDefault: ""},
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
    ];

    const mostrarCheck=true;
    const [busquedaGrid,setBusquedaGrid] = useState("");

    const gridPreferencias = useGridPreferencias({
        storageKey:GRID_STORAGE_KEY
    });

    const filtrosDefault = {
        fechaDesde: fechaAEntero(primerDiaMesActual()),
        fechaHasta: 0,
        empresaID: 0
    };

    const cargaAsientos = useGridCargaPaginada({
        cargarPagina:cargarAsientos,
        configuracion:CONFIG_CARGA_ASIENTOS,
        ejecutarConsultaInicial,
        filtrosIniciales:filtrosDefault
    });

  return (

    <div className="asientosContent">
        <div className="contenedorFiltros">
            <FiltroAsientos
                onFiltrar={cargaAsientos.cargar}
                gridPreferencias={gridPreferencias}
                busquedaGrid={busquedaGrid}
                onBusquedaGridChange={setBusquedaGrid}
            />
        </div>


        <div className="contenedorGrilla">
            <Grid   columnasVisibles={columnasVisibles}
                    dataGrid={cargaAsientos.dataGrid}
                    mostrarCheck={mostrarCheck}
                    cargando={cargaAsientos.cargando}
                    mostrarSinDatos={cargaAsientos.consultaEjecutada}
                    cargandoPaginas={cargaAsientos.cargandoPaginas}
                    totalRegistrosRemotos={cargaAsientos.totalRegistrosRemotos}
                    enfoqueVersion={cargaAsientos.versionEnfoqueGrid}
                    tamanoFuente={gridPreferencias.tamanoFuenteGrid}
                    layoutColumnas={gridPreferencias.layoutColumnasGrid}
                    layoutVersion={gridPreferencias.layoutVersion}
                    onLayoutChange={gridPreferencias.actualizarLayoutActualGrid}
                    textoBusqueda={busquedaGrid}
            />
        </div>

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
            onCerrar={cargaAsientos.cerrarAvisoTopeRegistros}
        />


    </div>
  );

}

export default CtbAsientosBQD;
