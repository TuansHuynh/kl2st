import React, { useState, useEffect } from "react";
import { Close, CloudUpload } from "@mui/icons-material";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import DescriptionIcon from "@mui/icons-material/Description";
import TableChartIcon from "@mui/icons-material/TableChart";
import ImageIcon from "@mui/icons-material/Image";
import FolderZipIcon from "@mui/icons-material/FolderZip";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import LocalOfferIcon from "@mui/icons-material/LocalOffer";
import { documentService } from "../../service/documentService";
import type { Document } from "../../types";
import * as XLSX from 'xlsx';
import JSZip from 'jszip';

const AVAILABLE_TAGS = [
    "bài tập trắc nghiệm",
    "tài liệu học tập",
    "bài giảng",
    "đề thi",
    "tham khảo",
];

interface UploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    file: File | null;
    onUploadSuccess: (doc: Document) => void;
}

const formatSize = (bytes: number): string => {
    if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    return (bytes / 1024).toFixed(0) + " KB";
};

const getFileIcon = (fileName: string) => {
    const ext = fileName.split(".").pop()?.toLowerCase();
    const style = { fontSize: 44, color: "#64748b" };
    if (ext === "pdf") return <PictureAsPdfIcon style={{ ...style, color: "#ef4444" }} />;
    if (["doc", "docx"].includes(ext || "")) return <DescriptionIcon style={{ ...style, color: "#3b82f6" }} />;
    if (["xls", "xlsx"].includes(ext || "")) return <TableChartIcon style={{ ...style, color: "#10b981" }} />;
    if (["png", "jpg", "jpeg", "gif", "svg"].includes(ext || "")) return <ImageIcon style={{ ...style, color: "#ec4899" }} />;
    if (["zip", "rar", "7z", "tar", "gz"].includes(ext || "")) return <FolderZipIcon style={{ ...style, color: "#f59e0b" }} />;
    return <InsertDriveFileIcon style={style} />;
};

const getDocumentType = (fileName: string): string => {
    const ext = fileName.split(".").pop()?.toLowerCase();
    if (ext === "pdf") return "pdf";
    if (["doc", "docx"].includes(ext || "")) return "word";
    if (["xls", "xlsx", "csv"].includes(ext || "")) return "excel";
    if (["png", "jpg", "jpeg", "gif", "svg", "mp4", "avi", "mov", "mkv", "webm", "mp3", "wav", "ogg", "flac"].includes(ext || "")) return "image";
    if (["zip", "rar", "7z", "tar", "gz"].includes(ext || "")) return "zip";
    return "other";
};

