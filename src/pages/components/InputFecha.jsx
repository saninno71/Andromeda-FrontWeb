import "./styles/InputFecha.css";

function InputFecha({
    titulo,
    valor,
    placeholder,
    icono,
    onChange
})

{

    return (

        <div className="inputFecha">

            <div className="inputFechaContenido">

                <div className="inputFechaTexto">

                    <div className="inputFechaTitulo">

                        {titulo}

                    </div>

                    <input
                        className="inputFechaInput"
                        value={valor}
                        placeholder={placeholder}
                        onChange={onChange}
                    />

                </div>

                <div className="inputFechaIcono">

                    {icono}

                </div>

            </div>

        </div>

    );

}

export default InputFecha;