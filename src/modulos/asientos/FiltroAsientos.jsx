import "./FiltroAsientos.css";
import BotonToolbar from "../../components/BotonToolbar/BotonToolbar";
import InputBuscador from "../../components/InputBuscador/InputBuscador";
import ComboToolbar from "../../components/ComboToolbar/ComboToolbar";
import InputFecha from "../../components/InputFecha/InputFecha";
import ComboEmpresas from "../../components/ComboEmpresas/ComboEmpresas";
import ComboCuentas from "../../components/ComboCuentas/ComboCuentas";
import MasFiltrosAsientos from "./MasFiltrosAsientos";
import {
    crearTabIndexConEntrada,
    enfocarControl,
    ESTILO_ENTRADA_FOCO
} from "../../components/foco/tabIndex";
import { crearManejadorEnterPermitido } from "../../components/foco/enterAcciones";

import btnNew from "../../assets/btnNew.png";
import btnPrint from "../../assets/btnPrint.png";
import btnConta from "../../assets/btnConta.png";
import btnTot from "../../assets/btnTot.png";
import btnLupa from "../../assets/btnLupa.png";
import btnHelp from "../../assets/btnHelp.png";
import iconGrilla from "../../assets/iconGrilla.png";
import iconFlechaC from "../../assets/iconFlechaC.png";
import btnCalendar from "../../assets/btnCalendar.png";
import btnVFiltros from "../../assets/btnVFiltros.png";
import btnMFiltros from "../../assets/btnMFiltros.png";
import btnRefresh from "../../assets/btnRefresh.png";




import { useRef,useState,useEffect  } from "react";

const tabIndexFiltrosAsientos = crearTabIndexConEntrada([
    "fechaDesde",
    "fechaHasta",
    "empresa",
    "cuenta",
    "filtrar",
    "nuevo",
    "imprimir",
    "contabilidad",
    "totales",
    "buscar",
    "ayuda",
    "grilla"
]);


function FiltroAsientos({
    modelo,
    filtros,
    gridPreferencias,
    busquedaGrid,
    onBusquedaGridChange
}) 

