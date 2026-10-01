# Header reutilizable de ventanas modales

## Propósito

`ModalHeader` unifica el encabezado de todas las ventanas modales de Andromeda. Mantiene constantes el botón de cierre, el título, las dimensiones, la tipografía y las alineaciones. La pantalla consumidora puede incorporar contenido propio sin duplicar la estructura del header.

## Archivos

```text
src/components/ModalHeader/
├── ModalHeader.jsx
└── ModalHeader.css
```

## Contrato público

| Prop | Uso |
|---|---|
| `titulo` | Texto principal del encabezado. |
| `tituloID` | Identificador asociado con `aria-labelledby`; por defecto `modalTitulo`. |
| `onCerrar` | Callback del botón circular de cierre. |
| `ariaLabelCerrar` | Descripción accesible del botón; por defecto `Cerrar`. |
| `contenidoAdicional` | Cualquier nodo React que la pantalla necesite mostrar alineado a la derecha. |
| `tabIndexCerrar` | Tabulación opcional del botón de cierre. |
| `ref` | Referencia al botón de cierre para administrar el foco inicial. |

El botón expone `data-modal-cerrar` para que un contenedor pueda localizarlo cuando no resulte práctico conservar una referencia.

## Uso

```jsx
<ModalHeader
    titulo="Estado del sistema"
    tituloID="estadoSistemaTitulo"
    onCerrar={cerrar}
    contenidoAdicional={<IndicadorEstado estado={estado} />}
/>
```

`contenidoAdicional` es un contenedor comodín. Puede recibir indicadores, leyendas, iconos o grupos de elementos. La lógica, los estilos y el significado de ese contenido pertenecen a la pantalla consumidora.

## Reglas

- Toda ventana modal debe reutilizar este componente.
- No copiar su JSX ni sus estilos dentro de una pantalla.
- El encabezado no importa servicios ni conoce reglas de negocio.
- La pantalla mantiene `role="dialog"`, `aria-modal`, la asociación con `tituloID`, el foco inicial, la trampa de Tab y el cierre con Escape.
- Un cambio en este contrato requiere revisar todas las ventanas consumidoras y actualizar este documento.

## Consumidores actuales

- Más Filtros de Asientos.
- ABM Asientos.
- Estado del sistema.

## Verificación

- El encabezado conserva 54 px de altura.
- El botón conserva 22 × 22 px y la `x` queda centrada.
- El título conserva 16 px, peso 700 y separación de 18 px respecto del botón.
- El contenido adicional se alinea a la derecha sin alterar el título.
- El foco y el cierre siguen funcionando en cada modal consumidor.
