import ExcelJS from "exceljs";

import { formatearValor } from "../updFormatos.js";
import { obtenerValorColumna } from "../grid/gridValores.js";
import {
    aplicarLayoutColumnasInforme,
    prepararFilasInformeBQD
} from "./informeBQD.funcional.js";
import { normalizarColorInterlineado } from "./coloresInterlineado.js";

const TIPO_ARCHIVO_EXCEL =
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
const IDENTIFICACION_BASE_DATOS_TEMPORAL = "XX (XX-DBGA)";
const COLOR_TITULOS = "00AEE6";
const COLOR_TEXTO_TITULOS = "FFFFFF";

function colorHexadecimal(color) {
    const contenido = String(color || "").trim();
    if (/^#[0-9a-f]{6}$/i.test(contenido)) return contenido.slice(1).toUpperCase();
    if (typeof document === "undefined") return "D3D3D3";
    const contexto = document.createElement("canvas").getContext("2d");
    contexto.fillStyle = "#D3D3D3";
    contexto.fillStyle = contenido;
    const normalizado = contexto.fillStyle;
    if (/^#[0-9a-f]{6}$/i.test(normalizado)) return normalizado.slice(1).toUpperCase();
    const componentes = normalizado.match(/\d+/g)?.slice(0, 3).map(Number);
    return componentes?.length === 3
        ? componentes.map(valor => valor.toString(16).padStart(2, "0")).join("").toUpperCase()
        : "D3D3D3";
}

function colorArgb(color) {
    return `FF${colorHexadecimal(color)}`;
}

function anchoExcel(ancho) {
    const pixeles = Number(ancho);
    if (!Number.isFinite(pixeles) || pixeles <= 0) return 14;
    return Math.max(8, Math.min(60, Math.round(pixeles / 7)));
}

function alineacionExcel(columna = {}) {
    return ["left", "center", "right"].includes(columna.align)
        ? columna.align
        : "left";
}

function cantidadDecimales(mascara = "") {
    const parteDecimal = String(mascara).split(",")[1];
    return parteDecimal ? parteDecimal.replace(/[^0#]/g, "").length : 0;
}

function formatoNumericoExcel(columna = {}) {
    if (columna.formato === "entero") return "0";
    if (columna.formato !== "decimal") return null;
    const decimales = cantidadDecimales(columna.mascara);
    const usaMiles = String(columna.mascara || "").includes(".");
    const parteEntera = usaMiles ? "#,##0" : "0";
    return decimales > 0
        ? `${parteEntera}.${"0".repeat(decimales)}`
        : parteEntera;
}

function valorCeldaExcel(fila, columna, contextoCalculos) {
    const valor = obtenerValorColumna(fila, columna, contextoCalculos);
    if (valor == null || valor === "") return "";
    if (["decimal", "entero"].includes(columna.formato)) {
        const numero = Number(valor);
        return Number.isFinite(numero) ? numero : valor;
    }
    return formatearValor(valor, columna.formato, columna.mascara);
}

function aplicarEstiloTitulo(celda) {
    celda.font = { bold:true, color:{ argb:COLOR_TEXTO_TITULOS } };
    celda.fill = {
        type:"pattern",
        pattern:"solid",
        fgColor:{ argb:colorArgb(COLOR_TITULOS) }
    };
    celda.alignment = { vertical:"middle", horizontal:"center", wrapText:false };
}

function aplicarEstiloFila(celda, columna, { negrita = false, fondo } = {}) {
    celda.font = { bold:negrita };
    celda.alignment = {
        vertical:"middle",
        horizontal:alineacionExcel(columna),
        wrapText:columna.desdoblarTexto === true
    };
    const formato = formatoNumericoExcel(columna);
    if (formato) celda.numFmt = formato;
    if (fondo) {
        celda.fill = {
            type:"pattern",
            pattern:"solid",
            fgColor:{ argb:colorArgb(fondo) }
        };
    }
}

function escribirTitulos(hoja, filaNumero, columnas, columnaInicial = 1) {
    columnas.forEach((columna, indice) => {
        const celda = hoja.getCell(filaNumero, columnaInicial + indice);
        celda.value = columna.titulo;
        aplicarEstiloTitulo(celda);
    });
}

function escribirDatos(hoja, filaNumero, fila, columnas, {
    columnaInicial = 1,
    contextoCalculos,
    negrita = false,
    fondo
} = {}) {
    columnas.forEach((columna, indice) => {
        const celda = hoja.getCell(filaNumero, columnaInicial + indice);
        celda.value = valorCeldaExcel(fila, columna, contextoCalculos);
        aplicarEstiloFila(celda, columna, { negrita, fondo });
    });
}

function calcularTotales(columnas, filas, contextoCalculos) {
    return Object.fromEntries(columnas
        .filter(columna => columna.suma === true)
        .map(columna => [
            columna.campo,
            Math.round(filas.reduce((total, fila) => total + Number(
                obtenerValorColumna(fila, columna, contextoCalculos) || 0
            ), 0) * 100) / 100
        ]));
}

function escribirTotales(hoja, filaNumero, columnas, filas, {
    columnaInicial = 1,
    contextoCalculos,
    fondo
} = {}) {
    const totales = calcularTotales(columnas, filas, contextoCalculos);
    escribirDatos(hoja, filaNumero, totales, columnas, {
        columnaInicial,
        negrita:true,
        fondo
    });
    if (columnas[0]) {
        const celdaTitulo = hoja.getCell(filaNumero, columnaInicial);
        celdaTitulo.value = "Totales";
        aplicarEstiloFila(celdaTitulo, columnas[0], { negrita:true, fondo });
    }
}

function ajustarAnchos(hoja, columnas, columnaInicial = 1) {
    columnas.forEach((columna, indice) => {
        const columnaHoja = hoja.getColumn(columnaInicial + indice);
        columnaHoja.width = Math.max(
            columnaHoja.width || 0,
            anchoExcel(columna.ancho)
        );
    });
}

function formatearFechaHora(valor) {
    const fecha = valor instanceof Date ? valor : new Date(valor);
    if (Number.isNaN(fecha.getTime())) return "";
    return fecha.toLocaleString("es-AR", {
        day:"2-digit",
        month:"2-digit",
        year:"numeric",
        hour:"2-digit",
        minute:"2-digit",
        second:"2-digit",
        hour12:false
    });
}

function escribirCabecera(hoja, propiedades, cantidadRegistros) {
    const nombreAplicacion = propiedades.versionAplicacion
        ? `Andromeda Web (v${propiedades.versionAplicacion})`
        : "Andromeda Web";
    hoja.getCell("A2").value = nombreAplicacion;
    hoja.getCell("A3").value = IDENTIFICACION_BASE_DATOS_TEMPORAL;
    hoja.getCell("A4").value = formatearFechaHora(propiedades.generadoEn);
    hoja.getCell("A5").value = propiedades.titulo || "Informe";
    hoja.getCell("A7").value = `Filtros: ${propiedades.filtros || "Sin filtros"}`;
    hoja.getCell("A9").value = `Cantidad de registros: ${cantidadRegistros}`;
}

function escribirSubgrillas(hoja, filaNumero, definiciones, colorInterlineado) {
    let siguienteFila = filaNumero;
    (definiciones ?? []).forEach(definicion => {
        const columnas = aplicarLayoutColumnasInforme(
            definicion.columnas ?? [],
            definicion.layoutColumnas ?? []
        );
        if (columnas.length === 0) return;
        ajustarAnchos(hoja, columnas, 2);
        if (definicion.mostrarTitulos !== false) {
            escribirTitulos(hoja, siguienteFila, columnas, 2);
            siguienteFila += 1;
        }
        (definicion.filas ?? []).forEach(fila => {
            escribirDatos(hoja, siguienteFila, fila, columnas, {
                columnaInicial:2,
                contextoCalculos:definicion.contextoCalculos,
                fondo:colorInterlineado
            });
            siguienteFila += 1;
        });
        if (definicion.mostrarTotales === true) {
            escribirTotales(hoja, siguienteFila, columnas, definicion.filas ?? [], {
                columnaInicial:2,
                contextoCalculos:definicion.contextoCalculos,
                fondo:colorInterlineado
            });
            siguienteFila += 1;
        }
    });
    return siguienteFila;
}

export async function generarArchivoExcelBQD(propiedades = {}) {
    const columnas = aplicarLayoutColumnasInforme(
        propiedades.columnas ?? [],
        propiedades.layoutColumnas ?? []
    );
    const filas = prepararFilasInformeBQD({
        filas:propiedades.filas ?? [],
        columnas,
        busqueda:propiedades.busqueda,
        orden:propiedades.orden
    });
    const colorInterlineado = normalizarColorInterlineado(propiedades.interlineado);
    const libro = new ExcelJS.Workbook();
    libro.creator = "Andromeda Web";
    libro.created = propiedades.generadoEn
        ? new Date(propiedades.generadoEn)
        : new Date();
    const hoja = libro.addWorksheet("Principal");
    escribirCabecera(hoja, propiedades, filas.length);
    ajustarAnchos(hoja, columnas);

    let filaActual = 11;
    if (columnas.length > 0) {
        escribirTitulos(hoja, filaActual, columnas);
        filaActual += 1;
        filas.forEach((fila, indice) => {
            escribirDatos(hoja, filaActual, fila, columnas, {
                fondo:indice % 2 === 0 && !(fila.subgrillas?.length)
                    ? colorInterlineado
                    : undefined
            });
            filaActual += 1;
            filaActual = escribirSubgrillas(
                hoja,
                filaActual,
                fila.subgrillas,
                colorInterlineado
            );
            filaActual += 1;
        });
        escribirTotales(hoja, filaActual, columnas, filas);
    }

    hoja.pageSetup = {
        orientation:"landscape",
        fitToPage:true,
        fitToWidth:1,
        fitToHeight:0,
        margins:{ left:0.25, right:0.25, top:0.4, bottom:0.4, header:0, footer:0 }
    };
    const contenido = await libro.xlsx.writeBuffer();
    return new Blob([contenido], { type:TIPO_ARCHIVO_EXCEL });
}
