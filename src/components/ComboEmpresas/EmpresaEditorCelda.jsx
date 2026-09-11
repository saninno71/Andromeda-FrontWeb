import useEmpresa from "./useEmpresa.js";
import EditorEntidadCelda from "../EditorEntidadCelda/EditorEntidadCelda";

export default function EmpresaEditorCelda({ valor, contexto = {}, onChange, ...interaccion }) {
    const { texto, empresas, seleccionarEmpresa } = useEmpresa({ valor, onChange, empresaID: contexto.empresaID });
    return <EditorEntidadCelda {...interaccion} etiqueta="Empresa" texto={texto} items={empresas}
        campoID="empresaID" campoNombre="empresaNombre" 
        seleccionar={seleccionarEmpresa} />;
}
