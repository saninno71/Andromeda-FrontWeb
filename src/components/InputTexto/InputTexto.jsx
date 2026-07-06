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
    className = ""
}) {

    const tieneValor =
        value !== null &&
        value !== undefined &&
        value !== "";

    return (
        <div className={`inputTexto ${className}`}>

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
                        tabIndex={tabIndex}
                    />

                </div>

                {icono && (
                    <button
                        type="button"
                        className="inputTextoIcono"
                        onClick={onIconClick}
                        tabIndex={-1}
                    >
                        {icono}
                    </button>
                )}

            </div>

        </div>
    );

}

export default InputTexto;
