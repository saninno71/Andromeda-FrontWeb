# Instrucciones del módulo Asientos

Estas reglas se aplican a `AsientosBQD`, `AsientosABM` y a la documentación funcional del módulo.

## Lecturas obligatorias

Antes de modificar Asientos, leer:

1. `C:\Users\sanin\ProyectosReact\andromeda_React\AGENTS.md`.
2. `C:\Users\sanin\ProyectosReact\andromeda_React\src\modulos\asientos\asientosArquitectura.md`.
3. `C:\Users\sanin\ProyectosReact\andromeda_React\documentacion\diagnostico-sistema\GUIA_PROGRAMADOR_CONSULTA_ASIENTOS_V3.md` cuando el cambio involucre la API.
4. Los `AGENTS.md` de componentes reutilizables que participe el cambio.

Pedir el OK del usuario antes de iniciar una modificación nueva.

## Separación de responsabilidades

- `AsientosBQD` contiene la búsqueda y la grilla general.
- `AsientosABM` contiene el formulario individual y recibe un `ComprobanteID`.
- La capa funcional guarda el estado completo de cabecera y renglones. La presentación no debe reconstruir el estado leyendo controles del DOM.
- `AsientosBQD/asientosBQD.columnas.js` y `AsientosABM/abmAsientos.columnas.js` son las fuentes únicas de las definiciones de sus grillas. Mantener campos, títulos, formatos, anchos, cálculos y editores fuera del JSX para permitir su uso en informes y ejecuciones sin renderización.
- Después de un alta desde el ABM, la consulta puntual del registro nuevo debe incorporarse mediante `modelo.inyectarRegistro` a `estado.consulta.dataGrid`. La grilla no debe conservar una colección paralela ni ejecutar por sí misma la consulta completa. La fila se marca en `consulta.filasAlFinal` y la pantalla usa `ubicarFila` solamente para desplazar la virtualización.
- Un valor cargado programáticamente en un combo buscador no debe disparar una búsqueda; solamente la edición del usuario debe hacerlo.
- Los encabezados, cintas, pies, controles y grillas deben reutilizar los componentes comunes documentados.

## Modo y permisos del ABM

- Todo ingreso a `AsientosABM` debe indicar explícitamente `MODO_ABM.CONSULTA`, `MODO_ABM.EDICION` o `MODO_ABM.ALTA`.
- El ojo de la grilla general abre consulta; el lápiz abre edición. La navegación entre registros conserva el modo de apertura.
- `AsientosABM/abmAsientos.permisos.js` es la única fuente de verdad sobre campos editables. No dispersar condiciones de permisos en el JSX ni habilitar una columna solamente porque la grilla esté en edición.
- El modelo funcional debe volver a validar la política: en consulta rechaza toda mutación y en edición descarta propiedades que no estén autorizadas.
- El título del ABM usa `claveEncabezado`, capturada al cargar el asiento. No debe leer directamente el valor Número del formulario: la identificación cambia solamente después de guardarse y recargarse correctamente.
- En cabecera se pueden editar Empresa, Fecha, Detalle, Moneda, Numeración y Observaciones. Número y Punto de venta permanecen informativos para asientos existentes y se habilitan exclusivamente durante el alta. En los renglones solamente Cuenta, Debe, Haber y Detalle.
- Moneda usa `ComboMonedas` y conserva ID, código y nombre como una entidad. Su servicio mantiene el contrato de búsqueda definitivo, pero temporalmente lee `src/simul/Monedas.json` hasta disponer del endpoint. Punto de venta permanece en lectura en consulta/edición. En el alta, Punto de venta y Número pueden quedar vacíos para numeraciones automáticas; React debe enviarlos como `null`, no convertirlos en cero.
- Los services de Asientos deben reutilizar `infraestructura/http/respuestaHttp.js`. El intérprete común prioriza los mensajes específicos del diccionario `errors` de ASP.NET sobre el `title` genérico de Problem Details, combina mensajes de varios campos sin duplicarlos y conserva `detail`, `mensaje`, `title` y cuerpos de texto como alternativas. Las reglas de obligatoriedad continúan perteneciendo a la API y a las validaciones funcionales acordadas.
- Los estados visuales de la cinta de Asientos se definen en `AsientosABM/abmAsientos.cinta.js` a partir de la política común `obtenerDisponibilidadAccionesRegistroABM`. Agregar allí los próximos casos de uso; no dispersar condiciones de modo entre los descriptores JSX. Durante Edición se deshabilitan Nuevo, Borrar y Ver. Durante Alta se deshabilitan Nuevo, Editar, Borrar, Ver y la navegación; el pie muestra solamente Cancelar y Aceptar.
- Imprimir, Destino, Operación monetaria, Acciones y Trazabilidad se presentan siempre activos en la cinta. Mientras sus casos de uso sigan pendientes no llevan callback, pero tampoco deben marcarse como `disabled` ni mostrarse grisados.

## Identidad del asiento

