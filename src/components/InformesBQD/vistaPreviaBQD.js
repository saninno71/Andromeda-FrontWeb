export function abrirVentanaVistaPreviaBQD() {
    const ventana = window.open("", "_blank");
    if (!ventana) {
        throw new Error("El navegador bloqueó la ventana de vista previa.");
    }
    ventana.document.title = "Generando informe";
    ventana.document.body.innerHTML = "<p style='font-family:Arial,sans-serif'>Generando informe...</p>";
    return ventana;
}

export function mostrarArchivoEnVistaPreviaBQD(ventana, archivo) {
    const url = URL.createObjectURL(archivo);
    ventana.location.replace(url);
    return url;
}

export function descargarArchivoBQD(
    archivo,
    nombreArchivo,
    { documento = document, urlApi = URL } = {}
) {
    const nombre = String(nombreArchivo || "informe.pdf").trim() || "informe.pdf";
    const url = urlApi.createObjectURL(archivo);
    const enlace = documento.createElement("a");
    enlace.href = url;
    enlace.download = nombre;
    enlace.style.display = "none";
    documento.body.appendChild(enlace);
    enlace.click();
    enlace.remove();
    setTimeout(() => urlApi.revokeObjectURL(url), 0);
    return { nombre, url };
}
