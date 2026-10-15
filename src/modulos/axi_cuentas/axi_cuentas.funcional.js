import {
    COLUMNAS_VTS_PEDIDOS_TOTALES_UNIDAD,
    COLUMNAS_VTS_PEDIDOS_VISIBLES,
    CONTROLES_VTS_PEDIDOS_VISIBLES,
    OBJETOS_VTS_PEDIDOS
} from "./axi_cuentas.legacy.js";

const textos = ["Muestra", "Ensayo", "Control", "Pedido", "Andrómeda", "Prueba marquilla"];
const articulos = ["ART-001", "ART-025", "INS-440", "REP-018", "SRV-200"];
const descripciones = ["Artículo de prueba", "Insumo industrial", "Repuesto general", "Servicio técnico", "Material de ensayo"];

function entero(minimo, maximo) {
    return Math.floor(Math.random() * (maximo - minimo + 1)) + minimo;
}

function decimal(minimo, maximo) {
    return Number((minimo + Math.random() * (maximo - minimo)).toFixed(2));
}

function textoAleatorio(prefijo = "") {
    return `${prefijo}${textos[entero(0, textos.length - 1)]} ${entero(1, 999)}`.trim();
}

function fechaAleatoria() {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() + entero(-20, 40));
    return fecha.toLocaleDateString("es-AR");
}

function valorControl(control) {
    if (control.tipo === "fecha") return fechaAleatoria();
    if (control.tipo === "entero") return String(entero(1, 99999));
    if (control.tipo === "numero") return decimal(1, 250000).toFixed(2).replace(".", ",");

    const conocidos = {
        empresa:"Empresa de prueba S.A. [1]",
        numeraTipo:"Pedido (Ped)",
        domicilioEntrega:"Av. de Prueba 1234 - Buenos Aires",
        estado:"Pendiente",
        incoterm:"FOB",
        documentoTipo:"CUIT",
        anulacionMotivo:"Sin anular",
        empresaCuentaCorriente:"Empresa de prueba S.A. [1]",
        clienteNombre:"Cliente de prueba S.A.",
        vendedorNombre:"Vendedor de prueba",
        cobradorNombre:"Cobrador de prueba",
        condicionVentaNombre:"Cuenta corriente",
        listaPreciosNombre:"Lista general",
        monedaNombre:"Pesos Argentinos",
        iibbProvinciaNombre:"Buenos Aires",
        transporteNombre:"Transporte de prueba",
        clienteCuentaCorrienteNombre:"Cliente de prueba S.A.",
        clienteCodigo:`CLI-${entero(100, 999)}`,
        vendedorCodigo:"VEN-01",
        cobradorCodigo:"COB-01",
        condicionVentaCodigo:"CC",
        listaPreciosCodigo:"LP-01",
        monedaCodigo:"ARS",
        iibbProvinciaCodigo:"BSAS",
        transporteCodigo:"TR-01",
        documentoNumero:`30-${entero(10000000, 99999999)}-${entero(0, 9)}`,
        clienteCuentaCorrienteCodigo:`CLI-${entero(100, 999)}`
    };
    return conocidos[control.campo] ?? textoAleatorio();
}

function valorCampoObjeto(objeto, campo) {
    if (campo.tipo === "entero") {
        if (campo.campo === "plantillaid") return "7003";
        if (campo.campo === "tipo") return "2202";
        return String(entero(1, 999));
    }

    const clave = `${objeto.campo}.${campo.campo}`;
    const conocidos = {
        "empresa.codigo":"EMP01",
        "empresa.nombre":"Empresa de prueba S.A.",
        "empresa.numerodoc":"30-70000001-1",
        "empresa.domicilio":"Av. de Prueba 1234",
        "empresa.ivacategorianombre":"Responsable Inscripto",
        "numeraTipo.nombre":"Pedido",
        "numeraTipo.simbolo":"Ped",
        "numeraTipo.letra":"X",
        "cliente.codigo":"CLI001",
        "cliente.nombre":"Cliente de prueba S.A.",
        "cliente.numerodoc":"30-70000002-2",
        "cliente.domicilio":"Calle Cliente 456",
        "cliente.condicionnombre":"Cuenta corriente",
        "cliente.transportenombre":"Transporte de prueba",
        "cliente.variable4":"Dato auxiliar Variable4",
        "vendedor.codigo":"VEN01",
        "vendedor.nombre":"Vendedor de prueba",
        "vendedor.domicilio":"Calle Vendedor 10",
        "cobrador.codigo":"COB01",
        "cobrador.nombre":"Cobrador de prueba",
        "cobrador.domicilio":"Calle Cobrador 20"
    };
    return conocidos[clave] ?? textoAleatorio();
}

