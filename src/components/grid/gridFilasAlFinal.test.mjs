import assert from "node:assert/strict";
import test from "node:test";
import { separarFilasAlFinal } from "./gridFilasAlFinal.js";

test("separa sólo filas que ya pertenecen a dataGrid y conserva sus referencias", () => {
    const filas = [{ id:1 }, { id:2 }, { id:3 }];
    const inexistente = { id:99 };
    const resultado = separarFilasAlFinal(
        filas,
        [filas[1], inexistente],
        fila => fila.id
    );

    assert.deepEqual(resultado.base, [filas[0], filas[2]]);
    assert.deepEqual(resultado.alFinal, [filas[1]]);
    assert.equal(resultado.alFinal[0], filas[1]);
});
