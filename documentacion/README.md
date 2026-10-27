# Documentación técnica de Andromeda React

Esta carpeta concentra las guías que deben mantenerse junto al frontend, incluidas las que describen su integración con el backend.

Antes de modificar código, también se deben consultar las [instrucciones generales del proyecto](../AGENTS.md). Ese archivo contiene las reglas obligatorias sobre reutilización de componentes, separación de capas, pedido de aprobación y actualización de documentación.

## Componentes reutilizables

- [Catálogo de componentes reutilizables](componentes-reutilizables/README.md)
- [Estructura reutilizable de formularios ABM](componentes-reutilizables/abm/README.md)
- [Grilla reutilizable](componentes-reutilizables/grilla/README.md)
- [Guía de configuración de la grilla](componentes-reutilizables/grilla/GUIA_CONFIGURACION_GRILLA.md)
- [Controles reutilizables de entidades](componentes-reutilizables/controles-entidad/README.md)
- [Header reutilizable de ventanas modales](componentes-reutilizables/modal-header/README.md)
- [Modal de confirmación](componentes-reutilizables/modal-confirmacion/README.md)
- [Interpretación reutilizable de respuestas HTTP](componentes-reutilizables/respuesta-http/README.md)

## Módulo Asientos

- [Documentación de módulos](modulos/README.md)
- [Arquitectura de Asientos](modulos/asientos.md)
- [Arquitectura de Empresas](modulos/empresas.md)
- [Instrucciones específicas del módulo Asientos](../src/modulos/asientos/AGENTS.md)

## Instrucciones para componentes compartidos

- [Instrucciones generales para componentes reutilizables](../src/components/AGENTS.md)
- [Instrucciones para formularios ABM](../src/components/ABM/AGENTS.md)
- [Instrucciones específicas de la grilla](../src/components/grid/AGENTS.md)
- [Editores de entidades en la grilla](../src/components/grid/gridEditores.md)

## Despliegue del frontend

- [Instalación y publicación de Andromeda React](despliegue-frontend/GUIA_INSTALACION_FRONTEND_REACT.md): Nginx en Docker sobre Linux, Nginx directo e IIS.

## Diagnóstico e integración con el backend

- [Diagnóstico de capas](diagnostico-sistema/README.md)
- [Estado de la integración con backend v3](diagnostico-sistema/INTEGRACION_BACKEND_V3.md)
- [Guía del programador para la consulta y actualización de Asientos en API v3](diagnostico-sistema/GUIA_PROGRAMADOR_CONSULTA_ASIENTOS_V3.md)
- [Guía del programador para incorporar el diagnóstico en el backend](diagnostico-sistema/GUIA_PROGRAMADOR_BACKEND.md)
- [Guía para reinstalar el diagnóstico en una API futura](diagnostico-sistema/GUIA_CODEX_REAPLICACION.md)

## Documentación funcional complementaria

- [Mecanismo de impresión de Andromeda React](../docs/mecanismo_impresion_andromeda_react.docx)
- [Mecanismo de impresión de Andromeda Web v2](../docs/mecanismo_impresion_andromeda_web_v2.docx)
