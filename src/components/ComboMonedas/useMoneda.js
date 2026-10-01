import { useEffect, useState } from "react";
import {
    buscarMonedas,
    DEMORA_BUSQUEDA_MONEDAS,
    formatearMoneda,
    obtenerTextoMoneda,
    puedeBuscarMoneda
} from "./moneda.funcional.js";
import {
    crearBorradorDesdeEscritura,
    crearBorradorDesdeValor,
    esBusquedaIniciadaPorUsuario
} from "../EntidadBusqueda/busquedaEntidad.funcional.js";

export default function useMoneda({ valor, onChange }) {
    const [borrador, setBorrador] = useState(() =>
        crearBorradorDesdeValor(valor, formatearMoneda)
    );
    const texto = obtenerTextoMoneda(valor, borrador);
    const [monedas, setMonedas] = useState([]);

    if (!Object.is(valor, borrador.valor)) {
        setBorrador(crearBorradorDesdeValor(valor, formatearMoneda));
    }

    useEffect(() => {
        let cancelado = false;
        const controller = new AbortController();
        if (!esBusquedaIniciadaPorUsuario(borrador) || !puedeBuscarMoneda(texto, valor)) return;

        const timeout = setTimeout(async () => {
            const datos = await buscarMonedas({ texto, valor, signal: controller.signal });
            if (!cancelado) setMonedas(datos);
        }, DEMORA_BUSQUEDA_MONEDAS);

        return () => {
            cancelado = true;
            controller.abort();
            clearTimeout(timeout);
        };
    }, [texto, valor, borrador]);

    function cambiarTexto(nuevoTexto) {
        setBorrador(crearBorradorDesdeEscritura(nuevoTexto));
        setMonedas([]);
        onChange(null);
    }

    function seleccionarMoneda(moneda) {
        setBorrador(crearBorradorDesdeValor(moneda, formatearMoneda));
        setMonedas([]);
        onChange(moneda);
    }

    return {
        texto,
        monedas: esBusquedaIniciadaPorUsuario(borrador) ? monedas : [],
        cambiarTexto,
        seleccionarMoneda
    };
}
