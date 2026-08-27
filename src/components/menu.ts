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
        id: "flashcards",
        name: "Ôn tập Flashcards",
        path: "/flashcards"
    },
    {
        id: "storage",
        name: "Kho lưu trữ",
        children: [
            {
                id: "pdf",
                name: "File PDF",
                path: "/pdf",
            },
            {
                id: "word",
                name: "File Word",
                path: "/word",
            },
            {
                id: "excel",
                name: "File Excel",
                path: "/excel",
            },
            {
                id: "media",
                name: "File Media",
                path: "/media",
            },
            {
                id: "zip-rar",
                name: "File ZIP/RAR",
                path: "/zip",
            },
            {
                id: "note",
                name: "Ghi chú",
                path: "/note",
            },
            {
                id: "different",
                name: "File Khác",
                path: "/different",
            },
        ]
    },
    {
        id: "group",
        name: "Nhóm",
        children: [
            {
                id: "team",
                name: "Dnah sách Nhóm",
                path: "/team"
            },
            {
                id: "meeting",
                name: "Danh sách Cuộc họp",
                path: "/meeting"
            },
        ]
    },
    {
        id: "account",
        name: "Quản lí tài khoản",
        path: "/account"
    },
    {
        id: "setting",
        name: "Cài đặt",
        path: "/setting"
    },
    {
        id: "help",
        name: "Giúp đỡ",
        path: "/help"
    },
];