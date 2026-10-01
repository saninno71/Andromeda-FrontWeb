import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { crearModeloABMAsientos } from "./abmAsientos.modulos.js";
import { formatearCotizacion } from "./abmAsientos.funcional.js";
import { obtenerPresentacionCintaAsientos } from "./abmAsientos.cinta.js";
import ComboEmpresas from "../../../components/ComboEmpresas/ComboEmpresas";
import ComboMonedas from "../../../components/ComboMonedas/ComboMonedas";
import ComboNumeraciones from "../../../components/ComboNumeraciones/ComboNumeraciones";
import InputFecha from "../../../components/InputFecha/InputFecha";
import InputTexto from "../../../components/InputTexto/InputTexto";
import InputCombo from "../../../components/InputCombo/InputCombo";
import ModalHeader from "../../../components/ModalHeader/ModalHeader";
import ModalConfirmacion from "../../../components/ModalConfirmacion/ModalConfirmacion";
import ABMCintaAcciones from "../../../components/ABM/ABMCintaAcciones/ABMCintaAcciones";
import ABMIndicadorModo from "../../../components/ABM/ABMIndicadorModo/ABMIndicadorModo";
import ABMNavegacionRegistros from "../../../components/ABM/ABMNavegacionRegistros/ABMNavegacionRegistros";
import ABMPieAcciones from "../../../components/ABM/ABMPieAcciones/ABMPieAcciones";
import { MODO_ABM, esModoAlta, esModoBaja, esModoEdicion } from "../../../components/ABM/modosABM.js";
import { useScrollErrorABM } from "../../../components/ABM/useScrollErrorABM.js";
import Grid from "../../../components/grid/Grid";
import {
    CAMPOS_EDITABLES_RENGLON_ASIENTO,
    esCampoRenglonAsientoEditable,
    puedeEditarCampoAsiento
} from "./abmAsientos.permisos.js";
import nuevo from "../../../components/ABM/assets/nuevo.png";
import editar from "../../../components/ABM/assets/editar.png";
import eliminar from "../../../components/ABM/assets/eliminar.png";
import ver from "../../../components/ABM/assets/ver.png";
import imprimir from "../../../components/ABM/assets/imprimir.png";
import dinero from "../../../components/ABM/assets/dinero.png";
import acciones from "../../../components/ABM/assets/acciones.png";
import trazabilidad from "../../../components/ABM/assets/trazabilidad.png";
import calendario from "../../../assets/btnCalendar.png";
import calculadoraDeshabilitada from "../../../components/ABM/assets/calculadora-deshabilitada.png";
import "./ABMAsientos.css";

function convertirImporte(valor, cotizacion) {
    if (valor == null || valor === "") return null;
    const importe = Number(valor);
    const tipoCambio = Number(cotizacion);
    return Number.isFinite(importe) && Number.isFinite(tipoCambio) && tipoCambio > 0
        ? importe / tipoCambio
        : null;
}

