# Grilla reutilizable

La guía operativa para configurar nuevas grillas está en [GUIA_CONFIGURACION_GRILLA.md](GUIA_CONFIGURACION_GRILLA.md).

## Responsabilidades

Grilla administra visualización, columnas, selección, ordenamiento, resize, scroll, virtualización, edición y confirmación de filas. El módulo consumidor define columnas, datos y persistencia. La definición declarativa de cada grilla reside en un archivo puro `*.columnas.js`, independiente del JSX, para que pueda reutilizarse en informes y ejecuciones sin renderización.

El menú flotante comunica intención mediante callbacks genéricos: `onEditarRegistro` para edición y `onVerRegistro` para consulta. Grilla no define ni conserva el modo del ABM.

Los iconos visibles se declaran con `accionesMenuFila`. La pantalla consumidora elige entre `editar`, `eliminar`, `ver`, `accion4`, `accion5` y `accion6`; si omite la propiedad se conserva el menú completo por compatibilidad. Un arreglo vacío mantiene la selección y el foco de la fila, pero no renderiza ningún contenedor ni fondo de menú sobre sus datos.

No deben incorporarse reglas funcionales de Asientos ni llamadas a APIs de entidades dentro de Grilla.

## Archivos principales

- `Grid.jsx`: coordinación general.
- `GridFila.jsx`: representación y edición genérica de una fila.
- `GridEditorCustom.jsx`: puente hacia un editor registrado.
- `gridEditores.js`: único registro de editores concretos.
- `gridEditorCampos.js`: mapeo entidad–fila y detección de cambios.
- `gridNavegacion.js`, `gridScroll.js` y `useGridVirtualizacion.js`: navegación y ventana visible.
- Hooks `useGrid*`: selección, columnas, preferencias, drag y carga paginada.

## Editores básicos y custom

`GridFila.jsx` resuelve los editores básicos. Un nombre que no pertenece a los básicos se deriva a `GridEditorCustom`, que lo busca en `gridEditores.js`.

Los editores registrados actualmente son:

- `calendario`;
- `cuenta`;
- `cliente`;
- `proveedor`;
- `empresa`;
- `numeracion`.

Para agregar otro editor no se modifica `GridFila.jsx`.

## Configuración de una entidad

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
    contexto: {
      empresaID: "empresaID"
    }
  }
}
```

Las claves de `campos` son atributos de la entidad; sus valores son campos de la fila. `atributoVisible` siempre debe declararse y también debe existir dentro de `campos`.

Las columnas de código y nombre pueden aparecer separadas, ocultas o en cualquier orden. El mapa permite determinar su relación sin recorrer posiciones vecinas. Una selección actualiza todos los campos relacionados en el borrador de la fila.

`contexto` utiliza la misma convención y envía al editor información de la fila, como `empresaID`.

## Ciclo de edición

- La grilla entra en edición cuando la pantalla la habilita y se activa la fila.
- Los cambios viven en un borrador de fila.
- Seleccionar una opción custom modifica el borrador; no persiste ni confirma automáticamente.
- Enter selecciona la opción abierta; un Enter posterior confirma.
- Escape cancela la fila completa.
- `onRowChange` entrega la fila confirmada y los cambios detectados.
- La pantalla decide si actualiza estado local o llama a una API.

## Navegación y virtualización

La navegación externa debe utilizar la lógica pública de Grilla para ubicar la fila solicitada. Cuando el destino no está renderizado, Grilla debe desplazar la ventana virtual y materializarlo antes de seleccionar o enfocar.

La pantalla entrega un `ref` mediante `controlNavegacionRef`. El controlador expone:

```js
control.current.obtenerEstado();
control.current.navegar("primero");
control.current.navegar("anterior");
control.current.navegar("siguiente");
control.current.navegar("ultimo");
control.current.ubicarFila(fila);
control.current.editarFila(fila);
control.current.confirmarEdicion();
```

`editarFila(fila)` ubica una fila que ya forma parte de `dataGrid`, desplaza la
virtualización hasta ella y abre sus celdas habilitadas. Se utiliza, por ejemplo,
después de que un ABM agrega localmente un renglón nuevo.

`ubicarFila(fila)` busca la clave configurada de esa fila dentro del resultado vigente, la selecciona y desplaza la virtualización usando la altura real de fila medida por `useGridVirtualizacion`. Para el último registro utiliza el máximo real del scrollbar, evitando errores acumulados en grillas grandes. Después de materializar el renglón comprueba su posición real y corrige el scroll si quedó recortado por el límite inferior o superior del viewport. Devuelve el mismo estado de navegación que `navegar()`. Si la clave no está presente, conserva y devuelve la posición actual.

`confirmarEdicion()` confirma la fila que permanece en edición y emite `onRowChange` antes de continuar. Los formularios que guardan mediante botones externos a la grilla deben invocarlo antes de construir su payload, para no perder el último borrador editado.

La incorporación de registros pertenece al modelo funcional de la pantalla. El modelo agrega o reemplaza la fila dentro del mismo `dataGrid`; Grid no mantiene una segunda colección de datos. Cuando una fila incorporada debe permanecer visible al final aunque exista un orden o una búsqueda activos, la pantalla entrega esas mismas referencias mediante `filasAlFinal` y, después del render, llama `ubicarFila(fila)` para desplazar la virtualización hasta ella.

```jsx
<Grid
  dataGrid={estado.consulta.dataGrid}
  filasAlFinal={estado.consulta.filasAlFinal}
  controlNavegacionRef={controlGrid}
