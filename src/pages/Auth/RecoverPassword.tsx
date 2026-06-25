import { useNavigate } from "react-router-dom";
import { Input } from "../../components";
import { useTitle } from "../../hooks/useTitle";
import { useState } from "react";
import { ArrowBack } from "@mui/icons-material";

export default function RecoverPassword() {
    useTitle("Khôi phục mật khẩu");

    const navigate = useNavigate();
    const [password, setPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");

    const handleRecover = (e: React.FormEvent) => {
        e.preventDefault();

        navigate("/login")
    }

    const handleBackPage = () => {
        navigate(-1)
    }

    return (
        <>
            <div className="recovery">

                <div className="back-pages-button" onClick={handleBackPage}>
                    <ArrowBack />
                </div>

                <div className="title">Recover Password</div>
                <form onSubmit={handleRecover}>
                    <div className="input">
                        <Input
                            type="password"
                            input="New Password"
                            classname=""
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <Input
                            type="password"
                            input="Confirm New Password"
                            classname=""
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <button
                            className="button-recovery"
                            onClick={handleRecover}>
                            Submit
                        </button>
                    </div>
                </form>
            </div>
        </>
    )
}