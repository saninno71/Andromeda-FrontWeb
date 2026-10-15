import * as PDFKit from "pdfkit";
import { toBlob } from "pdfkit/output";
import Helvetica from "pdfkit/standard-fonts/Helvetica";
import HelveticaBold from "pdfkit/standard-fonts/HelveticaBold";

import { formatearValor } from "../updFormatos.js";
import { obtenerValorColumna } from "../grid/gridValores.js";
import {
    agruparColumnasInforme,
    aplicarLayoutColumnasInforme,
    prepararFilasInformeBQD,
    truncarTextoAlAncho
} from "./informeBQD.funcional.js";
import { paginarBloquesAnidadosInforme } from "./paginacionInformeBQD.js";
import { normalizarColorInterlineado } from "./coloresInterlineado.js";

const PDFDocument = PDFKit.PDFDocument ?? PDFKit.default;
PDFKit.registerStdFonts?.(Helvetica, HelveticaBold);

const PAGINA = Object.freeze({
    margenIzquierdo:22,
    margenDerecho:22,
    margenSuperior:16,
    margenInferior:24,
    separacionRegistro:6.5
});

const TIPOGRAFIA = Object.freeze({
    datos:6.5,
    datosSubgrilla:6.2,
    tituloColumna:6.2,
    tituloSubgrilla:6.4,
    referencia:6.2,
    encabezado:7,
    titulo:8
});

const IDENTIFICACION_BASE_DATOS_TEMPORAL = "XX (XX-DBGA)";

function alineacion(columna) {
    return ["left", "center", "right"].includes(columna.align)
        ? columna.align
        : "left";
}

function columnasConPosicion(columnas, xInicial, anchoDisponible) {
    const total = columnas.reduce((suma, columna) => suma + columna.ancho, 0) || 1;
    let x = xInicial;
    return columnas.map((columna, indice) => {
        const ancho = indice === columnas.length - 1
            ? xInicial + anchoDisponible - x
            : anchoDisponible * columna.ancho / total;
        const resultado = { columna, x, ancho };
        x += ancho;
        return resultado;
    });
}

function configurarFuente(documento, negrita, tamano, color = "#202020") {
    documento.font(negrita ? "Helvetica-Bold" : "Helvetica");
    documento.fontSize(tamano);
    documento.fillColor(color);
}

function crearMedidor(documento) {
    const cache = new Map();
    return ({ texto, ancho, negrita = false, tamano, ajustarTexto = true }) => {
        configurarFuente(documento, negrita, tamano);
        const contenido = String(texto ?? "");
        const anchoTexto = Math.max(1, ancho - 3);
        const clave = `${negrita ? 1 : 0}|${ajustarTexto ? 1 : 0}|${tamano}|${anchoTexto.toFixed(2)}|${contenido}`;
        if (cache.has(clave)) return cache.get(clave);
        const altoLinea = documento.currentLineHeight(true);
        const alto = contenido && ajustarTexto
            ? documento.heightOfString(contenido, { width:anchoTexto, lineGap:0 })
            : altoLinea;
        const resultado = Math.max(altoLinea, alto) + 2;
        cache.set(clave, resultado);
        return resultado;
    };
}

function medirLinea({ columnas, textos, x, ancho, medir, negrita, tamano }) {
    const celdas = columnasConPosicion(columnas, x, ancho).map((posicion, indice) => ({
        ...posicion,
        texto:String(textos[indice] ?? "")
    }));
    const alto = celdas.length === 0 ? 0 : Math.max(...celdas.map(celda => medir({
        texto:celda.texto,
        ancho:celda.ancho,
        negrita,
        tamano,
        ajustarTexto:celda.columna.desdoblarTexto === true
    })));
    return { celdas, alto };
}

function dibujarLinea(documento, linea, y, { negrita = false, tamano }) {
    configurarFuente(documento, negrita, tamano);
    linea.celdas.forEach(celda => {
        if (!celda.texto) return;
        const anchoTexto = Math.max(1, celda.ancho - 3);
        const ajustarTexto = celda.columna.desdoblarTexto === true;
        const texto = ajustarTexto
            ? celda.texto
            : truncarTextoAlAncho(
                celda.texto,
                anchoTexto,
                (contenido) => documento.widthOfString(contenido)
            );
        documento.text(texto, celda.x + 1.5, y + 1, {
            width:anchoTexto,
            align:alineacion(celda.columna),
            lineGap:0,
            lineBreak:ajustarTexto
        });
    });
}

