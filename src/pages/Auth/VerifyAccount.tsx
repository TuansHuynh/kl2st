import { useNavigate } from "react-router-dom";
import { useState } from "react";

import { useTitle } from "../../hooks/useTitle";

import { Input } from "../../components";
import { ArrowBack } from "@mui/icons-material";

export default function VerifyAccount() {
    useTitle("Xác thực tài khoản")

    const navigate = useNavigate();
    const [username, setUserName] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        navigate("/recover")
    }

    const handleBackPage = () => {
        navigate(-1)
    }

    return (
        <>
            <div className="verify">

                <div className="back-pages-button" onClick={handleBackPage}>
                    <ArrowBack />
                </div>

                <div className="title">Verify your account</div>
                <form onSubmit={handleSubmit}>
                    <div className="input">
                        <Input
                            type="text"
                            input="Enter Your Username"
                            classname=""
                            value={username}
                            onChange={(e) => setUserName(e.target.value)}
                        />
                        <button
                            className="button-verify"
                            onClick={handleSubmit}>
                            Check Your Account
                        </button>
                    </div>
                </form>
            </div>
        </>
    )
}