function crearFila(item) {
    const cantidad = decimal(1, 20);
    const cantidadAfectada = decimal(0, cantidad / 2);
    const precio = decimal(100, 50000);
    const descuento1 = decimal(0, 10);
    const descuento2 = decimal(0, 5);
    const precioNeto = precio * (1 - descuento1 / 100) * (1 - descuento2 / 100);
    const unidadCodigo = ["UN", "KG", "MT"][entero(0, 2)];

    return {
        item,
        articuloCodigo:articulos[entero(0, articulos.length - 1)],
        descripcion:descripciones[entero(0, descripciones.length - 1)],
        unidadCodigo,
        cantidad,
        monedaCodigoArticulo:"ARS",
        precioArticulo:precio,
        precio,
        descuento1,
        descuento2,
        precioNeto:Number(precioNeto.toFixed(2)),
        subtotal:Number((cantidad * precioNeto).toFixed(2)),
        ivaPorcentaje:[10.5, 21, 27][entero(0, 2)],
        bultos:entero(1, 8),
        depositoCodigo:`D${entero(1, 9)}`,
        depositoNombre:`Depósito ${entero(1, 5)}`,
        articuloTipoNombre:["Producto", "Insumo", "Servicio"][entero(0, 2)],
        cantidadAfectada,
        comprobanteAfectado:cantidadAfectada ? `Remito X-${entero(1, 9999).toString().padStart(8, "0")}` : "",
        ubicacion:`A-${entero(1, 20)}-${entero(1, 50)}`
    };
}

function aplicarTotales(valores, filas) {
    const subtotalBruto = filas.reduce((total, fila) => total + fila.cantidad * fila.precio, 0);
    const subtotalNeto = filas.reduce((total, fila) => total + fila.subtotal, 0);
    const iva = filas.reduce((total, fila) => total + fila.subtotal * fila.ivaPorcentaje / 100, 0);
    const formato = numero => numero.toFixed(2).replace(".", ",");
    return {
        ...valores,
        subtotalBruto:formato(subtotalBruto),
        descuentoTotal:formato(subtotalBruto - subtotalNeto),
        subtotalNeto:formato(subtotalNeto),
        iva:formato(iva),
        percepciones:"0,00",
        total:formato(subtotalNeto + iva)
    };
}

export function crearDatosPedidoPrueba(cantidadFilas = 8) {
    const filas = Array.from({ length:cantidadFilas }, (_, indice) => crearFila(indice + 1));
    const valoresBase = Object.fromEntries(
        CONTROLES_VTS_PEDIDOS_VISIBLES.map(item => [item.campo, valorControl(item)])
    );
    const idsCombo = Object.fromEntries(
        CONTROLES_VTS_PEDIDOS_VISIBLES
            .filter(item => item.nombre === "cmb")
            .map(item => [item.campo, entero(1, 999)])
    );
    const objetos = Object.fromEntries(
        OBJETOS_VTS_PEDIDOS.map(objeto => [
            objeto.campo,
            Object.fromEntries(objeto.campos.map(campo => [campo.campo, valorCampoObjeto(objeto, campo)]))
        ])
    );
    return { valores:aplicarTotales(valoresBase, filas), idsCombo, objetos, filas };
}

