# Capa funcional de Asientos

## Responsabilidades

| Archivo | Responsabilidad |
| --- | --- |
| `asientos.funcional.js` | Estado y operaciones: filtros, consulta paginada, ediciones locales, preparación de datos propios y de módulos hijos. No importa React, controles ni grilla. |
| `asientos.modulos.js` | Construye una instancia y conecta los servicios y proveedores de datos de hijos. |
| `asientosService.js` | Comunicación HTTP y traducción de parámetros al contrato existente de la API. Propaga errores. |
| `useAsientos.js` | Suscribe React al modelo, gestiona su ciclo de vida y deriva las filas con cambios locales. |
| `ctbAsientosBQD.jsx` | Compone filtros y grilla; configura sus columnas y conecta eventos. |
| `FiltroAsientos.jsx` / `MasFiltrosAsientos.jsx` | Presentación de los mismos filtros. Conservan solamente estado visual, como abrir el modal y mostrar chips. |
| `asientos.informes.js` | Entrada para obtener una instantánea de datos para la futura Central de Informes. |

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
import { crearModeloAsientos } from './asientos.modulos.js';
import { prepararInformeAsientos } from './asientos.informes.js';

const modelo = crearModeloAsientos();
modelo.actualizarFiltro('detalle', 'Ejemplo');
const datos = await prepararInformeAsientos(modelo);
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

Esta preparación aún no envía información a la Central de Informes ni implementa impresión o guardado remoto. La edición de la consulta sigue siendo local y se descarta al consultar nuevamente. Caja bancaria conserva su valor en el modelo; el servicio existente todavía no tiene un parámetro asociado a ese control.

## Verificación

Pruebas del modelo sin React ni navegador:

```sh
node --test src/modulos/asientos/asientos.funcional.test.mjs
```

Cubren preparación sin abrir formularios, paginación completa, filtros actuales/aplicados, cambios locales y pendientes, independencia de instantáneas, reintentos de hijos, errores remotos y consultas superpuestas.
