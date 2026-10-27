import assert from "node:assert/strict";
import test from "node:test";
import {
    MODO_ABM,
    mostrarAccionesPieABM,
    mostrarAplicarPieABM,
    obtenerDisponibilidadAccionesRegistroABM
} from "../../../components/ABM/modosABM.js";
import { crearABMAsientos, formatearCotizacion } from "./abmAsientos.funcional.js";
import { obtenerPresentacionCintaAsientos } from "./abmAsientos.cinta.js";
import { MENSAJE_ASIENTO_DESBALANCEADO } from "./abmAsientos.validaciones.js";
import { desplazarCuerpoABMAlError } from "../../../components/ABM/useScrollErrorABM.js";

const respuesta = {
    id: 100,
    fecha: "2026-09-21",
    fechaEmision: "2026-09-21",
    empresaId: 1,
    numeraTipoId: 81,
    numero: 1062,
    monedaId: 1,
    monedaCodigo: "ARS",
    cotizacionLocal: 1,
    cotizacionReferencia: 1000,
    detalle: "Original",
    monedaNombre: "Pesos Argentinos",
    lineas: [{
        id: 10,
        cuentaId: 1,
        cuentaCodigo: "1.1",
        cuentaNombre: "Caja",
        tipo: 1,
        importe: 50,
        impLocal: 50,
        impReferencia: 1,
        detalle: "Renglón original",
        clienteId: 20,
        clienteCodigo: "200",
        clienteNombre: "Cliente original"
    }]
};

const cargarAsiento = async () => structuredClone(respuesta);
const actualizarAsiento = async () => {};

const cargarEmpresaDetalle = async empresaID => ({
    empresaID,
    empresaCodigo: "EQ",
    empresaNombre: "Empresa completa",
    domicilio: "Calle de prueba 123",
    cp: "1000",
    provinciaNombre: "Buenos Aires",
    paisNombre: "Argentina",
    tipoTelefono1: "Tel.",
    telefono1: "11-4000-1000",
    web: "https://empresa.test"
});

test("el comportamiento general de ABM lleva el cuerpo al error sin moverlo horizontalmente", () => {
    const cuerpo = { scrollTop: 480, scrollLeft: 37 };
    desplazarCuerpoABMAlError(cuerpo);

    assert.equal(cuerpo.scrollTop, 0);
    assert.equal(cuerpo.scrollLeft, 37);
});

test("las cotizaciones se presentan con miles y cuatro decimales sin alterar el dato", () => {
    assert.equal(formatearCotizacion(1), "1,0000");
    assert.equal(formatearCotizacion(1520.5), "1.520,5000");
    assert.equal(formatearCotizacion(""), "");
});

test("la política general de cinta bloquea las acciones incompatibles con cada modo", () => {
    const consulta = obtenerDisponibilidadAccionesRegistroABM(MODO_ABM.CONSULTA);
    assert.deepEqual(consulta, {
        nuevo: true,
        editar: true,
        eliminar: true,
        visualizar: true,
        navegar: true
    });

    const edicionGeneral = obtenerDisponibilidadAccionesRegistroABM(MODO_ABM.EDICION);
    assert.deepEqual(edicionGeneral, {
        nuevo: false,
        editar: true,
        eliminar: false,
        visualizar: false,
        navegar: true
    });

    const altaGeneral = obtenerDisponibilidadAccionesRegistroABM(MODO_ABM.ALTA);
    assert.deepEqual(altaGeneral, {
        nuevo: false,
        editar: false,
        eliminar: false,
        visualizar: false,
        navegar: false
    });
});

