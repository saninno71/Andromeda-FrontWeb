import { useEffect,useRef,useState } from "react";
import InputComboBusqueda from "../InputComboBusqueda/InputComboBusqueda";
import { cargarCuentas } from "../services/cuentasService";
import iconFlechaC from "../../assets/iconFlechaC.png";

function formatearCuenta(cuenta) {

    if (!cuenta) {
        return "";
    }

    return `${cuenta.cuentaCodigo} - ${cuenta.cuentaNombre}`;

}

function ComboCuentas({
    titulo = "Cuenta",
    valor,
    empresaID,
    onChange,
    onEnter,
    tabIndex
}) {

    const [texto,setTexto] = useState(formatearCuenta(valor));
    const [cuentas,setCuentas] = useState([]);
    const refLimpiezaPorEscritura = useRef(false);

    useEffect(() => {
        if (!valor && refLimpiezaPorEscritura.current) {
            refLimpiezaPorEscritura.current = false;
            return;
        }

        setTexto(formatearCuenta(valor));
    }, [valor]);

    useEffect(() => {

        let cancelado = false;

        async function buscarCuentas() {
            if (texto.length < 2 || valor) {
                setCuentas([]);
                return;
            }

            const datos = await cargarCuentas(texto,empresaID);

            if (!cancelado) {
                setCuentas(datos);
            }
        }

        const timeoutBusqueda =
            window.setTimeout(buscarCuentas,500);

        return () => {
            cancelado = true;
            window.clearTimeout(timeoutBusqueda);
        };

    }, [texto,empresaID,valor]);

    function cambiarTexto(nuevoTexto) {
        setTexto(nuevoTexto);
        refLimpiezaPorEscritura.current = true;
        onChange(null);
    }

    function seleccionarCuenta(cuenta) {
        setTexto(formatearCuenta(cuenta));
        setCuentas([]);
        onChange(cuenta);
    }

    return (
        <InputComboBusqueda
            titulo={titulo}
            valor={texto}
            items={cuentas}
            campoID="cuentaID"
            campoCodigo="cuentaCodigo"
            campoDescripcion="cuentaNombre"
            icono={<img src={iconFlechaC} />}
            onChange={cambiarTexto}
            onSeleccionar={seleccionarCuenta}
            onEnter={onEnter}
            tabIndex={tabIndex}
        />
    );

}

export default ComboCuentas;