function prepararCabecera(documento, propiedades, lineasColumnas, medir) {
    const ancho = documento.page.width - PAGINA.margenIzquierdo - PAGINA.margenDerecho;
    const filtros = `Filtros: ${propiedades.filtros || "Sin filtros"}`;
    const lineas = lineasColumnas.map(columnas => medirLinea({
        columnas,
        textos:columnas.map(columna => columna.titulo),
        x:PAGINA.margenIzquierdo,
        ancho,
        medir,
        negrita:true,
        tamano:TIPOGRAFIA.tituloColumna
    }));

    configurarFuente(documento, false, TIPOGRAFIA.referencia);
    const altoFiltros = documento.heightOfString(filtros, { width:ancho, lineGap:0 });
    const altoReferencia = documento.currentLineHeight(true);
    const inicioDatos = PAGINA.margenSuperior
        + 11
        + 11
        + 5
        + altoFiltros
        + 4
        + altoReferencia
        + 3
        + 2
        + lineas.reduce((suma, linea) => suma + linea.alto, 0)
        + 2;
    return { ancho, filtros, lineas, inicioDatos };
}

function dibujarCabecera(documento, propiedades, cabecera, cantidadRegistros) {
    const x = PAGINA.margenIzquierdo;
    const ancho = cabecera.ancho;
    let y = PAGINA.margenSuperior;

    configurarFuente(documento, false, TIPOGRAFIA.encabezado);
    const nombreAplicacion = propiedades.versionAplicacion
        ? `Andromeda Web (v${propiedades.versionAplicacion})`
        : "Andromeda Web";
    documento.text(nombreAplicacion, x, y, { width:ancho / 2, lineBreak:false });
    documento.text(IDENTIFICACION_BASE_DATOS_TEMPORAL, x + ancho / 2, y, {
        width:ancho / 2,
        align:"right",
        lineBreak:false
    });

    y += 11;
    configurarFuente(documento, true, TIPOGRAFIA.titulo);
    documento.text(propiedades.titulo, x, y, { width:ancho, align:"center", lineBreak:false });
    y += 11;
    documento.moveTo(x, y).lineTo(x + ancho, y).lineWidth(0.7).strokeColor("#303030").stroke();

    y += 5;
    configurarFuente(documento, false, TIPOGRAFIA.referencia);
    const altoFiltros = documento.heightOfString(cabecera.filtros, { width:ancho, lineGap:0 });
    documento.text(cabecera.filtros, x, y, { width:ancho, lineGap:0 });
    y += altoFiltros + 4;
    documento.text(`Cantidad de registros: ${cantidadRegistros}`, x, y, {
        width:ancho,
        lineBreak:false
    });
    y += documento.currentLineHeight(true) + 3;

    documento.moveTo(x, y).lineTo(x + ancho, y).lineWidth(0.5).strokeColor("#606060").stroke();
    y += 2;
    cabecera.lineas.forEach(linea => {
        dibujarLinea(documento, linea, y, {
            negrita:true,
            tamano:TIPOGRAFIA.tituloColumna
        });
        y += linea.alto;
    });
    documento.moveTo(x, y).lineTo(x + ancho, y).lineWidth(0.5).strokeColor("#606060").stroke();
    return y + 2;
}

function prepararBloques(documento, filas, lineasColumnas, ancho, medir) {
    return filas.map((fila, indice) => {
        const lineas = lineasColumnas.map(columnas => medirLinea({
            columnas,
            textos:columnas.map(columna => formatearValor(
                obtenerValorColumna(fila, columna),
                columna.formato,
                columna.mascara
            )),
            x:PAGINA.margenIzquierdo,
            ancho,
            medir,
            negrita:false,
            tamano:TIPOGRAFIA.datos
        }));
        const altoPrincipal = 3
            + lineas.reduce((suma, linea) => suma + linea.alto, 0)
            + PAGINA.separacionRegistro;
        const bloque = {
            indice,
            lineas,
            altoPrincipal
        };
        bloque.subgrillas = prepararSubgrillas(documento, fila.subgrillas, ancho, medir);
        return bloque;
    });
}

