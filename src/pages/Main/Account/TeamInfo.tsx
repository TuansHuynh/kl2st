import { useTitle } from "../../../hooks/useTitle";
import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import GroupIcon from '@mui/icons-material/Group';
import FolderSharedIcon from '@mui/icons-material/FolderShared';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import DeleteIcon from '@mui/icons-material/Delete';
import PersonIcon from '@mui/icons-material/Person';
import { teamService } from '../../../service/teamService';
import { accountService } from '../../../service/accountService';
import type { Team, User } from '../../../types';

interface TeamItem {
    id: string;
    name: string;
    description: string;
    leader: string;
    memberCount: number;
    projectCount: number;
    status: 'active' | 'archived';
    createdDate: string;
    color: string;
    members: string[];
}

const mapTeamToItem = (t: Team): TeamItem => ({
    id: t.id,
    name: t.name,
    description: t.description || '',
    leader: t.leaderName || '',
    memberCount: t.members?.length || 0,
    projectCount: t.projectCount || 0,
    status: t.status,
    createdDate: t.createdDate || '',
    color: t.color || '#4f46e5',
    members: t.members?.map(m => m.fullName) || [],
});

export default function TeamInfo() {
    useTitle("Chi tiết Nhóm");
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const teamId = searchParams.get('id');

    const [selectedTeam, setSelectedTeam] = useState<TeamItem | null>(null);
    const [systemUsers, setSystemUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    const [newMemberName, setNewMemberName] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
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

    // Fetch team details and all system users
    useEffect(() => {
        if (!teamId) return;
        const loadData = async () => {
            try {
                setLoading(true);
                const team = await teamService.getTeamById(teamId);
                setSelectedTeam(mapTeamToItem(team));

                const users = await accountService.getAllAccounts();
                setSystemUsers(users);
            } catch (err) {
                console.error('Failed to load team info:', err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [teamId]);

    const ALL_SYSTEM_MEMBERS = useMemo(() => {
        return systemUsers.map(u => u.fullName);
    }, [systemUsers]);

    // Members available to add (not already in team)
    const availableMembers = useMemo(() => {
        if (!selectedTeam) return [];
        return ALL_SYSTEM_MEMBERS.filter(m => !selectedTeam.members.includes(m));
    }, [selectedTeam, ALL_SYSTEM_MEMBERS]);

    // Filtered suggestions based on input
    const filteredSuggestions = useMemo(() => {
        if (!newMemberName.trim()) return availableMembers;
        return availableMembers.filter(m =>
            m.toLowerCase().includes(newMemberName.toLowerCase())
        );
    }, [newMemberName, availableMembers]);

    const handleJoinTeam = async () => {
        if (!selectedTeam || !teamId) return;
        if (selectedTeam.members.includes(currentUserName)) {
            alert('Bạn đã là thành viên của nhóm này rồi!');
            return;
        }
        // Find current user's id
        const user = systemUsers.find(u => u.fullName === currentUserName);
        if (!user) return;
        try {
            const updated = await teamService.addMember(teamId, user.id);
            setSelectedTeam(mapTeamToItem(updated));
            alert(`Bạn đã tham gia nhóm "${selectedTeam.name}" thành công!`);
        } catch (err) {
            console.error(err);
            alert('Tham gia nhóm thất bại!');
        }
    };

    const handleAddMember = async (name?: string) => {
        const memberName = (name || newMemberName).trim();
        if (!selectedTeam || !memberName || !teamId) return;
        if (selectedTeam.members.includes(memberName)) {
            alert('Thành viên này đã tồn tại trong nhóm!');
            return;
        }
        const user = systemUsers.find(u => u.fullName === memberName);
        if (!user) {
            alert('Thành viên không tồn tại trong hệ thống!');
            return;
        }
        try {
            const updated = await teamService.addMember(teamId, user.id);
            setSelectedTeam(mapTeamToItem(updated));
            setNewMemberName('');
            setShowSuggestions(false);
        } catch (err) {
            console.error(err);
            alert('Thêm thành viên thất bại!');
        }
    };

    const handleRemoveMember = async (memberName: string) => {
        if (!selectedTeam || !teamId) return;
        if (window.confirm(`Bạn có chắc muốn xóa thành viên "${memberName}" khỏi nhóm?`)) {
            const user = systemUsers.find(u => u.fullName === memberName);
            if (!user) return;
            try {
                const updated = await teamService.removeMember(teamId, user.id);
                setSelectedTeam(mapTeamToItem(updated));
            } catch (err) {
                console.error(err);
                alert('Xóa thành viên thất bại!');
            }
        }
    };

    if (!selectedTeam) {
        return (
            <div className="twd-detail-view" style={{ padding: 24 }}>
                <div className="twd-back-bar" style={{ cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => navigate('/team')}>
                    <ArrowBackIcon style={{ fontSize: 18, marginRight: 6, verticalAlign: 'middle' }} />
                    Quay lại danh sách nhóm
                </div>
                <div style={{ marginTop: 24, textAlign: 'center', color: '#9ca3af' }}>Không tìm thấy nhóm tương ứng.</div>
            </div>
        );
    }

    return (
        <div className="twd-detail-view" style={{ padding: 24 }}>
            

            <div className="twd-back-bar" onClick={() => navigate('/team')}>
                <ArrowBackIcon style={{ fontSize: 18 }} />
                Quay lại danh sách nhóm
            </div>

            <div className="twd-detail-card">
                <div className="twd-detail-header">
                    <div className="twd-detail-banner-overlay" style={{ background: selectedTeam.color }}></div>
                    <div className="twd-detail-header-content">
                        <div className="twd-detail-title-row">
                            <h2 className="twd-detail-name">{selectedTeam.name}</h2>
                            <span style={{ background: selectedTeam.status === 'active' ? '#ecfdf5' : 'var(--bg-hover)', color: selectedTeam.status === 'active' ? '#047857' : 'var(--text-secondary)', padding: '4px 12px', borderRadius: 12, fontSize: 12, fontWeight: 700 }}>
                                {selectedTeam.status === 'active' ? 'Đang hoạt động' : 'Đã lưu trữ'}
                            </span>
                        </div>
                        <p className="twd-detail-desc">{selectedTeam.description}</p>
                        <div className="twd-header-meta">
                            <div className="twd-header-meta-item"><CalendarTodayIcon style={{ fontSize: 16 }} /> Ngày tạo: {selectedTeam.createdDate}</div>
                            <div className="twd-header-meta-item"><GroupIcon style={{ fontSize: 16 }} /> {selectedTeam.memberCount} thành viên</div>
                            <div className="twd-header-meta-item"><FolderSharedIcon style={{ fontSize: 16 }} /> {selectedTeam.projectCount} dự án đang triển khai</div>
                        </div>
                        <div className="twd-actions-row">
                            {selectedTeam.members.includes(currentUserName) ? (
                                <button className="twd-btn-join joined">Bạn đã tham gia nhóm này</button>
                            ) : (
                                <button className="twd-btn-join" onClick={handleJoinTeam}>
                                    <GroupAddIcon style={{ fontSize: 18 }} /> Tham gia nhóm
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="twd-detail-body">
                    <div className="twd-members-section">
                        <h3><GroupIcon /> Thành viên của nhóm ({selectedTeam.members.length})</h3>
                        <div className="twd-members-list">
                            {selectedTeam.members.map((member, i) => {
                                const isLeader = member === selectedTeam.leader;
                                return (
                                    <div key={i} className="twd-member-row">
                                        <div className="twd-member-info">
                                            <div className="twd-member-avatar-round" style={{ background: selectedTeam.color }}>
                                                {member.split(' ').pop()?.charAt(0) || 'U'}
                                            </div>
                                            <span className="twd-member-name-text">{member}</span>
                                            {member === currentUserName && <span style={{ fontSize: 11, color: '#10b981', fontWeight: 600 }}>(Bạn)</span>}
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <span className={`twd-member-role-label ${isLeader ? 'leader' : ''}`}>
                                                {isLeader ? 'Trưởng nhóm' : 'Thành viên'}
                                            </span>
                                            {!isLeader && member !== currentUserName && (
                                                <button className="tw-btn-action" title="Xóa khỏi nhóm" onClick={() => handleRemoveMember(member)}>
                                                    <DeleteIcon style={{ fontSize: 16 }} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="twd-add-member-card">
                        <h4 className="twd-add-member-title"><PersonAddIcon style={{ fontSize: 16, color: '#10b981' }} /> Thêm thành viên mới</h4>
                        <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: '0 0 12px 0', lineHeight: 1.4 }}>Nhập tên hoặc chọn từ danh sách thành viên hệ thống.</p>
                        <div className="twd-add-input-wrap">
                            <input
                                type="text"
                                className="twd-add-input"
                                placeholder="Nhập tên thành viên..."
                                value={newMemberName}
                                onChange={e => { setNewMemberName(e.target.value); setShowSuggestions(true); }}
                                onFocus={() => setShowSuggestions(true)}
                                onKeyDown={e => { if (e.key === 'Enter') handleAddMember(); }}
                            />
                            <button className="twd-add-btn" onClick={() => handleAddMember()}>Thêm</button>
                            {showSuggestions && (
                                <div className="twd-suggestions-list">
                                    {availableMembers.length > 0 && !newMemberName.trim() && (
                                        <div className="twd-section-divider">Thành viên có sẵn trong hệ thống</div>
                                    )}
                                    {filteredSuggestions.length > 0 ? (
                                        filteredSuggestions.map((name, i) => (
                                            <div key={i} className="twd-suggestion-item" onMouseDown={() => handleAddMember(name)}>
                                                <div className="twd-suggestion-avatar">{name.split(' ').pop()?.charAt(0) || 'U'}</div>
                                                <span>{name}</span>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="twd-suggestion-empty">
                                            {newMemberName.trim() ? (
                                                <span>Không tìm thấy — nhấn <b>Thêm</b> hoặc <b>Enter</b> để thêm "{newMemberName.trim()}"</span>
                                            ) : (
                                                <span>Tất cả thành viên đã có trong nhóm</span>
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

                        {availableMembers.length > 0 && (
                            <div style={{ marginTop: 16 }}>
                                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, fontWeight: 600 }}>Chọn nhanh:</div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                    {availableMembers.slice(0, 8).map((name, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleAddMember(name)}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: 6,
                                                padding: '5px 10px', border: '1px solid #e5e7eb', borderRadius: 20,
                                                background: 'var(--bg-secondary)', cursor: 'pointer', fontSize: 12, color: 'var(--text-secondary)',
                                                transition: 'all 0.15s'
                                            }}
                                            onMouseEnter={e => { (e.target as HTMLElement).style.borderColor = '#10b981'; (e.target as HTMLElement).style.background = '#ecfdf5'; }}
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
                </div>
            </div>
        </div>
    );
}