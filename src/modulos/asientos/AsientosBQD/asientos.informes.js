import { crearColumnasAsientosBQD } from "./asientosBQD.columnas.js";
import { MODO_ABM } from "../../../components/ABM/modosABM.js";
import {
    aplicarLayoutColumnasInforme,
    prepararFilasInformeBQD
} from "../../../components/InformesBQD/informeBQD.funcional.js";
import { crearModeloABMAsientos } from "../AsientosABM/abmAsientos.modulos.js";
import { COLUMNAS_RENGLONES_ASIENTO } from "../AsientosABM/abmAsientos.columnas.js";

const CONCURRENCIA_DETALLES_DEFAULT = 4;

// Punto de entrada para la futura Central de Informes. No lee controles ni DOM.
export function prepararInformeAsientos(modelo, opciones) {
    return modelo.prepararDatosInforme(opciones);
}

function formatearFechaFiltro(fecha) {
    if (!fecha) return "";
    const valor = fecha instanceof Date ? fecha : new Date(fecha);
    return Number.isNaN(valor.getTime()) ? "" : valor.toLocaleDateString("es-AR");
}

function describirEntidad(entidad, campoCodigo, campoNombre) {
    if (!entidad) return "";
    return [entidad[campoCodigo], entidad[campoNombre]].filter(Boolean).join(" - ");
}

export function describirFiltrosInformeAsientos(filtros = {}) {
    return [
        ["Desde fecha", formatearFechaFiltro(filtros.fechaDesde)],
        ["Hasta fecha", formatearFechaFiltro(filtros.fechaHasta)],
        ["Empresa", filtros.empresaSeleccionada?.empresaNombre],
        ["Cuenta", describirEntidad(filtros.cuentaSeleccionada, "cuentaCodigo", "cuentaNombre")],
        ["Detalle", filtros.detalle],
        ["Cliente", describirEntidad(filtros.clienteSeleccionado, "clienteCodigo", "clienteNombre")],
        ["Proveedor", describirEntidad(filtros.proveedorSeleccionado, "proveedorCodigo", "proveedorNombre")],
        ["Caja bancaria", filtros.cajaBancaria],
        ["Numeración", filtros.numeraTipoSeleccionado?.descripcion],
        ["Desde número", filtros.numeroDesde],
        ["Hasta número", filtros.numeroHasta]
    ]
        .filter(([, valor]) => valor !== null && valor !== undefined && valor !== "")
        .map(([titulo, valor]) => `${titulo}: ${valor}`)
        .join(" | ");
}

function crearErrorCancelacion() {
    return new DOMException("La preparación del informe fue cancelada.", "AbortError");
}

function verificarCancelacion(signal) {
    if (signal?.aborted) throw crearErrorCancelacion();
}

async function cargarDetalleAsientoConModelo(comprobanteID, { signal } = {}) {
    verificarCancelacion(signal);
    const modelo = crearModeloABMAsientos(comprobanteID, MODO_ABM.CONSULTA);
    const cancelar = () => modelo.cancelarCarga();
    signal?.addEventListener("abort", cancelar, { once:true });
    try {
        await modelo.cargar();
        verificarCancelacion(signal);
        const estado = modelo.obtenerEstado();
        if (!estado.cargado || estado.error) {
            throw new Error(estado.error || `No se pudo cargar el asiento ${comprobanteID}.`);
        }
        return estado;
    } finally {
        signal?.removeEventListener("abort", cancelar);
    }
}

async function mapearConConcurrencia(valores, limite, operacion) {
    const resultados = new Array(valores.length);
    let siguiente = 0;
    const cantidad = Math.max(1, Math.min(Number(limite) || 1, valores.length));
    const ejecutar = async () => {
        while (siguiente < valores.length) {
            const indice = siguiente++;
            resultados[indice] = await operacion(valores[indice], indice);
        }
    };
    await Promise.all(Array.from({ length:cantidad }, ejecutar));
    return resultados;
}

function crearSubgrillaDetalleAsiento(estado) {
    return {
        titulo:"Detalle del asiento",
        columnas:COLUMNAS_RENGLONES_ASIENTO,
        filas:estado.renglones,
        contextoCalculos:{
            cotizacionLocal:estado.tipoCambioLocal,
            cotizacionReferencia:estado.tipoCambioReferencia
        },
        mostrarTotales:true
    };
}

async function cargarSubgrillasAsientos(filas, {
    cargarDetalleAsiento = cargarDetalleAsientoConModelo,
    concurrenciaDetalles = CONCURRENCIA_DETALLES_DEFAULT,
    signal
} = {}) {
    const ids = [...new Set(filas
        .map(fila => Number(fila?.comprobanteID))
        .filter(id => Number.isInteger(id) && id > 0))];
    const estados = await mapearConConcurrencia(ids, concurrenciaDetalles, id => {
        verificarCancelacion(signal);
        return cargarDetalleAsiento(id, { signal });
    });
    return new Map(ids.map((id, indice) => [id, crearSubgrillaDetalleAsiento(estados[indice])]));
}

export async function prepararParametrosInformeAsientos(
    modelo,
    {
        layoutColumnas = [],
        incluirDetalle = true,
        cargarDetalleAsiento,
        concurrenciaDetalles = CONCURRENCIA_DETALLES_DEFAULT,
        ...opcionesDatos
    } = {}
) {
    const informe = await prepararInformeAsientos(modelo, opcionesDatos);
    const columnas = crearColumnasAsientosBQD();
    let filas = informe.filas;

    if (incluirDetalle) {
        const columnasPresentadas = aplicarLayoutColumnasInforme(columnas, layoutColumnas);
        const filasPresentadas = prepararFilasInformeBQD({
            filas:informe.filas,
            columnas:columnasPresentadas,
            busqueda:informe.vista.busqueda,
            orden:informe.vista.orden
        });
        const subgrillasPorID = await cargarSubgrillasAsientos(filasPresentadas, {
            cargarDetalleAsiento,
            concurrenciaDetalles,
            signal:opcionesDatos.signal
        });
        filas = informe.filas.map(fila => {
            const subgrilla = subgrillasPorID.get(Number(fila?.comprobanteID));
            return subgrilla ? { ...fila, subgrillas:[subgrilla] } : fila;
        });
    }

    return {
        titulo:"Asientos",
        columnas,
        layoutColumnas,
        filas,
        filtros:describirFiltrosInformeAsientos(informe.filtrosAplicados),
        busqueda:informe.vista.busqueda,
        orden:informe.vista.orden,
        generadoEn:informe.generadoEn
    };
}
