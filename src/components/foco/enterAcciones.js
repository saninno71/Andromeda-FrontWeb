export function crearManejadorEnterPorTabIndex(tabIndexesPermitidos,accion) {

    return crearManejadorEnterPermitido({
        tabIndexesPermitidos,
        accion
    });

}

export function crearManejadorEnterPermitido({
    tabIndexesPermitidos = [],
    selectoresPermitidos = [],
    accion
}) {

    const tabIndexes =
        new Set(
            tabIndexesPermitidos.map(Number)
        );

    return function manejarEnter(evento) {

        if (evento.key !== "Enter") {
            return;
        }

        const tabIndexActual =
            Number(evento.target?.tabIndex);
        const estaEnSelectorPermitido =
            selectoresPermitidos.some(selector =>
                evento.target?.closest?.(selector)
            );

        if (
            !tabIndexes.has(tabIndexActual) &&
            !estaEnSelectorPermitido
        ) {
            return;
        }

        if (evento.target?.tagName === "BUTTON") {
            return;
        }

        window.setTimeout(() => {
            accion?.();
        },0);

    };

}
