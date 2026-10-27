# Arquitectura del módulo Empresas

Este documento aplica a Empresas la arquitectura general definida en
[`documentacion/componentes-reutilizables/abm/README.md`](../componentes-reutilizables/abm/README.md).
Aquí se describen el flujo alto-medio y las particularidades actuales de
Empresas. Las reglas comunes para construir cualquier `XABM` permanecen en el
documento general.

## Objetivo

El módulo concentra la carga y transformación del detalle completo de una
empresa. Puede utilizarse desde una futura pantalla ABM o desde otros modelos
funcionales que necesiten datos adicionales sin representar esa pantalla.

```text
GET /api/general/empresas
GET /api/general/empresas/{id}
        ↓
empresasService.js
        ↓
abmEmpresas.funcional.js
        ↓
estado funcional de Empresa
        ├── futura presentación ABMEmpresas.jsx
        └── otros ABM ejecutados sin renderización
```

## Archivos

| Archivo | Responsabilidad |
|---|---|
| `services/empresasService.js` | Expone el listado y la consulta por ID, valida sus entradas y oculta si la fuente actual es un mock o la futura API. |
| `EmpresasABM/abmEmpresas.funcional.js` | Mantiene el estado de Empresa, coordina una carga cancelable y normaliza el detalle sin depender de React ni del transporte. |
| `EmpresasABM/abmEmpresas.modulos.js` | Crea el modelo funcional e inyecta el servicio concreto; es la entrada normal para consumidores del módulo. |
| `EmpresasABM/ABMEmpresas.jsx` | Punto de extensión para la futura presentación. Actualmente no representa interfaz. |
| `mocks/empresas.json` | Catálogo temporal único con la estructura completa requerida por listado y detalle. |

Los archivos `.js` y `.jsx` nuevos deben agregarse a esta tabla en el mismo
cambio en que se incorporan al módulo.

## Dependencias y consumidores

El módulo depende solamente de la configuración general de la API y, mientras
no existan los endpoints, de su catálogo simulado. Los combos pueden consumir
`cargarEmpresas`; otros modelos funcionales pueden crear `ABMEmpresas` sin
renderizar su JSX y obtener el detalle normalizado mediante
`cargarEmpresaPorId`.

Empresas no conoce Asientos ni nombres heredados de VB6. Si Asientos necesita
datos completos de la empresa para imprimir, su propia capa funcional debe
solicitar este módulo y conservar el resultado dentro de su estado. El mapeo a
identidades legacy continúa siendo responsabilidad de Asientos.

## Estado funcional

El modelo conserva:

- `empresaID` solicitado;
- `empresa` normalizada;
- indicadores `cargando` y `cargado`;
- `error` de la última carga.

La entidad normalizada incluye ID, código, nombre, domicilio, calle, altura,
piso/departamento, barrio, localidad, código postal, provincia, país, teléfono
y web.

El modelo puede crearse y cargarse sin React:

```js
const modelo = crearModeloABMEmpresas(empresaID);
await modelo.cargar();
const empresa = modelo.obtenerEstado().empresa;
modelo.destruir();
```

## Fuente temporal

`empresasService.js` expone los contratos previstos para listar empresas y
consultar una empresa por ID. Actualmente ambas funciones leen
`mocks/empresas.json`. Cuando existan los endpoints se reemplazará solamente la
implementación interna del servicio.

El mismo objeto completo alimenta ambos contratos. `ComboEmpresas` utiliza ID,
código y nombre, mientras que el modelo funcional puede utilizar domicilio,
ubicación, teléfono y web. No se mantiene un segundo JSON reducido para combos.

La ruta anterior `src/components/services/empresasService.js` reexporta
temporalmente `cargarEmpresas` para conservar compatibilidad con los consumidores
existentes. Los nuevos consumidores deben importar el servicio desde este
módulo.

## Presentación

La interfaz de ABM Empresas todavía no fue definida. `ABMEmpresas.jsx` permanece
vacío intencionalmente; no deben inventarse controles, permisos, modos ni
persistencia hasta acordar su alcance.
