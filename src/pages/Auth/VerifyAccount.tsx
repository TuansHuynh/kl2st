import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useTitle } from "../../hooks/useTitle";
import { Input } from "../../components";
import { ArrowBack } from "@mui/icons-material";
import { authService } from "../../service/authService";

export default function VerifyAccount() {
    useTitle("Xác thực tài khoản");

    const navigate = useNavigate();
    const [username, setUserName] = useState("");
    const [step, setStep] = useState<1 | 2>(1);
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [resendTimer, setResendTimer] = useState(0);

    useEffect(() => {
        let interval: any;
        if (resendTimer > 0 && step === 2) {
            interval = setInterval(() => {
                setResendTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [resendTimer, step]);

    const handleVerifyEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!username.trim()) {
            setError("Vui lòng nhập Email hoặc Tên đăng nhập");
            return;
        }

        // Basic email format check
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(username)) {
            setError("Email không đúng định dạng");
            return;
        }

        try {
            setLoading(true);
            await authService.verifyAccount(username);
            
            // Show OTP step
            setSuccess("Tài khoản hợp lệ! Mã OTP đã được gửi đến email.");
            setStep(2);
            setResendTimer(60); // 60s countdown
        } catch (err: any) {
            const message = err?.response?.data?.message || err?.response?.data || "Không tìm thấy tài khoản";
            setError(typeof message === 'string' ? message : "Xác thực tài khoản thất bại");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!otp.trim()) {
            setError("Vui lòng nhập mã OTP");
            return;
        }

        try {
            setLoading(true);
            await authService.verifyOtp(username, otp);
            setSuccess("Mã OTP chính xác! Đang chuyển đến trang đổi mật khẩu...");
            setTimeout(() => {
                navigate("/recover", { state: { email: username, verified: true } });
            }, 1500);
        } catch (err: any) {
            const message = err?.response?.data?.message || err?.response?.data || "Mã OTP không chính xác hoặc đã hết hạn";
            setError(typeof message === 'string' ? message : "Xác thực OTP thất bại");
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        if (resendTimer > 0) return;
        setError("");
        setSuccess("");
        try {
            setLoading(true);
            await authService.verifyAccount(username);
            setSuccess("Mã OTP mới đã được gửi đến email.");
            setResendTimer(60);
        } catch (err) {
            setError("Gửi lại OTP thất bại.");
        } finally {
            setLoading(false);
        }
    };

    const handleBackPage = () => {
        if (step === 2) {
            setStep(1);
            setOtp("");
            setError("");
            setSuccess("");
        } else {
            navigate(-1);
        }
    };

    return (
        <>
            <div className="verify">
                <div className="back-pages-button" onClick={handleBackPage}>
                    <ArrowBack />
                </div>

                <div className="title" style={{ fontSize: '32px', textAlign: 'center', marginBottom: '20px' }}>
                    {step === 1 ? "Xác minh" : "Mã OTP"}
                </div>

                {step === 1 ? (
                    <form onSubmit={handleVerifyEmail}>
                        <div className="input">
                            <p style={{ fontSize: '14px', color: 'var(--text-muted)', textAlign: 'center', margin: '0 0 10px 0' }}>
                                Vui lòng nhập email đăng ký tài khoản của bạn để nhận mã xác thực OTP.
                            </p>
                            <Input
                                type="text"
                                input="Nhập Email của bạn..."
                                classname=""
                                value={username}
                                onChange={(e) => setUserName(e.target.value)}
                            />
                            {error && (
                                <div style={{ color: '#ef4444', fontSize: 13, marginTop: 4, textAlign: 'center' }}>
                                    {error}
                                </div>
                            )}
                            <button
                                className="button-verify"
                                type="submit"
                                disabled={loading}
                            >
                                {loading ? "Đang xác thực..." : "Kiểm tra tài khoản"}
                            </button>
                        </div>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOtp}>
                        <div className="input">
                            <p style={{ fontSize: '14px', color: 'var(--text-muted)', textAlign: 'center', margin: '0 0 10px 0' }}>
                                Nhập mã OTP gồm 6 chữ số đã được gửi tới:<br />
                                <strong>{username}</strong>
                            </p>
                            <Input
                                type="text"
                                input="Mã OTP mẫu: 123456"
                                classname=""
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                            />
                            
                            {error && (
                                <div style={{ color: '#ef4444', fontSize: 13, marginTop: 4, textAlign: 'center' }}>
                                    {error}
                                </div>
                            )}
                            {success && (
                                <div style={{ color: '#10b981', fontSize: 13, marginTop: 4, textAlign: 'center' }}>
                                    {success}
                                </div>
                            )}

                            <button
                                className="button-verify"
                                type="submit"
                                style={{ marginTop: '10px' }}
                            >
                                Xác thực OTP
                            </button>

                            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px', fontSize: '13px' }}>
                                {resendTimer > 0 ? (
                                    <span style={{ color: '#94a3b8' }}>
                                        Gửi lại mã sau {resendTimer}s
                                    </span>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={handleResendOtp}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: '#3b82f6',
                                            cursor: 'pointer',
                                            fontWeight: 600,
                                            padding: 0
                                        }}
                                    >
                                        Gửi lại mã xác thực
                                    </button>
                                )}
                            </div>
                        </div>
                    </form>
                )}
            </div>
        </>
    );
}