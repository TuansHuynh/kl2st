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
}

const initialMeetings: MeetingItem[] = [
    { id: '1', title: 'Sprint Review - Sprint 24', description: 'Review kết quả Sprint 24, demo sản phẩm cho stakeholders', date: '2026-07-09', time: '09:00', duration: '1h30m', organizer: 'Nguyễn Văn A', participants: ['Nguyễn Văn A', 'Lê Văn C', 'Phạm Văn D', 'Trần Thị B'], status: 'upcoming', type: 'video', room: 'Google Meet', link: 'https://meet.google.com/abc-defg-hij' },
    { id: '2', title: 'Họp ban giám đốc Q3', description: 'Thảo luận kế hoạch kinh doanh Q3-2026', date: '2026-07-10', time: '14:00', duration: '2h', organizer: 'Nguyễn Văn A', participants: ['Nguyễn Văn A', 'Trần Thị B', 'Hoàng Văn E'], status: 'upcoming', type: 'inperson', room: 'Phòng họp A3' },
    { id: '3', title: 'Design Review UI/UX', description: 'Review thiết kế giao diện cho module quản lý tài liệu', date: '2026-07-08', time: '10:00', duration: '1h', organizer: 'Phạm Văn D', participants: ['Phạm Văn D', 'Lê Văn C', 'Bùi Thị H'], status: 'completed', type: 'video', room: 'Zoom', link: 'https://zoom.us/j/9876543210' },
    { id: '4', title: 'Daily Standup - Dev Team', description: 'Cập nhật tiến độ công việc hàng ngày', date: '2026-07-08', time: '08:30', duration: '15m', organizer: 'Lê Văn C', participants: ['Lê Văn C', 'Phạm Văn D', 'Vũ Minh G', 'Cao Văn I'], status: 'completed', type: 'video', room: 'Google Meet', link: 'https://meet.google.com/xyz-pdqr-lmn' },
    { id: '5', title: 'Workshop: React Performance', description: 'Workshop chia sẻ kinh nghiệm tối ưu hiệu suất React', date: '2026-07-11', time: '15:00', duration: '2h', organizer: 'Lê Văn C', participants: ['Lê Văn C', 'Phạm Văn D', 'Vũ Minh G', 'Cao Văn I', 'Bùi Thị H', 'Nguyễn Văn A'], status: 'upcoming', type: 'hybrid', room: 'Phòng họp B1 + Zoom', link: 'https://zoom.us/j/1122334455' },
    { id: '6', title: 'Phỏng vấn ứng viên Frontend', description: 'Phỏng vấn vòng 2 cho vị trí Frontend Developer', date: '2026-07-07', time: '14:00', duration: '1h', organizer: 'Đỗ Thị F', participants: ['Đỗ Thị F', 'Lê Văn C'], status: 'completed', type: 'inperson', room: 'Phòng họp A1' },
    { id: '7', title: 'Họp Marketing Campaign', description: 'Lên kế hoạch chiến dịch marketing tháng 8', date: '2026-07-12', time: '10:00', duration: '1h30m', organizer: 'Trần Thị B', participants: ['Trần Thị B', 'Hoàng Văn E', 'Cao Văn I'], status: 'upcoming', type: 'video', room: 'Google Meet', link: 'https://meet.google.com/mkt-camp-2026' },
    { id: '8', title: 'Retrospective Sprint 23', description: 'Đánh giá và cải tiến quy trình làm việc', date: '2026-07-06', time: '16:00', duration: '1h', organizer: 'Nguyễn Văn A', participants: ['Nguyễn Văn A', 'Lê Văn C', 'Phạm Văn D'], status: 'cancelled', type: 'video', room: 'Google Meet', link: 'https://meet.google.com/retro-s23' },
];

