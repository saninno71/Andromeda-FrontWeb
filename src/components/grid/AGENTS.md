# Instrucciones específicas para Grilla

Estas reglas complementan los `AGENTS.md` de la raíz y de `src/components`.

Antes de modificar Grilla, leer `documentacion/componentes-reutilizables/grilla/README.md`.
Antes de crear o configurar una grilla, leer `documentacion/componentes-reutilizables/grilla/GUIA_CONFIGURACION_GRILLA.md`.

## Contrato arquitectónico

- `Grid.jsx` coordina la grilla; `GridFila.jsx` debe permanecer genérico.
- Los editores de entidades se resuelven mediante `GridEditorCustom.jsx` y el registro único `gridEditores.js`.
- No importar controles concretos nuevos en `GridFila.jsx`.
- Cada módulo consumidor debe declarar sus columnas fuera del JSX, en un archivo puro `*.columnas.js`, para compartirlas con informes y ejecuciones sin renderización.
- Toda columna custom debe declarar `editor` y un `editorConfig` válido.
- `editorConfig.atributoVisible` debe ser explícito y estar incluido en `editorConfig.campos`.
- `editorConfig.campos` vincula atributos de la entidad con campos de la fila, aunque las columnas no sean visibles ni consecutivas.
- La selección de una entidad debe actualizar de forma atómica todos los campos relacionados, incluidos identificadores ocultos.
- `editorConfig.contexto` transporta datos de la fila requeridos por el control, como `empresaID`.

## Comportamiento que debe preservarse

- Un clic simple en el cuerpo enfoca la celda, selecciona la fila y muestra su menú flotante.
- Un doble clic en el cuerpo inicia la edición cuando `editable` está habilitado; encabezado, totales, scroll y checks quedan fuera de esta interacción.
- Selección completa del texto al entrar en una celda editable.
- Enter selecciona una opción abierta y posteriormente confirma la fila.
- Escape cancela la edición de la fila.
- Tab cierra listas y mantiene la navegación.
- Flechas de un editor abierto no deben mover la fila de la grilla.
- Los editores básicos, la selección, el resize, el ordenamiento, el scroll y la virtualización no deben degradarse al agregar un editor.
- Una celda de solo lectura y el check no deben recibir el marco visual de edición.
- Lectura y edición deben conservar exactamente el mismo origen del texto. Los editores simples se superponen al rectángulo interior de lectura con `inset: 1px`, tamaño automático y el mismo `font`, `line-height` y `padding`; el marco se dibuja hacia adentro sin consumir espacio. No extender el editor al borde exterior de la celda ni introducir estilos que desplacen el texto al entrar en edición.
- El contorno exterior de Grid usa radio de `5px`: solamente las esquinas superiores del encabezado y las inferiores de la fila de totales. Las divisiones y celdas interiores permanecen rectas.
- Toda columna editable decimal debe usar `GridEditorDecimal`: durante la edición presenta miles y coma decimal según `mascara`, pero comunica `number` o `null` al borrador. No volver a usar `input type="number"` para importes.
- Una columna con `tipo: "calculada"` es siempre de solo lectura. `obtenerValorColumna` debe respetar primero el valor no nulo recibido en `fila[campo]` y ejecutar `calcular(fila, contextoCalculos)` solamente cuando ese valor no esté informado. `dependencias` declara qué campos editables invalidan temporalmente el valor recibido; restaurarlos recupera el valor original. La búsqueda, el ordenamiento y los totales deben utilizar el mismo resolvedor y contexto.

## Extensión y documentación

- Para una entidad nueva: crear su capa funcional, hook y editor de celda; registrarlo en `gridEditores.js`; configurarlo desde la pantalla.
- No colocar reglas contables, servicios de una pantalla ni persistencia dentro de Grilla.
- La pantalla consumidora decide qué hacer con `onRowChange`.
- Un formulario que guarda desde un botón externo debe invocar `confirmarEdicion()` mediante el controlador de Grid antes de construir el payload.
- Para reposicionar una pantalla externa después de crear o eliminar un registro, usar `ubicarFila(fila)`. No recorrer índices manualmente ni depender de que la fila esté dentro del viewport virtualizado.
- `ubicarFila(fila)` debe realizar el desplazamiento inicial, esperar que la virtualización materialice el renglón y comprobar después su rectángulo real. Si queda recortado, debe corregir el scroll para que la fila seleccionada quede completamente visible.
- La navegación por índice debe usar `altoFilaMedido` de `useGridVirtualizacion`, nunca repetir el valor configurado. Para el último registro debe utilizar el máximo real del scrollbar vertical, evitando que pequeñas diferencias de altura se acumulen en conjuntos grandes.
- La colección completa pertenece a la capa funcional consumidora. Grid nunca agrega filas a una colección interna paralela. Si el modelo necesita mantener una o más filas al final, debe incorporarlas primero en `dataGrid` y entregar esas mismas filas mediante `filasAlFinal`; Grid solamente las excluye del orden y filtro comunes, las presenta al final y permite ubicarlas mediante `ubicarFila(fila)`.
- `ajustarAlturaAContenido` elimina el scroll vertical interno y hace crecer Grid según sus filas, respetando `alturaMinima`. Activarlo solamente cuando el contenedor exterior pueda absorber el crecimiento mediante su propio scroll.
- La pantalla consumidora declara los iconos visibles mediante `accionesMenuFila`; la visibilidad no reemplaza los callbacks ni las reglas funcionales de cada acción.
- Si cambia la parametría, el teclado o la comunicación de cambios, actualizar `documentacion/componentes-reutilizables/grilla/README.md`.
- Obtener el OK del usuario antes de iniciar una modificación nueva.
