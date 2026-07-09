import { useTitle } from "../../../hooks/useTitle";
import React, { useState, useMemo, useRef } from 'react';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SlideshowIcon from '@mui/icons-material/Slideshow';
import CodeIcon from '@mui/icons-material/Code';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import StorageIcon from '@mui/icons-material/Storage';


interface DifferentItem {
    id: string;
    name: string;
    fileType: string;
    category: 'presentation' | 'code' | 'text' | 'other';
    uploadedDate: string;
    size: string;
    author: string;
}

export default function Different() {
    useTitle("Other Files");

    const [documents, setDocuments] = useState<DifferentItem[]>([
        { id: '1', name: 'Slide_thuyet_trinh_dau_tu.pptx', fileType: '.pptx', category: 'presentation', uploadedDate: '2026-07-08', size: '12.0 MB', author: 'Hoàng Văn E' },
        { id: '2', name: 'Config_server_production.yaml', fileType: '.yaml', category: 'code', uploadedDate: '2026-07-07', size: '45 KB', author: 'Nguyễn Văn A' },
        { id: '3', name: 'Readme_huong_dan_cai_dat.md', fileType: '.md', category: 'text', uploadedDate: '2026-07-06', size: '28 KB', author: 'Trần Thị B' },
        { id: '4', name: 'Database_schema_v3.sql', fileType: '.sql', category: 'code', uploadedDate: '2026-07-05', size: '156 KB', author: 'Lê Văn C' },
        { id: '5', name: 'Bao_cao_tong_ket_nam.pptx', fileType: '.pptx', category: 'presentation', uploadedDate: '2026-07-04', size: '24.5 MB', author: 'Phạm Văn D' },
        { id: '6', name: 'Env_variables_staging.env', fileType: '.env', category: 'code', uploadedDate: '2026-07-02', size: '8 KB', author: 'Nguyễn Văn A' },
        { id: '7', name: 'Ghi_chu_ca_nhan.txt', fileType: '.txt', category: 'text', uploadedDate: '2026-07-01', size: '12 KB', author: 'Hoàng Văn E' },
        { id: '8', name: 'Fonts_du_an.otf', fileType: '.otf', category: 'other', uploadedDate: '2026-06-28', size: '2.1 MB', author: 'Phạm Văn D' },
        { id: '9', name: 'Export_analytics_dashboard.json', fileType: '.json', category: 'code', uploadedDate: '2026-06-25', size: '380 KB', author: 'Trần Thị B' },
    ]);

    const [searchQuery, setSearchQuery] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const fileInputRef = useRef<HTMLInputElement>(null);

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
    }, [documents, searchQuery, filterCategory]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const ext = '.' + (file.name.split('.').pop()?.toLowerCase() || '');
            let category: DifferentItem['category'] = 'other';
            if (['.pptx', '.ppt', '.key'].includes(ext)) category = 'presentation';
            else if (['.js', '.ts', '.py', '.java', '.sql', '.yaml', '.yml', '.json', '.xml', '.env', '.sh'].includes(ext)) category = 'code';
            else if (['.txt', '.md', '.rtf', '.log'].includes(ext)) category = 'text';

            let sizeStr = file.size > 1024 * 1024
                ? (file.size / (1024 * 1024)).toFixed(1) + ' MB'
                : (file.size / 1024).toFixed(0) + ' KB';

            const newDoc: DifferentItem = {
                id: Date.now().toString(),
                name: file.name,
                fileType: ext,
                category,
                uploadedDate: '2026-07-08',
                size: sizeStr,
                author: 'Tunas'
            };
            setDocuments(prev => [newDoc, ...prev]);
            e.target.value = '';
        }
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa file này?')) {
            setDocuments(prev => prev.filter(d => d.id !== id));
        }
    };

    const handleDownload = (doc: DifferentItem) => {
        alert(`Bắt đầu tải xuống: ${doc.name}`);
    };

    const getCategoryIcon = (category: DifferentItem['category']) => {
        switch (category) {
            case 'presentation': return <SlideshowIcon style={{ color: '#f97316' }} />;
            case 'code': return <CodeIcon style={{ color: '#06b6d4' }} />;
            case 'text': return <TextSnippetIcon style={{ color: '#6b7280' }} />;
            default: return <InsertDriveFileIcon style={{ color: '#9ca3af' }} />;
        }
    };

    const getCategoryBadge = (category: DifferentItem['category']) => {
        const labels: Record<string, { label: string; bg: string; color: string }> = {
            presentation: { label: 'Thuyết trình', bg: '#fff7ed', color: '#9a3412' },
            code: { label: 'Code / Config', bg: '#ecfeff', color: '#155e75' },
            text: { label: 'Văn bản', bg: '#f9fafb', color: '#374151' },
            other: { label: 'Khác', bg: '#f3f4f6', color: '#6b7280' },
        };
        const c = labels[category];
        return <span style={{ background: c.bg, color: c.color, padding: '2px 10px', borderRadius: 12, fontSize: 12, fontWeight: 500 }}>{c.label}</span>;
    };

    return (
        <div className="diff-container">
            <style>{`
                .diff-container {
                    padding: 24px; color: #1f2937; font-family: 'Roboto', 'Inter', sans-serif;
                    box-sizing: border-box; background-color: #f9fafb; min-height: calc(100vh - 10dvh); width: 100%;
                }
                .diff-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
                .diff-title-wrap h1 { font-size: 24px; font-weight: 700; color: #111827; margin: 0 0 4px 0; display: flex; align-items: center; gap: 10px; }
                .diff-title-wrap h1 svg { color: #6b7280; font-size: 28px; }
                .diff-title-wrap p { font-size: 14px; color: #6b7280; margin: 0; }

                .diff-btn-upload {
                    display: flex; align-items: center; gap: 8px;
                    background-color: #6366f1; color: white; border: none; border-radius: 8px;
                    padding: 10px 16px; font-size: 14px; font-weight: 600; cursor: pointer;
                    transition: all 0.2s ease;
                    box-shadow: 0 4px 6px -1px rgba(99, 102, 241, 0.2), 0 2px 4px -1px rgba(99, 102, 241, 0.1);
                }
                .diff-btn-upload:hover { background-color: #4f46e5; transform: translateY(-1px); box-shadow: 0 10px 15px -3px rgba(99, 102, 241, 0.3); }
                .diff-btn-upload:active { transform: translateY(0); }

                .diff-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px; }

                .diff-stat-card {
                    background: #ffffff; border-radius: 12px; padding: 16px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.05); border: 1px solid #e5e7eb;
                    display: flex; align-items: center; justify-content: space-between;
                    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .diff-stat-card:hover { transform: translateY(-4px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); }
                .diff-stat-card.s1 { border-left: 4px solid #6366f1; }
                .diff-stat-card.s2 { border-left: 4px solid #f97316; }
                .diff-stat-card.s3 { border-left: 4px solid #06b6d4; }
                .diff-stat-card.s4 { border-left: 4px solid #10b981; }

                .diff-card-data { display: flex; flex-direction: column; }
                .diff-card-title { font-size: 12px; color: #6b7280; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; }
                .diff-card-value { font-size: 24px; font-weight: 700; color: #111827; }
                .diff-card-icon { width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
                .s1 .diff-card-icon { background: rgba(99, 102, 241, 0.1); color: #6366f1; }
                .s2 .diff-card-icon { background: rgba(249, 115, 22, 0.1); color: #f97316; }
                .s3 .diff-card-icon { background: rgba(6, 182, 212, 0.1); color: #06b6d4; }
                .s4 .diff-card-icon { background: rgba(16, 185, 129, 0.1); color: #10b981; }

                .diff-section { background: #ffffff; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); border: 1px solid #e5e7eb; overflow: hidden; }
                .diff-section-header { padding: 16px 20px; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }
                .diff-section-title { font-size: 16px; font-weight: 700; color: #111827; }
                .diff-controls { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; }
                .diff-search-wrap { position: relative; display: flex; align-items: center; }
                .diff-search-input { padding: 8px 12px 8px 36px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; outline: none; transition: all 0.2s; width: 220px; }
                .diff-search-input:focus { border-color: #6366f1; box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15); }
                .diff-search-icon { position: absolute; left: 10px; color: #9ca3af; font-size: 20px; display: flex; align-items: center; }
                .diff-filter-select { padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; background: white; color: #4b5563; outline: none; cursor: pointer; transition: border-color 0.2s; }
                .diff-filter-select:focus { border-color: #6366f1; }

                .diff-table-wrap { width: 100%; overflow-x: auto; }
                .diff-table { width: 100%; border-collapse: collapse; text-align: left; font-size: 14px; }
                .diff-table th { background: #f9fafb; padding: 12px 20px; font-weight: 600; color: #4b5563; border-bottom: 1px solid #e5e7eb; text-transform: uppercase; font-size: 11px; letter-spacing: 0.05em; }
                .diff-table td { padding: 14px 20px; border-bottom: 1px solid #e5e7eb; color: #4b5563; vertical-align: middle; }
                .diff-table tr { transition: background 0.15s ease; }
                .diff-table tr:hover { background-color: #eef2ff; }

                .diff-name-cell { display: flex; align-items: center; font-weight: 500; color: #111827; }
                .diff-name-cell svg { font-size: 22px; margin-right: 12px; }
                .diff-author-cell { display: flex; align-items: center; }
                .diff-avatar { width: 28px; height: 28px; border-radius: 50%; background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: white; font-size: 11px; font-weight: 700; display: inline-flex; align-items: center; justify-content: center; margin-right: 8px; }
                .diff-size-badge { background-color: #eef2ff; color: #3730a3; padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: 500; }
                .diff-type-badge { background-color: #f3f4f6; color: #374151; padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: 600; font-family: monospace; }

                .diff-actions { display: flex; gap: 6px; }
                .diff-btn-action { background: transparent; border: none; cursor: pointer; padding: 6px; border-radius: 6px; color: #9ca3af; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
                .diff-btn-action:hover { background-color: #f3f4f6; color: #111827; }
                .diff-btn-action.btn-del:hover { background-color: #fee2e2; color: #ef4444; }
                .diff-empty { padding: 48px; text-align: center; color: #9ca3af; font-size: 15px; }
            `}</style>

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
                                        <td><div className="diff-name-cell">{getCategoryIcon(doc.category)}<span>{doc.name}</span></div></td>
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
        </div>
    );
}