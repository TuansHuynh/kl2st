import { useTitle } from "../../../hooks/useTitle";
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadModal, PreviewModal } from '../../../components';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import StorageIcon from '@mui/icons-material/Storage';
import QuizIcon from '@mui/icons-material/Quiz';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import { documentService } from '../../../service/documentService';
import type { Document } from '../../../types';

interface PDFItem {
    id: string;
    name: string;
    uploadedDate: string;
    size: string;
    author: string;
    pages: number;
    tags: string[];
}

const formatSize = (bytes: number): string => {
    if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / 1024).toFixed(0) + ' KB';
};

const mapDocumentToPDF = (d: Document): PDFItem => ({
    id: d.id,
    name: d.name,
    uploadedDate: d.uploadedDate,
    size: formatSize(d.sizeBytes),
    author: d.authorName || 'Unknown',
    pages: d.pages || 0,
    tags: d.tags || [],
});

export default function PDF() {
    
    const currentUserId = useMemo(() => {
        const stored = localStorage.getItem('currentUser');
        if (stored) {
            try {
                return JSON.parse(stored)?.id || '';
            } catch { return ''; }
        }
        return '';
    }, []);
useTitle("PDF Documents");
    const navigate = useNavigate();

    const [documents, setDocuments] = useState<PDFItem[]>([]);
    const [loading, setLoading] = useState(true);

    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('date');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Upload Modal states
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

    // Preview Modal state
    const [previewDoc, setPreviewDoc] = useState<{ url: string, type: string, name: string, blobType: string } | null>(null);

    // Fetch PDF documents from backend
    useEffect(() => {
        const fetchPDFs = async () => {
            try {
                setLoading(true);
                const data = await documentService.getAllDocuments('pdf', currentUserId);
                setDocuments(data.map(mapDocumentToPDF));
            } catch (err) {
                console.error('Failed to fetch PDFs:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchPDFs();
    }, [currentUserId]);

    const totalFiles = documents.length;
    const totalPages = useMemo(() => documents.reduce((sum, d) => sum + d.pages, 0), [documents]);

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
        else if (sortBy === 'pages') result.sort((a, b) => b.pages - a.pages);
        return result;
    }, [documents, searchQuery, sortBy, currentUserId]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const ext = file.name.split('.').pop()?.toLowerCase();
            if (ext !== 'pdf') {
                alert('Chỉ chấp nhận file PDF!');
                e.target.value = '';
                return;
            }
            setSelectedFile(file);
            setIsUploadModalOpen(true);
            e.target.value = '';
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa tài liệu PDF này?')) {
            try {
                await documentService.deleteDocument(id);
                setDocuments(prev => prev.filter(d => d.id !== id));
            } catch (err) {
                console.error('Delete failed:', err);
                alert('Xóa thất bại!');
            }
        }
    };

    const handleDownload = async (doc: PDFItem) => {
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

    const handlePreview = async (doc: PDFItem) => {
        try {
            const blob = await documentService.downloadDocument(doc.id);
            const url = URL.createObjectURL(blob);
            setPreviewDoc({ url, type: 'pdf', name: doc.name, blobType: blob.type });
        } catch (err) {
            console.error('Open failed:', err);
            alert('Mở tài liệu thất bại!');
        }
    };

    return (
        <div className="pdf-container">
            

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
                                    <th>Tag</th>
                                    <th>Ngày tải lên</th>
                                    <th>Dung lượng</th>
                                    <th>Số trang</th>
                                    <th>Tác giả</th>
                                    <th style={{ width: '120px', textAlign: 'center' }}>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredDocs.map(doc => (
                                    <tr key={doc.id}>
                                        <td>
                                            <div className="pdf-name-cell" onClick={() => handlePreview(doc)} title="Xem trước tài liệu">
                                                <PictureAsPdfIcon />
                                                <span>{doc.name}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="pdf-tags-cell">
                                                {doc.tags.length > 0 ? doc.tags.map(tag => (
                                                    <span key={tag} className={`pdf-tag-badge${tag === 'bài tập trắc nghiệm' ? ' tag-quiz' : ''}`}>
                                                        <LocalOfferIcon style={{ fontSize: 12 }} />
                                                        {tag}
                                                    </span>
                                                )) : <span className="pdf-no-tag">—</span>}
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
                                                {doc.tags.includes('bài tập trắc nghiệm') && (
                                                    <button className="pdf-btn-action btn-quiz" title="Làm bài trắc nghiệm" onClick={() => navigate(`/quiz/${doc.id}`)}>
                                                        <QuizIcon fontSize="small" />
                                                    </button>
                                                )}
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

            <UploadModal
                isOpen={isUploadModalOpen}
                onClose={() => {
                    setIsUploadModalOpen(false);
                    setSelectedFile(null);
                }}
                file={selectedFile}
                onUploadSuccess={(doc) => {
                    setDocuments((prev) => [mapDocumentToPDF(doc), ...prev]);
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