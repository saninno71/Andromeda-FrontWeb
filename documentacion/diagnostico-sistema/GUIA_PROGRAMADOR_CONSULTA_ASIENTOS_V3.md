# API v3: lectura y actualización de un asiento mediante Entity Framework

## Objetivo y contrato de identidad

`GET /api/contabilidad/asientos/{id}` recibe siempre `gnrComprobantes.ID`, denominado `ComprobanteID`. No recibe `ctbAsientos.ID`.

```text
gnrComprobantes.ID                 cabecera del asiento
        1
        └── N ctbAsientos.ComprobanteID
                    └── ctbAsientos.ID   identidad de cada renglón
```

El error original consistía en comenzar la consulta por `ctbAsientos.ID`. La implementación vigente comienza en `gnrComprobantes`, verifica que tenga renglones y obtiene todos los `ctbAsientos` relacionados.

## Situaciones encontradas y tratamiento aplicado

Esta sección registra los problemas en el orden lógico de la integración. Cada situación distingue la causa comprobada, lo realizado y el estado final. Los detalles de arquitectura y el inventario de archivos se desarrollan en los apartados posteriores.

| N.º | Situación | Estado |
|---:|---|---|
| 1 | El GET interpretaba el ID como un renglón. | Resuelta. |
| 2 | Faltaban campos y relaciones del detalle. | Resuelta para lectura. |
| 3 | Se había introducido SQL embebido como parche. | Reemplazado por EF. |
| 4 | La primera lectura EF demoraba entre uno y dos segundos. | Optimizada. |
| 5 | El PUT podía perder la identidad de los renglones. | Corregida en código y pruebas. |
| 6 | El PUT recalculaba incorrectamente importes no editados. | Corregida en código y pruebas. |
| 7 | EF generaba `OUTPUT` sobre una tabla con triggers. | Resuelta. |
| 8 | El trigger devolvía el ID y EF lo interpretaba como filas afectadas. | Resuelta mediante una corrección puntual del trigger. |
| 9 | La consulta general a veces queda esperando varios minutos. | Diagnosticada; no se modificó el SP. |
| 10 | El ABM no podía quitar un renglón existente con seguridad. | Resuelta en código y pruebas. |
| 11 | El POST insertaba líneas con `ComprobanteID = 0` y no persistía la cabecera. | Resuelta en código y pruebas EF. |
| 12 | El POST dejaba `Numero = NULL` porque SQL no posee trigger de `INSERT` para autonumerar. | Corregida en código y pruebas EF; pendiente repetir el POST real. |
| 13 | El GET devolvía nombre e ID de Moneda, pero omitía su código. | Corregida en modelo, proyección, DTO y pruebas. |
| 14 | El DELETE interpretaba el ID público como ID de un renglón. | Corregida en API, React y pruebas. |
| 15 | El trigger de baja devolvía el ID y EF lo interpretaba como filas afectadas. | Resuelta mediante una corrección puntual del trigger. |

### Situación 1: confusión entre ComprobanteID e ID de renglón

**Problema observado:** el endpoint `GET /api/contabilidad/asientos/{id}` comenzaba la búsqueda por `ctbAsientos.ID`. El ID enviado por la grilla general, en cambio, corresponde a `gnrComprobantes.ID`.

**Causa:** se mezclaron las dos identidades del modelo. Un comprobante tiene una cabecera y varios renglones; el ID público del ABM identifica la cabecera.

**Tratamiento aplicado:** el controller, servicio y repositorio pasaron a consultar por ComprobanteID. El GET comienza en `gnrComprobantes` y carga todos los `ctbAsientos` cuyo `ComprobanteID` coincide.

**Estado:** resuelta. El contrato público utiliza ComprobanteID y cada renglón conserva su propio ID.

### Situación 2: campos del detalle vacíos o sin relación

**Problema observado:** cliente, proveedor, caja, subcuenta, jurisdicción, vendedor, cobrador y sus nombres llegaban vacíos o no estaban disponibles. También faltaban las variantes local y de referencia de Debe/Haber.

**Causa:** la v3 no tenía modeladas todas las relaciones que el SQL histórico de Andrómeda ya resolvía. Varias relaciones se enlazan mediante `ctbAsientos.ID`, no mediante el ID de la cabecera.

**Tratamiento aplicado:** se agregaron las entidades, navegaciones y configuraciones EF necesarias para Ventas, Compras, Fondos, Agenda, Monedas, Provincias y Corredores. Se amplió `AsientoConsulta`, el DTO y su mapeo. Las seis variantes de importes se conservan por separado.

**Estado:** resuelta para la lectura individual. Si existe más de una relación candidata para un renglón, se toma determinísticamente la de menor ID.

### Situación 3: SQL embebido utilizado como solución temporal

**Problema observado:** una primera corrección reconstruía el detalle mediante SQL embebido.

**Causa:** se intentó recuperar rápidamente las relaciones faltantes sin completar el modelo EF.

**Tratamiento aplicado:** se eliminó `Database.SqlQuery<AsientoConsulta>` y se reconstruyó la lectura con entidades, configuraciones y consultas LINQ de Entity Framework. `dbo.cstctbAsientos` quedó reservado para la consulta general.

**Estado:** resuelta. No debe reintroducirse el parche con SQL embebido.

### Situación 4: demora de la primera implementación EF

**Problema observado:** avanzar entre asientos podía demorar entre uno y dos segundos, mientras la versión temporal con SQL respondía mucho más rápido.

**Causa:** la proyección inicial resolvía cada ID, código y nombre mediante numerosos `FirstOrDefault` correlacionados. EF generaba una sentencia extensa con subconsultas repetidas.

**Tratamiento aplicado:** la lectura se dividió en consultas acotadas para cabecera, renglones, Ventas, Compras y Fondos. Los resultados se combinan en memoria por `ctbAsientos.ID`.

**Estado:** optimizada. Después del calentamiento, las mediciones registradas estuvieron aproximadamente entre 60 y 72 ms HTTP.

### Situación 5: pérdida potencial de IDs durante el PUT

**Problema observado:** la implementación original del update utilizaba `comprobante.Asientos.Clear()` y recreaba el detalle.

