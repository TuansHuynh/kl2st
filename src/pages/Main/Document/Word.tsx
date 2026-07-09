import { useTitle } from "../../../hooks/useTitle";
import React, { useState, useMemo, useRef } from 'react';
import DescriptionIcon from '@mui/icons-material/Description';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import EditNoteIcon from '@mui/icons-material/EditNote';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import StorageIcon from '@mui/icons-material/Storage';

interface WordItem {
    id: string;
    name: string;
    uploadedDate: string;
    size: string;
    author: string;
    wordCount: number;
}

export default function Word() {
    useTitle("Word Documents");

    const [documents, setDocuments] = useState<WordItem[]>([
        { id: '1', name: 'Ke_hoach_marketing_san_pham.docx', uploadedDate: '2026-07-08', size: '1.8 MB', author: 'Trần Thị B', wordCount: 4500 },
        { id: '2', name: 'Mau_hop_dong_cong_tac_vien.docx', uploadedDate: '2026-07-07', size: '480 KB', author: 'Nguyễn Văn A', wordCount: 2100 },
        { id: '3', name: 'Bao_cao_tien_do_du_an.docx', uploadedDate: '2026-07-06', size: '2.3 MB', author: 'Lê Văn C', wordCount: 6800 },
        { id: '4', name: 'Noi_quy_lao_dong_2026.docx', uploadedDate: '2026-07-05', size: '1.2 MB', author: 'Phạm Văn D', wordCount: 3200 },
        { id: '5', name: 'Thuyet_minh_giai_phap_ky_thuat.docx', uploadedDate: '2026-07-04', size: '3.7 MB', author: 'Hoàng Văn E', wordCount: 9500 },
        { id: '6', name: 'Bien_ban_hop_ban_giam_doc.docx', uploadedDate: '2026-07-01', size: '650 KB', author: 'Trần Thị B', wordCount: 1800 },
        { id: '7', name: 'De_xuat_ngan_sach_Q3.docx', uploadedDate: '2026-06-28', size: '890 KB', author: 'Nguyễn Văn A', wordCount: 2400 },
    ]);

    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('date');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const totalFiles = documents.length;
    const totalWords = useMemo(() => documents.reduce((sum, d) => sum + d.wordCount, 0), [documents]);

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
        else if (sortBy === 'words') result.sort((a, b) => b.wordCount - a.wordCount);
        return result;
    }, [documents, searchQuery, sortBy]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const ext = file.name.split('.').pop()?.toLowerCase();
            if (!['doc', 'docx'].includes(ext || '')) {
                alert('Chỉ chấp nhận file Word (.doc, .docx)!');
                e.target.value = '';
                return;
            }
            let sizeStr = file.size > 1024 * 1024
                ? (file.size / (1024 * 1024)).toFixed(1) + ' MB'
                : (file.size / 1024).toFixed(0) + ' KB';
            const newDoc: WordItem = {
                id: Date.now().toString(),
                name: file.name,
                uploadedDate: todayStr,
                size: sizeStr,
                author: 'Tunas',
                wordCount: Math.floor(Math.random() * 8000) + 500
            };
            setDocuments(prev => [newDoc, ...prev]);
            e.target.value = '';
        }
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa tài liệu Word này?')) {
            setDocuments(prev => prev.filter(d => d.id !== id));
        }
    };

    const handleDownload = (doc: WordItem) => {
        alert(`Bắt đầu tải xuống: ${doc.name}`);
    };

    return (
        <div className="word-container">
            <style>{`
                .word-container {
                    padding: 24px;
                    color: #1f2937;
                    font-family: 'Roboto', 'Inter', sans-serif;
                    box-sizing: border-box;
                    background-color: #f9fafb;
                    min-height: calc(100vh - 10dvh);
                    width: 100%;
                }

                .word-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 24px;
                }

                .word-title-wrap h1 {
                    font-size: 24px;
                    font-weight: 700;
                    color: #111827;
                    margin: 0 0 4px 0;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .word-title-wrap h1 svg { color: #3b82f6; font-size: 28px; }
                .word-title-wrap p { font-size: 14px; color: #6b7280; margin: 0; }

                .word-btn-upload {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background-color: #3b82f6;
                    color: white;
                    border: none;
                    border-radius: 8px;
                    padding: 10px 16px;
                    font-size: 14px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.2), 0 2px 4px -1px rgba(59, 130, 246, 0.1);
                }

                .word-btn-upload:hover {
                    background-color: #2563eb;
                    transform: translateY(-1px);
                    box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.3), 0 4px 6px -2px rgba(59, 130, 246, 0.1);
                }

                .word-btn-upload:active { transform: translateY(0); }

                .word-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 16px;
                    margin-bottom: 24px;
                }

                .word-stat-card {
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

                .word-stat-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05), 0 4px 6px -2px rgba(0,0,0,0.02);
                }

                .word-stat-card.s1 { border-left: 4px solid #3b82f6; }
                .word-stat-card.s2 { border-left: 4px solid #6366f1; }
                .word-stat-card.s3 { border-left: 4px solid #10b981; }
                .word-stat-card.s4 { border-left: 4px solid #f59e0b; }

                .word-card-data { display: flex; flex-direction: column; }
                .word-card-title { font-size: 12px; color: #6b7280; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; }
                .word-card-value { font-size: 24px; font-weight: 700; color: #111827; }

                .word-card-icon {
                    width: 44px; height: 44px; border-radius: 10px;
                    display: flex; align-items: center; justify-content: center;
                }

                .s1 .word-card-icon { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
                .s2 .word-card-icon { background: rgba(99, 102, 241, 0.1); color: #6366f1; }
                .s3 .word-card-icon { background: rgba(16, 185, 129, 0.1); color: #10b981; }
                .s4 .word-card-icon { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }

                .word-section {
                    background: #ffffff;
                    border-radius: 12px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
                    border: 1px solid #e5e7eb;
                    overflow: hidden;
                }

                .word-section-header {
                    padding: 16px 20px;
                    border-bottom: 1px solid #e5e7eb;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    flex-wrap: wrap;
                    gap: 12px;
                }

                .word-section-title { font-size: 16px; font-weight: 700; color: #111827; }

                .word-controls { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; }

                .word-search-wrap { position: relative; display: flex; align-items: center; }

                .word-search-input {
                    padding: 8px 12px 8px 36px;
                    border: 1px solid #d1d5db;
                    border-radius: 8px;
                    font-size: 14px;
                    outline: none;
                    transition: all 0.2s;
                    width: 220px;
                }

                .word-search-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15); }

                .word-search-icon { position: absolute; left: 10px; color: #9ca3af; font-size: 20px; display: flex; align-items: center; }

                .word-sort-select {
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

                .word-sort-select:focus { border-color: #3b82f6; }

                .word-table-wrap { width: 100%; overflow-x: auto; }

                .word-table { width: 100%; border-collapse: collapse; text-align: left; font-size: 14px; }

                .word-table th {
                    background: #f9fafb; padding: 12px 20px; font-weight: 600; color: #4b5563;
                    border-bottom: 1px solid #e5e7eb; text-transform: uppercase; font-size: 11px; letter-spacing: 0.05em;
                }

                .word-table td { padding: 14px 20px; border-bottom: 1px solid #e5e7eb; color: #4b5563; vertical-align: middle; }
                .word-table tr { transition: background 0.15s ease; }
                .word-table tr:hover { background-color: #eff6ff; }

                .word-name-cell { display: flex; align-items: center; font-weight: 500; color: #111827; }
                .word-name-cell svg { color: #3b82f6; font-size: 22px; margin-right: 12px; }

                .word-author-cell { display: flex; align-items: center; }

                .word-avatar {
                    width: 28px; height: 28px; border-radius: 50%;
                    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
                    color: white; font-size: 11px; font-weight: 700;
                    display: inline-flex; align-items: center; justify-content: center; margin-right: 8px;
                }

                .word-badge { background-color: #eff6ff; color: #1e40af; padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: 500; }
                .word-words-badge { background-color: #f3f4f6; color: #374151; padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: 500; }

                .word-actions { display: flex; gap: 6px; }

                .word-btn-action {
                    background: transparent; border: none; cursor: pointer; padding: 6px; border-radius: 6px;
                    color: #9ca3af; display: flex; align-items: center; justify-content: center; transition: all 0.2s;
                }

                .word-btn-action:hover { background-color: #f3f4f6; color: #111827; }
                .word-btn-action.btn-del:hover { background-color: #fee2e2; color: #ef4444; }

                .word-empty { padding: 48px; text-align: center; color: #9ca3af; font-size: 15px; }
            `}</style>

            <div className="word-header">
                <div className="word-title-wrap">
                    <h1><DescriptionIcon /> Quản lý tài liệu Word</h1>
                    <p>Xem, tải lên và quản lý các file Word trong hệ thống</p>
                </div>
                <button className="word-btn-upload" onClick={() => fileInputRef.current?.click()}>
                    <AddIcon fontSize="small" />
                    Tải lên Word
                </button>
                <input type="file" ref={fileInputRef} accept=".doc,.docx" onChange={handleFileChange} style={{ display: 'none' }} />
            </div>

            <div className="word-grid">
                <div className="word-stat-card s1">
                    <div className="word-card-data">
                        <span className="word-card-title">Tổng file Word</span>
                        <span className="word-card-value">{totalFiles}</span>
                    </div>
                    <div className="word-card-icon"><DescriptionIcon /></div>
                </div>
                <div className="word-stat-card s2">
                    <div className="word-card-data">
                        <span className="word-card-title">Tổng số từ</span>
                        <span className="word-card-value">{totalWords.toLocaleString()}</span>
                    </div>
                    <div className="word-card-icon"><EditNoteIcon /></div>
                </div>
                <div className="word-stat-card s3">
                    <div className="word-card-data">
                        <span className="word-card-title">Dung lượng</span>
                        <span className="word-card-value">{totalSize.toFixed(1)} MB</span>
                    </div>
                    <div className="word-card-icon"><StorageIcon /></div>
                </div>
                <div className="word-stat-card s4">
                    <div className="word-card-data">
                        <span className="word-card-title">Tải lên hôm nay</span>
                        <span className="word-card-value">{uploadedToday}</span>
                    </div>
                    <div className="word-card-icon"><CalendarTodayIcon /></div>
                </div>
            </div>

            <div className="word-section">
                <div className="word-section-header">
                    <span className="word-section-title">Danh sách file Word</span>
                    <div className="word-controls">
                        <div className="word-search-wrap">
                            <span className="word-search-icon"><SearchIcon fontSize="small" /></span>
                            <input type="text" className="word-search-input" placeholder="Tìm kiếm tên, tác giả..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                        </div>
                        <select className="word-sort-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
                            <option value="date">Sắp xếp theo ngày</option>
                            <option value="name">Sắp xếp theo tên</option>
                            <option value="size">Sắp xếp theo dung lượng</option>
                            <option value="words">Sắp xếp theo số từ</option>
                        </select>
                    </div>
                </div>

                <div className="word-table-wrap">
                    {filteredDocs.length > 0 ? (
                        <table className="word-table">
                            <thead>
                                <tr>
                                    <th>Tên tài liệu</th>
                                    <th>Ngày tải lên</th>
                                    <th>Dung lượng</th>
                                    <th>Số từ</th>
                                    <th>Tác giả</th>
                                    <th style={{ width: '100px', textAlign: 'center' }}>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredDocs.map(doc => (
                                    <tr key={doc.id}>
                                        <td>
                                            <div className="word-name-cell">
                                                <DescriptionIcon />
                                                <span>{doc.name}</span>
                                            </div>
                                        </td>
                                        <td>{doc.uploadedDate}</td>
                                        <td><span className="word-badge">{doc.size}</span></td>
                                        <td><span className="word-words-badge">{doc.wordCount.toLocaleString()} từ</span></td>
                                        <td>
                                            <div className="word-author-cell">
                                                <div className="word-avatar">{doc.author.split(' ').pop()?.charAt(0) || 'U'}</div>
                                                <span>{doc.author}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="word-actions">
                                                <button className="word-btn-action" title="Tải xuống" onClick={() => handleDownload(doc)}>
                                                    <CloudDownloadIcon fontSize="small" />
                                                </button>
                                                <button className="word-btn-action btn-del" title="Xóa" onClick={() => handleDelete(doc.id)}>
                                                    <DeleteIcon fontSize="small" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="word-empty">Không tìm thấy tài liệu Word phù hợp</div>
                    )}
                </div>
            </div>
        </div>
    );
}