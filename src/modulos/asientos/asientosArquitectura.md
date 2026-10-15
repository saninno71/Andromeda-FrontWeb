# Capa funcional de Asientos

## Responsabilidades

| Archivo | Responsabilidad |
| --- | --- |
| `AsientosBQD/asientos.funcional.js` | Estado y operaciones: filtros, consulta paginada, ediciones locales, preparación de datos propios y de módulos hijos. No importa React, controles ni grilla. |
| `AsientosBQD/asientos.modulos.js` | Construye una instancia y conecta los servicios y proveedores de datos de hijos. |
| `AsientosBQD/asientosService.js` | Comunicación HTTP y traducción de parámetros al contrato existente de la API. Propaga errores. |
| `AsientosBQD/useAsientos.js` | Suscribe React al modelo, gestiona su ciclo de vida y deriva las filas con cambios locales. |
| `AsientosBQD/asientosBQD.columnas.js` | Fuente funcional de las columnas de la consulta: campos, títulos, visibilidad, formatos, anchos, claves, totales y editores. No depende de React. |
| `AsientosBQD/ctbAsientosBQD.jsx` | Compone filtros y grilla, consume la definición compartida de columnas y conecta eventos. |
| `AsientosBQD/FiltroAsientos.jsx` / `AsientosBQD/MasFiltrosAsientos.jsx` | Presentación de los mismos filtros. Conservan solamente estado visual, como abrir el modal y mostrar chips. |
| `AsientosBQD/asientos.informes.js` | Entrada para obtener una instantánea de datos para la futura Central de Informes. |
| `AsientosABM/abmAsientos.funcional.js` | Estado del ABM, carga asíncrona, transformación de cabecera y líneas, y operaciones de edición; no depende de React ni de HTTP. |
| `AsientosABM/abmAsientos.modulos.js` | Compone una instancia del ABM y le inyecta su proveedor de carga. |
| `AsientosABM/abmAsientosService.js` | Consulta `GET /api/contabilidad/asientos/{id}` y traduce errores HTTP. |
| `AsientosABM/abmAsientos.columnas.js` | Fuente funcional de las columnas del detalle, incluidos permisos, editores y cálculos monetarios. Puede consumirse sin montar el ABM. |
| `AsientosABM/ABMAsientos.jsx` | Representa el modal y conecta controles y grilla con el modelo funcional y su definición compartida de columnas. |

Cada pantalla crea su propia instancia. No hay estado global compartido entre distintas consultas de Asientos.

## Estado independiente de las ventanas

`modelo.obtenerEstado()` devuelve el estado actual para lectura; los cambios se realizan mediante sus operaciones. `suscribir()` permite recibir actualizaciones y devuelve la función para cancelar la suscripción.

- `filtros`: valores actuales, incluyendo los de Más Filtros aunque nunca se haya abierto. Las entidades seleccionadas conservan ID, código y nombre según el contrato de cada control.
- `filtrosAplicados` y `parametrosAplicados`: copia de los valores utilizados en la última consulta. Cambiar un control no cambia retroactivamente el significado de las filas consultadas.
- `consulta`: filas remotas, progreso, cantidad total, límite visual y errores.
- `edicionesLocales`: cambios confirmados en la grilla, todavía locales.
- `edicionPendiente`: original y borrador de la fila actualmente en edición. Se informa por separado, sin confirmarla automáticamente.
- `vista`: búsqueda y orden de columnas aplicado a los datos por la grilla.

Los filtros se actualizan sin esperar un render. Por eso una selección seguida inmediatamente de Enter utiliza el nuevo valor. El texto transitorio para buscar opciones de un combo pertenece al editor; el valor de negocio es la entidad seleccionada. Abrir y cerrar Más Filtros no crea ni destruye esos valores.

## Preparar información sin montar formularios

