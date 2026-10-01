import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { crearModeloAsientos } from "./asientos.modulos.js";

export function useAsientos({ ejecutarConsultaInicial = false } = {}) {
    const [modelo] = useState(crearModeloAsientos);
    const estado = useSyncExternalStore(modelo.suscribir, modelo.obtenerEstado, modelo.obtenerEstado);
    useEffect(() => {
        if (ejecutarConsultaInicial) modelo.consultar();
        return modelo.cancelarCarga;
    }, [modelo, ejecutarConsultaInicial]);
    const filas = useMemo(() => estado.consulta.dataGrid.map(fila =>
        estado.edicionesLocales[JSON.stringify([fila.comprobanteID, fila.monedaCodigo])] ?? fila
    ), [estado.consulta.dataGrid, estado.edicionesLocales]);
    const celdasModificadas = useMemo(() => new Set(estado.celdasModificadas), [estado.celdasModificadas]);
    return { modelo, estado, filas, celdasModificadas };
}
