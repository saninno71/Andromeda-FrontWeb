import { crearABMAsientos } from "./abmAsientos.funcional.js";
import {
    actualizarAsientoPorId,
    cargarAsientoPorId,
    crearAsiento,
    eliminarAsientoPorId
} from "./abmAsientosService.js";

export function crearModeloABMAsientos(comprobanteID, modo) {
    return crearABMAsientos({
        comprobanteID,
        modo,
        cargarAsiento: cargarAsientoPorId,
        actualizarAsiento: actualizarAsientoPorId,
        crearAsiento,
        eliminarAsiento: eliminarAsientoPorId
    });
}
