# Instrucciones para componentes reutilizables

Estas reglas complementan el `AGENTS.md` de la raíz y se aplican a todo `src/components`.

## Consulta obligatoria

Antes de cambiar un componente, leer el documento correspondiente bajo `documentacion/componentes-reutilizables/`. Para controles de entidades, consultar `documentacion/componentes-reutilizables/controles-entidad/README.md`.

## Separación de responsabilidades

- Los servicios realizan las llamadas HTTP y normalizan la respuesta externa.
- Los archivos `*.funcional.js` contienen reglas puras de búsqueda, formato y validación.
- Los hooks coordinan borradores, selección, carga, cancelación y mensajes.
- Los componentes JSX de formulario resuelven la presentación normal.
- Los editores `*EditorCelda.jsx` adaptan el mismo hook a `EditorEntidadCelda`.
- Las pantallas consumidoras reciben o guardan la entidad seleccionada; no deben reconstruir la lógica interna del control.

## Reutilización

- Toda ventana modal debe usar `ModalHeader` para el cierre y el título. La pantalla aporta sus elementos particulares mediante `contenidoAdicional`.
- Para decisiones binarias reutilizar `ModalConfirmacion`: Confirmar ejecuta la acción, Cancelar no debe producir efectos y `procesando` impide doble envío o cierre durante la operación.
- No duplicar en una pantalla el JSX o CSS estructural de `ModalHeader`.
- Antes de crear un selector, revisar Empresa, Cuenta, Cliente, Proveedor y Numeración.
- No duplicar búsquedas, debounce, limpieza de selección ni formateo en una pantalla o editor de grilla.
- Una variante visual debe reutilizar la capa funcional y el hook existentes.
- Todo ABM debe recibir un modo explícito desde `components/ABM/modosABM.js`. La lista de campos editables pertenece a una política funcional central de cada ABM; el JSX y el modelo deben consumir la misma definición.
- En modo consulta, los controles y grillas no deben emitir cambios y la capa funcional debe rechazarlos igualmente.
- `onChange` de un control de entidad comunica la entidad completa seleccionada o `null` durante la limpieza.
- Los combos buscables deben distinguir el origen del borrador: una asignación externa de `valor` solo sincroniza la presentación; únicamente la escritura del usuario habilita la búsqueda remota. Reutilizar `EntidadBusqueda/busquedaEntidad.funcional.js`.
- Un editor de celda nuevo debe registrarse únicamente en `src/components/grid/gridEditores.js`; no debe importarse desde `GridFila.jsx`.
- Los controles personalizados normales de formulario y sus listas desplegables usan `border-radius: 5px`. Las variantes embebidas en celdas de Grilla pueden sobrescribirlo con radio `0` para ocupar exactamente la celda.
- Cuando un control reutilizable está deshabilitado debe atenuar como una unidad borde, fondo, label, valor e iconos. Todo contenedor de icono deshabilitado debe cubrir imágenes, SVG y colores heredados mediante color gris, `grayscale` y opacidad; no se permite conservar iconos activos en celeste dentro de un control grisado.

## Mantenimiento

- Si cambia el contrato público, actualizar la documentación y señalar las pantallas consumidoras afectadas.
- Si cambia el patrón que deberán seguir componentes futuros, actualizar también este archivo.
- Conservar comportamiento de foco, teclado y accesibilidad al crear variantes.
- Obtener el OK del usuario antes de iniciar una modificación nueva.
