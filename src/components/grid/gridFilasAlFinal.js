export function separarFilasAlFinal(dataGrid, filasAlFinal, obtenerClave) {
    const clavesAlFinal = new Set(filasAlFinal.map(obtenerClave));

    return dataGrid.reduce((resultado, fila) => {
        const destino = clavesAlFinal.has(obtenerClave(fila))
            ? resultado.alFinal
            : resultado.base;
        destino.push(fila);
        return resultado;
    }, { base:[], alFinal:[] });
}