function dibujarBloque(documento, bloque, y, ancho, colorInterlineado) {
    const altoFondo = bloque.altoPrincipal - PAGINA.separacionRegistro;
    const tieneSubgrillas = bloque.subgrillas.length > 0;
    if (!tieneSubgrillas && bloque.indice % 2 === 0) {
        documento.rect(PAGINA.margenIzquierdo, y, ancho, altoFondo).fill(colorInterlineado);
    }
    let cursorY = y + 1.5;
    bloque.lineas.forEach(linea => {
        dibujarLinea(documento, linea, cursorY, {
            negrita:false,
            tamano:TIPOGRAFIA.datos
        });
        cursorY += linea.alto;
    });
    return y + bloque.altoPrincipal;
}

function calcularTotales(columnas, filas, contextoCalculos) {
    return new Map(columnas
        .filter(columna => columna.suma === true)
        .map(columna => [
            columna.campo,
            Math.round(filas.reduce((total, fila) => total + Number(
                obtenerValorColumna(fila, columna, contextoCalculos) || 0
            ), 0) * 100) / 100
        ]));
}

function prepararSubgrillas(documento, definiciones, anchoPadre, medir) {
    if (!Array.isArray(definiciones)) return [];
    const margen = 10;
    const x = PAGINA.margenIzquierdo + margen;
    const ancho = anchoPadre - margen * 2;

    return definiciones.map(definicion => {
        const columnas = aplicarLayoutColumnasInforme(
            definicion.columnas ?? [],
            definicion.layoutColumnas ?? []
        );
        const gruposColumnas = agruparColumnasInforme(columnas);
        const cabeceras = definicion.mostrarTitulos === false
            ? []
            : gruposColumnas.map(grupo => medirLinea({
                columnas:grupo,
                textos:grupo.map(columna => columna.titulo),
                x,
                ancho,
                medir,
                negrita:true,
                tamano:TIPOGRAFIA.tituloColumna
            }));
        const mostrarTitulo = definicion.mostrarTitulo !== false;
        let altoTitulo = 0;
        if (mostrarTitulo) {
            configurarFuente(documento, true, TIPOGRAFIA.tituloSubgrilla);
            altoTitulo = documento.currentLineHeight(true) + 2;
        }
        const filas = (definicion.filas ?? []).map(fila => {
            const lineas = gruposColumnas.map(grupo => medirLinea({
                columnas:grupo,
                textos:grupo.map(columna => formatearValor(
                    obtenerValorColumna(fila, columna, definicion.contextoCalculos),
                    columna.formato,
                    columna.mascara
                )),
                x,
                ancho,
                medir,
                negrita:false,
                tamano:TIPOGRAFIA.datosSubgrilla
            }));
            return {
                lineas,
                alto:2 + lineas.reduce((suma, linea) => suma + linea.alto, 0)
            };
        });
        let totales = null;
        if (definicion.mostrarTotales) {
            const valores = calcularTotales(columnas, definicion.filas ?? [], definicion.contextoCalculos);
            const lineas = gruposColumnas.map((grupo, indiceGrupo) => medirLinea({
                columnas:grupo,
                textos:grupo.map((columna, indiceColumna) => {
                    if (indiceGrupo === 0 && indiceColumna === 0) return "Totales";
                    if (!valores.has(columna.campo)) return "";
                    return formatearValor(valores.get(columna.campo), columna.formato, columna.mascara);
                }),
                x,
                ancho,
                medir,
                negrita:true,
                tamano:TIPOGRAFIA.datosSubgrilla
            }));
            totales = {
                lineas,
                alto:2 + lineas.reduce((suma, linea) => suma + linea.alto, 0) + 3
            };
        }
        return {
            titulo:definicion.titulo || "Detalle",
            mostrarTitulo,
            x,
            ancho,
            cabeceras,
            filas,
            totales,
            altoTitulo,
            altoCabecera:3 + altoTitulo
                + cabeceras.reduce((suma, linea) => suma + linea.alto, 0)
                + 2
        };
    });
}

function dibujarCabeceraSubgrilla(documento, subgrilla, y, continuacion, colorInterlineado) {
    documento.rect(subgrilla.x, y, subgrilla.ancho, subgrilla.altoCabecera)
        .fill(colorInterlineado);
    let cursorY = y + 2;
    if (subgrilla.mostrarTitulo) {
        configurarFuente(documento, true, TIPOGRAFIA.tituloSubgrilla);
        documento.text(
            `${subgrilla.titulo}${continuacion ? " (continuación)" : ""}`,
            subgrilla.x + 1.5,
            cursorY,
            { width:subgrilla.ancho - 3, lineBreak:false }
        );
        cursorY += subgrilla.altoTitulo;
    }
    subgrilla.cabeceras.forEach(linea => {
        dibujarLinea(documento, linea, cursorY, {
            negrita:true,
            tamano:TIPOGRAFIA.tituloColumna
        });
        cursorY += linea.alto;
    });
    return y + subgrilla.altoCabecera;
}

