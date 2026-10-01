import monedasJson from "../../simul/Monedas.json";

const TOPE_MONEDAS_BUSQUEDA = 20;

const normalizar = valor => String(valor ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

// Contrato temporalmente respaldado por JSON. Cuando exista el endpoint,
// solamente debe reemplazarse esta implementación manteniendo la firma y salida.
export async function cargarMonedas(textoBusqueda, signal) {
    if (signal?.aborted) return [];

    const texto = normalizar(textoBusqueda.trim());
    const monedas = monedasJson
        .filter(moneda =>
            normalizar(moneda.Codigo).includes(texto) ||
            normalizar(moneda.Nombre).includes(texto)
        )
        .slice(0, TOPE_MONEDAS_BUSQUEDA)
        .map(moneda => ({
            monedaID: moneda.ID,
            monedaCodigo: moneda.Codigo,
            monedaNombre: moneda.Nombre,
            monedaCodigoFiscal: moneda.CodigoFiscal
        }));

    return signal?.aborted ? [] : monedas;
}
