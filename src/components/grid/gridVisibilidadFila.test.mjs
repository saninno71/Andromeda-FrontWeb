import assert from "node:assert/strict";
import test from "node:test";
import {
    calcularScrollFilaVisible,
    calcularScrollIndiceFila
} from "./gridVisibilidadFila.js";

test("corrige una fila recortada debajo del viewport", () => {
    assert.equal(calcularScrollFilaVisible({
        scrollTop:900,
        scrollMaximo:2000,
        filaSuperior:480,
        filaInferior:515,
        limiteSuperior:100,
        limiteInferior:500,
        margen:4
    }), 919);
});

test("mantiene una fila completamente visible y limita el scroll máximo", () => {
    assert.equal(calcularScrollFilaVisible({
        scrollTop:900,
        scrollMaximo:2000,
        filaSuperior:200,
        filaInferior:230,
        limiteSuperior:100,
        limiteInferior:500
    }), 900);
    assert.equal(calcularScrollFilaVisible({
        scrollTop:1995,
        scrollMaximo:2000,
        filaSuperior:480,
        filaInferior:515,
        limiteSuperior:100,
        limiteInferior:500
    }), 2000);
});

test("usa la altura real y lleva el último registro al máximo real", () => {
    assert.equal(calcularScrollIndiceFila({
        indice:980,
        cantidadFilas:981,
        altoFila:30.6,
        altoViewport:300,
        scrollActual:0,
        scrollMaximo:29718.6
    }), 29718.6);

    assert.equal(calcularScrollIndiceFila({
        indice:500,
        cantidadFilas:981,
        altoFila:30.6,
        altoViewport:300,
        scrollActual:0,
        scrollMaximo:29718.6
    }), 15030.6);
});
