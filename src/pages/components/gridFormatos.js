export function formatearValor(
    valor,
    formato,
    mascara
)
{
    if(valor == null)
    {
        return "";
    }

    // FECHA
    if(formato === "fecha")
    {
        return formatearFecha(
            valor,
            mascara
        );
    }
    // DECIMAL
    else if(formato === "decimal")
    {
        return formatearDecimal(
            valor,
            mascara
        );
    }

    return valor;
}




function formatearFecha(
    valor,
    mascara
)
{
    const fecha = new Date(valor);

    const yyyy = fecha
        .getFullYear()
        .toString();

    const mm = String(
        fecha.getMonth() + 1
    ).padStart(2,"0");

    const dd = String(
        fecha.getDate()
    ).padStart(2,"0");

    let resultado = mascara;

    resultado = resultado.replace(
        "YYYY",
        yyyy
    );

    resultado = resultado.replace(
        "MM",
        mm
    );

    resultado = resultado.replace(
        "DD",
        dd
    );

    return resultado;
}

function formatearDecimal(
    valor,
    mascara
)
{
    if(
        valor == null ||
        valor === ""
    )
    {
        return "";
    }

    // cantidad decimales
    const parteDecimal =
        mascara.split(",")[1];

    const decimales =
        parteDecimal
            ? parteDecimal.length
            : 0;

    // usa miles
    const usaMiles =
        mascara.includes(".");

    // simbolo
    const simbolo =
        mascara.replace(/[0.,]/g,"");

    // convertir a numero
    const numero = Number(valor);

    if(isNaN(numero))
    {
        return valor;
    }

    // formatear
    let resultado =
        numero.toLocaleString(
            "es-AR",
            {
                minimumFractionDigits:
                    decimales,

                maximumFractionDigits:
                    decimales,

                useGrouping:
                    usaMiles
            }
        );

    // agregar simbolo
    resultado =
        simbolo + resultado;

    return resultado;
}