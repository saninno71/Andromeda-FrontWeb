import { obtenerValorColumna } from "./gridValores.js";

export function calcularTotalesGrid({
    columnas,
    filas,
    keysSeleccionadas,
    keysSeleccionadasSet,
    armarKeyFila,
    contextoCalculos
}) {

    const filasASumar =
        keysSeleccionadas.length === 0
            ? filas
            : filas.filter(fila => {
                const keyFila =
                    armarKeyFila(fila);

                return keysSeleccionadasSet.has(keyFila);
            });

    return (
        columnas
        .filter(columna =>
            columna.suma === true
        )
        .map(columna => {
            const total =
                filasASumar.reduce(
                    function(acumulador,fila) {
                        return (
                            acumulador +
                            Number(
                                obtenerValorColumna(fila, columna, contextoCalculos) ||
                                0
                            )
                        );
                    },
                    0
                );

            return {
                campo:columna.campo,
                total:
                    Math.round(
                        total * 100
                    ) / 100
            };
        })
    );

}
