# Guía de configuración de Grilla para desarrolladores

## Objetivo

Esta guía explica cómo declarar y conectar una grilla de Andromeda. La pantalla consumidora define columnas, datos y persistencia; `Grid` administra representación, orden, búsqueda, selección, resize, virtualización, edición y menú de fila.

Antes de modificar la infraestructura interna, revisar `README.md`, `src/components/grid/AGENTS.md` y las capacidades existentes.

## Ejemplo mínimo

```jsx
const columnas = [
    {
        campo: "comprobanteID",
        titulo: "ID",
        visible: true,
        formato: "entero",
        key: true,
        ancho: 100,
        align: "right"
    },
    {
        campo: "fecha",
        titulo: "Fecha",
        visible: true,
        formato: "fecha",
        mascara: "DD/MM/YYYY",
        ancho: 110,
        align: "center"
    }
];

<Grid
    columnasVisibles={columnas}
    dataGrid={filas}
    mostrarCheck
/>
```

Cada objeto de `dataGrid` debe exponer los campos utilizados por la configuración.

## Configuración de columnas

La definición debe residir fuera del JSX en un módulo puro y dedicado, junto al módulo consumidor. La convención es `nombreBQD.columnas.js` o `nombreABM.columnas.js`. El archivo puede exportar una constante estable o una función creadora cuando cada instancia necesite objetos propios.

```text
PepeBQD/pepeBQD.columnas.js
PepeABM/pepeABM.columnas.js
```

El JSX importa esa definición y la entrega a `Grid`. El mismo módulo puede ser consumido por una pantalla de configuración, un informe o una ejecución sin renderización. No debe importar React, hooks, DOM, estado ni servicios. Puede incluir funciones puras para columnas calculadas y metadatos declarativos de editores. Las preferencias del usuario se aplican después y no modifican la definición predeterminada.

| Propiedad | Uso |
|---|---|
| `campo` | Nombre de la propiedad dentro de cada fila. Debe ser único. |
| `titulo` | Texto del encabezado. |
| `visible` | `false` oculta la columna; cualquier otro valor permite mostrarla. |
| `formato` | Formato de lectura y orden: `texto`, `entero`, `numero`, `decimal` o `fecha`. |
| `mascara` | Máscara utilizada para presentar el valor, por ejemplo `DD/MM/YYYY` o `0.0,00`. |
| `key` | Participa en la identidad estable de la fila. Puede haber más de una columna clave. |
| `ancho` | Ancho inicial en píxeles. |
| `proporcion` | Peso relativo cuando se usa `ajustarColumnasAlAncho`. |
| `align` | Alineación: `left`, `center` o `right`. |
| `suma` | Incluye la columna en los totales cuando vale `true`. |
| `desdoblarTexto` | Habilita la presentación definida por la grilla para texto desdoblado. |
| `ordenDefault` | Prioridad numérica del orden inicial; vacío significa sin orden predeterminado. |
| `direccionDefault` | Dirección inicial del orden. |
| `editable` | Habilita la edición de esa celda cuando la grilla también recibe `editable`. |
| `editor` | Editor básico o nombre de un editor custom registrado. |
| `editorConfig` | Parámetros específicos del editor. |

Las claves deben identificar realmente una fila. En Asientos se combinan `comprobanteID` y `monedaCodigo`.

## Propiedades principales de Grid

| Prop | Uso |
|---|---|
| `columnasVisibles` | Definición completa de columnas. |
| `dataGrid` | Filas que se muestran. |
| `mostrarCheck` | Agrega la columna inicial de selección. |
| `cargando` | Indica la carga de la primera página. |
| `demoraIndicadorCargaMs` | Milisegundos que deben transcurrir antes de mostrar el overlay de carga. Su valor predeterminado es `0`. |
| `formatoCantidadRegistros` | `cargados-total` muestra “x de y registros”; `cantidad` muestra “x registros”. |
| `mostrarSinDatos` | Controla el mensaje cuando no hay registros. |
| `cargandoPaginas` | Indica que continúa la carga paginada. |
| `totalRegistrosRemotos` | Cantidad total informada por la API. |
| `registrosCargados` | Cantidad incorporada hasta el momento. |
| `enfoqueVersion` | Permite solicitar un nuevo enfoque después de una carga. |
| `filasAlFinal` | Identifica filas que ya pertenecen a `dataGrid` y deben quedar al final, fuera del orden y filtro comunes. La colección sigue siendo responsabilidad del modelo consumidor. |
| `tamanoFuente` | Tamaño tipográfico de la grilla. |
| `layoutColumnas` | Orden y anchos guardados que deben aplicarse. |
| `layoutVersion` | Fuerza la reaplicación de un layout. |
| `onLayoutChange` | Recibe el orden y los anchos vigentes. |
| `textoBusqueda` | Búsqueda general sobre las columnas. |
| `ajustarColumnasAlAncho` | Distribuye el ancho disponible mediante `proporcion`. |
| `altoFila` | Altura utilizada por filas y virtualización. |
| `controlNavegacionRef` | Ref opcional que expone navegación programática, `ubicarFila(fila)`, `editarFila(fila)` y `confirmarEdicion()` sobre la fila activa. |
| `ajustarAlturaAContenido` | Hace crecer la grilla para mostrar todas las filas y elimina su scroll vertical interno. Por defecto es `false`. |
| `alturaMinima` | Altura mínima en píxeles cuando `ajustarAlturaAContenido` está activo. |
| `onNavegacionChange` | Informa fila, posición, cantidad y disponibilidad de avance o retroceso. |

