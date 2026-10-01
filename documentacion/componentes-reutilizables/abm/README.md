# Estructura reutilizable de formularios ABM

## Propósito

Los formularios modales de alta, baja y modificación comparten tres zonas visuales. Estas zonas están desacopladas de Asientos y deben reutilizarse en futuros ABM.

```text
ModalHeader
└── ABMIndicadorModo (alta/edición)
ABMCintaAcciones
└── ABMNavegacionRegistros (opcional)
cuerpo específico de la pantalla
ABMPieAcciones
```

## Modos de apertura

Todo ABM debe recibir un modo explícito definido en `src/components/ABM/modosABM.js`:

- `MODO_ABM.CONSULTA`: no permite modificar controles ni renglones y el pie muestra solamente `CERRAR`;
- `MODO_ABM.EDICION`: habilita exclusivamente los campos autorizados por la política funcional de la pantalla;
- `MODO_ABM.ALTA`: presenta un registro nuevo sin ID, usa la misma política editable con los campos adicionales que la pantalla declare sólo para el alta y muestra Cancelar/Aceptar sin Aplicar.
- `MODO_ABM.BAJA`: identifica una eliminación pendiente; muestra las acciones del pie, mientras cada pantalla define cuándo habilitarlas y cómo confirmar la baja.

El modo forma parte del estado funcional. Consulta y edición se conservan al navegar entre registros; alta no navega porque todavía no existe una fila de origen. No se deduce el modo del estado visual de los controles.

Cada ABM declara su política de campos en un archivo JavaScript independiente. El JSX consume esa política y la capa funcional vuelve a validarla antes de aceptar una mutación. Esta defensa del frontend no reemplaza la autorización y validación del endpoint de escritura.

## ModalHeader

Ruta: `src/components/ModalHeader/ModalHeader.jsx`.

El contrato completo se documenta en `documentacion/componentes-reutilizables/modal-header/README.md`. Los ABM utilizan el mismo encabezado que el resto de las ventanas modales y entregan cualquier icono o leyenda propia mediante `contenidoAdicional`.

### ABMIndicadorModo

Ruta: `src/components/ABM/ABMIndicadorModo/ABMIndicadorModo.jsx`.

Se entrega a `ModalHeader.contenidoAdicional` y recibe el `modo` vigente del estado funcional:

- `MODO_ABM.ALTA`: punto verde y texto `Registro nuevo`;
- `MODO_ABM.EDICION`: punto azul y texto `Modo edición`;
- `MODO_ABM.CONSULTA`: punto gris y texto `Modo consulta`.

Durante el alta el indicador permanece en `Registro nuevo`. Aceptar crea el registro y cierra el ABM; la pantalla coordinadora recibe el ID persistido, actualiza su fuente y la reposiciona mediante `Grid.ubicarFila(fila)`.

## ABMCintaAcciones

Ruta: `src/components/ABM/ABMCintaAcciones/ABMCintaAcciones.jsx`.

Props generales:

- `acciones`: descriptores de botones;
- `deshabilitada`: bloquea la cinta completa;
- `ariaLabel`: nombre accesible del toolbar;
- `titulo`: explicación opcional.

Cada acción admite:

```js
{
  id,
  texto,
  icono,
  onClick,
  disabled,
  title,
  className,
  tabIndex,
  separadorAntes
}
```

`atenuada` aplica el estado visual gris sin cambiar la semántica pendiente de la acción. Se utiliza cuando una política de pantalla necesita expresar temporalmente que una acción no corresponde, aunque su implementación funcional todavía se encuentre en desarrollo.

También puede declarar `componente` para insertar un grupo reutilizable completo dentro de la cinta. En ese caso la cinta representa ese componente en lugar de crear un `BotonToolbar` individual.

El orden, los grupos, los iconos y la lógica pertenecen a la pantalla consumidora. La cinta solamente representa las acciones mediante `BotonToolbar`.

La disponibilidad general de las acciones de registro se obtiene con `obtenerDisponibilidadAccionesRegistroABM(modo)`. En Consulta se habilitan Nuevo, Editar, Borrar, Visualizar y navegación. En Edición se deshabilitan Nuevo, Borrar y Visualizar, mientras Editar y navegación permanecen disponibles. En Alta se bloquean las cuatro acciones de registro y la navegación. Cada pantalla adapta esta política en su archivo funcional de cinta y mantiene fuera del JSX las condiciones de modo.

## Visibilidad de errores

Todo ABM cuyo cuerpo tenga desplazamiento vertical debe usar `useScrollErrorABM(error)`, disponible en `src/components/ABM/useScrollErrorABM.js`. La referencia que devuelve se asigna al contenedor desplazable. Cuando aparece una validación frontend o un error remoto, el hook lleva inmediatamente el cuerpo al inicio y conserva la posición horizontal. Repite la posición en el siguiente cuadro del navegador para impedir que la actualización asíncrona de una grilla o de otros controles vuelva a ocultar el panel. El mensaje mantiene `role="alert"` para anunciarse también mediante tecnologías de asistencia.

## ABMNavegacionRegistros