{

const { fechaDesde, fechaHasta, empresaSeleccionada, cuentaSeleccionada, detalle, clienteSeleccionado, proveedorSeleccionado, cajaBancaria, numeraTipoSeleccionado, numeroDesde, numeroHasta } = filtros;
const [mostrarChipsFiltros,setMostrarChipsFiltros] = useState(true);
const [mostrarMasFiltros,setMostrarMasFiltros] = useState(false);
const refFechaDesde = useRef(null);
const refBotonFiltrar = useRef(null);
const tabIndexControles = tabIndexFiltrosAsientos.controles;
const filtrar = modelo.consultar;
const cambiarFechaDesde = valor => modelo.actualizarFiltro("fechaDesde", valor);
const cambiarFechaHasta = valor => modelo.actualizarFiltro("fechaHasta", valor);
const cambiarEmpresa = valor => modelo.actualizarFiltro("empresaSeleccionada", valor);
const cambiarCuentaSeleccionada = valor => modelo.actualizarFiltro("cuentaSeleccionada", valor);
const cambiarDetalle = valor => modelo.actualizarFiltro("detalle", valor);
const cambiarClienteSeleccionado = valor => modelo.actualizarFiltro("clienteSeleccionado", valor);
const cambiarProveedorSeleccionado = valor => modelo.actualizarFiltro("proveedorSeleccionado", valor);
const setCajaBancaria = valor => modelo.actualizarFiltro("cajaBancaria", valor);
const cambiarNumeraTipo = valor => modelo.actualizarFiltro("numeraTipoSeleccionado", valor);
const cambiarNumeroDesde = valor => modelo.actualizarFiltro("numeroDesde", valor);
const cambiarNumeroHasta = valor => modelo.actualizarFiltro("numeroHasta", valor);

function filtrarDesdeMasFiltros() {

    filtrar();
    setMostrarMasFiltros(false);

}

function enfocarBotonFiltrar() {

    window.setTimeout(() => {
        refBotonFiltrar.current?.focus?.();
    },0);

}

function quitarFiltroChip(quitarFiltro) {

    quitarFiltro();
    enfocarBotonFiltrar();

}

useEffect(() => {

    const manejarEnterFiltros =
        crearManejadorEnterPermitido({
            tabIndexesPermitidos:[
                tabIndexControles.fechaDesde,
                tabIndexControles.fechaHasta,
                tabIndexControles.empresa,
                tabIndexControles.cuenta,
                tabIndexControles.filtrar
            ],
            selectoresPermitidos:[
                ".filtroActivoChip"
            ],
            accion:filtrar
        });

    document.addEventListener("keydown",manejarEnterFiltros);

    return () => {
        document.removeEventListener("keydown",manejarEnterFiltros);
    };

}, [tabIndexControles,filtrar]);

function formatearFechaChip(fecha) {

    if (!fecha) {
        return "";
    }

    return fecha.toLocaleDateString(
        "es-AR",
        {
            day:"2-digit",
            month:"2-digit",
            year:"2-digit"
        }
    );

}

const hayFiltrosActivos =
    fechaDesde ||
    fechaHasta ||
    empresaSeleccionada ||
    cuentaSeleccionada ||
    detalle ||
    clienteSeleccionado ||
    proveedorSeleccionado ||
    numeraTipoSeleccionado ||
    numeroDesde ||
    numeroHasta;


return (

<div className="filtroAsientos">

    <span
        tabIndex={tabIndexFiltrosAsientos.entrada}
        onFocus={() => enfocarControl(refFechaDesde)}
        style={ESTILO_ENTRADA_FOCO}
    />

    <div className="fila1Toolbar">

        <div className="toolbarIzquierda">
            <BotonToolbar
                texto=""
                icono={<img src={btnNew} />}
                tabIndex={tabIndexControles.nuevo}
            />
            <BotonToolbar
                texto=""
                icono={<img src={btnPrint} />}
                tabIndex={tabIndexControles.imprimir}
            />
            <BotonToolbar
                texto="Contabilidad"
                icono={<img src={btnConta} />}
                tabIndex={tabIndexControles.contabilidad}
            />
            <BotonToolbar
                texto="Totales"
                icono={<img src={btnTot} />}
                tabIndex={tabIndexControles.totales}
            />
        </div>

        <div className="toolbarDerecha">
                <InputBuscador
                    titulo="Buscar"
                    value={busquedaGrid}
                    placeholder=""
                    icono={<img src={btnLupa} />}
                    onChange={(e) => onBusquedaGridChange(e.target.value)}
                    tabIndex={tabIndexControles.buscar}
                />
                <BotonToolbar
                    texto=""
                    icono={<img src={btnHelp} />}
                    tabIndex={tabIndexControles.ayuda}
                />
                {/* <BotonToolbar texto="" icono={<img src={btnHelp} />}/> */}
                <ComboToolbar icono={<img src={iconGrilla} />}
                                flecha={<img src={iconFlechaC} />}
                                onAmpliarTexto={gridPreferencias.ampliarTextoGrid}
                                onReducirTexto={gridPreferencias.reducirTextoGrid}
                                onGuardarGrilla={gridPreferencias.guardarGrilla}
                                onGuardarComoNueva={gridPreferencias.guardarComoNueva}
                                vistas={gridPreferencias.vistasGrid}
                                vistaActualID={gridPreferencias.vistaGridActualID}
                                onSeleccionarVista={gridPreferencias.seleccionarVistaGrid}
                                tabIndex={tabIndexControles.grilla}
                />
            </div>

    </div>

    <div className="fila2Busqueda">

        <div className="controlesBusqueda">
            <InputFecha
                ref={refFechaDesde}
                titulo="Desde"
                valor={fechaDesde}
                onChange={cambiarFechaDesde}
                onEnter={filtrar}
                placeholder=""
                icono={<img src={btnCalendar} />}
                tabIndex={tabIndexControles.fechaDesde}
            />
            <InputFecha
                titulo="Hasta"
                valor={fechaHasta}
                onChange={cambiarFechaHasta}
                onEnter={filtrar}
                placeholder=""
                icono={<img src={btnCalendar} />}
                tabIndex={tabIndexControles.fechaHasta}
            />
            <ComboEmpresas
                titulo="Empresa"
                valor={empresaSeleccionada}
                onChange={cambiarEmpresa}
                onEnter={filtrar}
                tabIndex={tabIndexControles.empresa}
            />

            <ComboCuentas
                titulo="Cuenta"
                valor={cuentaSeleccionada}
                empresaID={empresaSeleccionada?.empresaID}
                onChange={cambiarCuentaSeleccionada}
                onEnter={filtrar}
                tabIndex={tabIndexControles.cuenta}
            />

            <BotonToolbar
                ref={refBotonFiltrar}
                texto="FILTRAR"
                variante="primario"
                onClick={filtrar}
                tabIndex={tabIndexControles.filtrar}
            />

        </div>

        <div className="accionesBusqueda">
            <BotonToolbar
                texto=""
                variante="transparente"
                icono={<img src={btnVFiltros} />}
                onClick={() =>
                    setMostrarChipsFiltros(mostrar => !mostrar)
                }
            />
            <BotonToolbar
                texto=""
                variante="transparente"
                icono={<img src={btnMFiltros} />}
                onClick={() => setMostrarMasFiltros(true)}
            />
            <BotonToolbar
                texto=""
                variante="transparente"
                icono={<img src={btnRefresh} />}
                onClick={filtrar}
            />
        </div>

    </div>

    {hayFiltrosActivos && mostrarChipsFiltros && (

    <div className="fila3FiltrosActivos">

        {fechaDesde && (
            <div className="filtroActivoChip" tabIndex={0}>
                <span className="filtroActivoChipLabel">
                    Fecha desde
                </span>
                <span className="filtroActivoChipValor">
                    {formatearFechaChip(fechaDesde)}
                </span>
                <button
                    onClick={() =>
                        quitarFiltroChip(() => cambiarFechaDesde(null))
                    }
                >
                    x
                </button>
            </div>
        )}

        {fechaHasta && (
            <div className="filtroActivoChip" tabIndex={0}>
                <span className="filtroActivoChipLabel">
                    Fecha hasta
                </span>
                <span className="filtroActivoChipValor">
                    {formatearFechaChip(fechaHasta)}
                </span>
                <button
                    onClick={() =>
                        quitarFiltroChip(() => cambiarFechaHasta(null))
                    }
                >
                    x
                </button>
            </div>
        )}

        {empresaSeleccionada && (
            <div className="filtroActivoChip" tabIndex={0}>
                <span className="filtroActivoChipLabel">
                    Empresa
                </span>
                <span className="filtroActivoChipValor">
                    {empresaSeleccionada.empresaNombre}
                </span>
                <button
                    onClick={() =>
                        quitarFiltroChip(() => cambiarEmpresa(null))
                    }
                >
                    x
                </button>
            </div>
        )}

        {cuentaSeleccionada && (
            <div className="filtroActivoChip" tabIndex={0}>
                <span className="filtroActivoChipLabel">
                    Cuenta
                </span>
                <span className="filtroActivoChipValor">
                    {cuentaSeleccionada.cuentaCodigo} - {cuentaSeleccionada.cuentaNombre}
                </span>
                <button
                    onClick={() =>
                        quitarFiltroChip(() => cambiarCuentaSeleccionada(null))
                    }
                >
                    x
                </button>
            </div>
        )}

        {detalle && (
            <div className="filtroActivoChip" tabIndex={0}>
                <span className="filtroActivoChipLabel">
                    Detalle
                </span>
                <span className="filtroActivoChipValor">
                    {detalle}
                </span>
                <button
                    onClick={() =>
                        quitarFiltroChip(() => cambiarDetalle(""))
                    }
                >
                    x
                </button>
            </div>
        )}

        {proveedorSeleccionado && (
            <div className="filtroActivoChip" tabIndex={0}>
                <span className="filtroActivoChipLabel">
                    Proveedor
                </span>
                <span className="filtroActivoChipValor">
                    {proveedorSeleccionado.proveedorCodigo} - {proveedorSeleccionado.proveedorNombre}
                </span>
                <button
                    onClick={() =>
                        quitarFiltroChip(() => cambiarProveedorSeleccionado(null))
                    }
                >
                    x
                </button>
            </div>
        )}

        {clienteSeleccionado && (
            <div className="filtroActivoChip" tabIndex={0}>
                <span className="filtroActivoChipLabel">
                    Cliente
                </span>
                <span className="filtroActivoChipValor">
                    {clienteSeleccionado.clienteCodigo} - {clienteSeleccionado.clienteNombre}
                </span>
                <button
                    onClick={() =>
                        quitarFiltroChip(() => cambiarClienteSeleccionado(null))
                    }
                >
                    x
                </button>
            </div>
        )}

        {numeraTipoSeleccionado && (
            <div className="filtroActivoChip" tabIndex={0}>
                <span className="filtroActivoChipLabel">
                    Numeración
                </span>
                <span className="filtroActivoChipValor">
                    {numeraTipoSeleccionado.descripcion}
                </span>
                <button
                    onClick={() =>
                        quitarFiltroChip(() => cambiarNumeraTipo(null))
                    }
                >
                    x
                </button>
            </div>
        )}

        {numeroDesde && (
            <div className="filtroActivoChip" tabIndex={0}>
                <span className="filtroActivoChipLabel">
                    Desde número
                </span>
                <span className="filtroActivoChipValor">
                    {numeroDesde}
                </span>
                <button
                    onClick={() =>
                        quitarFiltroChip(() => cambiarNumeroDesde(""))
                    }
                >
                    x
                </button>
            </div>
        )}

        {numeroHasta && (
            <div className="filtroActivoChip" tabIndex={0}>
                <span className="filtroActivoChipLabel">
                    Hasta número
                </span>
                <span className="filtroActivoChipValor">
                    {numeroHasta}
                </span>
                <button
                    onClick={() =>
                        quitarFiltroChip(() => cambiarNumeroHasta(""))
                    }
                >
                    x
                </button>
            </div>
        )}

    </div>

    )}

    <MasFiltrosAsientos
        abierto={mostrarMasFiltros}
        fechaDesde={fechaDesde}
        fechaHasta={fechaHasta}
        empresaSeleccionada={empresaSeleccionada}
        cuentaSeleccionada={cuentaSeleccionada}
        detalle={detalle}
        clienteSeleccionado={clienteSeleccionado}
        proveedorSeleccionado={proveedorSeleccionado}
        cajaBancaria={cajaBancaria}
        numeraTipoSeleccionado={numeraTipoSeleccionado}
        numeroDesde={numeroDesde}
        numeroHasta={numeroHasta}
        onCerrar={() => setMostrarMasFiltros(false)}
        onFiltrar={filtrarDesdeMasFiltros}
        onFechaDesdeChange={cambiarFechaDesde}
        onFechaHastaChange={cambiarFechaHasta}
        onEmpresaChange={cambiarEmpresa}
        onCuentaChange={cambiarCuentaSeleccionada}
        onDetalleChange={cambiarDetalle}
        onClienteChange={cambiarClienteSeleccionado}
        onProveedorChange={cambiarProveedorSeleccionado}
        onCajaBancariaChange={setCajaBancaria}
        onNumeraTipoChange={cambiarNumeraTipo}
        onNumeroDesdeChange={cambiarNumeroDesde}
        onNumeroHastaChange={cambiarNumeroHasta}
    />

</div>

)

}

export default FiltroAsientos;
