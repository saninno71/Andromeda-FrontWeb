# Incorporación del diagnóstico de capas en Andromeda Backend

## Objetivo

Este módulo comprueba el recorrido `React → API → Aplicación → Infraestructura → SQL Server`.

La implementación es temporal y portable. Todo el código funcional está agrupado en carpetas `DiagnosticoSistema`. La integración sobre código compartido se concentra en `Program.cs`.

## Contrato

- `GET /api/diagnostico/capas`
- Respuesta normal: `200 OK`.
- Respuesta con una capa roja: `503 Service Unavailable`.
- Cabecera de correlación: `X-Transaction-Id`.
- Timeout SQL: 5 segundos.
- Verde: menos de 1.000 ms; amarillo: 1.000–3.000 ms; rojo: más de 3.000 ms o error.

## Resumen exacto del cambio

La incorporación agrega **nueve archivos nuevos** y modifica **un único archivo existente**.

| Tipo de cambio | Cantidad | Ubicación |
|---|---:|---|
| Archivos nuevos | 9 | Carpetas nuevas `DiagnosticoSistema` dentro de Dominio, Aplicación, Infraestructura y API. |
| Archivo existente modificado | 1 | `src/fyd.backend.API/Program.cs`: registra el módulo y, si faltaba, activa la política CORS ya declarada. |
| Configuraciones modificadas | 0 | No se modifica ningún `appsettings*.json`, conexión o archivo de lanzamiento. |
| Base de datos | 0 | No se agregan tablas, migraciones ni procedimientos almacenados. |

## Archivos nuevos

Todos los siguientes archivos deben crearse. En el paquete portable existe una copia con la misma ruta relativa bajo:

```text
C:\Users\sanin\ProyectosReact\BackendAndromeda\DiagnosticoSistemaPortable\src
```

| N.º | Proyecto | Ruta nueva relativa a la raíz del backend | Responsabilidad |
|---:|---|---|---|
| 1 | Dominio | `src/fyd.backend.Dominio/DiagnosticoSistema/IDiagnosticoSistemaRepositorio.cs` | Define el resultado SQL y el contrato del repositorio. |
| 2 | Aplicación | `src/fyd.backend.Aplicacion/DiagnosticoSistema/DTOs/DiagnosticoAplicacionDto.cs` | Transporta tiempos y resultado hacia API. |
| 3 | Aplicación | `src/fyd.backend.Aplicacion/DiagnosticoSistema/Servicios/Interfaces/IDiagnosticoSistemaServicio.cs` | Contrato del caso de uso. |
| 4 | Aplicación | `src/fyd.backend.Aplicacion/DiagnosticoSistema/Servicios/DiagnosticoSistemaServicio.cs` | Coordina el diagnóstico y mide Aplicación. |
| 5 | Infraestructura | `src/fyd.backend.Infraestructura/DiagnosticoSistema/DiagnosticoSistemaRepositorio.cs` | Abre la conexión existente y ejecuta la comprobación SQL. |
| 6 | API | `src/fyd.backend.API/DiagnosticoSistema/ContextoDiagnosticoAttribute.cs` | Genera el identificador, lo incorpora a logs y a la cabecera. |
| 7 | API | `src/fyd.backend.API/DiagnosticoSistema/DiagnosticoSistemaController.cs` | Expone `GET /api/diagnostico/capas` y forma los estados. |
| 8 | API | `src/fyd.backend.API/DiagnosticoSistema/DiagnosticoSistemaRespuesta.cs` | Define el contrato JSON de respuesta. |
| 9 | API | `src/fyd.backend.API/DiagnosticoSistema/RegistroDiagnosticoSistemaExtensions.cs` | Registra servicio y repositorio en el contenedor. |

La estructura final debe ser:

