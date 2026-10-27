import {
    CENTRAL_INFORMES_API_URL,
    CENTRAL_INFORMES_BASE_DATOS
} from "../../../config/AndromedaFrontConfig.js";
import { crearErrorHttp } from "../../../infraestructura/http/respuestaHttp.js";
import { crearSnapshotLegacyAsiento } from "./abmAsientos.legacyMapping.js";
import { validarEntidadesExternasParaImpresionAsiento } from "./abmAsientos.entidadesExternas.js";

export const PLANTILLA_ASIENTOS_EQ = 18423;

function obtenerSeparador(partes, tipo, valorPredeterminado) {
    return partes.find(parte => parte.type === tipo)?.value ?? valorPredeterminado;
}

function obtenerFormatoFechaCorta(cultura) {
    const partes = new Intl.DateTimeFormat(cultura).formatToParts(new Date(2006, 10, 22));
    return partes.map(parte => {
        if (parte.type === "day") return "dd";
        if (parte.type === "month") return "MM";
        if (parte.type === "year") return "yyyy";
        return parte.value.replace(/[\u200e\u200f]/g, "");
    }).join("");
}

export function obtenerConfiguracionRegionalCliente() {
    const opcionesFecha = Intl.DateTimeFormat().resolvedOptions();
    const cultura = opcionesFecha.locale || globalThis.navigator?.language || "es-AR";
    const partesNumero = new Intl.NumberFormat(cultura).formatToParts(1234567.89);

    return {
        cultura,
        separadorDecimal: obtenerSeparador(partesNumero, "decimal", ","),
        separadorMiles: obtenerSeparador(partesNumero, "group", "."),
        formatoFechaCorta: obtenerFormatoFechaCorta(cultura),
        zonaHoraria: opcionesFecha.timeZone || null
    };
}

function prepararEstadoConFilasPrueba(estado, cantidadMinima) {
    const renglonesOriginales = estado?.renglones ?? [];
    const minimo = Number(cantidadMinima);
    if (
        !Number.isInteger(minimo) ||
        minimo <= renglonesOriginales.length ||
        renglonesOriginales.length === 0
    ) {
        return { estado, diagnostico: null };
    }

    const repeticiones = Math.ceil(minimo / renglonesOriginales.length);
    const renglones = Array.from(
        { length: repeticiones },
        () => renglonesOriginales.map(renglon => ({ ...renglon }))
    ).flat();

    return {
        estado: { ...estado, renglones },
        diagnostico: {
            habilitado: true,
            filasOriginales: renglonesOriginales.length,
            filasEnviadas: renglones.length
        }
    };
}
export async function iniciarOrquestacionImpresionAsiento(
    estado,
    {
        plantillaId = PLANTILLA_ASIENTOS_EQ,
        baseDatos = CENTRAL_INFORMES_BASE_DATOS,
        destino = "vistaPrevia",
        copias = 1,
        debug = false,
        configuracionRegional = obtenerConfiguracionRegionalCliente(),
        filasPrueba = 0,
        signal
    } = {}
) {
    validarEntidadesExternasParaImpresionAsiento(estado);
    const prueba = prepararEstadoConFilasPrueba(
        estado,
        debug ? filasPrueba : 0
    );
    const datosLegacy = crearSnapshotLegacyAsiento(
        prueba.estado,
        { copies: copias }
    );
    if (prueba.diagnostico) {
        datosLegacy.diagnostics.filasPruebaImpresion = prueba.diagnostico;
    }
    const response = await fetch(
        `${CENTRAL_INFORMES_API_URL}/api/impresiones/marquillas/orquestaciones`,
        {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                baseDatos,
                plantillaId,
                comprobanteId: estado.comprobanteID ?? null,
                debug,
                configuracionRegional,
                origen: {
                    aplicacion: "Andromeda React",
                    modulo: "Contabilidad",
                    pantalla: "ABMAsientos"
                },
                salida: { destino, copias },
                datosLegacy
            }),
            signal
        }
    );

    if (!response.ok) {
        throw await crearErrorHttp(
            response,
            `No se pudo iniciar la impresión (${response.status}).`
        );
    }

    return response.json();
}

export async function obtenerVistaPreviaImpresionAsiento(
    operacionId,
    { signal } = {}
) {
    const id = String(operacionId ?? "").trim();
    if (!id) {
        throw new Error("La API no informó el identificador de la impresión.");
    }

    const response = await fetch(
        `${CENTRAL_INFORMES_API_URL}/api/impresiones/marquillas/orquestaciones/${encodeURIComponent(id)}/vista-previa`,
        {
            method: "GET",
            headers: { Accept: "application/pdf" },
            signal
        }
    );

    if (!response.ok) {
        throw await crearErrorHttp(
            response,
            response.status === 404
                ? "La vista previa todavía no está disponible."
                : `No se pudo obtener la vista previa (${response.status}).`
        );
    }

    const archivo = await response.blob();
    return archivo.type === "application/pdf"
        ? archivo
        : new Blob([archivo], { type: "application/pdf" });
}
