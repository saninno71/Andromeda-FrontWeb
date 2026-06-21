import "./asientos.css";

import { useEffect,useState } from "react";
//componente grilla
import Grid from "../../components/grid/Grid";
//componente filtros
import FiltroAsientos from "./FiltroAsientos";

/*importa la info total*/
// import dataGrid  from "./simul/Asientos.json";
import { cargarAsientos } from "./asientosService";

function asientos() 

{

    /*definicion de columnas */
    const columnasVisibles  = [
    {campo: "comprobanteID",titulo: "comprobanteID",visible: false, formato: "",mascara:"",key:true,suma:false,ancho:100,align:"center",desdoblarTexto: false,ordenDefault:"",direccionDefault:""},
    {campo: "fecha", titulo: "Fecha", visible: true, formato: "fecha",mascara:"DD/MM/YYYY",key:false,suma:false,ancho:100,align:"center",desdoblarTexto: false,ordenDefault:"1",direccionDefault:"desc" },
    {campo: "numeraTipoSimbolo", titulo: "Tipo", visible: true, formato: "texto",mascara:"",key:false,suma:false,ancho:50,align:"center",desdoblarTexto: true,ordenDefault:"",direccionDefault:""},
    {campo: "numero", titulo: "Numero", visible: true, formato: "entero",mascara:"",key:false,suma:false,ancho:100,align:"center",desdoblarTexto: false,ordenDefault:"",direccionDefault:"" },
    {campo: "debeCuentaCodigo", titulo: "Cuenta debe", visible: true, formato: "texto",mascara:"",key:false,suma:false,ancho:130,align:"center",desdoblarTexto: false,ordenDefault:"",direccionDefault:"" },
    {campo: "debeCuentaNombre", titulo: "Cuenta debe nombre", visible: true, formato: "texto",mascara:"",key:false,suma:false,ancho:180,align:"left",desdoblarTexto: false,ordenDefault:"",direccionDefault:""},
    {campo: "monedaCodigo", titulo: "Moneda", visible: true, formato: "texto",mascara:"",key:true,suma:false,ancho:100,align:"center",desdoblarTexto: false ,ordenDefault:"",direccionDefault:""},
    {campo: "debeImporte", titulo: "Débito", visible: true, formato: "decimal",mascara:"0.0,00",key:false,suma:true,ancho:100,align:"right",desdoblarTexto: false,ordenDefault:"",direccionDefault:"" },
    {campo: "debeImpLocal", titulo: "Débito en ARS", visible: true, formato: "decimal",mascara:"0.0,00",key:false,suma:true,ancho:120,align:"right",desdoblarTexto: false ,ordenDefault:"",direccionDefault:""},
    {campo: "debeImpReferencia", titulo: "Débito en U$S", visible: true, formato: "decimal",mascara:"0.0,00",key:false,suma:true,ancho:120,align:"right",desdoblarTexto: false,ordenDefault:"",direccionDefault:"" },
    {campo: "debeClienteCodigo", titulo: "Cliente", visible: true, formato: "texto",mascara:"",key:false,suma:false,ancho:100,align:"left",desdoblarTexto: false,ordenDefault:"",direccionDefault:"" },
    {campo: "debeClienteNombre", titulo: "Cliente Nombre", visible: true, formato: "texto",mascara:"",key:false,suma:false,ancho:190,align:"left",desdoblarTexto: true,ordenDefault:"",direccionDefault:""},
    {campo: "debeProveedorNombre", titulo: "Proveedor", visible: true, formato: "texto",mascara:"",key:false,suma:false,ancho:250,align:"left",desdoblarTexto: true,ordenDefault:"",direccionDefault:""}
    ];

    const mostrarCheck=true;
    const [dataGrid,setDataGrid] = useState([]);
    const [cargando,setCargando] = useState(false);

    const filtrosDefault = {
        fechaDesde: 0,
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
        const data = await cargarAsientos(
            filtros.fechaDesde,
            filtros.fechaHasta,
            filtros.empresaID
        );
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
    
  return (
    
    <div className="asientosContent">
        <div className="contenedorFiltros">
            <FiltroAsientos
                onFiltrar={filtrarAsientos}
            />
        </div>
     

        <div className="contenedorGrilla">
            <Grid   columnasVisibles={columnasVisibles} 
                    dataGrid={dataGrid} 
                    mostrarCheck={mostrarCheck}
                    cargando={cargando}
            />
        </div>

       
    </div>
  );

}

export default asientos;