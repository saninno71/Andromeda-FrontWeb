import { useCallback, useEffect, useRef, useState } from "react";
import Header from "../Header/Header";
import Sidebar from "../Sidebar/Sidebar";
import Content from "../Content/Content";
import EstadoSistemaModal from "../DiagnosticoSistema/EstadoSistemaModal";
import { consultarEstadoSistema } from "../DiagnosticoSistema/diagnosticoSistemaService";
import "./PantallaPrincipal.css";

function PantallaPrincipal() {
  //const [view, setView] = useState("home");
  const [pantalla, setPantalla] = useState("sub1");
  const [monitorView, setMonitorView] = useState("visible");
  const [msgMonitor, setMsgMonitor] = useState("123");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mostrarEstadoSistema, setMostrarEstadoSistema] = useState(false);
  const [estadoSistema, setEstadoSistema] = useState("gris");
  const [resultadoDiagnostico, setResultadoDiagnostico] = useState(null);
  const [errorDiagnostico, setErrorDiagnostico] = useState("");
  const [consultandoDiagnostico, setConsultandoDiagnostico] = useState(false);
  const [fechaUltimoDiagnostico, setFechaUltimoDiagnostico] = useState(null);
  const secuenciaDiagnostico = useRef(0);
  const [activePage, setActivePage] = useState({
    route:"accesos_directos",
    menuLabel:"",
    submenuLabel:""
  });
  
  const addMsgMonitor = (strMsg) =>
    setMsgMonitor(strMsg);

  const ejecutarDiagnostico = useCallback(async () => {
    const secuencia = ++secuenciaDiagnostico.current;
    setConsultandoDiagnostico(true);
    setErrorDiagnostico("");

    try {
      const resultado = await consultarEstadoSistema();
      if (secuencia !== secuenciaDiagnostico.current) return;

      setResultadoDiagnostico(resultado);
      setEstadoSistema(resultado.estado);
    } catch (error) {
      if (secuencia !== secuenciaDiagnostico.current) return;

      setResultadoDiagnostico(null);
      setErrorDiagnostico(error.message || "No se pudo ejecutar el diagnóstico.");
      setEstadoSistema("rojo");
    } finally {
      if (secuencia === secuenciaDiagnostico.current) {
        setFechaUltimoDiagnostico(new Date());
        setConsultandoDiagnostico(false);
      }
    }
  }, []);

  useEffect(() => {
    ejecutarDiagnostico();

    return () => {
      secuenciaDiagnostico.current += 1;
    };
  }, [ejecutarDiagnostico]);

  const abrirEstadoSistema = useCallback(() => {
    setMostrarEstadoSistema(true);
    ejecutarDiagnostico();
  }, [ejecutarDiagnostico]);

  return (
    <div className="PantallaPrincipal">
      <Header
        className="header"
        menuLabel={activePage.menuLabel}
        submenuLabel={activePage.submenuLabel}
      />
      <div className="main">
        <Sidebar
          className="sidebar"
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          onSelectPage={setActivePage}
          onAbrirEstadoSistema={abrirEstadoSistema}
          estadoSistema={estadoSistema}
        />
        <Content
          className="content"
          activeRoute={activePage.route}
          menuLabel={activePage.menuLabel}
          submenuLabel={activePage.submenuLabel}
        />
      </div>
      {mostrarEstadoSistema && (
        <EstadoSistemaModal
          onCerrar={() => setMostrarEstadoSistema(false)}
          onVerificar={ejecutarDiagnostico}
          consultando={consultandoDiagnostico}
          resultado={resultadoDiagnostico}
          error={errorDiagnostico}
          fechaUltimoDiagnostico={fechaUltimoDiagnostico}
        />
      )}
    
    </div>
  );
}

export default PantallaPrincipal;
