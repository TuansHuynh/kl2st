import { Link, useNavigate } from "react-router-dom"
import { useState } from "react";

import { Input } from "../../components";

import { useTitle } from "../../hooks/useTitle";
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';

export default function Register() {
    useTitle("Đăng kí")

    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();

        navigate("/login")
    }

    // const handleRecoverPassword = () => { navigate("/verify") }

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
                            input="Username"
                            classname="inp-usn"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
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
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <button
                            className="button-register"
                            onClick={handleRegister}>
                            Register
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