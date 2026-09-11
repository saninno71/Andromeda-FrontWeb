import useProveedor from "./useProveedor.js";
import EditorEntidadCelda from "../EditorEntidadCelda/EditorEntidadCelda";

export default function ProveedorEditorCelda({ valor, contexto = {}, onChange, ...interaccion }) {
    const { texto, proveedores, seleccionarProveedor, cambiarTexto } = useProveedor({ valor, onChange, empresaID: contexto.empresaID });
    return <EditorEntidadCelda {...interaccion} etiqueta="Proveedor" texto={texto} items={proveedores}
        campoID="proveedorID" campoNombre="proveedorNombre" campoCodigo="proveedorCodigo" cambiarTexto={cambiarTexto}
        seleccionar={seleccionarProveedor} />;
}
