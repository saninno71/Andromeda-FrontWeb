import {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useRef,
    useState
} from "react";
import "./InputFecha.css";
import DatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";

function formatearFecha(fecha) {

    if (!(fecha instanceof Date) || isNaN(fecha.getTime())) {
        return "";
    }

    const dia =
        String(fecha.getDate()).padStart(2,"0");

    const mes =
        String(fecha.getMonth() + 1).padStart(2,"0");

    const anio =
        String(fecha.getFullYear()).padStart(4,"0");

    return `${dia}/${mes}/${anio}`;

}

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
    const refCambioManual = useRef(false);
    const refFiltrarLuegoDeCambio = useRef(false);
    const [textoFecha,setTextoFecha] = useState(
        formatearFecha(valor)
    );

    useEffect(() => {
        setTextoFecha(formatearFecha(valor));
    }, [valor]);

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

        if (e?.target?.tagName !== "INPUT") {
            return;
        }

        refCambioManual.current = true;

        const digitos =
            e.target.value
            .replace(/\D/g, "")
            .slice(0,8);

        if (digitos.length === 0) {
            onChange(null);
            setTextoFecha("");
            window.setTimeout(() => {
                refCambioManual.current = false;
            },0);
            return;
        }

        let valor = digitos;

        if (digitos.length > 2) {
            valor = digitos.slice(0, 2) + "/" + digitos.slice(2);
        }

        if (digitos.length > 4) {
            valor =
                digitos.slice(0, 2) +
                "/" +
                digitos.slice(2, 4) +
                "/" +
                digitos.slice(4);
        }

        setTextoFecha(valor);

        if (digitos.length !== 8) {
            window.setTimeout(() => {
                refCambioManual.current = false;
            },0);
            return;
        }

        const dia = Number(digitos.slice(0,2));
        const mes = Number(digitos.slice(2,4));
        const anio = Number(digitos.slice(4,8));
        const fecha = new Date(anio,mes - 1,dia);

        const esFechaValida =
            fecha.getFullYear() === anio &&
            fecha.getMonth() === mes - 1 &&
            fecha.getDate() === dia;

        if (esFechaValida) {
            onChange(fecha);
        }

        window.setTimeout(() => {
            refCambioManual.current = false;
        },0);
    }

    function manejarCambio(fecha) {

        if (refCambioManual.current) {
            return;
        }

        setTextoFecha(formatearFecha(fecha));
        onChange(fecha);
        datePickerRef.current?.setOpen(false);

        if (refFiltrarLuegoDeCambio.current) {
            refFiltrarLuegoDeCambio.current = false;
            window.setTimeout(() => {
                onEnter?.();
            },0);
        }

    }

    function manejarTecla(e) {

        if (e.key === "Enter") {
            e.stopPropagation();

            const calendarioAbierto =
                Boolean(
                    document.querySelector(".react-datepicker-popper")
                );

            if (calendarioAbierto) {
                refFiltrarLuegoDeCambio.current = true;
                return;
            }

            onEnter?.();
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
                        value={textoFecha}
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
