import { formatearValor } from "../updFormatos";

function GridTotalesVista({
    refGrillaTotales,
    mostrarCheck,
    anchoColumnaCheck,
    columnas,
    totales,
    estiloColumna,
    estiloEspacioFinal,
    textoCantidadRegistros
}) {

    return (
        <div className="grillaTotalesContenedor">

            <div className="grillaTotales" ref={refGrillaTotales}>

                <table>
                    <tbody>
                        <tr>
                            {mostrarCheck && (
                                <td
                                    style={{
                                        width: anchoColumnaCheck + "px",
                                        minWidth: anchoColumnaCheck + "px",
                                        maxWidth: anchoColumnaCheck + "px"
                                    }}
                                ></td>
                            )}

                            {
                                columnas.map(columna => {

                                    const total =
                                        totales.find(
                                            item => item.campo === columna.campo
                                        );

                                    return (
                                        <td
                                            key={columna.campo}
                                            style={estiloColumna(columna)}
                                        >
                                            {
                                                columna.suma === true
                                                    ? (
                                                        <span className="contenidoCelda">
                                                            {formatearValor(
                                                                total?.total,
                                                                columna.formato,
                                                                columna.mascara
                                                            )}
                                                        </span>
                                                    )
                                                    : ""
                                            }
                                        </td>
                                    );
                                })
                            }

                            <td style={estiloEspacioFinal}></td>
                        </tr>
                    </tbody>
                </table>

            </div>

            <div className="totalRegistrosFlotante">
                {textoCantidadRegistros}
            </div>

        </div>
    );

}

export default GridTotalesVista;
