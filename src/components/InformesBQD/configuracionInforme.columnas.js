export const COLUMNAS_DISPONIBLES_INFORME = [
    { campo:"campo", titulo:"Campo", key:true, visible:false },
    { campo:"titulo", titulo:"Título", ancho:220, proporcion:1 }
];

export const COLUMNAS_INCLUIDAS_INFORME = [
    { campo:"campo", titulo:"Campo", key:true, visible:false },
    { campo:"titulo", titulo:"Título", ancho:220, proporcion:3 },
    { campo:"ancho", titulo:"Tamaño", ancho:80, proporcion:1, align:"right" }
];

const PIXELES_POR_PULGADA = 96;
const MILIMETROS_POR_PULGADA = 25.4;

export function pixelesAMilimetros(pixeles) {
    const valor = Number(pixeles);
    if (!Number.isFinite(valor) || valor <= 0) return 1;
    return Math.max(1, Math.round(valor * MILIMETROS_POR_PULGADA / PIXELES_POR_PULGADA));
}

export function milimetrosAPixeles(milimetros) {
    const valor = Number(milimetros);
    if (!Number.isFinite(valor) || valor <= 0) return 1;
    return Math.max(1, Math.round(valor * PIXELES_POR_PULGADA / MILIMETROS_POR_PULGADA));
}