test("la cinta de Asientos consume la política general de acciones por modo", () => {
    const alta = obtenerPresentacionCintaAsientos(MODO_ABM.ALTA);
    assert.equal(alta.deshabilitarNuevo, true);
    assert.equal(alta.deshabilitarEdicion, true);
    assert.equal(alta.deshabilitarEliminacion, true);
    assert.equal(alta.deshabilitarConsulta, true);
    assert.equal(alta.deshabilitarNavegacion, true);

    const edicion = obtenerPresentacionCintaAsientos(MODO_ABM.EDICION);
    assert.equal(edicion.deshabilitarNuevo, true);
    assert.equal(edicion.deshabilitarEdicion, false);
    assert.equal(edicion.deshabilitarEliminacion, true);
    assert.equal(edicion.deshabilitarConsulta, true);
    assert.equal(edicion.deshabilitarNavegacion, false);
});

test("el pie general oculta Aplicar durante el alta", () => {
    assert.equal(mostrarAccionesPieABM(MODO_ABM.CONSULTA), false);
    assert.equal(mostrarAccionesPieABM(MODO_ABM.EDICION), true);
    assert.equal(mostrarAccionesPieABM(MODO_ABM.ALTA), true);
    assert.equal(mostrarAccionesPieABM(MODO_ABM.BAJA), true);
    assert.equal(mostrarAplicarPieABM(MODO_ABM.CONSULTA), false);
    assert.equal(mostrarAplicarPieABM(MODO_ABM.EDICION), true);
    assert.equal(mostrarAplicarPieABM(MODO_ABM.ALTA), false);
    assert.equal(mostrarAplicarPieABM(MODO_ABM.BAJA), true);
});

test("el modelo conserva las transiciones explícitas entre consulta, edición y baja", async () => {
    const modelo = crearABMAsientos({ comprobanteID: 100, modo: MODO_ABM.EDICION, cargarAsiento, actualizarAsiento });
    await modelo.cargar();

    assert.equal(modelo.cambiarModo(MODO_ABM.CONSULTA), true);
    assert.equal(modelo.obtenerEstado().modo, MODO_ABM.CONSULTA);
    assert.equal(modelo.cambiarModo(MODO_ABM.EDICION), true);
    assert.equal(modelo.obtenerEstado().modo, MODO_ABM.EDICION);
    assert.equal(modelo.cambiarModo(MODO_ABM.BAJA), true);
    assert.equal(modelo.obtenerEstado().modo, MODO_ABM.BAJA);
});

test("el encabezado conserva el número cargado mientras se edita el borrador", async () => {
    const modelo = crearABMAsientos({
        comprobanteID: 100,
        modo: MODO_ABM.EDICION,
        cargarAsiento,
        actualizarAsiento
    });
    await modelo.cargar();

    assert.equal(modelo.obtenerEstado().claveEncabezado, "1062");
    modelo.actualizar("numero", 2000);

    assert.equal(modelo.obtenerEstado().numero, 1062);
    assert.equal(modelo.obtenerEstado().claveEncabezado, "1062");
});

test("carga Empresa como entidad externa sin renderizar su ABM", async () => {
    const modelo = crearABMAsientos({
        comprobanteID: 100,
        modo: MODO_ABM.EDICION,
        cargarAsiento,
        actualizarAsiento,
        cargarEmpresaDetalle
    });

    await modelo.cargar();

    const empresaExterna = modelo.obtenerEstado().entidadesExternas.empresa;
    assert.equal(empresaExterna.estado, "cargado");
    assert.equal(empresaExterna.empresaID, 1);
    assert.equal(empresaExterna.datos.domicilio, "Calle de prueba 123");
    assert.equal(empresaExterna.datos.web, "https://empresa.test");
});

test("el tacho puede eliminar por ComprobanteID desde consulta o edición", async () => {
    let idEliminado = null;
    const modelo = crearABMAsientos({
        comprobanteID: 100,
        modo: MODO_ABM.EDICION,
        cargarAsiento,
        actualizarAsiento,
        eliminarAsiento: async id => { idEliminado = id; }
    });
    await modelo.cargar();

    assert.equal(await modelo.eliminar(), true);
    assert.equal(idEliminado, 100);
    assert.equal(modelo.obtenerEstado().guardando, false);
});

