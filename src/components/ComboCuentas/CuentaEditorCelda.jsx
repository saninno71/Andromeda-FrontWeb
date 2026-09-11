import useCuenta from "./useCuenta.js";
import EditorEntidadCelda from "../EditorEntidadCelda/EditorEntidadCelda";

export default function CuentaEditorCelda({ valor, contexto = {}, onChange, ...interaccion }) {
    const { texto, cuentas, seleccionarCuenta, cambiarTexto, mensajeVacio } = useCuenta({ valor, onChange, empresaID: contexto.empresaID });
    return <EditorEntidadCelda {...interaccion} mensajeVacio={mensajeVacio} etiqueta="Cuenta" texto={texto} items={cuentas}
        campoID="cuentaID" campoNombre="cuentaNombre" campoCodigo="cuentaCodigo" cambiarTexto={cambiarTexto}
        seleccionar={seleccionarCuenta} />;
}
