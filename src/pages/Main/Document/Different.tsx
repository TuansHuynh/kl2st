import { useTitle } from "../../../hooks/useTitle";
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { UploadModal, PreviewModal } from '../../../components';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SlideshowIcon from '@mui/icons-material/Slideshow';
import CodeIcon from '@mui/icons-material/Code';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import StorageIcon from '@mui/icons-material/Storage';
import { documentService } from '../../../service/documentService';
import type { Document } from '../../../types';

interface DifferentItem {
    id: string;
    name: string;
    fileType: string;
    category: 'presentation' | 'code' | 'text' | 'other';
    uploadedDate: string;
    size: string;
    author: string;
}

const formatSize = (bytes: number): string => {
    if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / 1024).toFixed(0) + ' KB';
};

const mapDocumentToDifferent = (d: Document): DifferentItem => ({
    id: d.id,
    name: d.name,
    fileType: d.fileType || '.' + (d.name.split('.').pop() || ''),
    category: (d.category || 'other') as DifferentItem['category'],
    uploadedDate: d.uploadedDate,
    size: formatSize(d.sizeBytes),
    author: d.authorName || 'Unknown',
});

export default function Different() {
    
    const currentUserId = useMemo(() => {
        const stored = localStorage.getItem('currentUser');
        if (stored) {
            try {
                return JSON.parse(stored)?.id || '';
            } catch { return ''; }
        }
        return '';
    }, []);
useTitle("Other Files");

    const [documents, setDocuments] = useState<DifferentItem[]>([]);
    const [loading, setLoading] = useState(true);

    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Upload Modal state
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    // Preview Modal state
    const [previewDoc, setPreviewDoc] = useState<{ url: string, type: string, name: string, blobType: string } | null>(null);

    // Fetch other documents from backend
    useEffect(() => {
        const fetchOthers = async () => {
            try {
                setLoading(true);
                const data = await documentService.getAllDocuments('other', currentUserId);
                setDocuments(data.map(mapDocumentToDifferent));
            } catch (err) {
                console.error('Failed to fetch other documents:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchOthers();
    }, []);

    const totalFiles = documents.length;
    const totalPresentation = useMemo(() => documents.filter(d => d.category === 'presentation').length, [documents]);
    const totalCode = useMemo(() => documents.filter(d => d.category === 'code').length, [documents]);

    const getMBSize = (sizeStr: string) => {
        const val = parseFloat(sizeStr);
        if (sizeStr.toLowerCase().includes('kb')) return val / 1024;
        return val;
    };

    const totalSize = useMemo(() => documents.reduce((sum, d) => sum + getMBSize(d.size), 0), [documents]);

    const filteredDocs = useMemo(() => {
        return documents.filter(d => {
            const matchesSearch = d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                d.author.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = filterCategory === 'all' || d.category === filterCategory;
            return matchesSearch && matchesCategory;
        });
    }, [documents, searchQuery, filterCategory, currentUserId]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            setIsUploadModalOpen(true);
            e.target.value = '';
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa file này?')) {
            try {
                await documentService.deleteDocument(id);
                setDocuments(prev => prev.filter(d => d.id !== id));
            } catch (err) {
                console.error('Delete failed:', err);
                alert('Xóa thất bại!');
            }
        }
    };

    const handleDownload = async (doc: DifferentItem) => {
        try {
            const blob = await documentService.downloadDocument(doc.id);
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = doc.name;
            a.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Download failed:', err);
            alert('Tải xuống thất bại!');
        }
    };

    const handlePreview = async (doc: DifferentItem) => {
        try {
            const blob = await documentService.downloadDocument(doc.id);
            const url = URL.createObjectURL(blob);
            setPreviewDoc({ url, type: doc.category, name: doc.name, blobType: blob.type });
        } catch (err) {
            console.error('Open failed:', err);
            alert('Mở tài liệu thất bại!');
        }
    };

    const getCategoryIcon = (category: DifferentItem['category']) => {
        switch (category) {
            case 'presentation': return <SlideshowIcon style={{ color: '#f97316' }} />;
            case 'code': return <CodeIcon style={{ color: '#06b6d4' }} />;
            case 'text': return <TextSnippetIcon style={{ color: 'var(--text-muted)' }} />;
            default: return <InsertDriveFileIcon style={{ color: '#9ca3af' }} />;
        }
    };

    const getCategoryBadge = (category: DifferentItem['category']) => {
        const labels: Record<string, { label: string; bg: string; color: string }> = {
            presentation: { label: 'Thuyết trình', bg: '#fff7ed', color: '#9a3412' },
            code: { label: 'Code / Config', bg: '#ecfeff', color: '#155e75' },
            text: { label: 'Văn bản', bg: 'var(--bg-primary)', color: 'var(--text-secondary)' },
            other: { label: 'Khác', bg: 'var(--bg-hover)', color: 'var(--text-muted)' },
        };
        const c = labels[category];
        return <span style={{ background: c.bg, color: c.color, padding: '2px 10px', borderRadius: 12, fontSize: 12, fontWeight: 500 }}>{c.label}</span>;
    };

    return (
        <div className="diff-container">
            

            <div className="diff-header">
                <div className="diff-title-wrap">
                    <h1><InsertDriveFileIcon /> Các loại file khác</h1>
                    <p>Quản lý file thuyết trình, code, config và các định dạng khác</p>
                </div>
                <button className="diff-btn-upload" onClick={() => fileInputRef.current?.click()}>
                    <AddIcon fontSize="small" />
                    Tải lên file
                </button>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} style={{ display: 'none' }} />
            </div>

            <div className="diff-grid">
                <div className="diff-stat-card s1">
                    <div className="diff-card-data"><span className="diff-card-title">Tổng file khác</span><span className="diff-card-value">{totalFiles}</span></div>
                    <div className="diff-card-icon"><InsertDriveFileIcon /></div>
                </div>
                <div className="diff-stat-card s2">
                    <div className="diff-card-data"><span className="diff-card-title">Thuyết trình</span><span className="diff-card-value">{totalPresentation}</span></div>
                    <div className="diff-card-icon"><SlideshowIcon /></div>
                </div>
                <div className="diff-stat-card s3">
                    <div className="diff-card-data"><span className="diff-card-title">Code / Config</span><span className="diff-card-value">{totalCode}</span></div>
                    <div className="diff-card-icon"><CodeIcon /></div>
                </div>
                <div className="diff-stat-card s4">
                    <div className="diff-card-data"><span className="diff-card-title">Dung lượng</span><span className="diff-card-value">{totalSize.toFixed(1)} MB</span></div>
                    <div className="diff-card-icon"><StorageIcon /></div>
                </div>
            </div>

            <div className="diff-section">
                <div className="diff-section-header">
                    <span className="diff-section-title">Danh sách file</span>
                    <div className="diff-controls">
                        <div className="diff-search-wrap">
                            <span className="diff-search-icon"><SearchIcon fontSize="small" /></span>
                            <input type="text" className="diff-search-input" placeholder="Tìm kiếm tên, tác giả..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                        </div>
                        <select className="diff-filter-select" value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
                            <option value="all">Tất cả danh mục</option>
                            <option value="presentation">Thuyết trình</option>
                            <option value="code">Code / Config</option>
                            <option value="text">Văn bản</option>
                            <option value="other">Khác</option>
                        </select>
                    </div>
                </div>

                <div className="diff-table-wrap">
                    {filteredDocs.length > 0 ? (
                        <table className="diff-table">
                            <thead>
                                <tr>
                                    <th>Tên file</th>
                                    <th>Định dạng</th>
                                    <th>Danh mục</th>
                                    <th>Ngày tải lên</th>
                                    <th>Dung lượng</th>
                                    <th>Tác giả</th>
                                    <th style={{ width: '100px', textAlign: 'center' }}>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredDocs.map(doc => (
                                    <tr key={doc.id}>
                                        <td><div className="diff-name-cell" onClick={() => handlePreview(doc)} title="Mở tài liệu">{getCategoryIcon(doc.category)}<span>{doc.name}</span></div></td>
                                        <td><span className="diff-type-badge">{doc.fileType}</span></td>
                                        <td>{getCategoryBadge(doc.category)}</td>
                                        <td>{doc.uploadedDate}</td>
                                        <td><span className="diff-size-badge">{doc.size}</span></td>
                                        <td>
                                            <div className="diff-author-cell">
                                                <div className="diff-avatar">{doc.author.split(' ').pop()?.charAt(0) || 'U'}</div>
                                                <span>{doc.author}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="diff-actions">
                                                <button className="diff-btn-action" title="Tải xuống" onClick={() => handleDownload(doc)}><CloudDownloadIcon fontSize="small" /></button>
                                                <button className="diff-btn-action btn-del" title="Xóa" onClick={() => handleDelete(doc.id)}><DeleteIcon fontSize="small" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="diff-empty">Không tìm thấy file phù hợp</div>
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
                    setDocuments((prev) => [mapDocumentToDifferent(doc), ...prev]);
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