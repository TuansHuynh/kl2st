import { useTitle } from "../../../hooks/useTitle";
import React, { useState, useMemo, useRef } from 'react';
import TableChartIcon from '@mui/icons-material/TableChart';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import GridOnIcon from '@mui/icons-material/GridOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import StorageIcon from '@mui/icons-material/Storage';

interface ExcelItem {
    id: string;
    name: string;
    uploadedDate: string;
    size: string;
    author: string;
    sheets: number;
    rows: number;
}

export default function Excel() {
    useTitle("Excel Documents");

    const [documents, setDocuments] = useState<ExcelItem[]>([
        { id: '1', name: 'Bang_tinh_cham_cong_thang_6.xlsx', uploadedDate: '2026-07-08', size: '750 KB', author: 'Lê Văn C', sheets: 3, rows: 1200 },
        { id: '2', name: 'Danh_sach_lien_he_doi_tac.xlsx', uploadedDate: '2026-07-07', size: '320 KB', author: 'Nguyễn Văn A', sheets: 2, rows: 450 },
        { id: '3', name: 'Bao_cao_doanh_thu_Q2.xlsx', uploadedDate: '2026-07-06', size: '1.5 MB', author: 'Trần Thị B', sheets: 5, rows: 3800 },
        { id: '4', name: 'Du_toan_chi_phi_du_an.xlsx', uploadedDate: '2026-07-05', size: '890 KB', author: 'Phạm Văn D', sheets: 4, rows: 2100 },
        { id: '5', name: 'Thong_ke_nhan_su_2026.xlsx', uploadedDate: '2026-07-03', size: '1.1 MB', author: 'Hoàng Văn E', sheets: 6, rows: 5200 },
        { id: '6', name: 'Bang_luong_thang_6.xlsx', uploadedDate: '2026-07-01', size: '680 KB', author: 'Lê Văn C', sheets: 2, rows: 800 },
        { id: '7', name: 'Ke_hoach_tai_chinh_nam.xlsx', uploadedDate: '2026-06-25', size: '2.4 MB', author: 'Trần Thị B', sheets: 8, rows: 7500 },
    ]);

    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('date');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const totalFiles = documents.length;
    const totalSheets = useMemo(() => documents.reduce((sum, d) => sum + d.sheets, 0), [documents]);
    const totalRows = useMemo(() => documents.reduce((sum, d) => sum + d.rows, 0), [documents]);

    const getMBSize = (sizeStr: string) => {
        const val = parseFloat(sizeStr);
        if (sizeStr.toLowerCase().includes('kb')) return val / 1024;
        return val;
    };

    const totalSize = useMemo(() => documents.reduce((sum, d) => sum + getMBSize(d.size), 0), [documents]);
    const todayStr = '2026-07-08';

    const filteredDocs = useMemo(() => {
        let result = documents.filter(d =>
            d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            d.author.toLowerCase().includes(searchQuery.toLowerCase())
        );
        if (sortBy === 'date') result.sort((a, b) => b.uploadedDate.localeCompare(a.uploadedDate));
        else if (sortBy === 'name') result.sort((a, b) => a.name.localeCompare(b.name));
        else if (sortBy === 'size') result.sort((a, b) => getMBSize(b.size) - getMBSize(a.size));
        else if (sortBy === 'sheets') result.sort((a, b) => b.sheets - a.sheets);
        return result;
    }, [documents, searchQuery, sortBy]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const ext = file.name.split('.').pop()?.toLowerCase();
            if (!['xls', 'xlsx', 'csv'].includes(ext || '')) {
                alert('Chỉ chấp nhận file Excel (.xls, .xlsx, .csv)!');
                e.target.value = '';
                return;
            }
            let sizeStr = file.size > 1024 * 1024
                ? (file.size / (1024 * 1024)).toFixed(1) + ' MB'
                : (file.size / 1024).toFixed(0) + ' KB';
            const newDoc: ExcelItem = {
                id: Date.now().toString(),
                name: file.name,
                uploadedDate: todayStr,
                size: sizeStr,
                author: 'Tunas',
                sheets: Math.floor(Math.random() * 5) + 1,
                rows: Math.floor(Math.random() * 5000) + 100
            };
            setDocuments(prev => [newDoc, ...prev]);
            e.target.value = '';
        }
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa file Excel này?')) {
            setDocuments(prev => prev.filter(d => d.id !== id));
        }
    };

    const handleDownload = (doc: ExcelItem) => {
        alert(`Bắt đầu tải xuống: ${doc.name}`);
    };

    return (
        <div className="excel-container">
            <style>{`
                .excel-container {
                    padding: 24px; color: #1f2937; font-family: 'Roboto', 'Inter', sans-serif;
                    box-sizing: border-box; background-color: #f9fafb; min-height: calc(100vh - 10dvh); width: 100%;
                }

                .excel-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }

                .excel-title-wrap h1 {
                    font-size: 24px; font-weight: 700; color: #111827; margin: 0 0 4px 0;
                    display: flex; align-items: center; gap: 10px;
                }
                .excel-title-wrap h1 svg { color: #10b981; font-size: 28px; }
                .excel-title-wrap p { font-size: 14px; color: #6b7280; margin: 0; }

                .excel-btn-upload {
                    display: flex; align-items: center; gap: 8px;
                    background-color: #10b981; color: white; border: none; border-radius: 8px;
                    padding: 10px 16px; font-size: 14px; font-weight: 600; cursor: pointer;
                    transition: all 0.2s ease;
                    box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.2), 0 2px 4px -1px rgba(16, 185, 129, 0.1);
                }
                .excel-btn-upload:hover {
                    background-color: #059669; transform: translateY(-1px);
                    box-shadow: 0 10px 15px -3px rgba(16, 185, 129, 0.3), 0 4px 6px -2px rgba(16, 185, 129, 0.1);
                }
                .excel-btn-upload:active { transform: translateY(0); }

                .excel-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px; }

                .excel-stat-card {
                    background: #ffffff; border-radius: 12px; padding: 16px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.05); border: 1px solid #e5e7eb;
                    display: flex; align-items: center; justify-content: space-between;
                    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .excel-stat-card:hover { transform: translateY(-4px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05), 0 4px 6px -2px rgba(0,0,0,0.02); }

                .excel-stat-card.s1 { border-left: 4px solid #10b981; }
                .excel-stat-card.s2 { border-left: 4px solid #3b82f6; }
                .excel-stat-card.s3 { border-left: 4px solid #f59e0b; }
                .excel-stat-card.s4 { border-left: 4px solid #8b5cf6; }

                .excel-card-data { display: flex; flex-direction: column; }
                .excel-card-title { font-size: 12px; color: #6b7280; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; }
                .excel-card-value { font-size: 24px; font-weight: 700; color: #111827; }

                .excel-card-icon { width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
                .s1 .excel-card-icon { background: rgba(16, 185, 129, 0.1); color: #10b981; }
                .s2 .excel-card-icon { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
                .s3 .excel-card-icon { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
                .s4 .excel-card-icon { background: rgba(139, 92, 246, 0.1); color: #8b5cf6; }

                .excel-section { background: #ffffff; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); border: 1px solid #e5e7eb; overflow: hidden; }

                .excel-section-header {
                    padding: 16px 20px; border-bottom: 1px solid #e5e7eb;
                    display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px;
                }
                .excel-section-title { font-size: 16px; font-weight: 700; color: #111827; }
                .excel-controls { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; }
                .excel-search-wrap { position: relative; display: flex; align-items: center; }

                .excel-search-input {
                    padding: 8px 12px 8px 36px; border: 1px solid #d1d5db; border-radius: 8px;
                    font-size: 14px; outline: none; transition: all 0.2s; width: 220px;
                }
                .excel-search-input:focus { border-color: #10b981; box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15); }
                .excel-search-icon { position: absolute; left: 10px; color: #9ca3af; font-size: 20px; display: flex; align-items: center; }

                .excel-sort-select {
                    padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px;
                    background: white; color: #4b5563; outline: none; cursor: pointer; transition: border-color 0.2s;
                }
                .excel-sort-select:focus { border-color: #10b981; }

                .excel-table-wrap { width: 100%; overflow-x: auto; }
                .excel-table { width: 100%; border-collapse: collapse; text-align: left; font-size: 14px; }
                .excel-table th {
                    background: #f9fafb; padding: 12px 20px; font-weight: 600; color: #4b5563;
                    border-bottom: 1px solid #e5e7eb; text-transform: uppercase; font-size: 11px; letter-spacing: 0.05em;
                }
                .excel-table td { padding: 14px 20px; border-bottom: 1px solid #e5e7eb; color: #4b5563; vertical-align: middle; }
                .excel-table tr { transition: background 0.15s ease; }
                .excel-table tr:hover { background-color: #ecfdf5; }

                .excel-name-cell { display: flex; align-items: center; font-weight: 500; color: #111827; }
                .excel-name-cell svg { color: #10b981; font-size: 22px; margin-right: 12px; }
                .excel-author-cell { display: flex; align-items: center; }
                .excel-avatar {
                    width: 28px; height: 28px; border-radius: 50%;
                    background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                    color: white; font-size: 11px; font-weight: 700;
                    display: inline-flex; align-items: center; justify-content: center; margin-right: 8px;
                }
                .excel-badge { background-color: #ecfdf5; color: #065f46; padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: 500; }
                .excel-sheets-badge { background-color: #f3f4f6; color: #374151; padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: 500; }

                .excel-actions { display: flex; gap: 6px; }
                .excel-btn-action {
                    background: transparent; border: none; cursor: pointer; padding: 6px; border-radius: 6px;
                    color: #9ca3af; display: flex; align-items: center; justify-content: center; transition: all 0.2s;
                }
                .excel-btn-action:hover { background-color: #f3f4f6; color: #111827; }
                .excel-btn-action.btn-del:hover { background-color: #fee2e2; color: #ef4444; }
                .excel-empty { padding: 48px; text-align: center; color: #9ca3af; font-size: 15px; }
            `}</style>

            <div className="excel-header">
                <div className="excel-title-wrap">
                    <h1><TableChartIcon /> Quản lý bảng tính Excel</h1>
                    <p>Xem, tải lên và quản lý các file Excel trong hệ thống</p>
                </div>
                <button className="excel-btn-upload" onClick={() => fileInputRef.current?.click()}>
                    <AddIcon fontSize="small" />
                    Tải lên Excel
                </button>
                <input type="file" ref={fileInputRef} accept=".xls,.xlsx,.csv" onChange={handleFileChange} style={{ display: 'none' }} />
            </div>

            <div className="excel-grid">
                <div className="excel-stat-card s1">
                    <div className="excel-card-data"><span className="excel-card-title">Tổng file Excel</span><span className="excel-card-value">{totalFiles}</span></div>
                    <div className="excel-card-icon"><TableChartIcon /></div>
                </div>
                <div className="excel-stat-card s2">
                    <div className="excel-card-data"><span className="excel-card-title">Tổng sheet</span><span className="excel-card-value">{totalSheets}</span></div>
                    <div className="excel-card-icon"><GridOnIcon /></div>
                </div>
                <div className="excel-stat-card s3">
                    <div className="excel-card-data"><span className="excel-card-title">Tổng dòng dữ liệu</span><span className="excel-card-value">{totalRows.toLocaleString()}</span></div>
                    <div className="excel-card-icon"><StorageIcon /></div>
                </div>
                <div className="excel-stat-card s4">
                    <div className="excel-card-data"><span className="excel-card-title">Dung lượng</span><span className="excel-card-value">{totalSize.toFixed(1)} MB</span></div>
                    <div className="excel-card-icon"><CalendarTodayIcon /></div>
                </div>
            </div>

            <div className="excel-section">
                <div className="excel-section-header">
                    <span className="excel-section-title">Danh sách file Excel</span>
                    <div className="excel-controls">
                        <div className="excel-search-wrap">
                            <span className="excel-search-icon"><SearchIcon fontSize="small" /></span>
                            <input type="text" className="excel-search-input" placeholder="Tìm kiếm tên, tác giả..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                        </div>
                        <select className="excel-sort-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                            <option value="date">Sắp xếp theo ngày</option>
                            <option value="name">Sắp xếp theo tên</option>
                            <option value="size">Sắp xếp theo dung lượng</option>
                            <option value="sheets">Sắp xếp theo số sheet</option>
                        </select>
                    </div>
                </div>

                <div className="excel-table-wrap">
                    {filteredDocs.length > 0 ? (
                        <table className="excel-table">
                            <thead>
                                <tr>
                                    <th>Tên tài liệu</th>
                                    <th>Ngày tải lên</th>
                                    <th>Dung lượng</th>
                                    <th>Sheets</th>
                                    <th>Số dòng</th>
                                    <th>Tác giả</th>
                                    <th style={{ width: '100px', textAlign: 'center' }}>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredDocs.map(doc => (
                                    <tr key={doc.id}>
                                        <td>
                                            <div className="excel-name-cell"><TableChartIcon /><span>{doc.name}</span></div>
                                        </td>
                                        <td>{doc.uploadedDate}</td>
                                        <td><span className="excel-badge">{doc.size}</span></td>
                                        <td><span className="excel-sheets-badge">{doc.sheets} sheet</span></td>
                                        <td><span className="excel-sheets-badge">{doc.rows.toLocaleString()}</span></td>
                                        <td>
                                            <div className="excel-author-cell">
                                                <div className="excel-avatar">{doc.author.split(' ').pop()?.charAt(0) || 'U'}</div>
                                                <span>{doc.author}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="excel-actions">
                                                <button className="excel-btn-action" title="Tải xuống" onClick={() => handleDownload(doc)}><CloudDownloadIcon fontSize="small" /></button>
                                                <button className="excel-btn-action btn-del" title="Xóa" onClick={() => handleDelete(doc.id)}><DeleteIcon fontSize="small" /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="excel-empty">Không tìm thấy file Excel phù hợp</div>
                    )}
                </div>
            </div>
        </div>
    );
}