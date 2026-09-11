import { useEffect, useState } from "react";
import {
    buscarProveedores,
    DEMORA_BUSQUEDA_PROVEEDORES,
    formatearProveedor,
    obtenerTextoProveedor,
    puedeBuscarProveedor
} from "./proveedor.funcional";

export default function useProveedor({ valor, empresaID, onChange }) {
    const [borrador, setBorrador] = useState(() => ({
        valor,
        texto: formatearProveedor(valor)
    }));
    const texto = obtenerTextoProveedor(valor, borrador);
    const [proveedores, setProveedores] = useState([]);

    // Registrar el cambio externo evita reutilizar un borrador antiguo
    // si posteriormente se vuelve a seleccionar o limpiar la misma proveedor.
    if (!Object.is(valor, borrador.valor)) {
        setBorrador({ valor, texto: formatearProveedor(valor) });
    }

    useEffect(() => {
        let cancelado = false;
        const controller = new AbortController();
        setProveedores([]);
        if (!puedeBuscarProveedor(texto, valor)) return;

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
    }, [texto, empresaID, valor]);

    function cambiarTexto(nuevoTexto) {
        setBorrador({ valor: null, texto: nuevoTexto });
        setProveedores([]);
        onChange(null);
    }

    function seleccionarProveedor(proveedor) {
        setBorrador({ valor: proveedor, texto: formatearProveedor(proveedor) });
        setProveedores([]);
        onChange(proveedor);
    }

    return { texto, proveedores, cambiarTexto, seleccionarProveedor };
}
