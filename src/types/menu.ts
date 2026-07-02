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
                id: "doc",
                name: "Document",
                path: "/doc",
                children: [
                    {
                        id: "api-doc",
                        name: "API",
                        path: "/doc/api"
                    },
                    {
                        id: "guide",
                        name: "Guide",
                        path: "/doc/guide"
                    }
                ]
            },
            {
                id: "excel",
                name: "Excel",
                path: "/excel"
            },
            {
                id: "presentation",
                name: "Presentation",
                path: "/present"
            },
            {
                id: "note",
                name: "Note",
                path: "/note"
            }
        ]
    },
    {
        id: "group",
        name: "Group",
        children: [
            {
                id: "account",
                name: "Account",
                path: "/account"
            },
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
    }
];