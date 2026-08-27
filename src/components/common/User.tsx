import { AccountCircle, Logout } from "@mui/icons-material"
import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import type { User } from "../../types"

export default function UserWidget() {
    const navigate = useNavigate();
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        const stored = localStorage.getItem('currentUser');
        if (stored) {
            try {
                setUser(JSON.parse(stored));
            } catch {
                setUser(null);
            }
        }
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        navigate("/login");
    };

    const handleLogin = () => {
        navigate("/login");
    };

    if (!user) {
        return (
            <div className="user" onClick={handleLogin} style={{ cursor: 'pointer' }}>
                <AccountCircle className="avatar-img" sx={{ fontSize: 40, color: '#94a3b8' }} />
                <div className="user-info">
                    <span className="user-name" style={{ fontSize: 13, color: '#94a3b8' }}>Đăng nhập</span>
                </div>
            </div>
        );
    }

    // Build initials from fullName for fallback avatar
    const initials = user.fullName
        ?.split(' ')
        .map(w => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || '?';

    return (
        <div className="user">
            {user.avatar ? (
                <img
                    className="avatar-img"
                    src={user.avatar}
                    alt={user.fullName}
                    title={user.fullName}
                    onError={(e) => {
                        // Fallback: hide broken image and show initials
                        (e.target as HTMLImageElement).style.display = 'none';
                    }}
                />
            ) : (
                <div
                    className="avatar-img"
                    style={{
                        width: '7dvh',
                        height: '7dvh',
                        borderRadius: '35%',
                        background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--bg-secondary)',
                        fontWeight: 700,
                        fontSize: '1.1rem',
                        letterSpacing: 1,
                        flexShrink: 0,
                    }}
                    title={user.fullName}
                >
                    {initials}
                </div>
            )}
            <div className="user-info">
                <h3 className="user-name">{user.fullName}</h3>
                <button className="button-logout" onClick={handleLogout} title="Đăng xuất">
                    <Logout sx={{ fontSize: 16, marginRight: '4px', verticalAlign: 'middle' }} />
                    Logout
                </button>
            </div>
        </div>
    );
}