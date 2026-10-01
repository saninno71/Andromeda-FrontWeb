# Guía Codex para reinstalar el diagnóstico en una futura API

## Propósito

Usar esta guía cuando llegue otra versión del backend. Se debe reinstalar el diagnóstico sin arrastrar archivos del backend anterior ni alterar configuraciones entregadas por el programador.

Esta guía cubre solamente el módulo de diagnóstico. Para portar la consulta individual de Asientos se debe seguir `GUIA_PROGRAMADOR_CONSULTA_ASIENTOS_V3.md` y el checklist de `C:\Users\sanin\ProyectosReact\BackendAndromeda\AGENTS.md`. Los parches de ambos temas se mantienen separados.

## Reglas

1. Pedir autorización al usuario antes de modificar la API nueva.
2. Identificar el backend más reciente por fecha, Git y presencia de los filtros dinámicos.
3. Leer `AGENTS.md` y las instrucciones del repositorio.
4. Revisar `git status` y preservar cambios preexistentes.
5. No copiar ni modificar `appsettings.json`, conexiones, secretos o configuraciones de ejecución.
6. Mantener el módulo vertical; no registrar sus clases en los registradores generales de Aplicación o Infraestructura.
7. Concentrar la integración compartida en `Program.cs`: `builder.Services.AgregarDiagnosticoSistema();` y la activación de la política CORS existente cuando todavía no esté en el pipeline.
8. No modificar el middleware global. La correlación pertenece a `ContextoDiagnosticoAttribute`.

## Reinstalación

1. Confirmar el backup indicado por el usuario.
2. Ejecutar desde la raíz nueva:

   ```powershell
   git apply --check C:\Users\sanin\ProyectosReact\BackendAndromeda\DiagnosticoSistemaPortable\diagnostico-sistema-backend.patch
   ```

3. Si no hay conflictos, ejecutar `git apply` con el mismo parche.
4. Si hay conflictos, no forzarlo. Comparar la arquitectura con `GUIA_PROGRAMADOR_BACKEND.md` y copiar desde `DiagnosticoSistemaPortable\src` solamente las carpetas `DiagnosticoSistema`.
5. Adaptar namespaces únicamente cuando la estructura real lo requiera.
6. Confirmar que el registro pueda resolver servicio, interfaz, repositorio e interfaz de repositorio.
7. Confirmar que el repositorio recibe el contexto de lectura de la API nueva.
8. Agregar una sola llamada en `Program.cs`, después del registro de Infraestructura.
9. Comprobar que la política CORS de React esté activa. Si existe `ReactPolicy` pero falta el middleware, agregar `app.UseCors("ReactPolicy")` antes de autenticación.

## Validación obligatoria

1. Compilar primero sin restaurar paquetes:

   ```powershell
   dotnet build .\src\fyd.backend.API\fyd.backend.API.csproj --no-restore
   ```

2. Restaurar solamente si la API nueva lo necesita y el proyecto lo permite.
3. Verificar que registradores globales, middleware y `appsettings.json` no tengan cambios del diagnóstico.
4. Iniciar la API en un puerto alternativo cuando sea posible.
5. Consultar `GET /api/diagnostico/capas` y verificar respuestas `200` y `503`.
6. Verificar un timeout SQL cercano a 5 segundos.
7. Confirmar que cabecera, JSON y logs usan el mismo identificador.
8. Compilar el frontend y revisar acceso, modal, colores, reintento, cierre y comportamiento sin API.

## Regeneración del paquete

Después de adaptar el módulo:

1. Generar un parche que incluya solamente las carpetas `DiagnosticoSistema` y la línea de `Program.cs`.
2. Validarlo con `git apply --check` contra una copia limpia del mismo backend.
3. Actualizar ambas guías si cambiaron nombres, dependencias, ruta o contrato.
4. Guardarlo fuera de la carpeta reemplazable del backend.

## Criterio de finalización

El diagnóstico está correctamente aislado cuando el diff contiene únicamente:

- las cuatro carpetas `DiagnosticoSistema`;
- la activación del módulo en `Program.cs`;
- opcionalmente, la activación de la política CORS ya declarada cuando la versión receptora la omitía.

Cualquier otro archivo modificado debe explicarse y aprobarse antes de terminar.
