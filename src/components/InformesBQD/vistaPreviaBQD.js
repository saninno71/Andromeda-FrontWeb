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
