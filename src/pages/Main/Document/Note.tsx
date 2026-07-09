import { useTitle } from "../../../hooks/useTitle";
import { useState, useMemo } from 'react';
import StickyNote2Icon from '@mui/icons-material/StickyNote2';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import PushPinIcon from '@mui/icons-material/PushPin';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LabelIcon from '@mui/icons-material/Label';


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

export default function Note() {
    useTitle("Ghi chú");

    const [notes, setNotes] = useState<NoteItem[]>([
        { id: '1', title: 'Lịch họp tuần này', content: 'Thứ 2: Họp team dev 9h\nThứ 4: Review sprint 14h\nThứ 6: Họp tổng kết tuần 16h', createdDate: '2026-07-08', updatedDate: '2026-07-08', author: 'Nguyễn Văn A', color: '#fef3c7', pinned: true, tags: ['Công việc', 'Quan trọng'] },
        { id: '2', title: 'Ý tưởng tính năng mới', content: 'Thêm dark mode cho ứng dụng\nTích hợp thông báo realtime\nCải thiện UX trang dashboard', createdDate: '2026-07-07', updatedDate: '2026-07-08', author: 'Trần Thị B', color: '#dbeafe', pinned: true, tags: ['Ý tưởng'] },
        { id: '3', title: 'Danh sách việc cần làm', content: 'Fix bug đăng nhập\nViết unit test cho API\nCập nhật tài liệu kỹ thuật\nDeploy version 2.1', createdDate: '2026-07-06', updatedDate: '2026-07-07', author: 'Lê Văn C', color: '#dcfce7', pinned: false, tags: ['Todo', 'Dev'] },
        { id: '4', title: 'Ghi chú cuộc họp với đối tác', content: 'Thống nhất timeline dự án\nYêu cầu bổ sung tính năng báo cáo\nDeadline giai đoạn 1: cuối tháng 7', createdDate: '2026-07-05', updatedDate: '2026-07-05', author: 'Phạm Văn D', color: '#fce7f3', pinned: false, tags: ['Đối tác', 'Dự án'] },
        { id: '5', title: 'Tài liệu tham khảo API', content: 'Endpoint: /api/v2/documents\nAuth: Bearer token\nRate limit: 100 req/min', createdDate: '2026-07-04', updatedDate: '2026-07-06', author: 'Hoàng Văn E', color: '#f3e8ff', pinned: false, tags: ['Kỹ thuật'] },
        { id: '6', title: 'Quy trình onboarding', content: 'Bước 1: Tạo tài khoản hệ thống\nBước 2: Cấp quyền truy cập\nBước 3: Hướng dẫn sử dụng\nBước 4: Đánh giá sau 1 tuần', createdDate: '2026-07-02', updatedDate: '2026-07-03', author: 'Nguyễn Văn A', color: '#fef3c7', pinned: false, tags: ['HR', 'Quy trình'] },
    ]);

    const [searchQuery, setSearchQuery] = useState('');
    const [filterTag, setFilterTag] = useState('all');
    const [showAddModal, setShowAddModal] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newContent, setNewContent] = useState('');

    const totalNotes = notes.length;
    const pinnedNotes = useMemo(() => notes.filter(n => n.pinned).length, [notes]);
    const allTags = useMemo(() => {
        const tags = new Set<string>();
        notes.forEach(n => n.tags.forEach(t => tags.add(t)));
        return Array.from(tags);
    }, [notes]);

    const todayStr = '2026-07-08';
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
    }, [notes, searchQuery, filterTag]);

    const handleDelete = (id: string) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa ghi chú này?')) {
            setNotes(prev => prev.filter(n => n.id !== id));
        }
    };

    const togglePin = (id: string) => {
        setNotes(prev => prev.map(n => n.id === id ? { ...n, pinned: !n.pinned } : n));
    };

    const handleAddNote = () => {
        if (!newTitle.trim()) return;
        const colors = ['#fef3c7', '#dbeafe', '#dcfce7', '#fce7f3', '#f3e8ff', '#fed7aa'];
        const newNote: NoteItem = {
            id: Date.now().toString(),
            title: newTitle,
            content: newContent,
            createdDate: todayStr,
            updatedDate: todayStr,
            author: 'Tunas',
            color: colors[Math.floor(Math.random() * colors.length)],
            pinned: false,
            tags: ['Mới']
        };
        setNotes(prev => [newNote, ...prev]);
        setNewTitle('');
        setNewContent('');
        setShowAddModal(false);
    };

    return (
        <div className="note-container">
            <style>{`
                .note-container {
                    padding: 24px; color: #1f2937; font-family: 'Roboto', 'Inter', sans-serif;
                    box-sizing: border-box; background-color: #f9fafb; min-height: calc(100vh - 10dvh); width: 100%;
                }
                .note-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
                .note-title-wrap h1 { font-size: 24px; font-weight: 700; color: #111827; margin: 0 0 4px 0; display: flex; align-items: center; gap: 10px; }
                .note-title-wrap h1 svg { color: #eab308; font-size: 28px; }
                .note-title-wrap p { font-size: 14px; color: #6b7280; margin: 0; }

                .note-btn-add {
                    display: flex; align-items: center; gap: 8px;
                    background-color: #eab308; color: white; border: none; border-radius: 8px;
                    padding: 10px 16px; font-size: 14px; font-weight: 600; cursor: pointer;
                    transition: all 0.2s ease;
                    box-shadow: 0 4px 6px -1px rgba(234, 179, 8, 0.2), 0 2px 4px -1px rgba(234, 179, 8, 0.1);
                }
                .note-btn-add:hover { background-color: #ca8a04; transform: translateY(-1px); box-shadow: 0 10px 15px -3px rgba(234, 179, 8, 0.3); }
                .note-btn-add:active { transform: translateY(0); }

                .note-stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px; }

                .note-stat-card {
                    background: #ffffff; border-radius: 12px; padding: 16px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.05); border: 1px solid #e5e7eb;
                    display: flex; align-items: center; justify-content: space-between;
                    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .note-stat-card:hover { transform: translateY(-4px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); }
                .note-stat-card.s1 { border-left: 4px solid #eab308; }
                .note-stat-card.s2 { border-left: 4px solid #ef4444; }
                .note-stat-card.s3 { border-left: 4px solid #3b82f6; }
                .note-stat-card.s4 { border-left: 4px solid #10b981; }

                .note-card-data { display: flex; flex-direction: column; }
                .note-card-title { font-size: 12px; color: #6b7280; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; }
                .note-card-value { font-size: 24px; font-weight: 700; color: #111827; }
                .note-card-icon { width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
                .s1 .note-card-icon { background: rgba(234, 179, 8, 0.1); color: #eab308; }
                .s2 .note-card-icon { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
                .s3 .note-card-icon { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
                .s4 .note-card-icon { background: rgba(16, 185, 129, 0.1); color: #10b981; }

                .note-controls-bar {
                    display: flex; gap: 12px; flex-wrap: wrap; align-items: center; margin-bottom: 24px;
                }
                .note-search-wrap { position: relative; display: flex; align-items: center; flex: 1; min-width: 200px; }
                .note-search-input {
                    padding: 8px 12px 8px 36px; border: 1px solid #d1d5db; border-radius: 8px;
                    font-size: 14px; outline: none; transition: all 0.2s; width: 100%;
                }
                .note-search-input:focus { border-color: #eab308; box-shadow: 0 0 0 3px rgba(234, 179, 8, 0.15); }
                .note-search-icon { position: absolute; left: 10px; color: #9ca3af; font-size: 20px; display: flex; align-items: center; }
                .note-filter-select {
                    padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px;
                    background: white; color: #4b5563; outline: none; cursor: pointer; transition: border-color 0.2s;
                }
                .note-filter-select:focus { border-color: #eab308; }

                .notes-grid-view { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }

                .note-card {
                    border-radius: 12px; padding: 20px; position: relative;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.08); border: 1px solid rgba(0,0,0,0.06);
                    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); cursor: default;
                    min-height: 160px; display: flex; flex-direction: column;
                }
                .note-card:hover { transform: translateY(-4px); box-shadow: 0 10px 20px -5px rgba(0,0,0,0.12); }

                .note-card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; }
                .note-card-header h3 { font-size: 15px; font-weight: 700; color: #111827; margin: 0; flex: 1; }

                .note-pin-btn {
                    background: transparent; border: none; cursor: pointer; padding: 4px;
                    border-radius: 4px; color: #9ca3af; transition: all 0.2s; display: flex;
                }
                .note-pin-btn.pinned { color: #eab308; }
                .note-pin-btn:hover { color: #eab308; }

                .note-card-content {
                    font-size: 13px; color: #4b5563; line-height: 1.6; flex: 1;
                    white-space: pre-line; margin-bottom: 12px; overflow: hidden;
                    display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical;
                }

                .note-card-tags { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px; }
                .note-tag {
                    background: rgba(0,0,0,0.06); color: #374151; padding: 2px 8px;
                    border-radius: 10px; font-size: 11px; font-weight: 500;
                }

                .note-card-footer { display: flex; justify-content: space-between; align-items: center; }
                .note-card-meta { font-size: 11px; color: #9ca3af; }
                .note-card-author {
                    display: flex; align-items: center; gap: 6px; font-size: 12px; color: #6b7280;
                }
                .note-mini-avatar {
                    width: 22px; height: 22px; border-radius: 50%;
                    background: linear-gradient(135deg, #eab308 0%, #ca8a04 100%);
                    color: white; font-size: 9px; font-weight: 700;
                    display: inline-flex; align-items: center; justify-content: center;
                }

                .note-card-actions { display: flex; gap: 4px; }
                .note-btn-action {
                    background: transparent; border: none; cursor: pointer; padding: 4px;
                    border-radius: 6px; color: #9ca3af; display: flex; align-items: center;
                    justify-content: center; transition: all 0.2s;
                }
                .note-btn-action:hover { background-color: rgba(0,0,0,0.06); color: #111827; }
                .note-btn-action.btn-del:hover { background-color: #fee2e2; color: #ef4444; }

                .note-empty { padding: 48px; text-align: center; color: #9ca3af; font-size: 15px; }

                .note-modal-overlay {
                    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0,0,0,0.4); display: flex; align-items: center;
                    justify-content: center; z-index: 1000; backdrop-filter: blur(4px);
                }
                .note-modal {
                    background: white; border-radius: 16px; padding: 24px; width: 90%; max-width: 480px;
                    box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
                }
                .note-modal h2 { font-size: 18px; font-weight: 700; margin: 0 0 16px 0; color: #111827; }
                .note-modal-input {
                    width: 100%; padding: 10px 14px; border: 1px solid #d1d5db; border-radius: 8px;
                    font-size: 14px; outline: none; margin-bottom: 12px; box-sizing: border-box;
                    transition: border-color 0.2s;
                }
                .note-modal-input:focus { border-color: #eab308; box-shadow: 0 0 0 3px rgba(234, 179, 8, 0.15); }
                .note-modal-textarea {
                    width: 100%; padding: 10px 14px; border: 1px solid #d1d5db; border-radius: 8px;
                    font-size: 14px; outline: none; margin-bottom: 16px; min-height: 120px;
                    resize: vertical; box-sizing: border-box; font-family: inherit; transition: border-color 0.2s;
                }
                .note-modal-textarea:focus { border-color: #eab308; box-shadow: 0 0 0 3px rgba(234, 179, 8, 0.15); }
                .note-modal-actions { display: flex; gap: 10px; justify-content: flex-end; }
                .note-modal-btn-cancel {
                    padding: 8px 16px; border: 1px solid #d1d5db; border-radius: 8px;
                    background: white; color: #4b5563; cursor: pointer; font-size: 14px; font-weight: 500;
                    transition: all 0.2s;
                }
                .note-modal-btn-cancel:hover { background: #f3f4f6; }
                .note-modal-btn-save {
                    padding: 8px 16px; border: none; border-radius: 8px;
                    background: #eab308; color: white; cursor: pointer; font-size: 14px; font-weight: 600;
                    transition: all 0.2s;
                }
                .note-modal-btn-save:hover { background: #ca8a04; }
            `}</style>

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
                                <h3>{note.pinned && <PushPinIcon style={{ fontSize: 14, color: '#eab308', marginRight: 4, verticalAlign: 'middle' }} />}{note.title}</h3>
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
        </div>
    );
}