**Causa:** el CRUD trataba los renglones como una colección reemplazable, aunque Ventas, Compras y Fondos pueden referenciar directamente `ctbAsientos.ID`.

**Tratamiento aplicado:** el PUT exige que los IDs recibidos sean un subconjunto válido de los existentes, rechaza duplicados e IDs ajenos y actualiza esas entidades seguidas por EF. Las altas llegan con `Id = null`, se agregan individualmente y reciben su ID de SQL. Un ID original omitido representa una baja: antes de eliminar su entidad rastreada se comprueban referencias directas desde Ventas, Compras y Fondos. Está prohibido borrar y recrear el detalle.

**Estado:** corregida en código y pruebas. La posterior corrección de la Situación 8 eliminó el bloqueo SQL restante sin cambiar la identidad de los renglones.

### Situación 6: modificación involuntaria de ImpLocal e ImpReferencia

**Problema observado:** al cambiar solamente Empresa y Detalle, EF también intentaba actualizar `ImpReferencia` de los renglones.

**Causa:** el PUT recibe la instantánea completa y el servicio recalculaba siempre los importes derivados. Además utilizaba multiplicación, aunque la cotización histórica almacenada requiere división.

**Tratamiento aplicado:** si importe y cotización no cambian, se conservan exactamente `ImpLocal` e `ImpReferencia`. Si corresponde recalcular, se utiliza `Importe / CotizacionLocal` o `Importe / CotizacionReferencia`.

**Estado:** corregida y cubierta por pruebas unitarias.

### Situación 7: error 334 por OUTPUT y triggers

**Problema observado:** el primer PUT real falló con el error SQL 334: una tabla con triggers activos no admite el `OUTPUT` directo generado por EF.

**Causa:** `gnrComprobantes` tiene triggers y Entity Framework usa `OUTPUT` por defecto para comprobar el resultado de `SaveChanges`.

**Tratamiento aplicado:** `ComprobanteConfig` incorporó `UseSqlOutputClause(false)`. Esto cambia la estrategia de escritura de EF; no desactiva ni evita los triggers.

**Estado:** resuelta. Al quitar `OUTPUT` apareció la incompatibilidad independiente documentada y posteriormente corregida en la Situación 8.

### Situación 8: el trigger devolvía el ID como un conjunto de resultados

**Problema observado:** el segundo PUT real grabó Empresa y Detalle, pero la API respondió `DbUpdateConcurrencyException`: esperaba una fila afectada y recibió `184297`.

**Causa:** `gnrComprobantes_Mod_trigger` ejecuta `SELECT ID FROM Deleted`. EF recibe ese ID antes del contador de filas y no tiene información para distinguir su significado.

**Tratamiento aplicado:** se inspeccionó la definición real en `ByM-DBGA` y se confirmó que el trigger utilizaba `SELECT ID FROM Deleted` solamente para consultar luego `@@ROWCOUNT`. Ese `SELECT` fue reemplazado por `IF (SELECT COUNT(*) FROM Deleted) = 1`, que conserva la condición de ejecutar la lógica para una sola fila sin emitir un conjunto de resultados hacia EF. El cambio se aplicó mediante `ALTER TRIGGER`; el trigger permanece habilitado y mantiene intacta la actualización de `gnrNumeraciones` cuando cambian Número o Numeración.

No se capturó ni ignoró `DbUpdateConcurrencyException` en la API. Tampoco se deshabilitó el trigger. Se guardaron el script aplicado y el script de reversión en `documentacion/diagnostico-sistema/sql/`.

**Estado:** resuelta en SQL. Falta repetir una prueba funcional del PUT desde Swagger o React para confirmar el recorrido completo de la API con datos reales.

### Situación 9: demora intermitente de dbo.cstctbAsientos

**Problema observado:** la misma consulta general puede responder en pocos segundos o permanecer varios minutos ejecutándose.

**Causa observada en el SPID 53:** `RESOURCE_SEMAPHORE`. La sesión no estaba bloqueada por otra transacción; esperaba una concesión de memoria para ejecutar una parte del plan. En la medición realizada esperó aproximadamente 278 segundos y terminó cerca de los cinco minutos.

**Tratamiento aplicado:** se agregó logging optativo alrededor del endpoint y del procedimiento almacenado para separar tiempos de React, API, OData y SQL. No se modificó `dbo.cstctbAsientos`.

**Estado:** diagnosticada. El análisis y eventual optimización del plan pertenecen al SQL histórico y quedan fuera de esta intervención.

### Situación 10: baja segura de un renglón desde el ABM

**Problema observado:** el tacho de la grilla no tenía persistencia y el contrato anterior exigía reenviar todos los IDs, por lo que el usuario no podía quitar una línea existente.

**Causa:** el PUT distinguía altas y modificaciones, pero interpretaba cualquier ID faltante como error. El endpoint DELETE existente corresponde al comprobante completo y no resulta adecuado para editar la composición del detalle.

**Tratamiento aplicado:** React elimina la fila solamente de su estado hasta Aplicar o Aceptar. El servicio calcula `idsExistentes - idsRecibidos`; por cada ID omitido consulta `TieneReferenciasExternas`, que verifica `vtsComprobantes.AsientoID`, `cpsComprobantes.AsientoID` y `fdsComprobantes.AsientoID`. Si existe una referencia devuelve `Asiento.RenglonReferenciado`; de lo contrario el repositorio marca exclusivamente esa entidad con `Remove`. Una fila temporal se descarta sólo en React. Cancelar cierra sin enviar el PUT.

**Estado:** implementada y cubierta por pruebas unitarias, de integración EF y funcionales de React. La validación de balance continúa aplicándose a la instantánea final, por lo que una baja que deje el asiento desbalanceado se rechaza.

### Situación 11: alta incompleta en el POST de Asientos

**Problema observado:** `CrearAsiento` construía la cabecera en memoria, pero el repositorio sólo recibía cada renglón convertido por separado con `ComprobanteID = 0`. La prueba anterior comprobaba únicamente que existieran dos líneas en EF InMemory y tenía comentada la validación de `gnrComprobantes`.