Ruta: `src/components/ABM/ABMNavegacionRegistros/ABMNavegacionRegistros.jsx`.

Es el grupo reutilizable de los botones Primero, Anterior, Siguiente y Último. Se inserta como `componente` de una acción de `ABMCintaAcciones` y no conoce Grilla, entidades, IDs ni servicios.

| Prop | Uso |
|---|---|
| `onNavegar(destino)` | Solicita `primero`, `anterior`, `siguiente` o `ultimo`. |
| `puedeAnterior` | Habilita Primero y Anterior. |
| `puedeSiguiente` | Habilita Siguiente y Último. |
| `cargando` | Bloquea temporalmente los cuatro botones. |
| `atenuada` | Presenta en gris el grupo completo mientras una política de modo lo bloquee. |

```jsx
{
  id: "navegacion",
  separadorAntes: true,
  componente: (
    <ABMNavegacionRegistros
      onNavegar={navegar}
      puedeAnterior={navegacion.puedeAnterior}
      puedeSiguiente={navegacion.puedeSiguiente}
      cargando={cargando}
    />
  )
}
```

La pantalla coordinadora conecta la solicitud con la fuente que corresponda. Si el ABM fue abierto desde una grilla, la pantalla solicita el movimiento a la API pública de esa grilla y entrega al ABM el identificador de la fila resultante.

## ABMPieAcciones

Ruta: `src/components/ABM/ABMPieAcciones/ABMPieAcciones.jsx`.

| Prop | Uso |
|---|---|
| `onCancelar` | Descarta y cierra. |
| `onAplicar` | Guarda y mantiene el modal. |
| `onAceptar` | Guarda y cierra. |
| `aplicarDeshabilitado` | Deshabilita Aplicar. |
| `aceptarDeshabilitado` | Deshabilita Aceptar. |
| `textoCancelar`, `textoAplicar`, `textoAceptar` | Textos configurables. |
| `tituloDeshabilitado` | Explicación de acciones no disponibles. |
| `modo` | Consulta muestra solamente Cerrar; Alta muestra Cancelar/Aceptar; Edición conserva Cancelar/Aplicar/Aceptar. |

La visibilidad del sector de guardado se resuelve mediante `mostrarAccionesPieABM`: Consulta oculta Aplicar/Aceptar; Edición, Alta y Baja muestran Aceptar. `mostrarAplicarPieABM` oculta Aplicar durante el alta y lo conserva en Edición/Baja. La habilitación continúa siendo responsabilidad de la pantalla, porque una Baja sin endpoint todavía puede presentar las acciones deshabilitadas.

La semántica indicada es la predeterminada. Una excepción funcional debe quedar explícita en el requerimiento y en la documentación de la pantalla.

## Responsabilidad del modal consumidor

La pantalla construye el overlay, `role="dialog"`, `aria-modal`, asociación con `tituloID`, límites dentro del viewport, scroll, foco inicial, trampa de Tab y Escape.

También administra:

- estado y capa funcional;
- carga mediante APIs;
- validaciones;
- cuerpo y controles específicos;
- grilla de detalle;
- guardado, descarte y cierre;
- habilitación de acciones.

Para detalles con una cantidad acotada de renglones, el ABM puede activar `Grid.ajustarAlturaAContenido` y declarar una `alturaMinima`. Grid muestra todas las filas sin scrollbar vertical interno y el cuerpo general del modal absorbe el crecimiento. Las consultas extensas deben conservar la virtualización con su scroll vertical propio.

Los componentes comunes no deben importar servicios ni conocer entidades de negocio.

## Qué ya es reutilizable y qué todavía no

Actualmente son reutilizables:

- `MODO_ABM` y sus funciones de consulta;
- `ModalHeader` y `ABMIndicadorModo`;
- `ABMCintaAcciones`;
- `ABMNavegacionRegistros`;
- `ABMPieAcciones`;
- la API pública de Grid para confirmar una edición y navegar por su conjunto virtualizado.

La comparación contra un estado base, la normalización persistible y el descarte de filas temporales vacías están implementados actualmente dentro de `AsientosABM/abmAsientos.funcional.js`. El comportamiento es general, pero el código todavía contiene nombres y campos contables. Por eso se usa como referencia y no se copia a otro ABM.

Cuando se construya el segundo ABM con grilla, se debe extraer un seguidor de cambios configurable bajo `src/components/ABM`. Su contrato esperado debe cubrir, como mínimo:

```js
const seguimiento = crearSeguimientoCambiosABM({
  seleccionarCabecera,
  obtenerRenglones,
  identificarRenglon,
  seleccionarCamposRenglon,
  esRenglonTemporal,
  esRenglonVacio,
  normalizadores
});

seguimiento.establecerBase(estadoCargado);
seguimiento.hayCambios(estadoActual);
seguimiento.confirmarGuardado(estadoPersistido);
seguimiento.reiniciar();
```

Ese contrato separa la mecánica general de las decisiones propias de cada entidad. La extracción requiere revisión y aprobación antes de modificar el código existente.

## Ciclo funcional recomendado

### Carga

