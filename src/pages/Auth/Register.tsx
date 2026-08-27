import { Link, useNavigate } from "react-router-dom"
import { useState } from "react";

import { Input } from "../../components";

import { useTitle } from "../../hooks/useTitle";
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import { authService } from "../../service/authService";

export default function Register() {
    useTitle("Đăng kí")

    const navigate = useNavigate();
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!fullName.trim() || !email.trim() || !password.trim()) {
            setError("Vui lòng điền đầy đủ thông tin");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            setError("Định dạng email không hợp lệ (ví dụ: user@example.com)");
            return;
        }

        if (password.length < 6) {
            setError("Mật khẩu phải chứa ít nhất 6 ký tự");
            return;
        }

        if (password !== confirmPassword) {
            setError("Mật khẩu xác nhận không trùng khớp");
            return;
        }

        try {
            setLoading(true);
            await authService.register({
                email,
                password,
                fullName
            });
            alert("Đăng ký thành công!");
            navigate("/login");
        } catch (err: any) {
            const message = err?.response?.data?.message || err?.response?.data || "Đăng ký thất bại";
            setError(typeof message === 'string' ? message : "Đăng ký thất bại");
        } finally {
            setLoading(false);
        }
    }

    const handleBackPage = () => {
        navigate(-1)
    }

    return (
        <>
            <div className="register">

                <div className="back-pages-button" onClick={handleBackPage}>
                    <KeyboardBackspaceIcon />
                </div>

                <div className="title">Register</div>

                <form onSubmit={handleRegister}>
                    <div className="input">
                        <Input
                            type="text"
                            input="Full Name"
                            classname="inp-usn"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                        />
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
                        <Input
                            type="password"
                            input="Confirm Password"
                            classname="inp-psw"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        {error && (
                            <div style={{ color: '#ef4444', fontSize: 13, marginBottom: 8 }}>{error}</div>
                        )}
                        <button
                            className="button-register"
                            type="submit"
                            disabled={loading}>
                            {loading ? "Đang xử lý..." : "Register"}
                        </button>
                    </div>
                    <div className="button">
                        <Link to="/verify"
                            className="btn-verify"
                        >
                            Forgot Password?
                        </Link>
                        <Link to="/login"
                            className="btn-login"
                        >
                            Login
                        </Link>
                    </div>
                </form>

            </div>
        </>
    )
}