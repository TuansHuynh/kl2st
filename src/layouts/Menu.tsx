import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import { useState } from "react";
import { NavLink } from "react-router-dom";
import { menuTree, type MenuNode } from '../components/menu';


export default function Menu() {
    console.log(menuTree.map((x) => x.name));

    const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

    const toggleMenu = (id: string) => {
        setOpenMenus((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    const renderMenu = (node: MenuNode, level = 0) => {
    if (!node.children || node.children.length === 0) {
        return (
            <NavLink
                key={node.id}
                className={ ({ isActive }) => `link ${node.id}-link level-${level} ${isActive ? "active" : ""}`}
                to={node.path ?? "*"}
            >
                {node.name}
            </NavLink>
        );
    }

    return (
        <div className="menu-container" key={node.id}>
            <div
                className="title-container"
                onClick={() => toggleMenu(node.id)}
            >
                <span>{node.name}</span>

                {openMenus[node.id] ? (
                    <KeyboardArrowDownIcon fontSize="small" />
                ) : (
                    <KeyboardArrowRightIcon fontSize="small" />
                )}
            </div>

            {openMenus[node.id] && (
                <div className={`menu-list level-${level}`}>
                    {node.children.map((child) =>
                        renderMenu(child, level + 1)
                    )}
                </div>
            )}
        </div>
    );
};

    return (
        <div className="nav-menu">
            {menuTree.map((node) => renderMenu(node))}
        </div>
    );
}