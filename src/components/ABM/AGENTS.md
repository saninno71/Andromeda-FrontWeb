# Instrucciones específicas para formularios ABM

Estas reglas complementan los `AGENTS.md` de la raíz y de `src/components`.

Antes de modificar componentes ABM o crear otra pantalla ABM, leer `documentacion/componentes-reutilizables/abm/README.md`.

## Procedimiento obligatorio para un ABM nuevo

Antes de escribir JSX o servicios:

1. inventariar los modos, campos editables, acciones de cinta, navegación, validaciones, renglones y endpoints del ABM;
2. separar las reglas generales de las reglas propias de la entidad;
3. revisar `AsientosABM` como implementación de referencia, sin copiar nombres ni reglas contables;
4. reutilizar los componentes comunes existentes y declarar mediante configuración las diferencias de la pantalla;
5. identificar toda lógica general todavía alojada en una pantalla particular y proponer su extracción antes de duplicarla;
6. presentar al usuario el alcance exacto y obtener su OK antes de modificar el proyecto.

No dar por completo un ABM porque representa controles y llama a un endpoint. También debe resolver de forma coherente modos, permisos, cambios reales, edición pendiente, altas y bajas de renglones, guardado, descarte, navegación, carga, errores y confirmaciones.

## Componentes comunes

- Reutilizar `ModalHeader` para título y cierre; los agregados propios del ABM se entregan mediante `contenidoAdicional`.
- Reutilizar `ABMCintaAcciones` para acciones superiores configuradas mediante descriptores.
- Reutilizar `ABMNavegacionRegistros` dentro de `ABMCintaAcciones` cuando un ABM deba recorrer los registros de su pantalla de origen.
- Reutilizar `ABMIndicadorModo` dentro de `ModalHeader.contenidoAdicional`: alta muestra `Registro nuevo` con punto verde, edición muestra `Modo edición` con punto azul y consulta muestra `Modo consulta` con punto gris.
- Reutilizar `ABMPieAcciones` para Cancelar, Aplicar y Aceptar.
- No copiar el JSX o los estilos de estos componentes dentro de una pantalla particular.
- No incorporar reglas de Asientos ni llamadas a servicios dentro de los componentes comunes.
- `ABMNavegacionRegistros` solamente emite destinos y estados de habilitación; la pantalla coordinadora lo conecta con Grilla y con el identificador de negocio.

## Responsabilidad de la pantalla

- La pantalla define título, acciones, iconos, estados deshabilitados y callbacks.
- Para un alta usar `MODO_ABM.ALTA`; no simularla con un ID ficticio. Después de crear, el modelo puede adoptar `MODO_ABM.EDICION` y recargar el ID devuelto por la API.
- `MODO_ABM.CONSULTA` oculta Aplicar/Aceptar. `MODO_ABM.ALTA` muestra Cancelar y Aceptar, sin Aplicar. Edición y Baja pueden mostrar las tres acciones. Resolver estas reglas mediante `mostrarAccionesPieABM` y `mostrarAplicarPieABM`; un modo Baja puede presentar las acciones deshabilitadas hasta que su operación de eliminación esté implementada.
- La pantalla mantiene su estado funcional, validaciones, servicios y persistencia.
- Cancelar descarta y cierra; Aplicar guarda y mantiene abierto; Aceptar guarda y cierra, salvo que el requerimiento aprobado defina otra semántica.
- El cuerpo, los controles específicos y la grilla de detalle pertenecen a la pantalla consumidora.

## Estado funcional y cambios reales

- El estado editable pertenece a la capa funcional. El JSX no debe reconstruirlo leyendo controles del DOM.
- Cada carga, alta inicial o guardado exitoso establece una instantánea base independiente del estado editable.
- `modificado` debe surgir de comparar una instantánea persistible normalizada contra esa base. No debe activarse simplemente porque ocurrió un `onChange`, se agregó una fila o se abrió un editor.
- La instantánea persistible incluye únicamente campos que realmente formen parte del contrato de escritura. Debe normalizar fechas, nulos, cadenas, entidades y números antes de comparar.
- Si el usuario cambia un valor y luego restaura el original, el ABM deja de estar modificado.
- Una fila temporal completamente vacía no constituye un cambio y no debe enviarse al backend. Si contiene al menos un dato persistible, se incluye y queda sujeta a las validaciones normales.
- Después de Aplicar, la respuesta persistida o la recarga del registro reemplaza la instantánea base. No conservar como base el borrador anterior al guardado.
- La mecánica de instantánea, normalización y comparación es general. La lista de campos, la identidad de renglón y la definición de fila vacía son configuración de cada ABM.

Hasta que exista un seguidor de cambios compartido bajo `src/components/ABM`, `AsientosABM/abmAsientos.funcional.js` es solamente la implementación de referencia. Está prohibido copiar y renombrar esa lógica en otro módulo: primero se debe proponer la extracción común y pedir el OK correspondiente.

## ABM con grilla de detalle