```text
src/
├── fyd.backend.Dominio/DiagnosticoSistema/
│   └── IDiagnosticoSistemaRepositorio.cs
├── fyd.backend.Aplicacion/DiagnosticoSistema/
│   ├── DTOs/DiagnosticoAplicacionDto.cs
│   └── Servicios/
│       ├── DiagnosticoSistemaServicio.cs
│       └── Interfaces/IDiagnosticoSistemaServicio.cs
├── fyd.backend.Infraestructura/DiagnosticoSistema/
│   └── DiagnosticoSistemaRepositorio.cs
└── fyd.backend.API/DiagnosticoSistema/
    ├── ContextoDiagnosticoAttribute.cs
    ├── DiagnosticoSistemaController.cs
    ├── DiagnosticoSistemaRespuesta.cs
    └── RegistroDiagnosticoSistemaExtensions.cs
```

Los proyectos utilizan inclusión automática de archivos `.cs`; por eso no fue necesario modificar los `.csproj`. Si una API futura deshabilita esa característica, el programador deberá incluir expresamente estos archivos en cada proyecto.

## Archivo existente modificado

### `src/fyd.backend.API/Program.cs`

Es el único archivo existente que modifica este módulo. Se agrega una llamada inmediatamente después de registrar Infraestructura y antes de registrar permisos.

Fragmento anterior:

```csharp
builder.Services.AgregarDependenciasDeIdentidad(builder.Configuration);
builder.Services.AgregarServiciosDeAplicacion(builder.Configuration);
builder.Services.AgregarInfraestructura(builder.Configuration);
builder.Services.AgregarPermisos();
builder.Services.AgregarSwagger();
```

Fragmento modificado:

```csharp
builder.Services.AgregarDependenciasDeIdentidad(builder.Configuration);
builder.Services.AgregarServiciosDeAplicacion(builder.Configuration);
builder.Services.AgregarInfraestructura(builder.Configuration);
builder.Services.AgregarDiagnosticoSistema(); // Única línea nueva
builder.Services.AgregarPermisos();
builder.Services.AgregarSwagger();
```

El método está definido en `RegistroDiagnosticoSistemaExtensions.cs`, dentro del namespace `fyd.backend.API.Extensions`. En la versión actual `Program.cs` ya contiene:

```csharp
using fyd.backend.API.Extensions;
```

Si una API futura no contiene ese `using`, deberá agregarse al comienzo de `Program.cs`. En ese caso se convertiría en una segunda línea modificada dentro del mismo archivo, no en otro archivo afectado.

Además, el frontend necesita que la política CORS registrada esté activa. Si `Program.cs` ya declara `ReactPolicy` pero no contiene su middleware, agregar antes de autenticación y autorización:

```csharp
app.UseCors("ReactPolicy");
```

En la v3 esta línea también fue necesaria. Si una versión futura ya activa una política CORS equivalente, no duplicarla ni reemplazarla.

## Archivos existentes que no deben modificarse

El módulo fue aislado expresamente para no alterar:

- `src/fyd.backend.API/Middlewares/TransaccionMiddleware.cs`;
- `src/fyd.backend.Aplicacion/ExtensionParaRegistrarDependencias.cs`;
- `src/fyd.backend.Infraestructura/ExtensionParaRegistrarDependencias.cs`;
- `src/fyd.backend.API/appsettings.json`;
- `src/fyd.backend.API/appsettings.Development.json`;
- archivos `.csproj`;
- controladores, servicios o repositorios funcionales existentes.

Si alguno aparece modificado al incorporar el diagnóstico, detener la instalación y revisar el diff antes de continuar.

## Instalación paso a paso mediante el parche

1. Ubicarse en la raíz del backend que recibirá el módulo.
2. Confirmar que la solución conserva los proyectos Dominio, Aplicación, Infraestructura y API.
3. Confirmar que existe `ContextoLectura` en Infraestructura y que ya se registra mediante la conexión de gestión.
4. Revisar el estado inicial y preservar cualquier modificación previa:

   ```powershell
   git status --short
   ```

5. Validar el parche sin modificar archivos:

   ```powershell
   git apply --check C:\Users\sanin\ProyectosReact\BackendAndromeda\DiagnosticoSistemaPortable\diagnostico-sistema-backend.patch
   ```

6. Si la validación no informa conflictos, aplicarlo:

   ```powershell
   git apply C:\Users\sanin\ProyectosReact\BackendAndromeda\DiagnosticoSistemaPortable\diagnostico-sistema-backend.patch
   ```

