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

const ALL_SYSTEM_MEMBERS = [
    'Nguyễn Văn A', 'Trần Thị B', 'Lê Văn C', 'Phạm Văn D',
    'Hoàng Văn E', 'Đỗ Thị F', 'Vũ Minh G', 'Bùi Thị H',
    'Cao Văn I', 'Đinh Thị K', 'Tunas'
];

const initialTeams: TeamItem[] = [
    { id: '1', name: 'Frontend Team', description: 'Phát triển giao diện người dùng, React & TypeScript', leader: 'Nguyễn Văn A', memberCount: 6, projectCount: 4, status: 'active', createdDate: '2025-01-15', color: '#4f46e5', members: ['Nguyễn Văn A', 'Lê Văn C', 'Phạm Văn D', 'Vũ Minh G', 'Bùi Thị H', 'Cao Văn I'] },
    { id: '2', name: 'Backend Team', description: 'API, Database & Server infrastructure', leader: 'Lê Văn C', memberCount: 5, projectCount: 3, status: 'active', createdDate: '2025-01-15', color: '#10b981', members: ['Lê Văn C', 'Nguyễn Văn A', 'Hoàng Văn E', 'Đỗ Thị F', 'Cao Văn I'] },
    { id: '3', name: 'Design Team', description: 'UI/UX Design, Branding & Creative', leader: 'Phạm Văn D', memberCount: 4, projectCount: 5, status: 'active', createdDate: '2025-03-01', color: '#8b5cf6', members: ['Phạm Văn D', 'Trần Thị B', 'Bùi Thị H', 'Đinh Thị K'] },
    { id: '4', name: 'Marketing Team', description: 'Chiến lược Marketing, SEO & Content', leader: 'Trần Thị B', memberCount: 4, projectCount: 2, status: 'active', createdDate: '2025-04-10', color: '#f59e0b', members: ['Trần Thị B', 'Hoàng Văn E', 'Cao Văn I', 'Đinh Thị K'] },
    { id: '5', name: 'QA Team', description: 'Kiểm thử chất lượng phần mềm', leader: 'Hoàng Văn E', memberCount: 3, projectCount: 2, status: 'active', createdDate: '2025-06-01', color: '#06b6d4', members: ['Hoàng Văn E', 'Đỗ Thị F', 'Vũ Minh G'] },
    { id: '6', name: 'HR & Admin', description: 'Quản lý nhân sự và hành chính', leader: 'Đỗ Thị F', memberCount: 3, projectCount: 1, status: 'archived', createdDate: '2025-08-15', color: '#ef4444', members: ['Đỗ Thị F', 'Đinh Thị K', 'Bùi Thị H'] },
];