**Causa:** el mapeo individual de `Asiento` no trasladaba la navegación hacia el comprobante de dominio y nunca se agregaba la cabecera al contexto.

**Tratamiento aplicado:** `CrearPorComprobante` construye una entidad `gnrComprobantes`, agrega sus `ctbAsientos` mediante la navegación EF, ejecuta un único `SaveChanges` y devuelve el ComprobanteID generado. El POST admite Punto de venta; cuando fue informado valida que coincida con `NumeraTipo.Numeracion.PuntoVenta`. Si el Número llega vacío y la numeración es automática, el repositorio reserva el siguiente número y avanza `gnrNumeraciones` dentro de la misma transacción del alta. Los importes local y de referencia se calculan por división, igual que en el PUT.

**Estado:** corregida. La prueba de integración comprueba una cabecera, dos líneas con el ComprobanteID generado y el total del Debe. Falta una prueba funcional contra SQL Server compartido.

### Situación 12: Punto de venta y Número se exigían en numeraciones automáticas

**Problema observado:** React impedía crear un asiento con Punto de venta vacío y la API convertía un Número ausente en cero. Además, la validación de Punto de venta incorporada junto con el POST lo exigía siempre.

**Causa:** el contrato agregado para el alta declaró `PuntoVenta` como `int` y el servicio comparaba incondicionalmente su valor con `NumeraTipo.Numeracion.PuntoVenta`. Los datos reales contienen numeraciones válidas con `PuntoVenta = NULL`; la v3 ya declaraba `Numero` nullable, pero aplicaba `dto.Numero ?? 0` antes de persistir.

**Tratamiento aplicado:** React envía `null` para Punto de venta o Número vacíos. `CrearAsientoDto.PuntoVenta` pasó a `int?`; el servicio consulta y valida el Punto de venta configurado solamente cuando el request trae un valor. La primera implementación conservaba `Comprobante.Numero` nulo hasta SQL, pero la prueba real demostró que `gnrComprobantes` no tiene trigger de `INSERT`: el registro ID 189766 quedó con `Numero = NULL` y la numeración 81 permaneció en 1069. La corrección definitiva se ubicó en `CrearPorComprobante`: para una numeración automática reserva mediante EF el valor actual más uno con actualización condicional, asigna ese valor a la cabecera y confirma la numeración, la cabecera y el detalle en una misma transacción. Ante una creación concurrente, vuelve a leer y reintenta en lugar de entregar el mismo número. Para una numeración manual (`NumeradorTipo = 1`), un request sin Número se rechaza. `CstctbAsientosReadModel.Numero` pasó a `int?` como defensa para que un registro histórico defectuoso no derribe la consulta general.

**Estado:** corregida en código y cubierta por pruebas funcionales de React, unitarias del servicio y de integración EF. El registro defectuoso ID 189766 fue reparado transaccionalmente: `gnrComprobantes.Numero` y `gnrNumeraciones.ID 52` quedaron ambos en 1070. El trigger no podía resolver esa reparación porque `NumeroNuevo <> NumeroViejo` no resulta verdadero cuando `NumeroViejo` es `NULL`; por eso se actualizaron de forma explícita y conjunta ambos valores, verificando previamente comprobante, tipo, numeración y contador. Debe repetirse el POST contra SQL Server compartido y confirmar que el próximo comprobante recibe 1071 y que la numeración avanza al mismo valor.

### Situación 13: código de Moneda ausente en el GET individual

**Problema observado:** al consultar un asiento existente, el control mostraba `() Pesos Argentinos`. React conservaba correctamente `monedaCodigo`, pero el JSON del GET sólo contenía `monedaId` y `monedaNombre`.

**Causa:** `AsientoConsulta`, la proyección EF, `ConsultarAsientoDto` y `AsientoDtoMapeo` no declaraban ni trasladaban `gnrMonedas.Codigo`.

**Tratamiento aplicado:** se agregó `MonedaCodigo` en los cuatro niveles y la prueba del servicio exige ahora `ARS` junto con `Pesos Argentinos`. El contrato de cabecera devuelve Moneda como ID, código y nombre.

**Estado:** corregida en código y pruebas. Requiere reiniciar la API para que el frontend reciba el contrato actualizado.

### Situación 14: DELETE conectado al ID de un renglón

**Problema observado:** el endpoint `DELETE /api/contabilidad/asientos/{id}` buscaba mediante `ObtenerPorId`, que interpreta el valor como `ctbAsientos.ID`, y luego marcaba solamente ese renglón para eliminar. El ABM recibe y conserva `gnrComprobantes.ID`, por lo que conectar el tacho al endpoint anterior podía no encontrar el registro o afectar una línea equivocada.

**Causa:** GET y PUT ya habían adoptado ComprobanteID como identidad pública, pero el recorrido DELETE conservaba el contrato original por renglón. Además, la relación EF está configurada con `DeleteBehavior.Restrict`, de modo que la cabecera no puede eliminarse antes que su detalle.

**Tratamiento aplicado:** el servicio carga `AsientoConsulta` por ComprobanteID y valida todos sus renglones por `ctbAsientos.ID`: comprobante padre, referencias directas desde Ventas/Compras/Fondos y vinculaciones. Las validaciones de período y cuenta corriente se ejecutan una vez sobre la cabecera. El repositorio carga el comprobante rastreado con todos sus `Asientos`, marca primero el detalle mediante `RemoveRange` y luego la cabecera; `GuardarCambios` confirma el conjunto como una única unidad. React agregó el servicio DELETE y una operación funcional invocada directamente desde los tachos. En el ABM, `ModalConfirmacion` solicita Sí/No antes de enviar; ante éxito, la consulta se refresca y el ABM continúa en modo Consulta sobre el siguiente registro o, si no existe, el anterior. En la grilla general, el tacho del menú flotante muestra directamente el mismo modal, sin abrir el ABM; al confirmar elimina el ComprobanteID seleccionado, refresca la consulta y conserva una selección adyacente cuando existe.

