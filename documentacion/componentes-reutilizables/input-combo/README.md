# InputCombo

`src/components/InputCombo/InputCombo.jsx` presenta un selector genérico con label flotante, navegación por teclado y lista desplegable.

## Contrato visual

Por defecto, el valor y cada opción muestran `item[campoDescripcion]`. Los consumidores existentes no necesitan configuración adicional.

Cuando una pantalla necesita enriquecer la presentación puede proporcionar estas funciones opcionales:

- `renderItem(item)`: representa una opción dentro de la lista.
- `renderValor(item)`: representa el valor actualmente seleccionado.

Las funciones cambian solamente la presentación. La selección continúa comunicando el objeto completo mediante `onChange(item)` y la comparación activa continúa utilizando `campoDescripcion`.

```jsx
<InputCombo
    titulo="Interlineado"
    valor={colorSeleccionado}
    items={colores}
    campoID="id"
    campoDescripcion="nombre"
    onChange={seleccionarColor}
    renderItem={color => <MuestraColor color={color} />}
    renderValor={color => <MuestraColor color={color} />}
/>
```

Si se omiten ambas funciones, el control conserva exactamente su representación textual anterior.
