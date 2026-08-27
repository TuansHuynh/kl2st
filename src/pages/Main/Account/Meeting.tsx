import { useTitle } from "../../../hooks/useTitle";
import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import VideocamIcon from '@mui/icons-material/Videocam';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EventIcon from '@mui/icons-material/Event';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import GroupIcon from '@mui/icons-material/Group';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ScheduleIcon from '@mui/icons-material/Schedule';
import EditIcon from '@mui/icons-material/Edit';
import { meetingService } from '../../../service/meetingService';
import type { Meeting as BackendMeeting } from '../../../types';

interface MeetingItem {
    id: string;
    title: string;
    description: string;
    date: string;
    time: string;
    duration: string;
    organizer: string;
    participants: string[];
    status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
    type: 'video' | 'inperson' | 'hybrid';
    room: string;
    link?: string;
    coOrganizers: string[];
}

const mapMeetingToItem = (m: BackendMeeting): MeetingItem => ({
    id: m.id,
    title: m.title,
    description: m.description || '',
    date: m.meetingDate || '',
    time: m.meetingTime ? m.meetingTime.slice(0, 5) : '',
    duration: m.duration || '',
    organizer: m.organizerName || '',
    participants: m.participants?.map(p => p.fullName) || [],
    status: m.status,
    type: m.type,
    room: m.room || '',
    link: m.link || undefined,
    coOrganizers: m.coOrganizers?.map(c => c.fullName) || [],
});

