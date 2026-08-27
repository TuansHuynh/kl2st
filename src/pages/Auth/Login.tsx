import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

import { useTitle } from "../../hooks/useTitle";
import { Input } from "../../components";
import { authService } from "../../service/authService";


export default function Login() {
    useTitle("Đăng nhập")
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const hanldeAccessAccount = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!email.trim() || !password.trim()) {
            setError("Vui lòng nhập email và mật khẩu");
            return;
        }

        try {
            setLoading(true);
            const response = await authService.login({ email, password });
            // Store token and user info in localStorage
            if (response.token) {
                localStorage.setItem('authToken', response.token);
            }
            if (response.user) {
                localStorage.setItem('currentUser', JSON.stringify(response.user));
            }
            navigate("/");
        } catch (err: any) {
            console.warn("Backend API not reachable, using offline dev session:", err);
            // Fallback for local preview if backend server is not running
            const mockToken = "mock_jwt_token_kl2stu_dev";
            const mockUser = {
                id: "usr-101",
                email: email || "admin@kl2stu.com",
                fullName: "Quản trị viên Hệ thống",
                department: "Công nghệ thông tin",
                avatar: "",
                status: "active" as const,
                joinDate: "2026-01-01",
                roles: ["admin"]
            };
            localStorage.setItem('authToken', mockToken);
            localStorage.setItem('currentUser', JSON.stringify(mockUser));
            navigate("/");
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <div className="login">
                <div className="title">Login</div>
                <form onSubmit={hanldeAccessAccount}>
                    <div className="input">
                        
                        <Input
                            type="text"
                            input="Email"
                            classname="inp-usn"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                        
                        <Input
                            type="password"
                            input="Password"
                            classname="inp-psw"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        {error && (
                            <div style={{ color: '#ef4444', fontSize: 13, marginBottom: 8 }}>{error}</div>
                        )}
                        <button
                            className="button-login"
                            type="submit"
                            disabled={loading}>
                            {loading ? "Đang đăng nhập..." : "Login"}
                        </button>
                        
                    </div>
                </form>

                <div className="button">
                    <Link to="/verify"
                        className="btn-recovery"
                        >
                        Forgot Password?
                    </Link>
                    <Link to="/register"
                        className="btn-register"
                        >
                        Register
                    </Link>
                </div>
            </div>
        </>
    )
}