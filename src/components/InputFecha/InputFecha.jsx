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

    return (

        <div className="inputFecha">

            <div className="inputFechaContenido">

                <div className="inputFechaTexto">

                    <div className="inputFechaTitulo">
                        {titulo}
                    </div>

                    <DatePicker
                        ref={datePickerRef}
                        selected={valor}
                        onChange={onChange}
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