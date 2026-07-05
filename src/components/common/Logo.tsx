import { useNavigate } from "react-router-dom"

export default function Logo () {
    const navigate = useNavigate();

    const handleLinkLogo = () => {
        navigate('/')
    }

    const nameProject = "HT-Tech"

    return (
        <div className="logo" onClick={handleLinkLogo}>
            <img src="/logo.webp" alt="Logo" title="Logo" width={90} />
            <p> {nameProject} </p>
        </div>
    )
}