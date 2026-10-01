import { cargarMonedas } from "../services/monedasService.js";

export const DEMORA_BUSQUEDA_MONEDAS = 150;

export function formatearMoneda(moneda) {
    return moneda ? `(${moneda.monedaCodigo}) ${moneda.monedaNombre}` : "";
}

export function puedeBuscarMoneda(texto, monedaSeleccionada) {
    return texto.trim().length >= 2 && !monedaSeleccionada;
}

export async function buscarMonedas({ texto, valor, signal }) {
    if (!puedeBuscarMoneda(texto, valor)) return [];
    return cargarMonedas(texto, signal);
}

export function obtenerTextoMoneda(valor, borrador) {
    return Object.is(valor, borrador.valor)
        ? borrador.texto
        : formatearMoneda(valor);
}
