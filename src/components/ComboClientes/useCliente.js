import { useEffect, useState } from "react";
import {
    buscarClientes,
    DEMORA_BUSQUEDA_CLIENTES,
    formatearCliente,
    obtenerTextoCliente,
    puedeBuscarCliente
} from "./cliente.funcional";

export default function useCliente({ valor, onChange }) {
    const [borrador, setBorrador] = useState(() => ({
        valor,
        texto: formatearCliente(valor)
    }));
    const texto = obtenerTextoCliente(valor, borrador);
    const [clientes, setClientes] = useState([]);

    // Registrar el cambio externo evita reutilizar un borrador antiguo
    // si posteriormente se vuelve a seleccionar o limpiar la misma cliente.
    if (!Object.is(valor, borrador.valor)) {
        setBorrador({ valor, texto: formatearCliente(valor) });
    }

    useEffect(() => {
        let cancelado = false;
        const controller = new AbortController();
        setClientes([]);
        if (!puedeBuscarCliente(texto, valor)) return;

        const timeout = setTimeout(async () => {
            const datos = await buscarClientes({
                texto, valor, signal: controller.signal
            });
            if (!cancelado) setClientes(datos);
        }, DEMORA_BUSQUEDA_CLIENTES);

        return () => {
            cancelado = true;
            controller.abort();
            clearTimeout(timeout);
        };
    }, [texto, valor]);

    function cambiarTexto(nuevoTexto) {
        setBorrador({ valor: null, texto: nuevoTexto });
        setClientes([]);
        onChange(null);
    }

    function seleccionarCliente(cliente) {
        setBorrador({ valor: cliente, texto: formatearCliente(cliente) });
        setClientes([]);
        onChange(cliente);
    }

    return { texto, clientes, cambiarTexto, seleccionarCliente };
}
