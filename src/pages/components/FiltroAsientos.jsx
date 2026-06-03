import "./styles/FiltroAsientos.css";
import BotonToolbar from "./BotonToolbar";
import InputBuscador from "./InputBuscador";
import ComboToolbar from "./ComboToolbar";
import InputFecha from "./InputFecha";
import InputCombo from "./InputCombo";

import btnNew from "./styles/res/btnNew.png";
import btnPrint from "./styles/res/btnPrint.png";
import btnConta from "./styles/res/btnConta.png";
import btnTot from "./styles/res/btnTot.png";
import btnLupa from "./styles/res/btnLupa.png";
import btnHelp from "./styles/res/btnHelp.png";
import iconGrilla from "./styles/res/iconGrilla.png";
import iconFlecha from "./styles/res/iconFlecha.png";
import iconFlechaC from "./styles/res/iconFlechaC.png";
import btnCalendar from "./styles/res/btnCalendar.png";
import btnVFiltros from "./styles/res/btnVFiltros.png";
import btnMFiltros from "./styles/res/btnMFiltros.png";
import btnRefresh from "./styles/res/btnRefresh.png";



function FiltroAsientos() 

{

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
                placeholder="01/01/2026"
                icono={<img src={btnCalendar} />}
            />

            <InputFecha
                titulo="Hasta"
                placeholder="31/01/2026"
                icono={<img src={btnCalendar} />}
            />
            <InputCombo
                titulo="Empresa"
                valor="Boyano SA"
                icono={<img src={iconFlechaC} />}
            />

            <InputBuscador
                titulo="Cuenta"
                placeholder=""
            />

            <BotonToolbar
                texto="FILTRAR"
                variante="primario"
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