import GridEditorCustom from "./GridEditorCustom";
import { memo,useEffect,useLayoutEffect,useRef,useState } from "react";
import { createPortal } from "react-dom";
import { obtenerClaseTextoColumna } from "./gridEstilos";
import { formatearValor } from "../updFormatos";

function obtenerValorEditor(fila, columna) {

    return fila[columna.campo] ?? "";

}

function normalizarValorEditor(valor, columna) {

    if (columna.editor === "checkbox") {
        return Boolean(valor);
    }

    if (
        columna.editor === "numero" ||
        columna.formato === "entero"
    ) {
        return valor === ""
            ? null
            : Number(valor);
    }

    if (
        columna.editor === "decimal" ||
        columna.formato === "decimal"
    ) {
        return valor === ""
            ? null
            : Number(valor);
    }

    return valor;

}

function GridComboEditor({
    valor,
    opciones,
    columna,
    abierto,
    onAbrir,
    onCerrar,
    onDraftChange,
    onConfirmarEdicionFila,
    onCancelarEdicionFila,
    onClickSimpleFila
}) {

    const refCombo = useRef(null);
    const indiceSeleccionado =
        opciones.findIndex(opcion => opcion.valor === valor);

    const [indiceActivo,setIndiceActivo] =
        useState(Math.max(0,indiceSeleccionado));
    const [posicionLista,setPosicionLista] = useState(null);

    useEffect(() => {

        setIndiceActivo(Math.max(0,indiceSeleccionado));

    }, [indiceSeleccionado]);

    useLayoutEffect(() => {

        if (!abierto || !refCombo.current) {
            return;
        }

        const rect = refCombo.current.getBoundingClientRect();

        setPosicionLista({
            top:rect.bottom,
            left:rect.left,
            width:rect.width
        });

    }, [abierto,valor]);

    function seleccionarOpcion(opcion) {

        onDraftChange(
            columna.campo,
            normalizarValorEditor(
                opcion.valor,
                columna
            )
        );

        onCerrar();

    }

    function manejarTecla(evento) {

        if (evento.key === "ArrowDown") {
            evento.preventDefault();
            evento.stopPropagation();
            onAbrir();
            setIndiceActivo(indice =>
                Math.min(opciones.length - 1,indice + 1)
            );
            return;
        }

        if (evento.key === "ArrowUp") {
            evento.preventDefault();
            evento.stopPropagation();
            onAbrir();
            setIndiceActivo(indice =>
                Math.max(0,indice - 1)
            );
            return;
        }

        if (evento.key === "Enter") {
            evento.preventDefault();
            evento.stopPropagation();

            if (abierto && opciones[indiceActivo]) {
                seleccionarOpcion(opciones[indiceActivo]);
                return;
            }

            onConfirmarEdicionFila?.();
            return;
        }

        if (evento.key === "Escape") {
            evento.preventDefault();
            evento.stopPropagation();
            onCancelarEdicionFila?.();
        }

    }

    const opcionSeleccionada =
        opciones.find(opcion => opcion.valor === valor);

    return (
        <div
            ref={refCombo}
            className="grillaEditorCombo"
            tabIndex={0}
            onClick={(evento) => {
                evento.stopPropagation();
                if (abierto) {
                    onCerrar();
                    return;
                }

                onAbrir();
            }}
            onKeyDown={manejarTecla}
        >
            <div className="grillaEditorComboTexto">
                {opcionSeleccionada?.texto ?? ""}
            </div>

            <div className={`grillaEditorComboFlecha ${abierto ? "abierto" : ""}`}></div>

            {abierto && posicionLista && createPortal(
                <div
                    className="grillaEditorComboLista"
                    style={{
                        top:posicionLista.top + "px",
                        left:posicionLista.left + "px",
                        width:posicionLista.width + "px"
                    }}
                    onMouseDown={(evento) => {
                        evento.preventDefault();
                        evento.stopPropagation();
                    }}
                >
                    {opciones.map((opcion,indice) => (
                        <div
                            key={opcion.valor}
                            className={`grillaEditorComboItem ${
                                indice === indiceActivo
                                    ? "grillaEditorComboItemActivo"
                                    : ""
                            }`}
                            onMouseEnter={() => setIndiceActivo(indice)}
                            onMouseDown={(evento) => {
                                evento.preventDefault();
                                evento.stopPropagation();
                                seleccionarOpcion(opcion);
                            }}
                        >
                            {opcion.texto}
                        </div>
                    ))}
                </div>,
                document.body
            )}
        </div>
    );

}

