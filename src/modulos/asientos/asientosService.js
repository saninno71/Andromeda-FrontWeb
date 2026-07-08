import {API_URL} from "../../config/AndromedaFrontConfig.js";
import {
    obtenerItemsOData,
    obtenerTotalOData
} from "../../components/services/odataResponse.js";

const TAMANO_PAGINA_ASIENTOS = 100;

export async function cargarAsientos(
    filtrosConsulta = {},
    opciones = {}
)
{
    try
    {
        const {
            top = TAMANO_PAGINA_ASIENTOS,
            skip = 0,
            incluirTotal = false,
            signal = null
        } = opciones;

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

        const parametros = new URLSearchParams({
            "$top":String(top),
            "$skip":String(skip),
            "$count":incluirTotal ? "true" : "false"
        });

        const url =
            `${API_URL}/api/contabilidad/asientos/odata/CstctbAsientos?${parametros.toString()}`;

        const response = await fetch(
            url,
            {
                method:"POST",
                headers: {
                    "Content-Type":"application/json"
                },
                signal,
                body: JSON.stringify(filtro)
            }
        );

        const data = await response.json();

        return {
            items:obtenerItemsOData(data),
            total:obtenerTotalOData(data)
        };
    }
    catch(error)

    {
        if (error.name === "AbortError") {
            return {
                items:[],
                total:null
            };
        }

        console.error(error);
        return {
            items:[],
            total:null
        };
    }
}
