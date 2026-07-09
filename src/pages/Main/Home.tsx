import { useTitle } from "../../hooks/useTitle";
import React, { useState, useMemo, useRef } from 'react';
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

interface DocumentItem {
    id: string;
    name: string;
    type: 'pdf' | 'word' | 'excel' | 'image' | 'zip' | 'other';
    uploadedDate: string;
    size: string;
    author: string;
}


export default function Home() {
    useTitle("Home");
// Initial mock documents
    const [documents, setDocuments] = useState<DocumentItem[]>([
        { id: '1', name: 'Bao_cao_tai_chinh_Q2_2026.pdf', type: 'pdf', uploadedDate: '2026-07-08', size: '4.2 MB', author: 'Nguyễn Văn A' },
        { id: '2', name: 'Ke_hoach_marketing_san_pham.docx', type: 'word', uploadedDate: '2026-07-08', size: '1.8 MB', author: 'Trần Thị B' },
        { id: '3', name: 'Bang_tinh_cham_cong_thang_6.xlsx', type: 'excel', uploadedDate: '2026-07-07', size: '750 KB', author: 'Lê Văn C' },
        { id: '4', name: 'Banner_gioi_thieu_du_an_moi.png', type: 'image', uploadedDate: '2026-07-06', size: '5.1 MB', author: 'Phạm Văn D' },
        { id: '5', name: 'Backup_du_lieu_nguoi_dung.zip', type: 'zip', uploadedDate: '2026-07-05', size: '142.5 MB', author: 'Hệ thống' },
        { id: '6', name: 'Slide_thuyet_trinh_dau_tu.pptx', type: 'other', uploadedDate: '2026-07-04', size: '12.0 MB', author: 'Hoàng Văn E' },
        { id: '7', name: 'Quy_trinh_lam_viec_nhom.pdf', type: 'pdf', uploadedDate: '2026-07-02', size: '1.1 MB', author: 'Nguyễn Văn A' },
        { id: '8', name: 'Mau_hop_dong_cong_tac_vien.docx', type: 'word', uploadedDate: '2026-06-30', size: '480 KB', author: 'Trần Thị B' },
        { id: '9', name: 'Danh_sach_lien_he_doi_tac.xlsx', type: 'excel', uploadedDate: '2026-06-25', size: '320 KB', author: 'Lê Văn C' },
        { id: '10', name: 'Logo_cong_ty_cac_phien_ban.zip', type: 'zip', uploadedDate: '2026-06-20', size: '24.8 MB', author: 'Phạm Văn D' }
    ]);

    const [downloadCount, setDownloadCount] = useState(17);
    const [downloadTodayCount, setDownloadTodayCount] = useState(6);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('all');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Calculate document file types
    const totalFile = documents.length;
    const totalFileUpload = documents.length;
    const totalFileDownload = downloadCount;

    // Filter file uploads today (current local time year/month/day is 2026-07-08)
    const todayStr = '2026-07-08';
    const totalFileUploadToday = useMemo(() => {
        return documents.filter(doc => doc.uploadedDate === todayStr).length;
    }, [documents]);

    const totalFileDownloadtoday = downloadTodayCount;

    // Convert size to MB helper
    const getMBSize = (sizeStr: string) => {
        const val = parseFloat(sizeStr);
        if (sizeStr.toLowerCase().includes('kb')) {
            return val / 1024;
        }
        return val;
    };

    // Calculate total storage capacity (say 250MB limit)
    const totalStorageUsed = useMemo(() => {
        return documents.reduce((sum, doc) => sum + getMBSize(doc.size), 0);
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

    // Handle dummy file upload via input element
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            let fileType: DocumentItem['type'] = 'other';
            const ext = file.name.split('.').pop()?.toLowerCase();
            if (ext === 'pdf') fileType = 'pdf';
            else if (['doc', 'docx'].includes(ext || '')) fileType = 'word';
            else if (['xls', 'xlsx'].includes(ext || '')) fileType = 'excel';
            else if (['png', 'jpg', 'jpeg', 'gif', 'svg'].includes(ext || '')) fileType = 'image';
            else if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext || '')) fileType = 'zip';

            let sizeStr = '0 KB';
            if (file.size > 1024 * 1024) {
                sizeStr = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
            } else {
                sizeStr = (file.size / 1024).toFixed(0) + ' KB';
            }

            const newDoc: DocumentItem = {
                id: Date.now().toString(),
                name: file.name,
                type: fileType,
                uploadedDate: todayStr, // Mark upload date as today
                size: sizeStr,
                author: 'Tunas'
            };

            setDocuments(prev => [newDoc, ...prev]);
            // clear input
            e.target.value = '';
        }
    };

    // Trigger local file selector
    const triggerUpload = () => {
        fileInputRef.current?.click();
    };

    // Actions
    const handleDelete = (id: string) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa tài liệu này?')) {
            setDocuments(prev => prev.filter(doc => doc.id !== id));
        }
    };

    const handleDownload = (doc: DocumentItem) => {
        setDownloadCount(prev => prev + 1);
        setDownloadTodayCount(prev => prev + 1);
        alert(`Bắt đầu tải xuống: ${doc.name}`);
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
            <style>{`
                .document-storage-container {
                    padding: 24px;
                    color: #1f2937;
                    font-family: 'Roboto', 'Inter', sans-serif;
                    box-sizing: border-box;
                    background-color: #f9fafb;
                    min-height: calc(100vh - 10dvh);
                    width: 100%;
                }
                
                .doc-header-section {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 24px;
                }
                
                .doc-title-wrapper h1 {
                    font-size: 24px;
                    font-weight: 700;
                    color: #111827;
                    margin: 0 0 4px 0;
                }

                .doc-title-wrapper p {
                    font-size: 14px;
                    color: #6b7280;
                    margin: 0;
                }

                .btn-upload-primary {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background-color: #4f46e5;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    padding: 10px 16px;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2), 0 2px 4px -1px rgba(79, 70, 229, 0.1);
                }

                .btn-upload-primary:hover {
                    background-color: #4338ca;
                    transform: translateY(-1px);
                    box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.3), 0 4px 6px -2px rgba(79, 70, 229, 0.1);
                }

                .btn-upload-primary:active {
                    transform: translateY(0);
                }

                .storage-progress-block {
                    background: white;
                    padding: 16px 20px;
                    border-radius: 12px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
                    margin-bottom: 24px;
                    border: 1px solid #e5e7eb;
                }

                .storage-progress-labels {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 8px;
                    font-size: 14px;
                    font-weight: 600;
                    color: #4b5563;
                }

                .storage-bar-outer {
                    height: 8px;
                    background: #f3f4f6;
                    border-radius: 9999px;
                    overflow: hidden;
                    border: 1px solid #e5e7eb;
                }

                .storage-bar-inner {
                    height: 100%;
                    background: linear-gradient(90deg, #4f46e5 0%, #818cf8 100%);
                    border-radius: 9999px;
                    transition: width 0.4s ease-out;
                }

                .grid-container {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 16px;
                    margin-bottom: 24px;
                }

                .box-card {
                    background: #ffffff;
                    border-radius: 12px;
                    padding: 16px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
                    border: 1px solid #e5e7eb;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
                }

                .box-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02);
                }

                .box-card.box-1 { border-left: 4px solid #4f46e5; }
                .box-card.box-2 { border-left: 4px solid #10b981; }
                .box-card.box-3 { border-left: 4px solid #f59e0b; }
                .box-card.box-4 { border-left: 4px solid #06b6d4; }
                .box-card.box-5 { border-left: 4px solid #f43f5e; }

                .card-data {
                    display: flex;
                    flex-direction: column;
                }

                .card-title {
                    font-size: 12px;
                    color: #6b7280;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    margin-bottom: 4px;
                }

                .card-value {
                    font-size: 24px;
                    font-weight: 700;
                    color: #111827;
                }

                .card-icon-wrapper {
                    width: 44px;
                    height: 44px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .box-1 .card-icon-wrapper { background: rgba(79, 70, 229, 0.1); color: #4f46e5; }
                .box-2 .card-icon-wrapper { background: rgba(16, 185, 129, 0.1); color: #10b981; }
                .box-3 .card-icon-wrapper { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
                .box-4 .card-icon-wrapper { background: rgba(6, 182, 212, 0.1); color: #06b6d4; }
                .box-5 .card-icon-wrapper { background: rgba(244, 63, 94, 0.1); color: #f43f5e; }

                .doc-section {
                    background: #ffffff;
                    border-radius: 12px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
                    border: 1px solid #e5e7eb;
                    overflow: hidden;
                }

                .doc-section-header {
                    padding: 16px 20px;
                    border-bottom: 1px solid #e5e7eb;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 12px;
                }

                .doc-section-title {
                    font-size: 16px;
                    font-weight: 700;
                    color: #111827;
                }

                .doc-controls {
                    display: flex;
                    gap: 12px;
                    flex-wrap: wrap;
                    align-items: center;
                }

                .search-wrapper {
                    position: relative;
                    display: flex;
                    align-items: center;
                }

                .search-input {
                    padding: 8px 12px 8px 36px;
                    border: 1px solid #d1d5db;
                    border-radius: 8px;
                    font-size: 14px;
                    outline: none;
                    transition: all 0.2s;
                    width: 220px;
                }

                .search-input:focus {
                    border-color: #4f46e5;
                    box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.15);
                }

                .search-icon-svg {
                    position: absolute;
                    left: 10px;
                    color: #9ca3af;
                    font-size: 20px;
                    display: flex;
                    align-items: center;
                }

                .filter-select {
                    padding: 8px 12px;
                    border: 1px solid #d1d5db;
                    border-radius: 8px;
                    font-size: 14px;
                    background: white;
                    color: #4b5563;
                    outline: none;
                    cursor: pointer;
                    transition: border-color 0.2s;
                }

                .filter-select:focus {
                    border-color: #4f46e5;
                }

                .table-responsive {
                    width: 100%;
                    overflow-x: auto;
                }

                .doc-table {
                    width: 100%;
                    border-collapse: collapse;
                    text-align: left;
                    font-size: 14px;
                }

                .doc-table th {
                    background: #f9fafb;
                    padding: 12px 20px;
                    font-weight: 600;
                    color: #4b5563;
                    border-bottom: 1px solid #e5e7eb;
                    text-transform: uppercase;
                    font-size: 11px;
                    letter-spacing: 0.05em;
                }

                .doc-table td {
                    padding: 14px 20px;
                    border-bottom: 1px solid #e5e7eb;
                    color: #4b5563;
                    vertical-align: middle;
                }

                .doc-table tr {
                    transition: background 0.15s ease;
                }

                .doc-table tr:hover {
                    background-color: #f9fafb;
                }

                .doc-name-cell {
                    display: flex;
                    align-items: center;
                    font-weight: 500;
                    color: #111827;
                }

                .doc-type-icon {
                    margin-right: 12px;
                    display: flex;
                    align-items: center;
                }

                .doc-type-icon svg {
                    font-size: 22px;
                }

                .icon-pdf { color: #ef4444; }
                .icon-word { color: #3b82f6; }
                .icon-excel { color: #10b981; }
                .icon-image { color: #8b5cf6; }
                .icon-zip { color: #f59e0b; }
                .icon-other { color: #6b7280; }

                .author-cell {
                    display: flex;
                    align-items: center;
                }

                .author-avatar {
                    width: 28px;
                    height: 28px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
                    color: white;
                    font-size: 11px;
                    font-weight: 700;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    margin-right: 8px;
                }

                .size-badge {
                    background-color: #f3f4f6;
                    color: #374151;
                    padding: 2px 8px;
                    border-radius: 12px;
                    font-size: 12px;
                    font-weight: 500;
                }

                .action-buttons {
                    display: flex;
                    gap: 6px;
                }

                .btn-action {
                    background: transparent;
                    border: none;
                    cursor: pointer;
                    padding: 6px;
                    border-radius: 6px;
                    color: #9ca3af;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                }

                .btn-action:hover {
                    background-color: #f3f4f6;
                    color: #111827;
                }

                .btn-action.btn-delete:hover {
                    background-color: #fee2e2;
                    color: #ef4444;
                }

                .empty-state {
                    padding: 48px;
                    text-align: center;
                    color: #9ca3af;
                    font-size: 15px;
                }
            `}</style>

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
                                            <div className="doc-name-cell">
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
        </div>
    )
}