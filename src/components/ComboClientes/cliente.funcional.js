import { cargarClientes } from "../services/clientesService.js";

export const DEMORA_BUSQUEDA_CLIENTES = 500;

export function formatearCliente(cliente) {
    return cliente ? `${cliente.clienteCodigo} - ${cliente.clienteNombre}` : "";
}

export function puedeBuscarCliente(texto, clienteSeleccionada) {
    return texto.trim().length >= 2 && !clienteSeleccionada;
}

export async function buscarClientes({ texto, valor, signal }) {
    if (!puedeBuscarCliente(texto, valor)) return [];
    return cargarClientes(texto, signal);
}

// El borrador solo pertenece al valor con el que se inició la escritura.
// Una selección o limpieza externa prevalece sobre ese texto local.
export function obtenerTextoCliente(valor, borrador) {
    return Object.is(valor, borrador.valor)
        ? borrador.texto
        : formatearCliente(valor);
}
