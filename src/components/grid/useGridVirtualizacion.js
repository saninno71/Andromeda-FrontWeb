import { useCallback,useEffect,useMemo,useState } from "react";

export function useGridVirtualizacion({
    filas,
    refContenedor,
    altoFilaEstimado = 24,
    overscan = 10
}) {

    const [scrollTop,setScrollTop] = useState(0);
    const [altoViewport,setAltoViewport] = useState(0);
    const [altoFila,setAltoFila] = useState(altoFilaEstimado);

    useEffect(() => {

        const contenedor = refContenedor.current;

        if (!contenedor) {
            return;
        }

        function actualizarAltoViewport() {
            setAltoViewport(contenedor.clientHeight);
        }

        actualizarAltoViewport();

        const resizeObserver =
            new ResizeObserver(actualizarAltoViewport);

        resizeObserver.observe(contenedor);

        return () => {
            resizeObserver.disconnect();
        };

    }, [refContenedor]);

    useEffect(() => {

        const primeraFila =
            refContenedor.current?.querySelector("tbody tr[data-key]");

        if (!primeraFila) {
            return;
        }

        const altoMedido =
            primeraFila.getBoundingClientRect().height;

        if (altoMedido > 0) {
            setAltoFila(altoMedido);
        }

    }, [filas,refContenedor]);

    const altoTotal =
        filas.length * altoFila;

    const cantidadVisible =
        Math.ceil(altoViewport / altoFila) + overscan * 2;

    const indiceInicioCalculado = Math.max(
        0,
        Math.floor(scrollTop / altoFila) - overscan
    );

    const indiceInicioMaximo = Math.max(
        0,
        filas.length - cantidadVisible
    );

    const indiceInicio = Math.min(
        indiceInicioCalculado,
        indiceInicioMaximo
    );

    const indiceFin = Math.min(
        filas.length,
        indiceInicio + cantidadVisible
    );

    const filasVirtuales = useMemo(() =>
        filas
        .slice(indiceInicio,indiceFin)
        .map((fila,indice) => ({
            fila,
            indice:indiceInicio + indice
        })),
        [filas,indiceInicio,indiceFin]
    );

    const offsetY =
        indiceInicio * altoFila;

    const altoInferior = Math.max(
        0,
        altoTotal -
        offsetY -
        filasVirtuales.length * altoFila
    );

    const actualizarScrollTop = useCallback(function actualizarScrollTop(valorScrollTop) {
        setScrollTop(valorScrollTop);
    }, []);

    return {
        filasVirtuales,
        altoTotal,
        offsetY,
        altoInferior,
        actualizarScrollTop
    };

}
