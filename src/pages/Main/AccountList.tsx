import { useTitle } from "../../hooks/useTitle";
import { useState, useMemo, useEffect } from 'react';
import PeopleIcon from '@mui/icons-material/People';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { accountService } from '../../service/accountService';
import { authService } from '../../service/authService';
import type { User } from '../../types';


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

const mapUserToAccount = (u: User): AccountItem => ({
    id: u.id,
    fullName: u.fullName,
    email: u.email,
    role: (u.roles && u.roles.length > 0 ? u.roles[0] : 'member') as AccountItem['role'],
    status: u.status,
    department: u.department || '',
    joinDate: u.joinDate || '',
    lastActive: '',
    avatar: u.avatar || u.fullName?.split(' ').pop()?.charAt(0) || 'U',
});

export default function AccountList() {
    useTitle("Quản lý tài khoản");

    const [accounts, setAccounts] = useState<AccountItem[]>([]);

    const [searchQuery, setSearchQuery] = useState('');
    const [filterRole, setFilterRole] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [showAddModal, setShowAddModal] = useState(false);
    const [newName, setNewName] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [newRole, setNewRole] = useState<AccountItem['role']>('member');
    const [newDept, setNewDept] = useState('');
    const [activeMenu, setActiveMenu] = useState<string | null>(null);
    const [viewAccount, setViewAccount] = useState<AccountItem | null>(null);

    // Fetch accounts from backend
    useEffect(() => {
        const fetchAccounts = async () => {
            try {
                const users = await accountService.getAllAccounts();
                setAccounts(users.map(mapUserToAccount));
            } catch (err) {
                console.error('Failed to fetch accounts:', err);
            }
        };
        fetchAccounts();
    }, []);

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

    const handleDelete = async (id: string) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa tài khoản này?')) {
            try {
                await accountService.deleteAccount(id);
                setAccounts(prev => prev.filter(a => a.id !== id));
            } catch (err) {
                console.error('Failed to delete account:', err);
                alert('Xóa tài khoản thất bại!');
            }
        }
    };

    const toggleStatus = async (id: string) => {
        const account = accounts.find(a => a.id === id);
        if (!account) return;
        const newStatus = account.status === 'active' ? 'inactive' : 'active';
        try {
            await accountService.updateAccount(id, { status: newStatus });
            setAccounts(prev => prev.map(a => a.id === id ? { ...a, status: newStatus as AccountItem['status'] } : a));
        } catch (err) {
            console.error('Failed to update status:', err);
        }
    };

    const changeRole = async (id: string, newRole: AccountItem['role']) => {
        try {
            const updated = await accountService.updateAccount(id, { role: newRole });
            setAccounts(prev => prev.map(a => a.id === id ? mapUserToAccount(updated) : a));
        } catch (err) {
            console.error('Failed to change role:', err);
            alert('Cập nhật vai trò thất bại!');
        }
    };

    const handleAddAccount = async () => {
        if (!newName.trim() || !newEmail.trim()) return;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(newEmail.trim())) {
            alert("Định dạng email không hợp lệ (ví dụ: user@example.com)");
            return;
        }
        try {
            const user = await authService.register({
                email: newEmail,
                password: 'password123',
                fullName: newName,
                department: newDept || undefined,
            });
            let finalUser = user;
            if (newRole && newRole !== 'member') {
                finalUser = await accountService.updateAccount(user.id, { role: newRole });
            }
            setAccounts(prev => [mapUserToAccount(finalUser), ...prev]);
        } catch (err) {
            console.error('Failed to create account:', err);
            alert('Tạo tài khoản thất bại!');
        }
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
            inactive: { label: 'Không hoạt động', bg: 'var(--bg-primary)', color: 'var(--text-muted)', dot: '#9ca3af' },
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
                                            <div className="acl-user-cell" onClick={() => setViewAccount(acc)} style={{ cursor: 'pointer' }} title="Xem thông tin chi tiết">
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
                                                        <button className="acl-dropdown-item" onClick={() => { setViewAccount(acc); setActiveMenu(null); }}>
                                                            <VisibilityIcon style={{ fontSize: 16, color: '#4f46e5' }} />
                                                            Xem thông tin chi tiết
                                                        </button>
                                                        <button className="acl-dropdown-item" onClick={() => { toggleStatus(acc.id); setActiveMenu(null); }}>
                                                            {acc.status === 'active' ? <BlockIcon style={{ fontSize: 16 }} /> : <CheckCircleIcon style={{ fontSize: 16 }} />}
                                                            {acc.status === 'active' ? 'Vô hiệu hóa' : 'Kích hoạt'}
                                                        </button>
                                                        {acc.role !== 'admin' && (
                                                            <button className="acl-dropdown-item" onClick={() => { changeRole(acc.id, 'admin'); setActiveMenu(null); }}>
                                                                <AdminPanelSettingsIcon style={{ fontSize: 16, color: '#991b1b' }} />
                                                                Cấp quyền Quản trị viên
                                                            </button>
                                                        )}
                                                        {acc.role !== 'manager' && (
                                                            <button className="acl-dropdown-item" onClick={() => { changeRole(acc.id, 'manager'); setActiveMenu(null); }}>
                                                                <VerifiedUserIcon style={{ fontSize: 16, color: '#1e40af' }} />
                                                                Cấp quyền Quản lý
                                                            </button>
                                                        )}
                                                        {acc.role !== 'member' && (
                                                            <button className="acl-dropdown-item" onClick={() => { changeRole(acc.id, 'member'); setActiveMenu(null); }}>
                                                                <PeopleIcon style={{ fontSize: 16, color: '#166534' }} />
                                                                Đổi thành Thành viên
                                                            </button>
                                                        )}
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

            {viewAccount && (
                <div className="acl-modal-overlay" onClick={() => setViewAccount(null)}>
                    <div className="acl-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '440px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px', borderBottom: '1px solid #f3f4f6', paddingBottom: '16px' }}>
                            <div className="acl-avatar" style={{ width: '56px', height: '56px', fontSize: '20px', background: getAvatarGradient(viewAccount.role) }}>
                                {viewAccount.avatar}
                            </div>
                            <div>
                                <h2 style={{ margin: '0 0 4px 0', fontSize: '18px', color: 'var(--text-primary)' }}>{viewAccount.fullName}</h2>
                                <p style={{ margin: 0, fontSize: '14px', color: 'var(--text-muted)' }}>{viewAccount.email}</p>
                            </div>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                            <div>
                                <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Vai trò</span>
                                {getRoleBadge(viewAccount.role)}
                            </div>
                            <div>
                                <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Trạng thái</span>
                                {getStatusBadge(viewAccount.status)}
                            </div>
                            <div>
                                <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Phòng ban</span>
                                <span className="acl-dept-badge">{viewAccount.department || 'Chưa cập nhật'}</span>
                            </div>
                            <div>
                                <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Ngày tham gia</span>
                                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>{viewAccount.joinDate}</span>
                            </div>
                            <div style={{ gridColumn: 'span 2' }}>
                                <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>Hoạt động gần nhất</span>
                                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>{viewAccount.lastActive}</span>
                            </div>
                        </div>
                        <div className="acl-modal-actions" style={{ justifyContent: 'flex-end' }}>
                            <button className="acl-modal-btn-cancel" onClick={() => setViewAccount(null)} style={{ background: 'var(--bg-hover)', color: 'var(--text-secondary)', border: 'none', fontWeight: 600 }}>Đóng</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}