import { useState } from "react";
import { Input, Logo, Search, User } from "../components";


export default function Header() {
    const [search, setSearch] = useState("");

    return (
        <div style={{display: "flex", alignItems: "center", justifyContent: "space-between", height: "12dvh"}}>
            <Logo />

            <div style={{ display: "flex", justifyContent: "center"}}>
                <Input
                    type="text"
                    input="Search..."
                    classname=""
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <Search />
            </div>

            <User />
        </div>
    )
}