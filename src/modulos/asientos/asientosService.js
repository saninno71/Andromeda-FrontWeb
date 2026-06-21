import {API_URL} from "../../config/AndromedaFrontConfig.js";

export async function cargarAsientos(fechaDesde, fechaHasta,empresaID)
{
    try
    {

        const filtro = {};

        if (fechaDesde)
            filtro.fechaDesde = fechaDesde;

        if (fechaHasta)
            filtro.fechaHasta = fechaHasta;

        if (empresaID)
           filtro.empresaID = `${empresaID}`;

console.log("Filtros mandado:", filtro);

        const response = await fetch(
            `${API_URL}/api/contabilidad/asientos/odata/CstctbAsientos`,
            {
                method:"POST",
                headers: {
                    "Content-Type":"application/json"
                },
                body: JSON.stringify(filtro)
            }
        );

        const data = await response.json();
        return data;
    }
    catch(error)

    {
        console.error(error);
        return [];
    }
}