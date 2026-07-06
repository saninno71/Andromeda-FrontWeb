import { useCallback,useEffect,useMemo,useReducer,useRef } from "react";

function aplicarLayoutColumnas(columnasVisibles,layout) {

    if (!layout) {
        return columnasVisibles;
    }

    const columnasPorCampo =
        new Map(
            columnasVisibles.map(columna => [
                columna.campo,
                columna
            ])
        );

    const columnasLayout =
        layout
        .map(columnaLayout => {
            const columnaBase =
                columnasPorCampo.get(columnaLayout.campo);

            if (!columnaBase) {
                return null;
            }

            return {
                ...columnaBase,
                ancho:
                    columnaLayout.ancho ??
                    columnaBase.ancho
            };
        })
        .filter(Boolean);

    const camposLayout =
        new Set(
            columnasLayout.map(columna => columna.campo)
        );

    const columnasNuevas =
        columnasVisibles.filter(
            columna => !camposLayout.has(columna.campo)
        );

    return [
        ...columnasLayout,
        ...columnasNuevas
    ];

}

export function useGridColumnas({
    columnasVisibles,
    layoutColumnas,
    layoutVersion,
    onLayoutChange
}) {

    function reducirColumnas(columnasActuales,accion) {

        if (accion.tipo === "actualizar") {
            return typeof accion.actualizacion === "function"
                ? accion.actualizacion(columnasActuales)
                : accion.actualizacion;
        }

        if (accion.tipo === "sincronizar") {
            const camposActuales =
                columnasActuales.map(columna => columna.campo);
            const camposNuevos =
                accion.columnasVisibles.map(columna => columna.campo);
            const mismosCampos =
                camposActuales.length === camposNuevos.length &&
                camposActuales.every(campo =>
                    camposNuevos.includes(campo)
                );

            if (mismosCampos) {
                return columnasActuales;
            }

            return accion.columnasVisibles;
        }

        if (accion.tipo === "aplicarLayout") {
            return aplicarLayoutColumnas(
                accion.columnasVisibles,
                accion.layoutColumnas
            );
        }

        return columnasActuales;

    }

    const [columnasOrdenadas,dispatchColumnas] =
        useReducer(reducirColumnas,columnasVisibles);
    const columnasVisiblesRef = useRef(columnasVisibles);
    const layoutColumnasRef = useRef(layoutColumnas);

    const setColumnasOrdenadas = useCallback((actualizacion) => {
        dispatchColumnas({
            tipo:"actualizar",
            actualizacion
        });
    }, []);

    useEffect(() => {

        columnasVisiblesRef.current = columnasVisibles;
        layoutColumnasRef.current = layoutColumnas;

    }, [columnasVisibles,layoutColumnas]);

    useEffect(() => {

        dispatchColumnas({
            tipo:"sincronizar",
            columnasVisibles
        });

    }, [columnasVisibles]);

    useEffect(() => {

        dispatchColumnas({
            tipo:"aplicarLayout",
            columnasVisibles:columnasVisiblesRef.current,
            layoutColumnas:layoutColumnasRef.current
        });

    }, [layoutVersion]);

    useEffect(() => {

        if (!onLayoutChange) {
            return;
        }

        onLayoutChange(
            columnasOrdenadas.map(columna => ({
                campo:columna.campo,
                ancho:columna.ancho
            }))
        );

    }, [columnasOrdenadas,onLayoutChange]);

    const columnasParaMostrar = useMemo(() =>
        columnasOrdenadas.filter(
            columna => columna.visible !== false
        ),
        [columnasOrdenadas]
    );

    return {
        columnasOrdenadas,
        setColumnasOrdenadas,
        columnasParaMostrar
    };

}
