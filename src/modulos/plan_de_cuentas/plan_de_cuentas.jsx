import "./plan_de_cuentas.css";

import { useEffect,useMemo,useState } from "react";
import Grid from "../../components/grid/Grid";
import BotonToolbar from "../../components/BotonToolbar/BotonToolbar";
import {
    cargarDatosModalPrueba,
    cargarPlanDeCuentas
} from "./planDeCuentasService";

const columnasPlanDeCuentas = [
    {campo:"cuentaID", titulo:"ID", visible:false, formato:"entero", mascara:"", key:true, suma:false, ancho:70, align:"right", desdoblarTexto:false, ordenDefault:"", direccionDefault:""},
    {campo:"codigo", titulo:"Codigo", visible:true, formato:"texto", mascara:"", key:false, suma:false, ancho:150, align:"left", desdoblarTexto:false, ordenDefault:"1", direccionDefault:"asc", editable:true, editor:"texto"},
    {campo:"nombre", titulo:"Nombre", visible:true, formato:"texto", mascara:"", key:false, suma:false, ancho:260, align:"left", desdoblarTexto:false, ordenDefault:"", direccionDefault:"", editable:true, editor:"texto"},
    {campo:"tipo", titulo:"Tipo", visible:true, formato:"texto", mascara:"", key:false, suma:false, ancho:130, align:"left", desdoblarTexto:false, ordenDefault:"", direccionDefault:"", editable:true, editor:"combo", editorConfig:{items:[
        {valor:"Activo", texto:"Activo"},
        {valor:"Pasivo", texto:"Pasivo"},
        {valor:"Patrimonio", texto:"Patrimonio"},
        {valor:"Resultado", texto:"Resultado"}
    ]}},
    {campo:"naturaleza", titulo:"Naturaleza", visible:true, formato:"texto", mascara:"", key:false, suma:false, ancho:130, align:"left", desdoblarTexto:false, ordenDefault:"", direccionDefault:"", editable:true, editor:"combo", editorConfig:{items:[
        {valor:"Deudora", texto:"Deudora"},
        {valor:"Acreedora", texto:"Acreedora"}
    ]}},
    {campo:"imputable", titulo:"Imputable", visible:true, formato:"texto", mascara:"", key:false, suma:false, ancho:100, align:"center", desdoblarTexto:false, ordenDefault:"", direccionDefault:"", editable:true, editor:"checkbox"},
    {campo:"orden", titulo:"Orden", visible:true, formato:"entero", mascara:"", key:false, suma:false, ancho:90, align:"right", desdoblarTexto:false, ordenDefault:"", direccionDefault:"", editable:true, editor:"numero"},
    {campo:"saldoInicial", titulo:"Saldo inicial", visible:true, formato:"decimal", mascara:"0.0,00", key:false, suma:true, ancho:140, align:"right", desdoblarTexto:false, ordenDefault:"", direccionDefault:"", editable:true, editor:"decimal"}
];

const columnasModalPrueba = [
    {campo:"id", titulo:"ID", visible:false, formato:"entero", mascara:"", key:true, suma:false, ancho:60, align:"right", desdoblarTexto:false, ordenDefault:"", direccionDefault:""},
    {campo:"codigo", titulo:"Codigo", visible:true, formato:"texto", mascara:"", key:false, suma:false, ancho:110, align:"left", desdoblarTexto:false, ordenDefault:"1", direccionDefault:"asc"},
    {campo:"descripcion", titulo:"Descripcion", visible:true, formato:"texto", mascara:"", key:false, suma:false, ancho:260, align:"left", desdoblarTexto:false, ordenDefault:"", direccionDefault:""},
    {campo:"estado", titulo:"Estado", visible:true, formato:"texto", mascara:"", key:false, suma:false, ancho:120, align:"left", desdoblarTexto:false, ordenDefault:"", direccionDefault:""},
    {campo:"importe", titulo:"Importe", visible:true, formato:"decimal", mascara:"0.0,00", key:false, suma:true, ancho:120, align:"right", desdoblarTexto:false, ordenDefault:"", direccionDefault:""}
];

function crearKeyCambio(fila,campo) {

    return `${fila.cuentaID}|${campo}`;

}

