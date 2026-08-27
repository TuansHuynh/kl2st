import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
    Notifications,
    NotificationsNone,
    Search as SearchIcon,
    Close,
    Description as DescriptionIcon,
    Groups as GroupsIcon,
    CalendarToday as CalendarTodayIcon
} from "@mui/icons-material";
import { Input, Logo, PreviewModal } from "../components";
import UserWidget from "../components/common/User";
import { documentService } from "../service/documentService";
import { teamService } from "../service/teamService";
import { meetingService } from "../service/meetingService";

interface Notification {
    id: string;
    title: string;
    message: string;
    time: string;
    read: boolean;
}

export default function Header() {
    
    const currentUserId = useMemo(() => {
        const stored = localStorage.getItem('currentUser');
        if (stored) {
            try {
                return JSON.parse(stored)?.id || '';
            } catch { return ''; }
        }
        return '';
    }, []);
const navigate = useNavigate();
    const [search, setSearch] = useState("");
    const [searchFocused, setSearchFocused] = useState(false);
    const [previewDoc, setPreviewDoc] = useState<{ url: string, type: string, name: string, blobType: string } | null>(null);

    // Suggestion states
    const [allDocs, setAllDocs] = useState<any[]>([]);
    const [allTeams, setAllTeams] = useState<any[]>([]);
    const [allMeetings, setAllMeetings] = useState<any[]>([]);
    const [suggestions, setSuggestions] = useState<{
        documents: any[];
        teams: any[];
        meetings: any[];
    }>({ documents: [], teams: [], meetings: [] });
    const [showSuggestions, setShowSuggestions] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    // Notification state
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [showNotifPanel, setShowNotifPanel] = useState(false);
    const notifRef = useRef<HTMLDivElement>(null);

    // Load notifications placeholder (will be replaced when backend notification API exists)
    useEffect(() => {
        const stored = localStorage.getItem('currentUser');
        if (stored) {
            setNotifications([]);
        }
    }, []);

    // Close notification panel and search suggestions on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
                setShowNotifPanel(false);
            }
            if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Load suggestion resources when user focuses on the search bar
    const handleSearchFocus = async () => {
        setSearchFocused(true);
        setShowSuggestions(true);
        try {
            const [docs, teams, meetings] = await Promise.all([
                documentService.getAllDocuments('all', currentUserId),
                teamService.getAllTeams(),
                meetingService.getAllMeetings()
            ]);
            setAllDocs(docs);
            setAllTeams(teams);
            setAllMeetings(meetings);
        } catch (err) {
            console.error("Failed to load suggestion sources:", err);
        }
    };

    // Filter suggestions based on typed input
    useEffect(() => {
        if (!search.trim()) {
            setSuggestions({ documents: [], teams: [], meetings: [] });
            return;
        }
        const term = search.toLowerCase();
        
        const matchedDocs = allDocs.filter(d => d.name.toLowerCase().includes(term)).slice(0, 4);
        const matchedTeams = allTeams.filter(t => t.name.toLowerCase().includes(term)).slice(0, 4);
        const matchedMeetings = allMeetings.filter(m => m.title.toLowerCase().includes(term)).slice(0, 4);

        setSuggestions({
            documents: matchedDocs,
            teams: matchedTeams,
            meetings: matchedMeetings
        });
    }, [search, allDocs, allTeams, allMeetings, currentUserId]);

    const unreadCount = notifications.filter(n => !n.read).length;

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Since search boxes are independent, just close suggestions on submit
        setShowSuggestions(false);
    };

    const handleDocClick = async (doc: any) => {
        try {
            const blob = await documentService.downloadDocument(doc.id);
            const url = URL.createObjectURL(blob);
            setPreviewDoc({ url, type: doc.type, name: doc.name, blobType: blob.type });
        } catch (err) {
            console.error('Open failed:', err);
            alert('Mở tài liệu thất bại!');
        }
        setShowSuggestions(false);
        setSearch("");
    };

    const handleIconClick = (e: React.MouseEvent, doc: any) => {
        e.stopPropagation();
        let path = "/";
        switch (doc.type) {
            case "pdf": path = "/pdf"; break;
            case "word": path = "/word"; break;
            case "excel": path = "/excel"; break;
            case "image": path = "/media"; break;
            case "zip": path = "/zip"; break;
            case "note": path = "/note"; break;
            case "other": path = "/different"; break;
            default: path = `/${doc.type || ''}`;
        }
        navigate(path);
        setShowSuggestions(false);
        setSearch("");
    };

    const markAllRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    return (
        <div className="header">
            <Logo />

            {/* Search */}
            <div ref={searchRef} style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
                <form
                    className="search"
                    onSubmit={handleSearchSubmit}
                    style={{ position: 'relative', width: '100%' }}
                >
                    <Input
                        type="text"
                        input="Tìm kiếm toàn hệ thống..."
                        classname={`input-search${searchFocused ? ' focused' : ''}`}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        onFocus={handleSearchFocus}
                    />
                    {search && (
                        <Close
                            onClick={() => setSearch('')}
                            sx={{
                                fontSize: 20,
                                color: 'var(--text-muted)',
                                cursor: 'pointer',
                                position: 'absolute',
                                right: 48,
                                top: '50%',
                                transform: 'translateY(-50%)',
                                transition: 'color 0.2s',
                                '&:hover': { color: 'var(--text-primary)' },
                            }}
                        />
                    )}
                    <button
                        type="submit"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                        aria-label="Search"
                    >
                        <div className="search-icon">
                            <SearchIcon className="search-bar" />
                        </div>
                    </button>
                </form>

                {/* Suggestions panel */}
                {showSuggestions && search.trim() && (
                    <div
                        style={{
                            position: 'absolute',
                            top: 'calc(100% + 6px)',
                            left: 0,
                            right: 0,
                            backgroundColor: 'var(--bg-secondary)',
                            borderRadius: '12px',
                            border: '1px solid #e2e8f0',
                            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                            zIndex: 9999,
                            maxHeight: '380px',
                            overflowY: 'auto',
                            padding: '8px 0',
                        }}
                    >
                        {suggestions.documents.length === 0 &&
                         suggestions.teams.length === 0 &&
                         suggestions.meetings.length === 0 ? (
                            <div style={{ padding: '16px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                                Không tìm thấy gợi ý nào...
                            </div>
                        ) : (
                            <>
                                {/* Documents */}
                                {suggestions.documents.length > 0 && (
                                    <div>
                                        <div style={styles.suggestionHeader}>TÀI LIỆU</div>
                                        {suggestions.documents.map(doc => (
                                            <div
                                                key={doc.id}
                                                style={styles.suggestionItem}
                                                onClick={() => handleDocClick(doc)}
                                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)')}
                                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                                                title="Mở / Tải tài liệu"
                                            >
                                                <div
                                                    onClick={(e) => handleIconClick(e, doc)}
                                                    style={{ display: 'flex', alignItems: 'center', borderRadius: '4px', padding: '2px', marginLeft: '-2px' }}
                                                    title="Đi đến thư mục chứa tài liệu"
                                                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--border-color)'; }}
                                                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                                                >
                                                    <DescriptionIcon style={styles.suggestionIcon} />
                                                </div>
                                                <span style={styles.suggestionText}>{doc.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Teams */}
                                {suggestions.teams.length > 0 && (
                                    <div>
                                        <div style={styles.suggestionHeader}>NHÓM LÀM VIỆC</div>
                                        {suggestions.teams.map(team => (
                                            <div
                                                key={team.id}
                                                style={styles.suggestionItem}
                                                onClick={() => {
                                                    navigate(`/team-info?id=${team.id}`);
                                                    setShowSuggestions(false);
                                                    setSearch("");
                                                }}
                                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)')}
                                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                                            >
                                                <GroupsIcon style={styles.suggestionIcon} />
                                                <span style={styles.suggestionText}>{team.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Meetings */}
                                {suggestions.meetings.length > 0 && (
                                    <div>
                                        <div style={styles.suggestionHeader}>CUỘC HỌP</div>
                                        {suggestions.meetings.map(meeting => (
                                            <div
                                                key={meeting.id}
                                                style={styles.suggestionItem}
                                                onClick={() => {
                                                    navigate(`/meeting-info?id=${meeting.id}`);
                                                    setShowSuggestions(false);
                                                    setSearch("");
                                                }}
                                                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)')}
                                                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                                            >
                                                <CalendarTodayIcon style={styles.suggestionIcon} />
                                                <span style={styles.suggestionText}>{meeting.title}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>

            {/* Right section: notifications + user */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {/* Notification bell */}
                <div ref={notifRef} style={{ position: 'relative' }}>
                    <button
                        onClick={() => setShowNotifPanel(prev => !prev)}
                        aria-label="Notifications"
                        style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            position: 'relative',
                            padding: 6,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'background 0.2s',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(59,130,246,0.08)')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = 'none')}
                    >
                        {unreadCount > 0 ? (
                            <Notifications sx={{ fontSize: 26, color: '#3b82f6' }} />
                        ) : (
                            <NotificationsNone sx={{ fontSize: 26, color: '#94a3b8' }} />
                        )}
                        {unreadCount > 0 && (
                            <span
                                style={{
                                    position: 'absolute',
                                    top: 2,
                                    right: 2,
                                    background: '#ef4444',
                                    color: 'var(--bg-secondary)',
                                    fontSize: 10,
                                    fontWeight: 700,
                                    borderRadius: '50%',
                                    width: 18,
                                    height: 18,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    lineHeight: 1,
                                }}
                            >
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </button>

                    {/* Notification dropdown panel */}
                    {showNotifPanel && (
                        <div
                            style={{
                                position: 'absolute',
                                top: 'calc(100% + 8px)',
                                right: 0,
                                width: 340,
                                maxHeight: 400,
                                overflowY: 'auto',
                                background: 'var(--bg-secondary)',
                                borderRadius: 12,
                                boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                                border: '1px solid #e2e8f0',
                                zIndex: 1000,
                                padding: 0,
                            }}
                        >
                            <div style={{
                                padding: '14px 16px 10px',
                                borderBottom: '1px solid #f1f5f9',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                            }}>
                                <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--text-primary)' }}>
                                    Thông báo
                                </span>
                                {unreadCount > 0 && (
                                    <button
                                        onClick={markAllRead}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: '#3b82f6',
                                            fontSize: 12,
                                            cursor: 'pointer',
                                            fontWeight: 600,
                                        }}
                                    >
                                        Đánh dấu tất cả đã đọc
                                    </button>
                                )}
                            </div>

                            {notifications.length === 0 ? (
                                <div style={{
                                    padding: '32px 16px',
                                    textAlign: 'center',
                                    color: '#94a3b8',
                                    fontSize: 13,
                                }}>
                                    Không có thông báo mới
                                </div>
                            ) : (
                                notifications.map(n => (
                                    <div
                                        key={n.id}
                                        style={{
                                            padding: '12px 16px',
                                            borderBottom: '1px solid #f8fafc',
                                            background: n.read ? 'var(--bg-secondary)' : '#f0f9ff',
                                            cursor: 'pointer',
                                            transition: 'background 0.15s',
                                        }}
                                        onClick={() => {
                                            setNotifications(prev =>
                                                prev.map(item => item.id === n.id ? { ...item, read: true } : item)
                                            );
                                        }}
                                        onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-tertiary)')}
                                        onMouseLeave={(e) => (e.currentTarget.style.background = n.read ? 'var(--bg-secondary)' : '#f0f9ff')}
                                    >
                                        <div style={{ fontWeight: n.read ? 500 : 700, fontSize: 13, color: 'var(--text-primary)', marginBottom: 3 }}>
                                            {n.title}
                                        </div>
                                        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
                                            {n.message}
                                        </div>
                                        <div style={{ fontSize: 11, color: '#94a3b8' }}>
                                            {n.time}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>

                {/* User widget */}
                <UserWidget />
            </div>

            {/* Document Preview Modal */}
            <PreviewModal 
                isOpen={!!previewDoc} 
                onClose={() => {
                    if (previewDoc) URL.revokeObjectURL(previewDoc.url);
                    setPreviewDoc(null);
                }} 
                previewDoc={previewDoc} 
            />
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    suggestionHeader: {
        fontSize: '11px',
        fontWeight: 700,
        color: 'var(--text-muted)',
        padding: '10px 16px 4px',
        letterSpacing: '0.05em',
        backgroundColor: 'var(--bg-primary)',
        borderBottom: '1px solid #f1f5f9',
        borderTop: '1px solid #f1f5f9',
        margin: '6px 0 2px',
    },
    suggestionItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '10px 16px',
        cursor: 'pointer',
        transition: 'background-color 0.15s ease',
    },
    suggestionIcon: {
        fontSize: '18px',
        color: '#94a3b8',
    },
    suggestionText: {
        fontSize: '13.5px',
        color: '#334155',
        fontWeight: 500,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        flex: 1,
    },
};