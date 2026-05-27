import "./styles/InputCombo.css";

function InputCombo({
    titulo,
    valor,
    icono,
    onClick
})

{

    return (

        <div
            className="inputCombo"
            onClick={onClick}
        >

            <div className="inputComboTexto">

                <div className="inputComboTitulo">

                    {titulo}

                </div>

                <div className="inputComboValor">

                    {valor}

                </div>

            </div>

            <div className="inputComboIcono">

                {icono}

            </div>

        </div>

    );

}

export default InputCombo;