import { useCallback,useState } from "react";

const VISTA_DEFAULT = {
    id:"default",
    nombre:"Default",
    esDefault:true
};

const TAMANO_FUENTE_DEFAULT = 13;

function leerVistasGuardadas(storageKey) {

    try
    {
        const datos =
            JSON.parse(
                localStorage.getItem(storageKey)
            );

        return {
            vistaActualID:
                datos?.vistaActualID || VISTA_DEFAULT.id,
            vistas:
                Array.isArray(datos?.vistas)
                    ? datos.vistas
                    : []
        };
    }
    catch(error)
    {
        console.error(error);
        return {
            vistaActualID:VISTA_DEFAULT.id,
            vistas:[]
        };
    }

}

function guardarVistas(storageKey,vistas,vistaActualID) {

    localStorage.setItem(
        storageKey,
        JSON.stringify({
            vistaActualID,
            vistas
        })
    );

}

function obtenerProximoNombreVista(vistasGuardadas) {

    const numeros =
        vistasGuardadas
        .map(vista => {
            const match =
                vista.nombre.match(/^Grilla (\d+)$/);

            return match
                ? Number(match[1])
                : 0;
        });

    const proximoNumero =
        Math.max(0,...numeros) + 1;

    return `Grilla ${proximoNumero}`;

}

function armarIDVista(nombre) {

    return nombre
        .toLowerCase()
        .replace(/\s+/g,"-");

}

export function useGridPreferencias({
    storageKey,
    tamanoFuenteDefault = TAMANO_FUENTE_DEFAULT
}) {

    const [datosVistasIniciales] = useState(() =>
        leerVistasGuardadas(storageKey)
    );

    const [vistasGuardadas,setVistasGuardadas] =
        useState(datosVistasIniciales.vistas);
    const [vistaGridActualID,setVistaGridActualID] =
        useState(datosVistasIniciales.vistaActualID);

    const vistaInicial =
        datosVistasIniciales.vistas.find(
            vista => vista.id === datosVistasIniciales.vistaActualID
        );

    const [tamanoFuenteGrid,setTamanoFuenteGrid] =
        useState(vistaInicial?.fontSize || tamanoFuenteDefault);
    const [layoutColumnasGrid,setLayoutColumnasGrid] =
        useState(vistaInicial?.columns || null);
    const [layoutVersion,setLayoutVersion] = useState(0);
    const [layoutActualGrid,setLayoutActualGrid] = useState([]);

    const vistasGrid = [
        VISTA_DEFAULT,
        ...vistasGuardadas
    ];

    function ampliarTextoGrid() {
        setTamanoFuenteGrid(tamanoActual =>
            Math.min(15,tamanoActual + 1)
        );
    }

    function reducirTextoGrid() {
        setTamanoFuenteGrid(tamanoActual =>
            Math.max(11,tamanoActual - 1)
        );
    }

    const actualizarLayoutActualGrid = useCallback((layout) => {
        setLayoutActualGrid(layout);
    }, []);

    function armarVista(nombre) {

        return {
            id:armarIDVista(nombre),
            nombre,
            fontSize:tamanoFuenteGrid,
            columns:layoutActualGrid
        };

    }

    function guardarComoNueva() {

        const nombre =
            obtenerProximoNombreVista(vistasGuardadas);

        const nuevaVista =
            armarVista(nombre);

        const vistasActualizadas = [
            ...vistasGuardadas,
            nuevaVista
        ];

        setVistasGuardadas(vistasActualizadas);
        setVistaGridActualID(nuevaVista.id);
        guardarVistas(
            storageKey,
            vistasActualizadas,
            nuevaVista.id
        );

    }

    function guardarGrilla() {

        if (vistaGridActualID === VISTA_DEFAULT.id) {
            guardarComoNueva();
            return;
        }

        const vistasActualizadas =
            vistasGuardadas.map(vista =>
                vista.id === vistaGridActualID
                    ? {
                        ...vista,
                        fontSize:tamanoFuenteGrid,
                        columns:layoutActualGrid
                    }
                    : vista
            );

        setVistasGuardadas(vistasActualizadas);
        guardarVistas(
            storageKey,
            vistasActualizadas,
            vistaGridActualID
        );

    }

    function seleccionarVistaGrid(vistaID) {

        setVistaGridActualID(vistaID);

        if (vistaID === VISTA_DEFAULT.id) {
            setTamanoFuenteGrid(tamanoFuenteDefault);
            setLayoutColumnasGrid(null);
            setLayoutVersion(version => version + 1);
            guardarVistas(
                storageKey,
                vistasGuardadas,
                vistaID
            );
            return;
        }

        const vista =
            vistasGuardadas.find(
                item => item.id === vistaID
            );

        if (!vista) {
            return;
        }

        setTamanoFuenteGrid(
            vista.fontSize || tamanoFuenteDefault
        );
        setLayoutColumnasGrid(vista.columns || null);
        setLayoutVersion(version => version + 1);
        guardarVistas(
            storageKey,
            vistasGuardadas,
            vistaID
        );

    }

    return {
        vistasGrid,
        vistaGridActualID,
        tamanoFuenteGrid,
        layoutColumnasGrid,
        layoutVersion,
        ampliarTextoGrid,
        reducirTextoGrid,
        actualizarLayoutActualGrid,
        guardarGrilla,
        guardarComoNueva,
        seleccionarVistaGrid
    };

}
