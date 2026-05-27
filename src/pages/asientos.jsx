import "./styles/asientos.css";

import { useEffect,useRef} from "react";
//componente grilla
import Grid from "./components/Grid";
//componente filtros
import FiltroAsientos from "./components/FiltroAsientos";

/*importa la info total*/
import dataGrid  from "./simul/Asientos.json";

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

  return (
    
    <div className="asientosContent">
        <div className="contenedorFiltros">
            <FiltroAsientos />
        </div>
        

        <div className="contenedorGrilla">
            <Grid columnasVisibles={columnasVisibles} dataGrid={dataGrid} mostrarCheck={mostrarCheck}/>
        </div>

       
    </div>
  );

}

export default asientos;