import { useEffect, useState } from "react";
import {
    buscarProveedores,
    DEMORA_BUSQUEDA_PROVEEDORES,
    formatearProveedor,
    obtenerTextoProveedor,
    puedeBuscarProveedor
} from "./proveedor.funcional";
import {
    crearBorradorDesdeEscritura,
    crearBorradorDesdeValor,
    esBusquedaIniciadaPorUsuario
} from "../EntidadBusqueda/busquedaEntidad.funcional.js";

export default function useProveedor({ valor, empresaID, onChange }) {
    const [borrador, setBorrador] = useState(() =>
        crearBorradorDesdeValor(valor, formatearProveedor)
    );
    const texto = obtenerTextoProveedor(valor, borrador);
    const [proveedores, setProveedores] = useState([]);

    // Registrar el cambio externo evita reutilizar un borrador antiguo
    // si posteriormente se vuelve a seleccionar o limpiar la misma proveedor.
    if (!Object.is(valor, borrador.valor)) {
        setBorrador(crearBorradorDesdeValor(valor, formatearProveedor));
    }

    useEffect(() => {
        let cancelado = false;
        const controller = new AbortController();
        if (
            !esBusquedaIniciadaPorUsuario(borrador) ||
            !puedeBuscarProveedor(texto, valor)
        ) return;

        const timeout = setTimeout(async () => {
            const datos = await buscarProveedores({
                texto, empresaID, valor, signal: controller.signal
            });
            if (!cancelado) setProveedores(datos);
        }, DEMORA_BUSQUEDA_PROVEEDORES);

        return () => {
            cancelado = true;
            controller.abort();
            clearTimeout(timeout);
        };
    }, [texto, empresaID, valor, borrador]);

    function cambiarTexto(nuevoTexto) {
        setBorrador(crearBorradorDesdeEscritura(nuevoTexto));
        setProveedores([]);
        onChange(null);
    }

    function seleccionarProveedor(proveedor) {
        setBorrador(crearBorradorDesdeValor(proveedor, formatearProveedor));
        setProveedores([]);
        onChange(proveedor);
    }

    return {
        texto,
        proveedores:esBusquedaIniciadaPorUsuario(borrador) ? proveedores : [],
        cambiarTexto,
        seleccionarProveedor
    };
}
