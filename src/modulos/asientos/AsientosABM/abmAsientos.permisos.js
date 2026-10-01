import { esModoAlta, esModoEdicion } from "../../../components/ABM/modosABM.js";

export const CAMPOS_EDITABLES_ASIENTO = Object.freeze([
    "empresa",
    "fecha",
    "detalle",
    "moneda",
    "numeracion",
    "observaciones"
]);

export const CAMPOS_EDITABLES_RENGLON_ASIENTO = Object.freeze([
    "cuentaID",
    "cuentaCodigo",
    "cuentaNombre",
    "debe",
    "haber",
    "detalle"
]);

const camposAsiento = new Set(CAMPOS_EDITABLES_ASIENTO);
const camposRenglon = new Set(CAMPOS_EDITABLES_RENGLON_ASIENTO);

export function puedeEditarCampoAsiento(modo, campo) {
    return esModoEdicion(modo) && (
        camposAsiento.has(campo) ||
        (esModoAlta(modo) && (campo === "puntoVenta" || campo === "numero"))
    );
}

export function puedeEditarCampoRenglonAsiento(modo, campo) {
    return esModoEdicion(modo) && camposRenglon.has(campo);
}

export function esCampoRenglonAsientoEditable(campo) {
    return camposRenglon.has(campo);
}

export function obtenerCambiosPermitidosRenglonAsiento(modo, fila) {
    if (!esModoEdicion(modo) || !fila) return {};

    return Object.fromEntries(
        CAMPOS_EDITABLES_RENGLON_ASIENTO
            .filter(campo => Object.hasOwn(fila, campo))
            .map(campo => [campo, fila[campo]])
    );
}
