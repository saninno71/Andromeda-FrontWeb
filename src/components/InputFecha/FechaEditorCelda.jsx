import { useMemo } from "react";
import InputFecha from "./InputFecha";
import iconCalendario from "../../assets/btnCalendar.png";
import "./FechaEditorCelda.css";

export default function FechaEditorCelda({ valor, onChange, onConfirmar, onCancelar }) {
    const fecha = useMemo(() => {
        if (!valor?.fecha) return null;
        const actual = valor.fecha instanceof Date ? valor.fecha : new Date(valor.fecha);
        return Number.isNaN(actual.getTime()) ? null : actual;
    }, [valor?.fecha]);
    function seleccionar(nuevaFecha) {
        if (!nuevaFecha) { onChange(null); return; }
        // Mantener la fecha civil, sin convertir a UTC ni desplazar el día.
        const anio = nuevaFecha.getFullYear();
        const mes = String(nuevaFecha.getMonth() + 1).padStart(2, "0");
        const dia = String(nuevaFecha.getDate()).padStart(2, "0");
        onChange({ fecha: `${anio}-${mes}-${dia}T00:00:00` });
    }
    return <InputFecha titulo="Fecha" variante="celda" valor={fecha} onChange={seleccionar}
        onEnter={onConfirmar} onCancelar={onCancelar} portalId="calendarios-grilla"
        icono={<img src={iconCalendario} alt="Abrir calendario" />} />;
}