**Estado:** implementada y cubierta por 34 pruebas unitarias .NET, 6 pruebas de integración EF y 20 pruebas funcionales de React. Falta ejecutar un DELETE real contra SQL Server con un comprobante de prueba sin relaciones externas.

**Limitación heredada de v3:** `TieneReferenciasExternas` sí consulta Ventas, Compras y Fondos. En cambio, `PeriodoEstaCerrado`, `PeriodoEstaRenumerado`, `TieneComprobantePadre`, `TieneVinculaciones` y `TieneAplicacionesEnCtaCte` conservan implementaciones TODO que devuelven `false`. El servicio invoca esos contratos, pero todavía no aportan protección real hasta que el programador complete sus consultas. Esta corrección no inventa esas reglas ni modifica SQL compartido.

### Situación 15: el trigger de baja devolvía el ID como filas afectadas

**Problema observado:** al confirmar la eliminación real del comprobante `189767`, la API respondió `DbUpdateConcurrencyException`: Entity Framework esperaba una fila afectada y recibió `189767`.

**Causa:** `gnrComprobantes_Baja_trigger` repetía el mismo patrón que había causado la Situación 8 en el PUT: ejecutaba `SELECT ID FROM Deleted` y luego comprobaba `@@ROWCOUNT`. EF recibió el ComprobanteID eliminado como primer resultado y lo interpretó como cantidad de filas afectadas.

**Tratamiento aplicado:** se verificó antes de modificar que la transacción se había revertido: `gnrComprobantes.ID = 189767` seguía presente con sus dos renglones. En el trigger se sustituyeron únicamente `SELECT ID FROM Deleted` y `IF @@ROWCOUNT = 1` por `IF (SELECT COUNT(*) FROM Deleted) = 1`. El trigger permanece habilitado y conserva completa su lógica de retroceso de `gnrNumeraciones`. No se capturó ni ignoró la excepción en la API.

Se guardaron el script aplicado y la definición anterior completa como reversión en `documentacion/diagnostico-sistema/sql/`.

**Estado:** resuelta en SQL y verificada por definición: el trigger está habilitado, ya no emite el ID y utiliza el conteo directo. Queda repetir desde React el DELETE real; el comprobante `189767` no fue eliminado durante el intento fallido.

### Ajustes generales incorporados

- Se agregó logging optativo mediante `DiagnosticoConsultas:Asientos:Habilitado`, separado del diagnóstico general de la aplicación.
- Se documentó explícitamente cada archivo nuevo y modificado.
- Se agregaron pruebas de servicio, controller e integración para identidad, relaciones, importes y preservación de renglones.
- Se generó `asientos-consulta-v3.patch` para trasladar exclusivamente los cambios de Asientos a una futura versión.
- React incorporó los servicios GET, POST, PUT y DELETE, los modos Alta/Consulta/Edición/Baja y el comportamiento de `APLICAR`, `ACEPTAR` y `CANCELAR`. La incompatibilidad SQL de la Situación 8 quedó corregida sin agregar excepciones especiales al frontend ni al backend.

## Decisión de arquitectura

La lectura individual utiliza Entity Framework Core y LINQ. No usa SQL embebido, `Database.SqlQuery` ni procedimientos almacenados. La consulta general conserva su arquitectura independiente y continúa utilizando `dbo.cstctbAsientos`.

Los SP y vistas de Andrómeda se usaron como referencia para reconstruir las relaciones, pero no participan del GET individual. Esta decisión mantiene la arquitectura CRUD elegida en v3, con el costo de modelar relaciones que el SQL histórico ya resolvía.

### Forma optimizada de la lectura

La primera implementación EF proyectaba todas las relaciones desde cada renglón mediante varios `FirstOrDefault`. EF traducía cada ID, código y nombre en subconsultas correlacionadas repetidas y la navegación entre asientos podía demorar entre uno y dos segundos.

La implementación vigente realiza consultas simples y acotadas:

1. cabecera;
2. renglones con cuenta e importes;
3. relaciones de Ventas para los IDs de esos renglones;
4. relaciones de Compras;
5. relaciones de Fondos.

Después combina los resultados por `ctbAsientos.ID` en memoria. Cada entidad relacionada se consulta una sola vez por bloque y se conserva la selección determinista del menor ID. Aunque existen más viajes breves a SQL Server, se evita una única sentencia grande con numerosas subconsultas repetidas.

## Modelo SQL confirmado

| Origen | Destino | Uso |
|---|---|---|
| `ctbAsientos.ComprobanteID` | `gnrComprobantes.ID` | Renglones de la cabecera. |
| `ctbAsientos.CuentaID` | `ctbCuentas.ID` | Cuenta y tipo de subcuenta. |
| `vtsComprobantes.AsientoID` | `ctbAsientos.ID` | Cliente, vendedor, cobrador y jurisdicción. |
| `vtsComprobantes.ClienteID` | `vtsClientes.ID` | Cliente. |
| `vtsClientes.AgendaID` | `gnrAgenda.ID` | Nombre del cliente. |
| `vtsComprobantes.VendedorID` | `vtsCorredores.ID` | Vendedor. |
| `vtsComprobantes.CobradorID` | `vtsCorredores.ID` | Cobrador. |
| `vtsCorredores.AgendaID` | `gnrAgenda.ID` | Nombre de vendedor o cobrador. |
| `vtsComprobantes.IIBBProvinciaID` | `gnrProvincias.ID` | Jurisdicción. |
| `cpsComprobantes.AsientoID` | `ctbAsientos.ID` | Proveedor y caja de Compras. |
| `cpsComprobantes.ProveedorID` | `cpsProveedores.ID` | Proveedor. |
| `cpsProveedores.AgendaID` | `gnrAgenda.ID` | Nombre del proveedor. |
| `cpsComprobantes.CajaID` | `fdsCajas.ID` | Caja desde Compras. |
| `fdsComprobantes.AsientoID` | `ctbAsientos.ID` | Fondos asociado al renglón. |
| `fdsMovimientos.ComprobanteID` | `fdsComprobantes.ID` | Movimientos de Fondos. |
| `fdsMovimientos.CajaID` | `fdsCajas.ID` | Caja desde Fondos. |
| `fdsMovimientos.CajaOpuestaID` | `fdsCajas.ID` | Caja opuesta. |

