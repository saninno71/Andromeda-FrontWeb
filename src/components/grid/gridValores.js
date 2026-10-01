export function esColumnaCalculada(columna) {
    return columna?.tipo === "calculada";
}

export function obtenerValorColumna(fila, columna, contextoCalculos) {
    const valorInformado = fila?.[columna.campo];

    if (!esColumnaCalculada(columna) || valorInformado != null) {
        return valorInformado;
    }

    return typeof columna.calcular === "function"
        ? columna.calcular(fila, contextoCalculos)
        : valorInformado;
}

export function aplicarDependenciasColumnasCalculadas({
    filaOriginal,
    filaDraft,
    columnas
}) {
    const siguiente = { ...filaDraft };

    columnas
        .filter(esColumnaCalculada)
        .forEach(columna => {
            const dependencias = Array.isArray(columna.dependencias)
                ? columna.dependencias
                : [];
            const algunaDependenciaCambio = dependencias.some(campo =>
                !Object.is(filaOriginal?.[campo], filaDraft?.[campo])
            );

            if (algunaDependenciaCambio) {
                siguiente[columna.campo] = null;
                return;
            }

            if (Object.hasOwn(filaOriginal ?? {}, columna.campo)) {
                siguiente[columna.campo] = filaOriginal[columna.campo];
            } else {
                delete siguiente[columna.campo];
            }
        });

    return siguiente;
}
