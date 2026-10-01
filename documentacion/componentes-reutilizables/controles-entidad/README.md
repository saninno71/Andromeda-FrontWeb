# Controles reutilizables de entidades

## Propósito

Empresa, Cuenta, Cliente, Proveedor, Moneda y Numeración comparten su comportamiento entre filtros, formularios y edición de celdas. La presentación cambia según el contexto, pero la selección y la búsqueda pertenecen a una única capa funcional.

## Estructura

```text
servicio HTTP
    ↓
entidad.funcional.js
    ↓
useEntidad.js
    ├── ComboEntidad.jsx
    └── EntidadEditorCelda.jsx → EditorEntidadCelda.jsx
```

- `services/*Service.js`: integración HTTP.
- `*.funcional.js`: formateo, condición de búsqueda y funciones reutilizables.
- `use*.js`: borrador, carga, cancelación, resultados, selección y limpieza.
- `Combo*.jsx`: presentación para filtros o formularios.
- `*EditorCelda.jsx`: adaptador compacto para Grilla.
- `EditorEntidadCelda.jsx`: presentación común de lista, portal y teclado.

## Contrato de selección

Los controles reciben una entidad completa en `valor`. `onChange` devuelve la entidad elegida. Cuando el usuario modifica el texto de una selección buscable, el hook limpia primero la selección mediante `onChange(null)`.

Esto evita mantener un identificador anterior junto con texto nuevo. El borrador local se asocia al valor con el cual comenzó la escritura; un cambio externo de `valor` prevalece y actualiza el texto mostrado.

Los controles buscables distinguen explícitamente el origen del borrador:

- `valor`: asignación externa, carga inicial o selección de una opción; actualiza la presentación y no ejecuta una búsqueda;
- `usuario`: texto escrito en el control; limpia la selección anterior y habilita la búsqueda remota cuando alcanza el mínimo requerido.

Esta regla se centraliza en `src/components/EntidadBusqueda/busquedaEntidad.funcional.js`. Cuenta, Cliente y Proveedor deben reutilizarla. Un control buscable nuevo no puede deducir la intención solamente a partir del contenido de `value`.

## Entidades disponibles

| Control | Identificador | Código | Nombre visible | Contexto |
|---|---|---|---|---|
| Empresa | `empresaID` | — | `empresaNombre` | — |
| Cuenta | `cuentaID` | `cuentaCodigo` | `cuentaNombre` | `empresaID` |
| Cliente | `clienteID` | `clienteCodigo` | `clienteNombre` | — |
| Proveedor | `proveedorID` | `proveedorCodigo` | `proveedorNombre` | `empresaID` |
| Moneda | `monedaID` | `monedaCodigo` | `monedaNombre` | — |
| Numeración | `numeraTipoID` | — | `descripcion` | — |

Cuenta, Cliente y Proveedor realizan búsqueda remota con una demora actual de 500 ms y admiten búsqueda por código o nombre. Moneda aplica el mismo contrato con una demora de 150 ms; temporalmente filtra `src/simul/Monedas.json` y su servicio queda preparado para sustituir esa fuente por la API. `ComboMonedas` presenta la selección y sus opciones como `(Código) Descripción`, por ejemplo `(ARS) Pesos Argentinos`, y selecciona todo el texto al recibir foco para que la primera escritura lo reemplace. Empresa y Numeración cargan sus opciones mediante sus funciones de obtención.

## Presentación normal

Los `Combo*.jsx` reciben, según el control:

- `titulo`;
- `valor`;
- `onChange`;
- `onEnter`;
- `tabIndex`;
- `empresaID` cuando la búsqueda depende de la empresa.

La pantalla no debe llamar directamente al servicio para alimentar otra copia del mismo combo.

`InputComboBusqueda` admite `formatearItem` y `seleccionarAlEnfocar` como opciones. Deben activarse desde el combo especializado únicamente cuando su contrato visual o de edición lo requiera; los demás combos conservan el formato y el foco predeterminados.

Los controles personalizados normales de formulario y sus listas desplegables usan un radio de esquina de `5px`. Una variante embebida dentro de Grilla puede usar radio `0` para ajustarse exactamente a los límites de la celda; esta excepción no modifica la presentación normal del mismo control.

El estado deshabilitado se aplica al control completo: borde y fondo pasan a su variante gris, label y valor usan el color de lectura deshabilitada y cualquier imagen, SVG o icono interno se convierte a escala de grises con opacidad reducida. Esta regla pertenece al componente base, por lo que Empresa, Moneda, Fecha y cualquier entidad futura no deben implementar el grisado por separado.

## Presentación para Grilla

Cada `*EditorCelda.jsx` usa el mismo hook y traduce las props de interacción de Grilla hacia `EditorEntidadCelda`.

`EditorEntidadCelda` proporciona:

- input con selección completa al obtener foco;
- lista en un portal para no ser recortada por la grilla;
- reposicionamiento ante scroll y resize;
- navegación con flechas;
- Enter para seleccionar o confirmar;
- Escape para cancelar;
- cierre con Tab;
- detención de eventos que no deben llegar a la fila.

La grilla decide qué atributo se muestra mediante `atributoVisible`; el editor continúa buscando por código y nombre cuando la entidad dispone de ambos.

## Incorporar una entidad nueva

1. Crear o reutilizar su servicio.
2. Crear `entidad.funcional.js` con reglas independientes de React.
3. Crear `useEntidad.js` como única coordinación de estado y búsqueda.
4. Crear `ComboEntidad.jsx` reutilizando la presentación normal apropiada.
5. Crear `EntidadEditorCelda.jsx` reutilizando el hook y `EditorEntidadCelda`.
6. Registrar el editor exclusivamente en `gridEditores.js`.
7. Documentar identificador, código, nombre, contexto y ejemplo de columna.

## Verificación mínima

- Seleccionar y limpiar desde un formulario.
- Cambiar externamente `valor` y confirmar que el texto se actualiza.
- Confirmar que una asignación externa, incluida una carga por código, no ejecuta la búsqueda remota.
- Buscar por código y nombre.
- Confirmar cancelación de solicitudes anteriores durante escritura rápida.
- Probar foco, flechas, Enter, Escape y Tab dentro de Grilla.
- Confirmar que la selección actualiza identificador, código y nombre juntos.
