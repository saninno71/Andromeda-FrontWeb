import { crearABMEmpresas } from "./abmEmpresas.funcional.js";
import { cargarEmpresaPorId } from "../services/empresasService.js";

export function crearModeloABMEmpresas(empresaID) {
    return crearABMEmpresas({
        empresaID,
        cargarEmpresa: cargarEmpresaPorId
    });
}
