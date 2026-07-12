import {API_URL} from "../../config/AndromedaFrontConfig.js";
import { obtenerItemsOData } from "./odataResponse.js";

const TOPE_CLIENTES_BUSQUEDA = 20;

function escaparTextoOData(texto) {

    return texto.replaceAll("'","''");

}

export async function cargarClientes(textoBusqueda, signal) {

    try
    {
        const textoBusquedaLimpio = textoBusqueda.trim();
        const texto = escaparTextoOData(textoBusquedaLimpio.toLowerCase());
        const esCodigo = /^[0-9]+$/.test(textoBusquedaLimpio);

        const filtro =
            esCodigo
                ? `codigo eq ${Number(textoBusquedaLimpio)}`
                : `contains(tolower(nombre),tolower('${texto}'))`;

        const parametros = new URLSearchParams({
            "$filter":filtro,
            "$select":"id,codigo,nombre",
            "$top":String(TOPE_CLIENTES_BUSQUEDA)
        });

        const response = await fetch(
            `${API_URL}/api/ventas/clientes/odata/CstVtsClientes?${parametros.toString()}`,
            {
                method:"POST",
                headers: {
                    "Content-Type":"application/json"
                },
                body: JSON.stringify({}),
                signal
            }
        );

        const data = await response.json();
        const clientes = obtenerItemsOData(data);

        return clientes.map((cliente) => ({
            clienteID: cliente.ID ?? cliente.Id ?? cliente.id,
            clienteCodigo: cliente.Codigo ?? cliente.codigo,
            clienteNombre: cliente.Nombre ?? cliente.nombre
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
