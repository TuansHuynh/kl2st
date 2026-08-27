import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";

export default function GuestLayout () {
    const navigate = useNavigate();
    const token = localStorage.getItem('authToken');

    useEffect(() => {
        if (token) {
            navigate("/");
        }
    }, [token, navigate]);

    if (token) {
        return null;
    }

    return (
        <div className="guest-layout">
            <Outlet />
        </div>
    )
}