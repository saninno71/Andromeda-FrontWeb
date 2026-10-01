# Diagnóstico de capas

- `GUIA_PROGRAMADOR_BACKEND.md`: instalación, contrato, adaptación y desinstalación.
- `GUIA_CODEX_REAPLICACION.md`: procedimiento para reinstalarlo en una futura API.
- `GUIA_PROGRAMADOR_CONSULTA_ASIENTOS_V3.md`: GET individual de Asientos con Entity Framework, relaciones, inventario y pasos de migración.
- `INTEGRACION_BACKEND_V3.md`: estado consolidado de diagnóstico, conexiones y Asientos en la v3.
- `asientos-consulta-v3.patch`: parche portable de Asientos, separado del diagnóstico.

Los artefactos transportables permanecen fuera del backend reemplazable, en:

```text
C:\Users\sanin\ProyectosReact\BackendAndromeda\DiagnosticoSistemaPortable
├── diagnostico-sistema-backend.patch
└── src\
```

La documentación oficial está centralizada en esta carpeta del proyecto React.

## Comportamiento del frontend

- Al ingresar a la pantalla principal se ejecuta un diagnóstico silencioso.
- El diagnóstico inicial no abre el modal ni interrumpe la navegación.
- El acceso **Estado del sistema** muestra un único indicador: gris mientras todavía no hay resultado, verde cuando todas las capas responden normalmente, amarillo ante lentitud y rojo ante error o timeout.
- Al abrir el acceso se ejecuta un diagnóstico nuevo y se muestra el detalle por capas.
- **Volver a probar** repite la consulta dentro del modal.
- Cada diagnóstico visible actualiza el indicador del menú con su resultado más reciente.
- La pantalla principal conserva el último diagnóstico completado como única fuente de estado para el indicador y el modal.
- El modal muestra siempre la fecha y hora del último control completado, incluso cuando una capa no responde.
- No se ejecutan consultas periódicas; solamente al ingresar, abrir el modal o solicitar un reintento.
