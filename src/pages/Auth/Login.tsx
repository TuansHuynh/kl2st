import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

import { useTitle } from "../../hooks/useTitle";
import { Input } from "../../components";


export default function Login() {
    useTitle("Đăng nhập")
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    // const handleRegister = () => { navigate("/register") }
    // const handleRecoverPassword = () => { navigate("/verify") }
    const hanldeAccessAccount = (e: React.FormEvent) => {
        e.preventDefault();

        if (username === "admin" && password === "123") {
            navigate("/")
        } else {
            alert("Bạn đã nhập sai tài khoản hoặc mật khẩu")
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
                        <button
                            className="button-login"
                            onClick={hanldeAccessAccount}>
                            Login
                        </button>
                        
                    </div>
                </form>

                <div className="button">
                    <Link to="/verify"
                        className="btn-recovery"
                        // onClick={handleRecoverPassword}
                        >
                        Forgot Password?
                    </Link>
                    <Link to="/register"
                        className="btn-register"
                        // onClick={handleRegister}
                        >
                        Register
                    </Link>
                </div>
            </div>
        </>
    )
}

// import { useNavigate } from "react-router-dom";
// import { useState } from "react";
// import { invoke } from "@tauri-apps/api/core";

// import { useTitle } from "../../hooks/useTitle";
// import { Input } from "../../components";

// export default function Login() {
//     useTitle("Đăng nhập");

//     const navigate = useNavigate();
//     const [email, setEmail] = useState("");
//     const [password, setPassword] = useState("");
//     const [loading, setLoading] = useState(false);

//     const handleRegister = () => {
//         navigate("/register");
//     };

//     const handleRecoverPassword = () => {
//         navigate("/verify");
//     };

//     const handleAccessAccount = async (e: React.FormEvent) => {
//         e.preventDefault();

//         try {
//             setLoading(true);

//             const result = await invoke<string>("login", {
//                 email: email,
//                 password: password,
//             });

//             // console.log("Login result:", result);

//             alert(result);

//             // nếu login OK → chuyển trang
//             navigate("/");
//         } catch (error: any) {
//             // console.log("Login error:", error);
//             // alert(error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     return (
//         <div
//             style={{
//                 display: "flex",
//                 flexDirection: "column",
//                 justifyContent: "center",
//                 alignItems: "center",
//             }}
//         >
//             <h1>Login</h1>

//             <form onSubmit={handleAccessAccount}>
//                 <div style={{ display: "flex", flexDirection: "column", gap: 10 , marginTop: "200px"}}>
                    
//                     <Input
//                         type="text"
//                         input="Email"
//                         classname="inp-usn"
//                         value={email}
//                         onChange={(e) => setEmail(e.target.value)}
//                     />

//                     <Input
//                         type="password"
//                         input="Password"
//                         classname="inp-psw"
//                         value={password}
//                         onChange={(e) => setPassword(e.target.value)}
//                     />

//                     <button
//                         type="submit"
//                         style={{
//                             display: "flex",
//                             justifyContent: "center",
//                             border: "none",
//                             outline: "none",
//                             backgroundColor: "transparent",
//                             cursor: "pointer",
//                         }}
//                         disabled={loading}
//                     >
//                         {loading ? "Loading..." : "Login"}
//                     </button>
//                 </div>
//             </form>

//             <div style={{ marginTop: 10 }}>
//                 <button
//                     style={{
//                         border: "none",
//                         outline: "none",
//                         backgroundColor: "transparent",
//                         cursor: "pointer",
//                     }}
//                     onClick={handleRecoverPassword}
//                 >
//                     Forgot Password?
//                 </button>

//                 <button
//                     style={{
//                         border: "none",
//                         outline: "none",
//                         backgroundColor: "transparent",
//                         cursor: "pointer",
//                     }}
//                     onClick={handleRegister}
//                 >
//                     Register
//                 </button>
//             </div>
//         </div>
//     );
// }