import {API_URL} from "../../config/AndromedaFrontConfig.js";

export async function cargarCuentas(textoBusqueda, empresaID) {

    try
    {
        const filtro = {};
        const texto = textoBusqueda.trim();
        const esCodigo = /^[0-9.]+$/.test(texto);

        if (esCodigo)
            filtro.codigo = texto;
        else
            filtro.nombre = texto;

        if (empresaID)
            filtro.empresaID = empresaID;

        const response = await fetch(
            `${API_URL}/api/contabilidad/planDeCuentas/odata/CstctbCuentas`,
            {
                method:"POST",
                headers: {
                    "Content-Type":"application/json"
                },
                body: JSON.stringify(filtro)
            }
        );

        const data = await response.json();

        return data.map((cuenta) => ({
            cuentaID: cuenta.id,
            cuentaCodigo: cuenta.codigo,
            cuentaNombre: cuenta.nombre
        }));
    }
    catch(error)
    {
        console.error(error);
        return [];
    }

}
