import CuentaEditorCelda from "../ComboCuentas/CuentaEditorCelda";
import ClienteEditorCelda from "../ComboClientes/ClienteEditorCelda";
import ProveedorEditorCelda from "../ComboProveedores/ProveedorEditorCelda";
import EmpresaEditorCelda from "../ComboEmpresas/EmpresaEditorCelda";
import NumeracionEditorCelda from "../ComboNumeraciones/NumeracionEditorCelda";

export const gridEditores = Object.freeze({
    cuenta: CuentaEditorCelda,
    cliente: ClienteEditorCelda,
    proveedor: ProveedorEditorCelda,
    empresa: EmpresaEditorCelda,
    numeracion: NumeracionEditorCelda
});
