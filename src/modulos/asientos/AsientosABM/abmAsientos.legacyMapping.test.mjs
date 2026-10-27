import assert from "node:assert/strict";
import test from "node:test";
import {
    crearSnapshotLegacyAsiento,
    LEGACY_CONTRACT_VERSION,
    LEGACY_FORM_NAME
} from "./abmAsientos.legacyMapping.js";

const estado = {
    comprobanteID: 100,
    empresa: { empresaID: 1, empresaCodigo: "EQ", empresaNombre: "Empresa de prueba" },
    fecha: new Date(2026, 9, 17),
    detalle: "Asiento de prueba",
    observaciones: "Observación",
    modeloAsiento: null,
    moneda: { monedaID: 1, monedaCodigo: "ARS", monedaNombre: "Pesos Argentinos" },
    numeracion: { numeraTipoID: 81, descripcion: "AS" },
    puntoVenta: 1,
    numero: 40,
    entidadesExternas: {
        empresa: {
            empresaID: 1,
            estado: "cargado",
            datos: {
                empresaID: 1,
                empresaCodigo: "EQ",
                empresaNombre: "Empresa de prueba",
                domicilio: "Calle de prueba 123",
                cp: "1000",
                provinciaNombre: "Buenos Aires",
                telefono1: "11-4000-1000",
                tipoTelefono1: "Tel.",
                paisNombre: "Argentina",
                web: "https://empresa.test"
            },
            error: null
        }
    },
    renglones: [{
        renglonID: 10,
        empresaID: 1,
        cuentaID: 5,
        cuentaCodigo: "1.1.1.01",
        cuentaNombre: "Caja",
        subcuentaTipo: 0,
        subcuentaNombre: "",
        tipo: 1,
        debe: 125.5,
        haber: null,
        debeLocal: 125.5,
        haberLocal: null,
        debeReferencia: 0.1,
        haberReferencia: null,
        detalle: "Detalle de línea",
        clienteID: null,
        clienteCodigo: "",
        proveedorID: null,
        proveedorCodigo: "",
        cajaID: null,
        cajaCodigo: "",
        jurisdiccionID: null,
        jurisdiccionCodigo: "",
        jurisdiccionNombre: "",
        vendedorID: null,
        vendedorCodigo: "",
        vendedorNombre: "",
        cobradorID: null,
        cobradorCodigo: "",
        cobradorNombre: ""
    }]
};

test("crea la identidad legacy de ABM Asientos sin leer la interfaz", () => {
    const snapshot = crearSnapshotLegacyAsiento(estado, { copies: 2 });

    assert.equal(snapshot.contractVersion, LEGACY_CONTRACT_VERSION);
    assert.equal(snapshot.formNameLegacy, LEGACY_FORM_NAME);
    assert.equal(snapshot.formNameLegacy, "frmctbAsientosABM");
    assert.equal("identity" in snapshot, false);
    assert.equal("printOptions" in snapshot, false);
    const copias = snapshot.controls.find(item => item.name === "txx" && item.index === 26);
    assert.equal(copias.value, "2");
});

test("conserva los nombres e índices de los controles VB6", () => {
    const snapshot = crearSnapshotLegacyAsiento(estado);
    const control = (name, index) => snapshot.controls.find(item => item.name === name && item.index === index);

    assert.equal(control("fch", 0).value, "17/10/2026");
    assert.equal(control("txx", 1).value, "Asiento de prueba");
    assert.equal(control("cmb", 3).value, "Empresa de prueba");
    assert.equal(control("cmb", 3).selectedId, 1);
    assert.equal(control("txx", 6).value, "ARS");
    assert.equal(control("nom", 6).value, "Pesos Argentinos");
    assert.equal(control("txx", 26).value, "1");
});

test("arma la grilla de 37 columnas en el orden de ctbAsientosABM", () => {
    const snapshot = crearSnapshotLegacyAsiento(estado);
    const grid = snapshot.grids[0];

    assert.equal(grid.name, "grd");
    assert.equal(grid.index, 0);
    assert.equal(grid.columns.length, 37);
    assert.equal(grid.columns[7].title, "Debe");
    assert.equal(grid.columns[24].field, "haberReferencia");
    assert.equal(grid.rows[0].cells[1].value, 100);
    assert.equal(grid.rows[0].cells[3].value, "1.1.1.01");
    assert.equal(grid.rows[0].cells[7].value, 125.5);
});

test("informa datos legacy que todavía no existen en el estado React", () => {
    const snapshot = crearSnapshotLegacyAsiento(estado);

    assert.ok(snapshot.diagnostics.missingStateFields.includes("renglones[].impAplicado"));
    assert.ok(snapshot.diagnostics.missingStateFields.includes("renglones[].vtsComprobanteID"));
    assert.ok(snapshot.diagnostics.missingStateFields.includes("renglones[].ivaCategoriaID"));
});

test("incluye los tres objetos agregados por ValidarImprimir", () => {
    const snapshot = crearSnapshotLegacyAsiento(estado);

    assert.deepEqual(
        snapshot.objects.map(object => object.source),
        ["abmEmpresa.MatrizCampos", "abmNumeraTipo.MatrizCampos", "abmMoneda.MatrizCampos"]
    );

    const empresa = snapshot.objects.find(object => object.legacyClass === "abmgnrEmpresa");
    const campo = name => empresa.fields.find(field => field.name === name)?.value;
    assert.equal(campo("abmgnrempresa.domicilio"), "Calle de prueba 123");
    assert.equal(campo("abmgnrempresa.cp"), "1000");
    assert.equal(campo("abmgnrempresa.provincianombre"), "Buenos Aires");
    assert.equal(campo("abmgnrempresa.telefono1"), "11-4000-1000");
    assert.equal(campo("abmgnrempresa.tipotelefono1"), "Tel.");
    assert.equal(campo("abmgnrempresa.paisnombre"), "Argentina");
    assert.equal(campo("abmgnrempresa.web"), "https://empresa.test");
});