export default function Meeting() {
    useTitle("Cuộc họp");
    const navigate = useNavigate();

    const [meetings, setMeetings] = useState<MeetingItem[]>([]);
    const [loading, setLoading] = useState(true);

    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    
    // Add/Edit Meeting Form States
    const [showAddModal, setShowAddModal] = useState(false);
    const [editMeetingId, setEditMeetingId] = useState<string | null>(null);
    const [newTitle, setNewTitle] = useState('');
    
    const currentUserName = useMemo(() => {
        const stored = localStorage.getItem('currentUser');
        if (stored) {
            try {
                return JSON.parse(stored)?.fullName || '';
            } catch { return ''; }
        }
        return '';
    }, []);
    const [newDesc, setNewDesc] = useState('');
    const [newDate, setNewDate] = useState('');
    const [newTime, setNewTime] = useState('');
    const [newDuration, setNewDuration] = useState('1h');
    const [newType, setNewType] = useState<'video' | 'inperson' | 'hybrid'>('video');
    const [newRoom, setNewRoom] = useState('Google Meet');
    const [newLink, setNewLink] = useState('');

    // Fetch meetings on mount
    useEffect(() => {
        const fetchMeetings = async () => {
            try {
                setLoading(true);
                const data = await meetingService.getAllMeetings();
                setMeetings(data.map(mapMeetingToItem));
            } catch (err) {
                console.error('Failed to fetch meetings:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchMeetings();
    }, []);

    const totalMeetings = meetings.length;
    const upcomingCount = useMemo(() => meetings.filter(m => m.status === 'upcoming').length, [meetings]);
    const completedCount = useMemo(() => meetings.filter(m => m.status === 'completed').length, [meetings]);
    const todayCount = useMemo(() => {
        const todayStr = new Date().toISOString().split('T')[0];
        return meetings.filter(m => m.date === todayStr).length;
    }, [meetings]);

    const filteredMeetings = useMemo(() => {
        let result = meetings.filter(m => {
            const matchesSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                m.organizer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                m.description.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = filterStatus === 'all' || m.status === filterStatus;
            return matchesSearch && matchesStatus;
        });
        // Sort: upcoming first, then by date
        result.sort((a, b) => {
            const statusOrder: Record<string, number> = { ongoing: 0, upcoming: 1, completed: 2, cancelled: 3 };
            const statusDiff = statusOrder[a.status] - statusOrder[b.status];
            if (statusDiff !== 0) return statusDiff;
            return b.date.localeCompare(a.date);
        });
        return result;
    }, [meetings, searchQuery, filterStatus]);

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm('Bạn có chắc chắn muốn xóa cuộc họp này?')) {
            try {
                await meetingService.deleteMeeting(id);
                setMeetings(prev => prev.filter(m => m.id !== id));
            } catch (err) {
                console.error('Failed to delete meeting:', err);
                alert('Xóa cuộc họp thất bại!');
            }
        }
    };

    const handleOpenAdd = () => {
        setEditMeetingId(null);
        setNewTitle('');
        setNewDesc('');
        setNewDate('');
        setNewTime('');
        setNewDuration('1h');
        setNewType('video');
        setNewRoom('Google Meet');
        setNewLink('');
        setShowAddModal(true);
    };

    const handleOpenEdit = (m: MeetingItem, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditMeetingId(m.id);
        setNewTitle(m.title);
        setNewDesc(m.description);
        setNewDate(m.date);
        setNewTime(m.time);
        setNewDuration(m.duration);
        setNewType(m.type);
        setNewRoom(m.room);
        setNewLink(m.link || '');
        setShowAddModal(true);
    };

    const handleSaveMeeting = async () => {
        if (!newTitle.trim()) return;
        try {
            const payload = {
                title: newTitle,
                description: newDesc,
                meetingDate: newDate || new Date().toISOString().split('T')[0],
                meetingTime: newTime ? (newTime.length === 5 ? `${newTime}:00` : newTime) : '10:00:00',
                duration: newDuration,
                type: newType,
                room: newRoom,
                link: (newType === 'video' || newType === 'hybrid') && newLink.trim() ? newLink.trim() : undefined
            };

            if (editMeetingId) {
                const updated = await meetingService.updateMeeting(editMeetingId, payload);
                setMeetings(prev => prev.map(m => m.id === editMeetingId ? mapMeetingToItem(updated) : m));
            } else {
                const created = await meetingService.createMeeting(payload);
                setMeetings(prev => [mapMeetingToItem(created), ...prev]);
            }
            
            // Reset form
            setNewTitle('');
            setNewDesc('');
            setNewDate('');
            setNewTime('');
            setNewDuration('1h');
            setNewType('video');
            setNewRoom('Google Meet');
            setNewLink('');
            
            setShowAddModal(false);
            setEditMeetingId(null);
        } catch (err) {
            console.error('Failed to save meeting:', err);
            alert('Lưu cuộc họp thất bại!');
        }
    };

    const handleCardClick = (id: string) => {
        navigate(`/meeting-info?id=${id}`);
    };

    const getStatusConfig = (status: MeetingItem['status']) => {
        const config: Record<string, { label: string; bg: string; color: string; dot: string }> = {
            upcoming: { label: 'Sắp diễn ra', bg: '#eff6ff', color: '#1e40af', dot: '#3b82f6' },
            ongoing: { label: 'Đang diễn ra', bg: '#ecfdf5', color: '#065f46', dot: '#10b981' },
            completed: { label: 'Đã hoàn thành', bg: '#f0fdf4', color: '#166534', dot: '#22c55e' },
            cancelled: { label: 'Đã hủy', bg: '#fef2f2', color: '#991b1b', dot: '#ef4444' },
        };
        return config[status];
    };

    const getTypeBadge = (type: MeetingItem['type']) => {
        const config: Record<string, { label: string; bg: string; color: string }> = {
            video: { label: 'Trực tuyến', bg: '#eff6ff', color: '#1e40af' },
            inperson: { label: 'Trực tiếp', bg: '#fef3c7', color: '#92400e' },
            hybrid: { label: 'Kết hợp', bg: '#f3e8ff', color: '#6b21a8' },
        };
        const c = config[type];
        return <span style={{ background: c.bg, color: c.color, padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 600 }}>{c.label}</span>;
    };

    return (
        <div className="mt-container">
            

            <div className="mt-header">
                <div className="mt-title-wrap">
                    <h1><VideocamIcon /> Quản lý Cuộc họp</h1>
                    <p>Lên lịch, theo dõi và quản lý các cuộc họp trong tổ chức</p>
                </div>
                <button className="mt-btn-add" onClick={handleOpenAdd}>
                    <AddIcon fontSize="small" />
                    Tạo cuộc họp
                </button>
            </div>

            <div className="mt-stats">
                <div className="mt-stat-card s1">
                    <div className="mt-card-data"><span className="mt-card-title">Tổng cuộc họp</span><span className="mt-card-value">{totalMeetings}</span></div>
                    <div className="mt-card-icon"><EventIcon /></div>
                </div>
                <div className="mt-stat-card s2">
                    <div className="mt-card-data"><span className="mt-card-title">Sắp diễn ra</span><span className="mt-card-value">{upcomingCount}</span></div>
                    <div className="mt-card-icon"><ScheduleIcon /></div>
                </div>
                <div className="mt-stat-card s3">
                    <div className="mt-card-data"><span className="mt-card-title">Đã hoàn thành</span><span className="mt-card-value">{completedCount}</span></div>
                    <div className="mt-card-icon"><CheckCircleIcon /></div>
                </div>
                <div className="mt-stat-card s4">
                    <div className="mt-card-data"><span className="mt-card-title">Họp hôm nay</span><span className="mt-card-value">{todayCount}</span></div>
                    <div className="mt-card-icon"><CalendarTodayIcon /></div>
                </div>
            </div>

            <div className="mt-controls-bar">
                <div className="mt-search-wrap">
                    <span className="tw-search-icon"><SearchIcon fontSize="small" /></span>
                    <input type="text" className="mt-search-input" placeholder="Tìm kiếm cuộc họp..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                </div>
                <select className="mt-filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                    <option value="all">Tất cả trạng thái</option>
                    <option value="upcoming">Sắp diễn ra</option>
                    <option value="ongoing">Đang diễn ra</option>
                    <option value="completed">Đã hoàn thành</option>
                    <option value="cancelled">Đã hủy</option>
                </select>
            </div>

            {filteredMeetings.length > 0 ? (
                <div className="mt-meetings-list">
                    {filteredMeetings.map(meeting => {
                        const sc = getStatusConfig(meeting.status);
                        return (
                            <div key={meeting.id} className="mt-meeting-card" onClick={() => handleCardClick(meeting.id)}>
                                <div className="mt-meeting-time-block">
                                    <div className="mt-meeting-date">{meeting.date}</div>
                                    <div className="mt-meeting-time">{meeting.time}</div>
                                    <div className="mt-meeting-dur">{meeting.duration}</div>
                                </div>
                                <div className="mt-meeting-content">
                                    <div className="mt-meeting-top">
                                        <h3 className="mt-meeting-title">{meeting.title}</h3>
                                        <div className="mt-meeting-badges">
                                            <span style={{ background: sc.bg, color: sc.color, padding: '2px 10px', borderRadius: 12, fontSize: 11, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                                                <span style={{ width: 6, height: 6, borderRadius: '50%', background: sc.dot, display: 'inline-block' }}></span>
                                                {sc.label}
                                            </span>
                                            {getTypeBadge(meeting.type)}
                                        </div>
                                    </div>
                                    <p className="mt-meeting-desc">{meeting.description}</p>
                                    <div className="mt-meeting-meta">
                                        <div className="mt-meta-item"><AccessTimeIcon />{meeting.room}</div>
                                        <div className="mt-meta-item"><GroupIcon />{meeting.participants.length} người tham gia</div>
                                        <div className="mt-meeting-participants">
                                            <div className="mt-participant-avatars">
                                                {meeting.participants.slice(0, 3).map((p, i) => (
                                                    <div key={i} className="mt-participant-avatar" style={{ zIndex: 10 - i }}>
                                                        {p.split(' ').pop()?.charAt(0) || 'U'}
                                                    </div>
                                                ))}
                                            </div>
                                            {meeting.participants.length > 3 && <span className="mt-participant-more">+{meeting.participants.length - 3}</span>}
                                        </div>
                                    </div>
                                </div>
                                {(meeting.organizer === currentUserName || meeting.coOrganizers.includes(currentUserName)) && (
                                    <div className="mt-meeting-actions">
                                        <button className="mt-btn-action btn-edit" title="Sửa" onClick={(e) => handleOpenEdit(meeting, e)}>
                                            <EditIcon style={{ fontSize: 18 }} />
                                        </button>
                                        {meeting.organizer === currentUserName && (
                                            <button className="mt-btn-action btn-del" title="Xóa" onClick={(e) => handleDelete(meeting.id, e)}>
                                                <DeleteIcon style={{ fontSize: 18 }} />
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="mt-empty">Không tìm thấy cuộc họp phù hợp</div>
            )}

            {showAddModal && (
                <div className="mt-modal-overlay" onClick={() => { setShowAddModal(false); setEditMeetingId(null); }}>
                    <div className="mt-modal" onClick={e => e.stopPropagation()}>
                        <h2>{editMeetingId ? 'Sửa cuộc họp' : 'Tạo cuộc họp mới'}</h2>
                        
                        <label className="mt-modal-label">Tiêu đề cuộc họp</label>
                        <input className="mt-modal-input" placeholder="Nhập tiêu đề..." value={newTitle} onChange={e => setNewTitle(e.target.value)} />
                        
                        <label className="mt-modal-label">Mô tả</label>
                        <textarea className="mt-modal-textarea" placeholder="Mô tả cuộc họp..." value={newDesc} onChange={e => setNewDesc(e.target.value)} />
                        
                        <div className="mt-modal-row">
                            <div>
                                <label className="mt-modal-label">Hình thức</label>
                                <select className="mt-modal-select" value={newType} onChange={e => setNewType(e.target.value as MeetingItem['type'])}>
                                    <option value="video">Trực tuyến (Online)</option>
                                    <option value="inperson">Trực tiếp (Offline)</option>
                                    <option value="hybrid">Kết hợp (Hybrid)</option>
                                </select>
                            </div>
                            <div>
                                <label className="mt-modal-label">Thời lượng</label>
                                <input className="mt-modal-input" placeholder="Ví dụ: 1h, 45m, 2h..." value={newDuration} onChange={e => setNewDuration(e.target.value)} />
                            </div>
                        </div>

                        <div className="mt-modal-row">
                            <div>
                                <label className="mt-modal-label">Ngày</label>
                                <input type="date" className="mt-modal-input" value={newDate} onChange={e => setNewDate(e.target.value)} />
                            </div>
                            <div>
                                <label className="mt-modal-label">Giờ</label>
                                <input type="time" className="mt-modal-input" value={newTime} onChange={e => setNewTime(e.target.value)} />
                            </div>
                        </div>

                        <label className="mt-modal-label">Ứng dụng hoặc Phòng họp</label>
                        <input className="mt-modal-input" placeholder="Ví dụ: Zoom, Google Meet, Phòng họp A3..." value={newRoom} onChange={e => setNewRoom(e.target.value)} />

                        {(newType === 'video' || newType === 'hybrid') && (
                            <>
                                <label className="mt-modal-label">Đường dẫn tham gia (Link)</label>
                                <input className="mt-modal-input" placeholder="https://meet.google.com/... hoặc https://zoom.us/..." value={newLink} onChange={e => setNewLink(e.target.value)} />
                            </>
                        )}

                        <div className="mt-modal-actions">
                            <button className="mt-modal-btn-cancel" onClick={() => { setShowAddModal(false); setEditMeetingId(null); }}>Hủy</button>
                            <button className="mt-modal-btn-save" onClick={handleSaveMeeting}>{editMeetingId ? 'Lưu thay đổi' : 'Tạo cuộc họp'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}