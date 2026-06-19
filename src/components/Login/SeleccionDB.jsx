import { useState } from "react";

import { validateLogin } from "./authService.js";
import './Login.css'
import logo from "../../assets/logo-andromeda.png";

function SeleccionDB({user, onNext}) {
 
const [base, setBase] = useState("");

const handleSubmit = (e) => {
    e.preventDefault();
    onNext("app");
  };

  return (
    
    <div className="login-page">
        
        <div className="login-card">
    
            <div className="login-left">
              <img src={logo} className="logo" />
              

              <div className="login-content">
                <h2 className="welcome">Seleccioná tu base de datos</h2> 
                <h2 className="welcome-user">{user}</h2> 

                <form className="login-form" onSubmit={handleSubmit}>

                  <select
                    className="combo-bases"
                    value={base}
                    onChange={(e) => setBase(e.target.value)}
                  >

                    {base === "" && (
                      <option value="" disabled hidden>
                        Seleccionar Base de dato
                      </option>
                    )}

                    <option value="prod">
                      Producción
                    </option>
                    <option value="test">
                      Testing
                    </option>
                    <option value="desa">
                      Desarrollo
                    </option>
                  </select>

                  <div className="login-actions">
                    {/* <a href="#" className="forgot">¿Olvidaste tu contraseña?</a> */}
                    <button type="submit" className="btn-continuar">CONTINUAR</button>
                  </div>


                </form>

              </div>
            </div>

            <div className="login-right">
              <div className="right-content">
                <p className="right-phrase">
                  "Los números tienen una historia que contar."
                </p>

                <p className="right-author">
                    — Stephen Few
                </p>
                <p className="right-whois">
                    (experto en visualizacion de datos)
                </p>
              </div>
            </div>

        </div>
    </div>
  );
}

export default SeleccionDB;