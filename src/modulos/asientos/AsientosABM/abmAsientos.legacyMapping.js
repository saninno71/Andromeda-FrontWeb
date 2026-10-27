const LEGACY_FORM_NAME = "frmctbAsientosABM";
const LEGACY_CONTRACT_VERSION = "andromeda-legacy-form-v1";

const CAMPOS_GRILLA_LEGACY = [
    { index: 0, title: "ID", field: "renglonID", numeric: true },
    { index: 1, title: "ComprobanteID", field: "comprobanteID", numeric: true },
    { index: 2, title: "CuentaID", field: "cuentaID", numeric: true },
    { index: 3, title: "Cuenta", field: "cuentaCodigo" },
    { index: 4, title: "Cuenta Nombre", field: "cuentaNombre" },
    { index: 5, title: "Subcuenta Tipo", field: "subcuentaTipo", numeric: true },
    { index: 6, title: "Tipo", field: "tipo", numeric: true },
    { index: 7, title: "Debe", field: "debe", numeric: true, total: true },
    { index: 8, title: "Haber", field: "haber", numeric: true, total: true },
    { index: 9, title: "impAplicado", field: "impAplicado", numeric: true, total: true },
    { index: 10, title: "Detalle", field: "detalle" },
    { index: 11, title: "vtsComprobanteID", field: "vtsComprobanteID", numeric: true },
    { index: 12, title: "ClienteID", field: "clienteID", numeric: true },
    { index: 13, title: "Cliente", field: "clienteCodigo", numeric: true },
    { index: 14, title: "cpsComprobanteID", field: "cpsComprobanteID", numeric: true },
    { index: 15, title: "ProveedorID", field: "proveedorID", numeric: true },
    { index: 16, title: "Proveedor", field: "proveedorCodigo", numeric: true },
    { index: 17, title: "fdsComprobanteID", field: "fdsComprobanteID", numeric: true },
    { index: 18, title: "CajaID", field: "cajaID", numeric: true },
    { index: 19, title: "Caja", field: "cajaCodigo" },
    { index: 20, title: "Subcuenta Nombre", field: "subcuentaNombre" },
    { index: 21, title: "Debe en moneda local", field: "debeLocal", numeric: true, total: true },
    { index: 22, title: "Haber en moneda local", field: "haberLocal", numeric: true, total: true },
    { index: 23, title: "Debe en moneda de referencia", field: "debeReferencia", numeric: true, total: true },
    { index: 24, title: "Haber en moneda de referencia", field: "haberReferencia", numeric: true, total: true },
    { index: 25, title: "LocalidadID", field: "localidadID", numeric: true },
    { index: 26, title: "IIBBProvinciaID", field: "jurisdiccionID", numeric: true },
    { index: 27, title: "Jurisdicción", field: "jurisdiccionCodigo" },
    { index: 28, title: "Jurisdicción Nombre", field: "jurisdiccionNombre" },
    { index: 29, title: "VendedorID", field: "vendedorID", numeric: true },
    { index: 30, title: "Vendedor", field: "vendedorCodigo" },
    { index: 31, title: "Vendedor Nombre", field: "vendedorNombre" },
    { index: 32, title: "CobradorID", field: "cobradorID", numeric: true },
    { index: 33, title: "Cobrador", field: "cobradorCodigo" },
    { index: 34, title: "Cobrador Nombre", field: "cobradorNombre" },
    { index: 35, title: "EmpresaID", field: "empresaID", numeric: true },
    { index: 36, title: "IVACategoriaID", field: "ivaCategoriaID", numeric: true }
];

const CONTROLES_ESTATICOS = [
    { name: "tit", index: 0, legacyType: "Label", property: "Caption", value: "Fecha:" },
    { name: "tit", index: 1, legacyType: "Label", property: "Caption", value: "Detalle:" },
    { name: "tit", index: 3, legacyType: "Label", property: "Caption", value: "Empresa:" },
    { name: "tit", index: 4, legacyType: "Label", property: "Caption", value: "Numeración:" },
    { name: "tit", index: 5, legacyType: "Label", property: "Caption", value: "Número:" },
    { name: "tit", index: 6, legacyType: "Label", property: "Caption", value: "Moneda:" },
    { name: "tit", index: 7, legacyType: "Label", property: "Caption", value: "Modelo:" },
    { name: "tit", index: 23, legacyType: "Label", property: "Caption", value: "Punto de venta" },
    { name: "tit", index: 26, legacyType: "Label", property: "Caption", value: "Imprimir:" },
    { name: "ref", index: 5, legacyType: "Label", property: "Caption", value: "(número asignado automáticamente)" },
    { name: "ref", index: 26, legacyType: "Label", property: "Caption", value: "copia(s)" },
    { name: "lbl", index: 100, legacyType: "Label", property: "Caption", value: "" }
];

function valorTexto(value) {
    return value == null ? "" : String(value);
}

function fechaLegacy(value) {
    if (value == null || value === "") return "";
    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return valorTexto(value);
    const part = number => String(number).padStart(2, "0");
    return `${part(date.getDate())}/${part(date.getMonth() + 1)}/${date.getFullYear()}`;
}

function controlText(name, index, legacyType, value, dataType = "text") {
    return {
        name,
        index,
        legacyType,
        property: "Text",
        dataType,
        value: valorTexto(value)
    };
}

function controlCombo(index, text, selectedId) {
    return {
        name: "cmb",
        index,
        legacyType: "ComboBox",
        property: "Text",
        value: valorTexto(text),
        selectedId: selectedId ?? -1
    };
}

