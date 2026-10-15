const control = (campo, titulo, nombre, indice, tipo = "texto", extra = {}) => ({
    campo, titulo, nombre, indice, tipo, ...extra
});

// Controles de datos del vtsPedidosABM actual. Se incluyen también los que el
// formulario hace visibles de manera condicional por código.
export const CONTROLES_VTS_PEDIDOS_VISIBLES = [
    control("empresa", "Empresa", "cmb", 0),
    control("numeraTipo", "Tipo de numeración", "cmb", 25),
    control("domicilioEntrega", "Domicilio de entrega", "cmb", 34),
    control("estado", "Estado", "cmb", 38),
    control("incoterm", "Incoterm", "cmb", 39, "texto", { visibilidadOrigen:"Visible para proformas" }),
    control("documentoTipo", "Tipo de documento", "cmb", 41),
    control("anulacionMotivo", "Motivo de anulación", "cmb", 43, "texto", { visibilidadOrigen:"Visible cuando el pedido está anulado" }),
    control("empresaCuentaCorriente", "Empresa de cuenta corriente", "cmb", 44),
    control("fecha", "Fecha", "fch", 1, "fecha"),
    control("fechaEntrega", "Fecha de entrega", "fch", 30, "fecha"),
    control("clienteNombre", "Cliente nombre", "nom", 2),
    control("vendedorNombre", "Vendedor nombre", "nom", 5),
    control("cobradorNombre", "Cobrador nombre", "nom", 6),
    control("condicionVentaNombre", "Condición de venta nombre", "nom", 7),
    control("listaPreciosNombre", "Lista de precios nombre", "nom", 8),
    control("monedaNombre", "Moneda nombre", "nom", 9),
    control("iibbProvinciaNombre", "Jurisdicción IIBB nombre", "nom", 22),
    control("transporteNombre", "Transporte nombre", "nom", 35),
    control("clienteCuentaCorrienteNombre", "Cliente CC nombre", "nom", 42, "texto", { visibilidadOrigen:"Visible si difiere del cliente" }),
    control("observaciones", "Observaciones", "txt", 32),
    control("clienteCodigo", "Cliente código", "txx", 2),
    control("codigoBarras", "Código de barras", "txx", 4),
    control("vendedorCodigo", "Vendedor código", "txx", 5),
    control("cobradorCodigo", "Cobrador código", "txx", 6),
    control("condicionVentaCodigo", "Condición de venta código", "txx", 7),
    control("listaPreciosCodigo", "Lista de precios código", "txx", 8),
    control("monedaCodigo", "Moneda código", "txx", 9),
    control("detalle", "Detalle", "txx", 10),
    control("descuento1Porcentaje", "Descuento 1 %", "txx", 12, "numero"),
    control("descuento2Porcentaje", "Descuento 2 %", "txx", 13, "numero"),
    control("descuento3Porcentaje", "Descuento 3 %", "txx", 14, "numero"),
    control("descuento4Porcentaje", "Descuento 4 %", "txx", 15, "numero"),
    control("iibbProvinciaCodigo", "Jurisdicción IIBB código", "txx", 22),
    control("puntoVenta", "Punto de venta", "txx", 23, "entero"),
    control("numero", "Número", "txx", 24, "entero"),
    control("copias", "Copias", "txx", 26, "entero"),
    control("ordenCompra", "Orden de compra", "txx", 28),
    control("solicitante", "Solicitante", "txx", 29),
    control("transporteCodigo", "Transporte código", "txx", 35),
    control("cantidadBultos", "Cantidad de bultos", "txx", 36, "numero"),
    control("valorDeclarado", "Valor declarado", "txx", 37, "numero"),
    control("documentoNumero", "Número de documento", "txx", 41, "texto", { visibilidadOrigen:"Alterna con el control CUIT" }),
    control("clienteCuentaCorrienteCodigo", "Cliente CC código", "txx", 42, "texto", { visibilidadOrigen:"Visible si difiere del cliente" }),
    control("subtotalBruto", "Subtotal bruto", "txxtot", 11, "numero"),
    control("descuentoTotal", "Descuento total", "txxtot", 16, "numero"),
    control("subtotalNeto", "Subtotal neto", "txxtot", 17, "numero"),
    control("iva", "IVA", "txxtot", 18, "numero"),
    control("percepciones", "Percepciones", "txxtot", 19, "numero"),
    control("total", "Total", "txxtot", 20, "numero"),
    control("descuento1Importe", "Descuento 1 importe", "txxtot", 1201, "numero"),
    control("descuento2Importe", "Descuento 2 importe", "txxtot", 1301, "numero"),
    control("descuento3Importe", "Descuento 3 importe", "txxtot", 1401, "numero"),
    control("descuento4Importe", "Descuento 4 importe", "txxtot", 1501, "numero")
];

