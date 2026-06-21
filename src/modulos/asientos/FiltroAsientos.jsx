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

function FiltroAsientos({ onFiltrar }) 

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
                    placeholder="Boyano monalli"
                    icono={<img src={btnLupa} />}
                />
                <BotonToolbar texto="" icono={<img src={btnHelp} />}/>
                {/* <BotonToolbar texto="" icono={<img src={btnHelp} />}/> */}
                <ComboToolbar icono={<img src={iconGrilla} />}
                                flecha={<img src={iconFlechaC} />}
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

    <div className="fila3FiltrosActivos">

    </div>

</div>

)

}

export default FiltroAsientos;
