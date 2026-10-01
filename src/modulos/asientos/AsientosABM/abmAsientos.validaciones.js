export const MENSAJE_ASIENTO_DESBALANCEADO =
    "El asiento no balancea. La suma del Debe debe ser igual a la suma del Haber.";

function importeEnCentavos(valor) {
    return Math.round(Number(valor) * 100);
}

export function validarBalanceLineasAsiento(lineas) {
    const totales = lineas.reduce((acumulado, linea) => {
        const importe = importeEnCentavos(linea.importe);
        if (linea.tipo === 1) acumulado.debe += importe;
        if (linea.tipo === -1) acumulado.haber += importe;
        return acumulado;
    }, { debe: 0, haber: 0 });

    if (totales.debe !== totales.haber) {
        throw new Error(MENSAJE_ASIENTO_DESBALANCEADO);
    }
}