7. Ejecutar nuevamente `git status --short`. El diagnóstico debe producir solamente:
   - `Program.cs` modificado;
   - las cuatro carpetas nuevas `DiagnosticoSistema` con los nueve archivos enumerados.
8. Revisar el diff de `Program.cs` y confirmar la llamada `AgregarDiagnosticoSistema()` y, solo si faltaba, `UseCors("ReactPolicy")`.

## Instalación manual si el parche encuentra conflictos

1. No forzar el parche.
2. Crear las cuatro carpetas `DiagnosticoSistema` según el árbol anterior.
3. Copiar cada uno de los nueve archivos desde `DiagnosticoSistemaPortable/src` hacia la misma ruta relativa dentro del backend nuevo.
4. Revisar y adaptar namespaces solamente si la API futura cambió los nombres de sus proyectos.
5. En `DiagnosticoSistemaRepositorio.cs`, comprobar los imports y la inyección de `ContextoLectura`.
6. En `RegistroDiagnosticoSistemaExtensions.cs`, comprobar que se resuelvan las cuatro referencias:
   - `IDiagnosticoSistemaServicio`;
   - `DiagnosticoSistemaServicio`;
   - `IDiagnosticoSistemaRepositorio`;
   - `DiagnosticoSistemaRepositorio`.
7. Abrir `src/fyd.backend.API/Program.cs`.
8. Localizar la línea que registra Infraestructura.
9. Agregar inmediatamente después:

   ```csharp
   builder.Services.AgregarDiagnosticoSistema();
   ```

10. Confirmar el `using fyd.backend.API.Extensions;` al comienzo de `Program.cs`.
11. Si la política CORS de React está registrada pero no activa, agregar `app.UseCors("ReactPolicy")` antes de autenticación.
12. Verificar con Git que no se haya modificado ningún otro archivo existente.

## Compilación y prueba

1. Compilar primero sin restaurar paquetes:

   ```powershell
   dotnet build .\src\fyd.backend.API\fyd.backend.API.csproj --no-restore
   ```

2. Si la API nueva requiere una restauración legítima, realizarla según sus instrucciones y volver a compilar.
3. Ejecutar la API.
4. Consultar el endpoint:

   ```powershell
   Invoke-RestMethod -Method Get -Uri http://localhost:5062/api/diagnostico/capas
   ```

5. Verificar que la respuesta contenga `API`, `Aplicación`, `Infraestructura` y `SQL Server`, además de `transactionId`, `estado`, `tiempoTotalBackendMs` y `fechaSql`.
6. Verificar la cabecera `X-Transaction-Id`.
7. Buscar ese `transactionId` en los logs y confirmar el recorrido por API, Aplicación, Infraestructura y SQL.
8. Probar también el error o timeout SQL y comprobar una respuesta `503` en aproximadamente cinco segundos.

## Funcionamiento

- **API:** recibe la solicitud, mide su tiempo propio y forma la respuesta.
- **Aplicación:** coordina el caso de uso y registra entrada y salida.
- **Infraestructura:** obtiene la conexión de `ContextoLectura` y ejecuta una consulta mínima.
- **SQL Server:** ejecuta `SELECT CAST(1 AS int), SYSDATETIMEOFFSET()`; no consulta información funcional.

Los tiempos son exclusivos de cada capa. La demora SQL no se contabiliza nuevamente en las capas superiores.

## Seguridad

El controlador conserva temporalmente `[AllowAnonymous]` y declara el permiso `General.Diagnostico.Consultar`. Cuando el backend adopte autenticación real, el responsable debe decidir si elimina `[AllowAnonymous]` y limita el permiso a perfiles técnicos.

## Adaptaciones futuras

- Si cambia `ContextoLectura`, adaptar únicamente `DiagnosticoSistemaRepositorio.cs`.
- Si cambia el logging, adaptar el servicio, el repositorio y `ContextoDiagnosticoAttribute.cs`.
- Si cambia la autorización, adaptar los atributos del controlador.
- Si cambia el contenedor, adaptar `RegistroDiagnosticoSistemaExtensions.cs` y conservar una sola llamada desde la composición principal.
- No agregar cadenas de conexión ni credenciales propias del diagnóstico.

