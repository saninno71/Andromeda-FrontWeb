import { API_URL } from "../../../config/AndromedaFrontConfig.js";

async function obtenerMensajeError(response) {
    try {
        const error = await response.json();
        return error.detail ?? error.mensaje ?? error.title;
    } catch {
        return null;
    }
}

export async function cargarAsientoPorId(comprobanteID, { signal } = {}) {
    const response = await fetch(
        `${API_URL}/api/contabilidad/asientos/${encodeURIComponent(comprobanteID)}`,
        { method: "GET", headers: { Accept: "application/json" }, signal }
    );

    if (!response.ok) {
        const detalle = await obtenerMensajeError(response);
        throw new Error(detalle || `No se pudo cargar el asiento (${response.status}).`);
    }

    return response.json();
}

export async function actualizarAsientoPorId(comprobanteID, datos, { signal } = {}) {
    const response = await fetch(
        `${API_URL}/api/contabilidad/asientos/${encodeURIComponent(comprobanteID)}`,
        {
            method: "PUT",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify(datos),
            signal
        }
    );

    if (!response.ok) {
        const detalle = await obtenerMensajeError(response);
        throw new Error(detalle || `No se pudo guardar el asiento (${response.status}).`);
    }
}

export async function eliminarAsientoPorId(comprobanteID, { signal } = {}) {
    const response = await fetch(
        `${API_URL}/api/contabilidad/asientos/${encodeURIComponent(comprobanteID)}`,
        {
            method: "DELETE",
            headers: { Accept: "application/json" },
            signal
        }
    );

    if (!response.ok) {
        const detalle = await obtenerMensajeError(response);
        throw new Error(detalle || `No se pudo eliminar el asiento (${response.status}).`);
    }
}

export async function crearAsiento(datos, { signal } = {}) {
    const response = await fetch(
        `${API_URL}/api/contabilidad/asientos`,
        {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify(datos),
            signal
        }
    );

    if (!response.ok) {
        const detalle = await obtenerMensajeError(response);
        throw new Error(detalle || `No se pudo crear el asiento (${response.status}).`);
    }

    return response.json();
}
