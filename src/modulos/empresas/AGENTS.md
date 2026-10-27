# Instrucciones del módulo Empresas

Estas reglas se aplican al estado funcional, los servicios y la futura
presentación de Empresas.

## Lecturas obligatorias

Antes de modificar este módulo, leer:

1. `C:\Users\sanin\ProyectosReact\andromeda_React\AGENTS.md`.
2. `C:\Users\sanin\ProyectosReact\andromeda_React\documentacion\modulos\empresas.md`.
3. La documentación de componentes reutilizables que participe del cambio.

Pedir el OK del usuario antes de iniciar una modificación nueva.

## Arquitectura fundamental

- El modelo funcional de Empresas puede ejecutarse sin montar un componente
  React.
- `services/empresasService.js` concentra el listado de empresas y la consulta
  del detalle completo por ID. Mientras no existan los endpoints, ambas
  operaciones utilizan `mocks/empresas.json` como fuente única.
- `EmpresasABM/abmEmpresas.funcional.js` transforma la respuesta y mantiene el
  estado de carga. No depende del DOM ni de React.
- `EmpresasABM/abmEmpresas.modulos.js` compone el modelo con su servicio.
- `EmpresasABM/ABMEmpresas.jsx` es por ahora un punto de extensión sin interfaz.
- Otros ABM pueden cargar el modelo funcional de Empresa sin renderizarlo y
  copiar su resultado normalizado dentro de su propio estado.
- Los nombres de clases y controles VB6 no pertenecen al estado de Empresa. La
  traducción legacy corresponde al mapeador de impresión de cada pantalla.

## Contratos actuales

- El identificador público es `empresaID`.
- El contrato de detalle contiene identificación, domicilio, ubicación,
  teléfono y web.
- El listado y el detalle comparten una única estructura de Empresa. Los
  controles que solamente necesitan ID, código y nombre consumen esos campos
  sin mantener un segundo catálogo.
- Los endpoints previstos son `GET /api/general/empresas` y
  `GET /api/general/empresas/{id}`.
- Cambiar la fuente simulada por HTTP no debe modificar el contrato público del
  modelo funcional ni de sus consumidores.
