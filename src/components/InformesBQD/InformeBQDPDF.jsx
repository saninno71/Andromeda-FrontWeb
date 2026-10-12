import {
    Document,
    Page,
    StyleSheet,
    Text,
    View
} from "@react-pdf/renderer";

import { formatearValor } from "../updFormatos.js";
import { obtenerValorColumna } from "../grid/gridValores.js";
import {
    agruparColumnasInforme,
    aplicarLayoutColumnasInforme,
    prepararFilasInformeBQD
} from "./informeBQD.funcional.js";

const styles = StyleSheet.create({
    pagina: {
        paddingTop:110,
        paddingRight:22,
        paddingBottom:24,
        paddingLeft:22,
        fontFamily:"Helvetica",
        fontSize:6.5,
        color:"#202020"
    },
    encabezado: {
        position:"absolute",
        top:16,
        right:22,
        left:22
    },
    encabezadoSuperior: {
        flexDirection:"row",
        justifyContent:"space-between",
        fontSize:7
    },
    titulo: {
        marginTop:5,
        paddingBottom:4,
        borderBottomWidth:0.7,
        borderBottomColor:"#303030",
        textAlign:"center",
        fontFamily:"Helvetica-Bold",
        fontSize:8
    },
    filtros: {
        marginTop:5,
        minHeight:15,
        fontSize:6.2,
        lineHeight:1.2
    },
    cantidad: {
        marginBottom:3,
        fontSize:6.2
    },
    encabezadosColumnas: {
        borderTopWidth:0.5,
        borderTopColor:"#606060",
        borderBottomWidth:0.5,
        borderBottomColor:"#606060",
        paddingVertical:2
    },
    linea: {
        flexDirection:"row",
        minHeight:10,
        flexGrow:0,
        flexShrink:0
    },
    lineaRegistro: {
        alignSelf:"flex-start",
        width:"100%",
        minHeight:10,
        flexBasis:10
    },
    celda: {
        paddingHorizontal:1.5,
        paddingVertical:1,
        lineHeight:1.12
    },
    celdaTitulo: {
        fontFamily:"Helvetica-Bold",
        fontSize:6.2
    },
    registro: {
        paddingVertical:1.5,
        borderBottomWidth:6.5,
        borderBottomColor:"#FFFFFF",
        flexGrow:0,
        flexShrink:0,
        justifyContent:"flex-start",
        alignItems:"stretch"
    },
    registroAlternado: {
        backgroundColor:"#D9D9D9"
    },
    pie: {
        position:"absolute",
        right:22,
        bottom:9,
        left:22,
        textAlign:"right",
        color:"#606060",
        fontSize:6
    }
});

function alineacion(columna) {
    return ["left", "center", "right"].includes(columna.align)
        ? columna.align
        : "left";
}

function Celda({ columna, children, titulo = false }) {
    return (
        <Text
            style={[
                styles.celda,
                titulo && styles.celdaTitulo,
                {
                    flexGrow:columna.ancho,
                    flexBasis:0,
                    textAlign:alineacion(columna)
                }
            ]}
        >
            {children}
        </Text>
    );
}

function LineaEncabezado({ columnas }) {
    return (
        <View style={styles.linea}>
            {columnas.map(columna => (
                <Celda key={columna.campo} columna={columna} titulo>
                    {columna.titulo}
                </Celda>
            ))}
        </View>
    );
}

function LineaRegistro({ columnas, fila }) {
    return (
        <View style={[styles.linea, styles.lineaRegistro]}>
            {columnas.map(columna => {
                const valor = formatearValor(
                    obtenerValorColumna(fila, columna),
                    columna.formato,
                    columna.mascara
                );
                return (
                    <Celda key={columna.campo} columna={columna}>
                        {String(valor ?? "")}
                    </Celda>
                );
            })}
        </View>
    );
}

export function InformeBQDPDF({
    titulo,
    columnas,
    layoutColumnas,
    filas,
    filtros,
    busqueda,
    orden,
    generadoEn
}) {
    const columnasOrdenadas = aplicarLayoutColumnasInforme(columnas, layoutColumnas);
    const lineasColumnas = agruparColumnasInforme(columnasOrdenadas);
    const filasOrdenadas = prepararFilasInformeBQD({
        filas,
        columnas:columnasOrdenadas,
        busqueda,
        orden
    });
    const fechaGeneracion = new Date(generadoEn).toLocaleString("es-AR");
    const lineasFiltros = Math.max(1, Math.ceil(String(filtros ?? "").length / 160));
    const altoEncabezado = 62 + lineasColumnas.length * 11 + (lineasFiltros - 1) * 7;

    return (
        <Document title={titulo} creator="Andrómeda">
            <Page
                size="A4"
                orientation="landscape"
                wrap
                style={[styles.pagina, { paddingTop:altoEncabezado }]}
            >
                <View fixed style={styles.encabezado}>
                    <View style={styles.encabezadoSuperior}>
                        <Text>Andrómeda</Text>
                        <Text>{fechaGeneracion}</Text>
                    </View>
                    <Text style={styles.titulo}>{titulo}</Text>
                    <Text style={styles.filtros}>Filtros: {filtros || "Sin filtros"}</Text>
                    <Text style={styles.cantidad}>Cantidad de registros: {filasOrdenadas.length}</Text>
                    <View style={styles.encabezadosColumnas}>
                        {lineasColumnas.map((linea, indice) => (
                            <LineaEncabezado key={indice} columnas={linea} />
                        ))}
                    </View>
                </View>

                {filasOrdenadas.map((fila, indice) => (
                    <View
                        key={`${fila.comprobanteID ?? indice}-${fila.monedaCodigo ?? ""}`}
                        wrap={false}
                        style={[
                            styles.registro,
                            indice % 2 === 0 && styles.registroAlternado
                        ]}
                    >
                        {lineasColumnas.map((linea, numeroLinea) => (
                            <LineaRegistro
                                key={numeroLinea}
                                columnas={linea}
                                fila={fila}
                            />
                        ))}
                    </View>
                ))}

                <Text
                    fixed
                    style={styles.pie}
                    render={({ pageNumber, totalPages }) =>
                        `Página ${pageNumber} de ${totalPages}`
                    }
                />
            </Page>
        </Document>
    );
}