export const COLUMNAS_VTS_PEDIDOS_VISIBLES = [
    { campo:"item", titulo:"Item", indice:3, ancho:55, formato:"entero", align:"right", key:true, visibilidadOrigen:"Según parámetro vtsArticuloItemOK" },
    { campo:"articuloCodigo", titulo:"Artículo", indice:5, ancho:105, formato:"texto", align:"left" },
    { campo:"descripcion", titulo:"Descripción", indice:7, ancho:210, formato:"texto", align:"left" },
    { campo:"unidadCodigo", titulo:"Unidad", indice:9, ancho:70, formato:"texto", align:"left" },
    { campo:"cantidad", titulo:"Cantidad", indice:12, ancho:95, formato:"decimal", align:"right" },
    { campo:"monedaCodigoArticulo", titulo:"Moneda", indice:14, ancho:70, formato:"texto", align:"left", visibilidadOrigen:"Habilitada por vtsPedidosABM" },
    { campo:"precioArticulo", titulo:"Precio art.", indice:16, ancho:110, formato:"decimal", align:"right", visibilidadOrigen:"Habilitada por vtsPedidosABM" },
    { campo:"precio", titulo:"Precio", indice:17, ancho:105, formato:"decimal", align:"right" },
    { campo:"descuento1", titulo:"Dto. #1 %", indice:18, ancho:80, formato:"decimal", align:"right" },
    { campo:"descuento2", titulo:"Dto. #2 %", indice:19, ancho:80, formato:"decimal", align:"right" },
    { campo:"precioNeto", titulo:"Precio neto", indice:21, ancho:110, formato:"decimal", align:"right" },
    { campo:"subtotal", titulo:"Subtotal", indice:22, ancho:115, formato:"decimal", align:"right" },
    { campo:"ivaPorcentaje", titulo:"IVA %", indice:23, ancho:75, formato:"decimal", align:"right" },
    { campo:"bultos", titulo:"Bultos", indice:24, ancho:75, formato:"decimal", align:"right" },
    { campo:"depositoCodigo", titulo:"Depósito", indice:26, ancho:75, formato:"texto", align:"left" },
    { campo:"depositoNombre", titulo:"Depósito nombre", indice:27, ancho:150, formato:"texto", align:"left" },
    { campo:"articuloTipoNombre", titulo:"Tipo de artículo", indice:30, ancho:120, formato:"texto", align:"left" },
    { campo:"cantidadAfectada", titulo:"Cant. afectada", indice:38, ancho:100, formato:"decimal", align:"right", visibilidadOrigen:"Habilitada por vtsPedidosABM" },
    { campo:"comprobanteAfectado", titulo:"Comprobante afectado", indice:49, ancho:165, formato:"texto", align:"left", visibilidadOrigen:"Habilitada por vtsPedidosABM" },
    { campo:"ubicacion", titulo:"Ubicación", indice:74, ancho:95, formato:"texto", align:"left" }
];

export const COLUMNAS_VTS_PEDIDOS_TOTALES_UNIDAD = [
    { campo:"unidadId", titulo:"UnidadID", indice:0, ancho:80, formato:"entero", align:"right", key:true },
    { campo:"unidad", titulo:"Unidad", indice:1, ancho:180, formato:"texto", align:"left" },
    { campo:"cantidad", titulo:"Cantidad", indice:2, ancho:120, formato:"decimal", align:"right" },
    { campo:"bultos", titulo:"Bultos", indice:3, ancho:110, formato:"decimal", align:"right" },
    { campo:"peso", titulo:"Peso (Kg)", indice:4, ancho:120, formato:"decimal", align:"right" },
    { campo:"volumen", titulo:"Volumen (m3)", indice:5, ancho:130, formato:"decimal", align:"right" }
];

