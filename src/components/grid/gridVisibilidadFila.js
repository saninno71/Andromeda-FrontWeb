export function calcularScrollFilaVisible({
    scrollTop,
    scrollMaximo,
    filaSuperior,
    filaInferior,
    limiteSuperior,
    limiteInferior,
    margen = 4
}) {
    let siguiente = scrollTop;

    if (filaSuperior < limiteSuperior + margen) {
        siguiente -= limiteSuperior + margen - filaSuperior;
    } else if (filaInferior > limiteInferior - margen) {
        siguiente += filaInferior - (limiteInferior - margen);
    }

    return Math.min(scrollMaximo, Math.max(0, siguiente));
}

export function calcularScrollIndiceFila({
    indice,
    cantidadFilas,
    altoFila,
    altoViewport,
    scrollActual,
    scrollMaximo
}) {
    if (indice === cantidadFilas - 1) {
        return Math.max(0, scrollMaximo);
    }

    const inicioFila = indice * altoFila;
    const finFila = inicioFila + altoFila;

    if (inicioFila < scrollActual) {
        return Math.max(0, inicioFila);
    }
    if (finFila > scrollActual + altoViewport) {
        return Math.min(scrollMaximo, Math.max(0, finFila - altoViewport));
    }
    return scrollActual;
}
