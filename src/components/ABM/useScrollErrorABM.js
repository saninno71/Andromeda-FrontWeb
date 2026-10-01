import { useLayoutEffect, useRef } from "react";

export function desplazarCuerpoABMAlError(contenedor) {
    if (!contenedor) return;
    contenedor.scrollTop = 0;
}

export function useScrollErrorABM(error) {
    const cuerpoRef = useRef(null);

    useLayoutEffect(() => {
        if (!error) return;
        desplazarCuerpoABMAlError(cuerpoRef.current);
        const cuadro = window.requestAnimationFrame(() => {
            desplazarCuerpoABMAlError(cuerpoRef.current);
        });
        return () => window.cancelAnimationFrame(cuadro);
    }, [error]);

    return cuerpoRef;
}
