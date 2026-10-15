import iconoFlecha from "../../assets/iconFlechaC.png";
import InputCombo from "../InputCombo/InputCombo";

function ComboFormatosInforme({
    formatos = [],
    formatoID,
    onChange,
    disabled = false
}) {
    const seleccionado = formatos.find((formato) => formato.formatoID === formatoID);

    return (
        <InputCombo
            titulo="Nombre"
            valor={seleccionado?.nombre || ""}
            items={formatos}
            campoID="formatoID"
            campoDescripcion="nombre"
            onChange={onChange}
            icono={<img src={iconoFlecha} alt="" />}
            disabled={disabled}
            className="comboFormatosInforme"
        />
    );
}

export default ComboFormatosInforme;
