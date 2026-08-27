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
import EditIcon from '@mui/icons-material/Edit';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import { meetingService } from '../../../service/meetingService';
import { accountService } from '../../../service/accountService';
import type { Meeting, User } from '../../../types';

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

const mapMeetingToItem = (m: Meeting): MeetingItem => ({
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

export default function MeetingInfo() {
    useTitle("Chi tiết Cuộc họp");
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const meetingId = searchParams.get('id');

    const [selectedMeeting, setSelectedMeeting] = useState<MeetingItem | null>(null);
    const [systemUsers, setSystemUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    const [newParticipantName, setNewParticipantName] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Edit Modal State
    const [showEditModal, setShowEditModal] = useState(false);
    const [editTitle, setEditTitle] = useState('');
    const [editDesc, setEditDesc] = useState('');
    const [editDate, setEditDate] = useState('');
    const [editTime, setEditTime] = useState('');
    const [editDuration, setEditDuration] = useState('');
    const [editType, setEditType] = useState<'video' | 'inperson' | 'hybrid'>('video');
    const [editRoom, setEditRoom] = useState('');
    const [editLink, setEditLink] = useState('');

    const currentUserName = useMemo(() => {
        const stored = localStorage.getItem('currentUser');
        if (stored) {
            try {
                const u = JSON.parse(stored);
                return u.fullName || 'Nguyễn Văn A';
            } catch {
                return 'Nguyễn Văn A';
            }
        }
        return 'Nguyễn Văn A';
    }, []);

    const canManage = useMemo(() => {
        if (!selectedMeeting) return false;
        return selectedMeeting.organizer === currentUserName || selectedMeeting.coOrganizers.includes(currentUserName);
    }, [selectedMeeting, currentUserName]);

    const isMainOrganizer = useMemo(() => {
        if (!selectedMeeting) return false;
        return selectedMeeting.organizer === currentUserName;
    }, [selectedMeeting, currentUserName]);

    // Fetch meeting details and system users on mount
    useEffect(() => {
        if (!meetingId) return;
        const loadData = async () => {
            try {
                setLoading(true);
                const meeting = await meetingService.getMeetingById(meetingId);
                setSelectedMeeting(mapMeetingToItem(meeting));

                const users = await accountService.getAllAccounts();
                setSystemUsers(users);
            } catch (err) {
                console.error('Failed to load meeting details:', err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [meetingId]);

    const ALL_SYSTEM_MEMBERS = useMemo(() => {
        return systemUsers.map(u => u.fullName);
    }, [systemUsers]);

    // Participants available to add (not already in meeting)
    const availableParticipants = useMemo(() => {
        if (!selectedMeeting) return [];
        return ALL_SYSTEM_MEMBERS.filter(m => !selectedMeeting.participants.includes(m));
    }, [selectedMeeting, ALL_SYSTEM_MEMBERS]);

    // Filtered suggestions based on input
    const filteredSuggestions = useMemo(() => {
        if (!newParticipantName.trim()) return availableParticipants;
        return availableParticipants.filter(m =>
            m.toLowerCase().includes(newParticipantName.toLowerCase())
        );
    }, [newParticipantName, availableParticipants]);

    const handleOpenEdit = () => {
        if (!selectedMeeting) return;
        setEditTitle(selectedMeeting.title);
        setEditDesc(selectedMeeting.description);
        setEditDate(selectedMeeting.date);
        setEditTime(selectedMeeting.time);
        setEditDuration(selectedMeeting.duration);
        setEditType(selectedMeeting.type);
        setEditRoom(selectedMeeting.room);
        setEditLink(selectedMeeting.link || '');
        setShowEditModal(true);
    };

    const handleSaveEdit = async () => {
        if (!editTitle.trim() || !meetingId) return;
        try {
            const payload = {
                title: editTitle,
                description: editDesc,
                meetingDate: editDate,
                meetingTime: editTime ? (editTime.length === 5 ? `${editTime}:00` : editTime) : '10:00:00',
                duration: editDuration,
                type: editType,
                room: editRoom,
                link: (editType === 'video' || editType === 'hybrid') && editLink.trim() ? editLink.trim() : undefined
            };
            const updated = await meetingService.updateMeeting(meetingId, payload);
            setSelectedMeeting(mapMeetingToItem(updated));
            setShowEditModal(false);
        } catch (err) {
            console.error(err);
            alert('Lưu thông tin thất bại!');
        }
    };

    const handleToggleCoOrganizer = async (participantName: string) => {
        if (!selectedMeeting || !meetingId) return;
        const currentMeeting = await meetingService.getMeetingById(meetingId);
        const currentCoIds = currentMeeting.coOrganizers?.map(c => c.id) || [];
        const user = systemUsers.find(u => u.fullName === participantName);
        if (!user) return;
        try {
            let newCoIds: string[];
            if (currentCoIds.includes(user.id)) {
                newCoIds = currentCoIds.filter(id => id !== user.id);
            } else {
                newCoIds = [...currentCoIds, user.id];
            }
            const updated = await meetingService.updateMeeting(meetingId, {
                title: currentMeeting.title,
                meetingDate: currentMeeting.meetingDate,
                meetingTime: currentMeeting.meetingTime,
                coOrganizerIds: newCoIds
            });
            setSelectedMeeting(mapMeetingToItem(updated));
        } catch (err) {
            console.error(err);
            alert('Cập nhật đồng chủ trì thất bại!');
        }
    };

    // Change meeting status
    const handleStatusChange = async (newStatus: MeetingItem['status']) => {
        if (!selectedMeeting || !meetingId) return;
        try {
            const currentMeeting = await meetingService.getMeetingById(meetingId);
            const updated = await meetingService.updateMeeting(meetingId, {
                title: currentMeeting.title,
                meetingDate: currentMeeting.meetingDate,
                meetingTime: currentMeeting.meetingTime,
                status: newStatus
            });
            setSelectedMeeting(mapMeetingToItem(updated));
        } catch (err) {
            console.error('Failed to update meeting status:', err);
        }
    };

    const handleJoinMeeting = async () => {
        if (!selectedMeeting || !meetingId) return;
        if (selectedMeeting.participants.includes(currentUserName)) {
            alert('Bạn đã tham gia cuộc họp này rồi!');
            return;
        }
        const user = systemUsers.find(u => u.fullName === currentUserName);
        if (!user) return;
        try {
            const currentMeeting = await meetingService.getMeetingById(meetingId);
            const participantIds = currentMeeting.participants?.map(p => p.id) || [];
            participantIds.push(user.id);

            const updated = await meetingService.updateMeeting(meetingId, {
                title: currentMeeting.title,
                meetingDate: currentMeeting.meetingDate,
                meetingTime: currentMeeting.meetingTime,
                participantIds
            });
            setSelectedMeeting(mapMeetingToItem(updated));
            alert(`Bạn đã đăng ký tham gia cuộc họp "${selectedMeeting.title}" thành công!`);
        } catch (err) {
            console.error(err);
            alert('Tham gia cuộc họp thất bại!');
        }
    };

    const handleAddParticipant = async (name?: string) => {
        const participantName = (name || newParticipantName).trim();
        if (!selectedMeeting || !participantName || !meetingId) return;
        if (selectedMeeting.participants.includes(participantName)) {
            alert('Người này đã có trong danh sách tham gia!');
            return;
        }
        const user = systemUsers.find(u => u.fullName === participantName);
        if (!user) {
            alert('Thành viên không tồn tại trong hệ thống!');
            return;
        }
        try {
            const currentMeeting = await meetingService.getMeetingById(meetingId);
            const participantIds = currentMeeting.participants?.map(p => p.id) || [];
            participantIds.push(user.id);

            const updated = await meetingService.updateMeeting(meetingId, {
                title: currentMeeting.title,
                meetingDate: currentMeeting.meetingDate,
                meetingTime: currentMeeting.meetingTime,
                participantIds
            });
            setSelectedMeeting(mapMeetingToItem(updated));
            setNewParticipantName('');
            setShowSuggestions(false);
        } catch (err) {
            console.error(err);
            alert('Thêm người tham gia thất bại!');
        }
    };

    const handleRemoveParticipant = async (name: string) => {
        if (!selectedMeeting || !meetingId) return;
        if (window.confirm(`Xóa "${name}" khỏi cuộc họp này?`)) {
            const user = systemUsers.find(u => u.fullName === name);
            if (!user) return;
            try {
                const currentMeeting = await meetingService.getMeetingById(meetingId);
                const participantIds = (currentMeeting.participants?.map(p => p.id) || []).filter(id => id !== user.id);

                const updated = await meetingService.updateMeeting(meetingId, {
                    title: currentMeeting.title,
                    meetingDate: currentMeeting.meetingDate,
                    meetingTime: currentMeeting.meetingTime,
                    participantIds
                });
                setSelectedMeeting(mapMeetingToItem(updated));
            } catch (err) {
                console.error(err);
                alert('Xóa người tham gia thất bại!');
            }
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
                <div className="mtd-back-bar" style={{ cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => navigate('/meeting')}>
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
                        {(selectedMeeting.type === 'video' || selectedMeeting.type === 'hybrid') && selectedMeeting.link && (
                            <a href={selectedMeeting.link} target="_blank" rel="noreferrer" className="mtd-btn-link-action">
                                <LaunchIcon style={{ fontSize: 16 }} /> Vào phòng họp trực tuyến
                            </a>
                        )}
                        {canManage && (
                            <button className="mtd-btn-link-action" style={{ background: '#f59e0b', color: 'var(--bg-secondary)', boxShadow: '0 4px 6px -1px rgba(245, 158, 11, 0.2)' }} onClick={handleOpenEdit}>
                                <EditIcon style={{ fontSize: 16 }} /> Sửa cuộc họp
                            </button>
                        )}
                    </div>

                    {canManage && (
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
                    )}
                </div>

                <div className="mtd-detail-body">
                    <div className="mtd-participants-section">
                        <h3><GroupIcon /> Người tham gia cuộc họp ({selectedMeeting.participants.length})</h3>
                        <div className="mtd-participants-list">
                            {selectedMeeting.participants.map((participant, i) => {
                                const isOrganizer = participant === selectedMeeting.organizer;
                                const isCoOrg = selectedMeeting.coOrganizers.includes(participant);
                                const roleLabel = isOrganizer ? 'Chủ trì' : isCoOrg ? 'Đồng chủ trì' : 'Tham gia';
                                const roleClass = isOrganizer ? 'organizer' : isCoOrg ? 'co-organizer' : '';
                                return (
                                    <div key={i} className="mtd-participant-row">
                                        <div className="mtd-participant-info">
                                            <div className="mtd-participant-avatar-round">
                                                {participant.split(' ').pop()?.charAt(0) || 'U'}
                                            </div>
                                            <span className="mtd-participant-name-text">{participant}</span>
                                            {participant === currentUserName && <span style={{ fontSize: 11, color: '#3b82f6', fontWeight: 600 }}>(Bạn)</span>}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <span className={`mtd-role-label ${roleClass}`}>
                                                {roleLabel}
                                            </span>
                                            {isMainOrganizer && !isOrganizer && (
                                                <button
                                                    className="mt-btn-action"
                                                    title={isCoOrg ? 'Hủy đồng chủ trì' : 'Chỉ định đồng chủ trì'}
                                                    style={{ color: isCoOrg ? '#f59e0b' : '#9ca3af' }}
                                                    onClick={() => handleToggleCoOrganizer(participant)}
                                                >
                                                    {isCoOrg ? <StarIcon style={{ fontSize: 18 }} /> : <StarBorderIcon style={{ fontSize: 18 }} />}
                                                </button>
                                            )}
                                            {canManage && !isOrganizer && !isCoOrg && participant !== currentUserName && (
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

                    {canManage && (
                        <div className="mtd-add-participant-card">
                            <h4 className="mtd-add-title"><PersonAddIcon style={{ fontSize: 16, color: '#3b82f6' }} /> Thêm người tham gia</h4>
                            <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '0 0 12px 0', lineHeight: 1.4 }}>Nhập tên hoặc chọn từ danh sách thành viên hệ thống.</p>
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
                                    <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, fontWeight: 600 }}>Chọn nhanh:</div>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                        {availableParticipants.slice(0, 8).map((name, i) => (
                                            <button
                                                key={i}
                                                onClick={() => handleAddParticipant(name)}
                                                style={{
                                                    display: 'flex', alignItems: 'center', gap: 6,
                                                    padding: '5px 10px', border: '1px solid #e5e7eb', borderRadius: 20,
                                                    background: 'var(--bg-secondary)', cursor: 'pointer', fontSize: 12, color: 'var(--text-secondary)',
                                                    transition: 'all 0.15s'
                                                }}
                                                onMouseEnter={e => { (e.target as HTMLElement).style.borderColor = '#3b82f6'; (e.target as HTMLElement).style.background = '#eff6ff'; }}
                                                onMouseLeave={e => { (e.target as HTMLElement).style.borderColor = 'var(--border-color)'; (e.target as HTMLElement).style.background = 'var(--bg-secondary)'; }}
                                            >
                                                <PersonIcon style={{ fontSize: 14, color: '#9ca3af' }} />
                                                {name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {showEditModal && (
                <div className="mt-modal-overlay" onClick={() => setShowEditModal(false)}>
                    <div className="mt-modal" onClick={e => e.stopPropagation()}>
                        <h2>Sửa cuộc họp</h2>
                        
                        <label className="mt-modal-label">Tiêu đề cuộc họp</label>
                        <input className="mt-modal-input" placeholder="Nhập tiêu đề..." value={editTitle} onChange={e => setEditTitle(e.target.value)} />
                        
                        <label className="mt-modal-label">Mô tả</label>
                        <textarea className="mt-modal-textarea" placeholder="Mô tả cuộc họp..." value={editDesc} onChange={e => setEditDesc(e.target.value)} />
                        
                        <div className="mt-modal-row">
                            <div>
                                <label className="mt-modal-label">Hình thức</label>
                                <select className="mt-modal-select" value={editType} onChange={e => setEditType(e.target.value as MeetingItem['type'])}>
                                    <option value="video">Trực tuyến (Online)</option>
                                    <option value="inperson">Trực tiếp (Offline)</option>
                                    <option value="hybrid">Kết hợp (Hybrid)</option>
                                </select>
                            </div>
                            <div>
                                <label className="mt-modal-label">Thời lượng</label>
                                <input className="mt-modal-input" placeholder="Ví dụ: 1h, 45m, 2h..." value={editDuration} onChange={e => setEditDuration(e.target.value)} />
                            </div>
                        </div>

                        <div className="mt-modal-row">
                            <div>
                                <label className="mt-modal-label">Ngày</label>
                                <input type="date" className="mt-modal-input" value={editDate} onChange={e => setEditDate(e.target.value)} />
                            </div>
                            <div>
                                <label className="mt-modal-label">Giờ</label>
                                <input type="time" className="mt-modal-input" value={editTime} onChange={e => setEditTime(e.target.value)} />
                            </div>
                        </div>

                        <label className="mt-modal-label">Ứng dụng hoặc Phòng họp</label>
                        <input className="mt-modal-input" placeholder="Ví dụ: Zoom, Google Meet, Phòng họp A3..." value={editRoom} onChange={e => setEditRoom(e.target.value)} />

                        {(editType === 'video' || editType === 'hybrid') && (
                            <>
                                <label className="mt-modal-label">Đường dẫn tham gia (Link)</label>
                                <input className="mt-modal-input" placeholder="https://meet.google.com/... hoặc https://zoom.us/..." value={editLink} onChange={e => setEditLink(e.target.value)} />
                            </>
                        )}

                        <div className="mt-modal-actions">
                            <button className="mt-modal-btn-cancel" onClick={() => setShowEditModal(false)}>Hủy</button>
                            <button className="mt-modal-btn-save" onClick={handleSaveEdit}>Lưu thay đổi</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}