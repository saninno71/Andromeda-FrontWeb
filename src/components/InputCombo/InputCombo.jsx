import { useState, useEffect, useRef } from "react";
import "./InputCombo.css";

function InputCombo({
    titulo,
    valor,
    items = [],
    campoID,
    campoDescripcion,
    onChange,
    onEnter,
    icono,
    tabIndex
})

{
    const [abierto, setAbierto] = useState(false);
    const [indiceActivo,setIndiceActivo] = useState(0);
    const comboRef = useRef(null);
    const controlRef = useRef(null);

    function abrirCombo() {

        setIndiceActivo(0);
        setAbierto(true);

    }

    function cerrarCombo() {

        setAbierto(false);

    }

    function alternarCombo() {

        if (abierto) {
            cerrarCombo();
            return;
        }

        abrirCombo();

    }

    function seleccionarItem(item) {

        onChange(item);
        cerrarCombo();
        window.setTimeout(() => {
            controlRef.current?.focus();
        },0);

    }

    useEffect(() => {

        function handleClickOutside(event) {

            if (
                comboRef.current &&
                !comboRef.current.contains(event.target)
            ) {
                cerrarCombo();
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
            ref={controlRef}
            className="inputCombo"
            tabIndex={tabIndex}
            onClick={alternarCombo}
            onKeyDown={(evento) => {

                if (evento.key === "ArrowDown") {
                    evento.preventDefault();

                    if (!abierto) {
                        abrirCombo();
                        return;
                    }

                    setIndiceActivo(indice =>
                        Math.min(items.length - 1,indice + 1)
                    );
                    return;
                }

                if (evento.key === "ArrowUp") {
                    evento.preventDefault();

                    if (!abierto) {
                        abrirCombo();
                        return;
                    }

                    setIndiceActivo(indice =>
                        Math.max(0,indice - 1)
                    );
                    return;
                }

                if (evento.key === "Enter") {
                    if (abierto && items[indiceActivo]) {
                        evento.preventDefault();
                        evento.stopPropagation();
                        seleccionarItem(items[indiceActivo]);
                        window.setTimeout(() => {
                            onEnter?.();
                        },0);
                        return;
                    }

                    if (!abierto && onEnter) {
                        evento.preventDefault();
                        evento.stopPropagation();
                        onEnter();
                    }
                    return;
                }

                if (evento.key === " ") {
                    evento.preventDefault();
                    alternarCombo();
                }

                if (evento.key === "Escape") {
                    cerrarCombo();
                }
            }}
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

                {items.map((item,indice) => (

                    <div
                        key={item[campoID]}
                        className={`inputComboItem ${
                            indice === indiceActivo
                                ? "inputComboItemActivo"
                                : ""
                        }`}
                        onMouseEnter={() => setIndiceActivo(indice)}
                        onClick={() => seleccionarItem(item)}
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
