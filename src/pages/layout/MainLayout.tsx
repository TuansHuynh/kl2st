import { Outlet } from "react-router-dom";
import Header from "../../layouts/Header";
import Menu from "../../layouts/Menu";

export default function MainLayout() {
    return (
        <div className="main-layout">
            <Header />
            <div  style={{display: "flex"}}>
                <div>
                    <Menu />
                </div>
                <div>
                    <Outlet />
                </div>
            </div>
            {/* <Footer /> */}
        </div>
    )
}