test("un error de eliminación conserva abierto el modelo e informa el mensaje de la API", async () => {
    const modelo = crearABMAsientos({
        comprobanteID: 100,
        modo: MODO_ABM.EDICION,
        cargarAsiento,
        actualizarAsiento,
        eliminarAsiento: async () => { throw new Error("El asiento está relacionado."); }
    });
    await modelo.cargar();

    assert.equal(await modelo.eliminar(), false);
    assert.equal(modelo.obtenerEstado().errorGuardado, "El asiento está relacionado.");
    assert.equal(modelo.obtenerEstado().guardando, false);
});

test("el modo consulta rechaza cambios de formulario y renglón", async () => {
    const modelo = crearABMAsientos({ comprobanteID: 100, modo: MODO_ABM.CONSULTA, cargarAsiento, actualizarAsiento });
    await modelo.cargar();

    modelo.actualizar("detalle", "Modificado");
    modelo.actualizar("moneda", {
        monedaID: 8,
        monedaCodigo: "USD",
        monedaNombre: "Dólar Norteamericano"
    });
    modelo.actualizarRenglon(10, {
        ...modelo.obtenerEstado().renglones[0],
        cuentaCodigo: "9.9",
        debe: 999
    });

    const estado = modelo.obtenerEstado();
    assert.equal(estado.detalle, "Original");
    assert.equal(estado.moneda.monedaID, 1);
    assert.equal(estado.renglones[0].cuentaCodigo, "1.1");
    assert.equal(estado.renglones[0].debe, 50);
});

test("el modo edición acepta sólo los campos declarados por la política", async () => {
    const modelo = crearABMAsientos({ comprobanteID: 100, modo: MODO_ABM.EDICION, cargarAsiento, actualizarAsiento });
    await modelo.cargar();

    modelo.actualizar("detalle", "Modificado");
    modelo.actualizar("moneda", {
        monedaID: 8,
        monedaCodigo: "USD",
        monedaNombre: "Dólar Norteamericano"
    });
    modelo.actualizar("modeloAsiento", { id: 99 });
    modelo.actualizar("puntoVenta", 9);
    modelo.actualizar("numero", 2000);
    modelo.actualizarRenglon(10, {
        ...modelo.obtenerEstado().renglones[0],
        cuentaID: 2,
        cuentaCodigo: "2.2",
        cuentaNombre: "Banco",
        debe: 75,
        detalle: "Renglón modificado",
        clienteID: 30,
        clienteCodigo: "300",
        clienteNombre: "Cliente alterado",
        impLocal: 999
    });

    const estado = modelo.obtenerEstado();
    const renglon = estado.renglones[0];
    assert.equal(estado.detalle, "Modificado");
    assert.equal(estado.moneda.monedaID, 8);
    assert.equal(estado.moneda.monedaCodigo, "USD");
    assert.equal(estado.modeloAsiento, null);
    assert.equal(estado.puntoVenta, "");
    assert.equal(estado.numero, 1062);
    assert.equal(renglon.cuentaID, 2);
    assert.equal(renglon.cuentaCodigo, "2.2");
    assert.equal(renglon.cuentaNombre, "Banco");
    assert.equal(renglon.debe, 75);
    assert.equal(renglon.detalle, "Renglón modificado");
    assert.equal(renglon.clienteID, 20);
    assert.equal(renglon.clienteCodigo, "200");
    assert.equal(renglon.clienteNombre, "Cliente original");
    assert.equal(renglon.impLocal, 50);
    assert.equal(renglon.debeLocal, null);
    assert.equal(renglon.debeReferencia, null);
});

