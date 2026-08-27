import { useTitle } from "../../../hooks/useTitle";
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { UploadModal, PreviewModal } from '../../../components';
import ImageIcon from '@mui/icons-material/Image';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import PhotoSizeSelectActualIcon from '@mui/icons-material/PhotoSizeSelectActual';
import VideocamIcon from '@mui/icons-material/Videocam';
import StorageIcon from '@mui/icons-material/Storage';
import ViewModuleIcon from '@mui/icons-material/ViewModule';
import ViewListIcon from '@mui/icons-material/ViewList';
import { documentService } from '../../../service/documentService';
import type { Document } from '../../../types';

interface MediaItem {
    id: string;
    name: string;
    mediaType: 'image' | 'video' | 'audio';
    uploadedDate: string;
    size: string;
    author: string;
    resolution: string;
}

const formatSize = (bytes: number): string => {
    if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / 1024).toFixed(0) + ' KB';
};

const mapDocumentToMedia = (d: Document): MediaItem => ({
    id: d.id,
    name: d.name,
    mediaType: (d.mediaType || 'image') as MediaItem['mediaType'],
    uploadedDate: d.uploadedDate,
    size: formatSize(d.sizeBytes),
    author: d.authorName || 'Unknown',
    resolution: d.resolution || '—',
});

