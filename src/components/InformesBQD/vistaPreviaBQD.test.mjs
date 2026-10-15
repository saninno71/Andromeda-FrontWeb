import assert from "node:assert/strict";
import test from "node:test";

import { descargarArchivoBQD } from "./vistaPreviaBQD.js";

test("descarga el archivo con el nombre asignado y libera su URL", async () => {
    const eventos = [];
    const enlace = {
        style:{},
        click:() => eventos.push("click"),
        remove:() => eventos.push("remove")
    };
    const documento = {
        createElement:(etiqueta) => {
            assert.equal(etiqueta, "a");
            return enlace;
        },
        body:{
            appendChild:(elemento) => {
                assert.equal(elemento, enlace);
                eventos.push("append");
            }
        }
    };
    const urlApi = {
        createObjectURL:(archivo) => {
            assert.equal(archivo, "contenido-pdf");
            return "blob:informe";
        },
        revokeObjectURL:(url) => eventos.push(`revoke:${url}`)
    };

    const resultado = descargarArchivoBQD(
        "contenido-pdf",
        "Asientos_2026-10-13.pdf",
        { documento, urlApi }
    );

    assert.deepEqual(resultado, {
        nombre:"Asientos_2026-10-13.pdf",
        url:"blob:informe"
    });
    assert.equal(enlace.href, "blob:informe");
    assert.equal(enlace.download, "Asientos_2026-10-13.pdf");
    assert.deepEqual(eventos, ["append", "click", "remove"]);

    await new Promise((resolver) => setTimeout(resolver, 0));
    assert.deepEqual(eventos, ["append", "click", "remove", "revoke:blob:informe"]);
});
