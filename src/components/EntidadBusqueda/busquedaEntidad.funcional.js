export function crearBorradorDesdeValor(valor, formatear) {
    return {
        valor,
        texto:formatear(valor),
        origen:"valor"
    };
}

export function crearBorradorDesdeEscritura(texto) {
    return {
        valor:null,
        texto,
        origen:"usuario"
    };
}

export function esBusquedaIniciadaPorUsuario(borrador) {
    return borrador?.origen === "usuario";
}
