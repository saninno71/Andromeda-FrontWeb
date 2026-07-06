import "./FiltroAsientos.css";
import BotonToolbar from "../../components/BotonToolbar/BotonToolbar";
import InputBuscador from "../../components/InputBuscador/InputBuscador";
import ComboToolbar from "../../components/ComboToolbar/ComboToolbar";
import InputFecha from "../../components/InputFecha/InputFecha";
import InputCombo from "../../components/InputCombo/InputCombo";
import InputComboBusqueda from "../../components/InputComboBusqueda/InputComboBusqueda";
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

import {fechaAEntero} from "../../components/updFormatos"
import { primerDiaMesActual } from "../../components/fechas";
import { cargarEmpresas } from "../../components/services/empresasService";
import { cargarCuentas } from "../../components/services/cuentasService";
import { cargarProveedores } from "../../components/services/proveedoresService";

import { useCallback,useRef,useState,useEffect  } from "react";

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
const FECHA_DESDE_DEFAULT = primerDiaMesActual();

function FiltroAsientos({
    onFiltrar,
    onAmpliarTextoGrid,
    onReducirTextoGrid,
    onGuardarGrilla,
    onGuardarComoNueva,
    vistasGrid,
    vistaGridActualID,
    onSeleccionarVistaGrid,
    busquedaGrid,
    onBusquedaGridChange
}) 

{

// fecha default    
const [fechaDesde,setFechaDesde] = useState(FECHA_DESDE_DEFAULT);
const [fechaHasta,setFechaHasta] = useState(null);
// estado empresas
const [empresas,setEmpresas] = useState([]);
const [empresaSeleccionada,setEmpresaSeleccionada] = useState(null);
const [cuenta,setCuenta] = useState("");
const [cuentaKey,setCuentaKey] = useState(null);
const [cuentas,setCuentas] = useState([]);
const [mostrarChipsFiltros,setMostrarChipsFiltros] = useState(true);
const [mostrarMasFiltros,setMostrarMasFiltros] = useState(false);
const [detalle,setDetalle] = useState("");
const [proveedor,setProveedor] = useState("");
const [proveedorKey,setProveedorKey] = useState(null);
const [proveedores,setProveedores] = useState([]);
const [cajaBancaria,setCajaBancaria] = useState("");
const [numeraTipoSeleccionado,setNumeraTipoSeleccionado] = useState(null);
const [numeroDesde,setNumeroDesde] = useState("");
const [numeroHasta,setNumeroHasta] = useState("");
const refFechaDesde = useRef(null);
const refBotonFiltrar = useRef(null);
const filtrosActualesRef = useRef({
    fechaDesde:FECHA_DESDE_DEFAULT,
    fechaHasta:null,
    empresaSeleccionada:null,
    cuentaKey:null,
    detalle:"",
    numeraTipoID:null,
    numeroDesde:"",
    numeroHasta:""
});
const tabIndexControles = tabIndexFiltrosAsientos.controles;

const filtrar = useCallback(async function filtrar() {

    const filtrosActuales =
        filtrosActualesRef.current;

    onFiltrar({
        fechaDesde: fechaAEntero(filtrosActuales.fechaDesde),
        fechaHasta: fechaAEntero(filtrosActuales.fechaHasta),
        empresaID: filtrosActuales.empresaSeleccionada?.empresaID,
        cuentaID: filtrosActuales.cuentaKey,
        detalle: filtrosActuales.detalle,
        numeraTipoID: filtrosActuales.numeraTipoID,
        numeroDesde: filtrosActuales.numeroDesde
            ? Number(filtrosActuales.numeroDesde)
            : null,
        numeroHasta: filtrosActuales.numeroHasta
            ? Number(filtrosActuales.numeroHasta)
            : null
    });

}, [onFiltrar]);

function actualizarFiltroActual(campo,valor) {

    filtrosActualesRef.current = {
        ...filtrosActualesRef.current,
        [campo]:valor
    };

}

function cambiarFechaDesde(fecha) {

    setFechaDesde(fecha);
    actualizarFiltroActual("fechaDesde",fecha);

}

function cambiarFechaHasta(fecha) {

    setFechaHasta(fecha);
    actualizarFiltroActual("fechaHasta",fecha);

}

function cambiarEmpresa(empresa) {

    setEmpresaSeleccionada(empresa);
    actualizarFiltroActual("empresaSeleccionada",empresa);

}

function cambiarCuentaSeleccionada(item) {

    setCuentaKey(item.cuentaID);
    setCuenta(`${item.cuentaCodigo} - ${item.cuentaNombre}`);
    actualizarFiltroActual("cuentaKey",item.cuentaID);

}

function cambiarCuentaTexto(valor) {

    setCuenta(valor);
    setCuentaKey(null);
    actualizarFiltroActual("cuentaKey",null);

}

function cambiarProveedorSeleccionado(item) {

    setProveedorKey(item.proveedorID);
    setProveedor(`${item.proveedorCodigo} - ${item.proveedorNombre}`);

}

function cambiarProveedorTexto(valor) {

    setProveedor(valor);
    setProveedorKey(null);

}

function cambiarDetalle(valor) {

    setDetalle(valor);
    actualizarFiltroActual("detalle",valor);

}

function cambiarNumeraTipo(item) {

    setNumeraTipoSeleccionado(item);
    actualizarFiltroActual("numeraTipoID",item?.numeraTipoID || null);

}

function cambiarNumeroDesde(valor) {

    setNumeroDesde(valor);
    actualizarFiltroActual("numeroDesde",valor);

}

function cambiarNumeroHasta(valor) {

    setNumeroHasta(valor);
    actualizarFiltroActual("numeroHasta",valor);

}

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
                ".grilla",
                ".filtroActivoChip"
            ],
            accion:filtrar
        });

    document.addEventListener("keydown",manejarEnterFiltros);

    return () => {
        document.removeEventListener("keydown",manejarEnterFiltros);
    };

}, [tabIndexControles,filtrar]);

