import "./Header.css";
import logoAndromeda from "../../assets/logo-andromeda.png";

function Header({
  nombreCompleto = "Boyano Monalli",
  usuarioRed = "BMDG8A",
  descripcion = "Ruben Sanchez",
  menuLabel = "",
  submenuLabel = "",
  logoEmpresa = "",
  avatar = "",
}) {
  return (
    <header className="header">
      {/* IZQUIERDA */}
      <div className="header-left">
        <img src={logoAndromeda} className="header-logo" />
        {(menuLabel || submenuLabel) && (
          <div className="header-page-title">
            {menuLabel && (
              <span className="header-page-menu">
                {menuLabel}
              </span>
            )}

            {menuLabel && submenuLabel && (
              <span className="header-page-separator">
                |
              </span>
            )}

            {submenuLabel && (
              <span className="header-page-submenu">
                {submenuLabel}
              </span>
            )}
          </div>
        )}
      </div>

      {/* DERECHA */}
      <div className="header-right">
        <div className="header-user-info">
          <div className="header-line1">
            <span className="header-name">
              {nombreCompleto}
            </span>

            <span className="header-separator">
              —
            </span>

            <span className="header-user">
              {usuarioRed}
            </span>
          </div>

          <div className="header-line2">
            {descripcion}
          </div>
        </div>

        <img src={`${import.meta.env.BASE_URL}images/logoempresa.png`} className="header-avatar" />
        
      </div>
    </header>
  );
}

export default Header;
