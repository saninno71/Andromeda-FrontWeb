import test from "node:test";
import assert from "node:assert/strict";

import {
    milimetrosAPixeles,
    pixelesAMilimetros
} from "./configuracionInforme.columnas.js";

test("convierte anchos de pantalla a milímetros para su edición", () => {
    assert.equal(pixelesAMilimetros(96), 25);
    assert.equal(pixelesAMilimetros(60), 16);
});

test("convierte milímetros editados al ancho interno de la grilla", () => {
    assert.equal(milimetrosAPixeles(25.4), 96);
    assert.equal(milimetrosAPixeles(16), 60);
});