test("modificar Haber invalida sus importes calculados recibidos del endpoint", async () => {
    const respuestaHaber = structuredClone(respuesta);
    respuestaHaber.lineas[0] = {
        ...respuestaHaber.lineas[0],
        tipo: -1,
        impLocal: 50,
        impReferencia: 0.05
    };
    const modelo = crearABMAsientos({
        comprobanteID: 100,
        modo: MODO_ABM.EDICION,
        cargarAsiento: async () => structuredClone(respuestaHaber),
        actualizarAsiento
    });
    await modelo.cargar();

    const original = modelo.obtenerEstado().renglones[0];
    assert.equal(original.haberLocal, 50);
    assert.equal(original.haberReferencia, 0.05);

    modelo.actualizarRenglon(10, { ...original, haber: 75 });

    const modificado = modelo.obtenerEstado().renglones[0];
    assert.equal(modificado.haberLocal, null);
    assert.equal(modificado.haberReferencia, null);
});

test("informar Debe limpia el Haber existente del mismo renglón", async () => {
    const respuestaHaber = structuredClone(respuesta);
    respuestaHaber.lineas[0] = {
        ...respuestaHaber.lineas[0],
        tipo: -1,
        importe: 50,
        impLocal: 50,
        impReferencia: 0.05
    };
    const modelo = crearABMAsientos({
        comprobanteID: 100,
        modo: MODO_ABM.EDICION,
        cargarAsiento: async () => structuredClone(respuestaHaber),
        actualizarAsiento
    });
    await modelo.cargar();

    const original = modelo.obtenerEstado().renglones[0];
    modelo.actualizarRenglon(10, { ...original, debe: 75 });

    const modificado = modelo.obtenerEstado().renglones[0];
    assert.equal(modificado.debe, 75);
    assert.equal(modificado.haber, null);
    assert.equal(modificado.haberLocal, null);
    assert.equal(modificado.haberReferencia, null);
});

test("informar Haber limpia el Debe existente del mismo renglón", async () => {
    const modelo = crearABMAsientos({
        comprobanteID: 100,
        modo: MODO_ABM.EDICION,
        cargarAsiento,
        actualizarAsiento
    });
    await modelo.cargar();

    const original = modelo.obtenerEstado().renglones[0];
    modelo.actualizarRenglon(10, { ...original, haber: 75 });

    const modificado = modelo.obtenerEstado().renglones[0];
    assert.equal(modificado.haber, 75);
    assert.equal(modificado.debe, null);
    assert.equal(modificado.debeLocal, null);
    assert.equal(modificado.debeReferencia, null);
});

test("restaurar un campo de cabecera a su valor original elimina la marca de cambio", async () => {
    const modelo = crearABMAsientos({
        comprobanteID: 100,
        modo: MODO_ABM.EDICION,
        cargarAsiento,
        actualizarAsiento
    });
    await modelo.cargar();

    modelo.actualizar("detalle", "Modificado");
    assert.equal(modelo.obtenerEstado().modificado, true);

    modelo.actualizar("detalle", "Original");
    assert.equal(modelo.obtenerEstado().modificado, false);
});

test("el modo alta crea por POST y admite punto de venta", async () => {
    let payloadCreado;
    let actualizaciones = 0;
    const modelo = crearABMAsientos({
        comprobanteID: null,
        modo: MODO_ABM.ALTA,
        crearAsiento: async payload => { payloadCreado = payload; return 501; },
        actualizarAsiento: async () => { actualizaciones += 1; }
    });
    await modelo.cargar();

    modelo.actualizar("empresa", { empresaID: 1, empresaNombre: "Empresa" });
    modelo.actualizar("moneda", { monedaID: 7, monedaCodigo: "ARS", monedaNombre: "Pesos Argentinos" });
    modelo.actualizar("numeracion", { numeraTipoID: 81, descripcion: "As" });
    modelo.actualizar("puntoVenta", 5);
    modelo.actualizar("numero", 1200);

    const debe = modelo.agregarRenglon();
    modelo.actualizarRenglon(debe.renglonID, { ...debe, cuentaID: 10, debe: 100, detalle: "Debe" });
    const haber = modelo.agregarRenglon();
    modelo.actualizarRenglon(haber.renglonID, { ...haber, cuentaID: 20, haber: 100, detalle: "Haber" });

    const guardado = await modelo.guardar({ recargar: false });

    assert.equal(guardado, true);
    assert.equal(actualizaciones, 0);
    assert.equal(payloadCreado.puntoVenta, 5);
    assert.equal(payloadCreado.numeraTipoId, 81);
    assert.equal(payloadCreado.lineas.length, 2);
    assert.equal(Object.hasOwn(payloadCreado.lineas[0], "id"), false);
});

