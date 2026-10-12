import {API_URL} from "../../../config/AndromedaFrontConfig.js";
import {
    obtenerItemsOData,
    obtenerTotalOData
} from "../../../components/services/odataResponse.js";
import { crearErrorHttp } from "../../../infraestructura/http/respuestaHttp.js";

const TAMANO_PRIMERA_PAGINA_ASIENTOS = 100;
const TAMANO_PAGINA_ASIENTOS = 1500;

export const CONFIG_CARGA_ASIENTOS = {
    tamanoPrimeraPagina:TAMANO_PRIMERA_PAGINA_ASIENTOS,
    tamanoPagina:TAMANO_PAGINA_ASIENTOS,
    topeRegistros:5000,
    pausaEntrePaginas:80
};

export async function cargarAsientos(
    filtrosConsulta = {},
    opciones = {}
)
{
    const {
        top = TAMANO_PAGINA_ASIENTOS,
        skip = 0,
        incluirTotal = false,
        signal = null
    } = opciones;

    const {
        id,
        fechaDesde,
        fechaHasta,
        empresaID,
        cuentaID,
        detalle,
        clienteID,
        proveedorID,
        numeroDesde,
        numeroHasta,
        numeraTipoID
    } = filtrosConsulta;

    const filtro = {};
    const filtrosOData = [];

    if (id)
        filtro.id = Number(id);

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

    if (clienteID) {
       filtrosOData.push(
           `(debeClienteID eq ${Number(clienteID)} or haberClienteID eq ${Number(clienteID)})`
       );
    }

    if (proveedorID) {
       filtrosOData.push(
           `(debeProveedorID eq ${Number(proveedorID)} or haberProveedorID eq ${Number(proveedorID)})`
       );
    }

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

    if (filtrosOData.length > 0) {
        parametros.set("$filter",filtrosOData.join(" and "));
    }

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

    if (!response.ok) {
        throw await crearErrorHttp(response, `No se pudieron consultar los asientos (${response.status}).`);
    }
    const data = await response.json();

    return {
        items:obtenerItemsOData(data),
        total:obtenerTotalOData(data)
    };
}

export async function cargarFilaAsientoPorId(comprobanteID, { signal } = {}) {
    const id = Number(comprobanteID);
    if (!Number.isInteger(id) || id <= 0) {
        throw new Error("El comprobante solicitado no es válido.");
    }

    const resultado = await cargarAsientos(
        { id },
        { top:1, skip:0, incluirTotal:false, signal }
    );
    const fila = resultado.items.find(
        item => Number(item.comprobanteID) === id
    );

    if (!fila) {
        throw new Error("La consulta no devolvió el asiento recién creado.");
    }

    return fila;
}
