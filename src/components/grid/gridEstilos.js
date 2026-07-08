export function obtenerEstiloColumna(columna) {

    return {
        width: columna.ancho + "px",
        minWidth: columna.ancho + "px",
        maxWidth: columna.ancho + "px",
        textAlign: columna.align
    };

}

export function obtenerClaseTextoColumna(columna) {

    if (columna.desdoblarTexto === true) {
        return "celdaTextoDesdoblado";
    }

    return "celdaTextoCortado";

}

export function obtenerClaseFilaGrid({
    indiceFila,
    keyFila,
    keysSeleccionadasSet
}) {

    if (keysSeleccionadasSet.has(keyFila)) {
        return "filaSeleccionada";
    }

    if (indiceFila % 2 === 0) {
        return "fila-par";
    }

    return "fila-impar";

}

export function obtenerClaseFilaMenu({
    fila,
    filaSeleccionada
}) {

    if (fila === filaSeleccionada) {
        return "filaMenuActiva";
    }

    return "";

}