function PlanDeCuentas() {

    const [cuentas,setCuentas] = useState([]);
    const [cambios,setCambios] = useState([]);
    const [modalPruebaAbierto,setModalPruebaAbierto] = useState(false);
    const [datosModal,setDatosModal] = useState([]);

    useEffect(() => {

        async function cargar() {
            const datos = await cargarPlanDeCuentas();
            setCuentas(datos);
        }

        cargar();

    }, []);

    const celdasModificadas = useMemo(() => {

        return new Set(
            cambios.map(cambio =>
                `${cambio.cuentaID}|${cambio.campo}`
            )
        );

    }, [cambios]);

    function actualizarFila({
        filaNueva,
        cambios:cambiosFila
    }) {

        setCuentas(cuentasActuales =>
            cuentasActuales.map(cuenta =>
                cuenta.cuentaID === filaNueva.cuentaID
                    ? filaNueva
                    : cuenta
            )
        );

        setCambios(cambiosActuales => {
            const cambiosSinFila =
                cambiosActuales.filter(cambio => {
                    return !cambiosFila.some(cambioFila =>
                        cambio.cuentaID === filaNueva.cuentaID &&
                        cambio.campo === cambioFila.campo
                    );
                });

            return [
                ...cambiosSinFila,
                ...cambiosFila.map(cambio => ({
                    cuentaID:filaNueva.cuentaID,
                    codigo:filaNueva.codigo,
                    campo:cambio.campo,
                    valorAnterior:cambio.valorAnterior,
                    valorNuevo:cambio.valorNuevo
                }))
            ];
        });

    }

    function descartarCambios() {

        cargarPlanDeCuentas().then(datos => {
            setCuentas(datos);
            setCambios([]);
        });

    }

    function eliminarFila({fila}) {

        setCuentas(cuentasActuales =>
            cuentasActuales.filter(cuenta =>
                cuenta.cuentaID !== fila.cuentaID
            )
        );

        setCambios(cambiosActuales =>
            cambiosActuales.filter(cambio =>
                cambio.cuentaID !== fila.cuentaID
            )
        );

    }

    async function abrirModalPrueba() {

        setModalPruebaAbierto(true);
        const datos = await cargarDatosModalPrueba();
        setDatosModal(datos);

    }

    function cerrarModalPrueba() {

        setModalPruebaAbierto(false);
        setDatosModal([]);

    }

    return (
        <div className="planCuentasPagina">

            <div className="planCuentasToolbar">
                <div>
                    <div className="planCuentasTitulo">
                        Prototipo grilla editable
                    </div>
                    <div className="planCuentasSubtitulo">
                        Seleccione una fila y use el lapiz. Enter confirma la fila, Escape cancela.
                    </div>
                </div>

                <BotonToolbar
                    texto="MODAL"
                    onClick={abrirModalPrueba}
                />

                <BotonToolbar
                    texto="DESCARTAR"
                    onClick={descartarCambios}
                />
            </div>

            <div className="planCuentasGrilla">
                <Grid
                    columnasVisibles={columnasPlanDeCuentas}
                    dataGrid={cuentas}
                    mostrarCheck={true}
                    cargando={false}
                    mostrarSinDatos={true}
                    editable={true}
                    onRowChange={actualizarFila}
                    onDeleteRow={eliminarFila}
                    celdasModificadas={celdasModificadas}
                />
            </div>

            <div className="planCuentasCambios">
                <div className="planCuentasCambiosTitulo">
                    Cambios pendientes: {cambios.length}
                </div>
                <pre>
                    {JSON.stringify(cambios,null,2)}
                </pre>
            </div>

            {modalPruebaAbierto && (
                <div className="planCuentasModalOverlay">
                    <div className="planCuentasModal">
                        <div className="planCuentasModalHeader">
                            <div>
                                <div className="planCuentasModalTitulo">
                                    Modal de prueba
                                </div>
                                <div className="planCuentasModalSubtitulo">
                                    Datos inventados para validar comportamiento.
                                </div>
                            </div>

                            <button
                                type="button"
                                className="planCuentasModalCerrar"
                                onClick={cerrarModalPrueba}
                            >
                                X
                            </button>
                        </div>

                        <div className="planCuentasModalFormulario">
                            <label>
                                Codigo
                                <input defaultValue="PRB-2026" />
                            </label>

                            <label>
                                Responsable
                                <input defaultValue="Ruben Sanchez" />
                            </label>

                            <label>
                                Observacion
                                <input defaultValue="Prueba de ventana modal" />
                            </label>
                        </div>

                        <div className="planCuentasModalTablaContenedor">
                            <Grid
                                columnasVisibles={columnasModalPrueba}
                                dataGrid={datosModal}
                                mostrarCheck={false}
                                cargando={false}
                                mostrarSinDatos={true}
                                tamanoFuente={13}
                            />
                        </div>
                    </div>
                </div>
            )}

        </div>
    );

}

export default PlanDeCuentas;
