import { useMemo } from "react";
import { gridEditores } from "./gridEditores";
import { obtenerEntidadEditor, obtenerContextoEditor, crearCambiosEntidad } from "./gridEditorCampos";

export default function GridEditorCustom({ columna, fila, onPatch, ...interaccion }) {
    const config = columna.editorConfig;
    const Editor = gridEditores[columna.editor];
    const valor = useMemo(() => config?.campos ? obtenerEntidadEditor(fila, config) : null, [fila, config]);
    if (!Editor || !config?.campos?.[config.campoID] || !config?.campos?.[config.atributoVisible]) {
        return <span role="alert">Editor sin configurar: {columna.editor}</span>;
    }
    return <Editor {...interaccion} textoSeleccionado={valor ? String(valor[config.atributoVisible] ?? "") : undefined} valor={valor} contexto={obtenerContextoEditor(fila, config)}
        onChange={entidad => onPatch(crearCambiosEntidad(entidad, config))} />;
}

