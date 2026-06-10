import fondoLogo from "./styles/res/fondo-logo.png";
import "./styles/accesos_directos.css";

function accesos_directos() {
  return (
    <div className="accesos_directos">
      <img className="fondo-logo" src={fondoLogo} />  
      <h1>Accesos Directos v1.0</h1>
      <p>Esta es la página de AD</p>
    </div>
  );
}

export default accesos_directos;