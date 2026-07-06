export function calcularTotalesGrid({
    columnas,
    filas,
    keysSeleccionadas,
    armarKeyFila
}) {

    const filasASumar =
        keysSeleccionadas.length === 0
            ? filas
            : filas.filter(fila => {
                const keyFila =
                    armarKeyFila(fila);

                return keysSeleccionadas.includes(
                    keyFila
                );
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
                                fila[columna.campo] ||
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
