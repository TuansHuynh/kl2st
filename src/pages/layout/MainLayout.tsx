import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Menu as MenuIcon, Chat as ChatIcon } from "@mui/icons-material";
import Header from "../../layouts/Header";
import Menu from "../../layouts/Menu";
import Recent from "../../layouts/Recent";
import Chat from "../../components/common/Chat";
import "../../styles/pages/MainLayout.scss";

export default function MainLayout() {
    const navigate = useNavigate();
    const token = localStorage.getItem('authToken');

    const [isMenuOpen, setIsMenuOpen] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    useEffect(() => {
        if (!token) {
            navigate("/login");
        }
    }, [token, navigate]);

    if (!token) {
        return null;
    }

    return (
        <div className="main-layout">
            <Header />
            <div className="main">
                <div className={`menu-wrapper ${!isMenuOpen ? 'collapsed' : ''}`}>
                    <div className="menu-inner">
                        <Menu />
                    </div>
                    <button 
                        className="toggle-btn toggle-menu" 
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        title={isMenuOpen ? "Ẩn Menu" : "Hiện Menu"}
                    >
                        {isMenuOpen ? <ChevronLeft fontSize="small" /> : <MenuIcon fontSize="small" />}
                    </button>
                </div>

                <div className="link-outlet">
                    <Outlet />
                </div>

                <div className={`sidebar-wrapper ${!isSidebarOpen ? 'collapsed' : ''}`}>
                    <button 
                        className="toggle-btn toggle-sidebar" 
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        title={isSidebarOpen ? "Ẩn Chat & Recent" : "Hiện Chat & Recent"}
                    >
                        {isSidebarOpen ? <ChevronRight fontSize="small" /> : <ChatIcon fontSize="small" />}
                    </button>
                    <div className="sidebar-inner">
                        <div className="recent-sidebar">
                            <div className="sidebar-section recent-section">
                                <Recent />
                            </div>
                            <div className="sidebar-section chat-section">
                                <Chat />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
