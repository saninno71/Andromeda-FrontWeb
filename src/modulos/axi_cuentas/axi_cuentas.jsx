import { useState } from "react";
import BotonToolbar from "../../components/BotonToolbar/BotonToolbar.jsx";
import Grid from "../../components/grid/Grid.jsx";
import InputTexto from "../../components/InputTexto/InputTexto.jsx";
import {
    columnasPedidoPrueba,
    columnasTotalesUnidadPrueba
} from "./axi_cuentas.columnas.js";
import {
    CONTROLES_VTS_PEDIDOS_VISIBLES,
    FUNCIONES_PLANTILLA_7003,
    OBJETOS_VTS_PEDIDOS,
    REFERENCIAS_PLANTILLA_7003,
    REFERENCIAS_PLANTILLA_7003_FALTANTES,
    claveLegacy
} from "./axi_cuentas.legacy.js";
import {
    crearFilasTotalesPorUnidad,
    crearDatosPedidoPrueba,
    generarMQLPedidoVisible
} from "./axi_cuentas.funcional.js";
import "./axi_cuentas.css";

function descargarTexto(nombre, contenido) {
    const enlace = document.createElement("a");
    enlace.href = URL.createObjectURL(new Blob([contenido], { type:"application/xml;charset=utf-8" }));
    enlace.download = nombre;
    enlace.click();
    URL.revokeObjectURL(enlace.href);
}

