export function crearResizeColumnas({
    columnasVisibles,
    setColumnasOrdenadas,
    anchoMinimoColumna
}) {

    function iniciarResizeColumna(columna,e) {

        const xInicial = e.clientX;
        const anchoInicial = columna.ancho;

        function manejarMovimiento(event) {

            const nuevoAncho =
                Math.max(
                    anchoMinimoColumna,
                    anchoInicial + event.clientX - xInicial
                );

            setColumnasOrdenadas(columnasActuales =>
                columnasActuales.map(columnaActual =>
                    columnaActual.campo === columna.campo
                        ? {
                            ...columnaActual,
                            ancho:nuevoAncho
                        }
                        : columnaActual
                )
            );

        }

        function terminarResize() {

            window.removeEventListener(
                "pointermove",
                manejarMovimiento
            );

            window.removeEventListener(
                "pointerup",
                terminarResize
            );

        }

        window.addEventListener(
            "pointermove",
            manejarMovimiento
        );

        window.addEventListener(
            "pointerup",
            terminarResize
        );

    }

    function alternarAnchoColumna(columna) {

        const columnaDefault =
            columnasVisibles.find(
                columnaVisible =>
                    columnaVisible.campo === columna.campo
            );

        if (!columnaDefault) {
            return;
        }

        const estaEnDefault =
            Math.abs(columna.ancho - columnaDefault.ancho) <= 1;

        const nuevoAncho =
            estaEnDefault
                ? anchoMinimoColumna
                : columnaDefault.ancho;

        setColumnasOrdenadas(columnasActuales =>
            columnasActuales.map(columnaActual =>
                columnaActual.campo === columna.campo
                    ? {
                        ...columnaActual,
                        ancho:nuevoAncho
                    }
                    : columnaActual
            )
        );

    }

    return {
        iniciarResizeColumna,
        alternarAnchoColumna
    };

}