## Compatibilidad adicional: consulta de Plan de Cuentas

Este apartado documenta una corrección funcional independiente del diagnóstico de capas. No modifica el resumen de nueve archivos nuevos y un archivo existente indicado al comienzo de esta guía.

La base vigente define `dbo.cstctbCuentas` con nueve parámetros, en este orden:

1. `Id`;
2. `Codigo`;
3. `Nombre`;
4. `CuentaMadreID`;
5. `AsientoOK`;
6. `SubcuentaTipo`;
7. `AjustaOK`;
8. `MonedasTipo`;
9. `EmpresaID`.

La API v3 descargada agregó `TipoCuenta` como décimo parámetro. Aunque su valor sea `null`, Entity Framework genera `@p9` y SQL Server responde con el error 8144: `Procedure or function cstctbCuentas has too many arguments specified`.

Para alinear la API con la base se modifican cuatro archivos existentes; no se crean archivos ni se cambia SQL Server:

| Archivo existente | Cambio requerido |
|---|---|
| `src/fyd.backend.API/ParametrosDeConsulta/Contabilidad/CstctbCuentasParams.cs` | Eliminar la propiedad `TipoCuenta`. |
| `src/fyd.backend.API/Controllers/Contabilidad/PlanDeCuentaController.cs` | No enviar `key.TipoCuenta` al repositorio. |
| `src/fyd.backend.Dominio/Contabilidad/Repositorios/IPlanDeCuentaProcedimientoAlmacenado.cs` | Conservar una firma de nueve argumentos. |
| `src/fyd.backend.Infraestructura/Contabilidad/Repositorios/PlanDeCuentaProcedimientoAlmacenado.cs` | Conservar la firma de nueve argumentos y ejecutar el SP solamente con esos nueve valores. |

Después de portar la corrección:

1. Compilar la solución.
2. Reiniciar la API para cargar la DLL nueva.
3. Ejecutar `POST /api/contabilidad/planDeCuentas/odata/CstctbCuentas` con un body vacío o con `empresaID`.
4. Confirmar que el log SQL contiene `@p0` a `@p8`, sin `@p9`.
5. Buscar una cuenta por código y por nombre desde React.

Si una base futura incorpora realmente `TipoCuenta`, no conservar esta eliminación de manera automática. Primero se debe verificar la firma desplegada de `dbo.cstctbCuentas` y la semántica del filtro con el responsable del backend.

## Corrección funcional independiente: GET individual de Asientos

La lectura `GET /api/contabilidad/asientos/{id}` se documenta íntegramente en `GUIA_PROGRAMADOR_CONSULTA_ASIENTOS_V3.md`. No forma parte del diagnóstico de capas.

Reglas obligatorias:

- `{id}` es `gnrComprobantes.ID` o ComprobanteID; nunca `ctbAsientos.ID`.
- El GET individual usa Entity Framework y LINQ, sin SQL embebido.
- `dbo.cstctbAsientos` pertenece exclusivamente a la consulta general OData.
- El contrato incluye todos los renglones y sus relaciones de cuenta, subcuenta, cliente, proveedor, caja, jurisdicción, vendedor y cobrador.
- PUT y DELETE continúan pendientes y no deben habilitarse hasta conservar los IDs de renglón referenciados desde Ventas, Compras y Fondos.

Al migrar una versión, aplicar el parche funcional de Asientos por separado del módulo `DiagnosticoSistemaPortable` y validar ambos recorridos independientemente.

## Desinstalación

1. Eliminar las cuatro carpetas `DiagnosticoSistema`.
2. Eliminar de `Program.cs`:

   ```csharp
builder.Services.AgregarDiagnosticoSistema();
```

3. Si `UseCors("ReactPolicy")` fue incorporado exclusivamente con este paquete, evaluar su eliminación. No quitarlo si ya es necesario para otras llamadas del frontend.

No existen migraciones, tablas, procedimientos almacenados ni configuraciones para revertir.
