import { crearAsientosFuncional } from "./asientos.funcional.js";
import { cargarAsientos, CONFIG_CARGA_ASIENTOS } from "./asientosService.js";
import { obtenerEmpresas } from "../../components/ComboEmpresas/empresa.funcional.js";
import { obtenerNumeraciones } from "../../components/ComboNumeraciones/numeracion.funcional.js";

// Composición de módulos: se puede invocar sin montar ninguna pantalla React.
export function crearModeloAsientos() {
    return crearAsientosFuncional({
        cargarPagina:cargarAsientos, configuracion:CONFIG_CARGA_ASIENTOS,
        hijos: {
            masFiltros: async () => {
                const [empresas, numeraciones] = await Promise.all([obtenerEmpresas(), obtenerNumeraciones()]);
                return { empresas, numeraciones };
            }
        }
    });
}
