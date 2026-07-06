import "./BotonToolbar.css";

import { forwardRef } from "react";

const BotonToolbar = forwardRef(function BotonToolbar({
    texto,
    icono,
    onClick,
    onKeyDown,
    variante,
    tabIndex,
    className = ""
},ref)

{

    return (

        <button
            type="button"
            className={`botonToolbar ${variante || ""} ${className}`}
            onClick={onClick}
            onKeyDown={onKeyDown}
            tabIndex={tabIndex}
            ref={ref}
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

});

export default BotonToolbar;
