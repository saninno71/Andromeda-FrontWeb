// Este módulo no depende de React, del DOM ni de los formularios.
export function crearFiltrosAsientos(ahora = new Date()) {
    return {
        fechaDesde: new Date(ahora.getFullYear(), ahora.getMonth(), 1), fechaHasta: null,
        empresaSeleccionada: null, cuentaSeleccionada: null, clienteSeleccionado: null,
        proveedorSeleccionado: null, numeraTipoSeleccionado: null, detalle: "",
        cajaBancaria: "", numeroDesde: "", numeroHasta: ""
    };
}
const copiar = valor => structuredClone(valor);
const claveFila = fila => JSON.stringify([fila.comprobanteID, fila.monedaCodigo]);
function fechaParametro(fecha) {
    return fecha instanceof Date && !Number.isNaN(fecha.getTime())
        ? fecha.getFullYear() * 10000 + (fecha.getMonth() + 1) * 100 + fecha.getDate() : 0;
}
export function parametrosConsultaAsientos(filtros) {
    return {
        fechaDesde: fechaParametro(filtros.fechaDesde), fechaHasta: fechaParametro(filtros.fechaHasta),
        empresaID: filtros.empresaSeleccionada?.empresaID, cuentaID: filtros.cuentaSeleccionada?.cuentaID,
        clienteID: filtros.clienteSeleccionado?.clienteID, proveedorID: filtros.proveedorSeleccionado?.proveedorID,
        numeraTipoID: filtros.numeraTipoSeleccionado?.numeraTipoID, detalle: filtros.detalle,
        numeroDesde: filtros.numeroDesde === "" ? null : Number(filtros.numeroDesde),
        numeroHasta: filtros.numeroHasta === "" ? null : Number(filtros.numeroHasta)
    };
}