```js
import { crearModeloAsientos } from './AsientosBQD/asientos.modulos.js';
import {
    prepararInformeAsientos,
    prepararParametrosInformeAsientos
} from './AsientosBQD/asientos.informes.js';

const modelo = crearModeloAsientos();
modelo.actualizarFiltro('detalle', 'Ejemplo');
const datos = await prepararInformeAsientos(modelo);
const parametrosPDF = await prepararParametrosInformeAsientos(modelo, {
    layoutColumnas: []
});
```

Desde la pantalla se utiliza la instancia que devuelve `useAsientos`, para incluir sus selecciones y ediciones actuales. Crear otra instancia produce un contexto independiente.

La operación espera la consulta pendiente, toma una copia del estado y solicita los datos auxiliares registrados. Para Más Filtros se reutilizan los proveedores funcionales de empresas y numeraciones. Las entidades ya seleccionadas están en el estado; no es necesario descargar todos los clientes, proveedores o cuentas.

Los hijos se declaran explícitamente en la composición. No se descubren recorriendo JSX ni abriendo ventanas:

```js
modelo.registrarHijo('detalle', async contexto => {
    // Puede delegar en otro módulo funcional, que prepare sus propios hijos.
    return prepararDatosDetalle(contexto);
});
```

Un hijo nuevo debe ofrecer una operación independiente de React y registrarse aquí. Debe cargar datos sin modificar los filtros ni el estado del padre. Las cargas auxiliares concurrentes se comparten por contexto. Una nueva preparación vuelve a solicitar los datos de hijos, para evitar información desactualizada; un error permite reintentar.

Por defecto se obtienen todos los registros, incluso si la pantalla alcanzó su límite de 5.000 filas. `{ todosLosRegistros: false }` entrega solamente los cargados e indica `completa: false` cuando faltan registros. Los errores de consulta o carga auxiliar se propagan; no se convierten en un informe vacío aparentemente correcto. Se admite `signal` para cancelar la preparación.

La instantánea incluye filtros actuales y aplicados, parámetros, datos de hijos, filas, total, estado de completitud, búsqueda, orden y borrador pendiente. Las filas corresponden a la consulta más las ediciones locales confirmadas; búsqueda y orden se entregan como metadatos, sin transformar las filas para un formato de informe específico. No se leen controles del DOM. La coherencia de los datos remotos entre páginas depende del contrato de la API.

## Independencia y alcance

La grilla solamente agregó dos eventos genéricos opcionales: `onEdicionChange` y `onOrdenChange`. No importa Asientos ni conoce sus filtros. Los controles conservan sus propias capas funcionales y sus variantes visuales.

Las definiciones de columnas no pertenecen al JSX. Cada grilla de Asientos las obtiene desde su módulo puro `*.columnas.js`. Esos módulos son la fuente única para la pantalla, la futura configuración de informes y cualquier ejecución sin renderización. El layout que modifica el usuario continúa siendo estado de vista y se aplica sobre esta definición predeterminada.

`prepararParametrosInformeAsientos` es el orquestador y consolidador del informe. Combina la instantánea del BQD con `asientosBQD.columnas.js`, describe los filtros, adjunta el layout recibido y ejecuta el modelo funcional de `ABMAsientos` en consulta para incorporar una subgrilla de renglones a cada asiento presentado. Reutiliza `abmAsientos.columnas.js`, conserva el contexto de cotizaciones para las columnas calculadas, evita repetir cargas del mismo comprobante y limita a cuatro las solicitudes simultáneas. El JSX no arma columnas, títulos, filtros ni metadatos del documento; solamente dispara la operación, entrega el layout vigente y presenta la vista previa. Si se ejecuta fuera de React, puede omitirse el layout y se utilizan los valores predeterminados de la definición.

La convención para todo módulo imprimible es disponer de un `*.informes.js`. Ese archivo puede ejecutar BQD, ABM y otros hijos sin renderizar y debe entregar al motor un descriptor cerrado. No conoce React, DOM ni PDFKit. El motor genérico mide la fila principal y sus subgrillas; si un detalle no entra, lo divide entre renglones, repite ambas cabeceras y deja los totales en el último segmento.

