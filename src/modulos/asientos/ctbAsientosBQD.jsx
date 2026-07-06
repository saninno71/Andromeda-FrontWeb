import "./ctbAsientosBQD.css";

import { useCallback,useEffect,useState } from "react";
//componente grilla
import Grid from "../../components/grid/Grid";
//componente filtros
import FiltroAsientos from "./FiltroAsientos";

/*importa la info total*/
// import dataGrid  from "./simul/Asientos.json";
import { cargarAsientos } from "./asientosService";
import { primerDiaMesActual } from "../../components/fechas";
import { fechaAEntero } from "../../components/updFormatos";

const GRID_STORAGE_KEY = "andromeda:grid:asientos:views";
const VISTA_DEFAULT = {
    id:"default",
    nombre:"Default",
    esDefault:true
};
const TAMANO_FUENTE_DEFAULT = 13;

function leerVistasGuardadas() {

    try
    {
        const datos =
            JSON.parse(
                localStorage.getItem(GRID_STORAGE_KEY)
            );

        return {
            vistaActualID:
                datos?.vistaActualID || VISTA_DEFAULT.id,
            vistas:
                Array.isArray(datos?.vistas)
                    ? datos.vistas
                    : []
        };
    }
    catch(error)
    {
        console.error(error);
        return {
            vistaActualID:VISTA_DEFAULT.id,
            vistas:[]
        };
    }

}

function guardarVistas(vistas,vistaActualID) {

    localStorage.setItem(
        GRID_STORAGE_KEY,
        JSON.stringify({
            vistaActualID,
            vistas
        })
    );

}

function CtbAsientosBQD()

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
    const [dataGrid,setDataGrid] = useState([]);
    const [cargando,setCargando] = useState(false);
    const datosVistasIniciales = leerVistasGuardadas();
    const [vistasGuardadas,setVistasGuardadas] =
        useState(datosVistasIniciales.vistas);
    const [vistaGridActualID,setVistaGridActualID] =
        useState(datosVistasIniciales.vistaActualID);
    const vistaInicial =
        datosVistasIniciales.vistas.find(
            vista => vista.id === datosVistasIniciales.vistaActualID
        );
    const [tamanoFuenteGrid,setTamanoFuenteGrid] =
        useState(vistaInicial?.fontSize || TAMANO_FUENTE_DEFAULT);
    const [layoutColumnasGrid,setLayoutColumnasGrid] =
        useState(vistaInicial?.columns || null);
    const [layoutVersion,setLayoutVersion] = useState(0);
    const [layoutActualGrid,setLayoutActualGrid] = useState([]);
    const [busquedaGrid,setBusquedaGrid] = useState("");

    const vistasGrid = [
        VISTA_DEFAULT,
        ...vistasGuardadas
    ];

    const filtrosDefault = {
        fechaDesde: fechaAEntero(primerDiaMesActual()),
        fechaHasta: 0,
        empresaID: 0
    };

    async function filtrarAsientos(filtros)
    {
        try
        {
        // console.time("total");
        setCargando(true);
        // console.time("api");
        const data = await cargarAsientos(filtros);
        // console.timeEnd("api");
        // console.time("setDataGrid");
        setDataGrid(data);
        // console.timeEnd("setDataGrid");
        // console.timeEnd("total");
        }
        finally
        {
            setCargando(false);
        }
    }

    useEffect(() => {
        // console.time("consulta");
        filtrarAsientos(filtrosDefault);
        // console.timeEnd("consulta");
    },[]);

    function ampliarTextoGrid() {
        setTamanoFuenteGrid(tamanoActual =>
            Math.min(15,tamanoActual + 1)
        );
    }

    function reducirTextoGrid() {
        setTamanoFuenteGrid(tamanoActual =>
            Math.max(11,tamanoActual - 1)
        );
    }

    const actualizarLayoutActualGrid = useCallback((layout) => {
        setLayoutActualGrid(layout);
    }, []);

    function obtenerProximoNombreVista() {

        const numeros =
            vistasGuardadas
            .map(vista => {
                const match =
                    vista.nombre.match(/^Grilla (\d+)$/);

                return match
                    ? Number(match[1])
                    : 0;
            });

        const proximoNumero =
            Math.max(0,...numeros) + 1;

        return `Grilla ${proximoNumero}`;

    }

    function armarVista(nombre) {

        const id =
            nombre
            .toLowerCase()
            .replace(/\s+/g,"-");

        return {
            id,
            nombre,
            fontSize:tamanoFuenteGrid,
            columns:layoutActualGrid
        };

    }

    function guardarGrilla() {

        if (vistaGridActualID === VISTA_DEFAULT.id) {
            guardarComoNueva();
            return;
        }

        const vistasActualizadas =
            vistasGuardadas.map(vista =>
                vista.id === vistaGridActualID
                    ? {
                        ...vista,
                        fontSize:tamanoFuenteGrid,
                        columns:layoutActualGrid
                    }
                    : vista
            );

        setVistasGuardadas(vistasActualizadas);
        guardarVistas(
            vistasActualizadas,
            vistaGridActualID
        );

    }

    function guardarComoNueva() {

        const nombre =
            obtenerProximoNombreVista();

        const nuevaVista =
            armarVista(nombre);

        const vistasActualizadas = [
            ...vistasGuardadas,
            nuevaVista
        ];

        setVistasGuardadas(vistasActualizadas);
        setVistaGridActualID(nuevaVista.id);
        guardarVistas(
            vistasActualizadas,
            nuevaVista.id
        );

    }

    function seleccionarVistaGrid(vistaID) {

        setVistaGridActualID(vistaID);

        if (vistaID === VISTA_DEFAULT.id) {
            setTamanoFuenteGrid(TAMANO_FUENTE_DEFAULT);
            setLayoutColumnasGrid(null);
            setLayoutVersion(version => version + 1);
            guardarVistas(
                vistasGuardadas,
                vistaID
            );
            return;
        }

        const vista =
            vistasGuardadas.find(
                item => item.id === vistaID
            );

        if (!vista) {
            return;
        }

        setTamanoFuenteGrid(
            vista.fontSize || TAMANO_FUENTE_DEFAULT
        );
        setLayoutColumnasGrid(vista.columns || null);
        setLayoutVersion(version => version + 1);
        guardarVistas(
            vistasGuardadas,
            vistaID
        );

    }

  return (

    <div className="asientosContent">
        <div className="contenedorFiltros">
            <FiltroAsientos
                onFiltrar={filtrarAsientos}
                onAmpliarTextoGrid={ampliarTextoGrid}
                onReducirTextoGrid={reducirTextoGrid}
                onGuardarGrilla={guardarGrilla}
                onGuardarComoNueva={guardarComoNueva}
                vistasGrid={vistasGrid}
                vistaGridActualID={vistaGridActualID}
                onSeleccionarVistaGrid={seleccionarVistaGrid}
                busquedaGrid={busquedaGrid}
                onBusquedaGridChange={setBusquedaGrid}
            />
        </div>


        <div className="contenedorGrilla">
            <Grid   columnasVisibles={columnasVisibles}
                    dataGrid={dataGrid}
                    mostrarCheck={mostrarCheck}
                    cargando={cargando}
                    tamanoFuente={tamanoFuenteGrid}
                    layoutColumnas={layoutColumnasGrid}
                    layoutVersion={layoutVersion}
                    onLayoutChange={actualizarLayoutActualGrid}
                    textoBusqueda={busquedaGrid}
            />
        </div>


    </div>
  );

}

export default CtbAsientosBQD;
