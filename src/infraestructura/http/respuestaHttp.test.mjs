import assert from "node:assert/strict";
import test from "node:test";
import {
    extraerMensajeErrorApi,
    obtenerMensajeErrorHttp
} from "./respuestaHttp.js";

test("prioriza el mensaje específico de validación sobre el título genérico", () => {
    const mensaje = extraerMensajeErrorApi({
        title: "One or more validation errors occurred.",
        errors: {
            Detalle: ["El detalle es obligatorio."]
        }
    });

    assert.equal(mensaje, "El detalle es obligatorio.");
});

test("combina sin duplicados los mensajes de varios campos", () => {
    const mensaje = extraerMensajeErrorApi({
        title: "One or more validation errors occurred.",
        errors: {
            Detalle: ["El detalle es obligatorio."],
            MonedaId: ["La moneda es obligatoria.", "El detalle es obligatorio."]
        }
    });

    assert.equal(mensaje, "El detalle es obligatorio. La moneda es obligatoria.");
});

test("conserva detail, mensaje y title como alternativas", () => {
    assert.equal(extraerMensajeErrorApi({ detail: "Detalle remoto" }), "Detalle remoto");
    assert.equal(extraerMensajeErrorApi({ mensaje: "Mensaje remoto" }), "Mensaje remoto");
    assert.equal(extraerMensajeErrorApi({ title: "Título remoto" }), "Título remoto");
});

test("interpreta cuerpos de texto y usa el mensaje alternativo cuando no hay contenido", async () => {
    assert.equal(
        await obtenerMensajeErrorHttp({ status: 500, text: async () => "Error textual" }, "Alternativo"),
        "Error textual"
    );
    assert.equal(
        await obtenerMensajeErrorHttp({ status: 503, text: async () => "" }, "Servicio no disponible"),
        "Servicio no disponible"
    );
});