La consulta de Asientos utiliza esta preparación para imprimir el BQD. El botón Imprimir obtiene la instantánea completa y respeta búsqueda, orden y layout configurado de columnas visibles. El destino PDF genera en React un documento A4 horizontal mediante PDFKit; sus columnas se distribuyen secuencialmente en varias líneas, cada registro lógico permanece unido y la cabecera se repite en cada página. El destino Excel genera un archivo XLSX mediante ExcelJS: el encabezado ocupa la columna A, los títulos de la grilla principal comparten una fila, los datos aparecen debajo y cada subgrilla se escribe desde la columna B bajo su registro padre. Ambos destinos usan el mismo descriptor funcional y no dependen de la API ni de la DLL histórica. La edición de la consulta sigue siendo local y se descarta al consultar nuevamente. Caja bancaria conserva su valor en el modelo; el servicio existente todavía no tiene un parámetro asociado a ese control.

## Verificación

Pruebas del modelo sin React ni navegador:

```sh
node --test src/modulos/asientos/AsientosBQD/asientos.funcional.test.mjs
```

Cubren preparación sin abrir formularios, paginación completa, filtros actuales/aplicados, cambios locales y pendientes, independencia de instantáneas, reintentos de hijos, errores remotos y consultas superpuestas.

## Primera entrega visual de ABM Asientos

La consulta ahora es de solo lectura: Editar utiliza el evento genérico `onEditarRegistro(fila)` de Grid para abrir `ABMAsientos.jsx`. Sin ese evento, Grid conserva la edición interna cuando `editable` está habilitado.

`AsientosABM/abmAsientos.funcional.js` crea una instancia independiente por apertura y puede cargar sucesivos `comprobanteID` mientras el modal permanece abierto. Una nueva carga cancela la solicitud anterior, reinicia el estado para el ID solicitado y consulta `GET /api/contabilidad/asientos/{id}`. `AsientosABM/abmAsientos.modulos.js` conecta el modelo con `AsientosABM/abmAsientosService.js`. El modelo transforma la respuesta completa en la cabecera y los renglones que consume la pantalla; React no ejecuta ni interpreta el contrato HTTP. Cancelar, X y Escape destruyen la instancia y descartan sus cambios. El cuerpo tiene scroll y el encabezado, cinta y pie permanecen visibles.

El ABM recibe y conserva `MODO_ABM.CONSULTA`, `MODO_ABM.EDICION` o `MODO_ABM.ALTA`. El lápiz del menú flotante abre edición, el ojo abre consulta y Nuevo abre un estado sin ComprobanteID; las flechas mantienen consulta/edición al cambiar de comprobante y quedan bloqueadas durante el alta. `AsientosABM/abmAsientos.permisos.js` centraliza la política que consumen JSX y modelo funcional. En edición y alta habilita Empresa, Fecha, Detalle, Moneda, Numeración y Observaciones. Número y Punto de venta permanecen informativos en asientos existentes y se habilitan exclusivamente durante el alta. En los renglones permite Cuenta —ID, código y nombre como una unidad—, Debe, Haber y Detalle. Los demás campos permanecen en lectura. Moneda usa el control reutilizable `ComboMonedas`, que conserva ID, código y nombre, presenta `(Código) Descripción` y selecciona el texto completo al recibir foco; su servicio temporal filtra `src/simul/Monedas.json` por código o descripción y podrá cambiarse por el endpoint sin modificar el control. En consulta, el modelo rechaza toda mutación.

El header reutiliza `ModalHeader` y entrega `ABMIndicadorModo` mediante `contenidoAdicional`. Alta muestra `Registro nuevo` con punto verde; edición muestra `Modo edición` con punto azul; consulta muestra `Modo consulta` con punto gris. Al cambiar de modo desde la cinta, la leyenda se actualiza a partir de `estado.modo` sin mantener un estado visual separado. La identificación `Asiento Nro.` usa `claveEncabezado`, capturada durante la carga, y no depende del valor de los controles del formulario.