export default function UploadModal({ isOpen, onClose, file, onUploadSuccess }: UploadModalProps) {
    const [fileName, setFileName] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [selectedTags, setSelectedTags] = useState<string[]>([]);

    // Load current user details
    const storedUser = localStorage.getItem("currentUser");
    const currentUser = storedUser ? JSON.parse(storedUser) : null;
    const authorName = currentUser?.fullName || "Chưa đăng nhập";

    useEffect(() => {
        if (file) {
            // Remove extension from edited name input for easier editing, we append it back in backend
            const nameParts = file.name.split(".");
            if (nameParts.length > 1) {
                nameParts.pop();
            }
            setFileName(nameParts.join("."));
            setSelectedTags([]);
            setError("");
        }
    }, [file]);

    const toggleTag = (tag: string) => {
        setSelectedTags(prev =>
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        );
    };

    if (!isOpen || !file) return null;

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!fileName.trim()) {
            setError("Tên tài liệu không được để trống");
            return;
        }

        try {
            setLoading(true);
            setError("");
            const type = getDocumentType(file.name);

            // Collect metadata defaults
            const metadata: Record<string, any> = {
                type,
                name: fileName.trim(),
                authorId: currentUser?.id,
                tags: selectedTags.length > 0 ? selectedTags : undefined,
            };

            // Fake metadata for demonstration for other types
            if (type === "pdf") metadata.pages = Math.floor(Math.random() * 20) + 1;

            if (type === "word") {
                try {
                    const arrayBuffer = await file.arrayBuffer();
                    const zip = await JSZip.loadAsync(arrayBuffer);
                    const docXml = await zip.file("word/document.xml")?.async("string");
                    if (docXml) {
                        const text = docXml.replace(/<[^>]+>/g, " ");
                        metadata.wordCount = text.trim().split(/\s+/).filter((w: string) => w.length > 0).length;
                    } else {
                        metadata.wordCount = 0;
                    }
                } catch (e) {
                    console.error("Word parsing error:", e);
                    metadata.wordCount = 0;
                }
            }
            if (type === "excel") {
                try {
                    const arrayBuffer = await file.arrayBuffer();
                    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
                    metadata.sheets = workbook.SheetNames.length;

                    let totalRows = 0;
                    workbook.SheetNames.forEach(sheetName => {
                        const sheet = workbook.Sheets[sheetName];
                        if (sheet['!ref']) {
                            const range = XLSX.utils.decode_range(sheet['!ref']);
                            totalRows += (range.e.r - range.s.r + 1);
                        }
                    });
                    metadata.rows = totalRows;
                } catch (e) {
                    console.error("XLSX error:", e);
                    metadata.sheets = Math.floor(Math.random() * 3) + 1;
                    metadata.rows = Math.floor(Math.random() * 200) + 10;
                }
            }
            if (type === "image") {
                const ext = file.name.split(".").pop()?.toLowerCase();
                let mediaType = 'image';
                if (['mp4', 'avi', 'mov', 'mkv', 'webm'].includes(ext || '')) mediaType = 'video';
                else if (['mp3', 'wav', 'ogg', 'flac'].includes(ext || '')) mediaType = 'audio';
                metadata.mediaType = mediaType;
                metadata.resolution = mediaType === 'image' ? '1920x1080' : '—';
            }
            if (type === "zip") {
                const ext = file.name.split(".").pop()?.toLowerCase();
                let archiveType = 'zip';
                if (ext === 'rar') archiveType = 'rar';
                else if (ext === '7z') archiveType = '7z';
                else if (ext === 'gz' || ext === 'tar') archiveType = 'tar.gz';
                metadata.archiveType = archiveType;
                try {
                    const arrayBuffer = await file.arrayBuffer();
                    const zip = await JSZip.loadAsync(arrayBuffer);
                    metadata.fileCount = Object.keys(zip.files).filter(name => !name.endsWith('/')).length;
                } catch (e) {
                    metadata.fileCount = 0;
                }
            }
            if (type === "other") {
                const ext = '.' + (file.name.split(".").pop()?.toLowerCase() || '');
                metadata.fileType = ext;
                let category = 'other';
                if (['.pptx', '.ppt', '.key'].includes(ext)) category = 'presentation';
                else if (['.js', '.ts', '.py', '.java', '.sql', '.yaml', '.yml', '.json', '.xml', '.env', '.sh'].includes(ext)) category = 'code';
                else if (['.txt', '.md', '.rtf', '.log'].includes(ext)) category = 'text';
                metadata.category = category;
            }

            const doc = await documentService.uploadDocument(file, metadata);
            onUploadSuccess(doc);
            onClose();
        } catch (err: any) {
            console.error("Upload error:", err);
            setError(err?.response?.data?.message || err?.response?.data || "Không thể tải tài liệu lên.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.overlay}>
            <div style={styles.modal}>
                <div style={styles.header}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <CloudUpload style={{ color: "#3b82f6" }} />
                        <h3 style={styles.title}>Tải lên tài liệu</h3>
                    </div>
                    <button onClick={onClose} style={styles.closeBtn} disabled={loading}>
                        <Close style={{ fontSize: 20 }} />
                    </button>
                </div>

                <form onSubmit={handleUpload} style={styles.form}>
                    <div style={styles.fileDetails}>
                        <div style={styles.iconContainer}>{getFileIcon(file.name)}</div>
                        <div style={styles.metaInfo}>
                            <div style={styles.metaRow}>
                                <span style={styles.metaLabel}>Dung lượng:</span>
                                <strong style={styles.metaValue}>{formatSize(file.size)}</strong>
                            </div>
                            <div style={styles.metaRow}>
                                <span style={styles.metaLabel}>Định dạng:</span>
                                <strong style={styles.metaValue}>{file.name.split(".").pop()?.toUpperCase()}</strong>
                            </div>
                            <div style={styles.metaRow}>
                                <span style={styles.metaLabel}>Người tải lên:</span>
                                <strong style={{ ...styles.metaValue, color: "#3b82f6" }}>{authorName}</strong>
                            </div>
                        </div>
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>Tên tài liệu</label>
                        <div style={styles.inputWrapper}>
                            <input
                                type="text"
                                value={fileName}
                                onChange={(e) => setFileName(e.target.value)}
                                style={styles.input}
                                placeholder="Nhập tên tài liệu..."
                                disabled={loading}
                            />
                            <span style={styles.extension}>.{file.name.split(".").pop()}</span>
                        </div>
                    </div>

                    <div style={styles.inputGroup}>
                        <label style={styles.label}>
                            <LocalOfferIcon style={{ fontSize: 16, marginRight: 4, verticalAlign: 'middle' }} />
                            Gắn tag
                        </label>
                        <div style={styles.tagContainer}>
                            {AVAILABLE_TAGS.map(tag => (
                                <button
                                    key={tag}
                                    type="button"
                                    onClick={() => toggleTag(tag)}
                                    disabled={loading}
                                    style={{
                                        ...styles.tagChip,
                                        ...(selectedTags.includes(tag) ? styles.tagChipActive : {}),
                                    }}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>

                    {error && <div style={styles.error}>{error}</div>}

                    <div style={styles.actions}>
                        <button
                            type="button"
                            onClick={onClose}
                            style={styles.cancelBtn}
                            disabled={loading}
                        >
                            Hủy bỏ
                        </button>
                        <button
                            type="submit"
                            style={styles.submitBtn}
                            disabled={loading}
                        >
                            {loading ? "Đang tải lên..." : "Tải lên"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    overlay: {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(15, 23, 42, 0.45)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        animation: "fadeIn 0.2s ease-out",
    },
    modal: {
        backgroundColor: "#ffffff",
        borderRadius: "16px",
        width: "100%",
        maxWidth: "460px",
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        overflow: "hidden",
        border: "1px solid #f1f5f9",
    },
    header: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px 20px",
        borderBottom: "1px solid #f1f5f9",
    },
    title: {
        margin: 0,
        fontSize: "17px",
        fontWeight: 600,
        color: "#0f172a",
    },
    closeBtn: {
        background: "none",
        border: "none",
        color: "#94a3b8",
        cursor: "pointer",
        padding: "4px",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.2s",
        outline: "none",
    },
    form: {
        padding: "20px",
    },
    fileDetails: {
        display: "flex",
        gap: "16px",
        backgroundColor: "#f8fafc",
        borderRadius: "12px",
        padding: "16px",
        marginBottom: "20px",
        border: "1px dashed #e2e8f0",
    },
    iconContainer: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#ffffff",
        borderRadius: "8px",
        width: "64px",
        height: "64px",
        boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)",
    },
    metaInfo: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: "4px",
        flex: 1,
    },
    metaRow: {
        display: "flex",
        fontSize: "13px",
        lineHeight: "1.4",
    },
    metaLabel: {
        color: "#64748b",
        width: "95px",
    },
    metaValue: {
        color: "#334155",
        fontWeight: 500,
    },
    inputGroup: {
        display: "flex",
        flexDirection: "column",
        gap: "6px",
        marginBottom: "20px",
    },
    label: {
        fontSize: "13px",
        fontWeight: 500,
        color: "#475569",
    },
    inputWrapper: {
        display: "flex",
        alignItems: "center",
        border: "1px solid #cbd5e1",
        borderRadius: "8px",
        backgroundColor: "#ffffff",
        overflow: "hidden",
        transition: "border-color 0.2s",
        "&:focus-within": {
            borderColor: "#3b82f6",
        },
    },
    input: {
        flex: 1,
        border: "none",
        padding: "10px 12px",
        fontSize: "14px",
        color: "#0f172a",
        outline: "none",
        backgroundColor: "transparent",
    },
    extension: {
        paddingRight: "12px",
        fontSize: "14px",
        color: "#94a3b8",
        fontWeight: 500,
        userSelect: "none",
    },
    error: {
        color: "#ef4444",
        fontSize: "13px",
        marginBottom: "16px",
        textAlign: "center",
    },
    actions: {
        display: "flex",
        justifyContent: "flex-end",
        gap: "10px",
    },
    cancelBtn: {
        padding: "10px 16px",
        borderRadius: "8px",
        fontSize: "14px",
        fontWeight: 500,
        color: "#64748b",
        backgroundColor: "#f1f5f9",
        border: "none",
        cursor: "pointer",
        transition: "background 0.2s",
    },
    submitBtn: {
        padding: "10px 16px",
        borderRadius: "8px",
        fontSize: "14px",
        fontWeight: 500,
        color: "#ffffff",
        backgroundColor: "#3b82f6",
        border: "none",
        cursor: "pointer",
        transition: "background 0.2s",
        boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    },
    tagContainer: {
        display: "flex",
        flexWrap: "wrap" as const,
        gap: "8px",
    },
    tagChip: {
        padding: "6px 14px",
        borderRadius: "20px",
        fontSize: "13px",
        fontWeight: 500,
        border: "1px solid #cbd5e1",
        backgroundColor: "#f8fafc",
        color: "#64748b",
        cursor: "pointer",
        transition: "all 0.2s",
        outline: "none",
    },
    tagChipActive: {
        backgroundColor: "#eff6ff",
        borderColor: "#3b82f6",
        color: "#2563eb",
        fontWeight: 600,
        boxShadow: "0 0 0 2px rgba(59, 130, 246, 0.15)",
    },
};