1. Recibir un modo explícito y, salvo en Alta, un ID de negocio.
2. Iniciar una carga identificable o cancelable.
3. Transformar la respuesta HTTP en estado funcional.
4. Establecer una copia independiente como estado base.
5. Publicar el estado completo de manera atómica.

### Edición

1. Verificar el permiso del campo y del modo en la capa funcional.
2. Aplicar el cambio al borrador.
3. Construir la instantánea persistible normalizada.
4. Compararla con la base y derivar `modificado`.
5. Publicar el nuevo estado.

### Guardado

1. Confirmar la edición activa de Grid.
2. Volver a obtener el estado funcional ya confirmado.
3. Omitir filas temporales completamente vacías.
4. Validar las filas que tengan cualquier contenido.
5. Si no hay diferencias reales, aplicar la semántica de Aplicar o Aceptar sin llamar a la API.
6. Construir el payload desde el modelo, nunca desde el DOM.
7. Bloquear doble envío, ejecutar POST o PUT y conservar los cambios ante un error.
8. Tras el éxito, recargar o adoptar la respuesta persistida y establecer una nueva base.

### Cancelación y baja

- Cancelar restaura o descarta el estado local sin persistir.
- La baja completa solicita confirmación antes de llamar al endpoint.
- Una baja exitosa define expresamente si cierra, queda sin registro o se posiciona sobre otro registro.
- La baja de una fila se mantiene local hasta Aplicar/Aceptar, salvo que el contrato de la pantalla indique una operación inmediata.

## Configuración que aporta cada pantalla

| Aspecto | Declaración de la pantalla |
|---|---|
| Modos | Transiciones permitidas y modo inicial. |
| Permisos | Campos editables de cabecera y detalle por modo. |
| Persistencia | Campos que forman la instantánea y el payload. |
| Normalización | Tratamiento de fechas, números, nulos, texto y entidades. |
| Renglones | ID persistido, clave temporal y criterio de fila vacía. |
| Validaciones | Reglas de negocio y mensajes. |
| Cinta | Acciones visibles, habilitadas y atenuadas. |
| Navegación | Fuente de IDs, límites y reacción ante cambios pendientes. |
| Servicios | GET, POST, PUT y DELETE con traducción uniforme de errores. |
| Resultado | Qué ocurre después de aplicar, aceptar, cancelar o borrar. |

## Lista de control para un ABM nuevo

- [ ] Recibe `MODO_ABM` explícito y usa una política central de permisos.
- [ ] Consulta rechaza mutaciones también en la capa funcional.
- [ ] El JSX no lee el DOM para construir estado o payload.
- [ ] Conserva una instantánea base independiente.
- [ ] Detecta cambios reales y reconoce valores restaurados.
- [ ] Confirma la edición activa de Grid antes de guardar.
- [ ] Una fila temporal vacía no habilita Aplicar ni se envía.
- [ ] Una fila parcialmente cargada se valida y no se descarta silenciosamente.
- [ ] Alta muestra solamente Cancelar/Aceptar; Edición verifica Aplicar y Aceptar con y sin cambios.
- [ ] Cancelar descarta altas, modificaciones y bajas locales.
- [ ] Los errores conservan el borrador y permiten reintentar.
- [ ] Las acciones se bloquean durante carga o guardado cuando corresponde.
- [ ] Navegación y respuestas asíncronas no mezclan registros.
- [ ] La cinta y el indicador se derivan del mismo modo.
- [ ] Alta no utiliza IDs persistidos ficticios.
- [ ] Borrar solicita confirmación y define el destino posterior.
- [ ] La capa funcional tiene pruebas independientes de React.
- [ ] La documentación indica reglas generales y reglas propias de la entidad.

## Ejemplo

```jsx
<ModalHeader
  titulo={`Asiento Nro. ${clave}`}
  tituloID="abmAsientosTitulo"
  onCerrar={cancelar}
  contenidoAdicional={<ABMIndicadorModo modo={modo} />}
/>

<ABMCintaAcciones acciones={acciones} ariaLabel="Acciones del asiento" />

<main>{/* contenido específico */}</main>

<ABMPieAcciones
  onCancelar={cancelar}
  onAplicar={aplicar}
  onAceptar={aceptar}
/>
```

## Verificación mínima

- Cierre por botón y Escape.
- Foco inicial y ciclo de Tab dentro del modal.
- Modal con contenido mayor y menor que el viewport.
- Cinta completa y acciones individuales deshabilitadas.
- Separadores, iconos, títulos y orden de acciones.
- Navegación con sus cuatro destinos, límites y bloqueo durante una carga.
- Cancelar, Aplicar y Aceptar con la visibilidad y semántica correspondiente a cada modo.
- Cambio y restauración de un campo de cabecera.
- Alta, modificación y baja local de renglones.
- Fila temporal vacía, parcialmente cargada y restaurada a vacío.
- Guardado con una celda todavía en edición.
- Aplicar y Aceptar sin cambios reales.
- Error de carga o persistencia sin pérdida del borrador.
- Respuestas superpuestas al navegar rápidamente.
