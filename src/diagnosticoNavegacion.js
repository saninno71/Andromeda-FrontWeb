const CLAVE_DIAGNOSTICO = "andromeda:diagnostico-navegacion";
const MAXIMO_EVENTOS = 100;

function leerEventos() {
    try {
        const valor = JSON.parse(localStorage.getItem(CLAVE_DIAGNOSTICO) ?? "[]");
        return Array.isArray(valor) ? valor : [];
    } catch {
        return [];
    }
}

function registrarEvento(tipo, detalle = {}) {
    const eventos = leerEventos();
    const evento = {
        fecha: new Date().toISOString(),
        tipo,
        ...detalle
    };

    eventos.push(evento);
    localStorage.setItem(
        CLAVE_DIAGNOSTICO,
        JSON.stringify(eventos.slice(-MAXIMO_EVENTOS))
    );
    console.info("[Diagnóstico navegación]", evento);
}

export function iniciarDiagnosticoNavegacion() {
    const navegacion = performance.getEntriesByType("navigation")[0];
    const eventosAnteriores = leerEventos();
    const eventoAnterior = eventosAnteriores.at(-1) ?? null;

    registrarEvento("inicio-react", {
        tipoNavegacion: navegacion?.type ?? "desconocido",
        descartadaPorNavegador: document.wasDiscarded === true,
        restauradaDesdeCache: navegacion?.type === "back_forward",
        visibilidad: document.visibilityState,
        eventoAnterior: eventoAnterior?.tipo ?? null,
        fechaEventoAnterior: eventoAnterior?.fecha ?? null
    });

    window.addEventListener("beforeunload", () => {
        registrarEvento("beforeunload");
    });

    window.addEventListener("pagehide", evento => {
        registrarEvento("pagehide", {
            conservadaEnCache: evento.persisted === true
        });
    });

    window.addEventListener("pageshow", evento => {
        registrarEvento("pageshow", {
            restauradaDesdeCache: evento.persisted === true,
            descartadaPorNavegador: document.wasDiscarded === true
        });
    });

    document.addEventListener("visibilitychange", () => {
        registrarEvento("visibilitychange", {
            visibilidad: document.visibilityState
        });
    });

    if (import.meta.hot) {
        import.meta.hot.on("vite:beforeFullReload", () => {
            registrarEvento("vite-full-reload");
        });
        import.meta.hot.on("vite:error", error => {
            registrarEvento("vite-error", {
                mensaje: error?.err?.message ?? error?.message ?? "Error de Vite"
            });
        });
    }

    Object.defineProperty(window, "__andromedaDiagnosticoNavegacion", {
        configurable: true,
        value: {
            clave: CLAVE_DIAGNOSTICO,
            obtener: leerEventos,
            limpiar() {
                localStorage.removeItem(CLAVE_DIAGNOSTICO);
            }
        }
    });
}
