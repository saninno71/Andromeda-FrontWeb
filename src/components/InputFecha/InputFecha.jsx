import { forwardRef,useImperativeHandle,useRef } from "react";
import "./InputFecha.css";
import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";

const InputFecha = forwardRef(function InputFecha({
    titulo,
    valor,
    placeholder,
    icono,
    onChange,
    onEnter,
    tabIndex
},ref)

{
    const datePickerRef = useRef(null);
    const contenedorRef = useRef(null);

    useImperativeHandle(ref,() => ({
        focus() {
            const input =
                contenedorRef.current?.querySelector("input");

            input?.focus();
        },
        focusSinAbrir() {
            const input =
                contenedorRef.current?.querySelector("input");

            input?.focus();
            datePickerRef.current?.setOpen(false);

            window.setTimeout(() => {
                datePickerRef.current?.setOpen(false);
            },0);
        }
    }),[]);

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

    function manejarCambio(fecha) {

        onChange(fecha);
        datePickerRef.current?.setOpen(false);

    }

    function manejarTecla(e) {

        if (e.key === "Enter") {
            window.setTimeout(() => {
                datePickerRef.current?.setOpen(false);
                onEnter?.();
            },0);
        }

    }




    return (

        <div className="inputFecha" ref={contenedorRef}>

            <div className="inputFechaContenido">

                <div className={`inputFechaTexto ${valor ? "conValor" : ""}`}>

                    <div className="inputFechaTitulo">
                        {titulo}
                    </div>

                    <DatePicker
                        ref={datePickerRef}
                        selected={valor}
                        onChange={manejarCambio}
                        onChangeRaw={manejarCambioManual}
                        onKeyDown={manejarTecla}
                        dateFormat="dd/MM/yyyy"
                        placeholderText={placeholder}
                        showMonthDropdown
                        showYearDropdown
                        dropdownMode="select"
                        popperPlacement="bottom-start"
                        className="inputFechaInput"
                        tabIndex={tabIndex}
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
});

export default InputFecha;
