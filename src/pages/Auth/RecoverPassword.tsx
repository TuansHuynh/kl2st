import { useNavigate, useLocation } from "react-router-dom";
import { Input } from "../../components";
import { useTitle } from "../../hooks/useTitle";
import { useState, useEffect } from "react";
import { ArrowBack } from "@mui/icons-material";
import { authService } from "../../service/authService";

export default function RecoverPassword() {
    useTitle("Khôi phục mật khẩu");

    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email || "";
    const verified = location.state?.verified || false;

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [countdown, setCountdown] = useState(3);

    // Redirect to verify if not verified
    useEffect(() => {
        if (!verified || !email) {
            alert("Vui lòng xác minh tài khoản trước khi đổi mật khẩu.");
            navigate("/verify");
        }
    }, [verified, email, navigate]);

    // Handle countdown after success
    useEffect(() => {
        let interval: any;
        if (success && countdown > 0) {
            interval = setInterval(() => {
                setCountdown(prev => prev - 1);
            }, 1000);
        } else if (success && countdown === 0) {
            navigate("/login");
        }
        return () => clearInterval(interval);
    }, [success, countdown, navigate]);

    const handleRecover = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!password.trim() || !confirmPassword.trim()) {
            setError("Vui lòng điền đầy đủ thông tin");
            return;
        }

        if (password.length < 6) {
            setError("Mật khẩu mới phải có ít nhất 6 ký tự");
            return;
        }

        if (password !== confirmPassword) {
            setError("Mật khẩu xác nhận không khớp");
            return;
        }

        try {
            setLoading(true);
            await authService.recoverPassword({ email, password });
            setSuccess("Đổi mật khẩu thành công! Đang chuyển hướng về trang đăng nhập...");
        } catch (err: any) {
            const message = err?.response?.data?.message || err?.response?.data || "Không thể đổi mật khẩu";
            setError(typeof message === 'string' ? message : "Khôi phục mật khẩu thất bại");
        } finally {
            setLoading(false);
        }
    };

    const handleBackPage = () => {
        navigate(-1);
    };

    if (!verified || !email) {
        return null;
    }

    return (
        <>
            <div className="recovery">
                <div className="back-pages-button" onClick={handleBackPage}>
                    <ArrowBack />
                </div>

                <div className="title" style={{ fontSize: '32px', textAlign: 'center', marginBottom: '20px' }}>
                    Đặt mật khẩu
                </div>

                <form onSubmit={handleRecover}>
                    <div className="input">
                        <p style={{ fontSize: '14px', color: 'var(--text-muted)', textAlign: 'center', margin: '0 0 10px 0' }}>
                            Tài khoản: <strong>{email}</strong>
                        </p>
                        
                        <Input
                            type="password"
                            input="Nhập mật khẩu mới..."
                            classname=""
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <Input
                            type="password"
                            input="Xác nhận mật khẩu mới..."
                            classname=""
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />

                        {error && (
                            <div style={{ color: '#ef4444', fontSize: 13, marginTop: 4, textAlign: 'center' }}>
                                {error}
                            </div>
                        )}
                        {success && (
                            <div style={{ color: '#10b981', fontSize: 13, marginTop: 4, textAlign: 'center' }}>
                                {success} ({countdown}s)
                            </div>
                        )}

                        <button
                            className="button-recovery"
                            type="submit"
                            disabled={loading || !!success}
                            style={{ marginTop: '10px' }}
                        >
                            {loading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
}