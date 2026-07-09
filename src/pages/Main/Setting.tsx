import { useTitle } from "../../hooks/useTitle";
import { useState } from 'react';
import SettingsIcon from '@mui/icons-material/Settings';
import PersonIcon from '@mui/icons-material/Person';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SecurityIcon from '@mui/icons-material/Security';
import PaletteIcon from '@mui/icons-material/Palette';
import LanguageIcon from '@mui/icons-material/Language';
import StorageIcon from '@mui/icons-material/Storage';
import SaveIcon from '@mui/icons-material/Save';

export default function Setting() {
    useTitle("Cài đặt");

    const [activeTab, setActiveTab] = useState('profile');
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

    const handleSave = () => {
        alert('Đã lưu cài đặt thành công!');
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
            <style>{`
                .stg-container {
                    padding: 24px; color: #1f2937; font-family: 'Roboto', 'Inter', sans-serif;
                    box-sizing: border-box; background-color: #f9fafb; min-height: calc(100vh - 10dvh); width: 100%;
                }
                .stg-header { margin-bottom: 24px; }
                .stg-header h1 { font-size: 24px; font-weight: 700; color: #111827; margin: 0 0 4px 0; display: flex; align-items: center; gap: 10px; }
                .stg-header h1 svg { color: #6366f1; font-size: 28px; }
                .stg-header p { font-size: 14px; color: #6b7280; margin: 0; }

                .stg-layout { display: flex; gap: 24px; }

                .stg-sidebar {
                    width: 240px; flex-shrink: 0;
                    background: #ffffff; border-radius: 12px; border: 1px solid #e5e7eb;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.05); overflow: hidden;
                    height: fit-content;
                }

                .stg-tab-btn {
                    display: flex; align-items: center; gap: 10px; width: 100%; padding: 14px 18px;
                    border: none; background: transparent; cursor: pointer; font-size: 14px;
                    color: #6b7280; font-weight: 500; text-align: left; transition: all 0.15s;
                    border-left: 3px solid transparent;
                }
                .stg-tab-btn:hover { background: #f9fafb; color: #111827; }
                .stg-tab-btn.active { background: #eef2ff; color: #4f46e5; font-weight: 600; border-left-color: #4f46e5; }

                .stg-content {
                    flex: 1; background: #ffffff; border-radius: 12px; border: 1px solid #e5e7eb;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.05); padding: 24px;
                }

                .stg-section-title { font-size: 18px; font-weight: 700; color: #111827; margin: 0 0 4px 0; }
                .stg-section-desc { font-size: 13px; color: #9ca3af; margin: 0 0 24px 0; }
                .stg-divider { border: none; border-top: 1px solid #e5e7eb; margin: 24px 0; }

                .stg-form-group { margin-bottom: 18px; }
                .stg-label { display: block; font-size: 13px; font-weight: 600; color: #374151; margin-bottom: 6px; }
                .stg-input {
                    width: 100%; max-width: 400px; padding: 10px 14px; border: 1px solid #d1d5db; border-radius: 8px;
                    font-size: 14px; outline: none; box-sizing: border-box; transition: border-color 0.2s;
                }
                .stg-input:focus { border-color: #4f46e5; box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.15); }
                .stg-select {
                    width: 100%; max-width: 400px; padding: 10px 14px; border: 1px solid #d1d5db; border-radius: 8px;
                    font-size: 14px; outline: none; box-sizing: border-box; background: white; cursor: pointer;
                }
                .stg-select:focus { border-color: #4f46e5; }

                .stg-toggle-row {
                    display: flex; justify-content: space-between; align-items: center;
                    padding: 12px 0; border-bottom: 1px solid #f3f4f6;
                }
                .stg-toggle-info { display: flex; flex-direction: column; }
                .stg-toggle-label { font-size: 14px; font-weight: 500; color: #111827; }
                .stg-toggle-desc { font-size: 12px; color: #9ca3af; margin-top: 2px; }

                .stg-toggle {
                    position: relative; width: 44px; height: 24px; background: #d1d5db;
                    border-radius: 12px; cursor: pointer; transition: background 0.2s; border: none;
                    flex-shrink: 0;
                }
                .stg-toggle.on { background: #4f46e5; }
                .stg-toggle::after {
                    content: ''; position: absolute; top: 2px; left: 2px;
                    width: 20px; height: 20px; background: white; border-radius: 50%;
                    transition: transform 0.2s; box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                }
                .stg-toggle.on::after { transform: translateX(20px); }

                .stg-btn-save {
                    display: inline-flex; align-items: center; gap: 8px;
                    background-color: #4f46e5; color: white; border: none; border-radius: 8px;
                    padding: 10px 20px; font-size: 14px; font-weight: 600; cursor: pointer;
                    transition: all 0.2s ease; margin-top: 8px;
                    box-shadow: 0 4px 6px -1px rgba(79, 70, 229, 0.2);
                }
                .stg-btn-save:hover { background-color: #4338ca; transform: translateY(-1px); }
                .stg-btn-save:active { transform: translateY(0); }

                .stg-password-row { display: flex; gap: 12px; flex-wrap: wrap; }
                .stg-password-row .stg-form-group { flex: 1; min-width: 180px; }

                .stg-storage-bar-outer { height: 10px; background: #f3f4f6; border-radius: 9999px; overflow: hidden; margin-top: 8px; margin-bottom: 8px; max-width: 400px; }
                .stg-storage-bar-inner { height: 100%; background: linear-gradient(90deg, #4f46e5 0%, #818cf8 100%); border-radius: 9999px; transition: width 0.4s; }
                .stg-storage-text { font-size: 13px; color: #6b7280; }

                @media (max-width: 768px) {
                    .stg-layout { flex-direction: column; }
                    .stg-sidebar { width: 100%; display: flex; overflow-x: auto; }
                    .stg-tab-btn { white-space: nowrap; border-left: none; border-bottom: 3px solid transparent; }
                    .stg-tab-btn.active { border-bottom-color: #4f46e5; border-left: none; }
                }
            `}</style>

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
                                <input className="stg-input" type="password" placeholder="Nhập mật khẩu hiện tại..." />
                            </div>
                            <div className="stg-password-row">
                                <div className="stg-form-group">
                                    <label className="stg-label">Mật khẩu mới</label>
                                    <input className="stg-input" type="password" placeholder="Nhập mật khẩu mới..." />
                                </div>
                                <div className="stg-form-group">
                                    <label className="stg-label">Xác nhận mật khẩu</label>
                                    <input className="stg-input" type="password" placeholder="Nhập lại mật khẩu mới..." />
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