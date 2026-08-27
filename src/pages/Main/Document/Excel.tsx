import { useTitle } from "../../../hooks/useTitle";
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { UploadModal, PreviewModal } from '../../../components';
import TableChartIcon from '@mui/icons-material/TableChart';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import GridOnIcon from '@mui/icons-material/GridOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import StorageIcon from '@mui/icons-material/Storage';
import { documentService } from '../../../service/documentService';
import type { Document } from '../../../types';

interface ExcelItem {
    id: string;
    name: string;
    uploadedDate: string;
    size: string;
    author: string;
    sheets: number;
    rows: number;
}

const formatSize = (bytes: number): string => {
    if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / 1024).toFixed(0) + ' KB';
};

const mapDocumentToExcel = (d: Document): ExcelItem => ({
    id: d.id,
    name: d.name,
    uploadedDate: d.uploadedDate,
    size: formatSize(d.sizeBytes),
    author: d.authorName || 'Unknown',
    sheets: d.sheets || 0,
    rows: d.rows || 0,
});

export default function Excel() {
    
    const currentUserId = useMemo(() => {
        const stored = localStorage.getItem('currentUser');
        if (stored) {
            try {
                return JSON.parse(stored)?.id || '';
            } catch { return ''; }
        }
        return '';
    }, []);
useTitle("Excel Documents");

    const [documents, setDocuments] = useState<ExcelItem[]>([]);
    const [loading, setLoading] = useState(true);

    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('date');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Upload Modal state
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    // Preview Modal state
    const [previewDoc, setPreviewDoc] = useState<{ url: string, type: string, name: string, blobType: string } | null>(null);

    // Fetch Excel documents from backend
    useEffect(() => {
        const fetchExcels = async () => {
            try {
                setLoading(true);
                const data = await documentService.getAllDocuments('excel', currentUserId);
                setDocuments(data.map(mapDocumentToExcel));
            } catch (err) {
                console.error('Failed to fetch Excel documents:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchExcels();
    }, [currentUserId]);

    const totalFiles = documents.length;
    const totalSheets = useMemo(() => documents.reduce((sum, d) => sum + d.sheets, 0), [documents]);
    const totalRows = useMemo(() => documents.reduce((sum, d) => sum + d.rows, 0), [documents]);

    const getMBSize = (sizeStr: string) => {
        const val = parseFloat(sizeStr);
        if (sizeStr.toLowerCase().includes('kb')) return val / 1024;
        return val;
    };

    const totalSize = useMemo(() => documents.reduce((sum, d) => sum + getMBSize(d.size), 0), [documents]);
    const todayStr = new Date().toISOString().split('T')[0];
    const uploadedToday = useMemo(() => documents.filter(d => d.uploadedDate === todayStr).length, [documents]);

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
    }, [documents, searchQuery, sortBy, currentUserId]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const ext = file.name.split('.').pop()?.toLowerCase();
            if (!['xls', 'xlsx', 'csv'].includes(ext || '')) {
                alert('Chỉ chấp nhận file Excel (.xls, .xlsx, .csv)!');
                e.target.value = '';
                return;
            }
            setSelectedFile(file);
            setIsUploadModalOpen(true);
            e.target.value = '';
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa file Excel này?')) {
            try {
                await documentService.deleteDocument(id);
                setDocuments(prev => prev.filter(d => d.id !== id));
            } catch (err) {
                console.error('Delete failed:', err);
                alert('Xóa thất bại!');
            }
        }
    };

    const handleDownload = async (doc: ExcelItem) => {
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

    const handlePreview = async (doc: ExcelItem) => {
        try {
            const blob = await documentService.downloadDocument(doc.id);
            const url = URL.createObjectURL(blob);
            setPreviewDoc({ url, type: 'excel', name: doc.name, blobType: blob.type });
        } catch (err) {
            console.error('Open failed:', err);
            alert('Mở tài liệu thất bại!');
        }
    };

    return (
        <div className="excel-container">
            

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
                                            <div className="excel-name-cell" onClick={() => handlePreview(doc)} title="Mở tài liệu"><TableChartIcon /><span>{doc.name}</span></div>
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

            <UploadModal
                isOpen={isUploadModalOpen}
                onClose={() => {
                    setIsUploadModalOpen(false);
                    setSelectedFile(null);
                }}
                file={selectedFile}
                onUploadSuccess={(doc) => {
                    setDocuments((prev) => [mapDocumentToExcel(doc), ...prev]);
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