export default function TeamInfo() {
    useTitle("Chi tiết Nhóm");
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const teamId = searchParams.get('id');

    const [teams, setTeams] = useState<TeamItem[]>(() => {
        const saved = localStorage.getItem('teams');
        return saved ? JSON.parse(saved) : initialTeams;
    });

    const [newMemberName, setNewMemberName] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const currentUserName = 'Tunas';

    const selectedTeam = useMemo(() => {
        return teams.find(t => t.id === teamId) || null;
    }, [teams, teamId]);

    // Members available to add (not already in team)
    const availableMembers = useMemo(() => {
        if (!selectedTeam) return [];
        return ALL_SYSTEM_MEMBERS.filter(m => !selectedTeam.members.includes(m));
    }, [selectedTeam]);

    // Filtered suggestions based on input
    const filteredSuggestions = useMemo(() => {
        if (!newMemberName.trim()) return availableMembers;
        return availableMembers.filter(m =>
            m.toLowerCase().includes(newMemberName.toLowerCase())
        );
    }, [newMemberName, availableMembers]);

    useEffect(() => {
        localStorage.setItem('teams', JSON.stringify(teams));
    }, [teams]);

    const handleJoinTeam = () => {
        if (!selectedTeam) return;
        if (selectedTeam.members.includes(currentUserName)) {
            alert('Bạn đã là thành viên của nhóm này rồi!');
            return;
        }
        setTeams(prev => prev.map(t => {
            if (t.id !== selectedTeam.id) return t;
            const updatedMembers = [...t.members, currentUserName];
            return { ...t, members: updatedMembers, memberCount: updatedMembers.length };
        }));
        alert(`Bạn đã tham gia nhóm "${selectedTeam.name}" thành công!`);
    };

    const handleAddMember = (name?: string) => {
        const memberName = (name || newMemberName).trim();
        if (!selectedTeam || !memberName) return;
        if (selectedTeam.members.includes(memberName)) {
            alert('Thành viên này đã tồn tại trong nhóm!');
            return;
        }
        setTeams(prev => prev.map(t => {
            if (t.id !== selectedTeam.id) return t;
            const updatedMembers = [...t.members, memberName];
            return { ...t, members: updatedMembers, memberCount: updatedMembers.length };
        }));
        setNewMemberName('');
        setShowSuggestions(false);
    };

    const handleRemoveMember = (memberName: string) => {
        if (!selectedTeam) return;
        if (window.confirm(`Bạn có chắc muốn xóa thành viên "${memberName}" khỏi nhóm?`)) {
            setTeams(prev => prev.map(t => {
                if (t.id !== selectedTeam.id) return t;
                const updatedMembers = t.members.filter(m => m !== memberName);
                return { ...t, members: updatedMembers, memberCount: updatedMembers.length };
            }));
        }
    };

    if (!selectedTeam) {
        return (
            <div className="twd-detail-view" style={{ padding: 24 }}>
                <div className="twd-back-bar" style={{ cursor: 'pointer', color: '#6b7280' }} onClick={() => navigate('/team')}>
                    <ArrowBackIcon style={{ fontSize: 18, marginRight: 6, verticalAlign: 'middle' }} />
                    Quay lại danh sách nhóm
                </div>
                <div style={{ marginTop: 24, textAlign: 'center', color: '#9ca3af' }}>Không tìm thấy nhóm tương ứng.</div>
            </div>
        );
    }

    return (
        <div className="twd-detail-view" style={{ padding: 24 }}>
            <style>{`
                .twd-back-bar { display: flex; align-items: center; gap: 8px; color: #4b5563; font-weight: 600; font-size: 14px; cursor: pointer; margin-bottom: 20px; transition: color 0.15s; }
                .twd-back-bar:hover { color: #10b981; }
                .twd-detail-card { background: white; border-radius: 16px; border: 1px solid #e5e7eb; box-shadow: 0 1px 3px rgba(0,0,0,0.05); overflow: hidden; margin-bottom: 24px; font-family: 'Roboto', 'Inter', sans-serif; }
                .twd-detail-header { padding: 24px; position: relative; color: white; }
                .twd-detail-banner-overlay { position: absolute; inset: 0; opacity: 0.85; }
                .twd-detail-header-content { position: relative; z-index: 10; }
                .twd-detail-title-row { display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px; }
                .twd-detail-name { font-size: 24px; font-weight: 800; margin: 0 0 6px 0; }
                .twd-detail-desc { font-size: 14px; margin: 0 0 20px 0; max-width: 700px; opacity: 0.9; line-height: 1.6; }
                .twd-header-meta { display: flex; gap: 16px; flex-wrap: wrap; font-size: 13px; opacity: 0.95; }
                .twd-header-meta-item { display: flex; align-items: center; gap: 6px; }
                .twd-actions-row { display: flex; gap: 12px; margin-top: 16px; flex-wrap: wrap; }
                .twd-btn-join {
                    display: flex; align-items: center; gap: 8px; background: white; color: #111827; border: 1px solid #d1d5db;
                    border-radius: 8px; padding: 10px 18px; font-size: 13px; font-weight: 700; cursor: pointer; transition: all 0.15s;
                }
                .twd-btn-join:hover { background: #f9fafb; border-color: #cbd5e1; }
                .twd-btn-join.joined { background: rgba(255,255,255,0.2); color: white; border-color: transparent; cursor: default; }
                .twd-detail-body { padding: 24px; display: grid; grid-template-columns: 1fr 340px; gap: 24px; }
                .twd-members-section h3 { font-size: 16px; font-weight: 700; color: #111827; margin: 0 0 16px 0; display: flex; align-items: center; gap: 8px; }
                .twd-members-list { display: flex; flex-direction: column; gap: 10px; }
                .twd-member-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: #f9fafb; border-radius: 10px; border: 1px solid #f3f4f6; }
                .twd-member-info { display: flex; align-items: center; gap: 10px; }
                .twd-member-avatar-round { width: 32px; height: 32px; border-radius: 50%; color: white; font-size: 12px; font-weight: 700; display: flex; align-items: center; justify-content: center; }
                .twd-member-name-text { font-size: 14px; font-weight: 600; color: #1f2937; }
                .twd-member-role-label { font-size: 12px; color: #6b7280; background: #f3f4f6; padding: 2px 8px; border-radius: 8px; }
                .twd-member-role-label.leader { background: #fffbeb; color: #b45309; font-weight: 600; }
                .twd-add-member-card { background: #f9fafb; border-radius: 12px; border: 1px solid #e5e7eb; padding: 20px; height: fit-content; }
                .twd-add-member-title { font-size: 14px; font-weight: 700; color: #111827; margin: 0 0 12px 0; display: flex; align-items: center; gap: 6px; }
                .twd-add-input-wrap { display: flex; gap: 8px; position: relative; }
                .twd-add-input { flex: 1; padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 13px; outline: none; width: 100%; box-sizing: border-box; }
                .twd-add-input:focus { border-color: #10b981; }
                .twd-add-btn { background: #10b981; color: white; border: none; border-radius: 6px; padding: 8px 12px; font-size: 13px; font-weight: 600; cursor: pointer; transition: background 0.15s; flex-shrink: 0; }
                .twd-add-btn:hover { background: #059669; }
                .tw-btn-action { background: transparent; border: none; cursor: pointer; padding: 6px; border-radius: 6px; color: #9ca3af; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
                .tw-btn-action:hover { background-color: #fee2e2; color: #ef4444; }

                .twd-suggestions-list {
                    position: absolute; top: 100%; left: 0; right: 56px; background: white; border: 1px solid #e5e7eb;
                    border-radius: 8px; box-shadow: 0 8px 16px rgba(0,0,0,0.1); max-height: 200px; overflow-y: auto; z-index: 20; margin-top: 4px;
                }
                .twd-suggestion-item {
                    display: flex; align-items: center; gap: 10px; padding: 10px 14px; cursor: pointer;
                    font-size: 13px; color: #1f2937; transition: background 0.1s; border-bottom: 1px solid #f3f4f6;
                }
                .twd-suggestion-item:last-child { border-bottom: none; }
                .twd-suggestion-item:hover { background: #ecfdf5; }
                .twd-suggestion-avatar { width: 26px; height: 26px; border-radius: 50%; background: #10b981; color: white; font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
                .twd-suggestion-empty { padding: 12px 14px; font-size: 12px; color: #9ca3af; text-align: center; }

                .twd-section-divider { font-size: 11px; color: #9ca3af; padding: 8px 14px 4px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; background: #f9fafb; }

                @media (max-width: 768px) {
                    .twd-detail-body { grid-template-columns: 1fr; }
                }
            `}</style>

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
                            <span style={{ background: selectedTeam.status === 'active' ? '#ecfdf5' : '#f3f4f6', color: selectedTeam.status === 'active' ? '#047857' : '#4b5563', padding: '4px 12px', borderRadius: 12, fontSize: 12, fontWeight: 700 }}>
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
                        <p style={{ fontSize: 12, color: '#6b7280', margin: '0 0 12px 0', lineHeight: 1.4 }}>Nhập tên hoặc chọn từ danh sách thành viên hệ thống.</p>
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
                                <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8, fontWeight: 600 }}>Chọn nhanh:</div>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                                    {availableMembers.slice(0, 8).map((name, i) => (
                                        <button
                                            key={i}
                                            onClick={() => handleAddMember(name)}
                                            style={{
                                                display: 'flex', alignItems: 'center', gap: 6,
                                                padding: '5px 10px', border: '1px solid #e5e7eb', borderRadius: 20,
                                                background: 'white', cursor: 'pointer', fontSize: 12, color: '#374151',
                                                transition: 'all 0.15s'
                                            }}
                                            onMouseEnter={e => { (e.target as HTMLElement).style.borderColor = '#10b981'; (e.target as HTMLElement).style.background = '#ecfdf5'; }}
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