import { crearABMAsientos } from "./abmAsientos.funcional.js";
import {
    actualizarAsientoPorId,
    cargarAsientoPorId,
    crearAsiento,
    eliminarAsientoPorId
} from "./abmAsientosService.js";
import { crearModeloABMEmpresas } from "../../empresas/EmpresasABM/abmEmpresas.modulos.js";

async function cargarEmpresaDesdeModelo(empresaID, { signal } = {}) {
    const modeloEmpresa = crearModeloABMEmpresas(empresaID);
    const cancelar = () => modeloEmpresa.cancelarCarga();
    signal?.addEventListener("abort", cancelar, { once: true });

    try {
        if (signal?.aborted) {
            throw new DOMException("La carga de Empresa fue cancelada.", "AbortError");
        }
        await modeloEmpresa.cargar();
        if (signal?.aborted) {
            throw new DOMException("La carga de Empresa fue cancelada.", "AbortError");
        }

        const estadoEmpresa = modeloEmpresa.obtenerEstado();
        if (!estadoEmpresa.cargado || !estadoEmpresa.empresa) {
            throw new Error(estadoEmpresa.error || `No se pudo cargar la empresa ${empresaID}.`);
        }
        return estadoEmpresa.empresa;
    } finally {
        signal?.removeEventListener("abort", cancelar);
        modeloEmpresa.destruir();
    }
}

export function crearModeloABMAsientos(comprobanteID, modo) {
    return crearABMAsientos({
        comprobanteID,
        modo,
        cargarAsiento: cargarAsientoPorId,
        actualizarAsiento: actualizarAsientoPorId,
        crearAsiento,
        eliminarAsiento: eliminarAsientoPorId,
        cargarEmpresaDetalle: cargarEmpresaDesdeModelo
    });
}
