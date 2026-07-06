import { obtenerClaseTextoColumna } from "./gridEstilos";
import { formatearValor } from "../updFormatos";

function GridFila({
    fila,
    indiceFila,
    keyFila,
    claseFila,
    claseMenuFila,
    mostrarCheck,
    anchoColumnaCheck,
    columnas,
    keysSeleccionadas,
    cambiarCheckFila,
    seleccionarFila,
    refPrimeraCeldaDatos,
    estiloColumna,
    estiloEspacioFinal
}) {

    return (
        <tr
            className={`
                ${claseFila(indiceFila,keyFila)}
                ${claseMenuFila}
            `}
            key={keyFila}
            data-key={keyFila}
            onClick={(e) => seleccionarFila(fila,e)}
        >

            {mostrarCheck && (
                <td
                    style={{
                        width: anchoColumnaCheck + "px",
                        minWidth: anchoColumnaCheck + "px",
                        maxWidth: anchoColumnaCheck + "px"
                    }}
                >
                    <input
                        type="checkbox"
                        data-grid-check-row={indiceFila}
                        checked={keysSeleccionadas.includes(keyFila)}
                        onChange={() => {}}
                        onClick={(e) => {
                            e.stopPropagation();
                            cambiarCheckFila(keyFila,e);
                        }}
                        onKeyDown={(e) => {
                            if (e.key === " ") {
                                e.preventDefault();
                                e.stopPropagation();
                                cambiarCheckFila(keyFila,e);
                            }
                        }}
                    />
                </td>
            )}

            {
                columnas.map(
                    (columna,indiceColumna) => (
                        <td
                            key={columna.campo}
                            data-grid-row={indiceFila}
                            data-grid-col={indiceColumna}
                            ref={
                                indiceFila === 0 &&
                                indiceColumna === 0
                                    ? refPrimeraCeldaDatos
                                    : null
                            }
                            tabIndex={
                                indiceFila === 0 &&
                                indiceColumna === 0
                                    ? 0
                                    : -1
                            }
                            style={{
                                ...estiloColumna(columna),
                                position:"relative"
                            }}
                            className={`
                                ${obtenerClaseTextoColumna(columna)}
                                grillaCeldaDatos
                            `}
                            onClick={(e) => {
                                e.currentTarget.focus();
                            }}
                        >
                            <span className="contenidoCelda">
                                {formatearValor(
                                    fila[columna.campo],
                                    columna.formato,
                                    columna.mascara
                                )}
                            </span>
                        </td>
                    )
                )
            }

            <td style={estiloEspacioFinal}></td>

        </tr>
    );

}

export default GridFila;
