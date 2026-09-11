import { cargarProveedores } from "../services/proveedoresService.js";

export const DEMORA_BUSQUEDA_PROVEEDORES = 500;

export function formatearProveedor(proveedor) {
    return proveedor ? `${proveedor.proveedorCodigo} - ${proveedor.proveedorNombre}` : "";
}

export function puedeBuscarProveedor(texto, proveedorSeleccionada) {
    return texto.trim().length >= 2 && !proveedorSeleccionada;
}

export async function buscarProveedores({ texto, empresaID, valor, signal }) {
    if (!puedeBuscarProveedor(texto, valor)) return [];
    return cargarProveedores(texto, empresaID, signal);
}

// El borrador solo pertenece al valor con el que se inició la escritura.
// Una selección o limpieza externa prevalece sobre ese texto local.
export function obtenerTextoProveedor(valor, borrador) {
    return Object.is(valor, borrador.valor)
        ? borrador.texto
        : formatearProveedor(valor);
}
