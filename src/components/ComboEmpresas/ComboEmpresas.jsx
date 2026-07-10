import { useEffect,useState } from "react";
import InputCombo from "../InputCombo/InputCombo";
import { cargarEmpresas } from "../services/empresasService";
import iconFlechaC from "../../assets/iconFlechaC.png";

function ComboEmpresas({
    titulo = "Empresa",
    valor,
    onChange,
    onEnter,
    tabIndex
}) {

    const [empresas,setEmpresas] = useState([]);

    useEffect(() => {

        let cancelado = false;

        async function obtenerEmpresas() {
            const datos = await cargarEmpresas();

            if (!cancelado) {
                setEmpresas(datos);
            }
        }

        obtenerEmpresas();

        return () => {
            cancelado = true;
        };

    }, []);

    return (
        <InputCombo
            titulo={titulo}
            valor={valor?.empresaNombre || ""}
            items={empresas}
            campoID="empresaID"
            campoDescripcion="empresaNombre"
            onChange={onChange}
            onEnter={onEnter}
            icono={<img src={iconFlechaC} />}
            tabIndex={tabIndex}
        />
    );

}

export default ComboEmpresas;
