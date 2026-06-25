import { AccountCircle } from "@mui/icons-material"
import { useNavigate } from "react-router-dom"

export default function User() {
    const navigate = useNavigate();

    const login = true;
    const avatar = login ? true : false;

    const hanldeLinkClick = () => {
        navigate("/login")
    }

    return (
        <>
            {avatar ? (
                <div className="user-container" style={{ display: "flex" }}>
                    <img className="avatar-img" src="/images/avatar.png" alt="avatar" title="Avatar" width="60" style={{ borderRadius: "50px" }} />
                    <div className="user-info">
                        <h3 className="user-name">Name</h3>
                        <p className="user-info">abc</p>
                        <button className="button-logout" onClick={hanldeLinkClick}>Logout</button>
                    </div>
                </div>
            ) : (
                <div className="user-container">
                    <AccountCircle className="avatar-img" />
                </div>
            )}

        </>
    )
}