function sumar(rows, field) {
    return rows.reduce((total, row) => {
        const value = Number(row?.[field]);
        return Number.isFinite(value) ? total + value : total;
    }, 0);
}

function crearControles(state, options) {
    const model = state.modeloAsiento;
    const controls = [
        controlText("fch", 0, "SRPFecha", fechaLegacy(state.fecha)),
        controlText("txx", 1, "SRPText", state.detalle),
        controlText("txt", 2, "TextBox", state.observaciones),
        controlCombo(3, state.empresa?.empresaNombre, state.empresa?.empresaID),
        controlCombo(4, state.numeracion?.descripcion, state.numeracion?.numeraTipoID),
        controlText("txx", 5, "SRPText", state.numero, "number"),
        controlText("txx", 6, "SRPText", state.moneda?.monedaCodigo),
        controlText("nom", 6, "ComboBox", state.moneda?.monedaNombre),
        controlCombo(7, model?.nombre ?? model?.descripcion ?? "(NINGUNO)", model?.id),
        controlText("txx", 23, "SRPText", state.puntoVenta, "number"),
        controlText("txx", 26, "SRPText", options.copies ?? 1, "number"),
        ...CONTROLES_ESTATICOS
    ];

    for (const column of CAMPOS_GRILLA_LEGACY.filter(item => item.total)) {
        controls.push({
            name: "tot",
            index: column.index,
            legacyType: "Label",
            property: "Caption",
            dataType: "number",
            value: sumar(state.renglones ?? [], column.field)
        });
    }

    return controls;
}

function objectField(name, value) {
    return { name, value: value ?? null };
}

function crearObjetos(state) {
    const empresaCompleta = state.entidadesExternas?.empresa?.datos;
    const empresa = {
        ...(empresaCompleta ?? {}),
        empresaID: state.empresa?.empresaID ?? empresaCompleta?.empresaID ?? null,
        empresaCodigo: state.empresa?.empresaCodigo || empresaCompleta?.empresaCodigo || "",
        empresaNombre: state.empresa?.empresaNombre || empresaCompleta?.empresaNombre || ""
    };
    return [
        {
            source: "abmEmpresa.MatrizCampos",
            legacyClass: "abmgnrEmpresa",
            fields: [
                objectField("abmgnrempresa.id", empresa?.empresaID),
                objectField("abmgnrempresa.codigo", empresa?.empresaCodigo),
                objectField("abmgnrempresa.nombre", empresa?.empresaNombre),
                objectField("abmgnrempresa.domicilio", empresa?.domicilio),
                objectField("abmgnrempresa.cp", empresa?.cp),
                objectField("abmgnrempresa.provincianombre", empresa?.provinciaNombre),
                objectField("abmgnrempresa.telefono1", empresa?.telefono1),
                objectField("abmgnrempresa.tipotelefono1", empresa?.tipoTelefono1),
                objectField("abmgnrempresa.paisnombre", empresa?.paisNombre),
                objectField("abmgnrempresa.web", empresa?.web)
            ]
        },
        {
            source: "abmNumeraTipo.MatrizCampos",
            legacyClass: "abmgnrNumeraTipo",
            fields: [
                objectField("abmgnrnumeratipo.id", state.numeracion?.numeraTipoID),
                objectField("abmgnrnumeratipo.descripcion", state.numeracion?.descripcion)
            ]
        },
        {
            source: "abmMoneda.MatrizCampos",
            legacyClass: "abmgnrMoneda",
            fields: [
                objectField("abmgnrmoneda.id", state.moneda?.monedaID),
                objectField("abmgnrmoneda.codigo", state.moneda?.monedaCodigo),
                objectField("abmgnrmoneda.nombre", state.moneda?.monedaNombre)
            ]
        }
    ];
}

function crearGrilla(state) {
    const missingStateFields = new Set();
    const rows = (state.renglones ?? []).map((row, rowIndex) => ({
        row: rowIndex + 1,
        cells: CAMPOS_GRILLA_LEGACY.map(column => {
            const sourceRow = column.field === "comprobanteID"
                ? { ...row, comprobanteID: state.comprobanteID }
                : row;
            if (!Object.prototype.hasOwnProperty.call(sourceRow, column.field)) {
                missingStateFields.add(`renglones[].${column.field}`);
            }
            return {
                column: column.index,
                value: sourceRow[column.field] ?? null
            };
        })
    }));

    return {
        grid: {
            name: "grd",
            index: 0,
            legacyType: "MSHFlexGrid",
            columns: CAMPOS_GRILLA_LEGACY.map(column => ({ ...column })),
            rows,
            dataRowCount: rows.length
        },
        missingStateFields: [...missingStateFields]
    };
}

/**
 * Traduce el estado funcional de React al formulario lógico que consumía
 * basInformes.XML_MQL_Datos/XML_MQL_Grilla/XML_MQL_Objeto en VB6.
 * No lee controles React ni el DOM y todavía no genera el XML MQL.
 */
export function crearSnapshotLegacyAsiento(state, options = {}) {
    if (!state || typeof state !== "object") {
        throw new TypeError("Se requiere el estado funcional de ABM Asientos.");
    }

    const { grid, missingStateFields } = crearGrilla(state);
    return {
        contractVersion: LEGACY_CONTRACT_VERSION,
        formNameLegacy: LEGACY_FORM_NAME,
        controls: crearControles(state, options),
        objects: crearObjetos(state),
        grids: [grid],
        diagnostics: {
            missingStateFields
        }
    };
}

export {
    CAMPOS_GRILLA_LEGACY,
    LEGACY_CONTRACT_VERSION,
    LEGACY_FORM_NAME
};