useEffect(() => {
    async function obtenerEmpresas() {
        const datos = await cargarEmpresas();
        setEmpresas(datos);

        if (datos.length > 0) {
            // setEmpresaSeleccionada(datos[0]);
            setEmpresaSeleccionada(null);
        }
    }
    obtenerEmpresas();
}, []);

useEffect(() => {
    async function obtenerCuentas() {
        if (cuenta.length < 2) {
            setCuentas([]);
            return;
        }

        const datos = await cargarCuentas(
            cuenta,
            empresaSeleccionada?.empresaID
        );
        setCuentas(datos);
    }

    const timeoutBusqueda = setTimeout(() => {
        obtenerCuentas();
    }, 500);

    return () => clearTimeout(timeoutBusqueda);
}, [cuenta,empresaSeleccionada]);

useEffect(() => {
    async function obtenerProveedores() {
        if (proveedor.length < 2) {
            setProveedores([]);
            return;
        }

        const datos = await cargarProveedores(
            proveedor,
            empresaSeleccionada?.empresaID
        );
        setProveedores(datos);
    }

    const timeoutBusqueda = setTimeout(() => {
        obtenerProveedores();
    }, 500);

    return () => clearTimeout(timeoutBusqueda);
}, [proveedor,empresaSeleccionada]);


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
    cuentaKey ||
    detalle ||
    proveedorKey ||
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
                                onAmpliarTexto={onAmpliarTextoGrid}
                                onReducirTexto={onReducirTextoGrid}
                                onGuardarGrilla={onGuardarGrilla}
                                onGuardarComoNueva={onGuardarComoNueva}
                                vistas={vistasGrid}
                                vistaActualID={vistaGridActualID}
                                onSeleccionarVista={onSeleccionarVistaGrid}
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
            <InputCombo
                titulo="Empresa"
                valor={empresaSeleccionada?.empresaNombre || ""}
                items={empresas}
                campoID="empresaID"
                campoDescripcion="empresaNombre"
                onChange={cambiarEmpresa}
                icono={<img src={iconFlechaC} />}
                tabIndex={tabIndexControles.empresa}
            />

            <InputComboBusqueda
                titulo="Cuenta"
                valor={cuenta}
                items={cuentas}
                campoID="cuentaID"
                campoCodigo="cuentaCodigo"
                campoDescripcion="cuentaNombre"
                icono={<img src={iconFlechaC} />}
                onChange={cambiarCuentaTexto}
                onSeleccionar={cambiarCuentaSeleccionada}
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

        {cuentaKey && (
            <div className="filtroActivoChip" tabIndex={0}>
                <span className="filtroActivoChipLabel">
                    Cuenta
                </span>
                <span className="filtroActivoChipValor">
                    {cuenta}
                </span>
                <button
                    onClick={() => {
                        quitarFiltroChip(() => {
                            setCuenta("");
                            setCuentaKey(null);
                            setCuentas([]);
                            actualizarFiltroActual("cuentaKey",null);
                        });
                    }}
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

        {proveedorKey && (
            <div className="filtroActivoChip" tabIndex={0}>
                <span className="filtroActivoChipLabel">
                    Proveedor
                </span>
                <span className="filtroActivoChipValor">
                    {proveedor}
                </span>
                <button
                    onClick={() =>
                        quitarFiltroChip(() => {
                            cambiarProveedorTexto("");
                            setProveedores([]);
                        })
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
        empresas={empresas}
        cuenta={cuenta}
        cuentas={cuentas}
        detalle={detalle}
        proveedor={proveedor}
        proveedores={proveedores}
        cajaBancaria={cajaBancaria}
        numeraTipoSeleccionado={numeraTipoSeleccionado}
        numeroDesde={numeroDesde}
        numeroHasta={numeroHasta}
        onCerrar={() => setMostrarMasFiltros(false)}
        onFiltrar={filtrarDesdeMasFiltros}
        onFechaDesdeChange={cambiarFechaDesde}
        onFechaHastaChange={cambiarFechaHasta}
        onEmpresaChange={cambiarEmpresa}
        onCuentaTextoChange={cambiarCuentaTexto}
        onCuentaSeleccionar={cambiarCuentaSeleccionada}
        onDetalleChange={cambiarDetalle}
        onProveedorTextoChange={cambiarProveedorTexto}
        onProveedorSeleccionar={cambiarProveedorSeleccionado}
        onCajaBancariaChange={setCajaBancaria}
        onNumeraTipoChange={cambiarNumeraTipo}
        onNumeroDesdeChange={cambiarNumeroDesde}
        onNumeroHastaChange={cambiarNumeroHasta}
    />

</div>

)

}

export default FiltroAsientos;
