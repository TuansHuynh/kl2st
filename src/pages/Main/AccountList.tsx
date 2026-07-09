import { useTitle } from "../../hooks/useTitle";
import { useState, useMemo } from 'react';
import PeopleIcon from '@mui/icons-material/People';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import MoreVertIcon from '@mui/icons-material/MoreVert';


interface AccountItem {
    id: string;
    fullName: string;
    email: string;
    role: 'admin' | 'manager' | 'member';
    status: 'active' | 'inactive' | 'suspended';
    department: string;
    joinDate: string;
    lastActive: string;
    avatar: string;
}

export default function AccountList() {
    useTitle("Quản lý tài khoản");

    const [accounts, setAccounts] = useState<AccountItem[]>([
        { id: '1', fullName: 'Nguyễn Văn A', email: 'nguyenvana@company.vn', role: 'admin', status: 'active', department: 'Ban giám đốc', joinDate: '2024-01-15', lastActive: '2026-07-08', avatar: 'A' },
        { id: '2', fullName: 'Trần Thị B', email: 'tranthib@company.vn', role: 'manager', status: 'active', department: 'Phòng Marketing', joinDate: '2024-03-20', lastActive: '2026-07-08', avatar: 'B' },
        { id: '3', fullName: 'Lê Văn C', email: 'levanc@company.vn', role: 'member', status: 'active', department: 'Phòng Kỹ thuật', joinDate: '2024-06-10', lastActive: '2026-07-07', avatar: 'C' },
        { id: '4', fullName: 'Phạm Văn D', email: 'phamvand@company.vn', role: 'member', status: 'active', department: 'Phòng Thiết kế', joinDate: '2024-08-01', lastActive: '2026-07-08', avatar: 'D' },
        { id: '5', fullName: 'Hoàng Văn E', email: 'hoangvane@company.vn', role: 'manager', status: 'inactive', department: 'Phòng Kinh doanh', joinDate: '2024-09-15', lastActive: '2026-06-30', avatar: 'E' },
        { id: '6', fullName: 'Đỗ Thị F', email: 'dothif@company.vn', role: 'member', status: 'active', department: 'Phòng Nhân sự', joinDate: '2025-01-10', lastActive: '2026-07-06', avatar: 'F' },
        { id: '7', fullName: 'Vũ Minh G', email: 'vuminhg@company.vn', role: 'member', status: 'suspended', department: 'Phòng Kỹ thuật', joinDate: '2025-04-20', lastActive: '2026-05-15', avatar: 'G' },
        { id: '8', fullName: 'Bùi Thị H', email: 'buithih@company.vn', role: 'member', status: 'active', department: 'Phòng Kế toán', joinDate: '2025-07-01', lastActive: '2026-07-08', avatar: 'H' },
        { id: '9', fullName: 'Cao Văn I', email: 'caovani@company.vn', role: 'member', status: 'active', department: 'Phòng Marketing', joinDate: '2025-10-15', lastActive: '2026-07-05', avatar: 'I' },
        { id: '10', fullName: 'Đinh Thị K', email: 'dinhthik@company.vn', role: 'member', status: 'inactive', department: 'Phòng Hành chính', joinDate: '2026-02-01', lastActive: '2026-06-20', avatar: 'K' },
    ]);

    const [searchQuery, setSearchQuery] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [showAddModal, setShowAddModal] = useState(false);
    const [newName, setNewName] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [newRole, setNewRole] = useState<AccountItem['role']>('member');
    const [newDept, setNewDept] = useState('');
    const [activeMenu, setActiveMenu] = useState<string | null>(null);

    const totalAccounts = accounts.length;
    const activeAccounts = useMemo(() => accounts.filter(a => a.status === 'active').length, [accounts]);
    const adminCount = useMemo(() => accounts.filter(a => a.role === 'admin').length, [accounts]);
    const managerCount = useMemo(() => accounts.filter(a => a.role === 'manager').length, [accounts]);

    const filteredAccounts = useMemo(() => {
        return accounts.filter(a => {
            const matchesSearch = a.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                a.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                a.department.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesRole = filterRole === 'all' || a.role === filterRole;
            const matchesStatus = filterStatus === 'all' || a.status === filterStatus;
            return matchesSearch && matchesRole && matchesStatus;
        });
    }, [accounts, searchQuery, filterRole, filterStatus]);

    const handleDelete = (id: string) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa tài khoản này?')) {
            setAccounts(prev => prev.filter(a => a.id !== id));
        }
    };

    const toggleStatus = (id: string) => {
        setAccounts(prev => prev.map(a => {
            if (a.id !== id) return a;
            const newStatus = a.status === 'active' ? 'inactive' : 'active';
            return { ...a, status: newStatus };
        }));
    };

    const handleAddAccount = () => {
        if (!newName.trim() || !newEmail.trim()) return;
        const newAccount: AccountItem = {
            id: Date.now().toString(),
            fullName: newName,
            email: newEmail,
            role: newRole,
            status: 'active',
            department: newDept || 'Chưa phân phòng',
            joinDate: '2026-07-08',
            lastActive: '2026-07-08',
            avatar: newName.split(' ').pop()?.charAt(0) || 'U'
        };
        setAccounts(prev => [newAccount, ...prev]);
        setNewName(''); setNewEmail(''); setNewRole('member'); setNewDept('');
        setShowAddModal(false);
    };

    const getRoleBadge = (role: AccountItem['role']) => {
        const config: Record<string, { label: string; bg: string; color: string }> = {
            admin: { label: 'Quản trị viên', bg: '#fef2f2', color: '#991b1b' },
            manager: { label: 'Quản lý', bg: '#eff6ff', color: '#1e40af' },
            member: { label: 'Thành viên', bg: '#f0fdf4', color: '#166534' },
        };
        const c = config[role];
        return <span style={{ background: c.bg, color: c.color, padding: '3px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600 }}>{c.label}</span>;
    };

    const getStatusBadge = (status: AccountItem['status']) => {
        const config: Record<string, { label: string; bg: string; color: string; dot: string }> = {
            active: { label: 'Hoạt động', bg: '#f0fdf4', color: '#166534', dot: '#22c55e' },
            inactive: { label: 'Không hoạt động', bg: '#f9fafb', color: '#6b7280', dot: '#9ca3af' },
            suspended: { label: 'Bị khóa', bg: '#fef2f2', color: '#991b1b', dot: '#ef4444' },
        };
        const c = config[status];
        return (
            <span style={{ background: c.bg, color: c.color, padding: '3px 10px', borderRadius: 12, fontSize: 12, fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: c.dot, display: 'inline-block' }}></span>
                {c.label}
            </span>
        );
    };

    const getAvatarGradient = (role: AccountItem['role']) => {
        switch (role) {
            case 'admin': return 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
            case 'manager': return 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)';
            default: return 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)';
        }
    };

    return (
        <div className="acl-container">
            <style>{`
                .acl-container {
                    padding: 24px; color: #1f2937; font-family: 'Roboto', 'Inter', sans-serif;
                    box-sizing: border-box; background-color: #f9fafb; min-height: calc(100vh - 10dvh); width: 100%;
                }
                .acl-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
                .acl-title-wrap h1 { font-size: 24px; font-weight: 700; color: #111827; margin: 0 0 4px 0; display: flex; align-items: center; gap: 10px; }
                .acl-title-wrap h1 svg { color: #4f46e5; font-size: 28px; }
                .acl-title-wrap p { font-size: 14px; color: #6b7280; margin: 0; }

                .acl-btn-add {
                    display: flex; align-items: center; gap: 8px;
                    background-color: #4f46e5; color: white; border: none; border-radius: 8px;
                    padding: 10px 16px; font-size: 14px; font-weight: 600; cursor: pointer;
                    transition: all 0.2s ease;
                    box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2), 0 2px 4px -1px rgba(79, 70, 229, 0.1);
                }
                .acl-btn-add:hover { background-color: #4338ca; transform: translateY(-1px); box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.3); }
                .acl-btn-add:active { transform: translateY(0); }

                .acl-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px; }
                .acl-stat-card {
                    background: #ffffff; border-radius: 12px; padding: 16px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.05); border: 1px solid #e5e7eb;
                    display: flex; align-items: center; justify-content: space-between;
                    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .acl-stat-card:hover { transform: translateY(-4px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); }
                .acl-stat-card.s1 { border-left: 4px solid #4f46e5; }
                .acl-stat-card.s2 { border-left: 4px solid #10b981; }
                .acl-stat-card.s3 { border-left: 4px solid #ef4444; }
                .acl-stat-card.s4 { border-left: 4px solid #3b82f6; }

                .acl-card-data { display: flex; flex-direction: column; }
                .acl-card-title { font-size: 12px; color: #6b7280; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; }
                .acl-card-value { font-size: 24px; font-weight: 700; color: #111827; }
                .acl-card-icon { width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
                .s1 .acl-card-icon { background: rgba(79, 70, 229, 0.1); color: #4f46e5; }
                .s2 .acl-card-icon { background: rgba(16, 185, 129, 0.1); color: #10b981; }
                .s3 .acl-card-icon { background: rgba(239, 68, 68, 0.1); color: #ef4444; }
                .s4 .acl-card-icon { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }

                .acl-section { background: #ffffff; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); border: 1px solid #e5e7eb; overflow: hidden; }
                .acl-section-header { padding: 16px 20px; border-bottom: 1px solid #e5e7eb; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }
                .acl-section-title { font-size: 16px; font-weight: 700; color: #111827; }
                .acl-controls { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; }
                .acl-search-wrap { position: relative; display: flex; align-items: center; }
                .acl-search-input { padding: 8px 12px 8px 36px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; outline: none; transition: all 0.2s; width: 220px; }
                .acl-search-input:focus { border-color: #4f46e5; box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.15); }
                .acl-search-icon { position: absolute; left: 10px; color: #9ca3af; font-size: 20px; display: flex; align-items: center; }
                .acl-filter-select { padding: 8px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; background: white; color: #4b5563; outline: none; cursor: pointer; transition: border-color 0.2s; }
                .acl-filter-select:focus { border-color: #4f46e5; }

                .acl-table-wrap { width: 100%; overflow-x: auto; }
                .acl-table { width: 100%; border-collapse: collapse; text-align: left; font-size: 14px; }
                .acl-table th { background: #f9fafb; padding: 12px 20px; font-weight: 600; color: #4b5563; border-bottom: 1px solid #e5e7eb; text-transform: uppercase; font-size: 11px; letter-spacing: 0.05em; }
                .acl-table td { padding: 14px 20px; border-bottom: 1px solid #e5e7eb; color: #4b5563; vertical-align: middle; }
                .acl-table tr { transition: background 0.15s ease; }
                .acl-table tr:hover { background-color: #f9fafb; }

                .acl-user-cell { display: flex; align-items: center; gap: 12px; }
                .acl-avatar { width: 36px; height: 36px; border-radius: 50%; color: white; font-size: 14px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
                .acl-user-info { display: flex; flex-direction: column; }
                .acl-user-name { font-weight: 600; color: #111827; font-size: 14px; }
                .acl-user-email { font-size: 12px; color: #9ca3af; }

                .acl-dept-badge { background-color: #f3f4f6; color: #374151; padding: 2px 8px; border-radius: 12px; font-size: 12px; font-weight: 500; }

                .acl-actions { display: flex; gap: 4px; position: relative; }
                .acl-btn-action { background: transparent; border: none; cursor: pointer; padding: 6px; border-radius: 6px; color: #9ca3af; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
                .acl-btn-action:hover { background-color: #f3f4f6; color: #111827; }
                .acl-btn-action.btn-del:hover { background-color: #fee2e2; color: #ef4444; }
                .acl-btn-action.btn-toggle:hover { background-color: #ecfdf5; color: #10b981; }

                .acl-dropdown {
                    position: absolute; top: 100%; right: 0; background: white; border: 1px solid #e5e7eb;
                    border-radius: 8px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); z-index: 50; min-width: 160px; overflow: hidden;
                }
                .acl-dropdown-item {
                    display: flex; align-items: center; gap: 8px; padding: 10px 14px; font-size: 13px; color: #4b5563;
                    cursor: pointer; border: none; background: transparent; width: 100%; text-align: left; transition: background 0.15s;
                }
                .acl-dropdown-item:hover { background-color: #f9fafb; }
                .acl-dropdown-item.danger { color: #ef4444; }
                .acl-dropdown-item.danger:hover { background-color: #fef2f2; }

                .acl-empty { padding: 48px; text-align: center; color: #9ca3af; font-size: 15px; }

                .acl-modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 1000; backdrop-filter: blur(4px); }
                .acl-modal { background: white; border-radius: 16px; padding: 24px; width: 90%; max-width: 480px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); }
                .acl-modal h2 { font-size: 18px; font-weight: 700; margin: 0 0 16px 0; color: #111827; }
                .acl-modal-label { display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 4px; }
                .acl-modal-input { width: 100%; padding: 10px 14px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; outline: none; margin-bottom: 12px; box-sizing: border-box; transition: border-color 0.2s; }
                .acl-modal-input:focus { border-color: #4f46e5; box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.15); }
                .acl-modal-select { width: 100%; padding: 10px 14px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; outline: none; margin-bottom: 12px; box-sizing: border-box; background: white; cursor: pointer; }
                .acl-modal-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 4px; }
                .acl-modal-btn-cancel { padding: 8px 16px; border: 1px solid #d1d5db; border-radius: 8px; background: white; color: #4b5563; cursor: pointer; font-size: 14px; font-weight: 500; transition: all 0.2s; }
                .acl-modal-btn-cancel:hover { background: #f3f4f6; }
                .acl-modal-btn-save { padding: 8px 16px; border: none; border-radius: 8px; background: #4f46e5; color: white; cursor: pointer; font-size: 14px; font-weight: 600; transition: all 0.2s; }
                .acl-modal-btn-save:hover { background: #4338ca; }
            `}</style>

            <div className="acl-header">
                <div className="acl-title-wrap">
                    <h1><PeopleIcon /> Quản lý Tài khoản</h1>
                    <p>Xem, thêm mới và quản lý tài khoản người dùng trong hệ thống</p>
                </div>
                <button className="acl-btn-add" onClick={() => setShowAddModal(true)}>
                    <PersonAddIcon fontSize="small" />
                    Thêm tài khoản
                </button>
            </div>

            <div className="acl-grid">
                <div className="acl-stat-card s1">
                    <div className="acl-card-data"><span className="acl-card-title">Tổng tài khoản</span><span className="acl-card-value">{totalAccounts}</span></div>
                    <div className="acl-card-icon"><PeopleIcon /></div>
                </div>
                <div className="acl-stat-card s2">
                    <div className="acl-card-data"><span className="acl-card-title">Đang hoạt động</span><span className="acl-card-value">{activeAccounts}</span></div>
                    <div className="acl-card-icon"><CheckCircleIcon /></div>
                </div>
                <div className="acl-stat-card s3">
                    <div className="acl-card-data"><span className="acl-card-title">Quản trị viên</span><span className="acl-card-value">{adminCount}</span></div>
                    <div className="acl-card-icon"><AdminPanelSettingsIcon /></div>
                </div>
                <div className="acl-stat-card s4">
                    <div className="acl-card-data"><span className="acl-card-title">Quản lý</span><span className="acl-card-value">{managerCount}</span></div>
                    <div className="acl-card-icon"><VerifiedUserIcon /></div>
                </div>
            </div>

            <div className="acl-section">
                <div className="acl-section-header">
                    <span className="acl-section-title">Danh sách tài khoản</span>
                    <div className="acl-controls">
                        <div className="acl-search-wrap">
                            <span className="acl-search-icon"><SearchIcon fontSize="small" /></span>
                            <input type="text" className="acl-search-input" placeholder="Tìm tên, email, phòng ban..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                        </div>
                        <select className="acl-filter-select" value={filterRole} onChange={e => setFilterRole(e.target.value)}>
                            <option value="all">Tất cả vai trò</option>
                            <option value="admin">Quản trị viên</option>
                            <option value="manager">Quản lý</option>
                            <option value="member">Thành viên</option>
                        </select>
                        <select className="acl-filter-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                            <option value="all">Tất cả trạng thái</option>
                            <option value="active">Hoạt động</option>
                            <option value="inactive">Không hoạt động</option>
                            <option value="suspended">Bị khóa</option>
                        </select>
                    </div>
                </div>

                <div className="acl-table-wrap">
                    {filteredAccounts.length > 0 ? (
                        <table className="acl-table">
                            <thead>
                                <tr>
                                    <th>Người dùng</th>
                                    <th>Vai trò</th>
                                    <th>Phòng ban</th>
                                    <th>Trạng thái</th>
                                    <th>Ngày tham gia</th>
                                    <th>Hoạt động gần nhất</th>
                                    <th style={{ width: '80px', textAlign: 'center' }}>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAccounts.map(acc => (
                                    <tr key={acc.id}>
                                        <td>
                                            <div className="acl-user-cell">
                                                <div className="acl-avatar" style={{ background: getAvatarGradient(acc.role) }}>{acc.avatar}</div>
                                                <div className="acl-user-info">
                                                    <span className="acl-user-name">{acc.fullName}</span>
                                                    <span className="acl-user-email">{acc.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{getRoleBadge(acc.role)}</td>
                                        <td><span className="acl-dept-badge">{acc.department}</span></td>
                                        <td>{getStatusBadge(acc.status)}</td>
                                        <td>{acc.joinDate}</td>
                                        <td>{acc.lastActive}</td>
                                        <td>
                                            <div className="acl-actions">
                                                <button className="acl-btn-action" onClick={() => setActiveMenu(activeMenu === acc.id ? null : acc.id)} title="Thêm thao tác">
                                                    <MoreVertIcon fontSize="small" />
                                                </button>
                                                {activeMenu === acc.id && (
                                                    <div className="acl-dropdown" onMouseLeave={() => setActiveMenu(null)}>
                                                        <button className="acl-dropdown-item" onClick={() => { toggleStatus(acc.id); setActiveMenu(null); }}>
                                                            {acc.status === 'active' ? <BlockIcon style={{ fontSize: 16 }} /> : <CheckCircleIcon style={{ fontSize: 16 }} />}
                                                            {acc.status === 'active' ? 'Vô hiệu hóa' : 'Kích hoạt'}
                                                        </button>
                                                        <button className="acl-dropdown-item danger" onClick={() => { handleDelete(acc.id); setActiveMenu(null); }}>
                                                            <DeleteIcon style={{ fontSize: 16 }} />
                                                            Xóa tài khoản
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="acl-empty">Không tìm thấy tài khoản phù hợp</div>
                    )}
                </div>
            </div>

            {showAddModal && (
                <div className="acl-modal-overlay" onClick={() => setShowAddModal(false)}>
                    <div className="acl-modal" onClick={e => e.stopPropagation()}>
                        <h2>Thêm tài khoản mới</h2>
                        <label className="acl-modal-label">Họ và tên</label>
                        <input className="acl-modal-input" placeholder="Nhập họ và tên..." value={newName} onChange={e => setNewName(e.target.value)} />
                        <label className="acl-modal-label">Email</label>
                        <input className="acl-modal-input" type="email" placeholder="Nhập email..." value={newEmail} onChange={e => setNewEmail(e.target.value)} />
                        <label className="acl-modal-label">Vai trò</label>
                        <select className="acl-modal-select" value={newRole} onChange={e => setNewRole(e.target.value as AccountItem['role'])}>
                            <option value="member">Thành viên</option>
                            <option value="manager">Quản lý</option>
                            <option value="admin">Quản trị viên</option>
                        </select>
                        <label className="acl-modal-label">Phòng ban</label>
                        <input className="acl-modal-input" placeholder="Nhập phòng ban..." value={newDept} onChange={e => setNewDept(e.target.value)} />
                        <div className="acl-modal-actions">
                            <button className="acl-modal-btn-cancel" onClick={() => setShowAddModal(false)}>Hủy</button>
                            <button className="acl-modal-btn-save" onClick={handleAddAccount}>Thêm tài khoản</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}