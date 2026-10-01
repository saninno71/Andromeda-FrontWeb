import assert from "node:assert/strict";
import test from "node:test";
import {
    analizarTextoEditorDecimal,
    calcularCursorEditorDecimal,
    formatearValorEditorDecimal,
    obtenerDecimalesMascara
} from "./gridEditorDecimal.js";

test("formatea el valor decimal al entrar en edición", () => {
    assert.equal(formatearValorEditorDecimal(4425070.24, "0.0,00"), "4.425.070,24");
    assert.equal(formatearValorEditorDecimal(null, "0.0,00"), "");
    assert.equal(obtenerDecimalesMascara("0.0,0000"), 4);
});

test("agrupa miles mientras se escribe y conserva un valor numérico", () => {
    assert.deepEqual(
        analizarTextoEditorDecimal("5454545454", "0.0,00"),
        { texto: "5.454.545.454", valor: 5454545454 }
    );
    assert.deepEqual(
        analizarTextoEditorDecimal("1.234.567,8", "0.0,00"),
        { texto: "1.234.567,8", valor: 1234567.8 }
    );
});

test("limita decimales, admite negativos y convierte vacío en null", () => {
    assert.deepEqual(
        analizarTextoEditorDecimal("-12.345,678", "0.0,00"),
        { texto: "-12.345,67", valor: -12345.67 }
    );
    assert.deepEqual(analizarTextoEditorDecimal("", "0.0,00"), { texto: "", valor: null });
});

test("reubica el cursor considerando los separadores agregados", () => {
    assert.equal(calcularCursorEditorDecimal("1234", 4, "1.234"), 5);
    assert.equal(calcularCursorEditorDecimal("1234,5", 6, "1.234,5"), 7);
});
