import InputCombo from "../InputCombo/InputCombo";
import useEmpresa from "./useEmpresa.js";
import iconFlechaC from "../../assets/iconFlechaC.png";

function ComboEmpresas({ titulo = "Empresa", valor, onChange, onEnter, tabIndex }) {
    const { empresas, texto, seleccionarEmpresa } = useEmpresa({ valor, onChange });

    return (
        <InputCombo
            titulo={titulo}
            valor={texto}
            items={empresas}
            campoID="empresaID"
            campoDescripcion="empresaNombre"
            onChange={seleccionarEmpresa}
            onEnter={onEnter}
            icono={<img src={iconFlechaC} />}
            tabIndex={tabIndex}
        />
    );
}

export default ComboEmpresas;
