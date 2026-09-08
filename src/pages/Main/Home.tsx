import { useTitle } from "../../hooks/useTitle";
import React, { useState, useMemo, useRef, useEffect } from 'react';
// import { useSearchParams } from 'react-router-dom';
import { UploadModal, PreviewModal } from '../../components';
import FolderIcon from '@mui/icons-material/Folder';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import TodayIcon from '@mui/icons-material/Today';
import SearchIcon from '@mui/icons-material/Search';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DescriptionIcon from '@mui/icons-material/Description';
import TableChartIcon from '@mui/icons-material/TableChart';
import ImageIcon from '@mui/icons-material/Image';
import FolderZipIcon from '@mui/icons-material/FolderZip';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { documentService } from '../../service/documentService';
import type { Document } from '../../types';

interface DocumentItem {
    id: string;
    name: string;
    type: 'pdf' | 'word' | 'excel' | 'image' | 'zip' | 'other';
    uploadedDate: string;
    size: string;
    sizeBytes: number;
    author: string;
    authorId: string;
}


// Helper to format bytes to human-readable size
const formatSize = (bytes: number): string => {
    if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / 1024).toFixed(0) + ' KB';
};

const mapDocToItem = (doc: Document): DocumentItem => ({
    id: doc.id,
    name: doc.name,
    type: doc.type === 'note' ? 'other' : doc.type,
    uploadedDate: doc.uploadedDate,
    size: formatSize(doc.sizeBytes),
    sizeBytes: doc.sizeBytes,
    author: doc.authorName || 'Unknown',
    authorId: doc.authorId || '',
});

