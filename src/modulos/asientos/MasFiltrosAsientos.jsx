import "./MasFiltrosAsientos.css";

import { useEffect,useRef,useState } from "react";

import BotonToolbar from "../../components/BotonToolbar/BotonToolbar";
import InputFecha from "../../components/InputFecha/InputFecha";
import InputCombo from "../../components/InputCombo/InputCombo";
import InputComboBusqueda from "../../components/InputComboBusqueda/InputComboBusqueda";
import InputTexto from "../../components/InputTexto/InputTexto";
import {
    crearTabIndexConEntrada,
    enfocarControl,
    ESTILO_ENTRADA_FOCO
} from "../../components/foco/tabIndex";
import { cargarNumeraciones } from "../../components/services/numeracionService";

import btnCalendar from "../../assets/btnCalendar.png";
import iconFlechaC from "../../assets/iconFlechaC.png";

const tabIndexMasFiltrosAsientos = crearTabIndexConEntrada([
    "fechaDesde",
    "fechaHasta",
    "empresa",
    "cuenta",
    "detalle",
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
    empresas,
    cuenta,
    cuentas,
    detalle,
    proveedor,
    proveedores,
    cajaBancaria,
    numeraTipoSeleccionado,
    numeroDesde,
    numeroHasta,
    onCerrar,
    onFiltrar,
    onFechaDesdeChange,
    onFechaHastaChange,
    onEmpresaChange,
    onCuentaTextoChange,
    onCuentaSeleccionar,
    onDetalleChange,
    onProveedorTextoChange,
    onProveedorSeleccionar,
    onCajaBancariaChange,
    onNumeraTipoChange,
    onNumeroDesdeChange,
    onNumeroHastaChange
}) {

    const refFechaDesde = useRef(null);
    const refBotonFiltrar = useRef(null);
    const refModal = useRef(null);
    const [numeraTipos,setNumeraTipos] = useState([]);
    const tabIndexControles = tabIndexMasFiltrosAsientos.controles;

    useEffect(() => {

        async function obtenerNumeraciones() {
            const datos = await cargarNumeraciones();
            setNumeraTipos(datos);
        }

        obtenerNumeraciones();

    }, []);

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

                <div className="masFiltrosCuerpo">

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
                            <InputCombo
                                titulo="Empresa"
                                valor={empresaSeleccionada?.empresaNombre || ""}
                                items={empresas}
                                campoID="empresaID"
                                campoDescripcion="empresaNombre"
                                onChange={onEmpresaChange}
                                icono={<img src={iconFlechaC} />}
                                tabIndex={tabIndexControles.empresa}
                            />
                        </div>

                        <div className="masFiltrosControl300">
                            <InputComboBusqueda
                                titulo="Cuenta"
                                valor={cuenta}
                                items={cuentas}
                                campoID="cuentaID"
                                campoCodigo="cuentaCodigo"
                                campoDescripcion="cuentaNombre"
                                icono={<img src={iconFlechaC} />}
                                onChange={onCuentaTextoChange}
                                onSeleccionar={onCuentaSeleccionar}
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
                            <InputComboBusqueda
                                titulo="Proveedor"
                                valor={proveedor}
                                items={proveedores}
                                campoID="proveedorID"
                                campoCodigo="proveedorCodigo"
                                campoDescripcion="proveedorNombre"
                                icono={<img src={iconFlechaC} />}
                                onChange={onProveedorTextoChange}
                                onSeleccionar={onProveedorSeleccionar}
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
                            <InputCombo
                                titulo="Numeración"
                                valor={numeraTipoSeleccionado?.descripcion || ""}
                                items={numeraTipos}
                                campoID="numeraTipoID"
                                campoDescripcion="descripcion"
                                onChange={onNumeraTipoChange}
                                icono={<img src={iconFlechaC} />}
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
