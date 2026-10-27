const ESTADO_VACIO = "vacio";
const ESTADO_CARGANDO = "cargando";
const ESTADO_CARGADO = "cargado";
const ESTADO_ERROR = "error";

function normalizarEmpresaID(empresaID) {
    const id = Number(empresaID);
    return Number.isInteger(id) && id > 0 ? id : null;
}

function crearEstadoEmpresa(empresaID, estado = ESTADO_VACIO, datos = null, error = null) {
    return {
        empresaID: normalizarEmpresaID(empresaID),
        estado,
        datos,
        error
    };
}

export function crearEstadoEntidadesExternasAsiento(empresaID = null, { cargando = false } = {}) {
    const id = normalizarEmpresaID(empresaID);
    return {
        empresa: crearEstadoEmpresa(
            id,
            id != null && cargando ? ESTADO_CARGANDO : ESTADO_VACIO
        )
    };
}

export async function cargarEntidadesExternasAsiento(
    empresaID,
    { cargarEmpresa, signal } = {}
) {
    const id = normalizarEmpresaID(empresaID);
    if (id == null) return crearEstadoEntidadesExternasAsiento();

    if (typeof cargarEmpresa !== "function") {
        return {
            empresa: crearEstadoEmpresa(
                id,
                ESTADO_ERROR,
                null,
                "No se configuró el proveedor funcional de Empresas."
            )
        };
    }

    try {
        const empresa = await cargarEmpresa(id, { signal });
        if (signal?.aborted) {
            throw new DOMException("La carga de Empresa fue cancelada.", "AbortError");
        }
        return {
            empresa: crearEstadoEmpresa(id, ESTADO_CARGADO, empresa, null)
        };
    } catch (error) {
        if (signal?.aborted || error?.name === "AbortError") throw error;
        return {
            empresa: crearEstadoEmpresa(
                id,
                ESTADO_ERROR,
                null,
                error?.message || "No se pudo cargar la información completa de Empresa."
            )
        };
    }
}

export function validarEntidadesExternasParaImpresionAsiento(estado) {
    const empresaID = normalizarEmpresaID(estado?.empresa?.empresaID);
    if (empresaID == null) return;

    const empresaExterna = estado?.entidadesExternas?.empresa;
    if (empresaExterna?.estado === ESTADO_CARGADO && empresaExterna.datos) return;

    if (empresaExterna?.estado === ESTADO_ERROR) {
        throw new Error(
            empresaExterna.error || "No se pudo cargar la información completa de Empresa para imprimir."
        );
    }

    throw new Error("La información completa de Empresa todavía no está disponible para imprimir.");
}
