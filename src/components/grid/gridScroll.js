export function crearScrollGrid({
    refGrillaDatos,
    refGrillaHeader,
    refGrillaTotales,
    refScrollHorizontal,
    refScrollVertical,
    columnasParaMostrar,
    mostrarCheck,
    anchoColumnaCheck,
    anchoEspacioFinal,
    anchoScrollVertical,
    onOcultarMenuFila
}) {

    function calcularAnchoTotalGrilla() {

        let ancho = 0;

        if (mostrarCheck) {
            ancho += anchoColumnaCheck;
        }

        columnasParaMostrar.forEach(columna => {
            ancho += columna.ancho;
        });

        return ancho;

    }

    const anchoContenidoScrollHorizontal =
        calcularAnchoTotalGrilla() +
        anchoEspacioFinal +
        anchoScrollVertical;

    function sincronizarDesdeScrollHorizontal() {

        const scrollLeft =
            refScrollHorizontal.current?.scrollLeft ?? 0;

        if (refGrillaDatos.current) {
            refGrillaDatos.current.scrollLeft = scrollLeft;
        }

        if (refGrillaHeader.current) {
            refGrillaHeader.current.scrollLeft = scrollLeft;
        }

        if (refGrillaTotales.current) {
            refGrillaTotales.current.scrollLeft = scrollLeft;
        }

    }

    function sincronizarDesdeScrollVertical() {

        const scrollTop =
            refScrollVertical.current?.scrollTop ?? 0;

        if (refGrillaDatos.current) {
            refGrillaDatos.current.scrollTop = scrollTop;
            onOcultarMenuFila?.();
        }

    }

    function sincronizarDesdeGrillaDatos() {

        const scrollTop =
            refGrillaDatos.current?.scrollTop ?? 0;

        const scrollLeft =
            refGrillaDatos.current?.scrollLeft ?? 0;

        if (refScrollVertical.current) {
            refScrollVertical.current.scrollTop = scrollTop;
        }

        if (refScrollHorizontal.current) {
            refScrollHorizontal.current.scrollLeft = scrollLeft;
        }

        if (refGrillaHeader.current) {
            refGrillaHeader.current.scrollLeft = scrollLeft;
        }

        if (refGrillaTotales.current) {
            refGrillaTotales.current.scrollLeft = scrollLeft;
        }

    }

    return {
        anchoContenidoScrollHorizontal,
        sincronizarDesdeScrollHorizontal,
        sincronizarDesdeScrollVertical,
        sincronizarDesdeGrillaDatos
    };

}
