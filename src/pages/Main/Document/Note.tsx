import { useTitle } from "../../../hooks/useTitle";
import { useState, useMemo, useEffect } from 'react';
import { PreviewModal } from '../../../components';
import StickyNote2Icon from '@mui/icons-material/StickyNote2';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import PushPinIcon from '@mui/icons-material/PushPin';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LabelIcon from '@mui/icons-material/Label';
import { documentService } from '../../../service/documentService';
import type { Document } from '../../../types';

interface NoteItem {
    id: string;
    title: string;
    content: string;
    createdDate: string;
    updatedDate: string;
    author: string;
    color: string;
    pinned: boolean;
    tags: string[];
}

const mapDocumentToNote = (d: Document): NoteItem => ({
    id: d.id,
    title: d.name,
    content: d.content || '',
    createdDate: d.uploadedDate,
    updatedDate: d.uploadedDate,
    author: d.authorName || 'Unknown',
    color: d.color || 'var(--bg-secondary)',
    pinned: d.pinned || false,
    tags: d.tags ? Array.from(d.tags) : [],
});

export default function Note() {
    
    const currentUserId = useMemo(() => {
        const stored = localStorage.getItem('currentUser');
        if (stored) {
            try {
                return JSON.parse(stored)?.id || '';
            } catch { return ''; }
        }
        return '';
    }, []);
useTitle("Ghi chú");

    const [notes, setNotes] = useState<NoteItem[]>([]);
    const [loading, setLoading] = useState(true);

    const [searchQuery, setSearchQuery] = useState('');
    const [filterTag, setFilterTag] = useState('all');
    const [showAddModal, setShowAddModal] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newContent, setNewContent] = useState('');
    const [previewDoc, setPreviewDoc] = useState<{ url: string, type: string, name: string, blobType: string } | null>(null);

    // Fetch notes on mount
    useEffect(() => {
        const fetchNotes = async () => {
            try {
                setLoading(true);
                const data = await documentService.getAllDocuments('note', currentUserId);
                setNotes(data.map(mapDocumentToNote));
            } catch (err) {
                console.error('Failed to fetch notes:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchNotes();
    }, [currentUserId]);

    const totalNotes = notes.length;
    const pinnedNotes = useMemo(() => notes.filter(n => n.pinned).length, [notes]);
    const allTags = useMemo(() => {
        const tags = new Set<string>();
        notes.forEach(n => n.tags.forEach(t => tags.add(t)));
        return Array.from(tags);
    }, [notes, currentUserId]);

    const todayStr = new Date().toISOString().split('T')[0];
    const updatedToday = useMemo(() => notes.filter(n => n.updatedDate === todayStr).length, [notes]);

    const filteredNotes = useMemo(() => {
        let result = notes.filter(n => {
            const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                n.author.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesTag = filterTag === 'all' || n.tags.includes(filterTag);
            return matchesSearch && matchesTag;
        });
        // Pinned notes first
        result.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
        return result;
    }, [notes, searchQuery, filterTag, currentUserId]);

    const handleDelete = async (id: string) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa ghi chú này?')) {
            try {
                await documentService.deleteDocument(id);
                setNotes(prev => prev.filter(n => n.id !== id));
            } catch (err) {
                console.error('Delete failed:', err);
                alert('Xóa thất bại!');
            }
        }
    };

    const togglePin = (id: string) => {
        setNotes(prev => prev.map(n => n.id === id ? { ...n, pinned: !n.pinned } : n));
    };

    const handlePreview = async (doc: NoteItem) => {
        try {
            const blob = await documentService.downloadDocument(doc.id);
            const url = URL.createObjectURL(blob);
            setPreviewDoc({ url, type: 'note', name: doc.title, blobType: blob.type });
        } catch (err) {
            console.error('Open failed:', err);
            alert('Mở ghi chú thất bại!');
        }
    };

    const handleAddNote = async () => {
        if (!newTitle.trim()) return;
        const colors = ['#fef3c7', '#dbeafe', '#dcfce7', '#fce7f3', '#f3e8ff', '#fed7aa'];
        try {
            const created = await documentService.createDocument({
                name: newTitle,
                type: 'note',
                content: newContent,
                sizeBytes: new Blob([newContent]).size,
                color: colors[Math.floor(Math.random() * colors.length)],
                pinned: false,
                tags: ['Mới']
            });
            setNotes(prev => [mapDocumentToNote(created), ...prev]);
            setNewTitle('');
            setNewContent('');
            setShowAddModal(false);
        } catch (err) {
            console.error('Create note failed:', err);
            alert('Tạo ghi chú thất bại!');
        }
    };

    return (
        <div className="note-container">
            

            <div className="note-header">
                <div className="note-title-wrap">
                    <h1><StickyNote2Icon /> Quản lý Ghi chú</h1>
                    <p>Tạo, quản lý và tổ chức ghi chú cá nhân</p>
                </div>
                <button className="note-btn-add" onClick={() => setShowAddModal(true)}>
                    <AddIcon fontSize="small" />
                    Tạo ghi chú mới
                </button>
            </div>

            <div className="note-stats-grid">
                <div className="note-stat-card s1">
                    <div className="note-card-data"><span className="note-card-title">Tổng ghi chú</span><span className="note-card-value">{totalNotes}</span></div>
                    <div className="note-card-icon"><StickyNote2Icon /></div>
                </div>
                <div className="note-stat-card s2">
                    <div className="note-card-data"><span className="note-card-title">Đã ghim</span><span className="note-card-value">{pinnedNotes}</span></div>
                    <div className="note-card-icon"><PushPinIcon /></div>
                </div>
                <div className="note-stat-card s3">
                    <div className="note-card-data"><span className="note-card-title">Tổng thẻ tag</span><span className="note-card-value">{allTags.length}</span></div>
                    <div className="note-card-icon"><LabelIcon /></div>
                </div>
                <div className="note-stat-card s4">
                    <div className="note-card-data"><span className="note-card-title">Cập nhật hôm nay</span><span className="note-card-value">{updatedToday}</span></div>
                    <div className="note-card-icon"><CalendarTodayIcon /></div>
                </div>
            </div>

            <div className="note-controls-bar">
                <div className="note-search-wrap">
                    <span className="note-search-icon"><SearchIcon fontSize="small" /></span>
                    <input type="text" className="note-search-input" placeholder="Tìm kiếm ghi chú..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                </div>
                <select className="note-filter-select" value={filterTag} onChange={e => setFilterTag(e.target.value)}>
                    <option value="all">Tất cả thẻ</option>
                    {allTags.map(tag => <option key={tag} value={tag}>{tag}</option>)}
                </select>
            </div>

            {filteredNotes.length > 0 ? (
                <div className="notes-grid-view">
                    {filteredNotes.map(note => (
                        <div key={note.id} className="note-card" style={{ backgroundColor: note.color }}>
                            <div className="note-card-header">
                                <h3 onClick={() => handlePreview(note)} title="Mở nội dung ghi chú">{note.pinned && <PushPinIcon style={{ fontSize: 14, color: '#eab308', marginRight: 4, verticalAlign: 'middle' }} />}{note.title}</h3>
                                <button className={`note-pin-btn ${note.pinned ? 'pinned' : ''}`} onClick={() => togglePin(note.id)} title={note.pinned ? 'Bỏ ghim' : 'Ghim'}>
                                    <PushPinIcon style={{ fontSize: 16 }} />
                                </button>
                            </div>
                            <div className="note-card-content">{note.content}</div>
                            <div className="note-card-tags">
                                {note.tags.map(tag => <span key={tag} className="note-tag">{tag}</span>)}
                            </div>
                            <div className="note-card-footer">
                                <div className="note-card-author">
                                    <div className="note-mini-avatar">{note.author.split(' ').pop()?.charAt(0) || 'U'}</div>
                                    <span>{note.author}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span className="note-card-meta">{note.updatedDate}</span>
                                    <div className="note-card-actions">
                                        <button className="note-btn-action btn-del" title="Xóa" onClick={() => handleDelete(note.id)}><DeleteIcon style={{ fontSize: 16 }} /></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="note-empty">Không tìm thấy ghi chú phù hợp</div>
            )}

            {showAddModal && (
                <div className="note-modal-overlay" onClick={() => setShowAddModal(false)}>
                    <div className="note-modal" onClick={e => e.stopPropagation()}>
                        <h2>Tạo ghi chú mới</h2>
                        <input className="note-modal-input" placeholder="Tiêu đề ghi chú..." value={newTitle} onChange={e => setNewTitle(e.target.value)} />
                        <textarea className="note-modal-textarea" placeholder="Nội dung ghi chú..." value={newContent} onChange={e => setNewContent(e.target.value)} />
                        <div className="note-modal-actions">
                            <button className="note-modal-btn-cancel" onClick={() => setShowAddModal(false)}>Hủy</button>
                            <button className="note-modal-btn-save" onClick={handleAddNote}>Lưu ghi chú</button>
                        </div>
                    </div>
                </div>
            )}

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