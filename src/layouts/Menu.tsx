import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { useState } from "react";
import { NavLink } from "react-router-dom";


export default function Menu() {
    const [isExpanded, setIsExpanded] = useState(true);
    const [isStorageOpen, setIsStorageOpen] = useState(false);
    const [isGroup, setIsGroup] = useState(false)

    const handleStorage = () => {
        if (!isExpanded) {
            setIsExpanded(true)
        }
        setIsStorageOpen((prev) => !prev)
    }

    const handleGroup = () => {
        if (!isExpanded) {
            setIsExpanded(true)
        }
        setIsGroup((prev) => !prev)
    }

    return (
        <div className='' style={{ display: "flex", flexDirection: "column" }}>
            <NavLink className='' to="/">
                Home
            </NavLink>
            <div className='' >
                <div className=''>
                    <div className='' onClick={handleStorage} aria-expanded={isStorageOpen}>
                        <span> File Storage </span>
                        {isExpanded && <ArrowDropDownIcon />}
                    </div>

                    {isStorageOpen && (
                        <div className=''>
                            <NavLink className='' to="/doc"> Document </NavLink>
                            <NavLink className='' to="/excel"> Excel </NavLink>
                            <NavLink className='' to="/present"> Presentation </NavLink>
                            <NavLink className='' to="/note"> Note </NavLink>
                        </div>
                    )}
                </div>
            </div>
            <div>
                <div className='' onClick={handleGroup} aria-expanded={isGroup}>
                    <span>Group</span>
                    {isExpanded && <ArrowDropDownIcon />}
                </div>

                {isGroup && (
                    <div>
                        <NavLink to="/account"> Account </NavLink>
                        <NavLink to="/group"> Group </NavLink>
                    </div>
                )}
            </div>
        </div>
    )
}