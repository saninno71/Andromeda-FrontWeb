export function obtenerEntidadEditor(fila, config) {
    const entidad = Object.fromEntries(Object.entries(config.campos).map(([atributo, campo]) => [atributo, fila[campo]]));
    return entidad[config.campoID] == null ? null : entidad;
}
export function obtenerContextoEditor(fila, config) {
    return Object.fromEntries(Object.entries(config.contexto ?? {}).map(([atributo, campo]) => [atributo, fila[campo]]));
}
export function crearCambiosEntidad(entidad, config) {
    return Object.fromEntries(Object.entries(config.campos).map(([atributo, campo]) => [campo, entidad?.[atributo] ?? null]));
}
export function obtenerCambiosFila(original, draft, columnas) {
    const responsables = new Map();
    columnas.filter(c => c.editable).forEach(c => {
        [c.campo, ...Object.values(c.editorConfig?.campos ?? {})].forEach(campo => {
            if (!responsables.has(campo)) responsables.set(campo, c);
        });
    });
    return [...responsables].filter(([campo]) => !Object.is(original[campo], draft[campo]))
        .map(([campo,columna]) => ({ campo, columna, valorAnterior: original[campo], valorNuevo: draft[campo] }));
}
