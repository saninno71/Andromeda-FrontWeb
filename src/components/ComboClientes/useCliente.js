import { useEffect, useState } from "react";
import {
    buscarClientes,
    DEMORA_BUSQUEDA_CLIENTES,
    formatearCliente,
    obtenerTextoCliente,
    puedeBuscarCliente
} from "./cliente.funcional";
import {
    crearBorradorDesdeEscritura,
    crearBorradorDesdeValor,
    esBusquedaIniciadaPorUsuario
} from "../EntidadBusqueda/busquedaEntidad.funcional.js";

export default function useCliente({ valor, onChange }) {
    const [borrador, setBorrador] = useState(() =>
        crearBorradorDesdeValor(valor, formatearCliente)
    );
    const texto = obtenerTextoCliente(valor, borrador);
    const [clientes, setClientes] = useState([]);

    // Registrar el cambio externo evita reutilizar un borrador antiguo
    // si posteriormente se vuelve a seleccionar o limpiar la misma cliente.
    if (!Object.is(valor, borrador.valor)) {
        setBorrador(crearBorradorDesdeValor(valor, formatearCliente));
    }

    useEffect(() => {
        let cancelado = false;
        const controller = new AbortController();
        if (
            !esBusquedaIniciadaPorUsuario(borrador) ||
            !puedeBuscarCliente(texto, valor)
        ) return;

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
    }, [texto, valor, borrador]);

    function cambiarTexto(nuevoTexto) {
        setBorrador(crearBorradorDesdeEscritura(nuevoTexto));
        setClientes([]);
        onChange(null);
    }

    function seleccionarCliente(cliente) {
        setBorrador(crearBorradorDesdeValor(cliente, formatearCliente));
        setClientes([]);
        onChange(cliente);
    }

    return {
        texto,
        clientes:esBusquedaIniciadaPorUsuario(borrador) ? clientes : [],
        cambiarTexto,
        seleccionarCliente
    };
}
