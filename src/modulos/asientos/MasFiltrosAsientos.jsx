import "./MasFiltrosAsientos.css";

import { useEffect,useRef } from "react";

import BotonToolbar from "../../components/BotonToolbar/BotonToolbar";
import InputFecha from "../../components/InputFecha/InputFecha";
import ComboNumeraciones from "../../components/ComboNumeraciones/ComboNumeraciones";
import ComboEmpresas from "../../components/ComboEmpresas/ComboEmpresas";
import ComboCuentas from "../../components/ComboCuentas/ComboCuentas";
import ComboClientes from "../../components/ComboClientes/ComboClientes";
import ComboProveedores from "../../components/ComboProveedores/ComboProveedores";
import InputTexto from "../../components/InputTexto/InputTexto";
import {
    crearTabIndexConEntrada,
    enfocarControl,
    ESTILO_ENTRADA_FOCO
} from "../../components/foco/tabIndex";

import btnCalendar from "../../assets/btnCalendar.png";

const tabIndexMasFiltrosAsientos = crearTabIndexConEntrada([
    "fechaDesde",
    "fechaHasta",
    "empresa",
    "cuenta",
    "detalle",
    "cliente",
    "clienteMas",
    "proveedor",
    "proveedorMas",
    "cajaBancaria",
    "cajaBancariaMas",
    "numeraTipo",
    "numeroDesde",
    "numeroDesdeMas",
    "numeroHasta",
    "numeroHastaMas",
    "filtrar"
]);

