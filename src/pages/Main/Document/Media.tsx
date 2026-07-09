import { useTitle } from "../../../hooks/useTitle";
import React, { useState, useMemo, useRef } from 'react';
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


interface MediaItem {
    id: string;
    name: string;
    mediaType: 'image' | 'video' | 'audio';
    uploadedDate: string;
    size: string;
    author: string;
    resolution: string;
}

export default function Media() {
    useTitle("Media Files");

    const [documents, setDocuments] = useState<MediaItem[]>([
        { id: '1', name: 'Banner_gioi_thieu_du_an_moi.png', mediaType: 'image', uploadedDate: '2026-07-08', size: '5.1 MB', author: 'Phạm Văn D', resolution: '1920x1080' },
        { id: '2', name: 'Logo_cong_ty_chinh_thuc.svg', mediaType: 'image', uploadedDate: '2026-07-07', size: '120 KB', author: 'Nguyễn Văn A', resolution: '512x512' },
        { id: '3', name: 'Video_gioi_thieu_san_pham.mp4', mediaType: 'video', uploadedDate: '2026-07-06', size: '48.5 MB', author: 'Trần Thị B', resolution: '1920x1080' },
        { id: '4', name: 'Anh_chup_van_phong_moi.jpg', mediaType: 'image', uploadedDate: '2026-07-05', size: '3.8 MB', author: 'Lê Văn C', resolution: '4032x3024' },
        { id: '5', name: 'Infographic_bao_cao_Q2.png', mediaType: 'image', uploadedDate: '2026-07-04', size: '2.2 MB', author: 'Hoàng Văn E', resolution: '1200x2400' },
        { id: '6', name: 'Podcast_phong_van_CEO.mp3', mediaType: 'audio', uploadedDate: '2026-07-02', size: '15.3 MB', author: 'Phạm Văn D', resolution: '—' },
        { id: '7', name: 'Demo_ung_dung_mobile.mp4', mediaType: 'video', uploadedDate: '2026-06-28', size: '92.0 MB', author: 'Trần Thị B', resolution: '1080x1920' },
        { id: '8', name: 'Icon_set_giao_dien.png', mediaType: 'image', uploadedDate: '2026-06-20', size: '450 KB', author: 'Nguyễn Văn A', resolution: '256x256' },
    ]);

    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
    const fileInputRef = useRef<HTMLInputElement>(null);

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
    }, [documents, searchQuery, filterType]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const ext = file.name.split('.').pop()?.toLowerCase();
            let mediaType: MediaItem['mediaType'] = 'image';
            if (['mp4', 'avi', 'mov', 'mkv', 'webm'].includes(ext || '')) mediaType = 'video';
            else if (['mp3', 'wav', 'ogg', 'flac'].includes(ext || '')) mediaType = 'audio';

            let sizeStr = file.size > 1024 * 1024
                ? (file.size / (1024 * 1024)).toFixed(1) + ' MB'
                : (file.size / 1024).toFixed(0) + ' KB';

            const newDoc: MediaItem = {
                id: Date.now().toString(),
                name: file.name,
                mediaType,
                uploadedDate: '2026-07-08',
                size: sizeStr,
                author: 'Tunas',
                resolution: '—'
            };
            setDocuments(prev => [newDoc, ...prev]);
            e.target.value = '';
        }
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa file media này?')) {
            setDocuments(prev => prev.filter(d => d.id !== id));
        }
    };

    const handleDownload = (doc: MediaItem) => {
        alert(`Bắt đầu tải xuống: ${doc.name}`);
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
            <style>{`
                .media-container {
                    padding: 24px; color: #1f2937; font-family: 'Roboto', 'Inter', sans-serif;
                    box-sizing: border-box; background-color: #f9fafb; min-height: calc(100vh - 10dvh); width: 100%;
                }
                .media-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
                .media-title-wrap h1 { font-size: 24px; font-weight: 700; color: #111827; margin: 0 0 4px 0; display: flex; align-items: center; gap: 10px; }
                .media-title-wrap h1 svg { color: #8b5cf6; font-size: 28px; }
                .media-title-wrap p { font-size: 14px; color: #6b7280; margin: 0; }

                .media-btn-upload {
                    display: flex; align-items: center; gap: 8px;
                    background-color: #8b5cf6; color: white; border: none; border-radius: 8px;
                    padding: 10px 16px; font-size: 14px; font-weight: 600; cursor: pointer;
                    transition: all 0.2s ease;
                    box-shadow: 0 4px 6px -1px rgba(139, 92, 246, 0.2), 0 2px 4px -1px rgba(139, 92, 246, 0.1);
                }
                .media-btn-upload:hover { background-color: #7c3aed; transform: translateY(-1px); box-shadow: 0 10px 15px -3px rgba(139, 92, 246, 0.3); }
                .media-btn-upload:active { transform: translateY(0); }

                .media-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px; }

                .media-stat-card {
                    background: #ffffff; border-radius: 12px; padding: 16px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.05); border: 1px solid #e5e7eb;
                    display: flex; align-items: center; justify-content: space-between;
                    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .media-stat-card:hover { transform: translateY(-4px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); }
                .media-stat-card.s1 { border-left: 4px solid #8b5cf6; }
                .media-stat-card.s2 { border-left: 4px solid #3b82f6; }
                .media-stat-card.s3 { border-left: 4px solid #ef4444; }
                .media-stat-card.s4 { border-left: 4px solid #10b981; }

                .media-card-data { display: flex; flex-direction: column; }
                .media-card-title { font-size: 12px; color: #6b7280; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; }
                .media-card-value { font-size: 24px; font-weight: 700; color: #111827; }
                .media-card-icon { width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
                .s1 .media-card-icon { background: rgba(139, 92, 246, 0.1); color: #8b5cf6; }
                .s2 .media-card-icon { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
                .s3 .media-card-icon { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
                .s4 .media-card-icon { background: rgba(16, 185, 129, 0.1); color: #10b981; }

                .media-section { background: #ffffff; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); border: 1px solid #e5e7eb; overflow: hidden; }
                .media-section-header { padding: 16px 20px; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }
                .media-section-title { font-size: 16px; font-weight: 700; color: #111827; }
                .media-controls { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; }
                .media-search-wrap { position: relative; display: flex; align-items: center; }
                .media-search-input { padding: 8px 12px 8px 36px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; outline: none; transition: all 0.2s; width: 220px; }
                .media-search-input:focus { border-color: #8b5cf6; box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.15); }
                .media-search-icon { position: absolute; left: 10px; color: #9ca3af; font-size: 20px; display: flex; align-items: center; }
                .media-filter-select { padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; background: white; color: #4b5563; outline: none; cursor: pointer; transition: border-color 0.2s; }
                .media-filter-select:focus { border-color: #8b5cf6; }

                .media-view-toggle { display: flex; gap: 4px; }
                .media-view-btn {
                    background: transparent; border: 1px solid #d1d5db; cursor: pointer; padding: 6px 10px;
                    border-radius: 6px; color: #9ca3af; display: flex; align-items: center; justify-content: center; transition: all 0.2s;
                }
                .media-view-btn.active { background-color: #8b5cf6; color: white; border-color: #8b5cf6; }

                .media-table-wrap { width: 100%; overflow-x: auto; }
                .media-table { width: 100%; border-collapse: collapse; text-align: left; font-size: 14px; }
                .media-table th { background: #f9fafb; padding: 12px 20px; font-weight: 600; color: #4b5563; border-bottom: 1px solid #e5e7eb; text-transform: uppercase; font-size: 11px; letter-spacing: 0.05em; }
                .media-table td { padding: 14px 20px; border-bottom: 1px solid #e5e7eb; color: #4b5563; vertical-align: middle; }
                .media-table tr { transition: background 0.15s ease; }
                .media-table tr:hover { background-color: #f5f3ff; }

                .media-name-cell { display: flex; align-items: center; font-weight: 500; color: #111827; }
                .media-name-cell svg { font-size: 22px; margin-right: 12px; }
                .media-author-cell { display: flex; align-items: center; }
                .media-avatar { width: 28px; height: 28px; border-radius: 50%; background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; font-size: 11px; font-weight: 700; display: inline-flex; align-items: center; justify-content: center; margin-right: 8px; }
                .media-size-badge { background-color: #f5f3ff; color: #6d28d9; padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: 500; }
                .media-res-badge { background-color: #f3f4f6; color: #374151; padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: 500; }

                .media-actions { display: flex; gap: 6px; }
                .media-btn-action { background: transparent; border: none; cursor: pointer; padding: 6px; border-radius: 6px; color: #9ca3af; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
                .media-btn-action:hover { background-color: #f3f4f6; color: #111827; }
                .media-btn-action.btn-del:hover { background-color: #fee2e2; color: #ef4444; }

                .media-grid-view { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; padding: 20px; }
                .media-grid-card {
                    background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px;
                    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); cursor: default;
                }
                .media-grid-card:hover { transform: translateY(-4px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.08); }
                .media-grid-card-icon { width: 100%; height: 100px; background: linear-gradient(135deg, #f5f3ff 0%, #ede9fe 100%); border-radius: 8px; display: flex; align-items: center; justify-content: center; margin-bottom: 12px; }
                .media-grid-card-icon svg { font-size: 40px; }
                .media-grid-card-name { font-size: 13px; font-weight: 600; color: #111827; margin-bottom: 6px; word-break: break-all; }
                .media-grid-card-meta { font-size: 12px; color: #6b7280; margin-bottom: 4px; }
                .media-grid-card-actions { display: flex; gap: 6px; margin-top: 8px; }

                .media-empty { padding: 48px; text-align: center; color: #9ca3af; font-size: 15px; }
            `}</style>

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
                                            <td><div className="media-name-cell">{getMediaIcon(doc.mediaType)}<span>{doc.name}</span></div></td>
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
                                <div key={doc.id} className="media-grid-card">
                                    <div className="media-grid-card-icon">{getMediaIcon(doc.mediaType)}</div>
                                    <div className="media-grid-card-name">{doc.name}</div>
                                    <div className="media-grid-card-meta">{doc.size} · {doc.resolution}</div>
                                    <div className="media-grid-card-meta">{doc.author} · {doc.uploadedDate}</div>
                                    <div className="media-grid-card-actions">
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
        </div>
    );
}