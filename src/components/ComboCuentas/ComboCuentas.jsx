import InputComboBusqueda from "../InputComboBusqueda/InputComboBusqueda";
import useCuenta from "./useCuenta";
import iconFlechaC from "../../assets/iconFlechaC.png";

function ComboCuentas({ titulo = "Cuenta", valor, empresaID, onChange, onEnter, tabIndex }) {
    const { texto, cuentas, cambiarTexto, seleccionarCuenta } =
        useCuenta({ valor, empresaID, onChange });

    return (
        <InputComboBusqueda
            titulo={titulo}
            valor={texto}
            items={cuentas}
            campoID="cuentaID"
            campoCodigo="cuentaCodigo"
            campoDescripcion="cuentaNombre"
            icono={<img src={iconFlechaC} />}
            onChange={cambiarTexto}
            onSeleccionar={seleccionarCuenta}
            onEnter={onEnter}
            tabIndex={tabIndex}
        />
    );
}

export default ComboCuentas;
