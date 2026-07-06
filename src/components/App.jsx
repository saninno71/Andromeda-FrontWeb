import { useState } from "react";
import Login from "../components/Login/Login";
import SeleccionAmbiente from "../components/Login/SeleccionDB";
import PantallaPrincipal from "../components/PantallaPrincipal/PantallaPrincipal";
import RecuperarPassword from "../components/Login/RecuperarPassword";
import { configurarApiPorLogin } from "../config/AndromedaFrontConfig";

function App() {
  const [step, setStep] = useState("login");
  const [user, setUser] = useState("user");

  return (
    <>
      {step === "login" && (
        <Login
          onResult={(result,loginUser) => {
            //  console.log("STATE USER:", loginUser);
            setUser(loginUser);
            if (result === "success") {
              configurarApiPorLogin(loginUser);
              setStep("ambiente");
            }
            if (result === "forgot") setStep("forgot");
          }}
        />
      )}


      {step === "forgot" && (
        <RecuperarPassword onBack={() => setStep("login")} />
      )}

      {step === "ambiente" && (
        <SeleccionAmbiente  user={user} onNext={() => setStep("app")} />
      )}

      {step === "app" && <PantallaPrincipal />}
    </>
  );
}

export default App;
