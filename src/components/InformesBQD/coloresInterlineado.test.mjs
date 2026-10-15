import assert from "node:assert/strict";
import test from "node:test";

import {
    COLOR_INTERLINEADO_PREDETERMINADO,
    normalizarColorInterlineado
} from "./coloresInterlineado.js";

test("conserva un color de interlineado válido", () => {
    assert.equal(normalizarColorInterlineado("LightSalmon"), "LightSalmon");
});

test("normaliza el nombre del color sin depender de mayúsculas", () => {
    assert.equal(normalizarColorInterlineado("lightgray"), "LightGray");
});

test("usa LightGray ante un color de interlineado inválido", () => {
    assert.equal(normalizarColorInterlineado("color-inexistente"), COLOR_INTERLINEADO_PREDETERMINADO);
});
