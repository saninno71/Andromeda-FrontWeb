import { useSortable } from "@dnd-kit/sortable";
import {CSS} from "@dnd-kit/utilities";

function GridHeaderColumnaOrdenable({
    columna,
    estilo,
    clase,
    esDestino,
    onOrdenar,
    onIniciarResize,
    onAlternarAncho,
    children
}) {

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({
        id: columna.campo
    });

    return (
        <th
            ref={setNodeRef}
            className={`
                ${clase}
                ${isDragging ? "thArrastrando" : ""}
                ${esDestino ? "thDestinoArrastre" : ""}
            `}
            key={columna.campo}
            style={{
                ...estilo,
                position:"relative",
                transform: CSS.Transform.toString(transform),
                transition
            }}
            onClick={(e) => {
                if (!e.ctrlKey) {
                    return;
                }

                e.preventDefault();
                e.stopPropagation();
                onAlternarAncho(columna);
            }}
            onDoubleClick={() => onOrdenar(columna.campo)}
            {...attributes}
            {...listeners}
        >
            {children}
            <div
                className="resizeColumnaHandle"
                onPointerDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onIniciarResize(columna,e);
                }}
                onDoubleClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                }}
            ></div>
        </th>
    );

}

export default GridHeaderColumnaOrdenable;