La presentación de la cinta se centraliza en `AsientosABM/abmAsientos.cinta.js` y parte de `obtenerDisponibilidadAccionesRegistroABM`, la política común de los ABM. En Edición se deshabilitan Nuevo, Borrar y Ver; Editar y las flechas conservan su estado normal. En Alta se deshabilitan Nuevo, Editar, Borrar, Ver y las cuatro flechas de navegación. El pie presenta solamente Cancelar y Aceptar: Cancelar descarta el alta y Aceptar crea el registro y cierra. Los próximos casos de uso de la cinta deben agregarse a esa política y no dispersarse entre botones.

Imprimir, Destino, Operación monetaria, Acciones y Trazabilidad permanecen visualmente activos en todos los modos. Todavía no ejecutan una operación hasta que se defina cada caso de uso, pero no se representan como acciones deshabilitadas.

Ojo cambia el modelo a Consulta y el pie reutilizable deja solamente Cerrar. Lápiz cambia a Edición y restituye Cancelar, Aplicar y Aceptar. Nuevo abre otra instancia en Alta con Cancelar y Aceptar. Tacho cambia a Baja y vuelve a mostrar el pie, pero Aplicar y Aceptar permanecen deshabilitados hasta implementar la eliminación del comprobante. Estos cambios de modo no llaman por sí solos a la API.

`AsientosBQD/ctbAsientosBQD.jsx` coordina la navegación entre ambas pantallas. Solicita a la API pública de Grid el primero, anterior, siguiente o último registro; Grid respeta búsqueda y orden, mueve su ventana virtual y devuelve la fila completa. La pantalla extrae `comprobanteID` y solicita al modelo del ABM la nueva carga. Ni Grid conoce Asientos ni `ABMNavegacionRegistros` conoce Grid. Los cuatro botones pertenecen al grupo reutilizable `components/ABM/ABMNavegacionRegistros`, incluido dentro de `MenuCintaAcciones`.

Después de un alta, el ABM conserva en su propio estado el `ComprobanteID` devuelto por el POST aun cuando Aceptar guarda sin recargar el formulario. `AsientosBQD` consulta solamente ese ID, entrega la fila resultante a `modelo.inyectarRegistro()` y el modelo la agrega al final de `estado.consulta.dataGrid`; no repite la consulta general ni delega datos a una colección interna de Grid. `consulta.filasAlFinal` identifica temporalmente esa misma fila para mantenerla visible al final aunque exista búsqueda u orden activos. Después del render, la pantalla usa `Grid.ubicarFila()` para desplazar la virtualización, seleccionarla y reconstruir `puedeAnterior`/`puedeSiguiente`. Una nueva consulta completa reemplaza la colección y limpia la marca.

La leyenda de carga del ABM se controla mediante `mostrarMensajeCarga`. La consulta de Asientos la desactiva porque la respuesta habitual es rápida. Al navegar, la capa funcional conserva el contenido vigente durante la solicitud y lo reemplaza de forma atómica cuando llega el nuevo asiento, evitando vaciar y volver a dibujar el formulario.

La grilla de detalle se carga desde las `lineas` del endpoint y separa los importes por `tipo` (`1` Debe, `-1` Haber). El contrato entrega importe original, local y de referencia; la capa funcional conserva y muestra las seis variantes `debe`, `haber`, `debeLocal`, `haberLocal`, `debeReferencia` y `haberReferencia`. El lado contrario se representa como `null`, no como cero.

El detalle activa `Grid.ajustarAlturaAContenido` con una altura mínima de 205 px. Con pocos renglones conserva el tamaño anterior; al aumentar la cantidad crece para mostrar todas las filas sin scrollbar vertical interno. El desplazamiento vertical pasa al cuerpo general de `ABMAsientos`, mientras el scroll horizontal, el encabezado y los totales de Grid se conservan.

