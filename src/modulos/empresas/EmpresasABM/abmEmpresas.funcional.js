const copiar = valor => structuredClone(valor);

export function crearEstadoInicialEmpresa(empresaID = null) {
    return {
        empresaID: empresaID == null ? null : Number(empresaID),
        empresa: null,
        cargando: false,
        cargado: false,
        error: null
    };
}

export function transformarEmpresaABM(datos, empresaID) {
    const id = Number(datos?.empresaID ?? empresaID);
    return {
        empresaID: id,
        empresaCodigo: datos?.empresaCodigo ?? null,
        empresaNombre: datos?.empresaNombre ?? "",
        agendaID: datos?.agendaID ?? null,
        domicilio: datos?.domicilio ?? "",
        calle: datos?.calle ?? "",
        altura: datos?.altura ?? null,
        pisoDpto: datos?.pisoDpto ?? "",
        barrio: datos?.barrio ?? "",
        localidadID: datos?.localidadID ?? null,
        localidadNombre: datos?.localidadNombre ?? "",
        cp: datos?.cp ?? "",
        provinciaID: datos?.provinciaID ?? null,
        provinciaNombre: datos?.provinciaNombre ?? "",
        paisID: datos?.paisID ?? null,
        paisNombre: datos?.paisNombre ?? "",
        tipoTelefono1: datos?.tipoTelefono1 ?? "",
        telefono1: datos?.telefono1 ?? "",
        web: datos?.web ?? ""
    };
}

export function crearABMEmpresas({ empresaID, cargarEmpresa }) {
    if (typeof cargarEmpresa !== "function") {
        throw new Error("El modelo de Empresas requiere un proveedor de carga.");
    }

    let estado = crearEstadoInicialEmpresa(empresaID);
    let secuenciaCarga = 0;
    let controladorCarga = null;
    const oyentes = new Set();

    const publicar = cambio => {
        estado = { ...estado, ...cambio };
        oyentes.forEach(oyente => oyente());
    };

    async function cargar(nuevaEmpresaID = estado.empresaID) {
        const id = Number(nuevaEmpresaID);
        if (!Number.isInteger(id) || id <= 0) {
            publicar({
                empresaID: nuevaEmpresaID ?? null,
                empresa: null,
                cargando: false,
                cargado: false,
                error: "La empresa solicitada no es válida."
            });
            return;
        }

        const secuencia = ++secuenciaCarga;
        controladorCarga?.abort();
        controladorCarga = new AbortController();
        const { signal } = controladorCarga;

        publicar({
            empresaID: id,
            empresa: null,
            cargando: true,
            cargado: false,
            error: null
        });

        try {
            const respuesta = await cargarEmpresa(id, { signal });
            if (secuencia !== secuenciaCarga || signal.aborted) return;
            publicar({
                empresa: transformarEmpresaABM(respuesta, id),
                cargando: false,
                cargado: true,
                error: null
            });
        } catch (error) {
            if (secuencia !== secuenciaCarga || signal.aborted || error?.name === "AbortError") return;
            publicar({
                empresa: null,
                cargando: false,
                cargado: false,
                error: error?.message || "No se pudo cargar la empresa."
            });
        }
    }

    return {
        cargar,
        cancelarCarga() {
            controladorCarga?.abort();
        },
        obtenerEstado() {
            return copiar(estado);
        },
        suscribir(oyente) {
            oyentes.add(oyente);
            return () => oyentes.delete(oyente);
        },
        destruir() {
            controladorCarga?.abort();
            oyentes.clear();
        }
    };
}
