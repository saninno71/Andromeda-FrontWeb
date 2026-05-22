import { useEffect,useRef} from "react";
import Grid from "./components/Grid";

/*importa la info total*/
import dataGrid  from "./simul/Asientos.json";

function asientos() {

    /*definicion de columnas */
    const columnasVisibles  = [
    { campo: "comprobanteID", titulo: "comprobanteID", visible: false, formato: "",key:true,suma:false,ancho:100,align:"center",
        desdoblarTexto: false},
    { campo: "fecha", titulo: "Fecha", visible: true, formato: "fecha",key:false,suma:false,ancho:100,align:"center",
        desdoblarTexto: false },
    { campo: "monedaCodigo", titulo: "Moneda", visible: true, formato: "string", key:true,suma:false,ancho:100,align:"center",
        desdoblarTexto: false },
    { campo: "debeImporte", titulo: "Debe", visible: true, formato: "moneda", key:false,suma:true,ancho:100,align:"right",
        desdoblarTexto: false },
    { campo: "haberCuentaNombre", titulo: "CtaHaber", visible: true, formato: "string", key:false,suma:false,ancho:100,align:"left",
        desdoblarTexto: false },
    { campo: "haberImporte", titulo: "Haber", visible: true, formato: "moneda", key:false,suma:true,ancho:100,align:"right",
        desdoblarTexto: false }
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
        
        <div className="grilla">
            <Grid columnasVisibles={columnasVisibles} dataGrid={dataGrid} mostrarCheck={mostrarCheck}/>
        </div>

        {/* <div className="totales">
            <p>totales</p>
        </div> */}
    </div>
  );


}

export default asientos;