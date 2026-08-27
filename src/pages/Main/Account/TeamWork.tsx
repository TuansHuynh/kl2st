import { useTitle } from "../../../hooks/useTitle";
import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import GroupsIcon from '@mui/icons-material/Groups';
import SearchIcon from '@mui/icons-material/Search';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import DeleteIcon from '@mui/icons-material/Delete';
import GroupIcon from '@mui/icons-material/Group';
import StarIcon from '@mui/icons-material/Star';
import FolderSharedIcon from '@mui/icons-material/FolderShared';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PaletteIcon from '@mui/icons-material/Palette';
import { teamService } from '../../../service/teamService';
import type { Team } from '../../../types';

const TEAM_COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', 'var(--text-muted)', '#0ea5e9'];

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

export default function TeamWork() {
    useTitle("Nhóm làm việc");
    const navigate = useNavigate();

    const [teams, setTeams] = useState<TeamItem[]>([]);
    const [loading, setLoading] = useState(true);

    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [showAddModal, setShowAddModal] = useState(false);
    const [newTeamName, setNewTeamName] = useState('');
    const [newTeamDesc, setNewTeamDesc] = useState('');
    const [activeColorPicker, setActiveColorPicker] = useState<string | null>(null);

    const handleColorChange = async (id: string, color: string) => {
        try {
            const teamToUpdate = teams.find(t => t.id === id);
            if (!teamToUpdate) return;
            
            const updated = await teamService.updateTeam(id, { 
                name: teamToUpdate.name, // Required by backend validation
                description: teamToUpdate.description,
                color 
            });
            setTeams(prev => prev.map(t => t.id === id ? { ...t, color: updated.color || color } : t));
            setActiveColorPicker(null);
        } catch (err) {
            console.error('Failed to change color:', err);
            alert('Đổi màu thất bại!');
        }
    };

    useEffect(() => {
        const handleClickOutside = () => setActiveColorPicker(null);
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    // Fetch teams from backend
    useEffect(() => {
        const fetchTeams = async () => {
            try {
                setLoading(true);
                const data = await teamService.getAllTeams();
                setTeams(data.map(mapTeamToItem));
            } catch (err) {
                console.error('Failed to fetch teams:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchTeams();
    }, []);

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

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm('Bạn có chắc chắn muốn xóa nhóm này?')) {
            try {
                await teamService.deleteTeam(id);
                setTeams(prev => prev.filter(t => t.id !== id));
            } catch (err) {
                console.error('Failed to delete team:', err);
            }
        }
    };

    const handleAddTeam = async () => {
        if (!newTeamName.trim()) return;
        try {
            const created = await teamService.createTeam({
                name: newTeamName,
                description: newTeamDesc,
            });
            setTeams(prev => [mapTeamToItem(created), ...prev]);
            setNewTeamName(''); setNewTeamDesc('');
            setShowAddModal(false);
        } catch (err) {
            console.error('Failed to create team:', err);
            alert('Tạo nhóm thất bại!');
        }
    };

    const handleCardClick = (id: string) => {
        navigate(`/team-info?id=${id}`);
    };

    return (
        <div className="tw-container">
            

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
                                    <div className="tw-team-actions" style={{ position: 'relative' }}>
                                        <button className="tw-btn-action btn-color" title="Đổi màu" onClick={(e) => { e.stopPropagation(); setActiveColorPicker(team.id); }}>
                                            <PaletteIcon style={{ fontSize: 18 }} />
                                        </button>
                                        <button className="tw-btn-action btn-del" title="Xóa nhóm" onClick={(e) => handleDelete(team.id, e)}>
                                            <DeleteIcon style={{ fontSize: 18 }} />
                                        </button>

                                        {activeColorPicker === team.id && (
                                            <div className="tw-color-picker" onClick={e => e.stopPropagation()}>
                                                {TEAM_COLORS.map(c => (
                                                    <div key={c} className="tw-color-circle" style={{ background: c }} onClick={() => handleColorChange(team.id, c)} />
                                                ))}
                                            </div>
                                        )}
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