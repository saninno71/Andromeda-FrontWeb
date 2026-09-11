import {API_URL} from "../../config/AndromedaFrontConfig.js";
import { obtenerItemsOData } from "./odataResponse.js";

const TOPE_CUENTAS_BUSQUEDA = 20;

function escaparTextoOData(texto) {

    return texto.replaceAll("'","''");

}

export async function cargarCuentas(textoBusqueda, empresaID, signal) {

    try
    {
        const texto = escaparTextoOData(
            textoBusqueda.trim().toLowerCase()
        );

        const filtros = [
            "(" +
            `contains(tolower(Nombre),tolower('${texto}'))` +
            " or " +
            `contains(tolower(Codigo),tolower('${texto}'))` +
            ")"
        ];


        const parametros = new URLSearchParams({
            "$filter":filtros.join(" and "),
            "$select":"Id,Codigo,Nombre",
            "$top":String(TOPE_CUENTAS_BUSQUEDA)
        });

        const response = await fetch(
            `${API_URL}/api/contabilidad/planDeCuentas/odata/CstctbCuentas?${parametros.toString()}`,
            {
                method:"POST",
                headers: {
                    "Content-Type":"application/json"
                },
                body: JSON.stringify(empresaID ? { empresaID: Number(empresaID) } : {}),
                signal
            }
        );

        if (!response.ok) throw new Error(`No se pudieron cargar las cuentas (${response.status}).`);
        const data = await response.json();
        const cuentas = obtenerItemsOData(data);

        return cuentas.map((cuenta) => ({
            cuentaID: cuenta.Id ?? cuenta.id,
            cuentaCodigo: cuenta.Codigo ?? cuenta.codigo,
            cuentaNombre: cuenta.Nombre ?? cuenta.nombre
        }));
    }
    catch(error)
    {
        if (error.name === "AbortError") {
            return [];
        }

        throw error;
    }

}
