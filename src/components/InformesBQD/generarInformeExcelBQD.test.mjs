import assert from "node:assert/strict";
import test from "node:test";

import ExcelJS from "exceljs";

import { generarArchivoExcelBQD } from "./generarInformeExcelBQD.js";

test("genera el encabezado, la grilla principal y la hija con sangría", async () => {
    const archivo = await generarArchivoExcelBQD({
        titulo:"Contabilidad - Asientos",
        versionAplicacion:"1.0.0",
        generadoEn:new Date(2026, 9, 13, 10, 35, 34),
        filtros:"<Desde fecha: 01/10/2026>",
        interlineado:"LightGray",
        columnas:[
            { campo:"fecha", titulo:"Fecha", ancho:110, formato:"fecha", mascara:"DD/MM/YYYY" },
            { campo:"importe", titulo:"Importe", ancho:150, formato:"decimal", mascara:"0.0,00", align:"right", suma:true }
        ],
        filas:[{
            fecha:"2026-10-13T12:00:00",
            importe:1250.5,
            subgrillas:[{
                mostrarTitulos:true,
                mostrarTotales:true,
                columnas:[
                    { campo:"cuenta", titulo:"Cuenta", ancho:110 },
                    { campo:"debe", titulo:"Debe", ancho:125, formato:"decimal", mascara:"0.0,00", align:"right", suma:true }
                ],
                filas:[{ cuenta:"1.1.1.01", debe:1250.5 }]
            }]
        }]
    });

    assert.equal(archivo.type, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    const libro = new ExcelJS.Workbook();
    await libro.xlsx.load(await archivo.arrayBuffer());
    const hoja = libro.getWorksheet("Principal");

    assert.equal(hoja.getCell("A2").value, "Andromeda Web (v1.0.0)");
    assert.equal(hoja.getCell("A3").value, "XX (XX-DBGA)");
    assert.equal(hoja.getCell("A5").value, "Contabilidad - Asientos");
    assert.equal(hoja.getCell("A7").value, "Filtros: <Desde fecha: 01/10/2026>");
    assert.equal(hoja.getCell("A9").value, "Cantidad de registros: 1");
    assert.equal(hoja.getCell("A11").value, "Fecha");
    assert.equal(hoja.getCell("B11").value, "Importe");
    assert.equal(hoja.getCell("B12").value, 1250.5);
    assert.equal(hoja.getCell("B12").numFmt, "#,##0.00");
    assert.equal(hoja.getCell("A13").value, null);
    assert.equal(hoja.getCell("B13").value, "Cuenta");
    assert.equal(hoja.getCell("C13").value, "Debe");
    assert.equal(hoja.getCell("B14").value, "1.1.1.01");
    assert.equal(hoja.getCell("C14").value, 1250.5);
    assert.equal(hoja.getCell("B15").value, "Totales");
    assert.equal(hoja.getCell("C15").value, 1250.5);
    assert.equal(hoja.getCell("A17").value, "Totales");
    assert.equal(hoja.getCell("B17").value, 1250.5);
});
