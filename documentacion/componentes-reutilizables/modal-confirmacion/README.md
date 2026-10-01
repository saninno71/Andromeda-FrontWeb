# ModalConfirmacion

`src/components/ModalConfirmacion/ModalConfirmacion.jsx` presenta una decisión binaria sobre el resto de la aplicación. Reutiliza `ModalHeader`, se renderiza en `document.body` y usa `role="alertdialog"`.

## Contrato

- `abierto`: controla la visibilidad.
- `titulo`: encabezado; por defecto `Confirmar`.
- `mensaje`: pregunta o consecuencia que debe decidir el usuario.
- `textoConfirmar` y `textoCancelar`: etiquetas configurables; por defecto `Sí` y `No`.
- `procesando`: bloquea cierre y botones mientras la operación está en curso.
- `onConfirmar`: ejecuta la acción aceptada.
- `onCancelar`: cierra sin ejecutar la acción.

Al abrirse, el foco queda en Confirmar. Escape equivale a cancelar cuando no se está procesando y Tab permanece dentro del diálogo.

## Uso en Asientos

El tacho de la cinta abre la confirmación. Sí ejecuta el DELETE inmediatamente; No vuelve al asiento sin cambiar su modo. Después de una baja correcta, la consulta se actualiza y el ABM carga el siguiente asiento en modo Consulta; si no existe, carga el anterior. Solamente se cierra cuando no queda ningún registro.
