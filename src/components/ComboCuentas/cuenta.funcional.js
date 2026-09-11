import { cargarCuentas } from "../services/cuentasService.js";

export const DEMORA_BUSQUEDA_CUENTAS = 500;

export function formatearCuenta(cuenta) {
    return cuenta ? `${cuenta.cuentaCodigo} - ${cuenta.cuentaNombre}` : "";
}

export function puedeBuscarCuenta(texto, cuentaSeleccionada) {
    return texto.trim().length >= 2 && !cuentaSeleccionada;
}

export async function buscarCuentas({ texto, empresaID, valor, signal }) {
    if (!puedeBuscarCuenta(texto, valor)) return [];
    return cargarCuentas(texto, empresaID, signal);
}

// El borrador solo pertenece al valor con el que se inició la escritura.
// Una selección o limpieza externa prevalece sobre ese texto local.
export function obtenerTextoCuenta(valor, borrador) {
    return Object.is(valor, borrador.valor)
        ? borrador.texto
        : formatearCuenta(valor);
}