function GridFila({
    fila,
    indiceFila,
    keyFila,
    claseFila,
    claseMenuFila,
    mostrarCheck,
    anchoColumnaCheck,
    columnas,
    checked,
    cambiarCheckFila,
    seleccionarFila,
    refPrimeraCeldaDatos,
    estiloColumna,
    estiloEspacioFinal,
    editable = false,
    celdasModificadas = null,
    filaEditando = false,
    filaDraft = null,
    onDraftPatch,
    onDraftChange,
    onConfirmarEdicionFila,
    onCancelarEdicionFila,
    onClickSimpleFila
}) {

    const [comboAbiertoCampo,setComboAbiertoCampo] = useState(null);

    function puedeEditarColumna(columna) {

        return (
            editable &&
            filaEditando &&
            columna.editable === true &&
            typeof onDraftChange === "function"
        );

    }

    function manejarTeclaEditor(evento) {

        if (evento.key === "Enter") {
            evento.preventDefault();
            onConfirmarEdicionFila?.();
            return;
        }

        if (evento.key === "Escape") {
            evento.preventDefault();
            onCancelarEdicionFila?.();
        }

    }

    function seleccionarContenidoEditor(evento) {

        if (evento.target.type === "date") {
            return;
        }

        evento.target.select?.();

    }

    useEffect(() => {

        if (!filaEditando) {
            setComboAbiertoCampo(null);
        }

    }, [filaEditando]);

    function renderEditor(columna) {
        const valorEditando =
            filaDraft?.[columna.campo] ?? "";

        const basicos = ["texto", "numero", "decimal", "fecha", "checkbox", "combo"];
        if (columna.editor && !basicos.includes(columna.editor)) {
            return <GridEditorCustom columna={columna} fila={filaDraft}
                onPatch={onDraftPatch} abierto={comboAbiertoCampo === columna.campo}
                onAbrir={() => setComboAbiertoCampo(columna.campo)}
                onCerrar={() => setComboAbiertoCampo(null)}
                onConfirmar={onConfirmarEdicionFila} onCancelar={onCancelarEdicionFila} />;
        }

        if (columna.editor === "combo") {
            const opciones = columna.editorConfig?.items ?? [];

            return (
                <GridComboEditor
                    valor={valorEditando}
                    opciones={opciones}
                    columna={columna}
                    abierto={comboAbiertoCampo === columna.campo}
                    onAbrir={() => setComboAbiertoCampo(columna.campo)}
                    onCerrar={() => setComboAbiertoCampo(null)}
                    onDraftChange={onDraftChange}
                    onConfirmarEdicionFila={onConfirmarEdicionFila}
                    onCancelarEdicionFila={onCancelarEdicionFila}
                />
            );
        }

        if (columna.editor === "checkbox") {
            return (
                <input
                    className="grillaEditorCheck"
                    type="checkbox"
                    checked={Boolean(valorEditando)}
                    onClick={(evento) => evento.stopPropagation()}
                    onChange={(evento) => {
                        onDraftChange(columna.campo,evento.target.checked);
                    }}
                    onKeyDown={manejarTeclaEditor}
                />
            );
        }

        const tipoInput =
            columna.editor === "fecha"
                ? "date"
                : (
                    columna.editor === "numero" ||
                    columna.editor === "decimal"
                        ? "number"
                        : "text"
                );

        return (
            <input
                className="grillaEditor"
                type={tipoInput}
                value={valorEditando}
                onFocus={seleccionarContenidoEditor}
                onClick={(evento) => {
                    evento.stopPropagation();
                    seleccionarContenidoEditor(evento);
                }}
                onChange={(evento) => {
                    onDraftChange(
                        columna.campo,
                        normalizarValorEditor(
                            evento.target.value,
                            columna
                        )
                    );
                }}
                onKeyDown={manejarTeclaEditor}
            />
        );

    }

    return (
        <tr
            className={`
                ${claseFila}
                ${claseMenuFila}
                ${filaEditando ? "filaEditando" : ""}
            `}
            key={keyFila}
            data-key={keyFila}
            onDoubleClick={(e) => {
                if (!filaEditando) {
                    seleccionarFila(fila,e);
                }
            }}
        >

            {mostrarCheck && (
                <td
                    className="grillaCheckCelda"
                    style={{
                        width: anchoColumnaCheck + "px",
                        minWidth: anchoColumnaCheck + "px",
                        maxWidth: anchoColumnaCheck + "px"
                    }}
                >
                    <input
                        type="checkbox"
                        data-grid-check-row={indiceFila}
                        checked={checked}
                        onChange={() => {}}
                        onClick={(e) => {
                            e.stopPropagation();
                            cambiarCheckFila(keyFila,e);
                        }}
                        onKeyDown={(e) => {
                            if (e.key === " ") {
                                e.preventDefault();
                                e.stopPropagation();
                                cambiarCheckFila(keyFila,e);
                            }
                        }}
                    />
                </td>
            )}

            {
                columnas.map(
                    (columna,indiceColumna) => {
                        const editando =
                            puedeEditarColumna(columna);
                        const editandoCombo =
                            editando && columna.editor === "combo";

                        const celdaModificada =
                            celdasModificadas?.has?.(
                                `${keyFila}|${columna.campo}`
                            );

                        return (
                        <td
                            key={columna.campo}
                            data-grid-row={indiceFila}
                            data-grid-col={indiceColumna}
                            ref={
                                indiceFila === 0 &&
                                indiceColumna === 0
                                    ? refPrimeraCeldaDatos
                                    : null
                            }
                            tabIndex={
                                indiceFila === 0 &&
                                indiceColumna === 0
                                    ? 0
                                    : -1
                            }
                            style={{
                                ...estiloColumna(columna),
                                position:"relative"
                            }}
                            className={`
                                ${obtenerClaseTextoColumna(columna)}
                                grillaCeldaDatos
                                ${editable && columna.editable === true ? "grillaCeldaEditable" : ""}
                                ${editando ? "grillaCeldaEditando" : ""}
                                ${editandoCombo ? "grillaCeldaEditandoCombo" : ""}
                                ${celdaModificada ? "grillaCeldaModificada" : ""}
                            `}
                            onClick={(e) => {
                                onClickSimpleFila?.(fila,keyFila);
                                e.currentTarget.focus();
                            }}
                        >
                            {
                                editando
                                    ? renderEditor(columna)
                                    : (
                                        <span className="contenidoCelda">
                                            {formatearValor(
                                                fila[columna.campo],
                                                columna.formato,
                                                columna.mascara
                                            )}
                                        </span>
                                    )
                            }
                        </td>
                        );
                    }
                )
            }

            <td style={estiloEspacioFinal}></td>

        </tr>
    );

}

export default memo(GridFila);
