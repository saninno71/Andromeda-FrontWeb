import "./styles/InputBuscador.css";

function InputBuscador({
    titulo,
    value,
    placeholder,
    icono,
    onChange
})

{

    return (

        <div className="inputBuscador">

            <div className="inputBuscadorContenido">

                <div className="inputBuscadorTextos">

                    <div className="inputBuscadorTitulo">
                        {titulo}
                    </div>

                    <input
                        className="inputBuscadorInput"
                        value={value}
                        placeholder={placeholder}
                        onChange={onChange}
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