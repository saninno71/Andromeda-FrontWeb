import assert from "node:assert/strict";
import test from "node:test";

import { prepararParametrosInformeAsientos } from "./asientos.informes.js";

test("prepara todos los parámetros del informe sin depender del JSX", async () => {
    const fila = { comprobanteID:7, monedaCodigo:"ARS", numero:123 };
    const renglon = { renglonID:10, debe:50, haber:null };
    const modelo = {
        prepararDatosInforme: async opciones => {
            assert.deepEqual(opciones, { todosLosRegistros:false });
            return {
                filas:[fila],
                filtrosAplicados:{ detalle:"Prueba", numeroDesde:10, numeroHasta:20 },
                vista:{ busqueda:"123", orden:[{ campo:"numero", direccion:"asc" }] },
                generadoEn:"2026-10-11T12:00:00.000Z"
            };
        }
    };
    const layoutColumnas = [{ campo:"numero", ancho:95 }];
    const configuracionDetalle = {
        layoutColumnas:[{ campo:"debe", ancho:80, visible:true }],
        imprimirTitulos:false,
        imprimirTotales:false
    };
    const idsCargados = [];

    const resultado = await prepararParametrosInformeAsientos(modelo, {
        todosLosRegistros:false,
        titulo:"Contabilidad - Asientos",
        layoutColumnas,
        interlineado:"LightSalmon",
        versionAplicacion:"1.0.0",
        configuracionDetalle,
        cargarDetalleAsiento:async comprobanteID => {
            idsCargados.push(comprobanteID);
            return {
                cargado:true,
                error:null,
                renglones:[renglon],
                tipoCambioLocal:1,
                tipoCambioReferencia:2
            };
        }
    });

    assert.equal(resultado.titulo, "Contabilidad - Asientos");
    assert.equal(resultado.columnas.length, 40);
    assert.deepEqual(resultado.layoutColumnas, layoutColumnas);
    assert.equal(resultado.interlineado, "LightSalmon");
    assert.equal(resultado.versionAplicacion, "1.0.0");
    assert.deepEqual(idsCargados, [7]);
    assert.equal(resultado.filas[0].comprobanteID, 7);
    assert.equal(resultado.filas[0].subgrillas.length, 1);
    assert.equal(resultado.filas[0].subgrillas[0].columnas.length, 23);
    assert.equal(resultado.filas[0].subgrillas[0].mostrarTitulo, false);
    assert.deepEqual(
        resultado.filas[0].subgrillas[0].layoutColumnas,
        configuracionDetalle.layoutColumnas
    );
    assert.equal(resultado.filas[0].subgrillas[0].mostrarTitulos, false);
    assert.equal(resultado.filas[0].subgrillas[0].mostrarTotales, false);
    assert.deepEqual(resultado.filas[0].subgrillas[0].filas, [renglon]);
    assert.deepEqual(resultado.filas[0].subgrillas[0].contextoCalculos, {
        cotizacionLocal:1,
        cotizacionReferencia:2
    });
    assert.equal(
        resultado.filtros,
        "<Detalle: Prueba> <Desde número: 10> <Hasta número: 20>"
    );
    assert.equal(resultado.busqueda, "123");
    assert.deepEqual(resultado.orden, [{ campo:"numero", direccion:"asc" }]);
    assert.equal(resultado.generadoEn, "2026-10-11T12:00:00.000Z");
});

test("omite la grilla principal y no carga detalles cuando fue excluida", async () => {
    const modelo = {
        prepararDatosInforme:async () => ({
            filas:[{ comprobanteID:1, numero:100 }],
            filtrosAplicados:{},
            vista:{ busqueda:"", orden:[] },
            generadoEn:"2026-10-11T12:00:00.000Z"
        })
    };
    let cargasDetalle = 0;

    const resultado = await prepararParametrosInformeAsientos(modelo, {
        incluirGrilla:false,
        incluirDetalle:false,
        cargarDetalleAsiento:async () => {
            cargasDetalle += 1;
            return {};
        }
    });

    assert.deepEqual(resultado.columnas, []);
    assert.deepEqual(resultado.filas, []);
    assert.equal(cargasDetalle, 0);
});

test("carga detalles únicos solamente para las filas alcanzadas por la búsqueda", async () => {
    const filas = [
        { comprobanteID:1, numero:100, monedaCodigo:"ARS" },
        { comprobanteID:2, numero:200, monedaCodigo:"USD" },
        { comprobanteID:2, numero:200, monedaCodigo:"USD" }
    ];
    const modelo = {
        prepararDatosInforme:async () => ({
            filas,
            filtrosAplicados:{},
            vista:{ busqueda:"200", orden:[] },
            generadoEn:"2026-10-11T12:00:00.000Z"
        })
    };
    const idsCargados = [];

    const resultado = await prepararParametrosInformeAsientos(modelo, {
        cargarDetalleAsiento:async comprobanteID => {
            idsCargados.push(comprobanteID);
            return {
                cargado:true,
                error:null,
                renglones:[],
                tipoCambioLocal:1,
                tipoCambioReferencia:1
            };
        }
    });

    assert.deepEqual(idsCargados, [2]);
    assert.equal(resultado.filas[0].subgrillas, undefined);
    assert.equal(resultado.filas[1].subgrillas.length, 1);
    assert.equal(resultado.filas[2].subgrillas.length, 1);
});
