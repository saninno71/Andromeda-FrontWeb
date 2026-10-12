# Interpretación reutilizable de respuestas HTTP

## Propósito

`src/infraestructura/http/respuestaHttp.js` centraliza la interpretación de errores devueltos por las APIs. Los services de negocio continúan dentro de sus módulos y llaman a este módulo técnico cuando una respuesta HTTP no es exitosa.

## Contrato público

- `extraerMensajeErrorApi(error)`: interpreta un objeto ya deserializado. Prioriza el diccionario `errors` de ASP.NET, elimina duplicados y combina mensajes de varios campos. Como alternativas usa `detail`, `mensaje` y `title`.
- `obtenerMensajeErrorHttp(response, mensajeAlternativo)`: lee una respuesta fallida una sola vez, interpreta JSON o texto plano y devuelve el mensaje alternativo cuando el cuerpo no aporta información.
- `crearErrorHttp(response, mensajeAlternativo)`: construye el objeto `Error` que propaga el service consumidor.

## Uso

```js
import { crearErrorHttp } from "../../infraestructura/http/respuestaHttp.js";

const response = await fetch(url, opciones);
if (!response.ok) {
    throw await crearErrorHttp(
        response,
        `No se pudo completar la operación (${response.status}).`
    );
}
```

El módulo no realiza solicitudes, no conoce entidades de negocio y no decide cómo se presenta el mensaje. Cada service conserva su política de propagación o recuperación. Un service de búsqueda puede registrar el error y devolver una lista vacía; un ABM puede propagarlo para mostrarlo en su panel.

## Respuestas admitidas

```json
{
  "title": "One or more validation errors occurred.",
  "errors": {
    "Detalle": ["El detalle es obligatorio."]
  }
}
```

El resultado es `El detalle es obligatorio.`. También se admiten Problem Details con `detail`, objetos con `mensaje`, respuestas con `title` y cuerpos de texto plano.

## Consumidores actuales

- Consulta y ABM de Asientos.
- Búsqueda de cuentas.
- Búsqueda de clientes.
- Búsqueda de proveedores.

El diagnóstico del sistema mantiene su lector especializado porque HTTP 503 puede contener un informe válido por capas. Los services respaldados por JSON local y el login simulado no consumen respuestas HTTP.

## Verificación

```sh
node --test src/infraestructura/http/respuestaHttp.test.mjs
```

Las pruebas cubren validaciones ASP.NET, combinación y deduplicación de campos, alternativas estructuradas, texto plano y ausencia de contenido.
