# Documentación técnica de Andromeda React

Esta carpeta concentra las guías que deben mantenerse junto al frontend aunque describan integraciones con el backend.

Antes de modificar código, también se debe leer `C:\Users\sanin\ProyectosReact\andromeda_React\AGENTS.md`. Ese archivo contiene instrucciones obligatorias para agentes de IA: reutilización de componentes, separación de capas, pedido de OK y actualización de documentación.

## Índice

- `componentes-reutilizables/`: contratos y ejemplos de controles, grillas, encabezados y estructuras ABM compartidas.
- `grillas/`: configuración y comportamiento de grillas para desarrolladores.
- `diagnostico-sistema/README.md`: diagnóstico de capas y estado del sistema.
- `diagnostico-sistema/GUIA_PROGRAMADOR_BACKEND.md`: incorporación del diagnóstico y correcciones auxiliares en la API.
- `diagnostico-sistema/GUIA_CODEX_REAPLICACION.md`: reinstalación del diagnóstico en una API futura.
- `diagnostico-sistema/GUIA_PROGRAMADOR_CONSULTA_ASIENTOS_V3.md`: implementación EF del GET individual de Asientos, inventario de archivos y migración.
- `diagnostico-sistema/INTEGRACION_BACKEND_V3.md`: estado consolidado de la integración actual.
- `despliegue-frontend/GUIA_INSTALACION_FRONTEND_REACT.md`: instalación principal con Nginx en Docker sobre Linux, alternativas Nginx directo e IIS, compilación, publicación, verificación y actualización del frontend React.

El módulo Asientos posee además instrucciones locales en `src/modulos/asientos/AGENTS.md` y su arquitectura funcional en `src/modulos/asientos/asientosArquitectura.md`.