const columnas = [
    { campo: "renglonID", titulo: "ID", key: true, visible: false },
    { campo: "cuentaCodigo", titulo: "Cuenta", ancho: 110 },
    { campo: "cuentaNombre", titulo: "Cuenta nombre", ancho: 220 },
    { campo: "subcuentaNombre", titulo: "Subcuenta nombre", ancho: 190, editable: false },
    { campo: "debe", titulo: "Debe", ancho: 125, formato: "decimal", mascara: "0.0,00", align: "right", suma: true },
    { campo: "haber", titulo: "Haber", ancho: 125, formato: "decimal", mascara: "0.0,00", align: "right", suma: true },
    { campo: "debeLocal", titulo: "Debe en ARS", tipo: "calculada", dependencias: ["debe"], calcular: (fila, contexto) => convertirImporte(fila.debe, contexto?.cotizacionLocal), ancho: 135, formato: "decimal", mascara: "0.0,00", align: "right", suma: true },
    { campo: "haberLocal", titulo: "Haber en ARS", tipo: "calculada", dependencias: ["haber"], calcular: (fila, contexto) => convertirImporte(fila.haber, contexto?.cotizacionLocal), ancho: 135, formato: "decimal", mascara: "0.0,00", align: "right", suma: true },
    { campo: "debeReferencia", titulo: "Debe en U$S", tipo: "calculada", dependencias: ["debe"], calcular: (fila, contexto) => convertirImporte(fila.debe, contexto?.cotizacionReferencia), ancho: 135, formato: "decimal", mascara: "0.0,00", align: "right", suma: true },
    { campo: "haberReferencia", titulo: "Haber en U$S", tipo: "calculada", dependencias: ["haber"], calcular: (fila, contexto) => convertirImporte(fila.haber, contexto?.cotizacionReferencia), ancho: 135, formato: "decimal", mascara: "0.0,00", align: "right", suma: true },
    { campo: "detalle", titulo: "Detalle", ancho: 240 },
    { campo: "clienteCodigo", titulo: "Cliente", ancho: 110 },
    { campo: "clienteNombre", titulo: "Cliente nombre", ancho: 190 },
    { campo: "proveedorCodigo", titulo: "Proveedor", ancho: 110 },
    { campo: "proveedorNombre", titulo: "Proveedor nombre", ancho: 190 },
    { campo: "cajaCodigo", titulo: "Caja", ancho: 100, editable: false },
    { campo: "cajaNombre", titulo: "Caja nombre", ancho: 180, editable: false },
    { campo: "jurisdiccionCodigo", titulo: "Jurisdicción", ancho: 120, editable: false },
    { campo: "jurisdiccionNombre", titulo: "Jurisdicción nombre", ancho: 190, editable: false },
    { campo: "vendedorCodigo", titulo: "Vendedor", ancho: 110, editable: false },
    { campo: "vendedorNombre", titulo: "Vendedor nombre", ancho: 190, editable: false },
    { campo: "cobradorCodigo", titulo: "Cobrador", ancho: 110, editable: false },
    { campo: "cobradorNombre", titulo: "Cobrador nombre", ancho: 190, editable: false }
].map(columna => {
    const base = { visible: true, formato: "texto", align: "left", ...columna };
    const editable = esCampoRenglonAsientoEditable(columna.campo);
    const entidad = /^(cuenta|cliente|proveedor)(Codigo|Nombre)$/.exec(columna.campo);
    if (entidad && editable) {
        const nombre = entidad[1];
        return { ...base, editable: true, editor: nombre, editorConfig: {
            campoID: `${nombre}ID`, atributoVisible: columna.campo,
            campos: { [`${nombre}ID`]: `${nombre}ID`, [`${nombre}Codigo`]: `${nombre}Codigo`, [`${nombre}Nombre`]: `${nombre}Nombre` },
            contexto: { empresaID: "empresaID" }
        }};
    }
    return {
        ...base,
        editable,
        editor: editable
            ? (columna.formato === "decimal" ? "decimal" : "texto")
            : undefined
    };
});

function Lectura({ titulo, valor }) {
    return <label className="abmLectura"><span>{titulo}</span><input aria-label={titulo} value={valor} readOnly /></label>;
}

function CotizacionLectura({ titulo, equivalencia, valor }) {
    return (
        <div className="abmCotizacionLectura" aria-label={titulo}>
            <span className="abmCotizacionTitulo">{titulo}</span>
            <div className="abmCotizacionContenido">
                <span className="abmCotizacionEquivalencia">{equivalencia}</span>
                <output>{formatearCotizacion(valor)}</output>
                <img src={calculadoraDeshabilitada} alt="" />
            </div>
        </div>
    );
}

