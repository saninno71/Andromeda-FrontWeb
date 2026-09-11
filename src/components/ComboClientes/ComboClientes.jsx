import InputComboBusqueda from "../InputComboBusqueda/InputComboBusqueda";
import useCliente from "./useCliente";
import iconFlechaC from "../../assets/iconFlechaC.png";

function ComboClientes({ titulo = "Cliente", valor, onChange, onEnter, tabIndex }) {
    const { texto, clientes, cambiarTexto, seleccionarCliente } =
        useCliente({ valor, onChange });

    return (
        <InputComboBusqueda
            titulo={titulo}
            valor={texto}
            items={clientes}
            campoID="clienteID"
            campoCodigo="clienteCodigo"
            campoDescripcion="clienteNombre"
            icono={<img src={iconFlechaC} />}
            onChange={cambiarTexto}
            onSeleccionar={seleccionarCliente}
            onEnter={onEnter}
            tabIndex={tabIndex}
        />
    );
}

export default ComboClientes;
