import { Outlet } from "react-router-dom";
import Header from "../../layouts/Header";
import Menu from "../../layouts/Menu";
// import Footer from "../../layouts/Footer";

export default function MainLayout() {
    return (
        <div className="main-layout">
            <Header />
            <div className="menu">
                <div>
                    <Menu />
                </div>
                <div>
                    <Outlet />
                </div>
            </div>
                {/* <div>
                    <Footer />
                </div> */}
        </div>
    )
}
