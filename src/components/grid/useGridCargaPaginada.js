import { useEffect,useRef,useState } from "react";

function esperar(ms) {

    return new Promise(resolve => {
        window.setTimeout(resolve,ms);
    });

}

export function useGridCargaPaginada({
    cargarPagina,
    configuracion,
    ejecutarConsultaInicial = false,
    filtrosIniciales = null
}) {

    const {
        tamanoPrimeraPagina = tamanoPagina,
        tamanoPagina,
        topeRegistros,
        pausaEntrePaginas
    } = configuracion;

    const [dataGrid,setDataGrid] = useState([]);
    const [cargando,setCargando] = useState(false);
    const [cargandoPaginas,setCargandoPaginas] = useState(false);
    const [totalRegistrosRemotos,setTotalRegistrosRemotos] = useState(null);
    const [registrosCargados,setRegistrosCargados] = useState(0);
    const [avisoTopeRegistros,setAvisoTopeRegistros] = useState(null);
    const [versionEnfoqueGrid,setVersionEnfoqueGrid] = useState(0);
    const [consultaEjecutada,setConsultaEjecutada] = useState(
        ejecutarConsultaInicial
    );
    const consultaActualRef = useRef(0);
    const consultaAbortRef = useRef(null);

    async function cargar(filtros) {

        const consultaID = consultaActualRef.current + 1;
        consultaActualRef.current = consultaID;
        consultaAbortRef.current?.abort();

        const abortController = new AbortController();
        consultaAbortRef.current = abortController;

        try
        {
            setCargando(true);
            setCargandoPaginas(false);
            setTotalRegistrosRemotos(null);
            setRegistrosCargados(0);
            setAvisoTopeRegistros(null);
            setConsultaEjecutada(true);
            setDataGrid([]);

            const primeraPagina = await cargarPagina(
                filtros,
                {
                    top:tamanoPrimeraPagina,
                    skip:0,
                    incluirTotal:true,
                    signal:abortController.signal
                }
            );

            if (consultaActualRef.current !== consultaID) {
                return;
            }

            const totalRemoto =
                primeraPagina.total ?? primeraPagina.items.length;

            setDataGrid(primeraPagina.items);
            setTotalRegistrosRemotos(totalRemoto);
            setVersionEnfoqueGrid(version => version + 1);
            setCargando(false);

            const limiteCarga =
                Math.min(
                    totalRemoto,
                    topeRegistros
                );

            let registrosCargados = primeraPagina.items.length;
            const datosAcumulados = [
                ...primeraPagina.items
            ];
            setRegistrosCargados(registrosCargados);

            if (registrosCargados >= limiteCarga) {
                if (totalRemoto > topeRegistros) {
                    setAvisoTopeRegistros({
                        totalRegistros:totalRemoto,
                        topeRegistros
                    });
                }
                return;
            }

            setCargandoPaginas(true);

            while (
                registrosCargados < limiteCarga &&
                consultaActualRef.current === consultaID
            ) {
                const pagina = await cargarPagina(
                    filtros,
                    {
                        top:Math.min(
                            tamanoPagina,
                            limiteCarga - registrosCargados
                        ),
                        skip:registrosCargados,
                        incluirTotal:false,
                        signal:abortController.signal
                    }
                );

                if (consultaActualRef.current !== consultaID) {
                    return;
                }

                if (pagina.items.length === 0) {
                    break;
                }

                registrosCargados += pagina.items.length;
                datosAcumulados.push(...pagina.items);
                setRegistrosCargados(registrosCargados);

                await esperar(pausaEntrePaginas);
            }

            if (
                consultaActualRef.current === consultaID &&
                datosAcumulados.length !== primeraPagina.items.length
            ) {
                setDataGrid(datosAcumulados);
            }

            if (
                consultaActualRef.current === consultaID &&
                totalRemoto > topeRegistros
            ) {
                setAvisoTopeRegistros({
                    totalRegistros:totalRemoto,
                    topeRegistros
                });
            }
        }
        finally
        {
            if (consultaActualRef.current === consultaID) {
                setCargando(false);
                setCargandoPaginas(false);
                consultaAbortRef.current = null;
            }
        }

    }

    useEffect(() => {

        if (ejecutarConsultaInicial && filtrosIniciales) {
            cargar(filtrosIniciales);
        }

        return () => {
            consultaActualRef.current += 1;
            consultaAbortRef.current?.abort();
            consultaAbortRef.current = null;
        };

    }, [ejecutarConsultaInicial]);

    return {
        dataGrid,
        cargando,
        cargandoPaginas,
        totalRegistrosRemotos,
        registrosCargados,
        avisoTopeRegistros,
        versionEnfoqueGrid,
        consultaEjecutada,
        cerrarAvisoTopeRegistros:() => setAvisoTopeRegistros(null),
        cargar
    };

}
