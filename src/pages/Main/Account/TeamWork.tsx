import { useTitle } from "../../../hooks/useTitle";
import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GroupsIcon from '@mui/icons-material/Groups';
import SearchIcon from '@mui/icons-material/Search';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import DeleteIcon from '@mui/icons-material/Delete';
import GroupIcon from '@mui/icons-material/Group';
import StarIcon from '@mui/icons-material/Star';
import FolderSharedIcon from '@mui/icons-material/FolderShared';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

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

const initialTeams: TeamItem[] = [
    { id: '1', name: 'Frontend Team', description: 'Phát triển giao diện người dùng, React & TypeScript', leader: 'Nguyễn Văn A', memberCount: 6, projectCount: 4, status: 'active', createdDate: '2025-01-15', color: '#4f46e5', members: ['Nguyễn Văn A', 'Lê Văn C', 'Phạm Văn D', 'Vũ Minh G', 'Bùi Thị H', 'Cao Văn I'] },
    { id: '2', name: 'Backend Team', description: 'API, Database & Server infrastructure', leader: 'Lê Văn C', memberCount: 5, projectCount: 3, status: 'active', createdDate: '2025-01-15', color: '#10b981', members: ['Lê Văn C', 'Nguyễn Văn A', 'Hoàng Văn E', 'Đỗ Thị F', 'Cao Văn I'] },
    { id: '3', name: 'Design Team', description: 'UI/UX Design, Branding & Creative', leader: 'Phạm Văn D', memberCount: 4, projectCount: 5, status: 'active', createdDate: '2025-03-01', color: '#8b5cf6', members: ['Phạm Văn D', 'Trần Thị B', 'Bùi Thị H', 'Đinh Thị K'] },
    { id: '4', name: 'Marketing Team', description: 'Chiến lược Marketing, SEO & Content', leader: 'Trần Thị B', memberCount: 4, projectCount: 2, status: 'active', createdDate: '2025-04-10', color: '#f59e0b', members: ['Trần Thị B', 'Hoàng Văn E', 'Cao Văn I', 'Đinh Thị K'] },
    { id: '5', name: 'QA Team', description: 'Kiểm thử chất lượng phần mềm', leader: 'Hoàng Văn E', memberCount: 3, projectCount: 2, status: 'active', createdDate: '2025-06-01', color: '#06b6d4', members: ['Hoàng Văn E', 'Đỗ Thị F', 'Vũ Minh G'] },
    { id: '6', name: 'HR & Admin', description: 'Quản lý nhân sự và hành chính', leader: 'Đỗ Thị F', memberCount: 3, projectCount: 1, status: 'archived', createdDate: '2025-08-15', color: '#ef4444', members: ['Đỗ Thị F', 'Đinh Thị K', 'Bùi Thị H'] },
];

