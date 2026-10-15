import { MODO_ABM, esModoABM, esModoAlta, esModoEdicion } from "../../../components/ABM/modosABM.js";
import {
    obtenerCambiosPermitidosRenglonAsiento,
    puedeEditarCampoAsiento
} from "./abmAsientos.permisos.js";
import { validarBalanceLineasAsiento } from "./abmAsientos.validaciones.js";

function obtenerFecha(valor) {
    if (valor instanceof Date) return new Date(valor);
    if (!valor) return null;
    const texto = String(valor);
    const partes = /^(\d{4})-?(\d{2})-?(\d{2})/.exec(texto);
    return partes ? new Date(Number(partes[1]), Number(partes[2]) - 1, Number(partes[3])) : null;
}

const copiar = valor => structuredClone(valor);

const FORMATO_COTIZACION = new Intl.NumberFormat("es-AR", {
    minimumFractionDigits: 4,
    maximumFractionDigits: 4,
    useGrouping: true
});

export function formatearCotizacion(valor) {
    if (valor == null || valor === "") return "";
    const numero = Number(valor);
    return Number.isFinite(numero) ? FORMATO_COTIZACION.format(numero) : "";
}

function crearClaveEncabezado(asiento, comprobanteID) {
    return [asiento.puntoVenta, asiento.numero]
        .filter(valor => valor != null && valor !== "")
        .join("-") || String(asiento.id ?? comprobanteID ?? "");
}

function crearEstadoInicial(comprobanteID, modo) {
    const esAlta = esModoAlta(modo);
    const hoy = esAlta ? new Date() : null;
    return {
        comprobanteID,
        claveEncabezado: "",
        modo,
        cargando: false,
        cargado: esAlta,
        guardando: false,
        modificado: false,
        error: null,
        errorGuardado: null,
        empresa: null,
        fecha: hoy,
        fechaEmision: hoy,
        detalle: "",
        modeloAsiento: null,
        moneda: null,
        tipoComprobante: "Asiento contable",
        tipoCambioLocal: esAlta ? 1 : "",
        tipoCambioReferencia: esAlta ? 1 : "",
        numeracion: null,
        puntoVenta: "",
        numero: "",
        observaciones: "",
        renglones: []
    };
}

export function transformarAsientoABM(asiento, comprobanteID, modo = MODO_ABM.CONSULTA) {
    const id = asiento.id ?? comprobanteID;
    return {
        comprobanteID: id,
        claveEncabezado: crearClaveEncabezado(asiento, id),
        modo,
        cargando: false,
        cargado: true,
        guardando: false,
        modificado: false,
        error: null,
        errorGuardado: null,
        empresa: asiento.empresaId == null ? null : {
            empresaID: asiento.empresaId,
            empresaCodigo: asiento.empresaCodigo ?? "",
            empresaNombre: asiento.empresaNombre ?? ""
        },
        fecha: obtenerFecha(asiento.fecha),
        fechaEmision: obtenerFecha(asiento.fechaEmision),
        detalle: asiento.detalle ?? "",
        modeloAsiento: null,
        moneda: asiento.monedaId == null ? null : {
            monedaID: asiento.monedaId,
            monedaCodigo: asiento.monedaCodigo ?? "",
            monedaNombre: asiento.monedaNombre ?? ""
        },
        tipoComprobante: "Asiento contable",
        tipoCambioLocal: asiento.cotizacionLocal ?? "",
        tipoCambioReferencia: asiento.cotizacionReferencia ?? "",
        numeracion: asiento.numeraTipoId == null ? null : {
            numeraTipoID: asiento.numeraTipoId,
            descripcion: asiento.numeraTipoSimbolo ?? ""
        },
        puntoVenta: asiento.puntoVenta ?? "",
        numero: asiento.numero ?? "",
        observaciones: asiento.observaciones ?? "",
        renglones: (asiento.lineas ?? []).map(linea => {
            const importe = linea.importe ?? 0;
            return {
                renglonID: linea.id,
                empresaID: asiento.empresaId ?? null,
                cuentaID: linea.cuentaId ?? null,
                cuentaCodigo: linea.cuentaCodigo ?? "",
                cuentaNombre: linea.cuentaNombre ?? "",
                tipo: linea.tipo ?? 0,
                importe,
                impLocal: linea.impLocal ?? 0,
                impReferencia: linea.impReferencia ?? 0,
                debe: linea.tipo === 1 ? importe : null,
                haber: linea.tipo === -1 ? importe : null,
                debeLocal: linea.debeLocal ?? (linea.tipo === 1 ? linea.impLocal ?? 0 : null),
                haberLocal: linea.haberLocal ?? (linea.tipo === -1 ? linea.impLocal ?? 0 : null),
                debeReferencia: linea.debeReferencia ?? (linea.tipo === 1 ? linea.impReferencia ?? 0 : null),
                haberReferencia: linea.haberReferencia ?? (linea.tipo === -1 ? linea.impReferencia ?? 0 : null),
                detalle: linea.detalle ?? "",
                subcuentaTipo: linea.subcuentaTipo ?? 0,
                subcuentaNombre: linea.subcuentaNombre ?? "",
                clienteID: linea.clienteId ?? null,
                clienteCodigo: linea.clienteCodigo ?? "",
                clienteNombre: linea.clienteNombre ?? "",
                proveedorID: linea.proveedorId ?? null,
                proveedorCodigo: linea.proveedorCodigo ?? "",
                proveedorNombre: linea.proveedorNombre ?? "",
                cajaID: linea.cajaId ?? null,
                cajaCodigo: linea.cajaCodigo ?? "",
                cajaNombre: linea.cajaNombre ?? "",
                jurisdiccionID: linea.jurisdiccionId ?? null,
                jurisdiccionCodigo: linea.jurisdiccionCodigo ?? "",
                jurisdiccionNombre: linea.jurisdiccionNombre ?? "",
                vendedorID: linea.vendedorId ?? null,
                vendedorCodigo: linea.vendedorCodigo ?? "",
                vendedorNombre: linea.vendedorNombre ?? "",
                cobradorID: linea.cobradorId ?? null,
                cobradorCodigo: linea.cobradorCodigo ?? "",
                cobradorNombre: linea.cobradorNombre ?? ""
            };
        })
    };
}

