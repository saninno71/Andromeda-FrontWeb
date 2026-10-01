import test from "node:test";
import assert from "node:assert/strict";
import { aplicarDependenciasColumnasCalculadas, obtenerValorColumna } from "./gridValores.js";
import { filtrarDatosPorTexto } from "./gridBusqueda.js";
import { ordenarDatos } from "./gridOrdenamiento.js";
import { calcularTotalesGrid } from "./gridTotales.js";

const columnaCalculada = {
    campo: "saldo",
    tipo: "calculada",
    dependencias: ["debe", "haber"],
    calcular: (fila, contexto) =>
        (Number(fila.debe || 0) - Number(fila.haber || 0)) * contexto.factor,
    formato: "decimal",
    mascara: "0.0,00",
    suma: true
};

test("una columna calculada respeta el valor informado por el endpoint", () => {
    const fila = { debe: 100, haber: 20, saldo: 75 };
    assert.equal(obtenerValorColumna(fila, columnaCalculada, { factor: 2 }), 75);
});

test("una columna calculada usa la función cuando el valor no está informado", () => {
    assert.equal(obtenerValorColumna({ debe: 100, haber: 20 }, columnaCalculada, { factor: 2 }), 160);
    assert.equal(obtenerValorColumna({ debe: 100, haber: 20, saldo: null }, columnaCalculada, { factor: 2 }), 160);
});

test("cambiar una dependencia invalida el valor informado y restaurarla lo recupera", () => {
    const original = { debe: 100, haber: 20, saldo: 75 };
    const modificado = aplicarDependenciasColumnasCalculadas({
        filaOriginal: original,
        filaDraft: { ...original, haber: 30 },
        columnas: [columnaCalculada]
    });
    assert.equal(modificado.saldo, null);
    assert.equal(obtenerValorColumna(modificado, columnaCalculada, { factor: 1 }), 70);

    const restaurado = aplicarDependenciasColumnasCalculadas({
        filaOriginal: original,
        filaDraft: { ...modificado, haber: 20 },
        columnas: [columnaCalculada]
    });
    assert.equal(restaurado.saldo, 75);
});

test("búsqueda, ordenamiento y totales utilizan el valor calculado", () => {
    const filas = [
        { id: 1, debe: 100, haber: 20 },
        { id: 2, debe: 10, haber: 30, saldo: -15 }
    ];

    const contextoCalculos = { factor: 1 };
    assert.deepEqual(filtrarDatosPorTexto(filas, [columnaCalculada], "80,00", contextoCalculos), [filas[0]]);
    assert.deepEqual(ordenarDatos(filas, [{ campo: "saldo", direccion: "asc" }], [columnaCalculada], contextoCalculos), [filas[1], filas[0]]);

    const totales = calcularTotalesGrid({
        columnas: [columnaCalculada],
        filas,
        keysSeleccionadas: [],
        keysSeleccionadasSet: new Set(),
        armarKeyFila: fila => String(fila.id),
        contextoCalculos
    });
    assert.deepEqual(totales, [{ campo: "saldo", total: 65 }]);
});
