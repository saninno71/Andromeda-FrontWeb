export function crearNavegacionGrid({
    refGrilla,
    refGrillaDatos,
    refScrollVertical,
    refScrollHorizontal,
    dataOrdenada,
    columnasParaMostrar,
    sincronizarDesdeScrollVertical,
    sincronizarDesdeScrollHorizontal,
    sincronizarDesdeGrillaDatos
}) {

    function obtenerCeldaDatos(indiceFila,indiceColumna) {

        return refGrillaDatos.current?.querySelector(
            `[data-grid-row="${indiceFila}"][data-grid-col="${indiceColumna}"]`
        );

    }

    function obtenerCheckFila(indiceFila) {

        return refGrillaDatos.current?.querySelector(
            `[data-grid-check-row="${indiceFila}"]`
        );

    }

    function enfocarCelda(celda) {

        if (!celda) {
            return;
        }

        celda.focus();
        celda.scrollIntoView({
            block:"nearest",
            inline:"nearest"
        });
        sincronizarDesdeGrillaDatos();

    }

    function enfocarCeldaPorDesplazamiento(celdaActual,filas,columnas) {

        const indiceFila =
            Number(celdaActual.dataset.gridRow);
        const indiceColumna =
            Number(celdaActual.dataset.gridCol);
        const proximaFila =
            Math.min(
                dataOrdenada.length - 1,
                Math.max(0,indiceFila + filas)
            );
        const proximaColumna =
            Math.min(
                columnasParaMostrar.length - 1,
                Math.max(0,indiceColumna + columnas)
            );

        enfocarCelda(
            obtenerCeldaDatos(
                proximaFila,
                proximaColumna
            )
        );

    }

    function manejarRuedaMouse(e) {

        e.preventDefault();

        const celdaActiva =
            document.activeElement?.closest?.(".grillaCeldaDatos");

        if (celdaActiva) {
            const direccion =
                e.deltaY > 0
                    ? 1
                    : -1;

            enfocarCeldaPorDesplazamiento(
                celdaActiva,
                direccion,
                0
            );
            return;
        }

        if (refScrollVertical.current) {
            refScrollVertical.current.scrollTop += e.deltaY * 0.3;
            sincronizarDesdeScrollVertical();
        }

    }

    function manejarTeclaScroll(e) {

        if (hayControlDesplegado()) {
            return;
        }

        const checkActivo =
            e.target?.closest?.("[data-grid-check-row]");
        const celdaActiva =
            e.target?.closest?.(".grillaCeldaDatos");

        if (checkActivo) {
            const indiceFila =
                Number(checkActivo.dataset.gridCheckRow);

            if (e.key === "ArrowUp") {
                e.preventDefault();
                enfocarCelda(
                    obtenerCheckFila(
                        Math.max(0,indiceFila - 1)
                    )
                );
                return;
            }

            if (e.key === "ArrowDown") {
                e.preventDefault();
                enfocarCelda(
                    obtenerCheckFila(
                        Math.min(
                            dataOrdenada.length - 1,
                            indiceFila + 1
                        )
                    )
                );
                return;
            }

            if (e.key === "ArrowRight") {
                e.preventDefault();
                enfocarCelda(
                    obtenerCeldaDatos(indiceFila,0)
                );
                return;
            }

            if (e.key === "ArrowLeft") {
                e.preventDefault();
                return;
            }
        }

        if (celdaActiva) {
            const indiceFila =
                Number(celdaActiva.dataset.gridRow);
            const indiceColumna =
                Number(celdaActiva.dataset.gridCol);

            if (e.key === "ArrowUp") {
                e.preventDefault();
                enfocarCeldaPorDesplazamiento(celdaActiva,-1,0);
                return;
            }

            if (e.key === "ArrowDown") {
                e.preventDefault();
                enfocarCeldaPorDesplazamiento(celdaActiva,1,0);
                return;
            }

            if (e.key === "ArrowLeft") {
                e.preventDefault();
                if (indiceColumna === 0) {
                    enfocarCelda(
                        obtenerCheckFila(indiceFila)
                    );
                    return;
                }
                enfocarCeldaPorDesplazamiento(celdaActiva,0,-1);
                return;
            }

            if (e.key === "ArrowRight") {
                e.preventDefault();
                enfocarCeldaPorDesplazamiento(celdaActiva,0,1);
                return;
            }
        }

        const desplazamientoVertical = 32;
        const desplazamientoHorizontal = 48;

        if (e.key === "ArrowUp") {
            e.preventDefault();
            if (!refScrollVertical.current) {
                return;
            }
            refScrollVertical.current.scrollTop -= desplazamientoVertical;
            sincronizarDesdeScrollVertical();
            return;
        }

        if (e.key === "ArrowDown") {
            e.preventDefault();
            if (!refScrollVertical.current) {
                return;
            }
            refScrollVertical.current.scrollTop += desplazamientoVertical;
            sincronizarDesdeScrollVertical();
            return;
        }

        if (e.key === "ArrowLeft") {
            e.preventDefault();
            if (!refScrollHorizontal.current) {
                return;
            }
            refScrollHorizontal.current.scrollLeft -= desplazamientoHorizontal;
            sincronizarDesdeScrollHorizontal();
            return;
        }

        if (e.key === "ArrowRight") {
            e.preventDefault();
            if (!refScrollHorizontal.current) {
                return;
            }
            refScrollHorizontal.current.scrollLeft += desplazamientoHorizontal;
            sincronizarDesdeScrollHorizontal();
        }

    }

    function esFlechaNavegacion(key) {

        return (
            key === "ArrowUp" ||
            key === "ArrowDown" ||
            key === "ArrowLeft" ||
            key === "ArrowRight"
        );

    }

    function estaEditandoControl(elemento) {

        if (!elemento) {
            return false;
        }

        const selectorEditable =
            "input, textarea, select, [contenteditable='true']";

        return Boolean(
            elemento.closest?.(selectorEditable)
        );

    }

    function hayControlDesplegado() {

        return Boolean(
            document.querySelector(
                [
                    ".inputComboLista",
                    ".inputComboBusquedaLista",
                    ".react-datepicker",
                    ".react-datepicker-popper"
                ].join(", ")
            )
        );

    }

    function manejarTeclaGlobal(e) {

        if (!esFlechaNavegacion(e.key)) {
            return;
        }

        if (refGrilla.current?.contains?.(e.target)) {
            return;
        }

        if (
            estaEditandoControl(e.target) ||
            hayControlDesplegado()
        ) {
            return;
        }

        manejarTeclaScroll(e);

    }

    return {
        manejarRuedaMouse,
        manejarTeclaScroll,
        manejarTeclaGlobal
    };

}