- Antes de Aplicar o Aceptar, invocar `controlGrid.confirmarEdicion()` para incorporar al modelo el borrador de la celda o fila activa.
- Agregar una fila debe confirmar primero la edición activa, crear una identidad temporal exclusiva del frontend y abrir la nueva fila en edición.
- Las identidades temporales nunca se envían como IDs persistidos. El adaptador del payload las convierte en `null` o las omite según el contrato del endpoint.
- Eliminar una fila temporal sólo modifica el estado local. Eliminar una fila existente debe representarse según el contrato aprobado: ausencia en la instantánea completa o una colección explícita de bajas.
- Cancelar descarta altas, modificaciones y bajas locales.
- Consulta bloquea edición por mouse, teclado y llamadas funcionales. La grilla visible deshabilitada no reemplaza la validación del modelo.
- Selección, foco, virtualización y menú flotante pertenecen a Grid. Las reglas de persistencia y de fila vacía pertenecen al seguimiento de cambios del ABM.
- Cuando un detalle de ABM deba mostrar todos sus renglones, configurar Grid con `ajustarAlturaAContenido` y una `alturaMinima`; el cuerpo general del ABM debe absorber el scroll vertical. No resolverlo contando filas desde el JSX de la pantalla.
- Los importes editables del detalle se declaran como columnas decimales con su `mascara`; Grid debe usar su editor decimal reutilizable para mostrar miles y decimales también durante la edición. El ABM conserva valores numéricos y no recibe textos formateados.
- Los totales y la cantidad de registros se calculan sobre el estado vigente que ve el usuario; su formato y leyenda se configuran sin introducir reglas de una entidad en Grid.

## Persistencia y acciones

- Aplicar sin cambios reales no llama al endpoint y mantiene abierta la pantalla.
- Aceptar sin cambios reales no llama al endpoint y cierra la pantalla, salvo una excepción funcional documentada.
- Aplicar con cambios confirma la edición pendiente, valida, guarda, actualiza la base y mantiene abierto el ABM.
- Aceptar con cambios confirma, valida, guarda y cierra después del éxito.
- Un error de guardado conserva el formulario y sus cambios para permitir corrección o reintento.
- Evitar dobles envíos mediante un estado `guardando`; durante ese estado se bloquean acciones incompatibles.
- Alta no usa IDs ficticios. El ID devuelto por el POST se adopta recién después del éxito.
- Las validaciones del frontend ayudan al usuario, pero no reemplazan integridad, concurrencia ni autorización del backend.

## Modos, cinta y navegación

- La política visual y de habilitación de la cinta debe estar centralizada en un archivo funcional de la pantalla, no distribuida entre expresiones JSX.
- Nuevo, Editar, Consultar y Borrar cambian el modo según una transición explícita. El indicador, el pie, los permisos y la cinta se derivan del mismo modo.
- `obtenerDisponibilidadAccionesRegistroABM` define la regla común de acciones por modo. Durante Edición se deshabilitan Nuevo, Borrar y Visualizar; Editar y la navegación conservan su disponibilidad. Las pantallas pueden adaptar esta política sin duplicar las condiciones en JSX.
- Durante Alta se bloquean las acciones que requieren un registro persistido y la navegación por registros.
- Después de Aceptar un alta, comunicar el ID persistido a la pantalla de origen, actualizar su conjunto y reposicionarlo con `Grid.ubicarFila()`.
- La navegación conserva el modo Consulta o Edición, confirma o resuelve cambios pendientes según el caso de uso aprobado, mueve la grilla de origen incluso fuera del viewport y luego carga el nuevo ID.
- Las solicitudes superpuestas deben cancelarse o descartarse por identidad para impedir que una respuesta anterior reemplace un registro más reciente.
- Los indicadores de carga deben admitir demora y visibilidad configurables para evitar parpadeos en respuestas rápidas.
- Todo ABM con cuerpo desplazable debe usar `useScrollErrorABM(error)` y asignar la referencia devuelta a ese cuerpo. Cuando aparece una validación frontend o un error remoto, el contenido debe ubicarse inmediatamente al inicio y reafirmar esa posición en el siguiente cuadro del navegador, sin alterar el scroll horizontal. Esta segunda aplicación evita que el render asíncrono posterior de controles o grillas vuelva a ocultar el mensaje.

## Reglas propias de cada ABM

Cada pantalla debe declarar y documentar fuera del JSX:

- campos editables por modo;
- campos persistibles de cabecera y renglón;
- normalización necesaria para comparar y enviar;
- identidad persistida y temporal de los renglones;
- criterio de fila completamente vacía;
- validaciones de negocio;
- construcción del payload y traducción de la respuesta;
- acciones visibles, habilitadas y atenuadas de la cinta;
- comportamiento después de crear, actualizar o eliminar;
- origen y conservación de la navegación entre registros.

## Accesibilidad y mantenimiento

- Conservar `role="dialog"`, `aria-modal`, asociación del título, foco inicial, trampa de Tab y cierre con Escape en el contenedor modal.
- Cada acción debe tener identificador estable, texto alternativo o título comprensible.
- Si cambia el contrato de `ModalHeader`, actualizar `documentacion/componentes-reutilizables/modal-header/README.md` y revisar todas las ventanas consumidoras.
- Si cambia el contrato de Cinta o Pie, actualizar `documentacion/componentes-reutilizables/abm/README.md` y revisar todas las pantallas consumidoras.
- Todo ABM nuevo debe tener pruebas de su capa funcional sin React para modos, permisos, comparación con la base, filas temporales, edición pendiente, Apply/Accept/Cancel y errores de persistencia.
- Si una regla se repetirá en dos ABM, detener la duplicación y proponer un contrato reutilizable bajo `src/components/ABM`.
- Obtener el OK del usuario antes de iniciar una modificación nueva.
