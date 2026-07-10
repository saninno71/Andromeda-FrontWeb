import { useState } from "react";
import Header from "../Header/Header";
import Sidebar from "../Sidebar/Sidebar";
import Content from "../Content/Content";
import "./PantallaPrincipal.css";

function PantallaPrincipal() {
  //const [view, setView] = useState("home");
  const [pantalla, setPantalla] = useState("sub1");
  const [monitorView, setMonitorView] = useState("visible");
  const [msgMonitor, setMsgMonitor] = useState("123");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState({
    route:"accesos_directos",
    menuLabel:"",
    submenuLabel:""
  });
  
  const addMsgMonitor = (strMsg) =>
    setMsgMonitor(strMsg);

  return (
    <div className="PantallaPrincipal">
      <Header
        className="header"
        menuLabel={activePage.menuLabel}
        submenuLabel={activePage.submenuLabel}
      />
      <div className="main">
        <Sidebar className="sidebar" sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} onSelectPage={setActivePage}  />
        <Content className="content" activeRoute={activePage.route} /> 
      </div>
    
    </div>
  );
}

export default PantallaPrincipal;

