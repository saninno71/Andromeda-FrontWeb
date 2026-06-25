import "./FiltroAsientos.css";
import BotonToolbar from "../../components/BotonToolbar/BotonToolbar";
import InputBuscador from "../../components/InputBuscador/InputBuscador";
import ComboToolbar from "../../components/ComboToolbar/ComboToolbar";
import InputFecha from "../../components/InputFecha/InputFecha";
import InputCombo from "../../components/InputCombo/InputCombo";
import InputComboBusqueda from "../../components/InputComboBusqueda/InputComboBusqueda";

import btnNew from "../../assets/btnNew.png";
import btnPrint from "../../assets/btnPrint.png";
import btnConta from "../../assets/btnConta.png";
import btnTot from "../../assets/btnTot.png";
import btnLupa from "../../assets/btnLupa.png";
import btnHelp from "../../assets/btnHelp.png";
import iconGrilla from "../../assets/iconGrilla.png";
import iconFlecha from "../../assets/iconFlecha.png";
import iconFlechaC from "../../assets/iconFlechaC.png";
import btnCalendar from "../../assets/btnCalendar.png";
import btnVFiltros from "../../assets/btnVFiltros.png";
import btnMFiltros from "../../assets/btnMFiltros.png";
import btnRefresh from "../../assets/btnRefresh.png";

import {fechaAEntero} from "../../components/updFormatos"
import { cargarEmpresas } from "../../components/services/empresasService";
import { cargarCuentas } from "../../components/services/cuentasService";

import { useState,useEffect  } from "react";

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
const [fechaDesde,setFechaDesde] = useState(null);
const [fechaHasta,setFechaHasta] = useState(null);
// estado empresas
const [empresas,setEmpresas] = useState([]);
const [empresaSeleccionada,setEmpresaSeleccionada] = useState(null);
const [cuenta,setCuenta] = useState("");
const [cuentaKey,setCuentaKey] = useState(null);
const [cuentas,setCuentas] = useState([]);

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


async function filtrar()
{
    onFiltrar({
        fechaDesde: fechaAEntero(fechaDesde),
        fechaHasta: fechaAEntero(fechaHasta),
        empresaID: empresaSeleccionada?.empresaID,
        cuentaID: cuentaKey
    });
}

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
    cuentaKey;


return (

<div className="filtroAsientos">

    <div className="fila1Toolbar">

        <div className="toolbarIzquierda">
            <BotonToolbar texto="" icono={<img src={btnNew} />}/>
            <BotonToolbar texto="" icono={<img src={btnPrint} />}/>
            <BotonToolbar texto="Contabilidad" icono={<img src={btnConta} />}/>
            <BotonToolbar texto="Totales" icono={<img src={btnTot} />}/>
        </div>

        <div className="toolbarDerecha">
                <InputBuscador
                    titulo="Buscar"
                    value={busquedaGrid}
                    placeholder=""
                    icono={<img src={btnLupa} />}
                    onChange={(e) => onBusquedaGridChange(e.target.value)}
                />
                <BotonToolbar texto="" icono={<img src={btnHelp} />}/>
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
                />
            </div>

    </div>

    <div className="fila2Busqueda">

        <div className="controlesBusqueda">
            <InputFecha
                titulo="Desde"
                valor={fechaDesde}
                onChange={setFechaDesde}
                placeholder=""
                icono={<img src={btnCalendar} />}
            />
            <InputFecha
                titulo="Hasta"
                valor={fechaHasta}
                onChange={setFechaHasta}
                placeholder=""
                icono={<img src={btnCalendar} />}
            />
            <InputCombo
                titulo="Empresa"
                valor={empresaSeleccionada?.empresaNombre || ""}
                items={empresas}
                campoID="empresaID"
                campoDescripcion="empresaNombre"
                onChange={setEmpresaSeleccionada}
                icono={<img src={iconFlechaC} />}
            />

            <InputComboBusqueda
                titulo="Cuenta"
                valor={cuenta}
                items={cuentas}
                campoID="cuentaID"
                campoCodigo="cuentaCodigo"
                campoDescripcion="cuentaNombre"
                icono={<img src={iconFlechaC} />}
                onChange={setCuenta}
                onSeleccionar={(item) => {
                    setCuentaKey(item.cuentaID);
                    setCuenta(`${item.cuentaCodigo} - ${item.cuentaNombre}`);
                }}
            />

            <BotonToolbar
                texto="FILTRAR"
                variante="primario"
                onClick={filtrar}
            />

        </div>

        <div className="accionesBusqueda">
            <BotonToolbar
                texto=""
                variante="transparente"
                icono={<img src={btnVFiltros} />}
            />
            <BotonToolbar
                texto=""
                variante="transparente"
                icono={<img src={btnMFiltros} />}
            />
            <BotonToolbar
                texto=""
                variante="transparente"
                icono={<img src={btnRefresh} />}
            />
        </div>

    </div>

    {hayFiltrosActivos && (

    <div className="fila3FiltrosActivos">

        {fechaDesde && (
            <div className="filtroActivoChip">
                <span className="filtroActivoChipLabel">
                    Fecha desde
                </span>
                <span className="filtroActivoChipValor">
                    {formatearFechaChip(fechaDesde)}
                </span>
                <button onClick={() => setFechaDesde(null)}>
                    x
                </button>
            </div>
        )}

        {fechaHasta && (
            <div className="filtroActivoChip">
                <span className="filtroActivoChipLabel">
                    Fecha hasta
                </span>
                <span className="filtroActivoChipValor">
                    {formatearFechaChip(fechaHasta)}
                </span>
                <button onClick={() => setFechaHasta(null)}>
                    x
                </button>
            </div>
        )}

        {empresaSeleccionada && (
            <div className="filtroActivoChip">
                <span className="filtroActivoChipLabel">
                    Empresa
                </span>
                <span className="filtroActivoChipValor">
                    {empresaSeleccionada.empresaNombre}
                </span>
                <button onClick={() => setEmpresaSeleccionada(null)}>
                    x
                </button>
            </div>
        )}

        {cuentaKey && (
            <div className="filtroActivoChip">
                <span className="filtroActivoChipLabel">
                    Cuenta
                </span>
                <span className="filtroActivoChipValor">
                    {cuenta}
                </span>
                <button
                    onClick={() => {
                        setCuenta("");
                        setCuentaKey(null);
                        setCuentas([]);
                    }}
                >
                    x
                </button>
            </div>
        )}

    </div>

    )}

</div>

)

}

export default FiltroAsientos;
