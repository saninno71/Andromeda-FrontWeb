import { useEffect, useState } from "react";
import { formatearNumeracion, obtenerNumeraciones } from "./numeracion.funcional.js";

export default function useNumeracion({ valor, onChange }) {
    const [numeraciones, setNumeraciones] = useState([]);

    useEffect(() => {
        let cancelado = false;
        async function cargarOpciones() {
            const datos = await obtenerNumeraciones();
            if (!cancelado) setNumeraciones(datos);
        }
        cargarOpciones();
        return () => { cancelado = true; };
    }, []);

    function seleccionarNumeracion(numeracion) {
        onChange(numeracion);
    }

    return {
        numeraciones,
        texto: formatearNumeracion(valor),
        seleccionarNumeracion
    };
}