// El modelo recibe solamente la identidad del comprobante y un proveedor funcional.
function fechaParaApi(valor) {
    if (!(valor instanceof Date) || Number.isNaN(valor.getTime())) {
        throw new Error("La fecha del asiento no es válida.");
    }
    const parte = numero => String(numero).padStart(2, "0");
    return `${valor.getFullYear()}-${parte(valor.getMonth() + 1)}-${parte(valor.getDate())}T00:00:00`;
}

function numeroRequerido(valor, mensaje) {
    const numero = Number(valor);
    if (!Number.isFinite(numero) || numero <= 0) throw new Error(mensaje);
    return numero;
}

function importeOBlanco(valor) {
    if (valor == null || valor === "") return null;
    const numero = Number(valor);
    return Number.isFinite(numero) ? numero : NaN;
}

function tieneValorCargado(valor) {
    return typeof valor === "string"
        ? valor.trim() !== ""
        : valor != null;
}

function esAltaCompletamenteVacia(renglon) {
    if (Number(renglon.renglonID) > 0) return false;
    return ![
        renglon.cuentaID,
        renglon.cuentaCodigo,
        renglon.cuentaNombre,
        renglon.debe,
        renglon.haber,
        renglon.detalle
    ].some(tieneValorCargado);
}

function valorNumericoComparable(valor) {
    if (valor == null || valor === "") return null;
    const numero = Number(valor);
    return Number.isFinite(numero) ? numero : String(valor);
}

function fechaComparable(valor) {
    return valor instanceof Date && !Number.isNaN(valor.getTime())
        ? valor.getTime()
        : valor ?? null;
}

function crearInstantaneaEditable(estado) {
    const alta = esModoAlta(estado.modo);
    return {
        empresaID: valorNumericoComparable(estado.empresa?.empresaID),
        fecha: fechaComparable(estado.fecha),
        detalle: estado.detalle ?? "",
        monedaID: valorNumericoComparable(estado.moneda?.monedaID),
        numeraTipoID: valorNumericoComparable(estado.numeracion?.numeraTipoID),
        observaciones: estado.observaciones ?? "",
        ...(alta ? {
            puntoVenta: valorNumericoComparable(estado.puntoVenta),
            numero: valorNumericoComparable(estado.numero)
        } : {}),
        renglones: estado.renglones
            .filter(renglon => !esAltaCompletamenteVacia(renglon))
            .map(renglon => ({
                renglonID: Number(renglon.renglonID) > 0
                    ? Number(renglon.renglonID)
                    : null,
                cuentaID: valorNumericoComparable(renglon.cuentaID),
                cuentaCodigo: renglon.cuentaCodigo ?? "",
                cuentaNombre: renglon.cuentaNombre ?? "",
                debe: valorNumericoComparable(renglon.debe),
                haber: valorNumericoComparable(renglon.haber),
                detalle: renglon.detalle ?? ""
            }))
    };
}

