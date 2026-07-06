import {API_URL} from "../../config/AndromedaFrontConfig.js";

export async function cargarAsientos(filtrosConsulta = {})
{
    try
    {
        const {
            fechaDesde,
            fechaHasta,
            empresaID,
            cuentaID,
            detalle,
            numeroDesde,
            numeroHasta,
            numeraTipoID
        } = filtrosConsulta;

        const filtro = {};

        if (fechaDesde)
            filtro.fechaDesde = fechaDesde;

        if (fechaHasta)
            filtro.fechaHasta = fechaHasta;

        if (empresaID)
           filtro.empresaID = `${empresaID}`;

        if (cuentaID)
           filtro.cuentaID = cuentaID;

        if (detalle)
           filtro.detalle = detalle;

        if (numeroDesde)
           filtro.numeroDesde = numeroDesde;

        if (numeroHasta)
           filtro.numeroHasta = numeroHasta;

        if (numeraTipoID)
           filtro.numeraTipoID = numeraTipoID;

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
