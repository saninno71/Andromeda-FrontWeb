# Componentes reutilizables de Andromeda React

## Instructivo obligatorio para los agentes

En la raíz del proyecto existe el archivo:

```text
AGENTS.md
```

`AGENTS.md` es el instructivo que debe leer Codex o cualquier agente que trabaje dentro del repositorio. Su función es obligar a revisar este catálogo antes de modificar una pantalla, buscar primero capacidades existentes, reutilizar sus contratos y mantener actualizada la documentación.

El archivo está ubicado en la raíz para que sus reglas alcancen todo el proyecto React. La explicación técnica de cada componente permanece dentro de esta carpeta de documentación.

## Objetivo de este catálogo

Evitar que cada pantalla vuelva a implementar controles, búsquedas, validaciones, editores de celda, estructuras ABM o administración de estado que Andromeda ya posee.

Antes de comenzar un desarrollo se debe determinar:

1. Si ya existe el componente necesario.
2. Qué parte funcional puede reutilizarse.
3. Qué adaptación visual requiere el contexto nuevo.
4. Qué configuración debe declarar la pantalla consumidora.
5. Si el cambio altera el contrato de otras pantallas.

## Organización prevista

```text
componentes-reutilizables/
├── README.md
├── controles-entidad/
├── grilla/
├── modal-header/
├── abm/
├── respuesta-http/
└── capa-funcional/
```

Los documentos se incorporarán a medida que trabajemos sobre cada componente. Como mínimo deberán describir:

- propósito y alcance;
- archivos que lo componen;
- props y contrato público;
- estructura de datos;
- lógica funcional reutilizable;
- variantes visuales;
- integración con formularios y grillas;
- navegación por teclado y foco;
- dependencias y servicios;
- ejemplo de configuración;
- pruebas o verificaciones necesarias;
- errores frecuentes y restricciones conocidas.

## Componentes que deben documentarse

- Controles de Empresa, Cuenta, Cliente, Proveedor y Numeración.
- Editores custom de celdas y selección del `atributoVisible`.
- Vinculación entre columnas de código y nombre.
- Parametrización, edición, navegación y virtualización de la grilla.
- Encabezado reutilizable de todas las ventanas modales.
- Cinta de acciones y pie reutilizables de formularios ABM.
- Estado de la capa funcional y comunicación con formularios hijos.

El índice deberá enlazar cada documento cuando sea creado.

## Índice disponible

- [Controles de entidades](controles-entidad/README.md): Empresa, Cuenta, Cliente, Proveedor, Numeración y sus editores de celda.
- [InputCombo](input-combo/README.md): selector genérico, teclado y renderizado opcional de valores y opciones.
- [Grilla](grilla/README.md): contrato técnico, editores, navegación y virtualización.
- [Guía de configuración de Grilla](grilla/GUIA_CONFIGURACION_GRILLA.md): referencia para desarrolladores, parametría, estado interno, vistas y diagnóstico.
- [Header de ventanas modales](modal-header/README.md): cierre, título y contenido adicional reutilizable.
- [Formularios ABM](abm/README.md): cinta de acciones, navegación reutilizable de registros, pie y composición de formularios ABM.
- [Interpretación de respuestas HTTP](respuesta-http/README.md): lectura uniforme de Problem Details, validaciones ASP.NET y cuerpos de error.
- [Informes de consultas BQD](informes-bqd/README.md): preparación tabular, distribución multilínea y generación de vista previa PDF.

Pendiente de desarrollo documental:

- capa funcional de pantallas y comunicación con formularios hijos.
