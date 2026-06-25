import {formatearValor} from "../updFormatos";

export function normalizarTextoBusqueda(valor) {

    return String(valor ?? "")
        .trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g,"")
        .toLowerCase();

}

export function filtrarDatosPorTexto(data,columnas,textoBusqueda) {

    const textoNormalizado =
        normalizarTextoBusqueda(textoBusqueda);

    if (!textoNormalizado) {
        return data;
    }

    return data.filter(fila =>
        columnas.some(columna => {

            const valorFormateado =
                normalizarTextoBusqueda(
                    formatearValor(
                        fila[columna.campo],
                        columna.formato,
                        columna.mascara
                    )
                );

            return valorFormateado.includes(textoNormalizado);

        })
    );

}