## Parametría, estado interno y renderizado

La configuración de columnas entra a la grilla mediante `columnasVisibles`. La grilla mantiene además un estado interno porque el usuario puede cambiar orden y ancho.

```text
Configuración de la pantalla
          ↓
Estado interno de columnas
          ↓
columnasParaMostrar
          ↓
Encabezado, filas y totales
```

El contenido de las filas y la configuración visual son estados diferentes. Cambiar una columna no requiere consultar nuevamente la API.

### Cambio de `visible`

Cuando una pantalla cambia una columna de `visible: false` a `visible: true`, `useGridColumnas` sincroniza esa propiedad aunque el conjunto y el orden de campos sigan siendo los mismos. Luego se recalcula `columnasParaMostrar` y React vuelve a dibujar el encabezado y las celdas.

El ancho no debe establecerse en cero para ocultar una columna. Siempre se utiliza `visible: false`. Al volver a mostrarla conserva el ancho declarado o el ancho proveniente del layout.

### Layouts y vistas guardadas

El layout guarda principalmente `campo` y `ancho`. Al aplicarlo:

1. Se recuperan las columnas conocidas en el orden guardado.
2. Se aplican sus anchos.
3. Las columnas nuevas se agregan al final.
4. La propiedad `visible` continúa perteneciendo a la parametría declarada por la pantalla.

La vista `Default` utiliza la configuración actual de la pantalla. Las vistas personalizadas se administran mediante `useGridPreferencias`.

## Edición

La edición requiere habilitación en dos niveles:

```jsx
<Grid
    editable
    columnasVisibles={columnas}
    dataGrid={filas}
    onRowChange={guardarBorrador}
/>
```

Y en cada columna:

```js
{
    campo: "importe",
    editable: true,
    editor: "decimal"
}
```

Editores básicos: `texto`, `numero`, `decimal`, `fecha`, `checkbox` y `combo`. Los editores de entidades y el calendario reutilizable se registran en `src/components/grid/gridEditores.js`.

El editor `decimal` utiliza la `mascara` de la columna también durante la edición. Con `mascara: "0.0,00"` muestra puntos de miles y coma decimal, pero entrega un `number` o `null` en el borrador de la fila. Para importes no se debe reemplazar por `numero` ni por un `input type="number"`, porque esos controles no admiten la presentación agrupada requerida.

`onRowChange` recibe:

```js
{
    keyFila,
    filaOriginal,
    filaNueva,
    cambios
}
```

`onCellChange` recibe cada cambio individual. `onEdicionChange` comunica el original y el borrador vigente. La pantalla decide si conserva el cambio localmente o llama a una API.

En el cuerpo de la grilla, el clic simple enfoca la celda, selecciona la fila y abre el menú flotante. El doble clic inicia la edición sólo cuando `editable` es verdadero. Estas acciones no se aplican al encabezado, los totales, los scrolls ni los checks.

## Editores de entidades

Una columna custom declara explícitamente el atributo que muestra y todos los campos asociados:

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

Las columnas relacionadas pueden estar separadas u ocultas. La selección actualiza juntos el ID, código y nombre del borrador.

## Menú de fila y ABM externo

`accionesMenuFila` determina qué iconos muestra el menú flotante y respeta el orden fijo del componente. Admite `editar`, `eliminar`, `ver`, `accion4`, `accion5` y `accion6`. Si se omite, se muestran todos para conservar el comportamiento existente.

```jsx
<Grid accionesMenuFila={["editar", "eliminar"]} />
```

La visibilidad de una acción no implementa su regla funcional. La pantalla continúa proporcionando `onEditarRegistro`, `onVerRegistro`, `onDeleteRow` o habilitando la edición interna según corresponda.