test("el modo alta permite punto de venta y número vacíos", async () => {
    let payloadCreado;
    const modelo = crearABMAsientos({
        comprobanteID: null,
        modo: MODO_ABM.ALTA,
        crearAsiento: async payload => { payloadCreado = payload; return 502; },
        actualizarAsiento: async () => {}
    });
    await modelo.cargar();

    modelo.actualizar("empresa", { empresaID: 1, empresaNombre: "Empresa" });
    modelo.actualizar("moneda", { monedaID: 7, monedaCodigo: "ARS", monedaNombre: "Pesos Argentinos" });
    modelo.actualizar("numeracion", { numeraTipoID: 81, descripcion: "As" });

    const debe = modelo.agregarRenglon();
    modelo.actualizarRenglon(debe.renglonID, { ...debe, cuentaID: 10, debe: 100 });
    const haber = modelo.agregarRenglon();
    modelo.actualizarRenglon(haber.renglonID, { ...haber, cuentaID: 20, haber: 100 });

    const guardado = await modelo.guardar({ recargar: false });

    assert.equal(guardado, true);
    assert.equal(payloadCreado.puntoVenta, null);
    assert.equal(payloadCreado.numero, null);
    assert.equal(modelo.obtenerEstado().comprobanteID, 502);
    assert.equal(modelo.obtenerEstado().modo, MODO_ABM.EDICION);
});

test("guardar arma el PUT con ComprobanteID y conserva el ID del renglón", async () => {
    let solicitud;
    const modelo = crearABMAsientos({
        comprobanteID: 100,
        modo: MODO_ABM.EDICION,
        cargarAsiento,
        actualizarAsiento: async (id, payload) => { solicitud = { id, payload }; }
    });
    await modelo.cargar();
    modelo.actualizar("detalle", "Guardado");
    modelo.actualizar("moneda", {
        monedaID: 8,
        monedaCodigo: "USD",
        monedaNombre: "Dólar Norteamericano"
    });
    modelo.actualizarRenglon(10, {
        ...modelo.obtenerEstado().renglones[0],
        debe: 75,
        detalle: "Debe actualizado"
    });
    const contrapartida = modelo.agregarRenglon();
    modelo.actualizarRenglon(contrapartida.renglonID, {
        ...contrapartida,
        cuentaID: 2,
        haber: 75,
        detalle: "Haber"
    });

    const guardado = await modelo.guardar({ recargar: false });

    assert.equal(guardado, true);
    assert.equal(solicitud.id, 100);
    assert.equal(solicitud.payload.id, 100);
    assert.equal(solicitud.payload.detalle, "Guardado");
    assert.equal(solicitud.payload.monedaId, 8);
    assert.deepEqual(solicitud.payload.lineas[0], {
        id: 10,
        cuentaId: 1,
        tipo: 1,
        importe: 75,
        detalle: "Debe actualizado",
        clienteId: 20,
        proveedorId: null,
        cajaId: null
    });
    assert.equal(modelo.obtenerEstado().modificado, false);
});