export function crearAsientosFuncional({ cargarPagina, configuracion, hijos = {}, ahora } = {}) {
    const config = { tamanoPrimeraPagina:100, tamanoPagina:1500, topeRegistros:5000, pausaEntrePaginas:80, ...configuracion };
    const oyentes = new Set();
    const cargadoresHijos = new Map(Object.entries(hijos));
    const cacheHijos = new Map();
    let secuencia = 0;
    let controlador = null;
    let consultaPendiente = null;
    let estado = {
        filtros: crearFiltrosAsientos(ahora), filtrosAplicados: null, parametrosAplicados: null,
        consulta: { dataGrid: [], cargando: false, cargandoPaginas: false, totalRegistrosRemotos: null,
            registrosCargados:0, avisoTopeRegistros:null, versionEnfoqueGrid:0, consultaEjecutada:false, error:null },
        edicionesLocales: {}, celdasModificadas: [], edicionPendiente:null,
        vista: { busqueda:"", orden:[] }
    };
    function publicar(cambio) { estado = { ...estado, ...cambio }; oyentes.forEach(notificar => notificar()); }
    function consulta(cambio) { publicar({ consulta: { ...estado.consulta, ...cambio } }); }
    function actualizarFiltro(campo, valor) {
        if (!Object.hasOwn(estado.filtros, campo)) throw new Error(`Filtro desconocido: ${campo}`);
        publicar({ filtros: { ...estado.filtros, [campo]: copiar(valor) } });
    }
    async function ejecutarConsulta() {
        const id = ++secuencia;
        controlador?.abort();
        const abort = new AbortController(); controlador = abort;
        const filtros = copiar(estado.filtros);
        const parametros = parametrosConsultaAsientos(filtros);
        publicar({ filtrosAplicados:filtros, parametrosAplicados:parametros,
            edicionesLocales:{}, celdasModificadas:[], edicionPendiente:null });
        consulta({ dataGrid:[], cargando:true, cargandoPaginas:false, totalRegistrosRemotos:null,
            registrosCargados:0, avisoTopeRegistros:null, consultaEjecutada:true, error:null });
        try {
            const primera = await cargarPagina(parametros, { top:config.tamanoPrimeraPagina, skip:0, incluirTotal:true, signal:abort.signal });
            if (id !== secuencia) return;
            const total = primera.total ?? primera.items.length;
            const filas = [...primera.items];
            const limite = Math.min(total, config.topeRegistros);
            consulta({ dataGrid:[...filas], cargando:false, totalRegistrosRemotos:total,
                registrosCargados:filas.length, versionEnfoqueGrid:estado.consulta.versionEnfoqueGrid + 1,
                cargandoPaginas:filas.length < limite });
            while (filas.length < limite) {
                const pagina = await cargarPagina(parametros, { top:Math.min(config.tamanoPagina, limite-filas.length), skip:filas.length, incluirTotal:false, signal:abort.signal });
                if (id !== secuencia) return;
                if (!pagina.items.length) throw new Error("La consulta devolvió una página vacía antes de completar los registros.");
                filas.push(...pagina.items);
                consulta({ registrosCargados:filas.length });
                if (config.pausaEntrePaginas) await new Promise(resolve => setTimeout(resolve, config.pausaEntrePaginas));
                if (id !== secuencia) return;
            }
            consulta({ dataGrid:filas, avisoTopeRegistros:total > config.topeRegistros ? {totalRegistros:total,topeRegistros:config.topeRegistros} : null });
        } catch (error) {
            if (id === secuencia && !abort.signal.aborted) consulta({ error:error.message });
        } finally {
            if (id === secuencia) { consulta({ cargando:false, cargandoPaginas:false }); controlador = null; }
        }
    }
    function consultar() {
        consultaPendiente = ejecutarConsulta();
        return consultaPendiente;
    }
    function actualizarFilaLocal({ filaOriginal, filaNueva, keyFila, cambios }) {
        publicar({ edicionesLocales: { ...estado.edicionesLocales, [claveFila(filaOriginal)]:copiar(filaNueva) },
            celdasModificadas:[...new Set([...estado.celdasModificadas,...cambios.map(c => `${keyFila}|${c.campo}`)])] });
    }
    function registrarHijo(nombre, cargar) {
        if (typeof cargar !== "function") throw new Error("El módulo hijo debe exponer una operación de carga.");
        cargadoresHijos.set(nombre, cargar); cacheHijos.delete(nombre);
    }
    async function prepararHijos(contexto, signal) {
        const resultado = {};
        await Promise.all([...cargadoresHijos].map(async ([nombre, cargar]) => {
            // Se comparte la carga, pero cada consumidor recibe su propia instantánea.
            const clave = JSON.stringify(contexto);
            let entrada = cacheHijos.get(nombre);
            if (!entrada || entrada.clave !== clave) {
                entrada = { clave, promesa:Promise.resolve().then(() => cargar(copiar(contexto))) };
                cacheHijos.set(nombre, entrada);
            }
            try { resultado[nombre] = copiar(await entrada.promesa); }
            finally { if (cacheHijos.get(nombre) === entrada) cacheHijos.delete(nombre); }
        }));
        signal?.throwIfAborted();
        return resultado;
    }
    async function prepararDatosInforme({ todosLosRegistros = true, signal } = {}) {
        let pendiente;
        do {
            pendiente = consultaPendiente;
            await pendiente;
        } while (pendiente !== consultaPendiente);
        signal?.throwIfAborted();
        const instantanea = copiar(estado);
        if (instantanea.consulta.error) throw new Error(instantanea.consulta.error);
        const filtros = instantanea.filtrosAplicados ?? instantanea.filtros;
        const parametros = instantanea.parametrosAplicados ?? parametrosConsultaAsientos(filtros);
        const datosHijos = await prepararHijos({ filtros, parametros }, signal);
        let filas = instantanea.consulta.dataGrid;
        let total = instantanea.consulta.totalRegistrosRemotos;
        if (todosLosRegistros && (!instantanea.consulta.consultaEjecutada || filas.length < total)) {
            filas = [];
            do {
                signal?.throwIfAborted();
                const pagina = await cargarPagina(parametros, { top:config.tamanoPagina, skip:filas.length, incluirTotal:filas.length === 0, signal });
                if (filas.length === 0) total = pagina.total ?? pagina.items.length;
                if (!pagina.items.length && filas.length < total) throw new Error("No se pudieron completar los registros del informe.");
                filas.push(...pagina.items);
            } while (filas.length < total);
        }
        signal?.throwIfAborted();
        return copiar({ generadoEn:new Date().toISOString(), filtrosActuales:instantanea.filtros,
            filtrosAplicados:filtros, parametrosAplicados:parametros, hijos:datosHijos,
            consultaEjecutada:instantanea.consulta.consultaEjecutada,
            filas:filas.map(fila => instantanea.edicionesLocales[claveFila(fila)] ?? fila),
            totalRegistros:total ?? filas.length, completa:todosLosRegistros || (instantanea.consulta.consultaEjecutada && filas.length === total),
            vista:instantanea.vista, edicionPendiente:instantanea.edicionPendiente,
            contieneEdicionesLocales:Object.keys(instantanea.edicionesLocales).length > 0 });
    }
    return {
        obtenerEstado:() => estado,
        suscribir:oyente => { oyentes.add(oyente); return () => oyentes.delete(oyente); },
        actualizarFiltro, consultar, actualizarFilaLocal, registrarHijo, prepararDatosInforme,
        actualizarEdicion:edicion => publicar({edicionPendiente:copiar(edicion)}),
        actualizarBusqueda:busqueda => publicar({vista:{...estado.vista,busqueda}}),
        actualizarOrden:orden => publicar({vista:{...estado.vista,orden:copiar(orden)}}),
        cerrarAviso:() => consulta({avisoTopeRegistros:null}),
        cancelarCarga:() => { ++secuencia; controlador?.abort(); controlador=null; }
    };
}