export default function Home() {
    useTitle("Home");

    const [documents, setDocuments] = useState<DocumentItem[]>([]);
    const [loading, setLoading] = useState(true);

    const [downloadCount, setDownloadCount] = useState(0);
    const [downloadTodayCount, setDownloadTodayCount] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('all');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Upload Modal states
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [previewDoc, setPreviewDoc] = useState<{ url: string; type: string; name: string; blobType: string } | null>(null);

    // Get current user info
    const currentUserId = useMemo(() => {
        const stored = localStorage.getItem('currentUser');
        if (stored) {
            try {
                return JSON.parse(stored)?.id || '';
            } catch { return ''; }
        }
        return '';
    }, []);

    // Fetch documents from backend on mount
    useEffect(() => {
        const fetchDocuments = async () => {
            try {
                setLoading(true);
                const data = await documentService.getAllDocuments('all', currentUserId);
                setDocuments(data.map(mapDocToItem));
            } catch (err) {
                console.error('Failed to fetch documents:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchDocuments();
    }, [currentUserId]);

    // Calculate document file types
    const totalFile = documents.length;
    const totalFileUpload = documents.length;
    const totalFileDownload = downloadCount;

    // Filter file uploads today
    const todayStr = new Date().toISOString().split('T')[0];
    const totalFileUploadToday = useMemo(() => {
        return documents.filter(doc => doc.uploadedDate === todayStr).length;
    }, [documents]);

    const totalFileDownloadtoday = downloadTodayCount;

    // Calculate storage used by current user only
    const totalStorageUsed = useMemo(() => {
        return documents.reduce((sum, doc) => sum + doc.sizeBytes, 0) / (1024 * 1024);
    }, [documents]);
    const maxStorageCapacity = 250; // MB
    const storagePercent = Math.min(100, (totalStorageUsed / maxStorageCapacity) * 100);

    // Search and filter logic
    const filteredDocs = useMemo(() => {
        return documents.filter(doc => {
            const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                doc.author.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesType = filterType === 'all' || doc.type === filterType;
            return matchesSearch && matchesType;
        });
    }, [documents, searchQuery, filterType]);

    // Handle file upload via backend API
    // Handle file selection
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
            setIsUploadModalOpen(true);
            e.target.value = '';
        }
    };

    // Trigger local file selector
    const triggerUpload = () => {
        fileInputRef.current?.click();
    };

    // Actions
    const handleDelete = async (id: string) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa tài liệu này?')) {
            try {
                await documentService.deleteDocument(id);
                setDocuments(prev => prev.filter(doc => doc.id !== id));
            } catch (err) {
                console.error('Delete failed:', err);
                alert('Xóa thất bại!');
            }
        }
    };

    const handleDownload = async (doc: DocumentItem) => {
        try {
            const blob = await documentService.downloadDocument(doc.id);
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = doc.name;
            a.click();
            URL.revokeObjectURL(url);
            setDownloadCount(prev => prev + 1);
            setDownloadTodayCount(prev => prev + 1);
        } catch (err) {
            console.error('Download failed:', err);
            alert('Tải xuống thất bại!');
        }
    };

    const handlePreview = async (doc: DocumentItem) => {
        try {
            const blob = await documentService.downloadDocument(doc.id);
            const url = URL.createObjectURL(blob);
            setPreviewDoc({ url, type: doc.type, name: doc.name, blobType: blob.type });
        } catch (err) {
            console.error('Open failed:', err);
            alert('Mở tài liệu thất bại!');
        }
    };

    const getFileIcon = (type: DocumentItem['type']) => {
        switch (type) {
            case 'pdf':
                return <PictureAsPdfIcon className="icon-pdf" />;
            case 'word':
                return <DescriptionIcon className="icon-word" />;
            case 'excel':
                return <TableChartIcon className="icon-excel" />;
            case 'image':
                return <ImageIcon className="icon-image" />;
            case 'zip':
                return <FolderZipIcon className="icon-zip" />;
            default:
                return <InsertDriveFileIcon className="icon-other" />;
        }
    };

    return (
        <div className="document-storage-container">


            <div className="doc-header-section">
                <div className="doc-title-wrapper">
                    <h1>Hệ thống Lưu trữ Tài liệu</h1>
                    <p>Quản lý, theo dõi và lưu trữ tài liệu trong hệ thống của bạn</p>
                </div>
                <button className="btn-upload-primary" onClick={triggerUpload}>
                    <AddIcon fontSize="small" />
                    Tải lên tài liệu
                </button>
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                />
            </div>

            <div className="storage-progress-block">
                <div className="storage-progress-labels">
                    <span>Dung lượng đã dùng</span>
                    <span>{totalStorageUsed.toFixed(1)} MB / {maxStorageCapacity} MB ({storagePercent.toFixed(1)}%)</span>
                </div>
                <div className="storage-bar-outer">
                    <div className="storage-bar-inner" style={{ width: `${storagePercent}%` }}></div>
                </div>
            </div>

            <div className="grid-container">
                <div className="box-card box-1">
                    <div className="card-data">
                        <span className="card-title">Tổng tài liệu</span>
                        <span className="card-value">{totalFile}</span>
                    </div>
                    <div className="card-icon-wrapper">
                        <FolderIcon />
                    </div>
                </div>

                <div className="box-card box-2">
                    <div className="card-data">
                        <span className="card-title">Đã tải lên</span>
                        <span className="card-value">{totalFileUpload}</span>
                    </div>
                    <div className="card-icon-wrapper">
                        <CloudUploadIcon />
                    </div>
                </div>

                <div className="box-card box-3">
                    <div className="card-data">
                        <span className="card-title">Đã tải xuống</span>
                        <span className="card-value">{totalFileDownload}</span>
                    </div>
                    <div className="card-icon-wrapper">
                        <CloudDownloadIcon />
                    </div>
                </div>

                <div className="box-card box-4">
                    <div className="card-data">
                        <span className="card-title">Tải lên hôm nay</span>
                        <span className="card-value">{totalFileUploadToday}</span>
                    </div>
                    <div className="card-icon-wrapper">
                        <TodayIcon />
                    </div>
                </div>

                <div className="box-card box-5">
                    <div className="card-data">
                        <span className="card-title">Tải xuống hôm nay</span>
                        <span className="card-value">{totalFileDownloadtoday}</span>
                    </div>
                    <div className="card-icon-wrapper">
                        <CloudDownloadIcon />
                    </div>
                </div>
            </div>

            <div className="doc-section">
                <div className="doc-section-header">
                    <span className="doc-section-title">Danh sách tài liệu</span>
                    <div className="doc-controls">
                        <div className="search-wrapper">
                            <span className="search-icon-svg">
                                <SearchIcon fontSize="small" />
                            </span>
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Tìm kiếm tên, tác giả..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <select
                            className="filter-select"
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                        >
                            <option value="all">Tất cả định dạng</option>
                            <option value="pdf">PDF Documents</option>
                            <option value="word">Word Files</option>
                            <option value="excel">Excel Sheets</option>
                            <option value="image">Images</option>
                            <option value="zip">ZIP Archives</option>
                            <option value="other">Định dạng khác</option>
                        </select>
                    </div>
                </div>

                <div className="table-responsive">
                    {filteredDocs.length > 0 ? (
                        <table className="doc-table">
                            <thead>
                                <tr>
                                    <th>Tên tài liệu</th>
                                    <th>Ngày tải lên</th>
                                    <th>Dung lượng</th>
                                    <th>Tác giả</th>
                                    <th style={{ width: '100px', textAlign: 'center' }}>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredDocs.map((doc) => (
                                    <tr key={doc.id}>
                                        <td>
                                            <div className="doc-name-cell" onClick={() => handlePreview(doc)} title="Mở / Xem trước tài liệu">
                                                <div className="doc-type-icon">
                                                    {getFileIcon(doc.type)}
                                                </div>
                                                <span>{doc.name}</span>
                                            </div>
                                        </td>
                                        <td>{doc.uploadedDate}</td>
                                        <td>
                                            <span className="size-badge">{doc.size}</span>
                                        </td>
                                        <td>
                                            <div className="author-cell">
                                                <div className="author-avatar">
                                                    {doc.author.split(' ').pop()?.charAt(0) || 'U'}
                                                </div>
                                                <span>{doc.author}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    className="btn-action"
                                                    title="Tải xuống"
                                                    onClick={() => handleDownload(doc)}
                                                >
                                                    <CloudDownloadIcon fontSize="small" />
                                                </button>
                                                <button
                                                    className="btn-action btn-delete"
                                                    title="Xóa"
                                                    onClick={() => handleDelete(doc.id)}
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="empty-state">
                            Không tìm thấy tài liệu phù hợp
                        </div>
                    )}
                </div>
            </div>

            <UploadModal
                isOpen={isUploadModalOpen}
                onClose={() => {
                    setIsUploadModalOpen(false);
                    setSelectedFile(null);
                }}
                file={selectedFile}
                onUploadSuccess={(doc) => {
                    setDocuments((prev) => [mapDocToItem(doc), ...prev]);
                }}
            />

            <PreviewModal
                isOpen={!!previewDoc}
                onClose={() => {
                    if (previewDoc) URL.revokeObjectURL(previewDoc.url);
                    setPreviewDoc(null);
                }}
                previewDoc={previewDoc}
            />
        </div>
    );
}