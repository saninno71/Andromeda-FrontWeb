import useNumeracion from "./useNumeracion.js";
import EditorEntidadCelda from "../EditorEntidadCelda/EditorEntidadCelda";

export default function NumeracionEditorCelda({ valor, contexto = {}, onChange, ...interaccion }) {
    const { texto, numeraciones, seleccionarNumeracion } = useNumeracion({ valor, onChange, empresaID: contexto.empresaID });
    return <EditorEntidadCelda {...interaccion} etiqueta="Numeracion" texto={texto} items={numeraciones}
        campoID="numeraTipoID" campoNombre="descripcion" 
        seleccionar={seleccionarNumeracion} />;
}
