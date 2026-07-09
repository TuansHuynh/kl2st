export interface MenuNode {
    id: string;
    name: string;
    path?: string;
    children?: MenuNode[];
}

export const menuTree: MenuNode[] = [
    {
        id: "home",
        name: "Home",
        path: "/home"
    },
    {
        id: "storage",
        name: "File Storage",
        children: [
            {
                id: "pdf",
                name: "PDF",
                path: "/pdf",
            },
            {
                id: "word",
                name: "Word",
                path: "/word",
            },
            {
                id: "excel",
                name: "Excel",
                path: "/excel",
            },
            {
                id: "media",
                name: "Media",
                path: "/media",
            },
            {
                id: "zip-rar",
                name: "ZIP/RAR",
                path: "/zip",
            },
            {
                id: "note",
                name: "Note",
                path: "/note",
            },
            {
                id: "different",
                name: "Different",
                path: "/different",
            },
        ]
    },
    {
        id: "group",
        name: "Group",
        children: [
            {
                id: "team",
                name: "Team",
                path: "/team"
            },
            {
                id: "meeting",
                name: "Meeting",
                path: "/meeting"
            },
        ]
    },
    {
        id: "account",
        name: "Account",
        path: "/account"
    },
    {
        id: "setting",
        name: "Setting",
        path: "/setting"
    },
    {
        id: "help",
        name: "Help",
        path: "/help"
    },
];