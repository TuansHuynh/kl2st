import { useTitle } from "../../../hooks/useTitle";
import React, { useState, useMemo, useRef } from 'react';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import StorageIcon from '@mui/icons-material/Storage';


interface PDFItem {
    id: string;
    name: string;
    uploadedDate: string;
    size: string;
    author: string;
    pages: number;
}

export default function PDF() {
    useTitle("PDF Documents");

    const [documents, setDocuments] = useState<PDFItem[]>([
        { id: '1', name: 'Bao_cao_tai_chinh_Q2_2026.pdf', uploadedDate: '2026-07-08', size: '4.2 MB', author: 'Nguyễn Văn A', pages: 48 },
        { id: '2', name: 'Quy_trinh_lam_viec_nhom.pdf', uploadedDate: '2026-07-07', size: '1.1 MB', author: 'Trần Thị B', pages: 12 },
        { id: '3', name: 'Hop_dong_cung_cap_dich_vu.pdf', uploadedDate: '2026-07-06', size: '2.8 MB', author: 'Lê Văn C', pages: 24 },
        { id: '4', name: 'Tai_lieu_huong_dan_su_dung.pdf', uploadedDate: '2026-07-05', size: '6.5 MB', author: 'Phạm Văn D', pages: 86 },
        { id: '5', name: 'Ke_hoach_du_an_2026.pdf', uploadedDate: '2026-07-04', size: '3.4 MB', author: 'Hoàng Văn E', pages: 32 },
        { id: '6', name: 'Bao_cao_kiem_toan_noi_bo.pdf', uploadedDate: '2026-07-02', size: '5.7 MB', author: 'Nguyễn Văn A', pages: 64 },
        { id: '7', name: 'Chinh_sach_bao_mat_thong_tin.pdf', uploadedDate: '2026-06-28', size: '1.9 MB', author: 'Trần Thị B', pages: 18 },
        { id: '8', name: 'Bang_gia_dich_vu_2026.pdf', uploadedDate: '2026-06-20', size: '980 KB', author: 'Lê Văn C', pages: 8 },
    ]);

    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('date');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const totalFiles = documents.length;
    const totalPages = useMemo(() => documents.reduce((sum, d) => sum + d.pages, 0), [documents]);

    const getMBSize = (sizeStr: string) => {
        const val = parseFloat(sizeStr);
        if (sizeStr.toLowerCase().includes('kb')) return val / 1024;
        return val;
    };

    const totalSize = useMemo(() => documents.reduce((sum, d) => sum + getMBSize(d.size), 0), [documents]);

    const todayStr = '2026-07-08';
    const uploadedToday = useMemo(() => documents.filter(d => d.uploadedDate === todayStr).length, [documents]);

    const filteredDocs = useMemo(() => {
        let result = documents.filter(d =>
            d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            d.author.toLowerCase().includes(searchQuery.toLowerCase())
        );
        if (sortBy === 'date') result.sort((a, b) => b.uploadedDate.localeCompare(a.uploadedDate));
        else if (sortBy === 'name') result.sort((a, b) => a.name.localeCompare(b.name));
        else if (sortBy === 'size') result.sort((a, b) => getMBSize(b.size) - getMBSize(a.size));
        else if (sortBy === 'pages') result.sort((a, b) => b.pages - a.pages);
        return result;
    }, [documents, searchQuery, sortBy]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const ext = file.name.split('.').pop()?.toLowerCase();
            if (ext !== 'pdf') {
                alert('Chỉ chấp nhận file PDF!');
                e.target.value = '';
                return;
            }
            let sizeStr = file.size > 1024 * 1024
                ? (file.size / (1024 * 1024)).toFixed(1) + ' MB'
                : (file.size / 1024).toFixed(0) + ' KB';

            const newDoc: PDFItem = {
                id: Date.now().toString(),
                name: file.name,
                uploadedDate: todayStr,
                size: sizeStr,
                author: 'Tunas',
                pages: Math.floor(Math.random() * 50) + 1
            };
            setDocuments(prev => [newDoc, ...prev]);
            e.target.value = '';
        }
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa tài liệu PDF này?')) {
            setDocuments(prev => prev.filter(d => d.id !== id));
        }
    };

    const handleDownload = (doc: PDFItem) => {
        alert(`Bắt đầu tải xuống: ${doc.name}`);
    };

    return (
        <div className="pdf-container">
            <style>{`
                .pdf-container {
                    padding: 24px;
                    color: #1f2937;
                    font-family: 'Roboto', 'Inter', sans-serif;
                    box-sizing: border-box;
                    background-color: #f9fafb;
                    min-height: calc(100vh - 10dvh);
                    width: 100%;
                }

                .pdf-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 24px;
                }

                .pdf-title-wrap h1 {
                    font-size: 24px;
                    font-weight: 700;
                    color: #111827;
                    margin: 0 0 4px 0;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .pdf-title-wrap h1 svg {
                    color: #ef4444;
                    font-size: 28px;
                }

                .pdf-title-wrap p {
                    font-size: 14px;
                    color: #6b7280;
                    margin: 0;
                }

                .pdf-btn-upload {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background-color: #ef4444;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    padding: 10px 16px;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    box-shadow: 0 4px 6px -1px rgba(239, 68, 68, 0.2), 0 2px 4px -1px rgba(239, 68, 68, 0.1);
                }

                .pdf-btn-upload:hover {
                    background-color: #dc2626;
                    transform: translateY(-1px);
                    box-shadow: 0 10px 15px -3px rgba(239, 68, 68, 0.3), 0 4px 6px -2px rgba(239, 68, 68, 0.1);
                }

                .pdf-btn-upload:active { transform: translateY(0); }

                .pdf-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 16px;
                    margin-bottom: 24px;
                }

                .pdf-stat-card {
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

                .pdf-stat-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02);
                }

                .pdf-stat-card.s1 { border-left: 4px solid #ef4444; }
                .pdf-stat-card.s2 { border-left: 4px solid #f97316; }
                .pdf-stat-card.s3 { border-left: 4px solid #8b5cf6; }
                .pdf-stat-card.s4 { border-left: 4px solid #06b6d4; }

                .pdf-card-data { display: flex; flex-direction: column; }

                .pdf-card-title {
                    font-size: 12px;
                    color: #6b7280;
                    font-weight: 700;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    margin-bottom: 4px;
                }

                .pdf-card-value {
                    font-size: 24px;
                    font-weight: 700;
                    color: #111827;
                }

                .pdf-card-icon {
                    width: 44px;
                    height: 44px;
                    border-radius: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .s1 .pdf-card-icon { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
                .s2 .pdf-card-icon { background: rgba(249, 115, 22, 0.1); color: #f97316; }
                .s3 .pdf-card-icon { background: rgba(139, 92, 246, 0.1); color: #8b5cf6; }
                .s4 .pdf-card-icon { background: rgba(6, 182, 212, 0.1); color: #06b6d4; }

                .pdf-section {
                    background: #ffffff;
                    border-radius: 12px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
                    border: 1px solid #e5e7eb;
                    overflow: hidden;
                }

                .pdf-section-header {
                    padding: 16px 20px;
                    border-bottom: 1px solid #e5e7eb;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 12px;
                }

                .pdf-section-title {
                    font-size: 16px;
                    font-weight: 700;
                    color: #111827;
                }

                .pdf-controls {
                    display: flex;
                    gap: 12px;
                    flex-wrap: wrap;
                    align-items: center;
                }

                .pdf-search-wrap {
                    position: relative;
                    display: flex;
                    align-items: center;
                }

                .pdf-search-input {
                    padding: 8px 12px 8px 36px;
                    border: 1px solid #d1d5db;
                    border-radius: 8px;
                    font-size: 14px;
                    outline: none;
                    transition: all 0.2s;
                    width: 220px;
                }

                .pdf-search-input:focus {
                    border-color: #ef4444;
                    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.15);
                }

                .pdf-search-icon {
                    position: absolute;
                    left: 10px;
                    color: #9ca3af;
                    font-size: 20px;
                    display: flex;
                    align-items: center;
                }

                .pdf-sort-select {
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

                .pdf-sort-select:focus { border-color: #ef4444; }

                .pdf-table-wrap { width: 100%; overflow-x: auto; }

                .pdf-table {
                    width: 100%;
                    border-collapse: collapse;
                    text-align: left;
                    font-size: 14px;
                }

                .pdf-table th {
                    background: #f9fafb;
                    padding: 12px 20px;
                    font-weight: 600;
                    color: #4b5563;
                    border-bottom: 1px solid #e5e7eb;
                    text-transform: uppercase;
                    font-size: 11px;
                    letter-spacing: 0.05em;
                }

                .pdf-table td {
                    padding: 14px 20px;
                    border-bottom: 1px solid #e5e7eb;
                    color: #4b5563;
                    vertical-align: middle;
                }

                .pdf-table tr { transition: background 0.15s ease; }
                .pdf-table tr:hover { background-color: #fef2f2; }

                .pdf-name-cell {
                    display: flex;
                    align-items: center;
                    font-weight: 500;
                    color: #111827;
                }

                .pdf-name-cell svg {
                    color: #ef4444;
                    font-size: 22px;
                    margin-right: 12px;
                }

                .pdf-author-cell {
                    display: flex;
                    align-items: center;
                }

                .pdf-avatar {
                    width: 28px;
                    height: 28px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
                    color: white;
                    font-size: 11px;
                    font-weight: 700;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    margin-right: 8px;
                }

                .pdf-badge {
                    background-color: #fef2f2;
                    color: #991b1b;
                    padding: 2px 8px;
                    border-radius: 12px;
                    font-size: 12px;
                    font-weight: 500;
                }

                .pdf-pages-badge {
                    background-color: #f3f4f6;
                    color: #374151;
                    padding: 2px 8px;
                    border-radius: 12px;
                    font-size: 12px;
                    font-weight: 500;
                }

                .pdf-actions {
                    display: flex;
                    gap: 6px;
                }

                .pdf-btn-action {
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

                .pdf-btn-action:hover {
                    background-color: #f3f4f6;
                    color: #111827;
                }

                .pdf-btn-action.btn-del:hover {
                    background-color: #fee2e2;
                    color: #ef4444;
                }

                .pdf-empty {
                    padding: 48px;
                    text-align: center;
                    color: #9ca3af;
                    font-size: 15px;
                }
            `}</style>

            <div className="pdf-header">
                <div className="pdf-title-wrap">
                    <h1><PictureAsPdfIcon /> Quản lý tài liệu PDF</h1>
                    <p>Xem, tải lên và quản lý các file PDF trong hệ thống</p>
                </div>
                <button className="pdf-btn-upload" onClick={() => fileInputRef.current?.click()}>
                    <AddIcon fontSize="small" />
                    Tải lên PDF
                </button>
                <input type="file" ref={fileInputRef} accept=".pdf" onChange={handleFileChange} style={{ display: 'none' }} />
            </div>

            <div className="pdf-grid">
                <div className="pdf-stat-card s1">
                    <div className="pdf-card-data">
                        <span className="pdf-card-title">Tổng file PDF</span>
                        <span className="pdf-card-value">{totalFiles}</span>
                    </div>
                    <div className="pdf-card-icon"><PictureAsPdfIcon /></div>
                </div>
                <div className="pdf-stat-card s2">
                    <div className="pdf-card-data">
                        <span className="pdf-card-title">Tổng số trang</span>
                        <span className="pdf-card-value">{totalPages}</span>
                    </div>
                    <div className="pdf-card-icon"><VisibilityIcon /></div>
                </div>
                <div className="pdf-stat-card s3">
                    <div className="pdf-card-data">
                        <span className="pdf-card-title">Dung lượng</span>
                        <span className="pdf-card-value">{totalSize.toFixed(1)} MB</span>
                    </div>
                    <div className="pdf-card-icon"><StorageIcon /></div>
                </div>
                <div className="pdf-stat-card s4">
                    <div className="pdf-card-data">
                        <span className="pdf-card-title">Tải lên hôm nay</span>
                        <span className="pdf-card-value">{uploadedToday}</span>
                    </div>
                    <div className="pdf-card-icon"><CalendarTodayIcon /></div>
                </div>
            </div>

            <div className="pdf-section">
                <div className="pdf-section-header">
                    <span className="pdf-section-title">Danh sách file PDF</span>
                    <div className="pdf-controls">
                        <div className="pdf-search-wrap">
                            <span className="pdf-search-icon"><SearchIcon fontSize="small" /></span>
                            <input
                                type="text"
                                className="pdf-search-input"
                                placeholder="Tìm kiếm tên, tác giả..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <select className="pdf-sort-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                            <option value="date">Sắp xếp theo ngày</option>
                            <option value="name">Sắp xếp theo tên</option>
                            <option value="size">Sắp xếp theo dung lượng</option>
                            <option value="pages">Sắp xếp theo số trang</option>
                        </select>
                    </div>
                </div>

                <div className="pdf-table-wrap">
                    {filteredDocs.length > 0 ? (
                        <table className="pdf-table">
                            <thead>
                                <tr>
                                    <th>Tên tài liệu</th>
                                    <th>Ngày tải lên</th>
                                    <th>Dung lượng</th>
                                    <th>Số trang</th>
                                    <th>Tác giả</th>
                                    <th style={{ width: '100px', textAlign: 'center' }}>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredDocs.map(doc => (
                                    <tr key={doc.id}>
                                        <td>
                                            <div className="pdf-name-cell">
                                                <PictureAsPdfIcon />
                                                <span>{doc.name}</span>
                                            </div>
                                        </td>
                                        <td>{doc.uploadedDate}</td>
                                        <td><span className="pdf-badge">{doc.size}</span></td>
                                        <td><span className="pdf-pages-badge">{doc.pages} trang</span></td>
                                        <td>
                                            <div className="pdf-author-cell">
                                                <div className="pdf-avatar">{doc.author.split(' ').pop()?.charAt(0) || 'U'}</div>
                                                <span>{doc.author}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="pdf-actions">
                                                <button className="pdf-btn-action" title="Tải xuống" onClick={() => handleDownload(doc)}>
                                                    <CloudDownloadIcon fontSize="small" />
                                                </button>
                                                <button className="pdf-btn-action btn-del" title="Xóa" onClick={() => handleDelete(doc.id)}>
                                                    <DeleteIcon fontSize="small" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="pdf-empty">Không tìm thấy tài liệu PDF phù hợp</div>
                    )}
                </div>
            </div>
        </div>
    );
}