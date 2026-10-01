import "./InputTexto.css";

function InputTexto({
    titulo,
    value,
    placeholder = "",
    type = "text",
    icono,
    onChange,
    onIconClick,
    tabIndex,
    disabled = false,
    className = ""
}) {

    const tieneValor =
        value !== null &&
        value !== undefined &&
        value !== "";

    return (
        <div className={`inputTexto ${disabled ? "inputTextoDeshabilitado" : ""} ${className}`}>

            <div className="inputTextoContenido">

                <div className={`inputTextoTextos ${tieneValor ? "conValor" : ""}`}>

                    <div className="inputTextoTitulo">
                        {titulo}
                    </div>

                    <input
                        className="inputTextoInput"
                        value={value || ""}
                        placeholder={placeholder}
                        type={type}
                        onChange={onChange}
                        tabIndex={disabled ? -1 : tabIndex}
                        disabled={disabled}
                    />

                </div>

                {icono && (
                    <button
                        type="button"
                        className="inputTextoIcono"
                        onClick={onIconClick}
                        tabIndex={-1}
                        disabled={disabled}
                    >
                        {icono}
                    </button>
                )}

            </div>

        </div>
    );

}

export default InputTexto;
