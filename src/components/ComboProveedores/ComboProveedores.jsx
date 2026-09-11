import InputComboBusqueda from "../InputComboBusqueda/InputComboBusqueda";
import useProveedor from "./useProveedor";
import iconFlechaC from "../../assets/iconFlechaC.png";

function ComboProveedores({ titulo = "Proveedor", valor, empresaID, onChange, onEnter, tabIndex }) {
    const { texto, proveedores, cambiarTexto, seleccionarProveedor } =
        useProveedor({ valor, empresaID, onChange });

    return (
        <InputComboBusqueda
            titulo={titulo}
            valor={texto}
            items={proveedores}
            campoID="proveedorID"
            campoCodigo="proveedorCodigo"
            campoDescripcion="proveedorNombre"
            icono={<img src={iconFlechaC} />}
            onChange={cambiarTexto}
            onSeleccionar={seleccionarProveedor}
            onEnter={onEnter}
            tabIndex={tabIndex}
        />
    );
}

export default ComboProveedores;
