// import fondoLogo from "./styles/res/fondo-logo.png";
import "./styles/Content.css";

import { Suspense, useMemo } from "react";
import { getLazyPage } from "../config/pageLoader";

function Content({activeRoute}) {

  const PageComponent = useMemo(() => {
    if (!activeRoute) return null;
    return getLazyPage(activeRoute);
    }, [activeRoute]);

  let contenido;

  if (!activeRoute) {
    contenido = (
      <p>Seleccione una opción del menú.</p>
    );
  } else if (!PageComponent) {
    contenido = (
      <div>
        <h2>Página no configurada</h2>
        <p>No existe archivo para la ruta: {activeRoute}</p>
      </div>
    );
  } else {
    contenido = (
      <Suspense fallback={<p>Cargando página...</p>}>
        <PageComponent />
      </Suspense>
    );
  }

  return (
 
    <div className="content"    >
      {/* <p>Página seleccionada: {activeRoute}</p> */}
      {contenido}
      {/* <img className="fondo-logo" src={fondoLogo} /> */}
    </div>

  );
}

export default Content;