El GET individual interpreta siempre `{id}` como `gnrComprobantes.ID`. La API v3 consulta cabecera y renglones mediante Entity Framework y relaciones explícitas, sin SQL embebido. La moneda de cabecera se proyecta completa desde `gnrMonedas`: ID, código y nombre, para que `ComboMonedas` pueda presentar `(Código) Descripción` también al consultar asientos existentes. La grilla muestra cuenta, subcuenta, cliente, proveedor, caja, jurisdicción, vendedor y cobrador, separando código y nombre en columnas independientes. Los campos sin editor de entidad registrado permanecen en modo lectura. El ancho total usa el scroll horizontal reutilizable de Grid para conservar anchos legibles. `abmAsientos.funcional.js` conserva además los identificadores internos, disponibles para impresión y guardado sin leer controles del DOM. También conserva `fechaEmision`, aunque todavía no tenga un control visual propio.

Las cotizaciones local y de referencia son informativas por ahora. La pantalla conserva los números recibidos por el GET y enviados al guardar, pero los presenta con agrupación de miles y cuatro decimales en configuración `es-AR`. Sus equivalencias visuales temporales son `ARS = ARS` y `USD = ARS`; no deben usarse para recalcular ni reemplazar los valores del modelo.

La API obtiene el detalle EF mediante consultas simples por bloques y combina las relaciones usando `ctbAsientos.ID`. Esta forma evita las subconsultas correlacionadas repetidas de la primera versión EF. El diagnóstico local informa cada etapa con el prefijo `[ConsultaAsientoDetalle:EF]`, lo que permite separar tiempo de SQL/backend de renderizado y navegación en React.

El guardado usa `PUT /api/contabilidad/asientos/{ComprobanteID}`. La capa funcional arma el cuerpo desde su estado, transforma Debe/Haber en `Tipo` e `Importe`, conserva `fechaEmision` y los `ctbAsientos.ID` de las filas que permanecen, e informa validaciones o errores HTTP sin leer controles del DOM. `Agregar ítem` confirma primero el borrador de la fila activa, crea una fila con clave temporal negativa sólo en React, la incorpora al estado y solicita a Grid que la haga visible y la abra en edición; de este modo, agregar una segunda fila no descarta los valores escritos en la anterior. El payload envía esa clave temporal como `id: null` para que SQL genere su ID definitivo. Antes de validar, la capa funcional omite exclusivamente las altas temporales que no poseen Cuenta, Debe, Haber ni Detalle; una fila con cualquier dato cargado se incluye y debe cumplir todas las validaciones. La marca `modificado` surge de comparar una instantánea normalizada de los campos persistibles contra el estado cargado: agregar filas vacías no la activa y editar un valor para luego restaurarlo la desactiva nuevamente. El tacho elimina la fila del estado local en modo edición: si era temporal no llega al backend; si tenía ID, su ausencia en el PUT solicita la baja. Cancelar descarta esas bajas locales. El ABM observa el borrador de edición de Grid y, antes de Aplicar o Aceptar, invoca `confirmarEdicion()` para incorporar la última fila aunque el usuario no haya presionado un segundo Enter. `APLICAR` se habilita sólo ante diferencias reales confirmadas o pendientes, guarda, recarga el asiento y mantiene abierto el ABM. `ACEPTAR` guarda y cierra cuando existen cambios; en un alta, la consulta general incorpora después sólo la fila creada mediante su modelo funcional. Si no existen cambios, omite el PUT y cierra directamente. La API actualiza las entidades rastreadas, agrega altas y marca como eliminadas solamente las entidades existentes omitidas, todo en un único `SaveChanges`. Antes de una baja verifica referencias desde Ventas, Compras y Fondos y devuelve conflicto si la línea está vinculada. Rechaza IDs repetidos o ajenos. El informe utiliza este mismo modelo como proveedor funcional de los renglones, sin montar `ABMAsientos.jsx`.

