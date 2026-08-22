import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { useLanguage } from "../context/useLanguage";

function Navbar() {
    const { user, logout } = useAuth();
    const { t } = useLanguage();

    return (
        <nav className="site-nav">
            <div className="nav-inner">
                <Link className="brand" to="/" aria-label="JanSeva AI home">
                    <span className="brand-mark">JS</span>
                    <span><strong>JanSeva</strong><small>AI civic desk</small></span>
                </Link>
                <div className="nav-links">
                <NavLink to="/" end>{t("nav.home")}</NavLink>

                {user ? (
                    <>
                        <NavLink to="/submit-complaint">{t("nav.submit")}</NavLink>
                        <NavLink to="/my-complaints">{t("nav.mine")}</NavLink>
                        <NavLink to="/language">{t("nav.language")}</NavLink>
                        {user.role !== "citizen" && <NavLink to="/official">{t("nav.official")}</NavLink>}
                        <button className="nav-logout" type="button" onClick={logout}>{t("nav.logout")}</button>
                    </>
                ) : (
                    <>
                        <NavLink to="/login">{t("nav.login")}</NavLink>
                        <NavLink className="nav-cta" to="/register">{t("nav.register")}</NavLink>
                    </>
                )}
                </div>
            </div>
        </nav>
    );
}

export default Navbar;