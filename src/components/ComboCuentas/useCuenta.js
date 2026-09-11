import { useEffect, useState } from "react";
import {
    buscarCuentas,
    DEMORA_BUSQUEDA_CUENTAS,
    formatearCuenta,
    obtenerTextoCuenta,
    puedeBuscarCuenta
} from "./cuenta.funcional";

export default function useCuenta({ valor, empresaID, onChange }) {
    const [borrador, setBorrador] = useState(() => ({
        valor,
        texto: formatearCuenta(valor)
    }));
    const texto = obtenerTextoCuenta(valor, borrador);
    const [cuentas, setCuentas] = useState([]);
    const [buscando, setBuscando] = useState(false);
    const [error, setError] = useState(null);

    // Registrar el cambio externo evita reutilizar un borrador antiguo
    // si posteriormente se vuelve a seleccionar o limpiar la misma cuenta.
    if (!Object.is(valor, borrador.valor)) {
        setBorrador({ valor, texto: formatearCuenta(valor) });
    }

    useEffect(() => {
        let cancelado = false;
        const controller = new AbortController();
        setCuentas([]);
        setError(null);
        setBuscando(puedeBuscarCuenta(texto, valor));
        if (!puedeBuscarCuenta(texto, valor)) return;

        const timeout = setTimeout(async () => {
            try {
                const datos = await buscarCuentas({ texto, empresaID, valor, signal: controller.signal });
                if (!cancelado) setCuentas(datos);
            } catch (fallo) {
                if (!cancelado) setError(fallo.message);
            } finally {
                if (!cancelado) setBuscando(false);
            }
        }, DEMORA_BUSQUEDA_CUENTAS);

        return () => {
            cancelado = true;
            controller.abort();
            clearTimeout(timeout);
        };
    }, [texto, empresaID, valor]);

    function cambiarTexto(nuevoTexto) {
        setBorrador({ valor: null, texto: nuevoTexto });
        setCuentas([]);
        onChange(null);
    }

    function seleccionarCuenta(cuenta) {
        setBorrador({ valor: cuenta, texto: formatearCuenta(cuenta) });
        setCuentas([]);
        onChange(cuenta);
    }

    const mensajeVacio = valor || texto.trim().length < 2
        ? "Escribí al menos 2 caracteres para buscar"
        : error || (buscando ? "Buscando…" : "Sin resultados");
    return { texto, cuentas, cambiarTexto, seleccionarCuenta, mensajeVacio };
}