function tieneCambiosPersistibles(estado, estadoBase) {
    return JSON.stringify(crearInstantaneaEditable(estado)) !==
        JSON.stringify(crearInstantaneaEditable(estadoBase));
}

function crearLineasPayload(estado, incluirId) {
    const renglonesAEnviar = estado.renglones
        .map((renglon, indice) => ({ renglon, indice }))
        .filter(({ renglon }) => !esAltaCompletamenteVacia(renglon));
    const lineas = renglonesAEnviar.map(({ renglon, indice }) => {
        const debe = importeOBlanco(renglon.debe);
        const haber = importeOBlanco(renglon.haber);
        const tieneDebe = debe != null && debe > 0;
        const tieneHaber = haber != null && haber > 0;
        if ((tieneDebe && tieneHaber) || (!tieneDebe && !tieneHaber)) {
            throw new Error(`El renglón ${indice + 1} debe tener un importe solamente en Debe o Haber.`);
        }
        return {
            ...(incluirId ? {
                id: Number(renglon.renglonID) > 0
                    ? numeroRequerido(renglon.renglonID, `El renglón ${indice + 1} no tiene un ID válido.`)
                    : null
            } : {}),
            cuentaId: numeroRequerido(renglon.cuentaID, `El renglón ${indice + 1} no tiene una cuenta válida.`),
            tipo: tieneDebe ? 1 : -1,
            importe: tieneDebe ? debe : haber,
            detalle: renglon.detalle ?? "",
            clienteId: renglon.clienteID ?? null,
            proveedorId: renglon.proveedorID ?? null,
            cajaId: renglon.cajaID ?? null
        };
    });

    if (lineas.length === 0) throw new Error("El asiento debe tener renglones.");
    validarBalanceLineasAsiento(lineas);
    return lineas;
}

function crearPayloadBaseAsiento(estado, incluirIdLineas) {
    const fecha = fechaParaApi(estado.fecha);
    return {
        fecha,
        fechaEmision: fechaParaApi(estado.fechaEmision ?? estado.fecha),
        numeraTipoId: numeroRequerido(estado.numeracion?.numeraTipoID, "La numeración no es válida."),
        numero: estado.numero === "" || estado.numero == null ? null : numeroRequerido(estado.numero, "El número no es válido."),
        empresaId: numeroRequerido(estado.empresa?.empresaID, "La empresa no es válida."),
        monedaId: numeroRequerido(estado.moneda?.monedaID, "La moneda no es válida."),
        cotizacionLocal: numeroRequerido(estado.tipoCambioLocal, "La cotización local no es válida."),
        cotizacionReferencia: numeroRequerido(estado.tipoCambioReferencia, "La cotización de referencia no es válida."),
        detalle: estado.detalle ?? "",
        observaciones: estado.observaciones ?? "",
        lineas: crearLineasPayload(estado, incluirIdLineas)
    };
}

export function crearPayloadActualizacionAsiento(estado) {
    return {
        id: numeroRequerido(estado.comprobanteID, "El comprobante no tiene un ID válido."),
        ...crearPayloadBaseAsiento(estado, true)
    };
}

export function crearPayloadAltaAsiento(estado) {
    return {
        ...crearPayloadBaseAsiento(estado, false),
        puntoVenta: estado.puntoVenta === "" || estado.puntoVenta == null
            ? null
            : numeroRequerido(estado.puntoVenta, "El punto de venta no es válido.")
    };
}

