import { useEffect, useState } from "react";
import { formatearEmpresa, obtenerEmpresas } from "./empresa.funcional.js";

export default function useEmpresa({ valor, onChange }) {
    const [empresas, setEmpresas] = useState([]);

    useEffect(() => {
        let cancelado = false;
        async function cargarOpciones() {
            const datos = await obtenerEmpresas();
            if (!cancelado) setEmpresas(datos);
        }
        cargarOpciones();
        return () => { cancelado = true; };
    }, []);

    function seleccionarEmpresa(empresa) {
        onChange(empresa);
    }

    return {
        empresas,
        texto: formatearEmpresa(valor),
        seleccionarEmpresa
    };
}
