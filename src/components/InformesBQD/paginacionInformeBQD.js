export function paginarBloquesInforme(bloques = [], altoDisponible = 0) {
    if (!Number.isFinite(altoDisponible) || altoDisponible <= 0) {
        throw new Error("La altura disponible del informe debe ser mayor que cero.");
    }

    const paginas = [];
    let pagina = [];
    let altoOcupado = 0;

    bloques.forEach(bloque => {
        const alto = Number(bloque?.alto) || 0;
        if (pagina.length > 0 && altoOcupado + alto > altoDisponible) {
            paginas.push(pagina);
            pagina = [];
            altoOcupado = 0;
        }
        pagina.push(bloque);
        altoOcupado += alto;
    });

    if (pagina.length > 0 || bloques.length === 0) paginas.push(pagina);
    return paginas;
}

export function paginarBloquesAnidadosInforme(bloques = [], altoDisponible = 0) {
    if (!Number.isFinite(altoDisponible) || altoDisponible <= 0) {
        throw new Error("La altura disponible del informe debe ser mayor que cero.");
    }

    const paginas = [];
    let pagina = [];
    let altoOcupado = 0;
    const cerrarPagina = () => {
        paginas.push(pagina);
        pagina = [];
        altoOcupado = 0;
    };
    const agregar = componente => {
        pagina.push(componente);
        altoOcupado += Number(componente?.alto) || 0;
    };
    const noEntra = alto => pagina.length > 0 && altoOcupado + alto > altoDisponible;

    bloques.forEach(bloque => {
        const subgrillas = Array.isArray(bloque.subgrillas) ? bloque.subgrillas : [];
        if (subgrillas.length === 0) {
            if (noEntra(bloque.altoPrincipal)) cerrarPagina();
            agregar({ tipo:"principal", bloque, alto:bloque.altoPrincipal });
            return;
        }

        const primeraSubgrilla = subgrillas[0];
        const primerContenido = primeraSubgrilla.filas[0]?.alto
            ?? primeraSubgrilla.totales?.alto
            ?? 0;
        const minimoInicial = bloque.altoPrincipal + primeraSubgrilla.altoCabecera + primerContenido;
        if (noEntra(minimoInicial)) cerrarPagina();
        agregar({ tipo:"principal", bloque, alto:bloque.altoPrincipal });

        subgrillas.forEach((subgrilla, indiceSubgrilla) => {
            const primerAlto = subgrilla.filas[0]?.alto ?? subgrilla.totales?.alto ?? 0;
            if (noEntra(subgrilla.altoCabecera + primerAlto)) cerrarPagina();
            agregar({
                tipo:"subgrillaCabecera",
                bloque,
                subgrilla,
                indiceSubgrilla,
                alto:subgrilla.altoCabecera
            });

            subgrilla.filas.forEach((fila, indiceFila) => {
                const esUltima = indiceFila === subgrilla.filas.length - 1;
                const altoTotales = esUltima ? (subgrilla.totales?.alto ?? 0) : 0;
                if (noEntra(fila.alto + altoTotales)) {
                    cerrarPagina();
                    agregar({
                        tipo:"subgrillaCabecera",
                        bloque,
                        subgrilla,
                        indiceSubgrilla,
                        continuacion:true,
                        alto:subgrilla.altoCabecera
                    });
                }
                agregar({
                    tipo:"subgrillaFila",
                    bloque,
                    subgrilla,
                    fila,
                    indiceFila,
                    alto:fila.alto
                });
            });

            if (subgrilla.totales) {
                if (noEntra(subgrilla.totales.alto)) {
                    cerrarPagina();
                    agregar({
                        tipo:"subgrillaCabecera",
                        bloque,
                        subgrilla,
                        indiceSubgrilla,
                        continuacion:true,
                        alto:subgrilla.altoCabecera
                    });
                }
                agregar({
                    tipo:"subgrillaTotales",
                    bloque,
                    subgrilla,
                    totales:subgrilla.totales,
                    alto:subgrilla.totales.alto
                });
            }
        });
    });

    if (pagina.length > 0 || bloques.length === 0) paginas.push(pagina);
    return paginas;
}
