import iconoFlecha from "../../assets/iconFlechaC.png";
import InputCombo from "../InputCombo/InputCombo";

function ComboGrillasInforme({
    grillas = [],
    grillaID,
    onChange,
    disabled = false
}) {
    const seleccionada = grillas.find((grilla) => grilla.grillaID === grillaID);

    return (
        <InputCombo
            titulo="Grilla"
            valor={seleccionada?.nombre || ""}
            items={grillas}
            campoID="grillaID"
            campoDescripcion="nombre"
            onChange={onChange}
            icono={<img src={iconoFlecha} alt="" />}
            disabled={disabled}
            className="comboGrillasInforme"
        />
    );
}

export default ComboGrillasInforme;
