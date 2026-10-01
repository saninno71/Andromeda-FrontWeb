import { useLayoutEffect, useRef, useState } from "react";
import {
    analizarTextoEditorDecimal,
    calcularCursorEditorDecimal,
    formatearValorEditorDecimal
} from "./gridEditorDecimal.js";

export default function GridEditorDecimal({
    valor,
    mascara,
    onChange,
    onKeyDown
}) {
    const refInput = useRef(null);
    const cursorPendiente = useRef(null);
    const ultimoValorEmitido = useRef(valor);
    const [texto, setTexto] = useState(() => formatearValorEditorDecimal(valor, mascara));

    useLayoutEffect(() => {
        if (cursorPendiente.current == null || !refInput.current) return;
        refInput.current.setSelectionRange(cursorPendiente.current, cursorPendiente.current);
        cursorPendiente.current = null;
    }, [texto]);

    function aplicarTexto(textoIngresado, cursor) {
        const resultado = analizarTextoEditorDecimal(textoIngresado, mascara);
        cursorPendiente.current = calcularCursorEditorDecimal(
            textoIngresado,
            cursor,
            resultado.texto
        );
        setTexto(resultado.texto);
        ultimoValorEmitido.current = resultado.valor;
        onChange(resultado.valor);
    }

    return (
        <input
            ref={refInput}
            className="grillaEditor"
            type="text"
            inputMode="decimal"
            value={texto}
            onFocus={evento => evento.target.select()}
            onClick={evento => evento.stopPropagation()}
            onChange={evento => aplicarTexto(evento.target.value, evento.target.selectionStart)}
            onBlur={() => setTexto(formatearValorEditorDecimal(ultimoValorEmitido.current, mascara))}
            onKeyDown={evento => {
                if (evento.key === "." && !evento.ctrlKey && !evento.metaKey && !evento.altKey) {
                    evento.preventDefault();
                    const inicio = evento.currentTarget.selectionStart ?? texto.length;
                    const fin = evento.currentTarget.selectionEnd ?? inicio;
                    const siguiente = `${texto.slice(0, inicio)},${texto.slice(fin)}`;
                    aplicarTexto(siguiente, inicio + 1);
                    return;
                }
                onKeyDown?.(evento);
            }}
        />
    );
}
