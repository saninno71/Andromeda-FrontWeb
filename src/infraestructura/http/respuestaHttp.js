function normalizarMensajesValidacion(valor) {
    const mensajes = Array.isArray(valor) ? valor : [valor];
    return mensajes
        .filter(mensaje => typeof mensaje === "string" && mensaje.trim() !== "")
        .map(mensaje => mensaje.trim());
}

export function extraerMensajeErrorApi(error) {
    const mensajesValidacion = error?.errors && typeof error.errors === "object"
        ? Object.values(error.errors).flatMap(normalizarMensajesValidacion)
        : [];
    const mensajesUnicos = [...new Set(mensajesValidacion)];
    if (mensajesUnicos.length > 0) return mensajesUnicos.join(" ");

    for (const candidato of [error?.detail, error?.mensaje, error?.title]) {
        if (typeof candidato === "string" && candidato.trim() !== "") {
            return candidato.trim();
        }
    }
    return null;
}

export async function obtenerMensajeErrorHttp(response, mensajeAlternativo) {
    try {
        const texto = await response.text();
        if (texto.trim() !== "") {
            try {
                const mensajeJson = extraerMensajeErrorApi(JSON.parse(texto));
                if (mensajeJson) return mensajeJson;
            } catch {
                return texto.trim();
            }
        }
    } catch {
        // La respuesta puede no exponer un cuerpo legible.
    }

    return mensajeAlternativo || `La API respondió con estado ${response.status}.`;
}

export async function crearErrorHttp(response, mensajeAlternativo) {
    return new Error(await obtenerMensajeErrorHttp(response, mensajeAlternativo));
}
