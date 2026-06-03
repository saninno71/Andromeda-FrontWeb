export async function cargarAsientos()

{

    try

    {

        const response = await fetch(

            "http://localhost:5062/api/contabilidad/asientos/odata/CstctbAsientos",

            {

                method:"POST",

                headers: {

                    "Content-Type":"application/json"

                },

                body: JSON.stringify({})

            }

        );

        const data = await response.json();
// console.log(data);
        return data;

    }

    catch(error)

    {

        console.error(error);

        return [];

    }

}