import { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "./EditorEntidadCelda.css";

export default function EditorEntidadCelda({ texto, items, campoID, campoCodigo,
    campoNombre, cambiarTexto, seleccionar, abierto, onAbrir, onCerrar,
    onConfirmar, onCancelar, etiqueta, textoSeleccionado, mensajeVacio = "Sin resultados" }) {
    const refInput = useRef(null);
    const refLista = useRef(null);
    const [filtro, setFiltro] = useState(null);
    const [indice, setIndice] = useState(0);
    const [posicion, setPosicion] = useState(null);
    const remoto = typeof cambiarTexto === "function";
    const mostrarTexto = item => campoCodigo
        ? `${item[campoCodigo] ?? ""} - ${item[campoNombre] ?? ""}`
        : (item[campoNombre] ?? "");
    const opciones = remoto ? items : items.filter(item =>
        mostrarTexto(item).toLowerCase().includes((filtro ?? "").toLowerCase()));
    const activo = Math.max(0, Math.min(indice, opciones.length - 1));

    useLayoutEffect(() => {
        if (!abierto) return;
        function ubicar() {
            const rect = refInput.current?.getBoundingClientRect();
            if (!rect) return;
            const altura = Math.min(220, window.innerHeight / 2);
            const ancho = Math.min(Math.max(rect.width, 280), window.innerWidth - 16);
            setPosicion({ position: "fixed", width: ancho, maxHeight: altura,
                left: Math.max(8, Math.min(rect.left, window.innerWidth - ancho - 8)),
                top: rect.bottom + altura > window.innerHeight ? Math.max(0, rect.top - altura) : rect.bottom });
        }
        ubicar();
        refInput.current?.select();
        window.addEventListener("resize", ubicar);
        window.addEventListener("scroll", ubicar, true);
        return () => {
            window.removeEventListener("resize", ubicar);
            window.removeEventListener("scroll", ubicar, true);
        };
    }, [abierto]);
    useLayoutEffect(() => {
        refLista.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: "nearest" });
    }, [activo, opciones.length]);

    function elegir(item) {
        seleccionar(item);
        setFiltro(null);
        onCerrar();
    }
    function tecla(e) {
        e.stopPropagation();
        if (e.key === "Escape") { e.preventDefault(); onCancelar(); return; }
        if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault(); onAbrir();
            setIndice(abierto ? Math.max(0, Math.min(opciones.length - 1, activo + (e.key === "ArrowDown" ? 1 : -1))) : 0);
        }
        if (e.key === "Enter") {
            e.preventDefault();
            if (abierto && opciones[activo]) elegir(opciones[activo]);
            else onConfirmar();
        }
        if (e.key === "Tab") onCerrar();
    }
    return <div className="editorEntidadCelda" onClick={e => e.stopPropagation()}>
        <input ref={refInput} aria-label={etiqueta} role="combobox" aria-expanded={abierto}
            value={remoto ? (textoSeleccionado ?? texto) : (abierto ? (filtro ?? textoSeleccionado ?? texto) : (textoSeleccionado ?? texto))}
            onFocus={() => { setFiltro(null); setIndice(0); onAbrir(); }}
            onClick={e => { e.stopPropagation(); e.currentTarget.select(); }}
            onBlur={onCerrar} onKeyDown={tecla}
            onChange={e => { setIndice(0); onAbrir(); remoto ? cambiarTexto(e.target.value) : setFiltro(e.target.value); }} />
        <button type="button" tabIndex={-1} aria-label={`Abrir ${etiqueta}`}
            onMouseDown={e => e.preventDefault()}
            onClick={() => { refInput.current?.focus(); abierto ? onCerrar() : onAbrir(); }}>▾</button>
        {abierto && posicion && createPortal(<div ref={refLista} className="editorEntidadCeldaLista" role="listbox" style={posicion}
            onMouseDown={e => { e.preventDefault(); e.stopPropagation(); }}
            onClick={e => e.stopPropagation()} onWheel={e => e.stopPropagation()}>
            {opciones.length ? opciones.map((item, i) => <div key={item[campoID]} role="option"
                aria-selected={i === activo} onMouseEnter={() => setIndice(i)}
                onMouseDown={e => { e.preventDefault(); e.stopPropagation(); elegir(item); }}>
                {mostrarTexto(item)}
            </div>) : <div role="status">{mensajeVacio}</div>}
        </div>, document.body)}
    </div>;
}

