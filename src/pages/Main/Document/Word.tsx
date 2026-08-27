import { useTitle } from "../../../hooks/useTitle";
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadModal, PreviewModal } from '../../../components';
import DescriptionIcon from '@mui/icons-material/Description';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import EditNoteIcon from '@mui/icons-material/EditNote';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import StorageIcon from '@mui/icons-material/Storage';
import QuizIcon from '@mui/icons-material/Quiz';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import { documentService } from '../../../service/documentService';
import type { Document } from '../../../types';

interface WordItem {
    id: string;
    name: string;
    uploadedDate: string;
    size: string;
    author: string;
    wordCount: number;
    tags: string[];
}

const formatSize = (bytes: number): string => {
    if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    return (bytes / 1024).toFixed(0) + ' KB';
};

const mapDocumentToWord = (d: Document): WordItem => ({
    id: d.id,
    name: d.name,
    uploadedDate: d.uploadedDate,
    size: formatSize(d.sizeBytes),
    author: d.authorName || 'Unknown',
    wordCount: d.wordCount || 0,
    tags: d.tags || [],
});

export default function Word() {

    const currentUserId = useMemo(() => {
        const stored = localStorage.getItem('currentUser');
        if (stored) {
            try {
                return JSON.parse(stored)?.id || '';
            } catch { return ''; }
        }
        return '';
    }, []);
    useTitle("Word Documents");
    const navigate = useNavigate();

    const [documents, setDocuments] = useState<WordItem[]>([]);
    const [loading, setLoading] = useState(true);

    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('date');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Upload Modal state
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    // Preview Modal state
    const [previewDoc, setPreviewDoc] = useState<{ url: string, type: string, name: string, blobType: string } | null>(null);

    // Fetch Word documents from backend
    useEffect(() => {
        const fetchWords = async () => {
            try {
                setLoading(true);
                const data = await documentService.getAllDocuments('word', currentUserId);
                setDocuments(data.map(mapDocumentToWord));
            } catch (err) {
                console.error('Failed to fetch Word documents:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchWords();
    }, [currentUserId]);

    const totalFiles = documents.length;
    const totalWords = useMemo(() => documents.reduce((sum, d) => sum + d.wordCount, 0), [documents]);

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
        else if (sortBy === 'wordCount') result.sort((a, b) => b.wordCount - a.wordCount);
        return result;
    }, [documents, searchQuery, sortBy, currentUserId]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const ext = file.name.split('.').pop()?.toLowerCase();
            if (!['doc', 'docx'].includes(ext || '')) {
                alert('Chỉ chấp nhận file Word (.doc, .docx)!');
                e.target.value = '';
                return;
            }
            setSelectedFile(file);
            setIsUploadModalOpen(true);
            e.target.value = '';
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa tài liệu Word này?')) {
            try {
                await documentService.deleteDocument(id);
                setDocuments(prev => prev.filter(d => d.id !== id));
            } catch (err) {
                console.error('Delete failed:', err);
                alert('Xóa thất bại!');
            }
        }
    };

    const handleDownload = async (doc: WordItem) => {
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

    const handlePreview = async (doc: WordItem) => {
        try {
            const blob = await documentService.downloadDocument(doc.id);
            const url = URL.createObjectURL(blob);
            setPreviewDoc({ url, type: 'word', name: doc.name, blobType: blob.type });
        } catch (err) {
            console.error('Open failed:', err);
            alert('Mở tài liệu thất bại!');
        }
    };

    return (
        <div className="word-container">


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
                                    <th>Tag</th>
                                    <th>Ngày tải lên</th>
                                    <th>Dung lượng</th>
                                    <th>Số từ</th>
                                    <th>Tác giả</th>
                                    <th style={{ width: '120px', textAlign: 'center' }}>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredDocs.map(doc => (
                                    <tr key={doc.id}>
                                        <td>
                                            <div className="word-name-cell" onClick={() => handlePreview(doc)} title="Mở tài liệu">
                                                <DescriptionIcon />
                                                <span>{doc.name}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="word-tags-cell">
                                                {doc.tags.length > 0 ? doc.tags.map(tag => (
                                                    <span key={tag} className={`word-tag-badge${tag === 'bài tập trắc nghiệm' ? ' tag-quiz' : ''}`}>
                                                        <LocalOfferIcon style={{ fontSize: 12 }} />
                                                        {tag}
                                                    </span>
                                                )) : <span className="word-no-tag">—</span>}
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
                                                {doc.tags.includes('bài tập trắc nghiệm') && (
                                                    <button className="word-btn-action btn-quiz" title="Làm bài trắc nghiệm" onClick={() => navigate(`/quiz/${doc.id}`)}>
                                                        <QuizIcon fontSize="small" />
                                                    </button>
                                                )}
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

            <UploadModal
                isOpen={isUploadModalOpen}
                onClose={() => {
                    setIsUploadModalOpen(false);
                    setSelectedFile(null);
                }}
                file={selectedFile}
                onUploadSuccess={(doc) => {
                    setDocuments((prev) => [mapDocumentToWord(doc), ...prev]);
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