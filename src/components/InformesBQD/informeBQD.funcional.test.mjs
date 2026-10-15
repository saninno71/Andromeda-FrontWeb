import assert from "node:assert/strict";
import test from "node:test";

import {
    agruparColumnasInforme,
    aplicarLayoutColumnasInforme,
    prepararFilasInformeBQD,
    truncarTextoAlAncho
} from "./informeBQD.funcional.js";

test("el informe respeta el orden y ancho actuales y omite columnas ocultas", () => {
    const columnas = [
        { campo:"a", visible:true, ancho:100, formato:"texto" },
        { campo:"b", visible:false, ancho:100, formato:"texto" },
        { campo:"c", visible:true, ancho:100, formato:"texto" }
    ];
    const resultado = aplicarLayoutColumnasInforme(columnas, [
        { campo:"c", ancho:180 },
        { campo:"a", ancho:90 }
    ]);
    assert.deepEqual(resultado.map(columna => columna.campo), ["c", "a"]);
    assert.deepEqual(resultado.map(columna => columna.ancho), [180, 90]);
});

test("el informe omite una columna visible quitada desde la configuración", () => {
    const columnas = [
        { campo:"a", visible:true, ancho:100, formato:"texto" },
        { campo:"b", visible:true, ancho:100, formato:"texto" },
        { campo:"id", visible:false, ancho:100, formato:"entero" }
    ];
    const resultado = aplicarLayoutColumnasInforme(columnas, [
        { campo:"a", ancho:90, visible:true },
        { campo:"b", ancho:120, visible:false }
    ]);
    assert.deepEqual(resultado.map(columna => columna.campo), ["a"]);
});

test("el informe conserva la opción de ajustar texto por columna", () => {
    const resultado = aplicarLayoutColumnasInforme([
        { campo:"a", visible:true, ancho:100, desdoblarTexto:false }
    ], [
        { campo:"a", ancho:90, visible:true, desdoblarTexto:true }
    ]);
    assert.equal(resultado[0].desdoblarTexto, true);
});

test("trunca el texto al ancho disponible cuando no debe ajustarse", () => {
    const medirTexto = (texto) => texto.length * 10;
    assert.equal(truncarTextoAlAncho("Texto largo", 55, medirTexto), "Texto");
    assert.equal(truncarTextoAlAncho("Corto", 55, medirTexto), "Corto");
});

test("las columnas se distribuyen en varias líneas conservando el orden", () => {
    const columnas = ["a", "b", "c"].map(campo => ({ campo, ancho:60 }));
    const lineas = agruparColumnasInforme(columnas, 120);
    assert.deepEqual(lineas.map(linea => linea.map(columna => columna.campo)), [["a", "b"], ["c"]]);
});

test("el informe aplica búsqueda y orden vigentes", () => {
    const columnas = [
        { campo:"nombre", formato:"texto", mascara:"" },
        { campo:"importe", formato:"decimal", mascara:"0.0,00" }
    ];
    const filas = [
        { nombre:"Beta", importe:10 },
        { nombre:"Alfa", importe:20 },
        { nombre:"Otro", importe:30 }
    ];
    const resultado = prepararFilasInformeBQD({
        filas,
        columnas,
        busqueda:"a",
        orden:[{ campo:"nombre", direccion:"asc" }]
    });
    assert.deepEqual(resultado.map(fila => fila.nombre), ["Alfa", "Beta"]);
});