function MasFiltrosAsientos({
    abierto,
    fechaDesde,
    fechaHasta,
    empresaSeleccionada,
    cuentaSeleccionada,
    detalle,
    clienteSeleccionado,
    proveedorSeleccionado,
    cajaBancaria,
    numeraTipoSeleccionado,
    numeroDesde,
    numeroHasta,
    onCerrar,
    onFiltrar,
    onFechaDesdeChange,
    onFechaHastaChange,
    onEmpresaChange,
    onCuentaChange,
    onDetalleChange,
    onClienteChange,
    onProveedorChange,
    onCajaBancariaChange,
    onNumeraTipoChange,
    onNumeroDesdeChange,
    onNumeroHastaChange
}) {

    const refFechaDesde = useRef(null);
    const refBotonFiltrar = useRef(null);
    const refModal = useRef(null);
    const refCuerpo = useRef(null);
    const tabIndexControles = tabIndexMasFiltrosAsientos.controles;

    useEffect(() => {

        if (!abierto) {
            return;
        }

        window.setTimeout(() => {
            refFechaDesde.current?.focusSinAbrir?.();
        },0);

    }, [abierto]);

    useEffect(() => {

        if (!abierto) {
            return;
        }

        function manejarEnterModal(evento) {

            if (evento.key !== "Enter") {
                return;
            }

            if (evento.target?.tagName === "BUTTON") {
                return;
            }

            window.setTimeout(() => {
                onFiltrar();
            },0);

        }

        document.addEventListener("keydown",manejarEnterModal);

        return () => {
            document.removeEventListener("keydown",manejarEnterModal);
        };

    }, [abierto,onFiltrar]);

    useEffect(() => {

        if (!abierto) {
            return;
        }

        function manejarTabGlobal(evento) {

            if (evento.key !== "Tab") {
                return;
            }

            const modal =
                refModal.current;

            if (!modal) {
                return;
            }

            const controlesTabulables =
                Array.from(
                    modal.querySelectorAll(
                        "[tabindex]:not([tabindex='-1'])"
                    )
                )
                .filter(control =>
                    !control.disabled &&
                    control.offsetParent !== null
                )
                .sort((a,b) => a.tabIndex - b.tabIndex);

            if (controlesTabulables.length === 0) {
                return;
            }

            evento.preventDefault();

            const indiceActual =
                controlesTabulables.indexOf(document.activeElement);

            if (indiceActual === -1) {
                const destino =
                    evento.shiftKey
                        ? controlesTabulables[controlesTabulables.length - 1]
                        : controlesTabulables[0];

                destino.focus();
                return;
            }

            const desplazamiento =
                evento.shiftKey
                    ? -1
                    : 1;

            const proximoIndice =
                (
                    indiceActual +
                    desplazamiento +
                    controlesTabulables.length
                ) % controlesTabulables.length;

            controlesTabulables[proximoIndice].focus();

        }

        document.addEventListener(
            "keydown",
            manejarTabGlobal,
            true
        );

        return () => {
            document.removeEventListener(
                "keydown",
                manejarTabGlobal,
                true
            );
        };

    }, [abierto]);

    useEffect(() => {
        if (!abierto) return;

        function manejarScrollModal(evento) {
            if (evento.defaultPrevented || evento.altKey || evento.ctrlKey || evento.metaKey) return;
            const desplazamientos = {
                ArrowDown: [0, 40], ArrowUp: [0, -40],
                ArrowRight: [40, 0], ArrowLeft: [-40, 0]
            };
            const desplazamiento = desplazamientos[evento.key];
            if (!desplazamiento) return;
            // Los inputs, combos y calendarios conservan su propio teclado.
            if (refModal.current?.contains(evento.target) && evento.target.closest?.(
                'input, textarea, select, [contenteditable="true"], .inputCombo, .inputComboBusqueda, .react-datepicker'
            )) return;
            evento.preventDefault();
            refCuerpo.current?.scrollBy({ left: desplazamiento[0], top: desplazamiento[1] });
        }

        document.addEventListener("keydown", manejarScrollModal);
        return () => document.removeEventListener("keydown", manejarScrollModal);
    }, [abierto]);

    function filtrarConEnterBoton(evento) {

        if (evento.key !== "Enter") {
            return;
        }

        evento.preventDefault();
        onFiltrar();

    }

    if (!abierto) {
        return null;
    }

    return (
        <div className="masFiltrosOverlay">

            <div
                className="masFiltrosModal"
                ref={refModal}
                role="dialog"
                aria-modal="true"
                aria-label="Más Filtros"
                onContextMenu={(evento) => evento.preventDefault()}
            >

                <div className="masFiltrosHeader">
                    <button
                        type="button"
                        className="masFiltrosCerrar"
                        onClick={onCerrar}
                        tabIndex={-1}
                    >
                        x
                    </button>
                    <div className="masFiltrosTitulo">
                        Más Filtros
                    </div>
                </div>

                <div className="masFiltrosCuerpo" ref={refCuerpo}>

                    <div className="masFiltrosFormulario">

                        <span
                            tabIndex={tabIndexMasFiltrosAsientos.entrada}
                            onFocus={() => enfocarControl(refFechaDesde)}
                            style={ESTILO_ENTRADA_FOCO}
                        />

                        <div className="masFiltrosFechas">
                            <InputFecha
                                ref={refFechaDesde}
                                titulo="Desde fecha"
                                valor={fechaDesde}
                                onChange={onFechaDesdeChange}
                                placeholder=""
                                icono={<img src={btnCalendar} />}
                                tabIndex={tabIndexControles.fechaDesde}
                            />
                            <InputFecha
                                titulo="Hasta fecha"
                                valor={fechaHasta}
                                onChange={onFechaHastaChange}
                                placeholder=""
                                icono={<img src={btnCalendar} />}
                                tabIndex={tabIndexControles.fechaHasta}
                            />
                        </div>

                        <div className="masFiltrosControl300">
                            <ComboEmpresas
                                titulo="Empresa"
                                valor={empresaSeleccionada}
                                onChange={onEmpresaChange}
                                onEnter={onFiltrar}
                                tabIndex={tabIndexControles.empresa}
                            />
                        </div>

                        <div className="masFiltrosControl300">
                            <ComboCuentas
                                titulo="Cuenta"
                                valor={cuentaSeleccionada}
                                empresaID={empresaSeleccionada?.empresaID}
                                onChange={onCuentaChange}
                                onEnter={onFiltrar}
                                tabIndex={tabIndexControles.cuenta}
                            />
                        </div>

                        <InputTexto
                            titulo="Detalle"
                            value={detalle}
                            onChange={(e) => onDetalleChange(e.target.value)}
                            className="masFiltrosInputAncho"
                            tabIndex={tabIndexControles.detalle}
                        />

                        <div className="masFiltrosSeccionTitulo">
                            Subcuenta
                        </div>

                        <div className="masFiltrosCampoConBoton">
                            <ComboClientes
                                titulo="Cliente"
                                valor={clienteSeleccionado}
                                onChange={onClienteChange}
                                onEnter={onFiltrar}
                                tabIndex={tabIndexControles.cliente}
                            />
                            <BotonToolbar
                                texto="+"
                                className="masFiltrosBotonMas"
                                tabIndex={tabIndexControles.clienteMas}
                                onKeyDown={filtrarConEnterBoton}
                            />
                        </div>

                        <div className="masFiltrosCampoConBoton">
                            <ComboProveedores
                                titulo="Proveedor"
                                valor={proveedorSeleccionado}
                                empresaID={empresaSeleccionada?.empresaID}
                                onChange={onProveedorChange}
                                onEnter={onFiltrar}
                                tabIndex={tabIndexControles.proveedor}
                            />
                            <BotonToolbar
                                texto="+"
                                className="masFiltrosBotonMas"
                                tabIndex={tabIndexControles.proveedorMas}
                                onKeyDown={filtrarConEnterBoton}
                            />
                        </div>

                        <div className="masFiltrosCampoConBoton">
                            <InputTexto
                                titulo="Caja bancaria"
                                value={cajaBancaria}
                                onChange={(e) => onCajaBancariaChange(e.target.value)}
                                className="masFiltrosInput280"
                                tabIndex={tabIndexControles.cajaBancaria}
                            />
                            <BotonToolbar
                                texto="+"
                                className="masFiltrosBotonMas"
                                tabIndex={tabIndexControles.cajaBancariaMas}
                                onKeyDown={filtrarConEnterBoton}
                            />
                        </div>

                        <div className="masFiltrosSeccionTitulo masFiltrosSeccionComprobante">
                            Tipo y número de comprobante
                        </div>

                        <div className="masFiltrosControl580">
                            <ComboNumeraciones
                                titulo="Numeración"
                                valor={numeraTipoSeleccionado}
                                onChange={onNumeraTipoChange}
                                tabIndex={tabIndexControles.numeraTipo}
                            />
                        </div>

                        <div className="masFiltrosCampoConBoton">
                            <InputTexto
                                titulo="Desde número"
                                type="number"
                                value={numeroDesde}
                                onChange={(e) => onNumeroDesdeChange(e.target.value)}
                                className="masFiltrosInput300"
                                tabIndex={tabIndexControles.numeroDesde}
                            />
                            <BotonToolbar
                                texto="+"
                                className="masFiltrosBotonMas"
                                tabIndex={tabIndexControles.numeroDesdeMas}
                                onKeyDown={filtrarConEnterBoton}
                            />
                        </div>

                        <div className="masFiltrosCampoConBoton">
                            <InputTexto
                                titulo="Hasta número"
                                type="number"
                                value={numeroHasta}
                                onChange={(e) => onNumeroHastaChange(e.target.value)}
                                className="masFiltrosInput300"
                                tabIndex={tabIndexControles.numeroHasta}
                            />
                            <BotonToolbar
                                texto="+"
                                className="masFiltrosBotonMas"
                                tabIndex={tabIndexControles.numeroHastaMas}
                                onKeyDown={filtrarConEnterBoton}
                            />
                        </div>

                    </div>

                </div>

                <div className="masFiltrosFooter">
                    <BotonToolbar
                        ref={refBotonFiltrar}
                        texto="FILTRAR"
                        variante="primario"
                        onClick={onFiltrar}
                        tabIndex={tabIndexControles.filtrar}
                    />
                </div>

            </div>

        </div>
    );

}

export default MasFiltrosAsientos;
