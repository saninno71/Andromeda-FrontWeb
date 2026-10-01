import InputComboBusqueda from "../InputComboBusqueda/InputComboBusqueda.jsx";
import useMoneda from "./useMoneda.js";
import { formatearMoneda } from "./moneda.funcional.js";
import iconFlechaC from "../../assets/iconFlechaC.png";

function ComboMonedas({ titulo = "Moneda", valor, onChange, onEnter, tabIndex, disabled = false }) {
    const { texto, monedas, cambiarTexto, seleccionarMoneda } = useMoneda({ valor, onChange });

    return (
        <InputComboBusqueda
            titulo={titulo}
            valor={texto}
            items={monedas}
            campoID="monedaID"
            campoCodigo="monedaCodigo"
            campoDescripcion="monedaNombre"
            icono={<img src={iconFlechaC} alt="" />}
            onChange={cambiarTexto}
            onSeleccionar={seleccionarMoneda}
            onEnter={onEnter}
            tabIndex={tabIndex}
            disabled={disabled}
            formatearItem={formatearMoneda}
            seleccionarAlEnfocar
        />
    );
}

export default ComboMonedas;
