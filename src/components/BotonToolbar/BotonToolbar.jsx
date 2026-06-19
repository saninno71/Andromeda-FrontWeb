import "./BotonToolbar.css";

function BotonToolbar({
    texto,
    icono,
    onClick,
    variante
})

{

    return (

        <button
            className={`botonToolbar ${variante || ""}`}
            onClick={onClick}
        >

            {icono && (

                <span className="botonToolbarIcono">
                    {icono}
                </span>

            )}

            {texto && (

                <span className="botonToolbarTexto">
                    {texto}
                </span>

            )}

        </button>

    );

}

export default BotonToolbar;