export default function TeamWork() {
    useTitle("Nhóm làm việc");
    const navigate = useNavigate();

    const [teams, setTeams] = useState<TeamItem[]>(() => {
        const saved = localStorage.getItem('teams');
        return saved ? JSON.parse(saved) : initialTeams;
    });

    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [showAddModal, setShowAddModal] = useState(false);
    const [newTeamName, setNewTeamName] = useState('');
    const [newTeamDesc, setNewTeamDesc] = useState('');

    // Persist to localStorage
    useEffect(() => {
        localStorage.setItem('teams', JSON.stringify(teams));
    }, [teams]);

    const totalTeams = teams.length;
    const activeTeams = useMemo(() => teams.filter(t => t.status === 'active').length, [teams]);
    const totalMembers = useMemo(() => teams.reduce((sum, t) => sum + t.memberCount, 0), [teams]);
    const totalProjects = useMemo(() => teams.reduce((sum, t) => sum + t.projectCount, 0), [teams]);

    const filteredTeams = useMemo(() => {
        return teams.filter(t => {
            const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                t.leader.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = filterStatus === 'all' || t.status === filterStatus;
            return matchesSearch && matchesStatus;
        });
    }, [teams, searchQuery, filterStatus]);

    const handleDelete = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm('Bạn có chắc chắn muốn xóa nhóm này?')) {
            setTeams(prev => prev.filter(t => t.id !== id));
        }
    };

    const handleAddTeam = () => {
        if (!newTeamName.trim()) return;
        const colors = ['#4f46e5', '#10b981', '#8b5cf6', '#f59e0b', '#06b6d4', '#ef4444', '#ec4899'];
        const newTeam: TeamItem = {
            id: Date.now().toString(),
            name: newTeamName,
            description: newTeamDesc || 'Nhóm mới được tạo',
            leader: 'Tunas',
            memberCount: 1,
            projectCount: 0,
            status: 'active',
            createdDate: '2026-07-08',
            color: colors[Math.floor(Math.random() * colors.length)],
            members: ['Tunas']
        };
        setTeams(prev => [newTeam, ...prev]);
        setNewTeamName(''); setNewTeamDesc('');
        setShowAddModal(false);
    };

    const handleCardClick = (id: string) => {
        navigate(`/team-info?id=${id}`);
    };

    return (
        <div className="tw-container">
            <style>{`
                .tw-container {
                    padding: 24px; color: #1f2937; font-family: 'Roboto', 'Inter', sans-serif;
                    box-sizing: border-box; background-color: #f9fafb; min-height: calc(100vh - 10dvh); width: 100%;
                }
                .tw-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
                .tw-title-wrap h1 { font-size: 24px; font-weight: 700; color: #111827; margin: 0 0 4px 0; display: flex; align-items: center; gap: 10px; }
                .tw-title-wrap h1 svg { color: #10b981; font-size: 28px; }
                .tw-title-wrap p { font-size: 14px; color: #6b7280; margin: 0; }

                .tw-btn-add {
                    display: flex; align-items: center; gap: 8px;
                    background-color: #10b981; color: white; border: none; border-radius: 8px;
                    padding: 10px 16px; font-size: 14px; font-weight: 600; cursor: pointer;
                    transition: all 0.2s ease;
                    box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.2);
                }
                .tw-btn-add:hover { background-color: #059669; transform: translateY(-1px); }

                .tw-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px; }
                .tw-stat-card {
                    background: #ffffff; border-radius: 12px; padding: 16px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.05); border: 1px solid #e5e7eb;
                    display: flex; align-items: center; justify-content: space-between;
                    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .tw-stat-card:hover { transform: translateY(-4px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); }
                .tw-stat-card.s1 { border-left: 4px solid #10b981; }
                .tw-stat-card.s2 { border-left: 4px solid #3b82f6; }
                .tw-stat-card.s3 { border-left: 4px solid #f59e0b; }
                .tw-stat-card.s4 { border-left: 4px solid #8b5cf6; }

                .tw-card-data { display: flex; flex-direction: column; }
                .tw-card-title { font-size: 12px; color: #6b7280; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; }
                .tw-card-value { font-size: 24px; font-weight: 700; color: #111827; }
                .tw-card-icon { width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
                .s1 .tw-card-icon { background: rgba(16, 185, 129, 0.1); color: #10b981; }
                .s2 .tw-card-icon { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
                .s3 .tw-card-icon { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
                .s4 .tw-card-icon { background: rgba(139, 92, 246, 0.1); color: #8b5cf6; }

                .tw-controls-bar { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; margin-bottom: 24px; }
                .tw-search-wrap { position: relative; display: flex; align-items: center; flex: 1; min-width: 200px; }
                .tw-search-input { padding: 8px 12px 8px 36px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; outline: none; transition: all 0.2s; width: 100%; }
                .tw-search-input:focus { border-color: #10b981; box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15); }
                .tw-search-icon { position: absolute; left: 10px; color: #9ca3af; font-size: 20px; display: flex; align-items: center; }
                .tw-filter-select { padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; background: white; color: #4b5563; outline: none; cursor: pointer; }

                .tw-teams-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 20px; }
                .tw-team-card {
                    background: #ffffff; border-radius: 12px; border: 1px solid #e5e7eb;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.05); overflow: hidden;
                    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
                    cursor: pointer;
                }
                .tw-team-card:hover { transform: translateY(-4px); box-shadow: 0 10px 20px -5px rgba(0,0,0,0.1); }

                .tw-team-banner { height: 6px; }
                .tw-team-body { padding: 20px; }
                .tw-team-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
                .tw-team-name { font-size: 17px; font-weight: 700; color: #111827; margin: 0; }
                .tw-team-status { padding: 2px 10px; border-radius: 12px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
                .tw-team-status.active { background: #ecfdf5; color: #065f46; }
                .tw-team-status.archived { background: #f3f4f6; color: #6b7280; }
                .tw-team-desc { font-size: 13px; color: #6b7280; margin-bottom: 16px; line-height: 1.5; height: 38px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

                .tw-team-meta { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 16px; }
                .tw-meta-item { display: flex; align-items: center; gap: 6px; font-size: 13px; color: #4b5563; }
                .tw-meta-item svg { font-size: 16px; color: #9ca3af; }

                .tw-team-members { display: flex; align-items: center; gap: 8px; margin-bottom: 14px; }
                .tw-member-avatars { display: flex; }
                .tw-member-avatar {
                    width: 30px; height: 30px; border-radius: 50%; border: 2px solid white;
                    color: white; font-size: 11px; font-weight: 700;
                    display: flex; align-items: center; justify-content: center;
                    margin-left: -8px;
                }
                .tw-member-avatar:first-child { margin-left: 0; }
                .tw-member-more { font-size: 12px; color: #9ca3af; margin-left: 4px; }

                .tw-team-footer { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #f3f4f6; padding-top: 14px; }
                .tw-team-leader { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #6b7280; }
                .tw-leader-avatar { width: 24px; height: 24px; border-radius: 50%; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; font-size: 10px; font-weight: 700; display: flex; align-items: center; justify-content: center; }

                .tw-team-actions { display: flex; gap: 4px; }
                .tw-btn-action { background: transparent; border: none; cursor: pointer; padding: 6px; border-radius: 6px; color: #9ca3af; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
                .tw-btn-action:hover { background-color: #f3f4f6; color: #111827; }
                .tw-btn-action.btn-del:hover { background-color: #fee2e2; color: #ef4444; }

                .tw-empty { padding: 48px; text-align: center; color: #9ca3af; font-size: 15px; }

                .tw-modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(4px); }
                .tw-modal { background: white; border-radius: 16px; padding: 24px; width: 90%; max-width: 480px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); }
                .tw-modal h2 { font-size: 18px; font-weight: 700; margin: 0 0 16px 0; color: #111827; }
                .tw-modal-label { display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 4px; }
                .tw-modal-input { width: 100%; padding: 10px 14px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; outline: none; margin-bottom: 12px; box-sizing: border-box; transition: border-color 0.2s; }
                .tw-modal-input:focus { border-color: #10b981; box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15); }
                .tw-modal-textarea { width: 100%; padding: 10px 14px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; outline: none; margin-bottom: 16px; min-height: 80px; resize: vertical; box-sizing: border-box; font-family: inherit; }
                .tw-modal-textarea:focus { border-color: #10b981; box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15); }
                .tw-modal-actions { display: flex; gap: 10px; justify-content: flex-end; }
                .tw-modal-btn-cancel { padding: 8px 16px; border: 1px solid #d1d5db; border-radius: 8px; background: white; color: #4b5563; cursor: pointer; font-size: 14px; font-weight: 500; }
                .tw-modal-btn-cancel:hover { background: #f3f4f6; }
                .tw-modal-btn-save { padding: 8px 16px; border: none; border-radius: 8px; background: #10b981; color: white; cursor: pointer; font-size: 14px; font-weight: 600; }
                .tw-modal-btn-save:hover { background: #059669; }
            `}</style>

            <div className="tw-header">
                <div className="tw-title-wrap">
                    <h1><GroupsIcon /> Nhóm làm việc</h1>
                    <p>Quản lý các nhóm làm việc và phân công thành viên</p>
                </div>
                <button className="tw-btn-add" onClick={() => setShowAddModal(true)}>
                    <PersonAddIcon fontSize="small" />
                    Tạo nhóm mới
                </button>
            </div>

            <div className="tw-stats">
                <div className="tw-stat-card s1">
                    <div className="tw-card-data"><span className="tw-card-title">Tổng nhóm</span><span className="tw-card-value">{totalTeams}</span></div>
                    <div className="tw-card-icon"><GroupsIcon /></div>
                </div>
                <div className="tw-stat-card s2">
                    <div className="tw-card-data"><span className="tw-card-title">Đang hoạt động</span><span className="tw-card-value">{activeTeams}</span></div>
                    <div className="tw-card-icon"><GroupIcon /></div>
                </div>
                <div className="tw-stat-card s3">
                    <div className="tw-card-data"><span className="tw-card-title">Tổng thành viên</span><span className="tw-card-value">{totalMembers}</span></div>
                    <div className="tw-card-icon"><StarIcon /></div>
                </div>
                <div className="tw-stat-card s4">
                    <div className="tw-card-data"><span className="tw-card-title">Tổng dự án</span><span className="tw-card-value">{totalProjects}</span></div>
                    <div className="tw-card-icon"><FolderSharedIcon /></div>
                </div>
            </div>

            <div className="tw-controls-bar">
                <div className="tw-search-wrap">
                    <span className="tw-search-icon"><SearchIcon fontSize="small" /></span>
                    <input type="text" className="tw-search-input" placeholder="Tìm kiếm nhóm, mô tả, trưởng nhóm..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                </div>
                <select className="tw-filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                    <option value="all">Tất cả trạng thái</option>
                    <option value="active">Đang hoạt động</option>
                    <option value="archived">Đã lưu trữ</option>
                </select>
            </div>

            {filteredTeams.length > 0 ? (
                <div className="tw-teams-grid">
                    {filteredTeams.map(team => (
                        <div key={team.id} className="tw-team-card" onClick={() => handleCardClick(team.id)}>
                            <div className="tw-team-banner" style={{ background: team.color }}></div>
                            <div className="tw-team-body">
                                <div className="tw-team-top">
                                    <h3 className="tw-team-name">{team.name}</h3>
                                    <span className={`tw-team-status ${team.status}`}>{team.status === 'active' ? 'Hoạt động' : 'Lưu trữ'}</span>
                                </div>
                                <p className="tw-team-desc">{team.description}</p>

                                <div className="tw-team-meta">
                                    <div className="tw-meta-item"><GroupIcon />{team.memberCount} thành viên</div>
                                    <div className="tw-meta-item"><FolderSharedIcon />{team.projectCount} dự án</div>
                                    <div className="tw-meta-item"><CalendarTodayIcon />Tạo: {team.createdDate}</div>
                                    <div className="tw-meta-item"><StarIcon />Trưởng nhóm</div>
                                </div>

                                <div className="tw-team-members">
                                    <div className="tw-member-avatars">
                                        {team.members.slice(0, 4).map((m, i) => (
                                            <div key={i} className="tw-member-avatar" style={{ background: team.color, zIndex: 10 - i }}>
                                                {m.split(' ').pop()?.charAt(0) || 'U'}
                                            </div>
                                        ))}
                                    </div>
                                    {team.members.length > 4 && <span className="tw-member-more">+{team.members.length - 4} khác</span>}
                                </div>

                                <div className="tw-team-footer">
                                    <div className="tw-team-leader">
                                        <div className="tw-leader-avatar">{team.leader.split(' ').pop()?.charAt(0) || 'U'}</div>
                                        <span>{team.leader}</span>
                                    </div>
                                    <div className="tw-team-actions">
                                        <button className="tw-btn-action btn-del" title="Xóa nhóm" onClick={(e) => handleDelete(team.id, e)}>
                                            <DeleteIcon style={{ fontSize: 18 }} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="tw-empty">Không tìm thấy nhóm phù hợp</div>
            )}

            {showAddModal && (
                <div className="tw-modal-overlay" onClick={() => setShowAddModal(false)}>
                    <div className="tw-modal" onClick={e => e.stopPropagation()}>
                        <h2>Tạo nhóm mới</h2>
                        <label className="tw-modal-label">Tên nhóm</label>
                        <input className="tw-modal-input" placeholder="Nhập tên nhóm..." value={newTeamName} onChange={e => setNewTeamName(e.target.value)} />
                        <label className="tw-modal-label">Mô tả</label>
                        <textarea className="tw-modal-textarea" placeholder="Mô tả nhóm..." value={newTeamDesc} onChange={e => setNewTeamDesc(e.target.value)} />
                        <div className="tw-modal-actions">
                            <button className="tw-modal-btn-cancel" onClick={() => setShowAddModal(false)}>Hủy</button>
                            <button className="tw-modal-btn-save" onClick={handleAddTeam}>Tạo nhóm</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}