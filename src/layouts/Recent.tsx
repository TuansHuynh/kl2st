import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    History as HistoryIcon,
    PushPin as PushPinIcon,
    Search as SearchIcon,
    Close as CloseIcon,
    PictureAsPdf as PdfIcon,
    Description as WordIcon,
    TableChart as ExcelIcon,
    Article as NoteIcon,
    PermMedia as MediaIcon,
    FolderZip as ZipIcon,
    Link as LinkIcon,
    InsertDriveFile as FileIcon,
    Delete as ClearIcon
} from "@mui/icons-material";
import PreviewModal from "../components/common/PreviewModal";
import { recentService, type RecentItem } from "../service/recentService";
import { documentService } from "../service/documentService";

export default function Recent() {
    const navigate = useNavigate();
    const location = useLocation();
    const [recentItems, setRecentItems] = useState<RecentItem[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState<'all' | 'doc' | 'link' | 'pinned'>('all');
    const [previewDoc, setPreviewDoc] = useState<{ url: string; type: string; name: string; blobType: string } | null>(null);

    // Fetch items from recentService
    const refreshItems = useCallback(async () => {
        const items = await recentService.getRecentItems();
        setRecentItems(items);
    }, []);

    // Initial load + subscribe to real-time update events
    useEffect(() => {
        refreshItems();

        const handleUpdate = () => {
            refreshItems();
        };

        window.addEventListener(recentService.EVENT_NAME, handleUpdate);
        return () => {
            window.removeEventListener(recentService.EVENT_NAME, handleUpdate);
        };
    }, [refreshItems]);

    // Automatically record page navigation in recent items
    useEffect(() => {
        if (!location.pathname || location.pathname === "/" || location.pathname === "/login") return;

        const pathNameMap: Record<string, string> = {
            "/home": "Trang chủ hệ thống",
            "/account": "Quản lý Tài khoản & Phân quyền",
            "/setting": "Cấu hình & Thiết lập hệ thống",
            "/help": "Trung tâm trợ giúp & Hướng dẫn",
            "/pdf": "Tài liệu PDF",
            "/word": "Văn bản Word",
            "/excel": "Bảng tính Excel",
            "/note": "Ghi chú công việc",
            "/media": "Hình ảnh & Đa phương tiện",
            "/zip": "Tệp nén Archive",
            "/different": "Tài liệu khác"
        };

        const pageTitle = pathNameMap[location.pathname] || `Trang: ${location.pathname}`;
        const docPaths = ["/pdf", "/word", "/excel", "/note", "/media", "/zip", "/different"];
        const isDocPage = docPaths.includes(location.pathname);
        const itemType = isDocPage ? (location.pathname.replace("/", "") as any) : "link";

        recentService.addRecentItem({
            title: pageTitle,
            type: itemType,
            url: location.pathname
        });
    }, [location.pathname]);

    // Pin toggle via recentService
    const togglePin = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        const updated = await recentService.togglePin(id);
        setRecentItems(updated);
    };

    // Clear history via recentService
    const clearHistory = async () => {
        if (window.confirm("Bạn có chắc chắn muốn xóa lịch sử truy cập gần đây không?")) {
            await recentService.clearHistory();
            setRecentItems([]);
        }
    };

    // Filter items based on active tab and search query, pinned items always on top
    const filteredItems = recentItems
        .filter((item) => {
            const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());

            if (!matchesSearch) return false;

            if (activeTab === "pinned") return item.pinned;
            if (activeTab === "link") return item.type === "link";
            if (activeTab === "doc") return item.type !== "link";
            return true;
        })
        .sort((a, b) => {
            // Pinned items always come first
            if (a.pinned && !b.pinned) return -1;
            if (!a.pinned && b.pinned) return 1;
            return 0; // Keep original order within same group
        });

    // Helper to render type icons
    const renderIcon = (type: RecentItem['type']) => {
        switch (type) {
            case 'pdf': return <PdfIcon fontSize="small" />;
            case 'word': return <WordIcon fontSize="small" />;
            case 'excel': return <ExcelIcon fontSize="small" />;
            case 'note': return <NoteIcon fontSize="small" />;
            case 'media': return <MediaIcon fontSize="small" />;
            case 'zip': return <ZipIcon fontSize="small" />;
            case 'link': return <LinkIcon fontSize="small" />;
            default: return <FileIcon fontSize="small" />;
        }
    };

    // Handle item click
    const handleItemClick = async (item: RecentItem) => {
        if (item.type === 'link') {
            if (item.url.startsWith("/")) {
                navigate(item.url);
            } else {
                window.open(item.url, '_blank');
            }
        } else {
            // Document item: open PreviewModal
            try {
                const blob = await documentService.downloadDocument(item.id);
                const url = URL.createObjectURL(blob);
                setPreviewDoc({
                    url,
                    type: item.type === 'media' ? 'image' : 'document',
                    name: item.title,
                    blobType: blob.type || (item.type === 'pdf' ? 'application/pdf' : 'text/plain')
                });
            } catch {
                setPreviewDoc({
                    url: item.url.startsWith('/') ? '#' : item.url,
                    type: item.type === 'media' ? 'image' : 'document',
                    name: item.title,
                    blobType: item.type === 'pdf' ? 'application/pdf' : 'text/plain'
                });
            }
        }
    };

    return (
        <div className="recent-container">
            {/* Header */}
            <div className="recent-header">
                <div className="title-group">
                    <HistoryIcon className="header-icon" />
                    <h3>Truy cập gần đây</h3>
                    <span className="count-badge">{filteredItems.length}</span>
                </div>
                <div className="header-actions">
                    <button className="action-btn" title="Xóa lịch sử" onClick={clearHistory}>
                        <ClearIcon fontSize="small" />
                    </button>
                </div>
            </div>

            {/* Controls (Search & Tab Filters) */}
            <div className="recent-controls">
                <div className="search-box">
                    <SearchIcon className="search-icon" />
                    <input
                        type="text"
                        placeholder="Tìm kiếm gần đây..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                        <button className="clear-search" onClick={() => setSearchQuery("")}>
                            <CloseIcon fontSize="small" />
                        </button>
                    )}
                </div>

                <div className="filter-tabs">
                    <button
                        className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
                        onClick={() => setActiveTab('all')}
                    >
                        Tất cả
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'doc' ? 'active' : ''}`}
                        onClick={() => setActiveTab('doc')}
                    >
                        Tài liệu
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'link' ? 'active' : ''}`}
                        onClick={() => setActiveTab('link')}
                    >
                        Liên kết
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'pinned' ? 'active' : ''}`}
                        onClick={() => setActiveTab('pinned')}
                    >
                        Đã ghim
                    </button>
                </div>
            </div>

            {/* List */}
            <div className="recent-list">
                {filteredItems.length > 0 ? (
                    filteredItems.map((item) => (
                        <div
                            key={item.id}
                            className="recent-item"
                            onClick={() => handleItemClick(item)}
                        >
                            <div className="item-main">
                                <div className={`item-icon-wrapper ${item.type}`}>
                                    {renderIcon(item.type)}
                                </div>
                                <div className="item-info">
                                    <span className="item-title" title={item.title}>
                                        {item.title}
                                    </span>
                                    <div className="item-meta">
                                        <span className="item-time">{item.timestamp}</span>
                                        {item.size && <span className="item-badge">{item.size}</span>}
                                    </div>
                                </div>
                            </div>
                            <div className="item-actions">
                                <button
                                    className={`pin-btn ${item.pinned ? 'pinned' : ''}`}
                                    title={item.pinned ? "Bỏ ghim" : "Ghim mục này"}
                                    onClick={(e) => togglePin(e, item.id)}
                                >
                                    <PushPinIcon fontSize="small" />
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="empty-recent">
                        <HistoryIcon className="empty-icon" />
                        <p>Không có mục truy cập phù hợp</p>
                    </div>
                )}
            </div>

            {/* Preview Modal */}
            <PreviewModal
                isOpen={!!previewDoc}
                onClose={() => setPreviewDoc(null)}
                previewDoc={previewDoc}
            />
        </div>
    );
}