Si se proporciona `onEditarRegistro`, la acción Editar del menú flotante entrega la fila seleccionada a la pantalla:

```jsx
<Grid onEditarRegistro={setRegistroAbierto} />
```

La pantalla puede abrir un ABM con esa fila. Si no se proporciona el callback y la grilla es editable, la acción inicia la edición interna.

`onVerRegistro` abre el mismo registro en modo consulta. Grilla solamente entrega la fila; la pantalla decide el modo y el ABM que corresponde.

Para que el ABM navegue por su grilla de origen, la pantalla actúa como coordinadora:

```jsx
const controlGrid = useRef(null);

function navegarABM(destino) {
    const resultado = controlGrid.current?.navegar(destino);
    if (resultado?.fila) {
        setRegistroAbiertoID(resultado.fila.id);
    }
}

<Grid
    controlNavegacionRef={controlGrid}
    onNavegacionChange={setEstadoNavegacion}
    onEditarRegistro={fila => setRegistroAbiertoID(fila.id)}
    onVerRegistro={fila => abrirRegistro(fila.id, MODO_ABM.CONSULTA)}
/>
```

El controlador opera sobre el resultado vigente de búsqueda y ordenamiento. `navegar()` devuelve la fila completa y hace visible su posición mediante la virtualización. `ubicarFila(fila)` selecciona por la clave configurada y permite reposicionar una consulta después de crear o eliminar un registro, aunque la fila esté fuera del viewport. Grilla no interpreta el identificador ni conoce el ABM.

Cuando un formulario posee botones Aplicar o Aceptar fuera de la grilla, debe ejecutar `controlGrid.current?.confirmarEdicion()` antes de guardar. De ese modo, el borrador de la fila activa se entrega mediante `onRowChange` y forma parte del payload aunque el usuario no haya presionado un segundo Enter.

Cuando un ABM agrega una fila local puede llamar `controlGrid.current?.editarFila(filaNueva)` después de incorporarla a `dataGrid`. La grilla la hace visible y abre directamente los editores declarados por sus columnas.

El doble clic sobre una celda editable conserva el campo de origen, evita la selección nativa del texto representado y, durante el montaje de la fila editable, enfoca el editor correspondiente y selecciona su contenido completo. Este comportamiento debe permanecer dentro de `Grid` y `GridFila`; las pantallas consumidoras no deben implementar temporizadores ni búsquedas de elementos del DOM para corregir el foco.

`onDeleteRow` recibe `{ fila, keyFila }`. La eliminación y su persistencia pertenecen a la pantalla consumidora.

## Carga paginada

La pantalla o su capa funcional administra las llamadas remotas y actualiza `dataGrid`. La grilla solo representa el avance mediante:

- `cargando` para la primera página;
- `cargandoPaginas` para páginas adicionales;
- `registrosCargados` y `totalRegistrosRemotos` para el contador.

La grilla no debe incorporar servicios ni reglas particulares de Asientos.

La demora visual puede configurarse según el contexto sin modificar el estado funcional de carga:

```jsx
<Grid cargando={cargando} demoraIndicadorCargaMs={50} />  // Consulta general
<Grid cargando={cargando} demoraIndicadorCargaMs={500} /> // Detalle rápido de un ABM
```

## Lista de verificación

- La definición de columnas está en un archivo `*.columnas.js` independiente del JSX.
- Cada columna tiene un `campo` único.
- Existe al menos una clave estable.
- Los valores de `visible`, `ancho`, `formato` y `align` son explícitos.
- Una columna editable declara `editable` y su editor.
- Los campos asociados de un editor de entidad están mapeados explícitamente.
- La pantalla implementa los callbacks que necesita persistir.
- Las vistas guardadas se prueban con columnas nuevas, ocultas y visibles.
- Se verifican resize, orden, búsqueda, scroll y virtualización.
- El menú flotante abre el ABM correcto cuando se usa `onEditarRegistro`.
- La navegación externa respeta el orden y la búsqueda, desplaza la virtualización y se detiene en los extremos.

## Diagnóstico rápido

| Síntoma | Revisar |
|---|---|
| Una columna no aparece | `visible`, nombre de `campo`, layout actual y sincronización de `useGridColumnas`. |
| Se ve con ancho incorrecto | `ancho`, layout guardado y `ajustarColumnasAlAncho`. |
| Dos filas se comportan como una | Columnas con `key: true`. |
| El editor no aparece | `editable` en Grid y columna, nombre de `editor` y registro custom. |
| Se actualiza código pero no nombre | `editorConfig.campos` y `atributoVisible`. |
| La carga queda girando | Estado de paginación y solicitud remota; la grilla no ejecuta la API. |