Las claves se configuran con `DeleteBehavior.Restrict`, equivalente al `No Action` observado en SQL. No se agregan cascadas.

## Datos devueltos

La cabecera se proyecta desde `ContextoAplicacion.ComprobantesContables` con `AsNoTracking`. Completa fecha y fecha de emisión, empresa, moneda, numeración, cotizaciones, total, detalle y observaciones.

Los renglones se filtran por `ctbAsientos.ComprobanteID` y se ordenan por `ctbAsientos.ID`. El DTO devuelve:

- ID, cuenta ID, código y nombre;
- tipo, importe, importe local e importe de referencia;
- Debe/Haber original, local y de referencia, con el lado contrario en `null`;
- detalle;
- tipo y nombre de subcuenta;
- cliente, proveedor y caja con ID, código y nombre;
- jurisdicción, vendedor y cobrador con ID, código y nombre.

`SubcuentaNombre` se deriva de `ctbCuentas.SubcuentaTipo`: cliente para tipo 1, proveedor para tipo 2, caja para tipos 3 y 4, y vacío para tipo 0. Si Caja existe desde Fondos y Compras, se prioriza Fondos.

Las relaciones SQL no poseen índices únicos sobre `AsientoID`. El contrato visual es singular y la consulta toma de forma determinista el registro de menor ID. Si el negocio requiere varias relaciones por renglón, deberá cambiarse el contrato.

## Archivos nuevos

| Ruta relativa a v3 | Finalidad |
|---|---|
| `src/fyd.backend.Infraestructura/Contabilidad/Configuraciones/AsientoLecturaConfig.cs` | Relaciones EF de la lectura. |
| `src/fyd.backend.Infraestructura/General/Entidades/Moneda.cs` | Mapeo de `gnrMonedas`. |
| `src/fyd.backend.Infraestructura/General/Entidades/Provincia.cs` | Mapeo de `gnrProvincias`. |
| `src/fyd.backend.Infraestructura/Ventas/Entidades/Corredor.cs` | Mapeo de `vtsCorredores`. |
| `src/fyd.backend.Dominio/Contabilidad/Consultas/AsientoConsulta.cs` | Modelo de lectura desacoplado de escritura; incluye ID, código y nombre de Moneda. |

## Archivos existentes modificados

| Ruta relativa a v3 | Cambio |
|---|---|
| `src/fyd.backend.Infraestructura/Contabilidad/Entidades/Asiento.cs` | Navegaciones a cabecera, cuenta, Ventas, Compras y Fondos. |
| `src/fyd.backend.Infraestructura/General/Entidades/Comprobante.cs` | Navegaciones descriptivas de cabecera. |
| `src/fyd.backend.Infraestructura/General/Entidades/Empresa.cs` | Navegación a agenda. |
| `src/fyd.backend.Infraestructura/General/Entidades/NumeraTipo.cs` | Navegación a numeración. |
| `src/fyd.backend.Infraestructura/General/Entidades/Numeracion.cs` | Tabla y clave explícitas. |
| `src/fyd.backend.Infraestructura/Ventas/Entidades/Cliente.cs` | Navegación a agenda. |
| `src/fyd.backend.Infraestructura/Ventas/Entidades/VentaComprobante.cs` | Renglón, cliente, vendedor, cobrador y jurisdicción. |
| `src/fyd.backend.Infraestructura/Compras/Entidades/CompraComprobante.cs` | Renglón, proveedor y caja. |
| `src/fyd.backend.Infraestructura/Fondos/Entidades/FondoComprobante.cs` | Renglón y movimientos. |
| `src/fyd.backend.Infraestructura/Fondos/Entidades/FondoMovimiento.cs` | Caja y caja opuesta. |
| `src/fyd.backend.Infraestructura/Contextos/ContextoAplicacion.cs` | DbSet de monedas, provincias y corredores. |
| `src/fyd.backend.Infraestructura/Contabilidad/Repositorios/AsientoRepositorio.cs` | Lectura LINQ por bloques, proyección completa de Moneda, composición por renglón y tiempos de diagnóstico; elimina SQL embebido. En el POST reserva atómicamente el siguiente número automático y confirma numeración, cabecera y detalle en la misma transacción. |
| `src/fyd.backend.Infraestructura/Contabilidad/Repositorios/AsientoProcedimientoAlmacenado.cs` | Logging optativo alrededor de la ejecución de `dbo.cstctbAsientos`. |
| `src/fyd.backend.Dominio/Contabilidad/Consultas/CstctbAsientosReadModel.cs` | Declara `Numero` nullable para tolerar registros históricos defectuosos sin derribar la consulta general. |
| `src/fyd.backend.Dominio/Contabilidad/Repositorios/IAsientoRepositorio.cs` | Lectura por ComprobanteID. |
| `src/fyd.backend.Aplicacion/Contabilidad/DTOs/AsientoDtos.cs` | Contrato completo de cabecera y renglón, incluido `MonedaCodigo`. |
| `src/fyd.backend.Aplicacion/Contabilidad/Mapeos/AsientoDtoMapeo.cs` | Mapeo de cabecera, Moneda y separación Debe/Haber. |
| `src/fyd.backend.Aplicacion/Contabilidad/Servicios/AsientoServicio.cs` | Lectura por ComprobanteID. |
| `src/fyd.backend.Aplicacion/Contabilidad/Servicios/Interfaces/IAsientoServicio.cs` | Contrato de lectura. |
| `src/fyd.backend.API/Controllers/Contabilidad/AsientoController.cs` | Recibe y documenta ComprobanteID. |
| `src/fyd.backend.API/appsettings.json` | Declara desactivada por defecto la marca `DiagnosticoConsultas:Asientos:Habilitado`. |
| `tests/fyd.backend.UnitTests/Aplicacion/Contabilidad/Servicios/AsientoServicioTest.cs` | Verifica relaciones y Debe/Haber. |
| `tests/fyd.backend.UnitTests/API/Controllers/Contabilidad/AsientoControllerTest.cs` | Contrato del controller. |

