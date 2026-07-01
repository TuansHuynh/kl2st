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
        <div className='nav-menu' >

            <NavLink className='link home-link' to="/">Home</NavLink>

            <div className='menu-container' >
                <div className='title-container' onClick={handleStorage} aria-expanded={isStorageOpen}>
                    <span> File Storage </span>
                    {isExpanded && <ArrowDropDownIcon className='nav-caret'/>}
                </div>

                {isStorageOpen && (
                    <div className='menu-list' style={{ display: "flex", flexDirection: "column" }}>
                        <NavLink className='link doc-link' to="/doc"> Document </NavLink>
                        <NavLink className='link excel-link' to="/excel"> Excel </NavLink>
                        <NavLink className='link present-link' to="/present"> Presentation </NavLink>
                        <NavLink className='link note-link' to="/note"> Note </NavLink>
                    </div>
                )}
            </div>

            <div className='menu-container'>
                <div className='title-container' onClick={handleGroup} aria-expanded={isGroup}>
                    <span>Group</span>
                    {isExpanded && <ArrowDropDownIcon className=''/>}
                </div>

                {isGroup && (
                    <div className='menu-list' style={{ display: "flex", flexDirection: "column" }}>
                        <NavLink className='link account-link' to="/account"> Account </NavLink>
                        <NavLink className='link group-link' to="/group"> Group </NavLink>
                    </div>
                )}
            </div>
        </div>
    )
}