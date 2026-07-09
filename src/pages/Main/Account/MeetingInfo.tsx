import { useTitle } from "../../../hooks/useTitle";
import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import VideocamIcon from '@mui/icons-material/Videocam';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import GroupIcon from '@mui/icons-material/Group';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import DeleteIcon from '@mui/icons-material/Delete';
import LaunchIcon from '@mui/icons-material/Launch';
import PersonIcon from '@mui/icons-material/Person';

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

const ALL_SYSTEM_MEMBERS = [
    'Nguyễn Văn A', 'Trần Thị B', 'Lê Văn C', 'Phạm Văn D',
    'Hoàng Văn E', 'Đỗ Thị F', 'Vũ Minh G', 'Bùi Thị H',
    'Cao Văn I', 'Đinh Thị K', 'Tunas'
];

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

export default function MeetingInfo() {
    useTitle("Chi tiết Cuộc họp");
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const meetingId = searchParams.get('id');

    const [meetings, setMeetings] = useState<MeetingItem[]>(() => {
        const saved = localStorage.getItem('meetings');
        return saved ? JSON.parse(saved) : initialMeetings;
    });

    const [newParticipantName, setNewParticipantName] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const currentUserName = 'Tunas';

    const selectedMeeting = useMemo(() => {
        return meetings.find(m => m.id === meetingId) || null;
    }, [meetings, meetingId]);

    // Participants available to add (not already in meeting)
    const availableParticipants = useMemo(() => {
        if (!selectedMeeting) return [];
        return ALL_SYSTEM_MEMBERS.filter(m => !selectedMeeting.participants.includes(m));
    }, [selectedMeeting]);

    // Filtered suggestions based on input
    const filteredSuggestions = useMemo(() => {
        if (!newParticipantName.trim()) return availableParticipants;
        return availableParticipants.filter(m =>
            m.toLowerCase().includes(newParticipantName.toLowerCase())
        );
    }, [newParticipantName, availableParticipants]);

    useEffect(() => {
        localStorage.setItem('meetings', JSON.stringify(meetings));
    }, [meetings]);

    // Change meeting status
    const handleStatusChange = (newStatus: MeetingItem['status']) => {
        if (!selectedMeeting) return;
        setMeetings(prev => prev.map(m => {
            if (m.id !== selectedMeeting.id) return m;
            return { ...m, status: newStatus };
        }));
    };

    const handleJoinMeeting = () => {
        if (!selectedMeeting) return;
        if (selectedMeeting.participants.includes(currentUserName)) {
            alert('Bạn đã tham gia cuộc họp này rồi!');
            return;
        }
        setMeetings(prev => prev.map(m => {
            if (m.id !== selectedMeeting.id) return m;
            return { ...m, participants: [...m.participants, currentUserName] };
        }));
        alert(`Bạn đã đăng ký tham gia cuộc họp "${selectedMeeting.title}" thành công!`);
    };

    const handleAddParticipant = (name?: string) => {
        const participantName = (name || newParticipantName).trim();
        if (!selectedMeeting || !participantName) return;
        if (selectedMeeting.participants.includes(participantName)) {
            alert('Người này đã có trong danh sách tham gia!');
            return;
        }
        setMeetings(prev => prev.map(m => {
            if (m.id !== selectedMeeting.id) return m;
            return { ...m, participants: [...m.participants, participantName] };
        }));
        setNewParticipantName('');
        setShowSuggestions(false);
    };

    const handleRemoveParticipant = (name: string) => {
        if (!selectedMeeting) return;
        if (window.confirm(`Xóa "${name}" khỏi cuộc họp này?`)) {
            setMeetings(prev => prev.map(m => {
                if (m.id !== selectedMeeting.id) return m;
                return { ...m, participants: m.participants.filter(p => p !== name) };
            }));
        }
    };

    const statusOptions: { value: MeetingItem['status']; label: string; bg: string; color: string; dot: string }[] = [
        { value: 'upcoming', label: 'Sắp diễn ra', bg: '#eff6ff', color: '#1e40af', dot: '#3b82f6' },
        { value: 'ongoing', label: 'Đang diễn ra', bg: '#ecfdf5', color: '#065f46', dot: '#10b981' },
        { value: 'completed', label: 'Đã hoàn thành', bg: '#f0fdf4', color: '#166534', dot: '#22c55e' },
        { value: 'cancelled', label: 'Đã hủy', bg: '#fef2f2', color: '#991b1b', dot: '#ef4444' },
    ];

    const getStatusConfig = (status: MeetingItem['status']) => {
        return statusOptions.find(s => s.value === status) || statusOptions[0];
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

    if (!selectedMeeting) {
        return (
            <div className="mtd-detail-view" style={{ padding: 24 }}>
                <div className="mtd-back-bar" style={{ cursor: 'pointer', color: '#6b7280' }} onClick={() => navigate('/meeting')}>
                    <ArrowBackIcon style={{ fontSize: 18, marginRight: 6, verticalAlign: 'middle' }} />
                    Quay lại danh sách cuộc họp
                </div>
                <div style={{ marginTop: 24, textAlign: 'center', color: '#9ca3af' }}>Không tìm thấy cuộc họp tương ứng.</div>
            </div>
        );
    }

    const currentStatus = getStatusConfig(selectedMeeting.status);

    return (
        <div className="mtd-detail-view" style={{ padding: 24 }}>
            <style>{`
                .mtd-back-bar { display: flex; align-items: center; gap: 8px; color: #4b5563; font-weight: 600; font-size: 14px; cursor: pointer; margin-bottom: 20px; transition: color 0.15s; }
                .mtd-back-bar:hover { color: #3b82f6; }
                .mtd-detail-card { background: white; border-radius: 16px; border: 1px solid #e5e7eb; box-shadow: 0 1px 3px rgba(0,0,0,0.05); overflow: hidden; margin-bottom: 24px; font-family: 'Roboto', 'Inter', sans-serif; }
                .mtd-detail-header { padding: 24px; background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%); border-bottom: 1px solid #e5e7eb; }
                .mtd-detail-title-row { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px; }
                .mtd-detail-title { font-size: 22px; font-weight: 800; color: #0c4a6e; margin: 0 0 8px 0; }
                .mtd-detail-desc { font-size: 14px; color: #334155; margin: 0 0 20px 0; max-width: 700px; line-height: 1.6; }
                .mtd-header-meta { display: flex; gap: 20px; flex-wrap: wrap; font-size: 13px; color: #0369a1; font-weight: 500; }
                .mtd-header-meta-item { display: flex; align-items: center; gap: 6px; }
                .mtd-actions-row { display: flex; gap: 12px; margin-top: 16px; flex-wrap: wrap; align-items: center; }
                .mtd-btn-join {
                    display: inline-flex; align-items: center; gap: 8px; background: #3b82f6; color: white; border: none;
                    border-radius: 8px; padding: 10px 18px; font-size: 13px; font-weight: 700; cursor: pointer; transition: all 0.15s;
                    box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.2);
                }
                .mtd-btn-join:hover { background: #2563eb; }
                .mtd-btn-join.joined { background: #e0f2fe; color: #0369a1; cursor: default; box-shadow: none; }
                .mtd-btn-link-action {
                    display: inline-flex; align-items: center; gap: 6px; background: #0284c7; color: white; border: none;
                    border-radius: 8px; padding: 10px 18px; font-size: 13px; font-weight: 700; cursor: pointer; text-decoration: none;
                    transition: all 0.15s; box-shadow: 0 4px 6px -1px rgba(2, 132, 199, 0.2);
                }
                .mtd-btn-link-action:hover { background: #0369a1; }

                .mtd-status-section { display: flex; align-items: center; gap: 12px; margin-top: 16px; padding-top: 16px; border-top: 1px solid rgba(0,0,0,0.08); }
                .mtd-status-label { font-size: 13px; font-weight: 600; color: #0369a1; }
                .mtd-status-pills { display: flex; gap: 6px; flex-wrap: wrap; }
                .mtd-status-pill {
                    display: inline-flex; align-items: center; gap: 5px; padding: 5px 12px; border-radius: 20px;
                    font-size: 12px; font-weight: 600; cursor: pointer; border: 2px solid transparent;
                    transition: all 0.15s;
                }
                .mtd-status-pill:hover { filter: brightness(0.95); }
                .mtd-status-pill.active-pill { border-color: currentColor; box-shadow: 0 2px 6px rgba(0,0,0,0.08); }

                .mtd-detail-body { padding: 24px; display: grid; grid-template-columns: 1fr 340px; gap: 24px; }
                .mtd-participants-section h3 { font-size: 16px; font-weight: 700; color: #111827; margin: 0 0 16px 0; display: flex; align-items: center; gap: 8px; }
                .mtd-participants-list { display: flex; flex-direction: column; gap: 10px; }
                .mtd-participant-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: #f9fafb; border-radius: 10px; border: 1px solid #f3f4f6; }
                .mtd-participant-info { display: flex; align-items: center; gap: 10px; }
                .mtd-participant-avatar-round {
                    width: 32px; height: 32px; border-radius: 50%;
                    background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
                    color: white; font-size: 12px; font-weight: 700; display: flex; align-items: center; justify-content: center;
                }
                .mtd-participant-name-text { font-size: 14px; font-weight: 600; color: #1f2937; }
                .mtd-role-label { font-size: 12px; color: #6b7280; background: #f3f4f6; padding: 2px 8px; border-radius: 8px; }
                .mtd-role-label.organizer { background: #eff6ff; color: #1e40af; font-weight: 600; }
                .mtd-add-participant-card { background: #f9fafb; border-radius: 12px; border: 1px solid #e5e7eb; padding: 20px; height: fit-content; }
                .mtd-add-title { font-size: 14px; font-weight: 700; color: #111827; margin: 0 0 12px 0; display: flex; align-items: center; gap: 6px; }
                .mtd-add-input-wrap { display: flex; gap: 8px; position: relative; }
                .mtd-add-input { flex: 1; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 13px; outline: none; width: 100%; box-sizing: border-box; }
                .mtd-add-input:focus { border-color: #3b82f6; }
                .mtd-add-btn { background: #3b82f6; color: white; border: none; border-radius: 6px; padding: 8px 12px; font-size: 13px; font-weight: 600; cursor: pointer; transition: background 0.15s; flex-shrink: 0; }
                .mtd-add-btn:hover { background: #2563eb; }
                .mt-btn-action { background: transparent; border: none; cursor: pointer; padding: 6px; border-radius: 6px; color: #9ca3af; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
                .mt-btn-action:hover { background-color: #fee2e2; color: #ef4444; }

                .mtd-suggestions-list {
                    position: absolute; top: 100%; left: 0; right: 56px; background: white; border: 1px solid #e5e7eb;
                    border-radius: 8px; box-shadow: 0 8px 16px rgba(0,0,0,0.1); max-height: 200px; overflow-y: auto; z-index: 20; margin-top: 4px;
                }
                .mtd-suggestion-item {
                    display: flex; align-items: center; gap: 10px; padding: 10px 14px; cursor: pointer;
                    font-size: 13px; color: #1f2937; transition: background 0.1s; border-bottom: 1px solid #f3f4f6;
                }
                .mtd-suggestion-item:last-child { border-bottom: none; }
                .mtd-suggestion-item:hover { background: #eff6ff; }
                .mtd-suggestion-avatar { width: 26px; height: 26px; border-radius: 50%; background: #3b82f6; color: white; font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
                .mtd-suggestion-empty { padding: 12px 14px; font-size: 12px; color: #9ca3af; text-align: center; }
                .mtd-section-divider { font-size: 11px; color: #9ca3af; padding: 8px 14px 4px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; background: #f9fafb; }

                @media (max-width: 768px) {
                    .mtd-detail-body { grid-template-columns: 1fr; }
                }
            `}</style>

            <div className="mtd-back-bar" onClick={() => navigate('/meeting')}>
                <ArrowBackIcon style={{ fontSize: 18 }} />
                Quay lại danh sách cuộc họp
            </div>

            <div className="mtd-detail-card">
                <div className="mtd-detail-header">
                    <div className="mtd-detail-title-row">
                        <h2 className="mtd-detail-title">{selectedMeeting.title}</h2>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <span style={{
                                background: currentStatus.bg,
                                color: currentStatus.color,
                                padding: '4px 12px', borderRadius: 12, fontSize: 12, fontWeight: 700,
                                display: 'inline-flex', alignItems: 'center', gap: 5
                            }}>
                                <span style={{ width: 7, height: 7, borderRadius: '50%', background: currentStatus.dot, display: 'inline-block' }}></span>
                                {currentStatus.label}
                            </span>
                            {getTypeBadge(selectedMeeting.type)}
                        </div>
                    </div>
                    <p className="mtd-detail-desc">{selectedMeeting.description}</p>
                    <div className="mtd-header-meta">
                        <div className="mtd-header-meta-item"><CalendarTodayIcon style={{ fontSize: 16 }} /> Ngày: {selectedMeeting.date}</div>
                        <div className="mtd-header-meta-item"><AccessTimeIcon style={{ fontSize: 16 }} /> Thời gian: {selectedMeeting.time} ({selectedMeeting.duration})</div>
                        <div className="mtd-header-meta-item"><VideocamIcon style={{ fontSize: 16 }} /> Ứng dụng/Địa điểm: {selectedMeeting.room}</div>
                    </div>
                    <div className="mtd-actions-row">
                        {selectedMeeting.participants.includes(currentUserName) ? (
                            <button className="mtd-btn-join joined">Bạn đã tham gia cuộc họp</button>
                        ) : (
                            <button className="mtd-btn-join" onClick={handleJoinMeeting}>
                                <GroupAddIcon style={{ fontSize: 18 }} /> Tham gia cuộc họp
                            </button>
                        )}
                        {selectedMeeting.link && (
                            <a href={selectedMeeting.link} target="_blank" rel="noopener noreferrer" className="mtd-btn-link-action">
                                <LaunchIcon style={{ fontSize: 16 }} /> Mở Link Tham gia
                            </a>
                        )}
                    </div>

                    {/* Status Change Section */}
                    <div className="mtd-status-section">
                        <span className="mtd-status-label">Đổi trạng thái:</span>
                        <div className="mtd-status-pills">
                            {statusOptions.map(opt => (
                                <div
                                    key={opt.value}
                                    className={`mtd-status-pill ${selectedMeeting.status === opt.value ? 'active-pill' : ''}`}
                                    style={{ background: opt.bg, color: opt.color }}
                                    onClick={() => handleStatusChange(opt.value)}
                                >
                                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: opt.dot, display: 'inline-block' }}></span>
                                    {opt.label}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mtd-detail-body">
                    <div className="mtd-participants-section">
                        <h3><GroupIcon /> Người tham gia cuộc họp ({selectedMeeting.participants.length})</h3>
                        <div className="mtd-participants-list">
                            {selectedMeeting.participants.map((participant, i) => {
                                const isOrganizer = participant === selectedMeeting.organizer;
                                return (
                                    <div key={i} className="mtd-participant-row">
                                        <div className="mtd-participant-info">
                                            <div className="mtd-participant-avatar-round">
                                                {participant.split(' ').pop()?.charAt(0) || 'U'}
                                            </div>
                                            <span className="mtd-participant-name-text">{participant}</span>
                                            {participant === currentUserName && <span style={{ fontSize: 11, color: '#3b82f6', fontWeight: 600 }}>(Bạn)</span>}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <span className={`mtd-role-label ${isOrganizer ? 'organizer' : ''}`}>
                                                {isOrganizer ? 'Người tổ chức' : 'Tham gia'}
                                            </span>
                                            {!isOrganizer && participant !== currentUserName && (
                                                <button className="mt-btn-action" title="Xóa khỏi cuộc họp" onClick={() => handleRemoveParticipant(participant)}>
                                                    <DeleteIcon style={{ fontSize: 16 }} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="mtd-add-participant-card">
                        <h4 className="mtd-add-title"><PersonAddIcon style={{ fontSize: 16, color: '#3b82f6' }} /> Thêm người tham gia</h4>
                        <p style={{ fontSize: 12, color: '#6b7280', margin: '0 0 12px 0', lineHeight: 1.4 }}>Nhập tên hoặc chọn từ danh sách thành viên hệ thống.</p>
                        <div className="mtd-add-input-wrap">
                            <input
                                type="text"
                                className="mtd-add-input"
                                placeholder="Nhập tên người tham gia..."
                                value={newParticipantName}
                                onChange={e => { setNewParticipantName(e.target.value); setShowSuggestions(true); }}
                                onFocus={() => setShowSuggestions(true)}
                                onKeyDown={e => { if (e.key === 'Enter') handleAddParticipant(); }}
                            />
                            <button className="mtd-add-btn" onClick={() => handleAddParticipant()}>Thêm</button>
                            {showSuggestions && (
                                <div className="mtd-suggestions-list">
                                    {availableParticipants.length > 0 && !newParticipantName.trim() && (
                                        <div className="mtd-section-divider">Thành viên có sẵn trong hệ thống</div>
                                    )}
                                    {filteredSuggestions.length > 0 ? (
                                        filteredSuggestions.map((name, i) => (
                                            <div key={i} className="mtd-suggestion-item" onMouseDown={() => handleAddParticipant(name)}>
                                                <div className="mtd-suggestion-avatar">{name.split(' ').pop()?.charAt(0) || 'U'}</div>
                                                <span>{name}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="mtd-suggestion-empty">
                                            {newParticipantName.trim() ? (
                                                <span>Không tìm thấy — nhấn <b>Thêm</b> hoặc <b>Enter</b> để thêm "{newParticipantName.trim()}"</span>
                                            ) : (
                                                <span>Tất cả thành viên đã tham gia cuộc họp</span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        {/* Click outside to close suggestions */}
                        {showSuggestions && (
                            <div style={{ position: 'fixed', inset: 0, zIndex: 19 }} onClick={() => setShowSuggestions(false)}></div>
                        )}

                        {availableParticipants.length > 0 && (
                            <div style={{ marginTop: 16 }}>
                                <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8, fontWeight: 600 }}>Chọn nhanh:</div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                    {availableParticipants.slice(0, 8).map((name, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleAddParticipant(name)}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: 6,
                                                padding: '5px 10px', border: '1px solid #e5e7eb', borderRadius: 20,
                                                background: 'white', cursor: 'pointer', fontSize: 12, color: '#374151',
                                                transition: 'all 0.15s'
                                            }}
                                            onMouseEnter={e => { (e.target as HTMLElement).style.borderColor = '#3b82f6'; (e.target as HTMLElement).style.background = '#eff6ff'; }}
                                            onMouseLeave={e => { (e.target as HTMLElement).style.borderColor = '#e5e7eb'; (e.target as HTMLElement).style.background = 'white'; }}
                                        >
                                            <PersonIcon style={{ fontSize: 14, color: '#9ca3af' }} />
                                            {name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}