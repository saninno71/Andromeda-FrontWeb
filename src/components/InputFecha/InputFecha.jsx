import { useRef } from "react";
import "./InputFecha.css";
import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";

function InputFecha({
    titulo,
    valor,
    placeholder,
    icono,
    onChange
})

{
    const datePickerRef = useRef(null);

    function manejarCambioManual(e) {

        if (!e?.target?.value) {
            return;
        }

        let valor = e.target.value.replace(/\D/g, "");

        if (valor.length > 2) {
            valor = valor.slice(0, 2) + "/" + valor.slice(2);
        }

        if (valor.length > 4) {
            valor = valor.slice(0, 5) + "/" + valor.slice(5);
        }

        e.target.value = valor;
    }




    return (

        <div className="inputFecha">

            <div className="inputFechaContenido">

                <div className={`inputFechaTexto ${valor ? "conValor" : ""}`}>
                    {console.log("valor:", valor)}

                    <div className="inputFechaTitulo">
                        {titulo}
                    </div>

                    <DatePicker
                        ref={datePickerRef}
                        selected={valor}
                        onChange={onChange}
                        onChangeRaw={manejarCambioManual}
                        dateFormat="dd/MM/yyyy"
                        placeholderText={placeholder}
                        showMonthDropdown
                        showYearDropdown
                        dropdownMode="select"
                        popperPlacement="bottom-start"
                        className="inputFechaInput"
                    />

                </div>

                <div
                    className="inputFechaIcono"
                    onClick={() =>
                        datePickerRef.current?.setOpen(true)
                    }
                >
                    {icono}
                </div>

            </div>

        </div>

    );
}

export default InputFecha;