test("guardar rechaza en el frontend un asiento desbalanceado sin llamar a la API", async () => {
    let llamadas = 0;
    const respuestaBalanceada = structuredClone(respuesta);
    respuestaBalanceada.lineas.push({
        ...respuestaBalanceada.lineas[0],
        id: 11,
        cuentaId: 2,
        cuentaCodigo: "2.1",
        cuentaNombre: "Contrapartida",
        tipo: -1,
        detalle: "Haber original"
    });
    const modelo = crearABMAsientos({
        comprobanteID: 100,
        modo: MODO_ABM.EDICION,
        cargarAsiento: async () => structuredClone(respuestaBalanceada),
        actualizarAsiento: async () => { llamadas += 1; }
    });
    await modelo.cargar();
    modelo.actualizarRenglon(10, {
        ...modelo.obtenerEstado().renglones[0],
        debe: 75
    });

    const guardado = await modelo.guardar({ recargar: false });

    assert.equal(guardado, false);
    assert.equal(llamadas, 0);
    assert.equal(modelo.obtenerEstado().errorGuardado, MENSAJE_ASIENTO_DESBALANCEADO);
});

test("informar Haber sobre un Debe existente limpia el Debe antes de validar el balance", async () => {
    let llamadas = 0;
    const modelo = crearABMAsientos({
        comprobanteID: 100,
        modo: MODO_ABM.EDICION,
        cargarAsiento,
        actualizarAsiento: async () => { llamadas += 1; }
    });
    await modelo.cargar();
    modelo.actualizarRenglon(10, {
        ...modelo.obtenerEstado().renglones[0],
        haber: 25
    });

    const renglon = modelo.obtenerEstado().renglones[0];
    assert.equal(renglon.debe, null);
    assert.equal(renglon.haber, 25);

    const guardado = await modelo.guardar({ recargar: false });

    assert.equal(guardado, false);
    assert.equal(llamadas, 0);
    assert.equal(modelo.obtenerEstado().errorGuardado, MENSAJE_ASIENTO_DESBALANCEADO);
});

test("agregar renglón crea una fila temporal editable y el PUT la envía sin ID", async () => {
    let solicitud;
    const modelo = crearABMAsientos({
        comprobanteID: 100,
        modo: MODO_ABM.EDICION,
        cargarAsiento,
        actualizarAsiento: async (id, payload) => { solicitud = { id, payload }; }
    });
    await modelo.cargar();

    const renglon = modelo.agregarRenglon();
    assert.ok(renglon.renglonID < 0);
    modelo.actualizarRenglon(renglon.renglonID, {
        ...renglon,
        cuentaID: 2,
        cuentaCodigo: "2.2",
        cuentaNombre: "Banco",
        haber: 50,
        detalle: "Renglón nuevo"
    });

    const guardado = await modelo.guardar({ recargar: false });

    assert.equal(guardado, true);
    assert.equal(solicitud.payload.lineas.length, 2);
    assert.deepEqual(solicitud.payload.lineas[1], {
        id: null,
        cuentaId: 2,
        tipo: -1,
        importe: 50,
        detalle: "Renglón nuevo",
        clienteId: null,
        proveedorId: null,
        cajaId: null
    });
});

test("agregar filas completamente vacías no habilita ni ejecuta el PUT", async () => {
    let llamadas = 0;
    const modelo = crearABMAsientos({
        comprobanteID: 100,
        modo: MODO_ABM.EDICION,
        cargarAsiento,
        actualizarAsiento: async () => { llamadas += 1; }
    });
    await modelo.cargar();

    modelo.agregarRenglon();
    modelo.agregarRenglon();
    modelo.agregarRenglon();
    const guardado = await modelo.guardar({ recargar: false });

    assert.equal(modelo.obtenerEstado().modificado, false);
    assert.equal(guardado, false);
    assert.equal(llamadas, 0);
});

test("una fila nueva deja de ser un cambio cuando vuelve a quedar vacía", async () => {
    let llamadas = 0;
    const modelo = crearABMAsientos({
        comprobanteID: 100,
        modo: MODO_ABM.EDICION,
        cargarAsiento,
        actualizarAsiento: async () => { llamadas += 1; }
    });
    await modelo.cargar();

    const renglon = modelo.agregarRenglon();
    modelo.actualizarRenglon(renglon.renglonID, { ...renglon, detalle: "Temporal" });
    assert.equal(modelo.obtenerEstado().modificado, true);

    modelo.actualizarRenglon(renglon.renglonID, { ...renglon, detalle: "" });
    assert.equal(modelo.obtenerEstado().modificado, false);
    assert.equal(await modelo.guardar({ recargar: false }), false);
    assert.equal(llamadas, 0);
});