`AsientosABM/abmAsientos.validaciones.js` contiene la regla contable previa al guardado. Después de normalizar y validar cada renglón, suma Debe y Haber a dos decimales. Si los totales difieren, interrumpe el POST o PUT y el ABM presenta en su panel de error `El asiento no balancea. La suma del Debe debe ser igual a la suma del Haber.`. El backend conserva la misma validación como garantía de integridad.

El cuerpo desplazable consume el hook general `useScrollErrorABM`. Cuando aparece `error` o `errorGuardado`, se ubica inmediatamente al inicio y reafirma esa posición en el siguiente cuadro del navegador, después de que la grilla termina de reaccionar al cambio de estado. Así deja visible el panel con `role="alert"` tanto para validaciones locales como para respuestas fallidas de la API.

Los services de ABM y consulta reutilizan `infraestructura/http/respuestaHttp.js` para interpretar errores. Si una respuesta Problem Details de ASP.NET contiene un diccionario `errors`, el intérprete presenta sus mensajes específicos, elimina duplicados y combina los errores de varios campos. Sólo cuando no existen usa `detail`, `mensaje`, `title`, un cuerpo de texto o el mensaje alternativo de la operación. De este modo, una respuesta cuyo título sea genérico muestra, por ejemplo, `El detalle es obligatorio.` sin modificar la regla de obligatoriedad definida por la API.

La baja del comprobante completo usa `DELETE /api/contabilidad/asientos/{ComprobanteID}`. El tacho de la cinta abre el componente reutilizable `ModalConfirmacion`; Sí ejecuta el DELETE y No cancela sin cambiar el modo. Después de una baja correcta, la consulta general se refresca y el ABM permanece abierto en `MODO_ABM.CONSULTA`: carga el registro siguiente o, si se borró el último, el anterior. Solamente se cierra cuando ya no quedan registros. La selección de la grilla inferior se mueve al mismo destino antes de refrescar para conservar el contexto y el scroll. El tacho del menú flotante de la consulta ejecuta el mismo recorrido directamente desde `AsientosBQD`: muestra solamente `ModalConfirmacion`, no abre el ABM y, después del éxito, refresca la grilla conservando una selección adyacente cuando existe. La API valida cada renglón por su `ctbAsientos.ID`, elimina todas las líneas y luego `gnrComprobantes`, dentro del mismo `SaveChanges`.

Una modificación de cabecera no recalcula los importes históricos del detalle. `ImpLocal` e `ImpReferencia` se conservan cuando no cambian el importe ni la cotización; si cambian, el backend convierte dividiendo por la cotización del comprobante. `gnrComprobantes` tiene triggers y su configuración EF deshabilita únicamente la cláusula SQL `OUTPUT`, manteniendo la ejecución normal del trigger.

El alta usa `POST /api/contabilidad/asientos`. La capa funcional construye la cabecera y las líneas con el mismo criterio del PUT, pero no envía IDs de renglón. Punto de venta y Número pueden quedar vacíos cuando la numeración es automática y se envían como `null`; si se informa Punto de venta, el backend comprueba que coincida con `NumeraTipo.Numeracion.PuntoVenta`. Cuando Número llega nulo, el repositorio reserva de forma atómica el siguiente valor configurado, lo asigna a `gnrComprobantes.Numero` y avanza `gnrNumeraciones.Numero` dentro de la misma transacción que crea la cabecera y sus `ctbAsientos`. Aceptar crea y cierra; Alta no presenta Aplicar. La grilla vacía es el estado inicial normal del alta y por eso no muestra el aviso `No se encontraron registros`; dicho aviso se conserva para consulta y edición. Mientras no exista un servicio de cotizaciones para el alta, el estado nuevo inicializa ambas cotizaciones en `1`; este valor provisional debe reemplazarse cuando se incorpore la fuente definitiva.