/>
```

`filasAlFinal` no incorpora ni duplica registros: únicamente identifica, mediante las columnas `key`, filas que ya existen en `dataGrid`. El modelo debe vaciar esa marca cuando una nueva consulta completa reemplaza la colección.

## Clic simple y doble clic

Un clic simple sobre una celda del cuerpo enfoca la celda, selecciona su fila y muestra el menú flotante. Volver a hacer clic sobre la misma fila mantiene el menú visible. Si otra fila estaba editándose, primero confirma su borrador.

Un doble clic sobre el cuerpo inicia directamente la edición de la fila cuando la prop `editable` está habilitada y oculta el menú. La grilla conserva el campo que originó el doble clic y, después de montar sus editores, enfoca el editor de esa celda y selecciona todo su contenido para que la primera escritura lo reemplace. También cancela la selección nativa del texto anterior para evitar que el segundo clic deshaga esa selección. En una grilla de solo consulta conserva la selección realizada por el clic simple y no inicia edición. El encabezado, los totales, los scrolls y los checks no participan de este comportamiento.

`obtenerEstado()`, `navegar()` y `ubicarFila()` devuelven `{ fila, indice, cantidad, puedeAnterior, puedeSiguiente }`. La navegación utiliza `dataOrdenada`, por lo que respeta la búsqueda y el orden visibles. La fila devuelta es genérica: la pantalla consumidora decide qué ID tomar y qué ABM o servicio actualizar.

`onNavegacionChange` recibe el mismo estado cuando cambia la fila activa o la colección ordenada. La fila activa permanece seleccionada al abrir un ABM externo, aunque el menú flotante se oculte.

Moverse hacia una fila fuera de la ventana visible ajusta el scroll vertical y la ventana virtual sin transferir el foco desde el modal abierto.

El desplazamiento, tanto programático como manual, oculta el menú flotante pero conserva la fila activa. No debe borrar la referencia de navegación porque el ABM necesita continuar desde esa posición aunque la fila haya salido del viewport anterior.

## Altura según el contenido

`ajustarAlturaAContenido` hace que Grid calcule su altura con el encabezado, todas las filas y los elementos habilitados: el scroll horizontal cuando `mostrarScrollHorizontal` no es `false` y la fila de totales cuando `mostrarTotales` no es `false`. `alturaMinima` conserva el tamaño visual mínimo solicitado por la pantalla. En esta modalidad no se representa el scrollbar vertical propio; si el conjunto completo supera el viewport, el contenedor exterior debe proporcionar el desplazamiento vertical.

```jsx
<Grid
  dataGrid={renglones}
  ajustarAlturaAContenido
  alturaMinima={205}
