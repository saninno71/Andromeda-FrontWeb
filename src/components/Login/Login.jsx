import { useState } from "react";

import { validateLogin } from "./authService.js";
import './Login.css'
import logo from "../../assets/logo-andromeda.png";

function Login({onResult}) {

  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    const validationError = validateLogin(user, pass);

    if (validationError) {
      setError(validationError);
      console.log(validationError);
      return;
    }

    setError("");
    console.log("Todo OK");
    onResult("success",user);
  };

  const handleKeyDown = (e) => {
    if (e.key !== "Enter") {
      return;
    }

    handleSubmit(e);
  };
    
  return (
    
    <div className="login-page">
        
        <div className="login-card">
    
            <div className="login-left">
              <img src={logo} className="logo" />
              

              <div className="login-content">
                <h2 className="welcome">¡Bienvenido!</h2> 

                <form
                  className="login-form"
                  onSubmit={handleSubmit}
                  onKeyDown={handleKeyDown}
                >

                  <div className="input-group floating">
                    <input 
                      className="input-user" 
                      type="text" 
                      placeholder=" " 
                      // required 
                      autoFocus 
                      value={user}
                      onChange={(e) => {setUser(e.target.value);
                                        setError("");}
                      }
                    />
                    <label>Usuario</label>
                  </div>

                  <div className="input-group floating">
                    <input 
                      className="input-password" 
                      type="password" 
                      placeholder=" " 
                      value={pass}
                      onChange={(e) => {setPass(e.target.value);
                                        setError("");}
                      }
                    />
                    <label>Contraseña</label>
                  </div>

                  <div className="login-actions">
                    <a href="#" className="forgot">¿Olvidaste tu contraseña?</a>
                    <button type="submit" className="btn-login">INGRESAR</button>
                  </div>

                  <div className={`error-box ${error ? "show" : ""}`}>
                    <p>{error}</p>
                  </div>

                </form>

              </div>
            </div>

            <div className="login-right">
              <div className="right-content">
                <p className="right-phrase">
                  "Lo que no se mide, no se puede mejorar."
                </p>

                <p className="right-author">
                    — Peter Drucker
                </p>
              </div>
            </div>

            <span className="login-version">v5.2</span>

        </div>
    </div>
  );
}

export default Login;
