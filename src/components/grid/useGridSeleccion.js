import { useCallback,useEffect,useMemo,useRef,useState } from "react";

export function useGridSeleccion({
    todasLasKeys
}) {

    const [keysSeleccionadas,setKeysSeleccionadas] = useState([]);
    const refKeyAnclaSeleccion = useRef(null);
    const refCheckTodos = useRef();

    const keysSeleccionadasSet = useMemo(() =>
        new Set(keysSeleccionadas),
        [keysSeleccionadas]
    );

    const estanTodasSeleccionadas =
        todasLasKeys.length > 0 &&
        todasLasKeys.every(
            key => keysSeleccionadasSet.has(key)
        );

    const cambiarCheckTodos = useCallback(function cambiarCheckTodos() {

        if (estanTodasSeleccionadas) {
            setKeysSeleccionadas([]);
        } else {
            setKeysSeleccionadas(todasLasKeys);
        }

    }, [estanTodasSeleccionadas,todasLasKeys]);

    const cambiarCheckFila = useCallback(function cambiarCheckFila(keyFila,e) {

        if (e.shiftKey && refKeyAnclaSeleccion.current) {
            const indiceAncla =
                todasLasKeys.findIndex(
                    key => key === refKeyAnclaSeleccion.current
                );
            const indiceFila =
                todasLasKeys.findIndex(
                    key => key === keyFila
                );

            if (indiceAncla !== -1 && indiceFila !== -1) {
                const inicio =
                    Math.min(indiceAncla,indiceFila);
                const fin =
                    Math.max(indiceAncla,indiceFila);
                const keysRango =
                    todasLasKeys.slice(inicio,fin + 1);

                setKeysSeleccionadas(function(keysAnteriores) {
                    return Array.from(
                        new Set([
                            ...keysAnteriores,
                            ...keysRango
                        ])
                    );
                });

                return;
            }
        }

        setKeysSeleccionadas(function(keysAnteriores) {
            if (keysAnteriores.includes(keyFila)) {
                return keysAnteriores.filter(
                    key => key !== keyFila
                );
            }

            return [
                ...keysAnteriores,
                keyFila
            ];
        });

        refKeyAnclaSeleccion.current = keyFila;

    }, [todasLasKeys]);

    const limpiarSeleccion = useCallback(function limpiarSeleccion() {

        setKeysSeleccionadas([]);
        refKeyAnclaSeleccion.current = null;

    }, []);

    useEffect(() => {

        if (!refCheckTodos.current) {
            return;
        }

        refCheckTodos.current.indeterminate =
            keysSeleccionadas.length > 0 &&
            !estanTodasSeleccionadas;

    }, [keysSeleccionadas,estanTodasSeleccionadas]);

    return {
        keysSeleccionadas,
        keysSeleccionadasSet,
        refCheckTodos,
        estanTodasSeleccionadas,
        cambiarCheckTodos,
        cambiarCheckFila,
        limpiarSeleccion
    };

}
