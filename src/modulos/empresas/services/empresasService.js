import { API_URL } from "../../../config/AndromedaFrontConfig.js";
import empresas from "../mocks/empresas.json";

export function construirRutaEmpresas() {
    return `${API_URL}/api/general/empresas`;
}

export function construirRutaEmpresaPorId(empresaID) {
    return `${construirRutaEmpresas()}/${encodeURIComponent(empresaID)}`;
}

function crearErrorCancelacion() {
    return new DOMException("La carga de empresas fue cancelada.", "AbortError");
}

function validarCancelacion(signal) {
    if (signal?.aborted) throw crearErrorCancelacion();
}

export async function cargarEmpresas({ signal } = {}) {
    validarCancelacion(signal);

    // Contrato temporal de GET /api/general/empresas.
    // El listado y el detalle utilizan la misma fuente simulada.
    await Promise.resolve();
    validarCancelacion(signal);

    return structuredClone(empresas);
}

export async function cargarEmpresaPorId(empresaID, { signal } = {}) {
    const id = Number(empresaID);
    if (!Number.isInteger(id) || id <= 0) {
        throw new Error("La empresa solicitada no tiene un ID válido.");
    }

    validarCancelacion(signal);

    // Contrato temporal de GET /api/general/empresas/{id}.
    // Cuando exista el endpoint, solamente se reemplaza esta lectura simulada.
    await Promise.resolve();
    validarCancelacion(signal);

    const empresa = empresas.find(item => Number(item.empresaID) === id);
    if (!empresa) {
        throw new Error(`No se encontró la empresa ${id}.`);
    }

    return structuredClone(empresa);
}
