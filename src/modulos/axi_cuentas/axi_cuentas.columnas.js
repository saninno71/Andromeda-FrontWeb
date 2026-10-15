import {
    COLUMNAS_VTS_PEDIDOS_TOTALES_UNIDAD,
    COLUMNAS_VTS_PEDIDOS_VISIBLES
} from "./axi_cuentas.legacy.js";

function prepararColumnas(columnas, indiceGrilla) {
    return columnas.map(columna => ({
        ...columna,
        mascara:columna.mascara ?? (columna.formato === "decimal" ? "0.0,00" : undefined),
        visible:true,
        ordenDefault:"",
        direccionDefault:"",
        desdoblarTexto:false,
        legacy:{ nombre:"grd", indice:indiceGrilla, columna:columna.indice }
    }));
}

export const columnasPedidoPrueba = prepararColumnas(COLUMNAS_VTS_PEDIDOS_VISIBLES, 0);

export const columnasTotalesUnidadPrueba = prepararColumnas(COLUMNAS_VTS_PEDIDOS_TOTALES_UNIDAD, 3);