function AXICuentas() {
    const [datos, setDatos] = useState(() => crearDatosPedidoPrueba());
    const filasTotalesUnidad = crearFilasTotalesPorUnidad(datos.filas);

    function cambiarControl(campo, valor) {
        setDatos(actual => ({
            ...actual,
            valores:{ ...actual.valores, [campo]:valor }
        }));
    }

    function cambiarCampoObjeto(objeto, campo, valor) {
        setDatos(actual => ({
            ...actual,
            objetos:{
                ...actual.objetos,
                [objeto]:{
                    ...actual.objetos[objeto],
                    [campo]:valor
                }
            }
        }));
    }

    function regenerar() {
        setDatos(crearDatosPedidoPrueba());
    }

    function descargarMQL() {
        const xml = generarMQLPedidoVisible(datos);
        descargarTexto("Prueba_vtsPedidos_Plantilla_7003.xml", xml);
    }

    return (
        <main className="axiCuentasPrueba">
            <header className="axiCuentasCabecera">
                <div>
                    <h1>Prueba de marquilla de Ventas - Pedidos</h1>
                    <p>Contrato basado en vtsPedidosABM y en las referencias reales de la plantilla 7003. Imprimir genera el XML MQL de prueba.</p>
                </div>
                <div className="axiCuentasAcciones">
                    <BotonToolbar texto="REGENERAR DATOS" onClick={regenerar} />
                    <BotonToolbar texto="IMPRIMIR" variante="primario" onClick={descargarMQL} />
                </div>
            </header>

            <section className="axiCuentasDiagnostico" aria-label="Diagnóstico de visibilidad">
                <div>
                    <strong>{CONTROLES_VTS_PEDIDOS_VISIBLES.length}</strong>
                    <span>controles visibles o habilitables por código</span>
                </div>
                <div>
                    <strong>{columnasPedidoPrueba.length}</strong>
                    <span>columnas visibles enviadas</span>
                </div>
                <div>
                    <strong>{OBJETOS_VTS_PEDIDOS.reduce((total, objeto) => total + objeto.campos.length, 0)}</strong>
                    <span>datos provenientes de objetos</span>
                </div>
                <div className={REFERENCIAS_PLANTILLA_7003_FALTANTES.length ? "axiCuentasAdvertencia" : "axiCuentasCorrecto"}>
                    <strong>{REFERENCIAS_PLANTILLA_7003_FALTANTES.length}</strong>
                    <span>referencias faltantes para la plantilla 7003</span>
                </div>
            </section>

            <section className="axiCuentasPanel">
                <h2>Controles visibles de Pedidos</h2>
                <div className="axiCuentasControles">
                    {CONTROLES_VTS_PEDIDOS_VISIBLES.map(control => (
                        <div className="axiCuentasControl" key={claveLegacy(control)}>
                            <InputTexto
                                titulo={control.titulo}
                                value={datos.valores[control.campo]}
                                onChange={evento => cambiarControl(control.campo, evento.target.value)}
                            />
                            <small title={control.visibilidadOrigen ?? "Visible por diseño"}>
                                {claveLegacy(control)}
                                {control.visibilidadOrigen ? " *" : ""}
                            </small>
                        </div>
                    ))}
                </div>
            </section>

            <section className="axiCuentasPanel">
                <div className="axiCuentasTituloObjetos">
                    <div>
                        <h2>Datos provenientes de objetos</h2>
                        <p>No son controles de VB6. Pedidos los agrega al XML mediante XML_MQL_Objeto.</p>
                    </div>
                    <span>Origen no visual</span>
                </div>

                <div className="axiCuentasObjetos">
                    {OBJETOS_VTS_PEDIDOS.map(objeto => (
                        <fieldset className="axiCuentasObjeto" key={objeto.campo}>
                            <legend>{objeto.titulo}</legend>
                            <div className="axiCuentasObjetoReferencia">
                                Objeto legacy: {objeto.nombreLegacy} · índice {objeto.indice}
                            </div>
                            <div className="axiCuentasObjetoCampos">
                                {objeto.campos.map(campo => (
                                    <div className="axiCuentasControl" key={campo.campo}>
                                        <InputTexto
                                            titulo={campo.titulo}
                                            value={datos.objetos[objeto.campo][campo.campo]}
                                            onChange={evento => cambiarCampoObjeto(
                                                objeto.campo,
                                                campo.campo,
                                                evento.target.value
                                            )}
                                        />
                                        <small className={campo.requeridoPlantilla ? "axiCuentasReferenciaRequerida" : ""}>
                                            {objeto.nombreLegacy}.{campo.campo}
                                            {campo.requeridoPlantilla ? " · usada por 7003" : ""}
                                        </small>
                                    </div>
                                ))}
                            </div>
                        </fieldset>
                    ))}
                </div>
            </section>

            <section className="axiCuentasPanel axiCuentasPanelGrilla">
                <h2>Grilla 0 - Artículos: columnas visibles o habilitables por código</h2>
                <div className="axiCuentasGrilla">
                    <Grid
                        columnasVisibles={columnasPedidoPrueba}
                        dataGrid={datos.filas}
                        mostrarCheck={false}
                        cargando={false}
                        mostrarSinDatos={true}
                        mostrarTotales={false}
                        accionesMenuFila={[]}
                        tamanoFuente={12}
                    />
                </div>
            </section>

            <section className="axiCuentasPanel axiCuentasPanelGrillaAuxiliar">
                <h2>Grilla 3 - Totales por unidad</h2>
                <p className="axiCuentasDescripcionGrilla">
                    Esta grilla auxiliar también es requerida por la plantilla 7003 y se incluye en el XML.
                </p>
                <div className="axiCuentasGrillaAuxiliar">
                    <Grid
                        columnasVisibles={columnasTotalesUnidadPrueba}
                        dataGrid={filasTotalesUnidad}
                        mostrarCheck={false}
                        cargando={false}
                        mostrarSinDatos={true}
                        mostrarTotales={false}
                        accionesMenuFila={[]}
                        tamanoFuente={12}
                    />
                </div>
            </section>

            <section className="axiCuentasPanel axiCuentasHallazgos">
                <div>
                    <h2>Integridad de la plantilla 7003</h2>
                    <p>Las 24 referencias externas están cubiertas por controles, objetos o grillas de vtsPedidosABM.</p>
                    <ul>
                        {REFERENCIAS_PLANTILLA_7003.map(referencia => (
                            <li key={referencia}>{referencia}</li>
                        ))}
                    </ul>
                </div>
                <div>
                    <h2>Valores derivados dentro de la plantilla</h2>
                    <p>No requieren controles adicionales: se calculan con referencias ya cubiertas o con SQL.</p>
                    <ul>
                        {FUNCIONES_PLANTILLA_7003.map(funcion => <li key={funcion}>{funcion}</li>)}
                    </ul>
                </div>
            </section>
        </main>
    );
}

export default AXICuentas;