## Objetos SQL modificados y scripts agregados

Se modificaron los objetos existentes `dbo.gnrComprobantes_Mod_trigger` y `dbo.gnrComprobantes_Baja_trigger` en la base `ByM-DBGA`. No se creó, eliminó ni deshabilitó ningún trigger. En ambos casos la única sustitución fue:

```sql
-- Definición anterior: emitía un resultado hacia EF
SELECT ID FROM Deleted
IF @@ROWCOUNT = 1 BEGIN

-- Definición aplicada: comprueba la cantidad sin emitir resultados
IF (SELECT COUNT(*) FROM Deleted) = 1 BEGIN
```

Se agregaron estos archivos de documentación y operación, ajenos al proyecto compilable de la API:

| Ruta relativa a React | Finalidad |
|---|---|
| `documentacion/diagnostico-sistema/sql/AJUSTE_gnrComprobantes_Mod_trigger.sql` | Reaplica la definición corregida mediante `ALTER TRIGGER`. |
| `documentacion/diagnostico-sistema/sql/REVERTIR_gnrComprobantes_Mod_trigger.sql` | Restaura exactamente la definición anterior mediante `ALTER TRIGGER`. |
| `documentacion/diagnostico-sistema/sql/AJUSTE_gnrComprobantes_Baja_trigger.sql` | Reaplica la definición corregida del trigger de DELETE. |
| `documentacion/diagnostico-sistema/sql/REVERTIR_gnrComprobantes_Baja_trigger.sql` | Restaura exactamente la definición anterior del trigger de DELETE. |

Las correcciones conservan toda la lógica de numeración. El trigger de modificación continúa ajustando `gnrNumeraciones` cuando cambian Número o Numeración. El trigger de baja continúa retrocediendo la numeración cuando se elimina el último número utilizado. Ambos conservan la restricción histórica de procesar su lógica solamente cuando la operación afecta una fila.

## Frontend

`AsientosABM/abmAsientos.funcional.js` conserva `fechaEmision`, las seis variantes de importes y todas las entidades relacionadas. La presentación puede ocultar columnas, pero la capa funcional no descarta información. Al actualizar transforma cada Debe/Haber en `Tipo` e `Importe`, conserva el ID del renglón y entrega el cuerpo al PUT. En `MODO_ABM.ALTA` no exige ComprobanteID, permite Punto de venta, omite los IDs de línea y llama al POST. `APLICAR` crea, recarga el ID devuelto y continúa como edición; `ACEPTAR` crea y cierra.

## Consulta general y diagnóstico

`POST /api/contabilidad/asientos/odata/CstctbAsientos` continúa utilizando `dbo.cstctbAsientos`. Su logging optativo se controla mediante `DiagnosticoConsultas:Asientos:Habilitado` y permanece separado del GET individual.

La misma marca habilita los tiempos del GET individual con el prefijo `[ConsultaAsientoDetalle:EF]`. Registra `ComprobanteID`, filas y milisegundos de `Cabecera`, `Renglones`, `Ventas`, `Compras`, `Fondos` y `Total`. En el ambiente `Local`, `appsettings.Local.json` ya mantiene esta marca activa.

## Validación

1. Compilar los proyectos productivos.
2. Construir el modelo de `ContextoAplicacion` y comprobar que EF acepta todas las relaciones.
3. Ejecutar `AsientoServicioTest` y `AsientoControllerTest`.
4. Iniciar la API con acceso a `DbGestion`.
5. Probar en Swagger un ComprobanteID con varios renglones.
6. Comparar cantidad e IDs contra `ctbAsientos WHERE ComprobanteID = @id`.
7. Verificar cuenta, cliente, proveedor, caja, jurisdicción, vendedor y cobrador.
8. Probar un ID inexistente: debe devolver 404.
9. Probar nuevamente el listado OData.

La compilación y la construcción del modelo no prueban la traducción LINQ ni el contenido de SQL. La validación final requiere ejecutar el GET contra la base real.

Validación vigente: 34 pruebas unitarias .NET y 6 pruebas de integración EF filtradas por Asientos son correctas, incluidas creación de cabecera/detalle, Punto de venta opcional, reserva del siguiente Número automático, avance de `gnrNumeraciones`, altas, conservación de IDs, baja segura de renglones, DELETE completo y rechazo de una baja referenciada; 23 pruebas funcionales de React son correctas. La ejecución .NET se realizó con un `BaseOutputPath` temporal porque la API levantada mantenía bloqueadas sus DLL de salida. La lectura se había medido previamente con los ComprobanteID 1004, 1019, 1021 y 184103 contra `DbGestion`: después del calentamiento respondieron entre 60 y 72 ms HTTP, con etapas `Total` entre 57 y 67 ms. El primer acceso después de iniciar el proceso puede superar un segundo por calentamiento y compilación de consultas EF.

El primer PUT real sobre el comprobante 184297 intentó modificar Empresa y Detalle, pero SQL Server lo rechazó con el error 334 porque `gnrComprobantes` tiene triggers y EF había generado `OUTPUT`. Ese intento también mostró que el cálculo anterior por multiplicación marcaba `ImpReferencia` como modificado aunque el usuario no hubiese editado el detalle. La configuración de `OUTPUT` y la conservación de importes quedaron corregidas y cubiertas por pruebas automáticas. Una segunda prueba real grabó Empresa y Detalle, pero reveló que el trigger emitía el ID `184297` y EF lo interpretaba como filas afectadas. La definición SQL ya fue corregida; queda pendiente repetir el PUT funcional después de este cambio.

## PUT mediante Entity Framework

`PUT /api/contabilidad/asientos/{id}` interpreta tanto la ruta como `dto.Id` como `gnrComprobantes.ID`. El controller rechaza IDs diferentes entre URL y cuerpo.

El servicio lee la instantánea actual por ComprobanteID, valida período, numeración, cuentas, balance e identidad de renglones y construye entidades de dominio. El repositorio carga `gnrComprobantes` y `ctbAsientos` con `Include` y seguimiento de EF; luego copia los valores sobre esas mismas entidades. Un único `SaveChanges` persiste cabecera y detalle transaccionalmente.

