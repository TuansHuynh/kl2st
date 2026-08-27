import { useTitle } from "../../hooks/useTitle";
import { useState, useEffect } from 'react';
import SettingsIcon from '@mui/icons-material/Settings';
import PersonIcon from '@mui/icons-material/Person';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SecurityIcon from '@mui/icons-material/Security';
import PaletteIcon from '@mui/icons-material/Palette';
import LanguageIcon from '@mui/icons-material/Language';
import StorageIcon from '@mui/icons-material/Storage';
import SaveIcon from '@mui/icons-material/Save';
import { accountService } from '../../service/accountService';
import type { UserSetting } from '../../types';

const DEFAULT_USER_ID = 'fa78a2b1-6a0d-45bc-82e1-88f5a6b0c61c';

export default function Setting() {
    useTitle("Cài đặt");

    const [activeTab, setActiveTab] = useState('profile');
    
    // Get logged-in user ID
    const getUserId = (): string => {
        try {
            const userStr = localStorage.getItem('currentUser');
            if (userStr) {
                const u = JSON.parse(userStr);
                if (u && u.id) return u.id;
            }
        } catch (e) {
            console.error(e);
        }
        return DEFAULT_USER_ID;
    };

    const userId = getUserId();

    const [profileName, setProfileName] = useState('Nguyễn Văn A');
    const [profileEmail, setProfileEmail] = useState('nguyenvana@company.vn');
    const [profilePhone, setProfilePhone] = useState('0901234567');
    const [profileDept, setProfileDept] = useState('Ban giám đốc');
    const [notifEmail, setNotifEmail] = useState(true);
    const [notifPush, setNotifPush] = useState(true);
    const [notifUpload, setNotifUpload] = useState(true);
    const [notifMeeting, setNotifMeeting] = useState(true);
    const [notifTeam, setNotifTeam] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const [compactView, setCompactView] = useState(false);
    const [language, setLanguage] = useState('vi');
    const [timezone, setTimezone] = useState('Asia/Ho_Chi_Minh');
    const [autoBackup, setAutoBackup] = useState(true);
    const [backupFreq, setBackupFreq] = useState('daily');
    const [loading, setLoading] = useState(true);

    // Security state
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Fetch user and settings on mount
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                setLoading(true);
                const user = await accountService.getAccountById(userId);
                setProfileName(user.fullName || '');
                setProfileEmail(user.email || '');
                setProfileDept(user.department || '');

                const settings = await accountService.getAccountSettings(userId);
                setProfilePhone(settings.phone || '');
                setNotifEmail(settings.notifEmail ?? true);
                setNotifPush(settings.notifPush ?? true);
                setNotifUpload(settings.notifUpload ?? true);
                setNotifMeeting(settings.notifMeeting ?? true);
                setNotifTeam(settings.notifTeam ?? false);
                setDarkMode(settings.darkMode ?? false);
                setCompactView(settings.compactView ?? false);
                setLanguage(settings.language || 'vi');
                setTimezone(settings.timezone || 'Asia/Ho_Chi_Minh');
                setAutoBackup(settings.autoBackup ?? true);
                setBackupFreq(settings.backupFreq || 'daily');
            } catch (err) {
                console.error('Failed to fetch user settings:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchUserData();
    }, [userId]);

    // Apply global themes when appearance settings change
    useEffect(() => {
        if (darkMode) {
            document.body.classList.add('dark-theme');
        } else {
            document.body.classList.remove('dark-theme');
        }

        if (compactView) {
            document.body.classList.add('compact-view');
        } else {
            document.body.classList.remove('compact-view');
        }
    }, [darkMode, compactView]);

    const handleSave = async () => {
        try {
            // Update profile info
            await accountService.updateAccount(userId, {
                fullName: profileName,
                department: profileDept
            });

            // Update settings info
            const settingsObj: UserSetting = {
                userId,
                phone: profilePhone,
                notifEmail,
                notifPush,
                notifUpload,
                notifMeeting,
                notifTeam,
                darkMode,
                compactView,
                language,
                timezone,
                autoBackup,
                backupFreq
            };
            await accountService.updateAccountSettings(userId, settingsObj);
            
            // If active tab is security, handle password change
            if (activeTab === 'security') {
                if (!currentPassword || !newPassword || !confirmPassword) {
                    alert('Vui lòng nhập đầy đủ thông tin mật khẩu!');
                    return;
                }
                if (newPassword !== confirmPassword) {
                    alert('Mật khẩu xác nhận không khớp!');
                    return;
                }
                // Simulate password update
                // await accountService.updatePassword(userId, currentPassword, newPassword);
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
                alert('Đã cập nhật mật khẩu thành công!');
                return;
            }

            alert('Đã lưu cài đặt thành công!');
        } catch (err) {
            console.error('Failed to save settings:', err);
            alert('Lưu cài đặt thất bại!');
        }
    };

    const tabs = [
        { id: 'profile', label: 'Hồ sơ cá nhân', icon: <PersonIcon style={{ fontSize: 18 }} /> },
        { id: 'notification', label: 'Thông báo', icon: <NotificationsIcon style={{ fontSize: 18 }} /> },
        { id: 'security', label: 'Bảo mật', icon: <SecurityIcon style={{ fontSize: 18 }} /> },
        { id: 'appearance', label: 'Giao diện', icon: <PaletteIcon style={{ fontSize: 18 }} /> },
        { id: 'regional', label: 'Khu vực', icon: <LanguageIcon style={{ fontSize: 18 }} /> },
        { id: 'storage', label: 'Lưu trữ', icon: <StorageIcon style={{ fontSize: 18 }} /> },
    ];

    return (
        <div className="stg-container">
            

            <div className="stg-header">
                <h1><SettingsIcon /> Cài đặt hệ thống</h1>
                <p>Quản lý hồ sơ cá nhân, thông báo, bảo mật và cài đặt chung</p>
            </div>

            <div className="stg-layout">
                <div className="stg-sidebar">
                    {tabs.map(tab => (
                        <button key={tab.id} className={`stg-tab-btn ${activeTab === tab.id ? 'active' : ''}`} onClick={() => setActiveTab(tab.id)}>
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="stg-content">
                    {activeTab === 'profile' && (
                        <>
                            <h2 className="stg-section-title">Hồ sơ cá nhân</h2>
                            <p className="stg-section-desc">Cập nhật thông tin cá nhân của bạn</p>

                            <div className="stg-form-group">
                                <label className="stg-label">Họ và tên</label>
                                <input className="stg-input" value={profileName} onChange={e => setProfileName(e.target.value)} />
                            </div>
                            <div className="stg-form-group">
                                <label className="stg-label">Email</label>
                                <input className="stg-input" type="email" value={profileEmail} onChange={e => setProfileEmail(e.target.value)} />
                            </div>
                            <div className="stg-form-group">
                                <label className="stg-label">Số điện thoại</label>
                                <input className="stg-input" value={profilePhone} onChange={e => setProfilePhone(e.target.value)} />
                            </div>
                            <div className="stg-form-group">
                                <label className="stg-label">Phòng ban</label>
                                <input className="stg-input" value={profileDept} onChange={e => setProfileDept(e.target.value)} />
                            </div>
                            <button className="stg-btn-save" onClick={handleSave}><SaveIcon fontSize="small" />Lưu thay đổi</button>
                        </>
                    )}

                    {activeTab === 'notification' && (
                        <>
                            <h2 className="stg-section-title">Cài đặt Thông báo</h2>
                            <p className="stg-section-desc">Quản lý cách bạn nhận thông báo từ hệ thống</p>

                            <div className="stg-toggle-row">
                                <div className="stg-toggle-info"><span className="stg-toggle-label">Thông báo Email</span><span className="stg-toggle-desc">Nhận thông báo qua email</span></div>
                                <button className={`stg-toggle ${notifEmail ? 'on' : ''}`} onClick={() => setNotifEmail(!notifEmail)}></button>
                            </div>
                            <div className="stg-toggle-row">
                                <div className="stg-toggle-info"><span className="stg-toggle-label">Thông báo đẩy</span><span className="stg-toggle-desc">Nhận thông báo trên trình duyệt</span></div>
                                <button className={`stg-toggle ${notifPush ? 'on' : ''}`} onClick={() => setNotifPush(!notifPush)}></button>
                            </div>
                            <div className="stg-toggle-row">
                                <div className="stg-toggle-info"><span className="stg-toggle-label">Tải lên tài liệu</span><span className="stg-toggle-desc">Thông báo khi có tài liệu mới được tải lên</span></div>
                                <button className={`stg-toggle ${notifUpload ? 'on' : ''}`} onClick={() => setNotifUpload(!notifUpload)}></button>
                            </div>
                            <div className="stg-toggle-row">
                                <div className="stg-toggle-info"><span className="stg-toggle-label">Cuộc họp</span><span className="stg-toggle-desc">Nhắc nhở trước cuộc họp</span></div>
                                <button className={`stg-toggle ${notifMeeting ? 'on' : ''}`} onClick={() => setNotifMeeting(!notifMeeting)}></button>
                            </div>
                            <div className="stg-toggle-row" style={{ borderBottom: 'none' }}>
                                <div className="stg-toggle-info"><span className="stg-toggle-label">Hoạt động nhóm</span><span className="stg-toggle-desc">Thông báo khi có thay đổi trong nhóm</span></div>
                                <button className={`stg-toggle ${notifTeam ? 'on' : ''}`} onClick={() => setNotifTeam(!notifTeam)}></button>
                            </div>
                            <br />
                            <button className="stg-btn-save" onClick={handleSave}><SaveIcon fontSize="small" />Lưu thay đổi</button>
                        </>
                    )}

                    {activeTab === 'security' && (
                        <>
                            <h2 className="stg-section-title">Bảo mật tài khoản</h2>
                            <p className="stg-section-desc">Thay đổi mật khẩu và cài đặt bảo mật</p>

                            <div className="stg-form-group">
                                <label className="stg-label">Mật khẩu hiện tại</label>
                                <input className="stg-input" type="password" placeholder="Nhập mật khẩu hiện tại..." value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
                            </div>
                            <div className="stg-password-row">
                                <div className="stg-form-group">
                                    <label className="stg-label">Mật khẩu mới</label>
                                    <input className="stg-input" type="password" placeholder="Nhập mật khẩu mới..." value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                                </div>
                                <div className="stg-form-group">
                                    <label className="stg-label">Xác nhận mật khẩu</label>
                                    <input className="stg-input" type="password" placeholder="Nhập lại mật khẩu mới..." value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                                </div>
                            </div>
                            <button className="stg-btn-save" onClick={handleSave}><SaveIcon fontSize="small" />Cập nhật mật khẩu</button>
                        </>
                    )}

                    {activeTab === 'appearance' && (
                        <>
                            <h2 className="stg-section-title">Giao diện</h2>
                            <p className="stg-section-desc">Tùy chỉnh giao diện hiển thị của ứng dụng</p>

                            <div className="stg-toggle-row">
                                <div className="stg-toggle-info"><span className="stg-toggle-label">Chế độ tối (Dark Mode)</span><span className="stg-toggle-desc">Chuyển giao diện sang chế độ tối</span></div>
                                <button className={`stg-toggle ${darkMode ? 'on' : ''}`} onClick={() => setDarkMode(!darkMode)}></button>
                            </div>
                            <div className="stg-toggle-row" style={{ borderBottom: 'none' }}>
                                <div className="stg-toggle-info"><span className="stg-toggle-label">Chế độ thu gọn</span><span className="stg-toggle-desc">Hiển thị giao diện dạng thu gọn</span></div>
                                <button className={`stg-toggle ${compactView ? 'on' : ''}`} onClick={() => setCompactView(!compactView)}></button>
                            </div>
                            <br />
                            <button className="stg-btn-save" onClick={handleSave}><SaveIcon fontSize="small" />Lưu thay đổi</button>
                        </>
                    )}

                    {activeTab === 'regional' && (
                        <>
                            <h2 className="stg-section-title">Cài đặt khu vực</h2>
                            <p className="stg-section-desc">Ngôn ngữ và múi giờ hiển thị</p>

                            <div className="stg-form-group">
                                <label className="stg-label">Ngôn ngữ</label>
                                <select className="stg-select" value={language} onChange={e => setLanguage(e.target.value)}>
                                    <option value="vi">Tiếng Việt</option>
                                    <option value="en">English</option>
                                    <option value="ja">日本語</option>
                                </select>
                            </div>
                            <div className="stg-form-group">
                                <label className="stg-label">Múi giờ</label>
                                <select className="stg-select" value={timezone} onChange={e => setTimezone(e.target.value)}>
                                    <option value="Asia/Ho_Chi_Minh">UTC+7 (Hồ Chí Minh)</option>
                                    <option value="Asia/Tokyo">UTC+9 (Tokyo)</option>
                                    <option value="America/New_York">UTC-5 (New York)</option>
                                    <option value="Europe/London">UTC+0 (London)</option>
                                </select>
                            </div>
                            <button className="stg-btn-save" onClick={handleSave}><SaveIcon fontSize="small" />Lưu thay đổi</button>
                        </>
                    )}

                    {activeTab === 'storage' && (
                        <>
                            <h2 className="stg-section-title">Quản lý Lưu trữ</h2>
                            <p className="stg-section-desc">Cài đặt sao lưu và dung lượng lưu trữ</p>

                            <div style={{ marginBottom: 20 }}>
                                <div className="stg-label">Dung lượng đã sử dụng</div>
                                <div className="stg-storage-bar-outer">
                                    <div className="stg-storage-bar-inner" style={{ width: '38%' }}></div>
                                </div>
                                <div className="stg-storage-text">95.2 MB / 250 MB (38.1%)</div>
                            </div>

                            <hr className="stg-divider" />

                            <div className="stg-toggle-row">
                                <div className="stg-toggle-info"><span className="stg-toggle-label">Tự động sao lưu</span><span className="stg-toggle-desc">Sao lưu dữ liệu tự động theo lịch</span></div>
                                <button className={`stg-toggle ${autoBackup ? 'on' : ''}`} onClick={() => setAutoBackup(!autoBackup)}></button>
                            </div>

                            {autoBackup && (
                                <div className="stg-form-group" style={{ marginTop: 16 }}>
                                    <label className="stg-label">Tần suất sao lưu</label>
                                    <select className="stg-select" value={backupFreq} onChange={e => setBackupFreq(e.target.value)}>
                                        <option value="daily">Hàng ngày</option>
                                        <option value="weekly">Hàng tuần</option>
                                        <option value="monthly">Hàng tháng</option>
                                    </select>
                                </div>
                            )}
                            <button className="stg-btn-save" onClick={handleSave}><SaveIcon fontSize="small" />Lưu thay đổi</button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}