import fondoLogo from "../../assets/fondo-logo.png";
import "./accesos_directos.css";

function accesos_directos() {
  return (
    <div className="accesos_directos">
      <img className="fondo-logo" src={fondoLogo} />  
      <h1>Accesos Directos v2.1</h1>
      <p>Esta es la página de AD</p>
    </div>
  );
}

export default accesos_directos;