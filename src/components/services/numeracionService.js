import numeraciones from "../../simul/Numeraciones.json";

export async function cargarNumeraciones() {

    return numeraciones.map((numeracion) => ({
        numeraTipoID:numeracion.numeraTipoID,
        descripcion:numeracion.descripcion
    }));

}
