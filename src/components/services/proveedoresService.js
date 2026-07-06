import {API_URL} from "../../config/AndromedaFrontConfig.js";

export async function cargarProveedores(textoBusqueda, empresaID) {

    try
    {
        const filtro = {};
        const texto = textoBusqueda.trim();
        const esCodigo = /^[0-9]+$/.test(texto);

        if (esCodigo)
            filtro.codigo = Number(texto);
        else
            filtro.nombre = texto;

        if (empresaID)
            filtro.empresaID = String(empresaID);

        const response = await fetch(
            `${API_URL}/api/compras/proveedores/odata/cstcpsProveedores`,
            {
                method:"POST",
                headers: {
                    "Content-Type":"application/json"
                },
                body: JSON.stringify(filtro)
            }
        );

        const data = await response.json();
        const proveedores = Array.isArray(data)
            ? data
            : data.value || [];

        return proveedores.map((proveedor) => ({
            proveedorID: proveedor.id,
            proveedorCodigo: proveedor.codigo,
            proveedorNombre: proveedor.nombre
        }));
    }
    catch(error)
    {
        console.error(error);
        return [];
    }

}