test("guardar valida un alta que tiene al menos un dato cargado", async () => {
    let llamadas = 0;
    const modelo = crearABMAsientos({
        comprobanteID: 100,
        modo: MODO_ABM.EDICION,
        cargarAsiento,
        actualizarAsiento: async () => { llamadas += 1; }
    });
    await modelo.cargar();

    const renglon = modelo.agregarRenglon();
    modelo.actualizarRenglon(renglon.renglonID, {
        ...renglon,
        detalle: "Dato incompleto"
    });
    const guardado = await modelo.guardar({ recargar: false });

    assert.equal(guardado, false);
    assert.equal(llamadas, 0);
    assert.match(modelo.obtenerEstado().errorGuardado, /Debe o Haber/);
});

test("agregar renglón no está disponible en modo consulta", async () => {
    const modelo = crearABMAsientos({
        comprobanteID: 100,
        modo: MODO_ABM.CONSULTA,
        cargarAsiento,
        actualizarAsiento
    });
    await modelo.cargar();

    assert.equal(modelo.agregarRenglon(), null);
    assert.equal(modelo.obtenerEstado().renglones.length, 1);
});

test("eliminar renglón quita altas temporales y existentes del estado editable", async () => {
    const modelo = crearABMAsientos({
        comprobanteID: 100,
        modo: MODO_ABM.EDICION,
        cargarAsiento,
        actualizarAsiento
    });
    await modelo.cargar();

    const nuevo = modelo.agregarRenglon();
    assert.equal(modelo.eliminarRenglon(nuevo.renglonID), true);
    assert.equal(modelo.obtenerEstado().renglones.length, 1);
    assert.equal(modelo.eliminarRenglon(10), true);
    assert.equal(modelo.obtenerEstado().renglones.length, 0);
    assert.equal(modelo.obtenerEstado().modificado, true);
});

test("eliminar renglón existente lo omite del PUT", async () => {
    let solicitud;
    const respuestaConTresRenglones = structuredClone(respuesta);
    respuestaConTresRenglones.lineas.push({
        ...respuestaConTresRenglones.lineas[0],
        id: 11,
        cuentaId: 2,
        cuentaCodigo: "1.2",
        cuentaNombre: "Debe a eliminar",
        tipo: 1,
        importe: 25,
        detalle: "Debe eliminado"
    }, {
        ...respuestaConTresRenglones.lineas[0],
        id: 12,
        cuentaId: 3,
        cuentaCodigo: "2.1",
        cuentaNombre: "Contrapartida",
        tipo: -1,
        importe: 75,
        detalle: "Haber original"
    });
    const modelo = crearABMAsientos({
        comprobanteID: 100,
        modo: MODO_ABM.EDICION,
        cargarAsiento: async () => structuredClone(respuestaConTresRenglones),
        actualizarAsiento: async (id, payload) => { solicitud = { id, payload }; }
    });
    await modelo.cargar();

    modelo.eliminarRenglon(11);
    modelo.actualizarRenglon(12, {
        ...modelo.obtenerEstado().renglones.find(renglon => renglon.renglonID === 12),
        haber: 50
    });
    const guardado = await modelo.guardar({ recargar: false });

    assert.equal(guardado, true);
    assert.deepEqual(solicitud.payload.lineas.map(linea => linea.id), [10, 12]);
});

test("eliminar renglón no está disponible en modo consulta", async () => {
    const modelo = crearABMAsientos({
        comprobanteID: 100,
        modo: MODO_ABM.CONSULTA,
        cargarAsiento,
        actualizarAsiento
    });
    await modelo.cargar();

    assert.equal(modelo.eliminarRenglon(10), false);
    assert.equal(modelo.obtenerEstado().renglones.length, 1);
});
