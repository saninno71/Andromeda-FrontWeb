import { useEffect,useRef} from "react";
import Grid from "./components/Grid";

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
    {campo: "debeCuentaNombre", titulo: "Cuenta debe nombre", visible: true, formato: "texto",mascara:"",key:false,suma:false,ancho:150,align:"left",desdoblarTexto: false,ordenDefault:"",direccionDefault:""},
    {campo: "monedaCodigo", titulo: "Moneda", visible: true, formato: "texto",mascara:"",key:true,suma:false,ancho:100,align:"center",desdoblarTexto: false ,ordenDefault:"",direccionDefault:""},
    {campo: "debeImporte", titulo: "Débito", visible: true, formato: "decimal",mascara:"0.0,00",key:false,suma:true,ancho:100,align:"right",desdoblarTexto: false,ordenDefault:"",direccionDefault:"" },
    {campo: "debeImpLocal", titulo: "Débito en ARS", visible: true, formato: "decimal",mascara:"0.0,00",key:false,suma:true,ancho:120,align:"right",desdoblarTexto: false ,ordenDefault:"",direccionDefault:""},
    {campo: "debeImpReferencia", titulo: "Débito en U$S", visible: true, formato: "decimal",mascara:"0.0,00",key:false,suma:true,ancho:120,align:"right",desdoblarTexto: false,ordenDefault:"",direccionDefault:"" },
    {campo: "debeClienteCodigo", titulo: "Cliente", visible: true, formato: "texto",mascara:"",key:false,suma:false,ancho:100,align:"left",desdoblarTexto: false,ordenDefault:"",direccionDefault:"" },
    {campo: "debeClienteNombre", titulo: "Cliente Nombre", visible: true, formato: "texto",mascara:"",key:false,suma:false,ancho:130,align:"left",desdoblarTexto: true,ordenDefault:"",direccionDefault:""},
    {campo: "debeProveedorNombre", titulo: "Proveedor", visible: true, formato: "texto",mascara:"",key:false,suma:false,ancho:120,align:"left",desdoblarTexto: true,ordenDefault:"",direccionDefault:""}
    ];

    // const columnasVisibles  = [
    // { campo: "comprobanteID", titulo: "comprobanteID", visible: false, formato: "",key:true,suma:false},
    // { campo: "fecha", titulo: "Fecha", visible: true, formato: "fecha",key:false,suma:false},
    // { campo: "monedaCodigo", titulo: "Moneda", visible: true, formato: "string", key:true,suma:false},
    // { campo: "debeImporte", titulo: "Debe", visible: true, formato: "moneda", key:false,suma:true},
    // { campo: "haberImporte", titulo: "Haber", visible: true, formato: "moneda", key:false,suma:true}
    // ];

    const mostrarCheck=true;

    // useEffect(() => {
    // console.log(columnasVisibles);
    // }, []);

  return (
    
    <div>
        <div className="filtros">
            <h1>Asientos</h1>
            <p>filtros</p>
        </div>
        

        <div style={{ width: "900px" }} className="grilla">
            <Grid columnasVisibles={columnasVisibles} dataGrid={dataGrid} mostrarCheck={mostrarCheck}/>
        </div>

        {/* <div className="totales">
            <p>totales</p>
        </div> */}
    </div>
  );


}

export default asientos;