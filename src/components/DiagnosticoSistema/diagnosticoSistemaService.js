import { API_URL } from "../../config/AndromedaFrontConfig.js";

const TIEMPO_MAXIMO_FRONTEND_MS = 6500;

export function clasificarTiempo(tiempoMs) {
  if (tiempoMs < 1000) return "verde";
  if (tiempoMs <= 3000) return "amarillo";
  return "rojo";
}

export function obtenerEstadoGeneral(capas) {
  if (capas.some((capa) => capa.estado === "rojo")) return "rojo";
  if (capas.some((capa) => capa.estado === "amarillo")) return "amarillo";
  return "verde";
}

export async function consultarEstadoSistema() {
  const controlador = new AbortController();
  const temporizador = window.setTimeout(
    () => controlador.abort(),
    TIEMPO_MAXIMO_FRONTEND_MS
  );
  const inicio = performance.now();

  try {
    const respuesta = await fetch(`${API_URL}/api/diagnostico/capas`, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: controlador.signal
    });
    const datos = await respuesta.json().catch(() => null);

    if (!datos?.capas) {
      throw new Error(`La API respondió ${respuesta.status} sin información de diagnóstico.`);
    }

    const tiempoTotalFrontend = Math.round(performance.now() - inicio);
    const tiempoReact = Math.max(
      0,
      tiempoTotalFrontend - Number(datos.tiempoTotalBackendMs || 0)
    );

    const capas = [
      {
        nombre: "React",
        estado: clasificarTiempo(tiempoReact),
        tiempoMs: tiempoReact,
        mensaje: "La interfaz pudo ejecutar y procesar el diagnóstico."
      },
      ...datos.capas
    ];

    return {
      ...datos,
      estado: obtenerEstadoGeneral(capas),
      transactionId:
        datos.transactionId || respuesta.headers.get("X-Transaction-Id") || "",
      tiempoTotalFrontend,
      capas
    };
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error("La API no respondió dentro del tiempo máximo de 6,5 segundos.");
    }
    throw new Error("No se pudo establecer comunicación con la API.");
  } finally {
    window.clearTimeout(temporizador);
  }
}
