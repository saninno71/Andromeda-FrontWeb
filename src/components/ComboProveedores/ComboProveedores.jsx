import { useEffect,useRef,useState } from "react";
import InputComboBusqueda from "../InputComboBusqueda/InputComboBusqueda";
import { cargarProveedores } from "../services/proveedoresService";
import iconFlechaC from "../../assets/iconFlechaC.png";

function formatearProveedor(proveedor) {

    if (!proveedor) {
        return "";
    }

    return `${proveedor.proveedorCodigo} - ${proveedor.proveedorNombre}`;

}

function ComboProveedores({
    titulo = "Proveedor",
    valor,
    empresaID,
    onChange,
    onEnter,
    tabIndex
}) {

    const [texto,setTexto] = useState(formatearProveedor(valor));
    const [proveedores,setProveedores] = useState([]);
    const refLimpiezaPorEscritura = useRef(false);

    useEffect(() => {
        if (!valor && refLimpiezaPorEscritura.current) {
            refLimpiezaPorEscritura.current = false;
            return;
        }

        setTexto(formatearProveedor(valor));
    }, [valor]);

    useEffect(() => {

        let cancelado = false;

        async function buscarProveedores() {
            if (texto.length < 2 || valor) {
                setProveedores([]);
                return;
            }

            const datos = await cargarProveedores(texto,empresaID);

            if (!cancelado) {
                setProveedores(datos);
            }
        }

        const timeoutBusqueda =
            window.setTimeout(buscarProveedores,500);

        return () => {
            cancelado = true;
            window.clearTimeout(timeoutBusqueda);
        };

    }, [texto,empresaID,valor]);

    function cambiarTexto(nuevoTexto) {
        setTexto(nuevoTexto);
        refLimpiezaPorEscritura.current = true;
        onChange(null);
    }

    function seleccionarProveedor(proveedor) {
        setTexto(formatearProveedor(proveedor));
        setProveedores([]);
        onChange(proveedor);
    }

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
