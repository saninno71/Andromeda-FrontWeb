import { esCampoRenglonAsientoEditable } from "./abmAsientos.permisos.js";

function convertirImporte(valor, cotizacion) {
    if (valor == null || valor === "") return null;
    const importe = Number(valor);
    const tipoCambio = Number(cotizacion);
    return Number.isFinite(importe) && Number.isFinite(tipoCambio) && tipoCambio > 0
        ? importe / tipoCambio
        : null;
}

export const COLUMNAS_RENGLONES_ASIENTO = [
    { campo: "renglonID", titulo: "ID", key: true, visible: false },
    { campo: "cuentaCodigo", titulo: "Cuenta", ancho: 110 },
    { campo: "cuentaNombre", titulo: "Cuenta nombre", ancho: 220 },
    { campo: "subcuentaNombre", titulo: "Subcuenta nombre", ancho: 190, editable: false },
    { campo: "debe", titulo: "Debe", ancho: 125, formato: "decimal", mascara: "0.0,00", align: "right", suma: true },
    { campo: "haber", titulo: "Haber", ancho: 125, formato: "decimal", mascara: "0.0,00", align: "right", suma: true },
    { campo: "debeLocal", titulo: "Debe en ARS", tipo: "calculada", dependencias: ["debe"], calcular: (fila, contexto) => convertirImporte(fila.debe, contexto?.cotizacionLocal), ancho: 135, formato: "decimal", mascara: "0.0,00", align: "right", suma: true },
    { campo: "haberLocal", titulo: "Haber en ARS", tipo: "calculada", dependencias: ["haber"], calcular: (fila, contexto) => convertirImporte(fila.haber, contexto?.cotizacionLocal), ancho: 135, formato: "decimal", mascara: "0.0,00", align: "right", suma: true },
    { campo: "debeReferencia", titulo: "Debe en U$S", tipo: "calculada", dependencias: ["debe"], calcular: (fila, contexto) => convertirImporte(fila.debe, contexto?.cotizacionReferencia), ancho: 135, formato: "decimal", mascara: "0.0,00", align: "right", suma: true },
    { campo: "haberReferencia", titulo: "Haber en U$S", tipo: "calculada", dependencias: ["haber"], calcular: (fila, contexto) => convertirImporte(fila.haber, contexto?.cotizacionReferencia), ancho: 135, formato: "decimal", mascara: "0.0,00", align: "right", suma: true },
    { campo: "detalle", titulo: "Detalle", ancho: 240 },
    { campo: "clienteCodigo", titulo: "Cliente", ancho: 110 },
    { campo: "clienteNombre", titulo: "Cliente nombre", ancho: 190 },
    { campo: "proveedorCodigo", titulo: "Proveedor", ancho: 110 },
    { campo: "proveedorNombre", titulo: "Proveedor nombre", ancho: 190 },
    { campo: "cajaCodigo", titulo: "Caja", ancho: 100, editable: false },
    { campo: "cajaNombre", titulo: "Caja nombre", ancho: 180, editable: false },
    { campo: "jurisdiccionCodigo", titulo: "Jurisdicción", ancho: 120, editable: false },
    { campo: "jurisdiccionNombre", titulo: "Jurisdicción nombre", ancho: 190, editable: false },
    { campo: "vendedorCodigo", titulo: "Vendedor", ancho: 110, editable: false },
    { campo: "vendedorNombre", titulo: "Vendedor nombre", ancho: 190, editable: false },
    { campo: "cobradorCodigo", titulo: "Cobrador", ancho: 110, editable: false },
    { campo: "cobradorNombre", titulo: "Cobrador nombre", ancho: 190, editable: false }
].map(columna => {
    const base = { visible: true, formato: "texto", align: "left", ...columna };
    const editable = esCampoRenglonAsientoEditable(columna.campo);
    const entidad = /^(cuenta|cliente|proveedor)(Codigo|Nombre)$/.exec(columna.campo);
    if (entidad && editable) {
        const nombre = entidad[1];
        return { ...base, editable: true, editor: nombre, editorConfig: {
            campoID: `${nombre}ID`, atributoVisible: columna.campo,
            campos: { [`${nombre}ID`]: `${nombre}ID`, [`${nombre}Codigo`]: `${nombre}Codigo`, [`${nombre}Nombre`]: `${nombre}Nombre` },
            contexto: { empresaID: "empresaID" }
        }};
    }
    return {
        ...base,
        editable,
        editor: editable
            ? (columna.formato === "decimal" ? "decimal" : "texto")
            : undefined
    };
});
