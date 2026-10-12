import { filtrarDatosPorTexto } from "../grid/gridBusqueda.js";
import { ordenarDatos } from "../grid/gridOrdenamiento.js";

const ANCHO_LINEA_DEFAULT = 1250;

function anchoColumna(columna) {
    const ancho = Number(columna?.ancho);
    return Number.isFinite(ancho) && ancho > 0 ? ancho : 100;
}

export function aplicarLayoutColumnasInforme(columnas = [], layout = []) {
    const porCampo = new Map(columnas.map(columna => [columna.campo, columna]));
    const incorporadas = new Set();
    const ordenadas = [];

    if (Array.isArray(layout)) {
        layout.forEach(configuracion => {
            const columna = porCampo.get(configuracion.campo);
            if (!columna || incorporadas.has(columna.campo)) return;
            ordenadas.push({
                ...columna,
                ancho:anchoColumna(configuracion)
            });
            incorporadas.add(columna.campo);
        });
    }

    columnas.forEach(columna => {
        if (incorporadas.has(columna.campo)) return;
        ordenadas.push({ ...columna, ancho:anchoColumna(columna) });
    });

    return ordenadas.filter(columna => columna.visible !== false);
}

export function agruparColumnasInforme(columnas = [], anchoLinea = ANCHO_LINEA_DEFAULT) {
    const lineas = [];
    let linea = [];
    let anchoAcumulado = 0;

    columnas.forEach(columna => {
        const ancho = anchoColumna(columna);
        if (linea.length > 0 && anchoAcumulado + ancho > anchoLinea) {
            lineas.push(linea);
            linea = [];
            anchoAcumulado = 0;
        }
        linea.push({ ...columna, ancho });
        anchoAcumulado += ancho;
    });

    if (linea.length > 0) lineas.push(linea);
    return lineas;
}

export function prepararFilasInformeBQD({ filas = [], columnas = [], busqueda = "", orden = [] }) {
    const filtradas = filtrarDatosPorTexto(filas, columnas, busqueda);
    return ordenarDatos(filtradas, orden, columnas);
}
