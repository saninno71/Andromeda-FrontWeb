# Editores de entidades en la grilla

`gridEditores.js` es el único archivo de la infraestructura de la grilla que importa los editores concretos. Cada editor reutiliza el hook de su control y la presentación compartida `EditorEntidadCelda`.

## Configuración de una columna

```js
{
    campo: "debeCuentaNombre",
    editable: true,
    editor: "cuenta",
    editorConfig: {
        campoID: "cuentaID",
        campos: {
            cuentaID: "debeCuentaID",
            cuentaCodigo: "debeCuentaCodigo",
            cuentaNombre: "debeCuentaNombre"
        },
        contexto: { empresaID: "empresaID" }
    }
}
```

Las claves de `campos` son atributos del objeto del control; los valores son campos de la fila. La selección actualiza todos juntos en el borrador. `contexto` usa la misma convención para obtener parámetros de la fila.

La grilla debe recibir `editable` y un `onRowChange` que aplique la fila confirmada. Seleccionar una opción no guarda ni confirma la fila: Enter selecciona si hay una lista abierta, otro Enter confirma; Escape cancela toda la fila. La grilla entrega cambios de campos asociados, incluidos los IDs ocultos, sin duplicarlos. El consumidor decide cómo persistirlos.

Editores registrados: `cuenta`, `empresa`, `cliente`, `proveedor`, `numeracion`. Los editores básicos existentes siguen disponibles. Un nombre custom desconocido o un mapa sin identificador muestra un error de configuración en la celda.

Para agregar una entidad: crear su editor de celda, registrarlo y configurar las columnas. No se modifica GridFila por cada entidad nueva.

La consulta de Asientos tiene su configuración en `asientosEditores.js`; conserva su modo de consulta hasta activar expresamente la edición y su manejador de cambios.
