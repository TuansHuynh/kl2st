import { Outlet } from "react-router-dom";
import Header from "../../layouts/Header";
import Menu from "../../layouts/Menu";
import Recent from "../../layouts/Recent";
// import Footer from "../../layouts/Footer";

export default function MainLayout() {
    return (
        <div className="main-layout">
            <Header />
            <div className="main">
                <div className="menu">
                    <Menu />
                </div>
                <div className="link-outlet">
                    <Outlet />
                </div>
                <div className="recent">
                    <Recent />
                </div>
            </div>
                {/* <div>
                    <Footer />
                </div> */}
        </div>
    )
}
