export async function cargarAsientos()
{
    try
    {
        console.time("fetch");

        const response = await fetch(
            "https://andromeda-backend-7eko.onrender.com/api/contabilidad/asientos/odata/CstctbAsientos",
            {
                method:"POST",
                headers: {
                    "Content-Type":"application/json"
                },
                body: JSON.stringify({})
            }
        );

        console.timeEnd("fetch");

        console.time("json");

        const data = await response.json();

        console.timeEnd("json");

        return data;
    }
    catch(error)
    {
        console.error(error);
        return [];
    }
}