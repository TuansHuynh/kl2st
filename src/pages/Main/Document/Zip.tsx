import { useTitle } from "../../../hooks/useTitle";
import React, { useState, useMemo, useRef } from 'react';
import FolderZipIcon from '@mui/icons-material/FolderZip';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ArchiveIcon from '@mui/icons-material/Archive';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import StorageIcon from '@mui/icons-material/Storage';

interface ZipItem {
    id: string;
    name: string;
    archiveType: 'zip' | 'rar' | '7z' | 'tar.gz';
    uploadedDate: string;
    size: string;
    author: string;
    fileCount: number;
}

export default function Zip() {
    useTitle("ZIP/RAR Archives");

    const [documents, setDocuments] = useState<ZipItem[]>([
        { id: '1', name: 'Backup_du_lieu_nguoi_dung.zip', archiveType: 'zip', uploadedDate: '2026-07-08', size: '142.5 MB', author: 'Hệ thống', fileCount: 1240 },
        { id: '2', name: 'Logo_cong_ty_cac_phien_ban.zip', archiveType: 'zip', uploadedDate: '2026-07-07', size: '24.8 MB', author: 'Phạm Văn D', fileCount: 48 },
        { id: '3', name: 'Source_code_frontend_v2.zip', archiveType: 'zip', uploadedDate: '2026-07-06', size: '38.2 MB', author: 'Nguyễn Văn A', fileCount: 856 },
        { id: '4', name: 'Du_lieu_khach_hang_Q2.rar', archiveType: 'rar', uploadedDate: '2026-07-05', size: '67.4 MB', author: 'Trần Thị B', fileCount: 320 },
        { id: '5', name: 'Tai_lieu_dao_tao_nhan_vien.7z', archiveType: '7z', uploadedDate: '2026-07-03', size: '18.9 MB', author: 'Lê Văn C', fileCount: 95 },
        { id: '6', name: 'Backup_database_monthly.tar.gz', archiveType: 'tar.gz', uploadedDate: '2026-07-01', size: '256.0 MB', author: 'Hệ thống', fileCount: 15 },
        { id: '7', name: 'Hinh_anh_su_kien_2026.zip', archiveType: 'zip', uploadedDate: '2026-06-25', size: '89.3 MB', author: 'Hoàng Văn E', fileCount: 420 },
    ]);

    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('all');
    const fileInputRef = useRef<HTMLInputElement>(null);

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
    }, [documents, searchQuery, filterType]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const ext = file.name.split('.').pop()?.toLowerCase();
            let archiveType: ZipItem['archiveType'] = 'zip';
            if (ext === 'rar') archiveType = 'rar';
            else if (ext === '7z') archiveType = '7z';
            else if (ext === 'gz' || ext === 'tar') archiveType = 'tar.gz';

            let sizeStr = file.size > 1024 * 1024
                ? (file.size / (1024 * 1024)).toFixed(1) + ' MB'
                : (file.size / 1024).toFixed(0) + ' KB';

            const newDoc: ZipItem = {
                id: Date.now().toString(),
                name: file.name,
                archiveType,
                uploadedDate: '2026-07-08',
                size: sizeStr,
                author: 'Tunas',
                fileCount: Math.floor(Math.random() * 500) + 10
            };
            setDocuments(prev => [newDoc, ...prev]);
            e.target.value = '';
        }
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa file nén này?')) {
            setDocuments(prev => prev.filter(d => d.id !== id));
        }
    };

    const handleDownload = (doc: ZipItem) => {
        alert(`Bắt đầu tải xuống: ${doc.name}`);
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
            <style>{`
                .zip-container {
                    padding: 24px; color: #1f2937; font-family: 'Roboto', 'Inter', sans-serif;
                    box-sizing: border-box; background-color: #f9fafb; min-height: calc(100vh - 10dvh); width: 100%;
                }
                .zip-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
                .zip-title-wrap h1 { font-size: 24px; font-weight: 700; color: #111827; margin: 0 0 4px 0; display: flex; align-items: center; gap: 10px; }
                .zip-title-wrap h1 svg { color: #f59e0b; font-size: 28px; }
                .zip-title-wrap p { font-size: 14px; color: #6b7280; margin: 0; }

                .zip-btn-upload {
                    display: flex; align-items: center; gap: 8px;
                    background-color: #f59e0b; color: white; border: none; border-radius: 8px;
                    padding: 10px 16px; font-size: 14px; font-weight: 600; cursor: pointer;
                    transition: all 0.2s ease;
                    box-shadow: 0 4px 6px -1px rgba(245, 158, 11, 0.2), 0 2px 4px -1px rgba(245, 158, 11, 0.1);
                }
                .zip-btn-upload:hover { background-color: #d97706; transform: translateY(-1px); box-shadow: 0 10px 15px -3px rgba(245, 158, 11, 0.3); }
                .zip-btn-upload:active { transform: translateY(0); }

                .zip-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px; }

                .zip-stat-card {
                    background: #ffffff; border-radius: 12px; padding: 16px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.05); border: 1px solid #e5e7eb;
                    display: flex; align-items: center; justify-content: space-between;
                    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .zip-stat-card:hover { transform: translateY(-4px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); }
                .zip-stat-card.s1 { border-left: 4px solid #f59e0b; }
                .zip-stat-card.s2 { border-left: 4px solid #ef4444; }
                .zip-stat-card.s3 { border-left: 4px solid #3b82f6; }
                .zip-stat-card.s4 { border-left: 4px solid #10b981; }

                .zip-card-data { display: flex; flex-direction: column; }
                .zip-card-title { font-size: 12px; color: #6b7280; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; }
                .zip-card-value { font-size: 24px; font-weight: 700; color: #111827; }
                .zip-card-icon { width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
                .s1 .zip-card-icon { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
                .s2 .zip-card-icon { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
                .s3 .zip-card-icon { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
                .s4 .zip-card-icon { background: rgba(16, 185, 129, 0.1); color: #10b981; }

                .zip-section { background: #ffffff; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); border: 1px solid #e5e7eb; overflow: hidden; }
                .zip-section-header { padding: 16px 20px; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }
                .zip-section-title { font-size: 16px; font-weight: 700; color: #111827; }
                .zip-controls { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; }
                .zip-search-wrap { position: relative; display: flex; align-items: center; }
                .zip-search-input { padding: 8px 12px 8px 36px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; outline: none; transition: all 0.2s; width: 220px; }
                .zip-search-input:focus { border-color: #f59e0b; box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.15); }
                .zip-search-icon { position: absolute; left: 10px; color: #9ca3af; font-size: 20px; display: flex; align-items: center; }
                .zip-filter-select { padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; background: white; color: #4b5563; outline: none; cursor: pointer; transition: border-color 0.2s; }
                .zip-filter-select:focus { border-color: #f59e0b; }

                .zip-table-wrap { width: 100%; overflow-x: auto; }
                .zip-table { width: 100%; border-collapse: collapse; text-align: left; font-size: 14px; }
                .zip-table th { background: #f9fafb; padding: 12px 20px; font-weight: 600; color: #4b5563; border-bottom: 1px solid #e5e7eb; text-transform: uppercase; font-size: 11px; letter-spacing: 0.05em; }
                .zip-table td { padding: 14px 20px; border-bottom: 1px solid #e5e7eb; color: #4b5563; vertical-align: middle; }
                .zip-table tr { transition: background 0.15s ease; }
                .zip-table tr:hover { background-color: #fffbeb; }

                .zip-name-cell { display: flex; align-items: center; font-weight: 500; color: #111827; }
                .zip-name-cell svg { color: #f59e0b; font-size: 22px; margin-right: 12px; }
                .zip-author-cell { display: flex; align-items: center; }
                .zip-avatar { width: 28px; height: 28px; border-radius: 50%; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; font-size: 11px; font-weight: 700; display: inline-flex; align-items: center; justify-content: center; margin-right: 8px; }
                .zip-size-badge { background-color: #fffbeb; color: #92400e; padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: 500; }
                .zip-count-badge { background-color: #f3f4f6; color: #374151; padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: 500; }

                .zip-actions { display: flex; gap: 6px; }
                .zip-btn-action { background: transparent; border: none; cursor: pointer; padding: 6px; border-radius: 6px; color: #9ca3af; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
                .zip-btn-action:hover { background-color: #f3f4f6; color: #111827; }
                .zip-btn-action.btn-del:hover { background-color: #fee2e2; color: #ef4444; }
                .zip-empty { padding: 48px; text-align: center; color: #9ca3af; font-size: 15px; }
            `}</style>

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
                                        <td><div className="zip-name-cell"><FolderZipIcon /><span>{doc.name}</span></div></td>
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
        </div>
    );
}