- El ID público es `gnrComprobantes.ID`, denominado `ComprobanteID`.
- `ctbAsientos.ID` es el ID de un renglón y debe conservarse.
- El GET individual es `GET /api/contabilidad/asientos/{id}` y usa Entity Framework con relaciones explícitas.
- No reintroducir SQL embebido, `Database.SqlQuery<AsientoConsulta>` ni el parche antiguo basado en esa implementación.
- `dbo.cstctbAsientos` pertenece exclusivamente a la consulta general.
- Mantener la lectura EF del detalle separada en bloques de cabecera, renglones, Ventas, Compras y Fondos. No volver a proyectar cada ID, código y nombre mediante `FirstOrDefault` correlacionados desde cada renglón.
- Cuando se investigue rendimiento, activar `DiagnosticoConsultas:Asientos:Habilitado` y comparar las etapas `[ConsultaAsientoDetalle:EF]` con el tiempo total observado en React.

## Datos que no se deben perder

La capa funcional del ABM debe conservar fecha de emisión; importes original, local y de referencia separados en Debe/Haber; cuenta; subcuenta; cliente; proveedor; caja; jurisdicción; vendedor y cobrador, aunque alguna columna todavía no sea visible.

## Escritura

PUT recibe `gnrComprobantes.ID` y actualiza por Entity Framework. React envía la instantánea resultante: las líneas conservadas mantienen su ID, las altas se envían con `Id = null` y los IDs existentes omitidos representan bajas solicitadas. El endpoint rechaza IDs repetidos, no positivos o pertenecientes a otro comprobante. Antes de cada baja valida referencias directas desde Ventas, Compras y Fondos; una línea referenciada no se elimina. La marca de modificación se calcula comparando los campos persistibles contra la instantánea cargada: una fila temporal vacía no cuenta y un valor restaurado deja de ser cambio. `APLICAR` se habilita sólo con diferencias reales, guarda y recarga. `ACEPTAR` guarda y cierra cuando hay cambios; sin cambios omite el PUT y cierra directamente.

Antes de cualquier POST o PUT, `AsientosABM/abmAsientos.validaciones.js` verifica en el frontend que la suma del Debe sea igual a la suma del Haber, comparando los importes a dos decimales. Si no balancea, no se llama a la API y se muestra exactamente `El asiento no balancea. La suma del Debe debe ser igual a la suma del Haber.`. Esta validación frontend complementa y no reemplaza la misma regla del backend.

POST recibe la cabecera nueva, Punto de venta opcional y líneas sin ID. React no usa un ComprobanteID ficticio. Punto de venta y Número vacíos se envían como `null`; si el usuario informa Punto de venta, la API lo valida contra `NumeraTipo.Numeracion`. Un Número nulo indica que la API debe reservar el siguiente valor de la numeración automática, asignarlo al comprobante y avanzar `gnrNumeraciones` dentro de la misma transacción. La API crea cabecera y detalle como un único agregado EF y devuelve el nuevo `gnrComprobantes.ID`. Aceptar crea el registro y cierra; Alta no ofrece Aplicar.

El reenvío de la instantánea completa no implica que el backend deba reescribir todos los importes. Si el importe y su cotización no cambiaron, el PUT conserva exactamente `ImpLocal` e `ImpReferencia`. Si corresponde recalcular, convierte dividiendo por la cotización histórica guardada en `gnrComprobantes`.

La baja de un renglón se realiza dentro del PUT: el tacho lo quita primero del estado local y Aplicar o Aceptar persiste la ausencia. Cancelar descarta el cambio. Una línea temporal desaparece solamente en React. Está prohibido implementar el update borrando y recreando todos los renglones: Ventas, Compras y Fondos pueden referenciar `ctbAsientos.ID`. `Agregar ítem` debe confirmar primero el borrador de la fila activa, luego crea una clave temporal negativa únicamente en React, abre la fila nueva con `controlGrid.editarFila()` y convierte esa clave en `Id = null` al construir el payload. Las altas temporales completamente vacías se omiten del PUT; si contienen cualquier valor editable, se envían y deben superar todas las validaciones normales.

El DELETE público recibe `gnrComprobantes.ID`, valida todos los `ctbAsientos.ID` asociados y elimina primero el detalle y después la cabecera dentro del mismo `SaveChanges`. El tacho de la cinta abre `ModalConfirmacion` sin cambiar el modo del formulario. Sí ejecuta inmediatamente la baja; No vuelve al mismo asiento. Después de eliminar, refrescar la consulta y mantener el ABM abierto en `MODO_ABM.CONSULTA`, priorizando el siguiente registro y usando el anterior cuando se borró el último. Cerrar solamente si no queda otro registro. El tacho del menú flotante de `AsientosBQD` usa el mismo modal y endpoint directamente: no abre `AsientosABM`, refresca la grilla y conserva una selección adyacente cuando existe. No volver a conectar este endpoint con un ID de renglón.

## Documentación

Cuando cambie el contrato o el recorrido:

1. actualizar `asientosArquitectura.md`;
2. actualizar la guía de consulta de Asientos;
3. actualizar los `AGENTS.md` de React y backend afectados;
4. regenerar `asientos-consulta-v3.patch` si cambió la API;
5. registrar qué se compiló y qué prueba contra SQL sigue pendiente.
