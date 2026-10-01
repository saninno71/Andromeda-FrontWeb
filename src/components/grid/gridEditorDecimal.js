export function obtenerDecimalesMascara(mascara = "0,00") {
    const parteDecimal = String(mascara).split(",")[1];
    return parteDecimal ? parteDecimal.length : 0;
}

function agruparMiles(digitos) {
    return digitos.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

export function formatearValorEditorDecimal(valor, mascara = "0,00") {
    if (valor == null || valor === "") return "";

    const numero = Number(valor);
    if (!Number.isFinite(numero)) return "";

    const decimales = obtenerDecimalesMascara(mascara);
    return numero.toLocaleString("es-AR", {
        minimumFractionDigits: decimales,
        maximumFractionDigits: decimales,
        useGrouping: String(mascara).includes(".")
    });
}

export function analizarTextoEditorDecimal(texto, mascara = "0,00") {
    const original = String(texto ?? "").trim();
    if (!original) return { texto: "", valor: null };

    const negativo = original.startsWith("-");
    const sinSigno = original.replace(/-/g, "");
    const tieneSeparadorDecimal = sinSigno.includes(",");
    const [parteEnteraOriginal, ...partesDecimales] = sinSigno.split(",");
    const digitosEnteros = parteEnteraOriginal.replace(/\D/g, "");
    const decimalesPermitidos = obtenerDecimalesMascara(mascara);
    const digitosDecimales = partesDecimales
        .join("")
        .replace(/\D/g, "")
        .slice(0, decimalesPermitidos);

    if (!digitosEnteros && !digitosDecimales && !tieneSeparadorDecimal) {
        return negativo
            ? { texto: "-", valor: null }
            : { texto: "", valor: null };
    }

    const enteroNormalizado = (digitosEnteros || "0").replace(/^0+(?=\d)/, "");
    const enteroVisible = String(mascara).includes(".")
        ? agruparMiles(enteroNormalizado)
        : enteroNormalizado;
    const mostrarSeparador = decimalesPermitidos > 0 && tieneSeparadorDecimal;
    const textoNormalizado =
        (negativo ? "-" : "") +
        enteroVisible +
        (mostrarSeparador ? `,${digitosDecimales}` : "");
    const valorNormalizado = Number(
        `${negativo ? "-" : ""}${enteroNormalizado}.${digitosDecimales || "0"}`
    );

    return {
        texto: textoNormalizado,
        valor: Number.isFinite(valorNormalizado) ? valorNormalizado : null
    };
}

export function calcularCursorEditorDecimal(textoOriginal, cursorOriginal, textoFormateado) {
    const caracteresSignificativos = String(textoOriginal)
        .slice(0, Math.max(0, cursorOriginal ?? 0))
        .replace(/[^\d,-]/g, "")
        .length;

    if (caracteresSignificativos === 0) return 0;

    let encontrados = 0;
    for (let indice = 0; indice < textoFormateado.length; indice += 1) {
        if (/[\d,-]/.test(textoFormateado[indice])) encontrados += 1;
        if (encontrados === caracteresSignificativos) return indice + 1;
    }

    return textoFormateado.length;
}
