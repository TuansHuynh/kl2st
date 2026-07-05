import { useState } from "react";
import { Input, Logo, Search, User } from "../components";


export default function Header() {
    const [search, setSearch] = useState("");

    return (
        <div className="header">
            <Logo />

            <div className="search">
                <Input
                    type="text"
                    input="Search..."
                    classname="input-search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
                <Search />
            </div>

            <User />
        </div>
    )
}