export default function Meeting() {
    useTitle("Cuộc họp");
    const navigate = useNavigate();

    const [meetings, setMeetings] = useState<MeetingItem[]>(() => {
        const saved = localStorage.getItem('meetings');
        return saved ? JSON.parse(saved) : initialMeetings;
    });

    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    
    // Add Meeting Form States
    const [showAddModal, setShowAddModal] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newDesc, setNewDesc] = useState('');
    const [newDate, setNewDate] = useState('');
    const [newTime, setNewTime] = useState('');
    const [newDuration, setNewDuration] = useState('1h');
    const [newType, setNewType] = useState<'video' | 'inperson' | 'hybrid'>('video');
    const [newRoom, setNewRoom] = useState('Google Meet');
    const [newLink, setNewLink] = useState('');

    // Persist to localStorage
    useEffect(() => {
        localStorage.setItem('meetings', JSON.stringify(meetings));
    }, [meetings]);

    const totalMeetings = meetings.length;
    const upcomingCount = useMemo(() => meetings.filter(m => m.status === 'upcoming').length, [meetings]);
    const completedCount = useMemo(() => meetings.filter(m => m.status === 'completed').length, [meetings]);
    const todayCount = useMemo(() => meetings.filter(m => m.date === '2026-07-08').length, [meetings]);

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

    const handleDelete = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm('Bạn có chắc chắn muốn xóa cuộc họp này?')) {
            setMeetings(prev => prev.filter(m => m.id !== id));
        }
    };

    const handleAddMeeting = () => {
        if (!newTitle.trim()) return;
        const newMeeting: MeetingItem = {
            id: Date.now().toString(),
            title: newTitle,
            description: newDesc || 'Cuộc họp mới',
            date: newDate || '2026-07-09',
            time: newTime || '10:00',
            duration: newDuration,
            organizer: 'Tunas',
            participants: ['Tunas'],
            status: 'upcoming',
            type: newType,
            room: newRoom,
            link: (newType === 'video' || newType === 'hybrid') && newLink.trim() ? newLink.trim() : undefined
        };
        setMeetings(prev => [newMeeting, ...prev]);
        
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
            <style>{`
                .mt-container {
                    padding: 24px; color: #1f2937; font-family: 'Roboto', 'Inter', sans-serif;
                    box-sizing: border-box; background-color: #f9fafb; min-height: calc(100vh - 10dvh); width: 100%;
                }
                .mt-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
                .mt-title-wrap h1 { font-size: 24px; font-weight: 700; color: #111827; margin: 0 0 4px 0; display: flex; align-items: center; gap: 10px; }
                .mt-title-wrap h1 svg { color: #3b82f6; font-size: 28px; }
                .mt-title-wrap p { font-size: 14px; color: #6b7280; margin: 0; }

                .mt-btn-add {
                    display: flex; align-items: center; gap: 8px;
                    background-color: #3b82f6; color: white; border: none; border-radius: 8px;
                    padding: 10px 16px; font-size: 14px; font-weight: 600; cursor: pointer;
                    transition: all 0.2s ease;
                    box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.2);
                }
                .mt-btn-add:hover { background-color: #2563eb; transform: translateY(-1px); }

                .mt-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px; }
                .mt-stat-card {
                    background: #ffffff; border-radius: 12px; padding: 16px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.05); border: 1px solid #e5e7eb;
                    display: flex; align-items: center; justify-content: space-between;
                    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .mt-stat-card:hover { transform: translateY(-4px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); }
                .mt-stat-card.s1 { border-left: 4px solid #3b82f6; }
                .mt-stat-card.s2 { border-left: 4px solid #f59e0b; }
                .mt-stat-card.s3 { border-left: 4px solid #10b981; }
                .mt-stat-card.s4 { border-left: 4px solid #8b5cf6; }

                .mt-card-data { display: flex; flex-direction: column; }
                .mt-card-title { font-size: 12px; color: #6b7280; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; }
                .mt-card-value { font-size: 24px; font-weight: 700; color: #111827; }
                .mt-card-icon { width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
                .s1 .mt-card-icon { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
                .s2 .mt-card-icon { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
                .s3 .mt-card-icon { background: rgba(16, 185, 129, 0.1); color: #10b981; }
                .s4 .mt-card-icon { background: rgba(139, 92, 246, 0.1); color: #8b5cf6; }

                .mt-controls-bar { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; margin-bottom: 24px; }
                .mt-search-wrap { position: relative; display: flex; align-items: center; flex: 1; min-width: 200px; }
                .mt-search-input { padding: 8px 12px 8px 36px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; outline: none; transition: all 0.2s; width: 100%; }
                .mt-search-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15); }
                .mt-search-icon { position: absolute; left: 10px; color: #9ca3af; font-size: 20px; display: flex; align-items: center; }
                .mt-filter-select { padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; background: white; color: #4b5563; outline: none; cursor: pointer; }

                .mt-meetings-list { display: flex; flex-direction: column; gap: 12px; }
                .mt-meeting-card {
                    background: #ffffff; border-radius: 12px; border: 1px solid #e5e7eb;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.05); padding: 20px;
                    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
                    display: flex; gap: 20px; align-items: flex-start;
                    cursor: pointer;
                }
                .mt-meeting-card:hover { transform: translateY(-2px); box-shadow: 0 8px 15px -3px rgba(0,0,0,0.08); }

                .mt-meeting-time-block {
                    min-width: 80px; text-align: center; padding: 12px 8px;
                    background: #f9fafb; border-radius: 10px; flex-shrink: 0;
                }
                .mt-meeting-date { font-size: 12px; color: #6b7280; font-weight: 500; margin-bottom: 4px; }
                .mt-meeting-time { font-size: 20px; font-weight: 700; color: #111827; }
                .mt-meeting-dur { font-size: 11px; color: #9ca3af; margin-top: 2px; }

                .mt-meeting-content { flex: 1; }
                .mt-meeting-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px; gap: 8px; }
                .mt-meeting-title { font-size: 16px; font-weight: 700; color: #111827; margin: 0; }
                .mt-meeting-badges { display: flex; gap: 6px; flex-shrink: 0; }
                .mt-meeting-desc { font-size: 13px; color: #6b7280; margin-bottom: 12px; line-height: 1.5; }

                .mt-meeting-meta { display: flex; flex-wrap: wrap; gap: 16px; align-items: center; }
                .mt-meta-item { display: flex; align-items: center; gap: 4px; font-size: 12px; color: #6b7280; }
                .mt-meta-item svg { font-size: 15px; color: #9ca3af; }

                .mt-meeting-participants { display: flex; align-items: center; gap: 6px; }
                .mt-participant-avatars { display: flex; }
                .mt-participant-avatar {
                    width: 26px; height: 26px; border-radius: 50%; border: 2px solid white;
                    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
                    color: white; font-size: 10px; font-weight: 700;
                    display: flex; align-items: center; justify-content: center;
                    margin-left: -6px;
                }
                .mt-participant-avatar:first-child { margin-left: 0; }
                .mt-participant-more { font-size: 11px; color: #9ca3af; }

                .mt-meeting-actions { display: flex; gap: 4px; align-items: flex-start; flex-shrink: 0; }
                .mt-btn-action { background: transparent; border: none; cursor: pointer; padding: 6px; border-radius: 6px; color: #9ca3af; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
                .mt-btn-action:hover { background-color: #f3f4f6; color: #111827; }
                .mt-btn-action.btn-del:hover { background-color: #fee2e2; color: #ef4444; }

                .mt-empty { padding: 48px; text-align: center; color: #9ca3af; font-size: 15px; }

                /* Modals */
                .mt-modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(4px); }
                .mt-modal { background: white; border-radius: 16px; padding: 24px; width: 90%; max-width: 500px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); overflow-y: auto; max-height: 90vh; }
                .mt-modal h2 { font-size: 18px; font-weight: 700; margin: 0 0 16px 0; color: #111827; }
                .mt-modal-label { display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 4px; }
                .mt-modal-input { width: 100%; padding: 10px 14px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; outline: none; margin-bottom: 12px; box-sizing: border-box; }
                .mt-modal-input:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15); }
                .mt-modal-select { width: 100%; padding: 10px 14px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; outline: none; margin-bottom: 12px; box-sizing: border-box; background: white; cursor: pointer; }
                .mt-modal-select:focus { border-color: #3b82f6; }
                .mt-modal-textarea { width: 100%; padding: 10px 14px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; outline: none; margin-bottom: 12px; min-height: 80px; resize: vertical; box-sizing: border-box; font-family: inherit; }
                .mt-modal-textarea:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15); }
                .mt-modal-row { display: flex; gap: 12px; }
                .mt-modal-row > * { flex: 1; }
                .mt-modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 4px; }
                .mt-modal-btn-cancel { padding: 8px 16px; border: 1px solid #d1d5db; border-radius: 8px; background: white; color: #4b5563; cursor: pointer; font-size: 14px; font-weight: 500; }
                .mt-modal-btn-cancel:hover { background: #f3f4f6; }
                .mt-modal-btn-save { padding: 8px 16px; border: none; border-radius: 8px; background: #3b82f6; color: white; cursor: pointer; font-size: 14px; font-weight: 600; }
                .mt-modal-btn-save:hover { background: #2563eb; }

                @media (max-width: 640px) {
                    .mt-meeting-card { flex-direction: column; }
                    .mt-meeting-time-block { min-width: auto; width: 100%; }
                }
            `}</style>

            <div className="mt-header">
                <div className="mt-title-wrap">
                    <h1><VideocamIcon /> Quản lý Cuộc họp</h1>
                    <p>Lên lịch, theo dõi và quản lý các cuộc họp trong tổ chức</p>
                </div>
                <button className="mt-btn-add" onClick={() => setShowAddModal(true)}>
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
                                <div className="mt-meeting-actions">
                                    <button className="mt-btn-action btn-del" title="Xóa" onClick={(e) => handleDelete(meeting.id, e)}>
                                        <DeleteIcon style={{ fontSize: 18 }} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="mt-empty">Không tìm thấy cuộc họp phù hợp</div>
            )}

            {showAddModal && (
                <div className="mt-modal-overlay" onClick={() => setShowAddModal(false)}>
                    <div className="mt-modal" onClick={e => e.stopPropagation()}>
                        <h2>Tạo cuộc họp mới</h2>
                        
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
                            <button className="mt-modal-btn-cancel" onClick={() => setShowAddModal(false)}>Hủy</button>
                            <button className="mt-modal-btn-save" onClick={handleAddMeeting}>Tạo cuộc họp</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}