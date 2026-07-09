export type StorageType =
    | "document"
    | "word"
    | "excel"
    | "presentation"
    | "note";

export const storageConfig = {
    document: {
        title: "Document",
        color: "#1976d2",
    },
    word: {
        title: "Word",
        color: "#2b579a",
    },
    excel: {
        title: "Excel",
        color: "#217346",
    },
    presentation: {
        title: "Presentation",
        color: "#d24726",
    },
    note: {
        title: "Note",
        color: "#f4b400",
    },
} as const;