`gnrComprobantes` posee triggers. `ComprobanteConfig` usa `UseSqlOutputClause(false)` para evitar que EF genere un `OUTPUT` directo incompatible con esos triggers. Esta configuración no desactiva el trigger: solamente hace que EF utilice SQL compatible.

El PUT recibe la instantánea completa, pero una edición de cabecera conserva exactamente `ImpLocal` e `ImpReferencia` cuando no cambian el importe ni la cotización. Si cambia alguno de esos datos, calcula `Importe / CotizacionLocal` e `Importe / CotizacionReferencia`. No volver a multiplicar: esa fórmula produjo actualizaciones involuntarias del detalle durante una modificación exclusiva de Empresa y Detalle.

La versión actual exige que los IDs recibidos formen un subconjunto sin repetidos de los IDs que existen en SQL. Las líneas nuevas se identifican exclusivamente con `Id = null`; el repositorio las agrega a la colección rastreada y SQL genera su `ctbAsientos.ID`. Los IDs recibidos permanecen sin cambios. Los IDs originales omitidos se consideran bajas y sólo se eliminan si no poseen referencias directas en Ventas, Compras o Fondos. El PUT rechaza IDs negativos, repetidos o pertenecientes a otro comprobante.

Está prohibido reintroducir `comprobante.Asientos.Clear()` o borrar y recrear el detalle. El alta agrega únicamente las entidades con ID de dominio `0`, provenientes de DTO con `Id = null`. La baja marca con `Remove` solamente cada entidad omitida después de validar sus referencias externas conocidas.

### Archivos de escritura POST/PUT

No se agregaron archivos productivos nuevos. Se modificaron explícitamente:

| Ruta relativa a v3 | Parte modificada |
|---|---|
| `src/fyd.backend.API/Controllers/Contabilidad/AsientoController.cs` | Contrato URL/cuerpo por ComprobanteID; ya existente. |
| `src/fyd.backend.Aplicacion/Contabilidad/DTOs/AsientoDtos.cs` | Documenta `ActualizarAsientoDto.Id` como `gnrComprobantes.ID`; una línea nueva utiliza `Id = null`; el POST recibe Punto de venta opcional. |
| `src/fyd.backend.Aplicacion/Contabilidad/Servicios/AsientoServicio.cs` | En POST valida Punto de venta solamente cuando fue informado, entrega el Número nulo al repositorio para autonumerar y crea el agregado; en PUT valida IDs, admite líneas nuevas, detecta omisiones y bloquea bajas referenciadas. |
| `src/fyd.backend.Dominio/Contabilidad/Repositorios/IAsientoRepositorio.cs` | Declara creación por comprobante, consulta de Punto de venta, actualización EF y validación de referencias externas. |
| `src/fyd.backend.Dominio/Contabilidad/Errores/AsientoCodigoError.cs` | Agrega `Asiento.RenglonesNoCoinciden` y `Asiento.RenglonReferenciado`. |
| `src/fyd.backend.Dominio/Contabilidad/Errores/AsientoError.cs` | Mensajes para IDs duplicados, negativos o ajenos y para una baja bloqueada por referencias de Ventas, Compras o Fondos. |
| `src/fyd.backend.Dominio/General/Entidades/Comprobante.cs` | Conserva `Numero` nullable en el dominio para representar la solicitud de numeración automática; el repositorio lo resuelve antes del INSERT. |
| `src/fyd.backend.Infraestructura/Contabilidad/Configuraciones/AsientoLecturaConfig.cs` | Configura `gnrComprobantes` sin `OUTPUT` directo para conservar la ejecución compatible de sus triggers. |
| `src/fyd.backend.Infraestructura/Contabilidad/Repositorios/AsientoRepositorio.cs` | Crea cabecera/detalle como un grafo EF; si Número es nulo reserva el siguiente valor con actualización condicional y transacción; consulta Punto de venta y, para PUT, agrega, actualiza o elimina selectivamente entidades rastreadas. |
| `src/fyd.backend.Dominio/Contabilidad/Consultas/CstctbAsientosReadModel.cs` | Tolera `Numero = NULL` en datos defectuosos existentes para que la consulta general no falle durante la reparación. |
| `tests/fyd.backend.UnitTests/Aplicacion/Contabilidad/Servicios/AsientoServicioTest.cs` | Verifica POST agregado, Punto de venta informado y opcional, delegación de la autonumeración, importes por división, conservación de IDs, alta sin ID, baja segura y rechazo de una baja referenciada. |
| `tests/fyd.backend.IntegrationTests/AsientoServicioTest.cs` | Verifica con EF InMemory que POST crea cabecera y líneas relacionadas, asigna el siguiente Número automático, avanza la numeración y que PUT conserva, agrega o elimina únicamente lo solicitado. |

En React se modificaron `modosABM.js`, `FiltroAsientos.jsx`, `ctbAsientosBQD.jsx`, `abmAsientosService.js`, `abmAsientos.modulos.js`, `abmAsientos.funcional.js`, `abmAsientos.permisos.js`, `ABMAsientos.jsx`, `Grid.jsx` y `abmAsientos.funcional.test.mjs`. Nuevo abre `MODO_ABM.ALTA`; Punto de venta y Número sólo son editables allí y se envían como `null` cuando están vacíos. En un asiento existente ambos controles permanecen informativos, incluso en modo Edición. `Agregar ítem` usa una clave temporal negativa, agrega la fila al estado y la abre mediante `controlGrid.editarFila()`. El POST omite IDs de línea; el PUT envía las altas con `id: null`. Las filas temporales completamente vacías se filtran antes de construir el request. El estado se compara contra una instantánea normalizada de los campos persistibles: una fila temporal vacía no habilita Aplicar y un campo modificado que vuelve a su valor original deja de contarse como cambio, por lo que no se envía un PUT vacío. El tacho de una fila la quita del estado y, si tenía ID, su ausencia en el siguiente PUT solicita la baja. El tacho de la cinta abre `ModalConfirmacion` y Sí ejecuta el DELETE del comprobante completo; después se conserva abierto el ABM en consulta sobre un registro adyacente. El tacho del menú flotante de la consulta abre solamente `ModalConfirmacion`, ejecuta el mismo DELETE y refresca la grilla sin abrir el ABM. GET, POST, PUT y DELETE comparten `abmAsientosService.js`.

