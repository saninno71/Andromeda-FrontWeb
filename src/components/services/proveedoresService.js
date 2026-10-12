import {API_URL} from "../../config/AndromedaFrontConfig.js";
import { crearErrorHttp } from "../../infraestructura/http/respuestaHttp.js";
import { obtenerItemsOData } from "./odataResponse.js";

const TOPE_PROVEEDORES_BUSQUEDA = 20;

function escaparTextoOData(texto) {

    return texto.replaceAll("'","''");

}

export async function cargarProveedores(textoBusqueda, empresaID, signal) {

    try
    {
        const textoBusquedaLimpio = textoBusqueda.trim();
        const texto = escaparTextoOData(textoBusquedaLimpio.toLowerCase());
        const esCodigo = /^[0-9]+$/.test(textoBusquedaLimpio);

        const filtros = [
            esCodigo
                ? `codigo eq ${Number(textoBusquedaLimpio)}`
                : `contains(tolower(nombre),tolower('${texto}'))`
        ];

        if (empresaID) {
            filtros.push(`empresaID eq ${Number(empresaID)}`);
        }

        const parametros = new URLSearchParams({
            "$filter":filtros.join(" and "),
            "$select":"id,codigo,nombre",
            "$top":String(TOPE_PROVEEDORES_BUSQUEDA)
        });

        const response = await fetch(
            `${API_URL}/api/compras/proveedores/odata/cstcpsProveedores?${parametros.toString()}`,
            {
                method:"POST",
                headers: {
                    "Content-Type":"application/json"
                },
                body: JSON.stringify({}),
                signal
            }
        );

        if (!response.ok) {
            throw await crearErrorHttp(response, `No se pudieron cargar los proveedores (${response.status}).`);
        }
        const data = await response.json();
        const proveedores = obtenerItemsOData(data);

        return proveedores.map((proveedor) => ({
            proveedorID: proveedor.ID ?? proveedor.Id ?? proveedor.id,
            proveedorCodigo: proveedor.Codigo ?? proveedor.codigo,
            proveedorNombre: proveedor.Nombre ?? proveedor.nombre
        }));
    }
    catch(error)
    {
        if (error.name === "AbortError") {
            return [];
        }

        console.error(error);
        return [];
    }

}
