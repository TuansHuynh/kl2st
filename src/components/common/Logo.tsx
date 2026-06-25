export default function Logo () {

    const nameProject = "HT-Tech"

    return (
        <div className="" style={{display: "flex", alignItems: "center"}}>
            <img src="/images/avatar.png" alt="Logo" title="Logo" width={60} />
            <p> {nameProject} </p>
        </div>
    )
}