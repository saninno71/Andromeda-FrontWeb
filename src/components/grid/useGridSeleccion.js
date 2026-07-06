import { useCallback,useEffect,useRef,useState } from "react";

export function useGridSeleccion({
    todasLasKeys
}) {

    const [keysSeleccionadas,setKeysSeleccionadas] = useState([]);
    const [keyAnclaSeleccion,setKeyAnclaSeleccion] = useState(null);
    const refCheckTodos = useRef();

    const estanTodasSeleccionadas =
        todasLasKeys.length > 0 &&
        todasLasKeys.every(
            key => keysSeleccionadas.includes(key)
        );

    function cambiarCheckTodos() {

        if (estanTodasSeleccionadas) {
            setKeysSeleccionadas([]);
        } else {
            setKeysSeleccionadas(todasLasKeys);
        }

    }

    function cambiarCheckFila(keyFila,e) {

        if (e.shiftKey && keyAnclaSeleccion) {
            const indiceAncla =
                todasLasKeys.findIndex(
                    key => key === keyAnclaSeleccion
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

        setKeyAnclaSeleccion(keyFila);

    }

    const limpiarSeleccion = useCallback(function limpiarSeleccion() {

        setKeysSeleccionadas([]);
        setKeyAnclaSeleccion(null);

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
        refCheckTodos,
        estanTodasSeleccionadas,
        cambiarCheckTodos,
        cambiarCheckFila,
        limpiarSeleccion
    };

}
