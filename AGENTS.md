# Instrucciones de trabajo para Andromeda React

Estas instrucciones se aplican a todo el proyecto.

## Antes de modificar una pantalla

1. Leer `documentacion/componentes-reutilizables/README.md`.
2. Para crear o modificar un ABM, leer obligatoriamente `documentacion/componentes-reutilizables/abm/README.md`.
3. Leer `documentacion/modulos/<modulo>.md` para conocer la arquitectura y las particularidades del módulo.
4. Consultar la documentación específica del control, grilla, editor o capa funcional involucrada.
5. Revisar código existente solamente para confirmar o reutilizar una implementación puntual ya identificada por su contrato; no usarlo como sustituto de documentación arquitectónica faltante.
6. Reutilizar los componentes y contratos existentes antes de crear una variante nueva.
7. Mantener separadas la lógica funcional, la presentación, la grilla y la pantalla que consume el componente.
8. Pedir al usuario su OK antes de comenzar una modificación nueva.

## Al trabajar con componentes reutilizables

- Los controles de entidades deben compartir búsqueda, selección, normalización y validación entre filtros, formularios y editores de grilla.
- Las diferencias visuales se resuelven con presentaciones o adaptadores específicos; no se duplica la lógica funcional.
- La grilla debe seleccionar editores mediante su configuración de columnas y no mediante dependencias directas dispersas por sus filas.
- Las columnas relacionadas, como código y nombre, deben vincularse mediante metadatos explícitos.
- Toda ventana modal debe reutilizar `src/components/ModalHeader/ModalHeader.jsx`; no debe reconstruir el botón de cierre, el título ni la estructura visual del encabezado.
- Los iconos, leyendas, estados u otros agregados particulares del encabezado deben enviarse mediante `contenidoAdicional`.
- Los formularios ABM deben reutilizar las estructuras comunes de encabezado, cinta de acciones y pie.
- La capa funcional debe reflejar el estado vigente de controles, hijos y grillas cuando ese estado pueda ser solicitado por otras funciones.
- Los services que consumen una API deben reutilizar `src/infraestructura/http/respuestaHttp.js` para interpretar errores HTTP. No duplicar lectores de Problem Details dentro de cada módulo. Los services de negocio permanecen junto a su módulo; solamente la infraestructura HTTP transversal se centraliza.

## Documentación obligatoria

Cada carpeta de `src/modulos` debe tener un documento de arquitectura propio en
`documentacion/modulos/<modulo>.md`. Esa carpeta central es el índice de la
arquitectura funcional. El documento es la entrada para comprender el módulo
antes de leer su implementación y debe mantenerse en un nivel alto-medio. Como
mínimo debe explicar:

1. el propósito y los límites funcionales del módulo;
2. el flujo entre pantalla, modelo funcional, composición, servicios y API;
3. la estructura principal de su estado y sus contratos públicos;
4. la responsabilidad de cada archivo `.js` y `.jsx` del módulo;
5. sus dependencias con otros módulos y qué partes pueden ejecutarse sin
   renderizar React.

Cuando se agrega, elimina o cambia la responsabilidad de un archivo `.js` o
`.jsx`, se actualiza el documento de arquitectura del módulo en el mismo cambio.
El documento no debe repetir el código línea por línea ni describir detalles
visuales menores.

Cuando se cree, adapte o cambie el contrato de un componente reutilizable:

1. Actualizar su documento dentro de `documentacion/componentes-reutilizables/`.
2. Documentar propósito, archivos, contrato público, estructura de datos, ejemplo de uso, dependencias y verificaciones.
3. Actualizar el índice de componentes.
4. Señalar cualquier migración requerida para pantallas consumidoras.

Si todavía no existe documentación para un componente reutilizable que deba modificarse, se debe estudiar primero su implementación y crear el documento correspondiente como parte del cambio aprobado.

Las instrucciones expresas del usuario tienen prioridad sobre este archivo.
