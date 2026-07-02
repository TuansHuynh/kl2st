import { useState } from "react";
import { NavLink } from "react-router-dom";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
// import FolderIcon from "@mui/icons-material/Folder";
// import DescriptionIcon from "@mui/icons-material/Description";

interface MenuNode {
    id: string;
    name: string;
    path?: string;
    children?: MenuNode[];
}

interface Props {
    node: MenuNode;
    level?: number;
}

export default function TreeItem({ node, level = 0 }: Props) {

    const [open, setOpen] = useState(false);

    const hasChildren = node.children?.length;

    return (
        <>
            <div className="" style={{ paddingLeft: level * 18 }} >
                {hasChildren ? (
                    <div onClick={() => setOpen(!open)}>
                        <span className="" >
                            {open
                                ? <KeyboardArrowDownIcon fontSize="small" />
                                : <KeyboardArrowRightIcon fontSize="small" />}
                        </span>

                        <span>{node.name}</span>
                    </div>
                ) : (
                    <>
                        <span style={{ width: 24 }} />

                        <NavLink to={node.path!} className="" >
                            {node.name}
                        </NavLink>
                    </>
                )}
            </div>

            {open && 
                node.children?.map(child => (
                    <TreeItem
                        key={child.id}
                        node={child}
                        level={level + 1}
                    />
                ))
            }
        </>
    );
}