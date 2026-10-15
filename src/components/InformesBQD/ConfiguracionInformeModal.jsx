import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import MenuCintaAcciones from "../MenuCintaAcciones/MenuCintaAcciones";
import BotonToolbar from "../BotonToolbar/BotonToolbar";
import Grid from "../grid/Grid";
import InputCombo from "../InputCombo/InputCombo";
import InputTexto from "../InputTexto/InputTexto";
import ModalHeader from "../ModalHeader/ModalHeader";
import ComboFormatosInforme from "./ComboFormatosInforme";
import ComboGrillasInforme from "./ComboGrillasInforme";
import {
    COLUMNAS_DISPONIBLES_INFORME,
    COLUMNAS_INCLUIDAS_INFORME,
    milimetrosAPixeles,
    pixelesAMilimetros
} from "./configuracionInforme.columnas";
import { COLORES_INTERLINEADO } from "./coloresInterlineado";
import iconoFlecha from "../../assets/iconFlechaC.png";
import iconoExcel from "./assets/excel.svg";
import iconoPDF from "./assets/pdf.svg";
import iconoVistaPrevia from "./assets/vista-previa.svg";
import "./ConfiguracionInformeModal.css";

const DESTINOS = Object.freeze([
    { id:"vistaPrevia", texto:"Vista preliminar", icono:iconoVistaPrevia },
    { id:"pdf", texto:"PDF", icono:iconoPDF },
    { id:"excel", texto:"Excel", icono:iconoExcel }
]);

function renderColorInterlineado(color) {
    return (
        <span className="configuracionInformeMuestraColor">
            <span
                className="configuracionInformeMuestraColorCuadro"
                style={{ backgroundColor:color.color }}
                aria-hidden="true"
            />
            <span>{color.nombre}</span>
        </span>
    );
}

function crearNombreArchivoPredeterminado() {
    const fecha = new Date();
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2,"0");
    const dia = String(fecha.getDate()).padStart(2,"0");
    return `Asientos_${anio}-${mes}-${dia}`;
}

function prepararColumnasFormato(configuracion) {
    const columnas = Array.isArray(configuracion?.columnas)
        ? configuracion.columnas
        : [];
    const layout = Array.isArray(configuracion?.layoutColumnas)
        ? configuracion.layoutColumnas
        : [];
    const orden = new Map(layout.map((columna,index) => [columna.campo,index]));
    const configuracionPorCampo = new Map(
        layout.map((columna) => [columna.campo,columna])
    );

    return columnas
        .map((columna,index) => {
            const configuracionColumna = configuracionPorCampo.get(columna.campo);
            return {
                ...columna,
                ...configuracionColumna,
                campo:columna.campo,
                orden:orden.get(columna.campo) ?? layout.length + index
            };
        })
        .sort((a,b) => a.orden - b.orden);
}

function crearSeccionCabecera(configuracion) {
    return {
        seccionID:"cabecera",
        nombre:"Cabecera",
        tipo:"cabecera",
        obligatoria:true,
        incluida:true,
        imprimirTitulos:true,
        imprimirTotales:true,
        columnas:configuracion?.columnas || [],
        layoutColumnas:configuracion?.layoutColumnas || []
    };
}

function normalizarGrillas(configuracion) {
    const configuradas = Array.isArray(configuracion?.grillas) && configuracion.grillas.length
        ? configuracion.grillas
        : [{
            grillaID:"principal",
            nombre:"Principal",
            incluida:true,
            secciones:[crearSeccionCabecera(configuracion)]
        }];

    return configuradas.map((grilla, indice) => {
        const seccionesConfiguradas = Array.isArray(grilla.secciones)
            ? grilla.secciones
            : [];
        const cabeceraConfigurada = seccionesConfiguradas.find(
            (seccion) => seccion.tipo === "cabecera" || seccion.seccionID === "cabecera"
        );
        const cabecera = {
            ...crearSeccionCabecera(indice === 0 ? configuracion : grilla),
            ...cabeceraConfigurada,
            seccionID:cabeceraConfigurada?.seccionID || "cabecera",
            nombre:cabeceraConfigurada?.nombre || "Cabecera",
            tipo:"cabecera",
            obligatoria:true,
            incluida:true
        };
        const hijas = seccionesConfiguradas
            .filter((seccion) => seccion !== cabeceraConfigurada)
            .map((seccion) => ({
                incluida:true,
                imprimirTitulos:true,
                imprimirTotales:false,
                ...seccion,
                tipo:"hija",
                obligatoria:false
            }));
        return {
            incluida:true,
            ...grilla,
            secciones:[cabecera, ...hijas]
        };
    });
}

