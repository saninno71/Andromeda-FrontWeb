export const MODO_ABM = Object.freeze({
    ALTA: "alta",
    BAJA: "baja",
    CONSULTA: "consulta",
    EDICION: "edicion"
});

export function esModoABM(valor) {
    return Object.values(MODO_ABM).includes(valor);
}

export function esModoEdicion(valor) {
    return valor === MODO_ABM.EDICION || valor === MODO_ABM.ALTA;
}

export function esModoAlta(valor) {
    return valor === MODO_ABM.ALTA;
}

export function esModoBaja(valor) {
    return valor === MODO_ABM.BAJA;
}

export function mostrarAccionesPieABM(valor) {
    return esModoABM(valor) && valor !== MODO_ABM.CONSULTA;
}

export function mostrarAplicarPieABM(valor) {
    return mostrarAccionesPieABM(valor) && valor !== MODO_ABM.ALTA;
}

export function obtenerDisponibilidadAccionesRegistroABM(modo) {
    const altaActiva = modo === MODO_ABM.ALTA;
    const edicionActiva = modo === MODO_ABM.EDICION;

    return Object.freeze({
        nuevo: !altaActiva && !edicionActiva,
        editar: !altaActiva,
        eliminar: !altaActiva && !edicionActiva,
        visualizar: !altaActiva && !edicionActiva,
        navegar: !altaActiva
    });
}
