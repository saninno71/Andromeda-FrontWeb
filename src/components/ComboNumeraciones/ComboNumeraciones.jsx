import InputCombo from "../InputCombo/InputCombo";
import useNumeracion from "./useNumeracion.js";
import iconFlechaC from "../../assets/iconFlechaC.png";

function ComboNumeraciones({ titulo = "Numeración", valor, onChange, onEnter, tabIndex }) {
    const { numeraciones, texto, seleccionarNumeracion } = useNumeracion({ valor, onChange });

    return (
        <InputCombo
            titulo={titulo}
            valor={texto}
            items={numeraciones}
            campoID="numeraTipoID"
            campoDescripcion="descripcion"
            onChange={seleccionarNumeracion}
            onEnter={onEnter}
            icono={<img src={iconFlechaC} />}
            tabIndex={tabIndex}
        />
    );
}

export default ComboNumeraciones;
