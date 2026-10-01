import {formatearValor} from "../updFormatos.js";
import { obtenerValorColumna } from "./gridValores.js";

export function normalizarTextoBusqueda(valor) {

    return String(valor ?? "")
        .trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g,"")
        .toLowerCase();

}

export function filtrarDatosPorTexto(data,columnas,textoBusqueda,contextoCalculos) {

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
                        obtenerValorColumna(fila, columna, contextoCalculos),
                        columna.formato,
                        columna.mascara
                    )
                );

            return valorFormateado.includes(textoNormalizado);

        })
    );

}
