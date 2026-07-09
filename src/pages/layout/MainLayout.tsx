import { Outlet } from "react-router-dom";
import Header from "../../layouts/Header";
import Menu from "../../layouts/Menu";
import Recent from "../../layouts/Recent";
import Chat from "../../components/common/Chat";
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
                <div className="recent" style={{backgroundColor: "rgba(98, 187, 255, 0.5)", borderRadius: "10px 0 0 10px", width: "30dvh"}}>
                    <div>
                        <Recent />
                    </div>
                    <div>
                        <Chat />
                    </div>
                </div>
            </div>
                {/* <div>
                    <Footer />
                </div> */}
        </div>
    )
}
