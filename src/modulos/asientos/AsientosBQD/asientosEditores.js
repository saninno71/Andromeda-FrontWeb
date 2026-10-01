// Los nombres a la izquierda pertenecen al control; a la derecha, a la fila de Asientos.
export function configurarEditoresAsientos(columnas) {
    return columnas.map(columna => {
        const campo = columna.campo;
        let editorConfig;
        let editor;
        const entidad = /^(debe|haber)(Cuenta|Cliente|Proveedor)(Codigo|Nombre)$/.exec(campo);
        if (entidad) {
            const [, lado, nombre, atributo] = entidad;
            editor = nombre.toLowerCase();
            editorConfig = {
                campoID: `${editor}ID`,
                atributoVisible: `${editor}${atributo}`,
                campos: {
                    [`${editor}ID`]: `${lado}${nombre}ID`,
                    [`${editor}Codigo`]: `${lado}${nombre}Codigo`,
                    [`${editor}Nombre`]: `${lado}${nombre}Nombre`
                },
                contexto: { empresaID: "empresaID" }
            };
        } else if (campo === "empresaCodigo" || campo === "empresaNombre") {
            editor = "empresa";
            editorConfig = { campoID: "empresaID", atributoVisible: campo, campos: {
                empresaID: "empresaID", empresaCodigo: "empresaCodigo", empresaNombre: "empresaNombre"
            }};
        } else if (campo === "numeraTipoSimbolo") {
            editor = "numeracion";
            editorConfig = { campoID: "numeraTipoID", atributoVisible: "descripcion", campos: {
                numeraTipoID: "numeraTipoID", descripcion: "numeraTipoSimbolo"
            }};
        }
        if (campo === "fecha") {
            editor = "calendario";
            editorConfig = { campoID: "fecha", atributoVisible: "fecha", campos: { fecha: "fecha" } };
        }
        if (editor) return { ...columna, editable: true, editor, editorConfig };
        const basicos = { detalle: "texto", numero: "numero", debeImporte: "decimal", haberImporte: "decimal" };
        return basicos[campo] ? { ...columna, editable: true, editor: basicos[campo] } : columna;
    });
}