export const OBJETOS_VTS_PEDIDOS = [
    { campo:"empresa", titulo:"Empresa", nombreLegacy:"abmgnrempresa", indice:0, campos:[
        { campo:"id", titulo:"ID", tipo:"entero" }, { campo:"codigo", titulo:"Código", tipo:"texto" },
        { campo:"nombre", titulo:"Nombre", tipo:"texto" }, { campo:"numerodoc", titulo:"CUIT", tipo:"texto" },
        { campo:"domicilio", titulo:"Domicilio", tipo:"texto" }, { campo:"ivacategorianombre", titulo:"Categoría IVA", tipo:"texto" }
    ] },
    { campo:"numeraTipo", titulo:"Tipo de numeración", nombreLegacy:"abmgnrnumeratipo", indice:0, campos:[
        { campo:"id", titulo:"ID", tipo:"entero" }, { campo:"nombre", titulo:"Nombre", tipo:"texto" },
        { campo:"simbolo", titulo:"Símbolo", tipo:"texto" }, { campo:"tipo", titulo:"Tipo de comprobante", tipo:"entero" },
        { campo:"numeracionid", titulo:"Numeración ID", tipo:"entero" }, { campo:"letra", titulo:"Letra", tipo:"texto" },
        { campo:"puntoventa", titulo:"Punto de venta", tipo:"entero" }, { campo:"numero", titulo:"Número", tipo:"entero" },
        { campo:"plantillaid", titulo:"Plantilla ID", tipo:"entero" }
    ] },
    { campo:"cliente", titulo:"Cliente", nombreLegacy:"abmvtscliente", indice:0, campos:[
        { campo:"id", titulo:"ID", tipo:"entero" }, { campo:"codigo", titulo:"Código", tipo:"texto" },
        { campo:"nombre", titulo:"Nombre", tipo:"texto" }, { campo:"numerodoc", titulo:"CUIT", tipo:"texto" },
        { campo:"domicilio", titulo:"Domicilio", tipo:"texto" }, { campo:"condicionnombre", titulo:"Condición de venta", tipo:"texto" },
        { campo:"transportenombre", titulo:"Transporte", tipo:"texto" },
        { campo:"variable4", titulo:"Variable 4", tipo:"texto", requeridoPlantilla:true }
    ] },
    { campo:"vendedor", titulo:"Vendedor", nombreLegacy:"abmvtscorredor", indice:0, campos:[
        { campo:"id", titulo:"ID", tipo:"entero" }, { campo:"codigo", titulo:"Código", tipo:"texto" },
        { campo:"nombre", titulo:"Nombre", tipo:"texto" }, { campo:"domicilio", titulo:"Domicilio", tipo:"texto" }
    ] },
    { campo:"cobrador", titulo:"Cobrador", nombreLegacy:"abmvtscorredor", indice:1, campos:[
        { campo:"id", titulo:"ID", tipo:"entero" }, { campo:"codigo", titulo:"Código", tipo:"texto" },
        { campo:"nombre", titulo:"Nombre", tipo:"texto" }, { campo:"domicilio", titulo:"Domicilio", tipo:"texto" }
    ] }
];

export const REFERENCIAS_PLANTILLA_7003 = [
    "txx(24)", "txx(5)", "fch(1)", "fch(30)", "nom(2)", "txx(2)",
    "txx(12)", "txx(13)", "txx(14)", "txx(28)", "nom(7)", "cmb(34)",
    "nom(35)", "txx(35)", "txt(32)", "abmvtscliente.variable4(0)",
    "grd(0,0,5)", "grd(0,0,7)", "grd(0,-1,5)", "grd(0,-1,7)",
    "grd(0,-1,12)", "grd(0,-1,38)", "grd(3,-1,1)", "grd(3,-1,2)"
];

export const REFERENCIAS_PLANTILLA_7003_FALTANTES = [];

export const FUNCIONES_PLANTILLA_7003 = [
    "NombreCliente+Numero",
    "leyDesc1 / leyDesc2 / leyDesc3",
    "ClienteItem4",
    "Expreso y domicilio (consultas SQL)",
    "Pendiente = cantidad pedida - cantidad afectada"
];

export function claveLegacy({ nombre, indice }) {
    return `${nombre}(${indice})`;
}