export function crearABMAsientos({
    comprobanteID,
    cargarAsiento,
    actualizarAsiento,
    crearAsiento,
    eliminarAsiento,
    modo = MODO_ABM.CONSULTA
}) {
    if (!esModoAlta(modo) && (!Number.isInteger(Number(comprobanteID)) || Number(comprobanteID) <= 0)) {
        throw new Error("El ABM de Asientos requiere un comprobanteID válido.");
    }
    if (!esModoAlta(modo) && typeof cargarAsiento !== "function") {
        throw new Error("El ABM de Asientos requiere un proveedor de carga.");
    }
    if (!esModoAlta(modo) && typeof actualizarAsiento !== "function") {
        throw new Error("El ABM de Asientos requiere un proveedor de actualización.");
    }
    if (esModoAlta(modo) && typeof crearAsiento !== "function") {
        throw new Error("El ABM de Asientos requiere un proveedor de alta.");
    }
    if (!esModoABM(modo)) {
        throw new Error("El ABM de Asientos requiere un modo válido.");
    }

    let idActivo = esModoAlta(modo) ? null : Number(comprobanteID);
    let modoActivo = modo;
    let proximoRenglonTemporalID = -1;
    let secuenciaCarga = 0;
    let controladorCarga = null;
    let estado = crearEstadoInicial(idActivo, modo);
    let estadoBase = copiar(estado);
    const oyentes = new Set();
    const publicar = cambio => {
        estado = { ...estado, ...cambio };
        oyentes.forEach(oyente => oyente());
    };
    const publicarEdicion = cambio => {
        const siguienteEstado = { ...estado, ...cambio };
        publicar({
            ...cambio,
            modificado: tieneCambiosPersistibles(siguienteEstado, estadoBase),
            errorGuardado: null
        });
    };

    async function cargar(nuevoComprobanteID = idActivo) {
        if (esModoAlta(modoActivo) && (nuevoComprobanteID == null || nuevoComprobanteID === "")) {
            estado = crearEstadoInicial(null, MODO_ABM.ALTA);
            estadoBase = copiar(estado);
            oyentes.forEach(oyente => oyente());
            return;
        }
        const id = Number(nuevoComprobanteID);
        if (!Number.isInteger(id) || id <= 0) {
            publicar({ cargando: false, cargado: false, error: "El comprobante solicitado no es válido." });
            return;
        }

        idActivo = id;
        const secuencia = ++secuenciaCarga;
        controladorCarga?.abort();
        controladorCarga = new AbortController();
        const { signal } = controladorCarga;
        publicar({ cargando: true, error: null });
        try {
            const asiento = await cargarAsiento(id, { signal });
            if (secuencia !== secuenciaCarga || signal?.aborted) return;
            estado = transformarAsientoABM(asiento, id, modoActivo);
            estadoBase = copiar(estado);
            oyentes.forEach(oyente => oyente());
        } catch (error) {
            if (secuencia !== secuenciaCarga || signal?.aborted || error?.name === "AbortError") return;
            publicar({ cargando: false, cargado: false, error: error?.message || "No se pudo cargar el asiento." });
        } finally {
            if (secuencia === secuenciaCarga) controladorCarga = null;
        }
    }

    function cancelarCarga() {
        ++secuenciaCarga;
        controladorCarga?.abort();
        controladorCarga = null;
    }

    return {
        obtenerEstado: () => estado,
        suscribir: oyente => { oyentes.add(oyente); return () => oyentes.delete(oyente); },
        cargar,
        cancelarCarga,
        cambiarModo(nuevoModo) {
            if (!esModoABM(nuevoModo) || nuevoModo === MODO_ABM.ALTA || esModoAlta(modoActivo)) {
                return false;
            }
            modoActivo = nuevoModo;
            publicar({ modo: nuevoModo, errorGuardado: null });
            return true;
        },
        actualizar(campo, valor) {
            if (!Object.hasOwn(estado, campo) || !puedeEditarCampoAsiento(estado.modo, campo)) return;
            publicarEdicion({ [campo]: copiar(valor) });
        },
        actualizarRenglon(renglonID, filaNueva) {
            const cambios = obtenerCambiosPermitidosRenglonAsiento(estado.modo, filaNueva);
            if (Object.keys(cambios).length === 0) return;
            const filaActual = estado.renglones.find(fila => fila.renglonID === renglonID);
            if (!filaActual) return;
            const debeModificado = !Object.is(filaActual.debe, cambios.debe);
            const haberModificado = !Object.is(filaActual.haber, cambios.haber);
            const debeInformado = importeOBlanco(cambios.debe);
            const haberInformado = importeOBlanco(cambios.haber);

            if (debeModificado && !haberModificado && Number.isFinite(debeInformado) && debeInformado !== 0) {
                cambios.haber = null;
            }
            if (haberModificado && !debeModificado && Number.isFinite(haberInformado) && haberInformado !== 0) {
                cambios.debe = null;
            }

            const cambiosCalculados = {};
            if (!Object.is(filaActual.debe, cambios.debe)) {
                cambiosCalculados.debeLocal = null;
                cambiosCalculados.debeReferencia = null;
            }
            if (!Object.is(filaActual.haber, cambios.haber)) {
                cambiosCalculados.haberLocal = null;
                cambiosCalculados.haberReferencia = null;
            }
            publicarEdicion({
                renglones: estado.renglones.map(fila =>
                    fila.renglonID === renglonID
                        ? { ...fila, ...copiar(cambios), ...cambiosCalculados }
                        : fila
                )
            });
        },
        agregarRenglon() {
            if (!esModoEdicion(estado.modo) || estado.guardando || estado.cargando) {
                return null;
            }

            const renglon = {
                renglonID: proximoRenglonTemporalID--,
                empresaID: estado.empresa?.empresaID ?? null,
                cuentaID: null,
                cuentaCodigo: "",
                cuentaNombre: "",
                tipo: 0,
                importe: null,
                impLocal: null,
                impReferencia: null,
                debe: null,
                haber: null,
                debeLocal: null,
                haberLocal: null,
                debeReferencia: null,
                haberReferencia: null,
                detalle: "",
                subcuentaTipo: 0,
                subcuentaNombre: "",
                clienteID: null,
                clienteCodigo: "",
                clienteNombre: "",
                proveedorID: null,
                proveedorCodigo: "",
                proveedorNombre: "",
                cajaID: null,
                cajaCodigo: "",
                cajaNombre: "",
                jurisdiccionID: null,
                jurisdiccionCodigo: "",
                jurisdiccionNombre: "",
                vendedorID: null,
                vendedorCodigo: "",
                vendedorNombre: "",
                cobradorID: null,
                cobradorCodigo: "",
                cobradorNombre: ""
            };

            publicarEdicion({ renglones: [...estado.renglones, renglon] });
            return copiar(renglon);
        },
        eliminarRenglon(renglonID) {
            if (!esModoEdicion(estado.modo) || estado.guardando || estado.cargando) {
                return false;
            }

            const existe = estado.renglones.some(fila => fila.renglonID === renglonID);
            if (!existe) return false;

            publicarEdicion({
                renglones: estado.renglones.filter(fila => fila.renglonID !== renglonID)
            });
            return true;
        },
        async guardar({ recargar = true } = {}) {
            if (!esModoEdicion(estado.modo) || estado.guardando || !estado.modificado) return false;
            const esAlta = esModoAlta(estado.modo);
            let payload;
            try {
                payload = esAlta
                    ? crearPayloadAltaAsiento(estado)
                    : crearPayloadActualizacionAsiento(estado);
            } catch (error) {
                publicar({ errorGuardado: error.message });
                return false;
            }

            publicar({ guardando: true, errorGuardado: null });
            try {
                if (esAlta) {
                    idActivo = Number(await crearAsiento(payload));
                    if (!Number.isInteger(idActivo) || idActivo <= 0) {
                        throw new Error("La API no devolvió el ID del asiento creado.");
                    }
                    modoActivo = MODO_ABM.EDICION;
                } else {
                    await actualizarAsiento(idActivo, payload);
                }
                if (recargar) {
                    await cargar(idActivo);
                    publicar({ guardando: false, modificado: false });
                } else {
                    estado = {
                        ...estado,
                        comprobanteID:idActivo,
                        modo:modoActivo,
                        guardando:false,
                        modificado:false
                    };
                    estadoBase = copiar(estado);
                    oyentes.forEach(oyente => oyente());
                }
                return true;
            } catch (error) {
                publicar({
                    guardando: false,
                    errorGuardado: error?.message || "No se pudo guardar el asiento."
                });
                return false;
            }
        },
        async eliminar() {
            if (esModoAlta(estado.modo) || estado.guardando || estado.cargando) return false;
            if (typeof eliminarAsiento !== "function") {
                publicar({ errorGuardado: "El ABM de Asientos requiere un proveedor de eliminación." });
                return false;
            }

            publicar({ guardando: true, errorGuardado: null });
            try {
                await eliminarAsiento(idActivo);
                publicar({ guardando: false, modificado: false });
                return true;
            } catch (error) {
                publicar({
                    guardando: false,
                    errorGuardado: error?.message || "No se pudo eliminar el asiento."
                });
                return false;
            }
        }
    };
}
