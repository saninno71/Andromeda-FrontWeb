// Implementación anterior conservada temporalmente para comparar ambos motores.
import { createElement } from "react";
import { pdf } from "@react-pdf/renderer";

import { InformeBQDPDF } from "./InformeBQDPDF.jsx";

export async function generarArchivoInformeBQDReactPdf(propiedades) {
    const documento = createElement(InformeBQDPDF, propiedades);
    return pdf(documento).toBlob();
}
