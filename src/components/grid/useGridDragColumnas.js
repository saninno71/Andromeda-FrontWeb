import { useState } from "react";
import {
    PointerSensor,
    useSensor,
    useSensors
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";

export function useGridDragColumnas({
    setColumnasOrdenadas
}) {

    const [columnaDestino,setColumnaDestino] = useState(null);

    const sensoresColumnas = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 6
            }
        })
    );

    function manejarFinArrastreColumnas(event) {

        const {active,over} = event;
        setColumnaDestino(null);

        if (!over || active.id === over.id) {
            return;
        }

        setColumnasOrdenadas(columnasActuales => {

            const indiceOrigen =
                columnasActuales.findIndex(
                    columna => columna.campo === active.id
                );

            const indiceDestino =
                columnasActuales.findIndex(
                    columna => columna.campo === over.id
                );

            if (indiceOrigen === -1 || indiceDestino === -1) {
                return columnasActuales;
            }

            return arrayMove(
                columnasActuales,
                indiceOrigen,
                indiceDestino
            );

        });

    }

    function manejarArrastreSobreColumnas(event) {

        const {active,over} = event;

        if (!over || active.id === over.id) {
            setColumnaDestino(null);
            return;
        }

        setColumnaDestino(over.id);

    }

    function manejarCancelarArrastreColumnas() {

        setColumnaDestino(null);

    }

    return {
        columnaDestino,
        sensoresColumnas,
        manejarFinArrastreColumnas,
        manejarArrastreSobreColumnas,
        manejarCancelarArrastreColumnas
    };

}