function escaparXML(valor) {
    return String(valor ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&apos;");
}

function normalizarNumeroLegacy(valor) {
    const texto = String(valor ?? "").trim();
    if (!texto) return "";
    return texto.includes(",") ? texto.replaceAll(".", "").replace(",", ".") : texto;
}

function datoXML(nombre, indice, fila, columna, valor) {
    return `    <DATO Nombre="${escaparXML(nombre)}" Indice="${indice}" Row="${fila}" Col="${columna}" Valor="${escaparXML(valor)}" />`;
}

function agregarGrilla(datos, indiceGrilla, columnas, filas) {
    columnas.forEach(columna => datos.push(datoXML("grd", indiceGrilla, 0, columna.indice, columna.titulo)));
    filas.forEach((fila, indiceFila) => columnas.forEach(columna => {
        const valor = columna.formato === "decimal" || columna.formato === "entero"
            ? normalizarNumeroLegacy(fila[columna.campo])
            : fila[columna.campo];
        datos.push(datoXML("grd", indiceGrilla, indiceFila + 1, columna.indice, valor));
    }));
    datos.push(datoXML("grdRows", indiceGrilla, 0, 0, filas.length + 1));
}

export function crearFilasTotalesPorUnidad(filas) {
    const acumulados = new Map();
    filas.forEach(fila => {
        const actual = acumulados.get(fila.unidadCodigo) ?? { cantidad:0, bultos:0 };
        actual.cantidad += Number(fila.cantidad) || 0;
        actual.bultos += Number(fila.bultos) || 0;
        acumulados.set(fila.unidadCodigo, actual);
    });
    const resultado = [...acumulados.entries()].map(([unidad, total], indice) => ({
        unidadId:indice + 1, unidad, cantidad:total.cantidad, bultos:total.bultos, peso:0, volumen:0
    }));
    resultado.push({
        unidadId:0,
        unidad:"TOTAL",
        cantidad:resultado.reduce((total, fila) => total + fila.cantidad, 0),
        bultos:resultado.reduce((total, fila) => total + fila.bultos, 0),
        peso:0,
        volumen:0
    });
    return resultado;
}

export function generarMQLPedidoVisible({ valores, idsCombo, objetos, filas }) {
    const ahora = new Date();
    const datos = [];

    CONTROLES_VTS_PEDIDOS_VISIBLES.forEach(item => {
        const valor = item.tipo === "numero" || item.tipo === "entero"
            ? normalizarNumeroLegacy(valores[item.campo])
            : valores[item.campo];
        datos.push(datoXML(item.nombre.toLowerCase(), item.indice, 0, 0, valor));
        if (item.nombre === "cmb") datos.push(datoXML("cmbid", item.indice, 0, 0, idsCombo[item.campo] ?? -1));
    });

    OBJETOS_VTS_PEDIDOS.forEach(objeto => objeto.campos.forEach(campo => {
        const valor = objetos?.[objeto.campo]?.[campo.campo] ?? "";
        datos.push(datoXML(
            `${objeto.nombreLegacy}.${campo.campo}`,
            objeto.indice,
            0,
            0,
            campo.tipo === "entero" ? normalizarNumeroLegacy(valor) : valor
        ));
    }));

    agregarGrilla(datos, 0, COLUMNAS_VTS_PEDIDOS_VISIBLES, filas);
    agregarGrilla(
        datos,
        3,
        COLUMNAS_VTS_PEDIDOS_TOTALES_UNIDAD,
        crearFilasTotalesPorUnidad(filas)
    );

    const cabecera = {
        FECHA:ahora.toLocaleDateString("es-AR"), HORA:ahora.toLocaleTimeString("es-AR"),
        USUARIO:"PRUEBA REACT", TERMINAL:"REACT", VERSION:"XX-DBGA", PLANTILLA:7003,
        PROGRAMA_CODIGO:"PED0", NUMERACION:77, COMPROBANTE_NUMERO:valores.numero,
        COMPROBANTE_TIPO:2202, TIPO_PROCESO:4, COPIAS:valores.copias,
        IMPRESORA:"", BANDEJA:0, DESTINO_IMPRESION:2,
        NOMBRE_PDF:"Prueba_vtsPedido_React", DESTINO_MAIL:"", ASUNTO_MAIL:"",
        COTIZACION_LOCAL:1, COTIZACION_REF:1
    };
    const nodosCabecera = Object.entries(cabecera)
        .map(([nombre, valor]) => `    <${nombre}>${escaparXML(valor)}</${nombre}>`)
        .join("\n");
    return `<?xml version="1.0" encoding="utf-8"?>\n<MQL>\n  <CABECERA>\n${nodosCabecera}\n  </CABECERA>\n  <DATOS>\n${datos.join("\n")}\n  </DATOS>\n</MQL>\n`;
}
