import { obtenerDisponibilidadAccionesRegistroABM } from "../../../components/ABM/modosABM.js";

export function obtenerPresentacionCintaAsientos(modo) {
    const disponibilidad = obtenerDisponibilidadAccionesRegistroABM(modo);

    return Object.freeze({
        deshabilitarNuevo: !disponibilidad.nuevo,
        deshabilitarEdicion: !disponibilidad.editar,
        deshabilitarEliminacion: !disponibilidad.eliminar,
        deshabilitarConsulta: !disponibilidad.visualizar,
        deshabilitarNavegacion: !disponibilidad.navegar
    });
}
