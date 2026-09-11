import useCliente from "./useCliente.js";
import EditorEntidadCelda from "../EditorEntidadCelda/EditorEntidadCelda";

export default function ClienteEditorCelda({ valor, contexto = {}, onChange, ...interaccion }) {
    const { texto, clientes, seleccionarCliente, cambiarTexto } = useCliente({ valor, onChange, empresaID: contexto.empresaID });
    return <EditorEntidadCelda {...interaccion} etiqueta="Cliente" texto={texto} items={clientes}
        campoID="clienteID" campoNombre="clienteNombre" campoCodigo="clienteCodigo" cambiarTexto={cambiarTexto}
        seleccionar={seleccionarCliente} />;
}