function claveSeccion(grillaID, seccionID) {
    return `${grillaID}:${seccionID}`;
}

function crearLayoutColumnas(columnas) {
    return columnas.map((columna) => ({
        campo:columna.campo,
        ancho:columna.ancho,
        visible:columna.visible !== false,
        desdoblarTexto:columna.desdoblarTexto === true,
        titulo:columna.titulo,
        transporte:columna.transporte === true
    }));
}

function ConfiguracionInformeModal({
    abierto,
    configuracion,
    onAceptar,
    onCancelar,
    onConfigurarPagina
}) {
    const dialogo = useRef(null);
    const botonAceptar = useRef(null);
    const controlColumnasDisponibles = useRef(null);
    const controlColumnasInforme = useRef(null);
    const columnaAReubicar = useRef(null);
    const [seleccionDestino, setSeleccionDestino] = useState(null);
    const [edicionArchivo, setEdicionArchivo] = useState(null);
    const [navegacionSeccion, setNavegacionSeccion] = useState(null);
    const [navegacionFormato, setNavegacionFormato] = useState(null);
    const [seleccionFormato, setSeleccionFormato] = useState(null);
    const [seleccionGrilla, setSeleccionGrilla] = useState(null);
    const [seleccionSeccionDisenio, setSeleccionSeccionDisenio] = useState(null);
    const [edicionDisenio, setEdicionDisenio] = useState(null);
    const [seleccionColumnaDisponible, setSeleccionColumnaDisponible] = useState(null);
    const [seleccionColumnaInforme, setSeleccionColumnaInforme] = useState(null);
    const destino = seleccionDestino?.configuracion === configuracion
        ? seleccionDestino.destino
        : configuracion?.destino || "vistaPrevia";
    const archivoActual = edicionArchivo?.configuracion === configuracion
        ? edicionArchivo
        : {
            nombre:configuracion?.nombreArchivoBase || crearNombreArchivoPredeterminado(),
            error:""
        };
    const requiereArchivo = destino === "pdf" || destino === "excel";
    const extensionArchivo = destino === "pdf" ? ".pdf" : ".xlsx";
    const seccionActiva = navegacionSeccion?.configuracion === configuracion
        ? navegacionSeccion.seccion
        : "destino";
    const seccionFormatoActiva = navegacionFormato?.configuracion === configuracion
        ? navegacionFormato.seccion
        : "disenio";
    const grillasBase = useMemo(
        () => normalizarGrillas(configuracion),
        [configuracion]
    );
    const edicionDisenioActual = edicionDisenio?.configuracion === configuracion
        ? edicionDisenio
        : null;
    const grillasDisponibles = edicionDisenioActual?.grillas || grillasBase;
    const grillaSolicitada = seleccionGrilla?.configuracion === configuracion
        ? seleccionGrilla.grilla
        : null;
    const grillaActual = grillasDisponibles.find(
        (grilla) => grilla.grillaID === grillaSolicitada?.grillaID
    ) || grillasDisponibles.find((grilla) =>
        grilla.grillaID === configuracion?.grillaID
    ) || grillasDisponibles[0];
    const seccionesDisponibles = grillaActual?.secciones || [];
    const seccionSolicitada = seleccionSeccionDisenio?.configuracion === configuracion
        && seleccionSeccionDisenio.grillaID === grillaActual?.grillaID
        ? seleccionSeccionDisenio.seccion
        : null;
    const seccionDisenioActual = seccionesDisponibles.find(
        (seccion) => seccion.seccionID === seccionSolicitada?.seccionID
    ) || seccionesDisponibles[0];
    const claveSeccionActual = claveSeccion(
        grillaActual?.grillaID || "",
        seccionDisenioActual?.seccionID || ""
    );
    const columnasBase = useMemo(
        () => prepararColumnasFormato(seccionDisenioActual),
        [seccionDisenioActual]
    );
    const columnasFormato = edicionDisenioActual?.columnasPorSeccion?.[claveSeccionActual]
        || columnasBase;
    const interlineado = edicionDisenioActual?.interlineado
        || configuracion?.interlineado
        || "LightGray";
    const columnasIncluidas = useMemo(
        () => columnasFormato.filter((columna) => columna.visible !== false),
        [columnasFormato]
    );
    const columnasDisponibles = useMemo(
        () => columnasFormato.filter((columna) => columna.visible === false),
        [columnasFormato]
    );
    const columnasIncluidasVista = useMemo(
        () => columnasIncluidas.map((columna) => ({
            ...columna,
            ancho:pixelesAMilimetros(columna.ancho)
        })),
        [columnasIncluidas]
    );
    const campoColumnaInformeSolicitada = seleccionColumnaInforme?.configuracion === configuracion
        && seleccionColumnaInforme.claveSeccion === claveSeccionActual
        ? seleccionColumnaInforme.campo
        : null;
    const campoColumnaSeleccionada = columnasIncluidas.some(
        (columna) => columna.campo === campoColumnaInformeSolicitada
    )
        ? campoColumnaInformeSolicitada
        : columnasIncluidas[0]?.campo;
    const columnaSeleccionada = columnasIncluidas.find(
        (columna) => columna.campo === campoColumnaSeleccionada
    ) || null;
    const campoColumnaDisponible = seleccionColumnaDisponible?.configuracion === configuracion
        && seleccionColumnaDisponible.claveSeccion === claveSeccionActual
        ? seleccionColumnaDisponible.campo
        : null;
    const columnaDisponibleSeleccionada = columnasDisponibles.find(
        (columna) => columna.campo === campoColumnaDisponible
    ) || null;
    const indiceColumnaSeleccionada = columnasIncluidas.findIndex(
        (columna) => columna.campo === campoColumnaSeleccionada
    );
    const puedeSubirColumna = indiceColumnaSeleccionada > 0;
    const puedeBajarColumna = indiceColumnaSeleccionada >= 0
        && indiceColumnaSeleccionada < columnasIncluidas.length - 1;
    const formatosDisponibles = Array.isArray(configuracion?.formatos) && configuracion.formatos.length
        ? configuracion.formatos
        : [{
            formatoID:"actual",
            nombre:configuracion?.nombreFormato || "Diseño actual de la grilla"
        }];
    const formatoActual = seleccionFormato?.configuracion === configuracion
        ? seleccionFormato.formato
        : formatosDisponibles.find((formato) =>
            formato.formatoID === configuracion?.formatoID
        ) || formatosDisponibles[0];
    const accionesConfiguracion = [
        {
            id:"destino",
            texto:"DESTINO",
            onClick:() => setNavegacionSeccion({ configuracion, seccion:"destino" }),
            className:seccionActiva === "destino" ? "configuracionInformeSeccionActiva" : ""
        },
        {
            id:"formato",
            texto:"FORMATO",
            onClick:() => setNavegacionSeccion({ configuracion, seccion:"formato" }),
            className:seccionActiva === "formato" ? "configuracionInformeSeccionActiva" : ""
        },
        { id:"estilo", texto:"ESTILO", disabled:true }
    ];
    const accionesFormato = [
        {
            id:"disenio",
            texto:"DISEÑO",
            onClick:() => setNavegacionFormato({ configuracion, seccion:"disenio" }),
            className:seccionFormatoActiva === "disenio" ? "configuracionInformeSeccionActiva" : ""
        },
        {
            id:"otros",
            texto:"OTROS",
            onClick:() => setNavegacionFormato({ configuracion, seccion:"otros" }),
            className:seccionFormatoActiva === "otros" ? "configuracionInformeSeccionActiva" : ""
        }
    ];

    const manejarSeleccionColumnaInforme = useCallback((estado) => {
        if (!estado?.fila?.campo) return;
        setSeleccionColumnaInforme((actual) => {
            if (
                actual?.configuracion === configuracion &&
                actual.claveSeccion === claveSeccionActual &&
                actual.campo === estado.fila.campo
            ) {
                return actual;
            }
            return {
                configuracion,
                claveSeccion:claveSeccionActual,
                campo:estado.fila.campo
            };
        });
    }, [configuracion, claveSeccionActual]);

    const manejarSeleccionColumnaDisponible = useCallback((estado) => {
        if (!estado?.fila?.campo) return;
        setSeleccionColumnaDisponible((actual) => {
            if (
                actual?.configuracion === configuracion &&
                actual.claveSeccion === claveSeccionActual &&
                actual.campo === estado.fila.campo
            ) {
                return actual;
            }
            return {
                configuracion,
                claveSeccion:claveSeccionActual,
                campo:estado.fila.campo
            };
        });
    }, [configuracion, claveSeccionActual]);

    useEffect(() => {
        const pendiente = columnaAReubicar.current;
        if (!pendiente) return;
        const esInforme = pendiente.destino === "informe";
        const filas = esInforme ? columnasIncluidasVista : columnasDisponibles;
        const fila = filas.find((columna) => columna.campo === pendiente.campo);
        if (!fila) return;
        columnaAReubicar.current = null;
        const control = esInforme
            ? controlColumnasInforme
            : controlColumnasDisponibles;
        control.current?.ubicarFila?.(fila);
    }, [columnasDisponibles, columnasIncluidasVista]);

    useEffect(() => {
        if (!abierto) return;
        botonAceptar.current?.focus();
    }, [abierto]);

    if (!abierto) return null;

    function manejarTeclado(evento) {
        evento.stopPropagation();
        if (evento.key === "Escape") {
            evento.preventDefault();
            onCancelar?.();
            return;
        }
        if (evento.key !== "Tab") return;
        const controles = [...dialogo.current.querySelectorAll("button:not(:disabled)")];
        const primero = controles[0];
        const ultimo = controles.at(-1);
        if (evento.shiftKey && document.activeElement === primero) {
            evento.preventDefault();
            ultimo?.focus();
        } else if (!evento.shiftKey && document.activeElement === ultimo) {
            evento.preventDefault();
            primero?.focus();
        }
    }

    function cambiarNombreArchivo(evento) {
        setEdicionArchivo({
            configuracion,
            nombre:evento.target.value,
            error:""
        });
    }

    function actualizarDisenio(cambios) {
        setEdicionDisenio((actual) => {
            const vigente = actual?.configuracion === configuracion
                ? actual
                : {
                    configuracion,
                    grillas:grillasBase,
                    columnasPorSeccion:{},
                    interlineado:configuracion?.interlineado || "LightGray"
                };
            const { columnas, ...otrosCambios } = cambios;
            return {
                ...vigente,
                ...otrosCambios,
                columnasPorSeccion:columnas
                    ? {
                        ...vigente.columnasPorSeccion,
                        [claveSeccionActual]:columnas
                    }
                    : vigente.columnasPorSeccion
            };
        });
    }

    function actualizarGrillaActual(cambios) {
        if (!grillaActual) return;
        actualizarDisenio({
            grillas:grillasDisponibles.map((grilla) =>
                grilla.grillaID === grillaActual.grillaID
                    ? { ...grilla, ...cambios }
                    : grilla
            )
        });
    }

    function actualizarSeccionActual(cambios) {
        if (!grillaActual || !seccionDisenioActual) return;
        actualizarGrillaActual({
            secciones:seccionesDisponibles.map((seccion) =>
                seccion.seccionID === seccionDisenioActual.seccionID
                    ? { ...seccion, ...cambios }
                    : seccion
            )
        });
    }

    function actualizarColumnaSeleccionada(cambios) {
        if (!columnaSeleccionada) return;
        const columnasActualizadas = columnasFormato.map((columna) =>
            columna.campo === columnaSeleccionada.campo
                ? { ...columna, ...cambios }
                : columna
        );
        actualizarDisenio({ columnas:columnasActualizadas });
    }

    function cambiarAnchoColumna(evento) {
        const milimetros = Number(evento.target.value);
        if (!Number.isFinite(milimetros) || milimetros <= 0) return;
        actualizarColumnaSeleccionada({ ancho:milimetrosAPixeles(milimetros) });
    }

    function variarAnchoColumna(incremento) {
        if (!columnaSeleccionada) return;
        const anchoActual = pixelesAMilimetros(columnaSeleccionada.ancho);
        actualizarColumnaSeleccionada({
            ancho:milimetrosAPixeles(Math.max(1, anchoActual + incremento))
        });
    }

    function moverColumnaSeleccionada(desplazamiento) {
        if (!columnaSeleccionada) return;
        const indiceDestino = indiceColumnaSeleccionada + desplazamiento;
        if (indiceDestino < 0 || indiceDestino >= columnasIncluidas.length) return;

        const incluidasReordenadas = [...columnasIncluidas];
        const [columnaMovida] = incluidasReordenadas.splice(
            indiceColumnaSeleccionada,
            1
        );
        incluidasReordenadas.splice(indiceDestino, 0, columnaMovida);

        let indiceVisible = 0;
        const columnasReordenadas = columnasFormato.map((columna) =>
            columna.visible === false
                ? columna
                : incluidasReordenadas[indiceVisible++]
        ).map((columna, orden) => ({ ...columna, orden }));

        columnaAReubicar.current = {
            destino:"informe",
            campo:columnaMovida.campo
        };
        actualizarDisenio({ columnas:columnasReordenadas });
    }

    function cambiarInclusionColumna(incluir) {
        const columnaMovida = incluir
            ? columnaDisponibleSeleccionada
            : columnaSeleccionada;
        if (!columnaMovida) return;

        const restantes = columnasFormato.filter(
            (columna) => columna.campo !== columnaMovida.campo
        );
        const columnaActualizada = {
            ...columnaMovida,
            visible:incluir
        };

        if (incluir) {
            const primeraDisponible = restantes.findIndex(
                (columna) => columna.visible === false
            );
            const posicion = primeraDisponible < 0
                ? restantes.length
                : primeraDisponible;
            restantes.splice(posicion, 0, columnaActualizada);
            setSeleccionColumnaInforme({
                configuracion,
                claveSeccion:claveSeccionActual,
                campo:columnaActualizada.campo
            });
        } else {
            restantes.push(columnaActualizada);
            setSeleccionColumnaDisponible({
                configuracion,
                claveSeccion:claveSeccionActual,
                campo:columnaActualizada.campo
            });
        }

        const columnasActualizadas = restantes.map((columna, orden) => ({
            ...columna,
            orden
        }));
        columnaAReubicar.current = {
            destino:incluir ? "informe" : "disponibles",
            campo:columnaActualizada.campo
        };
        actualizarDisenio({ columnas:columnasActualizadas });
    }

    function aceptarConfiguracion() {
        const grillasConfiguradas = grillasDisponibles.map((grilla) => ({
            ...grilla,
            secciones:grilla.secciones.map((seccion) => {
                const clave = claveSeccion(grilla.grillaID, seccion.seccionID);
                const columnas = edicionDisenioActual?.columnasPorSeccion?.[clave]
                    || prepararColumnasFormato(seccion);
                return {
                    ...seccion,
                    columnas,
                    layoutColumnas:crearLayoutColumnas(columnas)
                };
            })
        }));
        const grillaPrincipal = grillasConfiguradas[0];
        const cabeceraPrincipal = grillaPrincipal?.secciones.find(
            (seccion) => seccion.tipo === "cabecera"
        );
        const configuracionActual = {
            ...configuracion,
            destino,
            formatoID:formatoActual?.formatoID,
            nombreFormato:formatoActual?.nombre,
            grillaID:grillaPrincipal?.grillaID,
            grillas:grillasConfiguradas,
            columnas:cabeceraPrincipal?.columnas || [],
            layoutColumnas:cabeceraPrincipal?.layoutColumnas || [],
            interlineado
        };

        if (!requiereArchivo) {
            onAceptar?.(configuracionActual);
            return;
        }

        const nombreBase = archivoActual.nombre
            .trim()
            .replace(/\.(pdf|xlsx)$/i,"");

        if (!nombreBase) {
            setEdicionArchivo({
                configuracion,
                nombre:archivoActual.nombre,
                error:"Ingrese el nombre del archivo."
            });
            return;
        }

        onAceptar?.({
            ...configuracionActual,
            nombreArchivoBase:nombreBase,
            nombreArchivo:`${nombreBase}${extensionArchivo}`
        });
    }

    return createPortal(
        <div className="configuracionInformeOverlay">
            <section
                ref={dialogo}
                className="configuracionInformeModal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="configuracionInformeTitulo"
                onKeyDown={manejarTeclado}
            >
                <ModalHeader
                    titulo="Central de Informes"
                    tituloID="configuracionInformeTitulo"
                    ariaLabelCerrar="Cancelar impresión"
                    onCerrar={onCancelar}
                />

                <MenuCintaAcciones
                    acciones={accionesConfiguracion}
                    ariaLabel="Secciones de configuración del informe"
                />

                <div className="configuracionInformeFormulario">
                    {seccionActiva === "destino" && (
                    <div id="configuracionInformePanelDestino" className="configuracionInformePanel">
                        <fieldset className="configuracionInformeGrupoDestino">
                            <legend>Destino</legend>
                            {DESTINOS.map((opcion) => (
                                <div
                                    key={opcion.id}
                                    className="configuracionInformeDestinoFila"
                                >
                                    <label className="configuracionInformeDestinoActual">
                                        <img
                                            className="configuracionInformeDestinoIcono"
                                            src={opcion.icono}
                                            alt=""
                                            aria-hidden="true"
                                        />
                                        <input
                                            type="radio"
                                            name="configuracionInformeDestino"
                                            value={opcion.id}
                                            checked={destino === opcion.id}
                                            onChange={() => setSeleccionDestino({
                                                configuracion,
                                                destino:opcion.id
                                            })}
                                        />
                                        <span>{opcion.texto}</span>
                                    </label>
                                    {requiereArchivo && destino === opcion.id && (
                                        <div className="configuracionInformeArchivo">
                                            <div className="configuracionInformeNombreArchivo">
                                                <InputTexto
                                                    titulo="Nombre del archivo"
                                                    value={archivoActual.nombre}
                                                    onChange={cambiarNombreArchivo}
                                                />
                                                <span className="configuracionInformeExtensionArchivo">
                                                    {extensionArchivo}
                                                </span>
                                            </div>
                                            {archivoActual.error && (
                                                <span
                                                    className="configuracionInformeErrorArchivo"
                                                    role="alert"
                                                >
                                                    {archivoActual.error}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                            <BotonToolbar
                                texto="CONFIGURACIÓN DE PÁGINA"
                                className="configuracionInformeBotonPagina"
                                disabled={!onConfigurarPagina}
                                onClick={onConfigurarPagina}
                            />
                        </fieldset>

                        <dl className="configuracionInformeResumen">
                            <div>
                                <dt>Formato</dt>
                                <dd>{configuracion?.nombreFormato || "Diseño actual de la grilla"}</dd>
                            </div>
                            <div>
                                <dt>Estilo de impresión</dt>
                                <dd>{configuracion?.nombreEstilo || "Predeterminado"}</dd>
                            </div>
                        </dl>
                    </div>
                    )}

                    {seccionActiva === "formato" && (
                    <div id="configuracionInformePanelFormato" className="configuracionInformePanel configuracionInformePanelFormato">
                        <fieldset className="configuracionInformeFormatoCabecera">
                            <legend>Formato</legend>
                            <div className="configuracionInformeCampoFormato">
                                <ComboFormatosInforme
                                    formatos={formatosDisponibles}
                                    formatoID={formatoActual?.formatoID}
                                    onChange={(formato) => setSeleccionFormato({
                                        configuracion,
                                        formato
                                    })}
                                />
                            </div>
                            <div className="configuracionInformeUsoFormato" role="group" aria-label="Formato de uso">
                                <span>Formato de uso</span>
                                <label><input type="radio" checked readOnly /> Público</label>
                                <label><input type="radio" readOnly /> Privado</label>
                            </div>
                            <div className="configuracionInformeFormatoAcciones">
                                <BotonToolbar texto="GUARDAR" disabled />
                                <BotonToolbar texto="ELIMINAR" disabled />
                            </div>
                        </fieldset>

                        <div className="configuracionInformeSubmenuFormato">
                            <MenuCintaAcciones
                                acciones={accionesFormato}
                                ariaLabel="Secciones del formato del informe"
                            />
                        </div>

                        {seccionFormatoActiva === "disenio" && (
                        <fieldset className="configuracionInformeDisenio">
                            <legend>Diseño</legend>
                            <div className="configuracionInformeOpcionesGrilla">
                                <div className="configuracionInformeCampoGrilla">
                                    <ComboGrillasInforme
                                        grillas={grillasDisponibles}
                                        grillaID={grillaActual?.grillaID}
                                        onChange={(grilla) => setSeleccionGrilla({
                                            configuracion,
                                            grilla
                                        })}
                                    />
                                </div>
                                <label className="configuracionInformeCheck">
                                    <input
                                        type="checkbox"
                                        checked={grillaActual?.incluida !== false}
                                        onChange={(evento) => actualizarGrillaActual({
                                            incluida:evento.target.checked
                                        })}
                                    />
                                    Incluir esta grilla en el informe
                                </label>

                                <div className="configuracionInformeCampoSeccion">
                                    <InputCombo
                                        titulo="Sección"
                                        valor={seccionDisenioActual?.nombre || ""}
                                        items={seccionesDisponibles}
                                        campoID="seccionID"
                                        campoDescripcion="nombre"
                                        onChange={(seccion) => setSeleccionSeccionDisenio({
                                            configuracion,
                                            grillaID:grillaActual?.grillaID,
                                            seccion
                                        })}
                                        icono={<img src={iconoFlecha} alt="" />}
                                        disabled={!seccionesDisponibles.length}
                                    />
                                </div>
                                <label className="configuracionInformeCheck">
                                    <input
                                        type="checkbox"
                                        checked={seccionDisenioActual?.obligatoria
                                            ? true
                                            : seccionDisenioActual?.incluida !== false}
                                        disabled={seccionDisenioActual?.obligatoria
                                            || grillaActual?.incluida === false}
                                        onChange={(evento) => actualizarSeccionActual({
                                            incluida:evento.target.checked
                                        })}
                                    />
                                    Incluir esta sección en el informe
                                </label>

                                <div className="configuracionInformeOpcionesSeccion">
                                    <label className="configuracionInformeCheck">
                                        <input
                                            type="checkbox"
                                            checked={seccionDisenioActual?.imprimirTitulos !== false}
                                            disabled={seccionDisenioActual?.tipo === "cabecera"
                                                || seccionDisenioActual?.incluida === false
                                                || grillaActual?.incluida === false}
                                            onChange={(evento) => actualizarSeccionActual({
                                                imprimirTitulos:evento.target.checked
                                            })}
                                        />
                                        Imprimir títulos
                                    </label>
                                    <label className="configuracionInformeCheck">
                                        <input
                                            type="checkbox"
                                            checked={seccionDisenioActual?.imprimirTotales === true}
                                            disabled={seccionDisenioActual?.tipo === "cabecera"
                                                || seccionDisenioActual?.incluida === false
                                                || grillaActual?.incluida === false}
                                            onChange={(evento) => actualizarSeccionActual({
                                                imprimirTotales:evento.target.checked
                                            })}
                                        />
                                        Imprimir totales
                                    </label>
                                </div>
                            </div>

                            <div className="configuracionInformeColumnas">
                                <div className="configuracionInformeListaColumnas">
                                    <span>Columnas disponibles</span>
                                    <div className="configuracionInformeGrillaColumnas">
                                        <Grid
                                            controlNavegacionRef={controlColumnasDisponibles}
                                            columnasVisibles={COLUMNAS_DISPONIBLES_INFORME}
                                            dataGrid={columnasDisponibles}
                                            mostrarCheck={false}
                                            mostrarSinDatos={false}
                                            mostrarTotales={false}
                                            mostrarScrollHorizontal={false}
                                            accionesMenuFila={[]}
                                            ajustarColumnasAlAncho
                                            enfoqueVersion={`configuracion-informe-disponibles-${claveSeccionActual}`}
                                            onNavegacionChange={manejarSeleccionColumnaDisponible}
                                        />
                                    </div>
                                </div>

                                <div className="configuracionInformeMoverColumnas">
                                    <BotonToolbar
                                        texto="→"
                                        title="Agregar columna al informe"
                                        disabled={!columnaDisponibleSeleccionada}
                                        onClick={() => cambiarInclusionColumna(true)}
                                    />
                                    <BotonToolbar
                                        texto="←"
                                        title="Quitar columna del informe"
                                        disabled={!columnaSeleccionada}
                                        onClick={() => cambiarInclusionColumna(false)}
                                    />
                                </div>

                                <div className="configuracionInformeListaColumnas configuracionInformeColumnasIncluidas">
                                    <span>Columnas del informe</span>
                                    <div className="configuracionInformeGrillaColumnas">
                                        <Grid
                                            controlNavegacionRef={controlColumnasInforme}
                                            columnasVisibles={COLUMNAS_INCLUIDAS_INFORME}
                                            dataGrid={columnasIncluidasVista}
                                            mostrarCheck={false}
                                            mostrarSinDatos={false}
                                            mostrarTotales={false}
                                            mostrarScrollHorizontal={false}
                                            accionesMenuFila={[]}
                                            ajustarColumnasAlAncho
                                            enfoqueVersion={`configuracion-informe-columnas-${claveSeccionActual}`}
                                            onNavegacionChange={manejarSeleccionColumnaInforme}
                                        />
                                    </div>
                                </div>

                                <div className="configuracionInformeOrdenColumnas">
                                    <BotonToolbar
                                        texto="↑"
                                        title="Mover columna hacia arriba"
                                        disabled={!puedeSubirColumna}
                                        onClick={() => moverColumnaSeleccionada(-1)}
                                    />
                                    <BotonToolbar
                                        texto="↓"
                                        title="Mover columna hacia abajo"
                                        disabled={!puedeBajarColumna}
                                        onClick={() => moverColumnaSeleccionada(1)}
                                    />
                                </div>
                            </div>

                            <div className="configuracionInformeControlesColumnas">
                                <div className="configuracionInformeInterlineado">
                                    <InputCombo
                                        titulo="Interlineado"
                                        valor={interlineado}
                                        items={COLORES_INTERLINEADO}
                                        campoID="id"
                                        campoDescripcion="nombre"
                                        onChange={(color) => actualizarDisenio({
                                            interlineado:color.id
                                        })}
                                        icono={<img src={iconoFlecha} alt="" />}
                                        renderItem={renderColorInterlineado}
                                        renderValor={renderColorInterlineado}
                                    />
                                </div>

                                <div className="configuracionInformePropiedadesColumna">
                                    <InputTexto
                                        titulo="Título a mostrar"
                                        value={columnaSeleccionada?.titulo || ""}
                                        disabled={!columnaSeleccionada}
                                        onChange={(evento) => actualizarColumnaSeleccionada({
                                            titulo:evento.target.value
                                        })}
                                    />

                                    <div className="configuracionInformeAnchoColumna">
                                        <InputTexto
                                            titulo="Ancho de la columna"
                                            type="number"
                                            value={columnaSeleccionada
                                                ? pixelesAMilimetros(columnaSeleccionada.ancho)
                                                : ""}
                                            disabled={!columnaSeleccionada}
                                            onChange={cambiarAnchoColumna}
                                        />
                                        <div className="configuracionInformeAjusteAncho">
                                            <BotonToolbar
                                                texto="▲"
                                                title="Aumentar ancho"
                                                disabled={!columnaSeleccionada}
                                                onClick={() => variarAnchoColumna(1)}
                                            />
                                            <BotonToolbar
                                                texto="▼"
                                                title="Disminuir ancho"
                                                disabled={!columnaSeleccionada}
                                                onClick={() => variarAnchoColumna(-1)}
                                            />
                                        </div>
                                        <span>milímetros</span>
                                    </div>

                                    <label className="configuracionInformeOpcionColumna">
                                        <input
                                            type="checkbox"
                                            checked={Boolean(columnaSeleccionada?.desdoblarTexto)}
                                            disabled={!columnaSeleccionada}
                                            onChange={(evento) => actualizarColumnaSeleccionada({
                                                desdoblarTexto:evento.target.checked
                                            })}
                                        />
                                        Ajustar texto
                                    </label>

                                    <label className="configuracionInformeOpcionColumna">
                                        <input
                                            type="checkbox"
                                            checked={Boolean(columnaSeleccionada?.transporte)}
                                            disabled={!columnaSeleccionada}
                                            onChange={(evento) => actualizarColumnaSeleccionada({
                                                transporte:evento.target.checked
                                            })}
                                        />
                                        Transporte
                                    </label>
                                </div>
                            </div>

                        </fieldset>
                        )}

                        {seccionFormatoActiva === "otros" && (
                        <fieldset className="configuracionInformeOtros">
                            <legend>Otros</legend>
                        </fieldset>
                        )}
                    </div>
                    )}

                    <footer className="configuracionInformeAcciones">
                        <BotonToolbar texto="CANCELAR" onClick={onCancelar} />
                        <BotonToolbar
                            ref={botonAceptar}
                            texto="IMPRIMIR"
                            variante="primario"
                            onClick={aceptarConfiguracion}
                        />
                    </footer>
                </div>
            </section>
        </div>,
        document.body
    );
}

export default ConfiguracionInformeModal;
