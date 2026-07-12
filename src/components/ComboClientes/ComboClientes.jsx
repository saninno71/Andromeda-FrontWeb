import { useEffect,useRef,useState } from "react";
import InputComboBusqueda from "../InputComboBusqueda/InputComboBusqueda";
import { cargarClientes } from "../services/clientesService";
import iconFlechaC from "../../assets/iconFlechaC.png";

function formatearCliente(cliente) {

    if (!cliente) {
        return "";
    }

    return `${cliente.clienteCodigo} - ${cliente.clienteNombre}`;

}

function ComboClientes({
    titulo = "Cliente",
    valor,
    onChange,
    onEnter,
    tabIndex
}) {

    const [texto,setTexto] = useState(formatearCliente(valor));
    const [clientes,setClientes] = useState([]);
    const refLimpiezaPorEscritura = useRef(false);

    useEffect(() => {
        if (!valor && refLimpiezaPorEscritura.current) {
            refLimpiezaPorEscritura.current = false;
            return;
        }

        setTexto(formatearCliente(valor));
    }, [valor]);

    useEffect(() => {

        let cancelado = false;
        const abortController = new AbortController();

        async function buscarClientes() {
            if (texto.length < 2 || valor) {
                setClientes([]);
                return;
            }

            const datos = await cargarClientes(
                texto,
                abortController.signal
            );

            if (!cancelado) {
                setClientes(datos);
            }
        }

        const timeoutBusqueda =
            window.setTimeout(buscarClientes,500);

        return () => {
            cancelado = true;
            abortController.abort();
            window.clearTimeout(timeoutBusqueda);
        };

    }, [texto,valor]);

    function cambiarTexto(nuevoTexto) {
        setTexto(nuevoTexto);
        refLimpiezaPorEscritura.current = true;
        onChange(null);
    }

    function seleccionarCliente(cliente) {
        setTexto(formatearCliente(cliente));
        setClientes([]);
        onChange(cliente);
    }

    return (
        <InputComboBusqueda
            titulo={titulo}
            valor={texto}
            items={clientes}
            campoID="clienteID"
            campoCodigo="clienteCodigo"
            campoDescripcion="clienteNombre"
            icono={<img src={iconFlechaC} />}
            onChange={cambiarTexto}
            onSeleccionar={seleccionarCliente}
            onEnter={onEnter}
            tabIndex={tabIndex}
        />
    );

}

export default ComboClientes;
