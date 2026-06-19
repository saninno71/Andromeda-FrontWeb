export function toggleOrdenamiento(
    ordenamiento,
    campo
)
{
    const index = ordenamiento.findIndex(
        x => x.campo === campo
    );

    // no existe
    if(index === -1)
    {
        return [
            ...ordenamiento,
            {
                campo,
                direccion:"asc"
            }
        ];
    }

    const item = ordenamiento[index];

    // asc -> desc
    if(item.direccion === "asc")
    {
        const copia = [...ordenamiento];

        copia[index] = {
            ...item,
            direccion:"desc"
        };

        return copia;
    }

    // desc -> eliminar
    return ordenamiento.filter(
        x => x.campo !== campo
    );
}

export function ordenarDatos(
    data,
    ordenamiento,
    columnas
)
{
    return [...data].sort((a,b) => {

        for(const orden of ordenamiento)
        {
            const columna = columnas.find(
                x => x.campo === orden.campo
            );

            const formato = columna?.formato;

            let valorA = a[orden.campo];
            let valorB = b[orden.campo];

            // TEXTO
            if(formato === "texto")
            {
                valorA = valorA ?? "";
                valorB = valorB ?? "";

                valorA = valorA
                    .toString()
                    .toLowerCase();

                valorB = valorB
                    .toString()
                    .toLowerCase();
            }

            // NUMERO
            if(
                formato === "numero" ||
                formato === "entero" ||
                formato === "decimal"
            )
            {
                valorA = valorA ?? 0;
                valorB = valorB ?? 0;
            }

            // FECHA
            if(formato === "fecha")
            {
                valorA = valorA
                    ? new Date(valorA).getTime()
                    : new Date(1900,0,1).getTime();

                valorB = valorB
                    ? new Date(valorB).getTime()
                    : new Date(1900,0,1).getTime();
            }

            if(valorA < valorB)
            {
                return orden.direccion === "asc"
                    ? -1
                    : 1;
            }

            if(valorA > valorB)
            {
                return orden.direccion === "asc"
                    ? 1
                    : -1;
            }
        }

        return 0;
    });
}

export function obtenerOrdenColumna(
    ordenamiento,
    campo
)
{
    return ordenamiento.find(
        x => x.campo === campo
    );
}

export function obtenerFlechaOrden(
    direccion
)
{
        if(direccion === "asc")
    {
        // return "↑";
        return "⬆";
    }

    if(direccion === "desc")
    {
        // return "↓";
        return "⬇";
    }

    return "";
}

export function obtenerOrdenamientoDefault(
    columnas
)
{
    return columnas

        .filter(
            x =>
                x.ordenDefault != null &&
                x.ordenDefault !== ""
        )

        .sort(
            (a,b) =>
                a.ordenDefault -
                b.ordenDefault
        )

        .map(col => ({
            campo:col.campo,

            direccion:
                col.direccionDefault ||
                "asc"
        }));
}