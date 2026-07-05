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
                <div className="user">
                    <img className="avatar-img" src="/images/avatar.png" alt="avatar" title="Avatar" />
                    <div className="user-info">
                        <h3 className="user-name">Tunas</h3>
                        {/* <p className="user-info">nkoc.nho.17.04@gmail.com</p> */}
                        <button className="button-logout" onClick={hanldeLinkClick}>Logout</button>
                    </div>
                </div>
            ) : (
                <div className="user">
                    <AccountCircle className="avatar-img" />
                </div>
            )}

        </>
    )
}