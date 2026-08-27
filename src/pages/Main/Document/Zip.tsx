import { useTitle } from "../../../hooks/useTitle";
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { UploadModal, PreviewModal } from '../../../components';
import FolderZipIcon from '@mui/icons-material/FolderZip';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ArchiveIcon from '@mui/icons-material/Archive';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import StorageIcon from '@mui/icons-material/Storage';
import { documentService } from '../../../service/documentService';
import type { Document } from '../../../types';

interface ZipItem {
    id: string;
    name: string;
    archiveType: 'zip' | 'rar' | '7z' | 'tar.gz';
    uploadedDate: string;
    size: string;
    author: string;
    fileCount: number;
}

const formatSize = (bytes: number): string => {
    if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / 1024).toFixed(0) + ' KB';
};

const mapDocumentToZip = (d: Document): ZipItem => ({
    id: d.id,
    name: d.name,
    archiveType: (d.archiveType || 'zip') as ZipItem['archiveType'],
    uploadedDate: d.uploadedDate,
    size: formatSize(d.sizeBytes),
    author: d.authorName || 'Unknown',
    fileCount: d.fileCount || 0,
});

export default function Zip() {
    
    const currentUserId = useMemo(() => {
        const stored = localStorage.getItem('currentUser');
        if (stored) {
            try {
                return JSON.parse(stored)?.id || '';
            } catch { return ''; }
        }
        return '';
    }, []);
useTitle("ZIP/RAR Archives");

    const [documents, setDocuments] = useState<ZipItem[]>([]);
    const [loading, setLoading] = useState(true);

    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('all');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Upload Modal state
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    // Preview Modal state
    const [previewDoc, setPreviewDoc] = useState<{ url: string, type: string, name: string, blobType: string } | null>(null);

    // Fetch Zip documents from backend
    useEffect(() => {
        const fetchZips = async () => {
            try {
                setLoading(true);
                const data = await documentService.getAllDocuments('zip', currentUserId);
                setDocuments(data.map(mapDocumentToZip));
            } catch (err) {
                console.error('Failed to fetch ZIP documents:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchZips();
    }, [currentUserId]);

    const totalFiles = documents.length;
    const totalContainedFiles = useMemo(() => documents.reduce((sum, d) => sum + d.fileCount, 0), [documents]);

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
            const matchesType = filterType === 'all' || d.archiveType === filterType;
            return matchesSearch && matchesType;
        });
    }, [documents, searchQuery, filterType, currentUserId]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            setIsUploadModalOpen(true);
            e.target.value = '';
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa file nén này?')) {
            try {
                await documentService.deleteDocument(id);
                setDocuments(prev => prev.filter(d => d.id !== id));
            } catch (err) {
                console.error('Delete failed:', err);
                alert('Xóa thất bại!');
            }
        }
    };

    const handleDownload = async (doc: ZipItem) => {
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

    const handlePreview = async (doc: ZipItem) => {
        try {
            const blob = await documentService.downloadDocument(doc.id);
            const url = URL.createObjectURL(blob);
            setPreviewDoc({ url, type: 'zip', name: doc.name, blobType: blob.type });
        } catch (err) {
            console.error('Open failed:', err);
            alert('Mở tài liệu thất bại!');
        }
    };

    const getArchiveTypeBadge = (type: ZipItem['archiveType']) => {
        const colors: Record<string, { bg: string; color: string }> = {
            'zip': { bg: '#fffbeb', color: '#92400e' },
            'rar': { bg: '#fef2f2', color: '#991b1b' },
            '7z': { bg: '#eff6ff', color: '#1e40af' },
            'tar.gz': { bg: '#ecfdf5', color: '#065f46' },
        };
        const c = colors[type];
        return <span style={{ background: c.bg, color: c.color, padding: '2px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600, textTransform: 'uppercase' }}>{type}</span>;
    };

    return (
        <div className="zip-container">
            

            <div className="zip-header">
                <div className="zip-title-wrap">
                    <h1><FolderZipIcon /> Quản lý file nén</h1>
                    <p>Xem, tải lên và quản lý các file ZIP, RAR, 7z trong hệ thống</p>
                </div>
                <button className="zip-btn-upload" onClick={() => fileInputRef.current?.click()}>
                    <AddIcon fontSize="small" />
                    Tải lên file nén
                </button>
                <input type="file" ref={fileInputRef} accept=".zip,.rar,.7z,.tar,.gz" onChange={handleFileChange} style={{ display: 'none' }} />
            </div>

            <div className="zip-grid">
                <div className="zip-stat-card s1">
                    <div className="zip-card-data"><span className="zip-card-title">Tổng file nén</span><span className="zip-card-value">{totalFiles}</span></div>
                    <div className="zip-card-icon"><FolderZipIcon /></div>
                </div>
                <div className="zip-stat-card s2">
                    <div className="zip-card-data"><span className="zip-card-title">File chứa bên trong</span><span className="zip-card-value">{totalContainedFiles.toLocaleString()}</span></div>
                    <div className="zip-card-icon"><ArchiveIcon /></div>
                </div>
                <div className="zip-stat-card s3">
                    <div className="zip-card-data"><span className="zip-card-title">Dung lượng</span><span className="zip-card-value">{totalSize.toFixed(1)} MB</span></div>
                    <div className="zip-card-icon"><StorageIcon /></div>
                </div>
                <div className="zip-stat-card s4">
                    <div className="zip-card-data"><span className="zip-card-title">Tải lên hôm nay</span><span className="zip-card-value">{documents.filter(d => d.uploadedDate === '2026-07-08').length}</span></div>
                    <div className="zip-card-icon"><CalendarTodayIcon /></div>
                </div>
            </div>

            <div className="zip-section">
                <div className="zip-section-header">
                    <span className="zip-section-title">Danh sách file nén</span>
                    <div className="zip-controls">
                        <div className="zip-search-wrap">
                            <span className="zip-search-icon"><SearchIcon fontSize="small" /></span>
                            <input type="text" className="zip-search-input" placeholder="Tìm kiếm tên, tác giả..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                        </div>
                        <select className="zip-filter-select" value={filterType} onChange={e => setFilterType(e.target.value)}>
                            <option value="all">Tất cả định dạng</option>
                            <option value="zip">ZIP</option>
                            <option value="rar">RAR</option>
                            <option value="7z">7z</option>
                            <option value="tar.gz">TAR.GZ</option>
                        </select>
                    </div>
                </div>

                <div className="zip-table-wrap">
                    {filteredDocs.length > 0 ? (
                        <table className="zip-table">
                            <thead>
                                <tr>
                                    <th>Tên file</th>
                                    <th>Định dạng</th>
                                    <th>Ngày tải lên</th>
                                    <th>Dung lượng</th>
                                    <th>Số file bên trong</th>
                                    <th>Tác giả</th>
                                    <th style={{ width: '100px', textAlign: 'center' }}>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredDocs.map(doc => (
                                    <tr key={doc.id}>
                                        <td><div className="zip-name-cell" onClick={() => handlePreview(doc)} title="Mở tài liệu"><FolderZipIcon /><span>{doc.name}</span></div></td>
                                        <td>{getArchiveTypeBadge(doc.archiveType)}</td>
                                        <td>{doc.uploadedDate}</td>
                                        <td><span className="zip-size-badge">{doc.size}</span></td>
                                        <td><span className="zip-count-badge">{doc.fileCount.toLocaleString()} file</span></td>
                                        <td>
                                            <div className="zip-author-cell">
                                                <div className="zip-avatar">{doc.author.split(' ').pop()?.charAt(0) || 'U'}</div>
                                                <span>{doc.author}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="zip-actions">
                                                <button className="zip-btn-action" title="Tải xuống" onClick={() => handleDownload(doc)}><CloudDownloadIcon fontSize="small" /></button>
                                                <button className="zip-btn-action btn-del" title="Xóa" onClick={() => handleDelete(doc.id)}><DeleteIcon fontSize="small" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="zip-empty">Không tìm thấy file nén phù hợp</div>
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
                    setDocuments((prev) => [mapDocumentToZip(doc), ...prev]);
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