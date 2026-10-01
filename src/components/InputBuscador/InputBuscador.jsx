import "./InputBuscador.css";

function InputBuscador({
    titulo,
    value,
    placeholder,
    icono,
    onChange,
    tabIndex,
    disabled = false
})

{

    return (

        <div className={`inputBuscador ${disabled ? "inputBuscadorDeshabilitado" : ""}`}>

            <div className="inputBuscadorContenido">

                <div className="inputBuscadorTextos">

                    <div className="inputBuscadorTitulo">
                        {titulo}
                    </div>

                    <input
                        className="inputBuscadorInput"
                        value={value || ""}
                        placeholder={placeholder}
                        onChange={onChange}
                        tabIndex={disabled ? -1 : tabIndex}
                        disabled={disabled}
                    />

                </div>

                <div className="inputBuscadorIcono">
                    {icono}
                </div>

            </div>

        </div>

    );

}

export default InputBuscador;