## Baja de renglones y DELETE del comprobante

La baja de renglones está implementada dentro del PUT de la instantánea completa. Se elimina únicamente cada ID original omitido y sólo después de comprobar referencias directas desde Ventas, Compras y Fondos. No se reemplaza la colección ni se modifican los IDs conservados.

El DELETE del comprobante completo recibe `gnrComprobantes.ID`. La aplicación valida los IDs de todos sus renglones y el repositorio elimina explícitamente los `ctbAsientos` antes que `gnrComprobantes`, respetando `DeleteBehavior.Restrict`. Todo se confirma mediante un único `SaveChanges`. En React, tanto el tacho del ABM como el del menú flotante de la consulta abren una confirmación Sí/No y Sí ejecuta inmediatamente. Desde el ABM, después se muestra en modo Consulta el siguiente registro o el anterior cuando se borró el último. Desde la consulta no se abre el ABM: se refresca la grilla y se conserva una selección adyacente cuando existe.

## Migración futura

1. No aplicar el antiguo `asientos-por-comprobante-v3.patch` ni código que contenga `Database.SqlQuery<AsientoConsulta>`.
2. Portar entidades, navegaciones, configuraciones EF y DbSet enumerados arriba.
3. Portar modelo de consulta, DTO, mapeo, servicio y controller.
4. Mantener `dbo.cstctbAsientos` exclusivamente en la consulta general.
5. Compilar y validar el modelo EF al iniciar la API.
6. Probar el GET antes de habilitar PUT y comprobar que no cambia ningún `ctbAsientos.ID`; después agregar dos líneas balanceadas con `Id = null`, verificar los IDs generados y probar la baja balanceada de líneas sin referencias.
7. Probar POST con Punto de venta y Número nulos. Verificar en la misma transacción lógica que crea una cabecera, relaciona todos los renglones con el ComprobanteID devuelto, asigna `gnrNumeraciones.Numero + 1` a `gnrComprobantes.Numero` y avanza la numeración al mismo valor. Repetir con un Punto de venta informado y coincidente; luego con uno diferente y comprobar el rechazo.
8. Verificar en la base destino que `dbo.gnrComprobantes_Mod_trigger` no contenga `SELECT ID FROM Deleted`. Si la versión nueva conserva la definición anterior, ejecutar `documentacion/diagnostico-sistema/sql/AJUSTE_gnrComprobantes_Mod_trigger.sql` con autorización del responsable de SQL.
9. Verificar también que `dbo.gnrComprobantes_Baja_trigger` no contenga `SELECT ID FROM Deleted`. Si lo contiene, ejecutar `documentacion/diagnostico-sistema/sql/AJUSTE_gnrComprobantes_Baja_trigger.sql` con autorización del responsable de SQL.
10. Confirmar que ambos triggers permanezcan habilitados. Repetir un PUT que modifique solamente Empresa y Detalle y un DELETE sobre un comprobante de prueba sin referencias.
11. Actualizar esta guía, los `AGENTS.md` y el parche portable.

## Cierre de la intervención: lectura, alta y actualización

La lectura individual quedó operativa por `gnrComprobantes.ID`, devuelve todos los renglones y relaciones relevadas y conserva separado el listado general basado en `dbo.cstctbAsientos`. El POST crea cabecera y renglones como un único agregado, admite Punto de venta y Número nulos y valida Punto de venta cuando fue informado. El PUT conserva los IDs recibidos de `ctbAsientos`, admite líneas nuevas con `Id = null`, elimina de forma selectiva las líneas omitidas sin referencias y ya no recalcula importes históricos cuando solamente cambia la cabecera.

Las pruebas reales del PUT encontraron dos incompatibilidades sucesivas:

1. Con el `OUTPUT` predeterminado de EF, SQL Server devolvió el error 334 porque `gnrComprobantes` tiene triggers. `UseSqlOutputClause(false)` eliminó esa incompatibilidad sin desactivar los triggers.
2. Sin `OUTPUT`, el `UPDATE` y el trigger se ejecutaron y Empresa/Detalle quedaron grabados, pero `SaveChanges` terminó con `DbUpdateConcurrencyException`: esperaba una fila afectada y recibió `184297`.

El valor `184297` no representa filas afectadas. Es el ID emitido por esta instrucción del trigger compartido `gnrComprobantes_Mod_trigger`:

```sql
SELECT ID FROM Deleted
```

EF recibía ese conjunto de resultados antes del contador de filas y no podía reconocer que se trataba de un ID producido por el trigger. Por eso la API devolvía error aunque la modificación pudiera quedar grabada.

Con autorización del responsable del desarrollo se aplicó una corrección puntual al trigger: `SELECT ID FROM Deleted` más la lectura de `@@ROWCOUNT` se sustituyeron por `IF (SELECT COUNT(*) FROM Deleted) = 1`. El trigger continúa habilitado y su lógica de numeración no cambió. La API no captura excepciones para simular éxito y no contiene un recorrido alternativo para este caso.

El script de reversión conserva la definición anterior completa. Como la base es compartida con Andrómeda VB6, cualquier traslado a otro ambiente debe coordinarse con el responsable de SQL y ejecutarse primero en pruebas. La corrección no cambia tablas, columnas, relaciones ni procedimientos almacenados.

Las incompatibilidades técnicas de las Situaciones 8 y 15 quedaron resueltas. Falta la prueba funcional final del PUT y repetir el DELETE desde React contra la base real después de los `ALTER TRIGGER`. La baja de renglones y el DELETE del comprobante completo están implementados y cubiertos por pruebas automáticas; el intento fallido sobre el comprobante `189767` quedó revertido y no eliminó datos.

Esta guía está dedicada exclusivamente a la consulta, alta y actualización de Asientos. No incluye el módulo Estado del sistema, el diagnóstico general de capas ni su migración.


