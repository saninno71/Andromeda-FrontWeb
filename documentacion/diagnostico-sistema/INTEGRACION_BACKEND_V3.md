# Integración de backend v3: estado vigente

Backend: C:\Users\sanin\ProyectosReact\BackendAndromeda\fyd-backend v3, base de código 0a4be26.

## Diagnóstico

Se agregaron los nueve archivos de DiagnosticoSistema detallados en GUIA_PROGRAMADOR_BACKEND.md. En Program.cs se agregaron AgregarDiagnosticoSistema() y UseCors("ReactPolicy"). El módulo usa ContextoLectura y DbGestion.

Swagger también se habilitó para el ambiente `Local`. Los perfiles de v3 ejecutan con `ASPNETCORE_ENVIRONMENT=Local`, mientras que el código original publicaba Swagger solamente en `Development`; por eso la interfaz encontraba `404` al solicitar `/swagger/v1/swagger.json`.

## Conexión

Por solicitud posterior del usuario, se migraron desde v2 las conexiones DbGestion y DbIdentidad a appsettings.Development.json de v3. Ambas apuntan a `ANDRES01\SQLEXPRESS01` con autenticación Windows; sus bases son `ByM-DBGA` y `ByM-Identidad`. DbIdentidad es requerida por la sincronización de permisos durante el arranque. Las conexiones no se incluyen en los parches portables.

## Consulta de Asientos

La guía vigente es [GUIA_PROGRAMADOR_CONSULTA_ASIENTOS_V3.md](GUIA_PROGRAMADOR_CONSULTA_ASIENTOS_V3.md). Contiene el inventario completo y los pasos de instalación y validación.

El GET consulta por ComprobanteID y usa Entity Framework con relaciones explícitas. No contiene SQL embebido. Completa cabecera, todos los renglones, cuenta, subcuenta, cliente, proveedor, caja, jurisdicción, vendedor, cobrador e importes separados por Debe/Haber.

La lectura del detalle está optimizada por bloques para evitar las subconsultas correlacionadas que provocaban demoras de uno a dos segundos. Con `DiagnosticoConsultas:Asientos:Habilitado` registra tiempos de Cabecera, Renglones, Ventas, Compras, Fondos y Total bajo `[ConsultaAsientoDetalle:EF]`.

El SP `dbo.cstctbAsientos` continúa reservado para la consulta general. El PUT interpreta el ID público como `gnrComprobantes.ID` y actualiza cabecera y renglones mediante entidades seguidas por EF. Conserva cada `ctbAsientos.ID` recibido, inserta las líneas con `Id = null` y elimina únicamente los IDs originales omitidos después de comprobar referencias directas desde Ventas, Compras y Fondos. `gnrComprobantes` está configurada sin `OUTPUT` directo para que sus triggers sigan ejecutándose de forma compatible. Una edición de cabecera conserva los importes históricos del detalle. El DELETE del comprobante completo continúa pendiente.

El parche vigente es [asientos-consulta-v3.patch](asientos-consulta-v3.patch). Reemplaza al antiguo ParchesV3/asientos-por-comprobante-v3.patch: aplicar sobre la v3 original, no encima del anterior sin revisar el diff.

## Validación

- Compilación aislada del proyecto API con la lectura EF completa: correcta, cero advertencias y cero errores.
- Construcción aislada del modelo de `ContextoAplicacion`: correcta, 36 entidades, sin conectarse a SQL Server.
- Escritura: 17 pruebas unitarias del servicio y 5 pruebas de integración de Asientos correctas para POST, modificaciones, altas de líneas y bajas seguras; las pruebas existentes del controller no cambiaron.
- Build de React: correcto.
- Frontend de escritura: 12 pruebas funcionales correctas. Nuevo abre `MODO_ABM.ALTA`, `Agregar ítem` crea una línea temporal editable, el tacho quita una línea localmente, `APLICAR` persiste y permanece abierto y `ACEPTAR` persiste y cierra.
- Ejecución real del GET optimizado contra SQL: correcta. Después del calentamiento, cuatro ComprobanteID reales respondieron entre 60 y 72 ms HTTP; el repositorio informó entre 57 y 67 ms.
- Prueba SQL desde el agente: bloqueada por autenticación Windows (Failed to generate SSPI context).
- La construcción del modelo no sustituye la validación de la traducción LINQ y de los datos contra SQL Server.
- El primer PUT real sobre el comprobante 184297 fue rechazado por el error SQL 334 antes de confirmar cambios. Se configuró EF para la tabla con triggers y se corrigió la conservación de importes; falta repetir la prueba después de reiniciar la API.