export default function ABMAsientos({
    comprobanteID,
    modo = MODO_ABM.CONSULTA,
    onCerrar,
    onGuardado,
    onEliminado,
    onNuevo,
    navegacion,
    onNavegar,
    mostrarMensajeCarga = true
}) {
    const [modelo] = useState(() => crearModeloABMAsientos(comprobanteID, modo));
    const estado = useSyncExternalStore(modelo.suscribir, modelo.obtenerEstado, modelo.obtenerEstado);
    const mensajeError = estado.error || estado.errorGuardado;
    const cuerpoABM = useScrollErrorABM(mensajeError);
    const contextoCalculos = useMemo(() => ({
        cotizacionLocal: estado.tipoCambioLocal,
        cotizacionReferencia: estado.tipoCambioReferencia
    }), [estado.tipoCambioLocal, estado.tipoCambioReferencia]);
    const overlay = useRef(null);
    const modal = useRef(null);
    const controlGrid = useRef(null);
    const [cambiosPendientesGrid, setCambiosPendientesGrid] = useState(false);
    const [confirmarEliminacion, setConfirmarEliminacion] = useState(false);
    const cambiar = campo => valor => modelo.actualizar(campo, valor);
    const cambiarTexto = campo => evento => modelo.actualizar(campo, evento.target.value);
    const esEdicion = esModoEdicion(estado.modo);
    const esAlta = esModoAlta(estado.modo);
    const esBaja = esModoBaja(estado.modo);
    const campoEditable = campo => !estado.guardando && puedeEditarCampoAsiento(estado.modo, campo);
    const presentacionCinta = obtenerPresentacionCintaAsientos(estado.modo);
    const manejarEdicionGrid = useCallback(edicion => {
        setCambiosPendientesGrid(Boolean(edicion && CAMPOS_EDITABLES_RENGLON_ASIENTO.some(
            campo => !Object.is(edicion.original?.[campo], edicion.borrador?.[campo])
        )));
    }, []);
    const hayCambios = estado.modificado || cambiosPendientesGrid;
    const clave = estado.claveEncabezado || estado.comprobanteID;
    const accionesCinta = [
        { id:"nuevo", disabled:!onNuevo || presentacionCinta.deshabilitarNuevo || estado.guardando, onClick:onNuevo, icono:<img src={nuevo} alt="Nuevo" /> },
        { id:"editar", disabled:presentacionCinta.deshabilitarEdicion || estado.guardando, onClick:() => activarModo(MODO_ABM.EDICION), icono:<img src={editar} alt="Editar" /> },
        { id:"eliminar", disabled:presentacionCinta.deshabilitarEliminacion || estado.guardando, onClick:() => setConfirmarEliminacion(true), icono:<img src={eliminar} alt="Eliminar" /> },
        { id:"ver", disabled:presentacionCinta.deshabilitarConsulta || estado.guardando, onClick:() => activarModo(MODO_ABM.CONSULTA), icono:<img src={ver} alt="Ver" /> },
        { id:"imprimir", separadorAntes:true, icono:<img src={imprimir} alt="Imprimir" /> },
        { id:"destino", texto:"DESTINO", className:"abmCintaDestino" },
        { id:"dinero", separadorAntes:true, icono:<img src={dinero} alt="Operación monetaria" /> },
        {
            id:"navegacion",
            separadorAntes:true,
            componente:(
                <ABMNavegacionRegistros
                    onNavegar={onNavegar}
                    puedeAnterior={!presentacionCinta.deshabilitarNavegacion && navegacion?.puedeAnterior}
                    puedeSiguiente={!presentacionCinta.deshabilitarNavegacion && navegacion?.puedeSiguiente}
                    cargando={estado.cargando}
                    atenuada={presentacionCinta.deshabilitarNavegacion}
                />
            )
        },
        { id:"acciones", separadorAntes:true, icono:<img src={acciones} alt="Acciones" /> },
        { id:"trazabilidad", icono:<img src={trazabilidad} alt="Trazabilidad" /> }
    ];

    useEffect(() => {
        const estadoActual = modelo.obtenerEstado();
        if (
            comprobanteID != null &&
            estadoActual.cargado &&
            Number(estadoActual.comprobanteID) === Number(comprobanteID)
        ) {
            return modelo.cancelarCarga;
        }
        modelo.cargar(comprobanteID);
        return modelo.cancelarCarga;
    }, [modelo,comprobanteID]);

    useEffect(() => {
        const focoAnterior = document.activeElement;
        const overflowAnterior = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        modal.current.querySelector("[data-modal-cerrar]").focus();
        return () => {
            document.body.style.overflow = overflowAnterior;
            if (focoAnterior?.isConnected) focoAnterior.focus();
        };
    }, []);

    useEffect(() => {
        function ajustarLimitesVerticales() {
            const headerPantalla = document.querySelector("header.header");
            const scrollConsulta = [...document.querySelectorAll(".grillaScrollHorizontal")]
                .find(elemento => !modal.current?.contains(elemento));
            const inicio = headerPantalla?.getBoundingClientRect().bottom ?? 70;
            const fin = scrollConsulta?.getBoundingClientRect().top ?? window.innerHeight;
            overlay.current?.style.setProperty(
                "--abm-asientos-limite-superior",
                `${Math.max(0, inicio)}px`
            );
            overlay.current?.style.setProperty(
                "--abm-asientos-limite-inferior",
                `${Math.max(0, window.innerHeight - fin)}px`
            );
        }
        ajustarLimitesVerticales();
        window.addEventListener("resize", ajustarLimitesVerticales);
        return () => window.removeEventListener("resize", ajustarLimitesVerticales);
    }, []);

    function teclado(evento) {
        if (evento.key === "Escape") {
            evento.stopPropagation();
            onCerrar();
        }
        if (evento.key !== "Tab") return;
        const controles = [...modal.current.querySelectorAll('button, input, textarea, [tabindex]')]
            .filter(elemento => !elemento.matches(':disabled') && elemento.tabIndex >= 0 && elemento.getClientRects().length);
        const primero = controles[0];
        const ultimo = controles.at(-1);
        if (evento.shiftKey && document.activeElement === primero) { evento.preventDefault(); ultimo?.focus(); }
        if (!evento.shiftKey && document.activeElement === ultimo) { evento.preventDefault(); primero?.focus(); }
    }

    async function aplicar() {
        const eraAlta = esAlta;
        controlGrid.current?.confirmarEdicion?.();
        const guardado = await modelo.guardar({ recargar: true });
        if (guardado) {
            const estadoGuardado = modelo.obtenerEstado();
            await onGuardado?.({
                origen: "aplicar",
                esAlta: eraAlta,
                comprobanteID: estadoGuardado.comprobanteID,
                modo: estadoGuardado.modo
            });
        }
    }

    async function aceptar() {
        const eraAlta = esAlta;
        controlGrid.current?.confirmarEdicion?.();
        if (!modelo.obtenerEstado().modificado) {
            onCerrar();
            return;
        }
        const guardado = await modelo.guardar({ recargar: false });
        if (!guardado) return;
        const estadoGuardado = modelo.obtenerEstado();
        onGuardado?.({
            origen: "aceptar",
            esAlta: eraAlta,
            comprobanteID: estadoGuardado.comprobanteID,
            modo: estadoGuardado.modo
        });
        onCerrar();
    }

    async function confirmarBaja() {
        const eliminado = await modelo.eliminar();
        if (!eliminado) {
            setConfirmarEliminacion(false);
            return;
        }
        modelo.cambiarModo(MODO_ABM.CONSULTA);
        setConfirmarEliminacion(false);
        const reposicionado = await onEliminado?.(estado.comprobanteID);
        if (!reposicionado) onCerrar();
    }

    function agregarItem() {
        controlGrid.current?.confirmarEdicion?.();
        const renglon = modelo.agregarRenglon();
        if (!renglon) return;
        window.requestAnimationFrame(() => {
            controlGrid.current?.editarFila?.(renglon);
        });
    }

    function activarModo(modoDestino) {
        controlGrid.current?.confirmarEdicion?.();
        modelo.cambiarModo(modoDestino);
    }

    return createPortal(
        <div className="abmAsientosOverlay" ref={overlay}>
            <section ref={modal} className="abmAsientosModal" role="dialog" aria-modal="true" aria-labelledby="abmAsientosTitulo" onKeyDown={teclado}>
                <ModalHeader
                    titulo={esAlta ? "Asiento nuevo" : `Asiento Nro. ${clave}`}
                    tituloID="abmAsientosTitulo"
                    ariaLabelCerrar="Cerrar ABM Asientos"
                    onCerrar={onCerrar}
                    contenidoAdicional={<ABMIndicadorModo modo={estado.modo} />}
                />
                <ABMCintaAcciones
                    acciones={accionesCinta}
                    ariaLabel="Acciones del asiento"
                />
                <div ref={cuerpoABM} className="abmAsientosCuerpo" aria-busy={estado.cargando}>
                    {mensajeError && (
                        <div className="abmAsientosEstado abmAsientosError" role="alert">
                            <span>{mensajeError}</span>
                            {estado.error && <button type="button" onClick={() => modelo.cargar()}>VOLVER A INTENTAR</button>}
                        </div>
                    )}
                    {mostrarMensajeCarga && estado.cargando && (
                        <div className="abmAsientosEstado" role="status">Cargando asiento...</div>
                    )}
                    <div className="abmAsientosCabecera">
                        <div className="abmGrupo">
                            <ComboEmpresas titulo="Empresa" valor={estado.empresa} onChange={cambiar("empresa")} disabled={!campoEditable("empresa")} />
                            <div className="abmDosColumnas">
                                <InputFecha titulo="Fecha" valor={estado.fecha} onChange={cambiar("fecha")} icono={<img src={calendario} alt="" />} disabled={!campoEditable("fecha")} />
                                <Lectura titulo="Tipo de comprobante" valor={estado.tipoComprobante} />
                            </div>
                            <InputTexto titulo="Detalle" value={estado.detalle} onChange={cambiarTexto("detalle")} disabled={!campoEditable("detalle")} />
                        </div>
                        <div className="abmGrupo">
                            <InputCombo titulo="Modelo de asientos" valor={estado.modeloAsiento} items={[]} campoID="id" campoDescripcion="nombre" onChange={cambiar("modeloAsiento")} disabled />
                        </div>
                        <div className="abmGrupo">
                            <ComboMonedas titulo="Moneda" valor={estado.moneda} onChange={cambiar("moneda")} disabled={!campoEditable("moneda")} />
                            <CotizacionLectura titulo="TC Moneda local" equivalencia="ARS = ARS" valor={estado.tipoCambioLocal} />
                            <CotizacionLectura titulo="TC Moneda referencia" equivalencia="USD = ARS" valor={estado.tipoCambioReferencia} />
                        </div>
                    </div>
                    <div className="abmAsientosDetalle">
                        <Grid columnasVisibles={columnas} dataGrid={estado.renglones} contextoCalculos={contextoCalculos} editable={esEdicion && !estado.guardando} accionesMenuFila={esEdicion ? ["editar", "eliminar"] : []} onRowChange={({ filaNueva }) => modelo.actualizarRenglon(filaNueva.renglonID, filaNueva)} onDeleteRow={({ fila }) => modelo.eliminarRenglon(fila.renglonID)} onEdicionChange={manejarEdicionGrid} controlNavegacionRef={controlGrid} mostrarCheck={false} mostrarSinDatos={estado.cargado && !esAlta} cargando={estado.cargando} demoraIndicadorCargaMs={500} formatoCantidadRegistros="cantidad" ajustarAlturaAContenido alturaMinima={205} />
                    </div>
                    <fieldset className="abmAccionesDetalle">
                        <button
                            type="button"
                            onClick={agregarItem}
                            disabled={!esEdicion || estado.guardando || estado.cargando}
                        >
                            + Agregar ítem
                        </button>
                    </fieldset>
                    <div className="abmAsientosInferior">
                        <div className="abmNumeracion">
                            <ComboNumeraciones titulo="Numeración" valor={estado.numeracion} onChange={cambiar("numeracion")} disabled={!campoEditable("numeracion")} />
                            {esAlta ? (
                                <InputTexto titulo="Punto de venta" value={estado.puntoVenta} onChange={cambiarTexto("puntoVenta")} disabled={!campoEditable("puntoVenta")} />
                            ) : (
                                <Lectura titulo="Punto de venta" valor={estado.puntoVenta} />
                            )}
                            <InputTexto titulo="Número" value={estado.numero} onChange={cambiarTexto("numero")} disabled={!campoEditable("numero")} />
                        </div>
                        <label className={`abmObservaciones ${!campoEditable("observaciones") ? "abmObservacionesDeshabilitadas" : ""}`}><span>Observaciones</span><textarea aria-label="Observaciones" value={estado.observaciones} onChange={cambiarTexto("observaciones")} disabled={!campoEditable("observaciones")} /></label>
                    </div>
                </div>
                <ABMPieAcciones
                    modo={estado.modo}
                    onCancelar={onCerrar}
                    onAplicar={aplicar}
                    onAceptar={aceptar}
                    aplicarDeshabilitado={esBaja || !hayCambios || estado.guardando || estado.cargando}
                    aceptarDeshabilitado={estado.guardando || estado.cargando}
                />
                <ModalConfirmacion
                    abierto={confirmarEliminacion}
                    mensaje="¿Desea eliminar definitivamente el registro?"
                    procesando={estado.guardando}
                    onConfirmar={confirmarBaja}
                    onCancelar={() => setConfirmarEliminacion(false)}
                />
            </section>
        </div>, document.body
    );
}