export default function Media() {
    
    const currentUserId = useMemo(() => {
        const stored = localStorage.getItem('currentUser');
        if (stored) {
            try {
                return JSON.parse(stored)?.id || '';
            } catch { return ''; }
        }
        return '';
    }, []);
useTitle("Media Files");

    const [documents, setDocuments] = useState<MediaItem[]>([]);
    const [loading, setLoading] = useState(true);

    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Upload Modal state
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    // Preview Modal state
    const [previewDoc, setPreviewDoc] = useState<{ url: string, type: string, name: string, blobType: string } | null>(null);

    // Fetch media documents from backend
    useEffect(() => {
        const fetchMedia = async () => {
            try {
                setLoading(true);
                const data = await documentService.getAllDocuments('image', currentUserId);
                setDocuments(data.map(mapDocumentToMedia));
            } catch (err) {
                console.error('Failed to fetch media documents:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchMedia();
    }, []);

    const totalFiles = documents.length;
    const totalImages = useMemo(() => documents.filter(d => d.mediaType === 'image').length, [documents]);
    const totalVideos = useMemo(() => documents.filter(d => d.mediaType === 'video').length, [documents]);

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
            const matchesType = filterType === 'all' || d.mediaType === filterType;
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
        if (window.confirm('Bạn có chắc chắn muốn xóa file media này?')) {
            try {
                await documentService.deleteDocument(id);
                setDocuments(prev => prev.filter(d => d.id !== id));
            } catch (err) {
                console.error('Delete failed:', err);
                alert('Xóa thất bại!');
            }
        }
    };

    const handleDownload = async (doc: MediaItem) => {
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

    const handlePreview = async (doc: MediaItem) => {
        try {
            const blob = await documentService.downloadDocument(doc.id);
            const url = URL.createObjectURL(blob);
            setPreviewDoc({ url, type: doc.mediaType, name: doc.name, blobType: blob.type });
        } catch (err) {
            console.error('Open failed:', err);
            alert('Mở tài liệu thất bại!');
        }
    };

    const getMediaIcon = (type: MediaItem['mediaType']) => {
        switch (type) {
            case 'image': return <PhotoSizeSelectActualIcon style={{ color: '#8b5cf6' }} />;
            case 'video': return <VideocamIcon style={{ color: '#ef4444' }} />;
            case 'audio': return <StorageIcon style={{ color: '#f59e0b' }} />;
        }
    };

    const getMediaTypeBadge = (type: MediaItem['mediaType']) => {
        const colors: Record<string, { bg: string; color: string }> = {
            image: { bg: '#f5f3ff', color: '#6d28d9' },
            video: { bg: '#fef2f2', color: '#991b1b' },
            audio: { bg: '#fffbeb', color: '#92400e' },
        };
        const c = colors[type];
        return <span style={{ background: c.bg, color: c.color, padding: '2px 10px', borderRadius: 12, fontSize: 12, fontWeight: 500, textTransform: 'capitalize' }}>{type === 'image' ? 'Ảnh' : type === 'video' ? 'Video' : 'Âm thanh'}</span>;
    };

    return (
        <div className="media-container">
            

            <div className="media-header">
                <div className="media-title-wrap">
                    <h1><ImageIcon /> Quản lý Media</h1>
                    <p>Xem, tải lên và quản lý các file ảnh, video, âm thanh</p>
                </div>
                <button className="media-btn-upload" onClick={() => fileInputRef.current?.click()}>
                    <AddIcon fontSize="small" />
                    Tải lên Media
                </button>
                <input type="file" ref={fileInputRef} accept="image/*,video/*,audio/*" onChange={handleFileChange} style={{ display: 'none' }} />
            </div>

            <div className="media-grid">
                <div className="media-stat-card s1">
                    <div className="media-card-data"><span className="media-card-title">Tổng file Media</span><span className="media-card-value">{totalFiles}</span></div>
                    <div className="media-card-icon"><ImageIcon /></div>
                </div>
                <div className="media-stat-card s2">
                    <div className="media-card-data"><span className="media-card-title">Tổng ảnh</span><span className="media-card-value">{totalImages}</span></div>
                    <div className="media-card-icon"><PhotoSizeSelectActualIcon /></div>
                </div>
                <div className="media-stat-card s3">
                    <div className="media-card-data"><span className="media-card-title">Tổng video</span><span className="media-card-value">{totalVideos}</span></div>
                    <div className="media-card-icon"><VideocamIcon /></div>
                </div>
                <div className="media-stat-card s4">
                    <div className="media-card-data"><span className="media-card-title">Dung lượng</span><span className="media-card-value">{totalSize.toFixed(1)} MB</span></div>
                    <div className="media-card-icon"><StorageIcon /></div>
                </div>
            </div>

            <div className="media-section">
                <div className="media-section-header">
                    <span className="media-section-title">Danh sách Media</span>
                    <div className="media-controls">
                        <div className="media-search-wrap">
                            <span className="media-search-icon"><SearchIcon fontSize="small" /></span>
                            <input type="text" className="media-search-input" placeholder="Tìm kiếm tên, tác giả..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                        </div>
                        <select className="media-filter-select" value={filterType} onChange={e => setFilterType(e.target.value)}>
                            <option value="all">Tất cả loại</option>
                            <option value="image">Ảnh</option>
                            <option value="video">Video</option>
                            <option value="audio">Âm thanh</option>
                        </select>
                        <div className="media-view-toggle">
                            <button className={`media-view-btn ${viewMode === 'table' ? 'active' : ''}`} onClick={() => setViewMode('table')} title="Dạng bảng"><ViewListIcon fontSize="small" /></button>
                            <button className={`media-view-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')} title="Dạng lưới"><ViewModuleIcon fontSize="small" /></button>
                        </div>
                    </div>
                </div>

                {viewMode === 'table' ? (
                    <div className="media-table-wrap">
                        {filteredDocs.length > 0 ? (
                            <table className="media-table">
                                <thead>
                                    <tr>
                                        <th>Tên file</th>
                                        <th>Loại</th>
                                        <th>Ngày tải lên</th>
                                        <th>Dung lượng</th>
                                        <th>Độ phân giải</th>
                                        <th>Tác giả</th>
                                        <th style={{ width: '100px', textAlign: 'center' }}>Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredDocs.map(doc => (
                                        <tr key={doc.id}>
                                            <td><div className="media-name-cell" onClick={() => handlePreview(doc)} title="Xem trước tài liệu">{getMediaIcon(doc.mediaType)}<span>{doc.name}</span></div></td>
                                            <td>{getMediaTypeBadge(doc.mediaType)}</td>
                                            <td>{doc.uploadedDate}</td>
                                            <td><span className="media-size-badge">{doc.size}</span></td>
                                            <td><span className="media-res-badge">{doc.resolution}</span></td>
                                            <td>
                                                <div className="media-author-cell">
                                                    <div className="media-avatar">{doc.author.split(' ').pop()?.charAt(0) || 'U'}</div>
                                                    <span>{doc.author}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="media-actions">
                                                    <button className="media-btn-action" title="Tải xuống" onClick={() => handleDownload(doc)}><CloudDownloadIcon fontSize="small" /></button>
                                                    <button className="media-btn-action btn-del" title="Xóa" onClick={() => handleDelete(doc.id)}><DeleteIcon fontSize="small" /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="media-empty">Không tìm thấy file media phù hợp</div>
                        )}
                    </div>
                ) : (
                    filteredDocs.length > 0 ? (
                        <div className="media-grid-view">
                            {filteredDocs.map(doc => (
                                <div key={doc.id} className="media-grid-card" onClick={() => handlePreview(doc)} title="Xem trước tài liệu">
                                    <div className="media-grid-card-icon">{getMediaIcon(doc.mediaType)}</div>
                                    <div className="media-grid-card-name">{doc.name}</div>
                                    <div className="media-grid-card-meta">{doc.size} · {doc.resolution}</div>
                                    <div className="media-grid-card-meta">{doc.author} · {doc.uploadedDate}</div>
                                    <div className="media-grid-card-actions" onClick={(e) => e.stopPropagation()}>
                                        <button className="media-btn-action" title="Tải xuống" onClick={() => handleDownload(doc)}><CloudDownloadIcon fontSize="small" /></button>
                                        <button className="media-btn-action btn-del" title="Xóa" onClick={() => handleDelete(doc.id)}><DeleteIcon fontSize="small" /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="media-empty">Không tìm thấy file media phù hợp</div>
                    )
                )}
            </div>

            <UploadModal
                isOpen={isUploadModalOpen}
                onClose={() => {
                    setIsUploadModalOpen(false);
                    setSelectedFile(null);
                }}
                file={selectedFile}
                onUploadSuccess={(doc) => {
                    setDocuments((prev) => [mapDocumentToMedia(doc), ...prev]);
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