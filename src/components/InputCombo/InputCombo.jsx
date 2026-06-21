import { useState, useEffect, useRef } from "react";
import "./InputCombo.css";

function InputCombo({
    titulo,
    valor,
    items = [],
    campoID,
    campoDescripcion,
    onChange,
    icono,
    onClick
})

{
    const [abierto, setAbierto] = useState(false);
    const comboRef = useRef(null);

    useEffect(() => {

        function handleClickOutside(event) {

            if (
                comboRef.current &&
                !comboRef.current.contains(event.target)
            ) {
                setAbierto(false);
            }

        }

        document.addEventListener(
            "mousedown",
            handleClickOutside
        );

        return () => {

            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );

        };

    }, []);


    return (

    <div className="inputComboContainer" ref={comboRef}>

        <div
            className="inputCombo"
            onClick={() => setAbierto(!abierto)}
        >

            <div className="inputComboTexto">

                <div
                    className={`inputComboTitulo ${
                        valor ? "inputComboTituloActivo" : ""
                    }`}
                >
                    {titulo}
                </div>

                {valor && (
                    <div className="inputComboValor">
                        {valor}
                    </div>
                )}

            </div>

            <div className="inputComboIcono">
                {icono}
            </div>

        </div>

        {abierto && (

            <div className="inputComboLista"
                onMouseLeave={() => setAbierto(false)}>

                {items.map((item) => (

                    <div
                        key={item[campoID]}
                        className="inputComboItem"
                        onClick={() => {

                            onChange(item);
                            setAbierto(false);

                        }}
                    >
                        {item[campoDescripcion]}
                    </div>

                ))}

            </div>

        )}

    </div>

    );

}

export default InputCombo;