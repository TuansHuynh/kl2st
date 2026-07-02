import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { menuTree } from "../types/menu";

export default function Menu() {
    const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

    const toggleMenu = (id: string) => {
        setOpenMenus((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    return (
        <div className="nav-menu">
            {menuTree.map((node) => {
                // Menu không có children => Link bình thường
                if (!node.children || node.children.length === 0) {
                    return (
                        <NavLink
                            key={node.id}
                            className={`link ${node.id}-link`}
                            to={node.path!}
                        >
                            {node.name}
                        </NavLink>
                    );
                }

                // Menu có children => Accordion
                return (
                    <div className="menu-container" key={node.id}>
                        <div
                            className="title-container"
                            onClick={() => toggleMenu(node.id)}
                            aria-expanded={!!openMenus[node.id]}
                        >
                            <span>{node.name}</span>

                            {openMenus[node.id] ? (
                                <KeyboardArrowDownIcon fontSize="small" />
                            ) : (
                                <KeyboardArrowRightIcon fontSize="small" />
                            )}
                        </div>

                        {openMenus[node.id] && (
                            <div className="menu-list">
                                {node.children.map((child) => (
                                    <NavLink
                                        key={child.id}
                                        className={`link ${child.id}-link`}
                                        to={child.path!}
                                    >
                                        {child.name}
                                    </NavLink>
                                ))}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}