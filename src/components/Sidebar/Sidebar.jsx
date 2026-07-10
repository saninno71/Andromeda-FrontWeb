import { useState,useRef  } from "react";
import menuData  from "../../simul/menu.json";
import "./Sidebar.css";

function Sidebar({ sidebarOpen,setSidebarOpen, onSelectPage }) {


const scrollRef = useRef(null);
const scrollSpeedRef = useRef(0);
const frameRef = useRef(null);

const autoScrollLoop = () => {
  const el = scrollRef.current;

  if (el && scrollSpeedRef.current !== 0) {
    el.scrollTop += scrollSpeedRef.current;
    frameRef.current = requestAnimationFrame(autoScrollLoop);
  } else {
    frameRef.current = null;
  }
};

const handleSidebarPointerMove = (e) => {
  const el = scrollRef.current;
  if (!el) return;

  const rect = el.getBoundingClientRect();
  const y = e.clientY - rect.top;

  const zone = 55;
  const maxSpeed = 8;

  let speed = 0;

  if (y < zone) {
    speed = -maxSpeed * (1 - y / zone);
  } else if (y > rect.height - zone) {
    speed = maxSpeed * (1 - (rect.height - y) / zone);
  }

  scrollSpeedRef.current = speed;

  if (speed !== 0 && !frameRef.current) {
    frameRef.current = requestAnimationFrame(autoScrollLoop);
  }
};

const stopSidebarAutoScroll = () => {
  scrollSpeedRef.current = 0;

  if (frameRef.current) {
    cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
  }
};

function handleSidebarMouseLeave(e) {
  const rect = e.currentTarget.getBoundingClientRect();

  // console.log("deteccion de salida");

  if (e.clientX >= rect.right) {
    // console.log("deteccion IZQ");
    setSidebarOpen(false);
  }
};

return (
<aside
  className="sidebar"
  onMouseEnter={() => {
    setSidebarOpen(true);
  }}
  onMouseLeave={(e) => {
    handleSidebarMouseLeave(e);
    stopSidebarAutoScroll();
  }}
  onClick={() => { 
    setSidebarOpen(true)
  }}
>

  <div className={`sidebar-inner ${sidebarOpen ? "expanded" : ""}`}>

    <div
      ref={scrollRef}
      className="sidebar-scroll"
      onPointerMove={handleSidebarPointerMove}
      onPointerLeave={stopSidebarAutoScroll}
      onMouseLeave={stopSidebarAutoScroll}
    >
      <div className="sidebar-scroll-content">

        <div className="sidebar-top">

            {/* INICIO Menu Items Auto desde Jscon */}
            {menuData.map((item, index) => (

            <div className="menu-item" key={item.id}>  

              <div className="menu-main">
                <span className="icon">
                  <img
                    src={`${import.meta.env.BASE_URL}/images/menu-principal/${item.icon}.png`}
                    alt={item.label}
                  />
                </span>
                <span className="label">{item.label}</span>
              </div>

              {item.children && (
                <div className="sub-menu">

                {item.children.map((subItem) => (

                  <div
                    className="sub-menu-item"
                    key={subItem.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectPage({
                        route:subItem.route,
                        menuLabel:item.label,
                        submenuLabel:subItem.label
                      });
                    }}
                  >
                    <span className="sub-icon">▸</span>
                    <span>{subItem.label}</span>
                  </div>

                ))}

              </div>

            )}

            </div>
            )
            )}  

        </div>

        <div className="search-box">

          {!sidebarOpen && (
            <div className="menu-item">
              <div className="menu-main">
                <span className="icon">
                  <img
                    src={`${import.meta.env.BASE_URL}/images/menu-principal/buscar.png`}
                  />
                </span>
              </div>
            </div>
          )}

          {sidebarOpen && (
            <div className="search-input-wrapper">

            <input
              type="text"
              placeholder="Buscar"
              className="search-input"
            />

            <span className="search-input-icon">
              <img
                      src={`${import.meta.env.BASE_URL}/images/menu-principal/buscar.png`}
              />
            </span>

          </div>
          )}

        </div>  


        <div className="sidebar-bottom">
          <div className="menu-item">
            <div className="menu-main">
              <span className="icon">
                <img
                src={`${import.meta.env.BASE_URL}/images/menu-principal/Config.png`}
                />
              </span>
              <span className="label">Configuración</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  </div>    
</aside>
  );
}

export default Sidebar;
