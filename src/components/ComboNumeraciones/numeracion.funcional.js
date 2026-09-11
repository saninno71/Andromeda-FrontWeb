import { cargarNumeraciones } from "../services/numeracionService.js";

export function formatearNumeracion(numeracion) {
    return numeracion?.descripcion || "";
}

export async function obtenerNumeraciones() {
    return cargarNumeraciones();
}
