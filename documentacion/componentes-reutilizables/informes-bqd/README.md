# Informes de consultas BQD

## Propósito

Los informes BQD generan un PDF desde la instantánea funcional de una consulta. No leen el DOM ni las filas virtualizadas de Grilla. La primera integración corresponde a Asientos y funciona como prototipo sin pantalla de configuración.

## Archivos

- `src/components/InformesBQD/informeBQD.funcional.js`: aplica el layout vigente, distribuye columnas en líneas y reproduce búsqueda y ordenamiento.
- `src/components/InformesBQD/generarInformeBQD.js`: mide, pagina y dibuja el PDF mediante PDFKit.
- `src/components/InformesBQD/paginacionInformeBQD.js`: distribuye bloques completos y subgrillas entre páginas usando las alturas ya medidas.
- `src/components/InformesBQD/InformeBQDPDF.jsx` y `generarInformeBQD.reactPdf.js`: conservan temporalmente el prototipo anterior basado en `@react-pdf/renderer` para comparación.
- `src/components/InformesBQD/vistaPreviaBQD.js`: abre la vista previa del navegador y muestra el archivo generado.
- `src/modulos/asientos/AsientosBQD/asientos.informes.js`: prepara la instantánea y construye el descriptor completo de Asientos sin depender del JSX.

## Contrato actual

El documento recibe título, definición completa de columnas, layout vigente, filas, filtros aplicados, búsqueda, orden y fecha de generación. Una fila puede contener `subgrillas`; cada subgrilla declara título, columnas, filas, contexto para columnas calculadas y si muestra totales. Solamente se imprimen columnas con `visible !== false`. El layout determina el orden y los anchos actuales; las columnas que no figuran en él se agregan al final.

La definición predeterminada de columnas pertenece al módulo funcional consumidor, en un archivo `*.columnas.js`; no se reconstruye desde JSX ni desde el DOM. La pantalla BQD, la futura configuración del informe y el generador reciben la misma definición compartida. Las preferencias de layout se aplican como parámetros separados.

Las columnas se agrupan secuencialmente en varias líneas. Los mismos grupos se usan en el encabezado y en cada registro para mantener la alineación. PDFKit mide el texto con la fuente y el ancho efectivos antes de dibujarlo. El paginador suma el alto máximo de cada línea y conserva junta la fila principal con el comienzo de su subgrilla. Cuando un detalle supera una página, lo corta entre renglones, repite la cabecera general y la cabecera de la subgrilla y dibuja los totales al final. Una grilla simple alterna registros blancos y grises. Cuando existe una subgrilla, la fila principal permanece blanca y toda la subgrilla —cabecera, renglones y totales— utiliza un fondo gris uniforme.

## Orquestador de cada módulo

Todo módulo imprimible debe ofrecer un archivo `*.informes.js`, por ejemplo `asientos.informes.js`. Es el orquestador y consolidador de la preparación: ejecuta los modelos funcionales sin renderizar, obtiene las definiciones `*.columnas.js`, carga los módulos hijos necesarios y devuelve un descriptor completo para el motor genérico.

El orquestador no lee JSX ni DOM, no depende de React, no dibuja y no utiliza PDFKit directamente. El motor recibe exclusivamente su descriptor. De esta forma, una pantalla, una tarea sin interfaz y una futura ventana de configuración pueden reutilizar el mismo circuito.

La vista previa se abre inmediatamente desde el clic para evitar el bloqueo de ventanas emergentes. Mientras se completan los registros y se genera el PDF muestra una leyenda transitoria. El visor PDF del navegador permite imprimir o descargar.

## Integración

```jsx
const ventana = abrirVentanaVistaPreviaBQD();
const parametros = await prepararParametrosInformeAsientos(modelo, {
    layoutColumnas
});

const { generarArchivoInformeBQD } = await import("./generarInformeBQD.js");
const archivo = await generarArchivoInformeBQD(parametros);

mostrarArchivoEnVistaPreviaBQD(ventana, archivo);
```

`prepararParametrosInformeAsientos` combina la instantánea funcional con `asientosBQD.columnas.js` y devuelve título, columnas, layout, filas, filtros, búsqueda, orden y fecha. Para cada asiento que realmente alcanza la salida después de aplicar búsqueda y orden, ejecuta el modelo de `ABMAsientos` en consulta, sin montar su JSX, y adjunta los renglones definidos por `abmAsientos.columnas.js`. Los comprobantes repetidos se cargan una sola vez y las solicitudes se ejecutan con concurrencia limitada a cuatro. El JSX sólo inicia la acción, entrega el layout vigente y abre la vista previa. El generador se importa de forma dinámica al imprimir; de este modo, PDFKit no aumenta el módulo inicial de cada consulta BQD.

## Alcance pendiente

El prototipo usa A4 horizontal y una definición visual fija. Una etapa posterior podrá agregar configuración de columnas, tamaño y orientación sin modificar la preparación del estado de negocio.

## Verificación

- Confirmar que el PDF conserva el orden y ancho relativo actual de las columnas visibles.
- Confirmar que búsqueda y orden coinciden con la grilla.
- Verificar registros multilínea, fondos alternados y saltos de página.
- Probar volúmenes grandes y confirmar que cada página repite la cabecera.
- Confirmar que las subgrillas cortadas repiten su encabezado, no dividen renglones y presentan sus totales una sola vez.
- Probar vista previa, descarga e impresión desde Chrome y Edge.
