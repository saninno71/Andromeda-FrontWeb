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
        atributoVisible: "cuentaNombre",
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

Editores registrados: `cuenta`, `empresa`, `cliente`, `proveedor`, `numeracion`. Los editores básicos existentes siguen disponibles. Un nombre custom desconocido o un mapa sin identificador o atributo visible muestra un error de configuración en la celda.

Para agregar una entidad: crear su editor de celda, registrarlo y configurar las columnas. No se modifica GridFila por cada entidad nueva.

La consulta de Asientos tiene su configuración en `asientosEditores.js`; tiene activada la edición local de prueba. `onRowChange` almacena la fila confirmada en `edicionesLocales`; una nueva consulta descarta estos cambios. No se guarda en la API ni en almacenamiento persistente.

## Separación de responsabilidades

- Asientos configura columnas, atributos y contexto, y decide qué hacer con la fila confirmada.
- La grilla mantiene el borrador y actualiza los campos asociados de forma atómica, sin reglas contables ni llamadas a APIs de entidades.
- `gridEditores.js` es el único punto de la grilla que importa editores concretos.
- Los editores de celda usan los hooks de sus controles; no importan Asientos ni la grilla.
- Los hooks coordinan estado y búsquedas; las funciones de entidad y servicios se reutilizan en filtros y celdas.
- `EditorEntidadCelda` comparte la presentación compacta y el teclado, sin conocer entidades concretas.

## Presentación y búsqueda

`atributoVisible` es un atributo de la entidad y debe existir en `campos`. Por ejemplo, `cuentaCodigo` muestra el código y `cuentaNombre` el nombre. Ambos permiten buscar por código o nombre; la lista presenta las dos partes. No se necesita que las columnas sean consecutivas ni que todas estén visibles.

Las celdas editables conservan la alineación de la columna y tienen un borde completo de un píxel. Las de solo lectura y el check no reciben ese borde de edición. La fila mantiene su color de edición. Los estilos básicos están en `grid.css`; los del editor compartido de entidades están en `EditorEntidadCelda.css`.

## Calendario

El editor `calendario` reutiliza InputFecha en variante de celda. Su configuración usa `campoID: 'fecha'`, `atributoVisible: 'fecha'` y `campos: { fecha: 'fecha' }` (el destino puede ser otro campo de la fila). Se registra únicamente en gridEditores.js. Seleccionar un día cambia el borrador; Enter confirma y Escape cancela. En Asientos está habilitado para la prueba local. El editor básico `fecha` nativo se conserva por compatibilidad.