/>
```

La opción es apropiada para detalles de ABM con una cantidad acotada de renglones. Las consultas generales mantienen la altura fija y la virtualización con scroll vertical interno.

## Edición de importes decimales

Las columnas editables con `editor: "decimal"` o `formato: "decimal"` utilizan automáticamente `GridEditorDecimal`. El editor presenta agrupación de miles y coma decimal durante la edición, de acuerdo con `mascara`, y mantiene separado el texto visible del valor funcional.

Por ejemplo, una columna con `mascara: "0.0,00"` presenta `4425070.24` como `4.425.070,24`. Mientras el usuario escribe se agregan los puntos de miles; se acepta la coma decimal y la tecla punto también inicia la parte decimal. El valor comunicado mediante `onDraftChange` continúa siendo `number` o `null`, por lo que los modelos y payloads no reciben texto formateado.

El editor permite pegar números con formato local, limita la parte decimal a la cantidad indicada por la máscara, admite negativos y conserva una posición coherente del cursor cuando aparecen separadores. Al perder el foco completa la presentación final según la máscara.

Las representaciones de lectura y los editores simples ocupan la misma altura de fila y comparten su alineación vertical. El editor se representa como bloque, sin margen ni espacio reservado para la línea base del navegador, para que el texto no salte unos píxeles al iniciar o finalizar la edición.

Los editores deben detener las teclas utilizadas en su lista para evitar que las flechas desplacen simultáneamente la selección de la grilla.

## Columnas calculadas

Una columna calculada se declara explícitamente con `tipo: "calculada"` y una función `calcular`:

```js
{
  campo: "saldo",
  titulo: "Saldo",
  tipo: "calculada",
  dependencias: ["debe", "haber"],
  calcular: (fila, contexto) =>
    (Number(fila.debe || 0) - Number(fila.haber || 0)) * contexto.factor,
  formato: "decimal",
  mascara: "0.0,00",
  align: "right",
  suma: true
}
```

Si `fila[campo]` contiene un valor distinto de `null` o `undefined`, Grilla lo considera informado por el endpoint y lo presenta sin recalcular. Cuando el campo no existe o es nulo, utiliza `calcular(fila, contextoCalculos)`. Esto permite conservar resultados históricos del backend y calcular filas nuevas o incompletas en la interfaz. La pantalla puede entregar valores externos estables mediante la prop `contextoCalculos` de Grid.

`dependencias` enumera los campos editables que alimentan el cálculo. Si alguno difiere de la fila original durante la edición, Grilla invalida el valor recibido y muestra el cálculo sobre el borrador. Si el usuario restaura todas las dependencias, también restaura el valor original del endpoint. Al confirmar, la pantalla consumidora debe conservar como nulo el campo calculado invalidado para que el valor continúe resolviéndose después de cerrar la edición; esos campos siguen fuera de `cambios` y del payload funcional.

Las columnas calculadas son siempre de solo lectura, aunque se configure accidentalmente `editable: true`; no participan del borrador ni de los cambios emitidos por `onRowChange`. Su valor resuelto sí participa del formato, la búsqueda, el ordenamiento y los totales. Durante la edición de una fila sin valor informado, la presentación se resuelve contra el borrador vigente.

## Reglas visuales

- El contorno exterior usa radio de `5px`: las esquinas superiores pertenecen al encabezado y las inferiores a la fila de totales. Las celdas, columnas y separaciones internas conservan esquinas rectas; los contenedores recortan el fondo correctamente durante el scroll horizontal.
- `demoraIndicadorCargaMs` demora solamente la aparición del overlay “Procesando”; el estado funcional `cargando` se aplica inmediatamente. Esto evita destellos en cargas rápidas sin ocultar una demora real.
- `formatoCantidadRegistros` controla el contador de la fila de totales. `cargados-total` presenta “x de y registros”; `cantidad` presenta solamente “x registros”. Esta decisión es independiente de la presencia de checks.
- `mostrarTotales={false}` omite por completo la fila de totales y el contador. El valor predeterminado es `true` para conservar el comportamiento de las grillas existentes.
- `mostrarScrollHorizontal={false}` omite la pista horizontal y el espacio que ocupa. Debe utilizarse cuando el consumidor garantiza que las columnas entran en el ancho disponible, por ejemplo junto con `ajustarColumnasAlAncho`.
- Los cambios declarativos de `visible` deben sincronizarse aunque el conjunto y el orden de campos no cambien.
- Las celdas editables conservan la alineación declarada por la columna.
- El marco de edición pertenece a la celda editable completa.
- Las celdas de solo lectura y el check no reciben ese marco.
- Los portales de listas y calendarios no deben ser recortados por el viewport de Grilla.

## Verificación mínima

- Edición con input, número, decimal, combo, checkbox, fecha y editor custom.
- Selección total del contenido al entrar en una celda.
- Enter, Escape, Tab y flechas.
- Actualización atómica de campos relacionados.
- Columnas relacionadas no consecutivas y campos asociados ocultos.
- Scroll horizontal y vertical, resize y virtualización.
- Navegación externa al primero, anterior, siguiente y último, incluyendo destinos virtualizados.
- Menú flotante y doble clic fuera y dentro del modo de edición.
- Ausencia de bordes en columnas de solo lectura y check.
