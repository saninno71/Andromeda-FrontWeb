import { cargarEmpresas } from "../services/empresasService.js";

export function formatearEmpresa(empresa) {
    return empresa?.empresaNombre || "";
}

export async function obtenerEmpresas() {
    return cargarEmpresas();
}
