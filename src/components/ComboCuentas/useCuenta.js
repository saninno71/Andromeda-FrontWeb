import { useEffect, useState } from "react";
import {
    buscarCuentas,
    DEMORA_BUSQUEDA_CUENTAS,
    formatearCuenta,
    obtenerTextoCuenta,
    puedeBuscarCuenta
} from "./cuenta.funcional";
import {
    crearBorradorDesdeEscritura,
    crearBorradorDesdeValor,
    esBusquedaIniciadaPorUsuario
} from "../EntidadBusqueda/busquedaEntidad.funcional.js";

export default function useCuenta({ valor, empresaID, onChange }) {
    const [borrador, setBorrador] = useState(() =>
        crearBorradorDesdeValor(valor, formatearCuenta)
    );
    const texto = obtenerTextoCuenta(valor, borrador);
    const [cuentas, setCuentas] = useState([]);
    const [buscando, setBuscando] = useState(false);
    const [error, setError] = useState(null);

    // Registrar el cambio externo evita reutilizar un borrador antiguo
    // si posteriormente se vuelve a seleccionar o limpiar la misma cuenta.
    if (!Object.is(valor, borrador.valor)) {
        setBorrador(crearBorradorDesdeValor(valor, formatearCuenta));
    }

    useEffect(() => {
        let cancelado = false;
        const controller = new AbortController();
        const buscarPorEscritura =
            esBusquedaIniciadaPorUsuario(borrador) &&
            puedeBuscarCuenta(texto, valor);
        if (!buscarPorEscritura) return;

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
    }, [texto, empresaID, valor, borrador]);

    function cambiarTexto(nuevoTexto) {
        setBorrador(crearBorradorDesdeEscritura(nuevoTexto));
        setCuentas([]);
        setError(null);
        setBuscando(nuevoTexto.trim().length >= 2);
        onChange(null);
    }

    function seleccionarCuenta(cuenta) {
        setBorrador(crearBorradorDesdeValor(cuenta, formatearCuenta));
        setCuentas([]);
        setError(null);
        setBuscando(false);
        onChange(cuenta);
    }

    const mensajeVacio = valor || texto.trim().length < 2
        ? "Escribí al menos 2 caracteres para buscar"
        : error || (buscando ? "Buscando…" : "Sin resultados");
    return {
        texto,
        cuentas:esBusquedaIniciadaPorUsuario(borrador) ? cuentas : [],
        cambiarTexto,
        seleccionarCuenta,
        mensajeVacio
    };
}
