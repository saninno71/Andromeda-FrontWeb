import assert from "node:assert/strict";
import test from "node:test";

import {
    paginarBloquesAnidadosInforme,
    paginarBloquesInforme
} from "./paginacionInformeBQD.js";

test("pagina bloques completos sin superar la altura disponible", () => {
    const bloques = [20, 30, 25, 10].map((alto, indice) => ({ indice, alto }));
    const paginas = paginarBloquesInforme(bloques, 50);

    assert.deepEqual(
        paginas.map(pagina => pagina.map(bloque => bloque.indice)),
        [[0, 1], [2, 3]]
    );
});

test("mantiene unido un bloque mayor que una página", () => {
    const bloque = { indice:0, alto:120 };
    assert.deepEqual(paginarBloquesInforme([bloque], 50), [[bloque]]);
});

test("genera una página vacía para un informe sin registros", () => {
    assert.deepEqual(paginarBloquesInforme([], 50), [[]]);
});

test("mantiene junta una fila principal y su subgrilla cuando entran", () => {
    const subgrilla = {
        altoCabecera:10,
        filas:[{ alto:12 }, { alto:12 }],
        totales:{ alto:8 }
    };
    const paginas = paginarBloquesAnidadosInforme([{
        indice:0,
        altoPrincipal:15,
        subgrillas:[subgrilla]
    }], 60);

    assert.equal(paginas.length, 1);
    assert.deepEqual(paginas[0].map(componente => componente.tipo), [
        "principal",
        "subgrillaCabecera",
        "subgrillaFila",
        "subgrillaFila",
        "subgrillaTotales"
    ]);
});

test("divide una subgrilla y repite su cabecera en la página siguiente", () => {
    const subgrilla = {
        altoCabecera:10,
        filas:[{ alto:15 }, { alto:15 }, { alto:15 }],
        totales:{ alto:8 }
    };
    const paginas = paginarBloquesAnidadosInforme([{
        indice:0,
        altoPrincipal:15,
        subgrillas:[subgrilla]
    }], 50);

    assert.equal(paginas.length, 2);
    assert.deepEqual(paginas[0].map(componente => componente.tipo), [
        "principal",
        "subgrillaCabecera",
        "subgrillaFila"
    ]);
    assert.deepEqual(paginas[1].map(componente => componente.tipo), [
        "subgrillaCabecera",
        "subgrillaFila",
        "subgrillaFila",
        "subgrillaTotales"
    ]);
    assert.equal(paginas[1][0].continuacion, true);
});