function dibujarFilaSubgrilla(documento, componente, y, colorInterlineado) {
    const { subgrilla, fila } = componente;
    documento.rect(subgrilla.x, y, subgrilla.ancho, fila.alto)
        .fill(colorInterlineado);
    let cursorY = y + 1;
    fila.lineas.forEach(linea => {
        dibujarLinea(documento, linea, cursorY, {
            negrita:false,
            tamano:TIPOGRAFIA.datosSubgrilla
        });
        cursorY += linea.alto;
    });
    return y + fila.alto;
}

function dibujarTotalesSubgrilla(documento, subgrilla, totales, y, colorInterlineado) {
    documento.rect(subgrilla.x, y, subgrilla.ancho, totales.alto)
        .fill(colorInterlineado);
    let cursorY = y + 1;
    totales.lineas.forEach(linea => {
        dibujarLinea(documento, linea, cursorY, {
            negrita:true,
            tamano:TIPOGRAFIA.datosSubgrilla
        });
        cursorY += linea.alto;
    });
    return y + totales.alto;
}

function dibujarComponente(documento, componente, y, ancho, colorInterlineado) {
    switch (componente.tipo) {
        case "principal":
            return dibujarBloque(
                documento,
                componente.bloque,
                y,
                ancho,
                colorInterlineado
            );
        case "subgrillaCabecera":
            return dibujarCabeceraSubgrilla(
                documento,
                componente.subgrilla,
                y,
                componente.continuacion,
                colorInterlineado
            );
        case "subgrillaFila":
            return dibujarFilaSubgrilla(documento, componente, y, colorInterlineado);
        case "subgrillaTotales":
            return dibujarTotalesSubgrilla(
                documento,
                componente.subgrilla,
                componente.totales,
                y,
                colorInterlineado
            );
        default:
            return y;
    }
}

function agregarPagina(documento) {
    documento.addPage({ size:"A4", layout:"landscape", margin:0 });
}

function dibujarPies(documento) {
    const rango = documento.bufferedPageRange();
    for (let indice = 0; indice < rango.count; indice += 1) {
        documento.switchToPage(rango.start + indice);
        configurarFuente(documento, false, 6, "#606060");
        documento.text(`Página ${indice + 1} de ${rango.count}`, PAGINA.margenIzquierdo,
            documento.page.height - 15, {
                width:documento.page.width - PAGINA.margenIzquierdo - PAGINA.margenDerecho,
                align:"right",
                lineBreak:false
            });
    }
}

export async function generarArchivoInformeBQD(propiedades) {
    const colorInterlineado = normalizarColorInterlineado(propiedades.interlineado);
    const columnas = aplicarLayoutColumnasInforme(
        propiedades.columnas,
        propiedades.layoutColumnas
    );
    const lineasColumnas = agruparColumnasInforme(columnas);
    const filas = prepararFilasInformeBQD({
        filas:propiedades.filas,
        columnas,
        busqueda:propiedades.busqueda,
        orden:propiedades.orden
    });

    const documento = new PDFDocument({
        autoFirstPage:false,
        bufferPages:true,
        compress:true,
        info:{ Title:propiedades.titulo, Creator:"Andrómeda" }
    });
    const salida = toBlob(documento);

    agregarPagina(documento);
    const medir = crearMedidor(documento);
    const cabecera = prepararCabecera(documento, propiedades, lineasColumnas, medir);
    const bloques = prepararBloques(documento, filas, lineasColumnas, cabecera.ancho, medir);
    const altoDisponible = documento.page.height
        - PAGINA.margenInferior
        - cabecera.inicioDatos;
    const paginas = paginarBloquesAnidadosInforme(bloques, altoDisponible);

    paginas.forEach((componentesPagina, indicePagina) => {
        if (indicePagina > 0) agregarPagina(documento);
        let y = dibujarCabecera(documento, propiedades, cabecera, filas.length);
        componentesPagina.forEach(componente => {
            y = dibujarComponente(
                documento,
                componente,
                y,
                cabecera.ancho,
                colorInterlineado
            );
        });
    });

    dibujarPies(documento);
    documento.end();
    return salida;
}
