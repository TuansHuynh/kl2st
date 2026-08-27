import { useState, useEffect, useRef, useMemo } from "react";
import {
    SmartToy as AiIcon,
    Groups as TeamIcon,
    Send as SendIcon,
    Delete as ClearIcon,
    AutoAwesome as SparklesIcon,
    Lock as LockIcon
} from "@mui/icons-material";
import { chatService, type ChatMessage } from "../../service/chatService";
import { teamService } from "../../service/teamService";
import type { Team } from "../../types";
import { useNavigate } from "react-router-dom";

const QUICK_PROMPTS = [
    "Tóm tắt tài liệu mới",
    "Cuộc họp sắp tới",
    "Danh sách đội ngũ",
    "Hướng dẫn sử dụng"
];

export default function Chat() {
    const navigate = useNavigate();
    const [mode, setMode] = useState<'ai' | 'team'>('ai');
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputMessage, setInputMessage] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const [typingUser, setTypingUser] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const [hasJoinedTeam, setHasJoinedTeam] = useState(false);
    const [checkingTeam, setCheckingTeam] = useState(true);
    const [userTeams, setUserTeams] = useState<Team[]>([]);
    const [selectedTeamId, setSelectedTeamId] = useState<string>('');

    useEffect(() => {
        let isMounted = true;
        const checkTeam = async () => {
            try {
                const stored = localStorage.getItem('currentUser');
                const user = stored ? JSON.parse(stored) : null;
                if (!user) {
                    if (isMounted) { setHasJoinedTeam(false); setCheckingTeam(false); setUserTeams([]); }
                    return;
                }
                const teams = await teamService.getAllTeams();
                const myTeams = teams.filter(t => {
                    const isLeader = t.leaderId === user.id || t.leaderName === user.fullName;
                    const isMember = t.members?.some(m => m.id === user.id || m.fullName === user.fullName || m.email === user.email);
                    return isLeader || isMember;
                });
                if (isMounted) {
                    setHasJoinedTeam(myTeams.length > 0);
                    setUserTeams(myTeams);
                    if (myTeams.length > 0) {
                        setSelectedTeamId(prev => (!prev || !myTeams.some(mt => mt.id === prev)) ? myTeams[0].id : prev);
                    }
                }
            } catch (err) {
                console.error("Failed to check team membership:", err);
                if (isMounted) { setHasJoinedTeam(false); setUserTeams([]); }
            } finally {
                if (isMounted) setCheckingTeam(false);
            }
        };
        checkTeam();
        return () => { isMounted = false; };
    }, [mode]);

    // Fetch messages from chatService when mode or selectedTeamId changes
    // Fetch messages from chatService and poll for realtime updates
    useEffect(() => {
        let isMounted = true;
        const targetTeamId = mode === 'team' ? selectedTeamId : undefined;

        const loadMsgs = async () => {
            const msgs = await chatService.getMessages(mode, targetTeamId);
            if (isMounted) {
                setMessages((prev) => {
                    if (prev.length !== msgs.length || (msgs.length > 0 && prev[prev.length - 1]?.id !== msgs[msgs.length - 1]?.id)) {
                        return msgs;
                    }
                    return prev;
                });
            }
        };

        loadMsgs();
        const interval = setInterval(loadMsgs, 2000);

        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, [mode, selectedTeamId]);

    // Check if another team member is currently typing in the selected team chat
    useEffect(() => {
        if (mode !== 'team' || !selectedTeamId) {
            setTypingUser(null);
            return;
        }

        const checkTyping = async () => {
            if (mode !== 'team' || !selectedTeamId) {
                setTypingUser(null);
                return;
            }
            try {
                const stored = localStorage.getItem('currentUser');
                const myName = stored ? JSON.parse(stored)?.fullName : null;
                if (myName) {
                    const status = await chatService.getTypingStatus(selectedTeamId, myName);
                    if (status.typing && status.sender) {
                        setTypingUser(status.sender);
                        return;
                    }
                }
            } catch { /* ignore */ }
            setTypingUser(null);
        };

        checkTyping();
        const interval = setInterval(checkTyping, 2000);

        return () => {
            clearInterval(interval);
        };
    }, [mode, selectedTeamId]);

    // Auto scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // activeTypingUser: only show when ANOTHER member is typing, never for yourself
    const activeTypingUser = useMemo(() => {
        if (mode === 'ai') return null;
        return typingUser || null;
    }, [mode, typingUser]);

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping, activeTypingUser, mode]);

    const isMyMessage = (msg: ChatMessage) => {
        if (!msg) return false;
        if (mode === 'ai') return msg.role === 'user';
        const stored = localStorage.getItem('currentUser');
        if (stored) {
            try {
                const u = JSON.parse(stored);
                if (u?.fullName && msg.sender) {
                    return msg.sender.trim().toLowerCase() === u.fullName.trim().toLowerCase();
                }
            } catch { /* ignore */ }
        }
        return msg.role === 'user' || msg.sender === 'Tôi';
    };

    // Handle send message using chatService
    const handleSendMessage = async (textToSend?: string) => {
        const content = (textToSend || inputMessage).trim();
        if (!content) return;

        setInputMessage("");
        setIsTyping(true);

        const targetTeamId = mode === 'team' ? selectedTeamId : undefined;
        const { userMsg, replyMsg } = await chatService.sendMessage(mode, content, targetTeamId);
        setMessages((prev) => [...prev, userMsg]);

        if (replyMsg) {
            setTimeout(() => {
                setMessages((prev) => [...prev, replyMsg]);
                setIsTyping(false);
            }, 600);
        } else {
            setIsTyping(false);
        }
    };

    // Clear chat using chatService
    const handleClearChat = async () => {
        const targetTeamId = mode === 'team' ? selectedTeamId : undefined;
        const currentTeam = userTeams.find(t => t.id === selectedTeamId);
        const nameConfirm = mode === 'ai' ? 'Trợ lý AI' : (currentTeam ? `nhóm "${currentTeam.name}"` : 'Team Chat');
        if (window.confirm(`Xóa toàn bộ tin nhắn trong ${nameConfirm}?`)) {
            await chatService.clearChat(mode, targetTeamId);
            const resetMsgs = await chatService.getMessages(mode, targetTeamId);
            setMessages(resetMsgs);
        }
    };

    return (
        <div className="chat-container">
            {/* Header / Tabs */}
            <div className="chat-header">
                <div className="chat-mode-tabs">
                    <button
                        className={`mode-tab ${mode === 'ai' ? 'active' : ''}`}
                        onClick={() => setMode('ai')}
                    >
                        <AiIcon className="tab-icon" />
                        <span>Trợ lý AI</span>
                    </button>
                    <button
                        className={`mode-tab ${mode === 'team' ? 'active' : ''}`}
                        onClick={() => setMode('team')}
                    >
                        <TeamIcon className="tab-icon" />
                        <span>Team Chat {!checkingTeam && !hasJoinedTeam && <LockIcon style={{ fontSize: '14px', marginLeft: '4px', verticalAlign: 'middle', color: '#ef4444' }} />}</span>
                    </button>
                </div>
                <button
                    className="clear-chat-btn"
                    title="Xóa cuộc trò chuyện"
                    onClick={handleClearChat}
                >
                    <ClearIcon fontSize="small" />
                </button>
            </div>

            {/* Team Selector Bar */}
            {mode === 'team' && hasJoinedTeam && userTeams.length > 0 && (
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px',
                    background: 'var(--bg-primary)', borderBottom: '1px solid #e2e8f0'
                }}>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                        Chọn nhóm:
                    </span>
                    <div style={{ position: 'relative', flex: 1, maxWidth: '280px', display: 'flex', alignItems: 'center' }}>
                        {userTeams.find(t => t.id === selectedTeamId) && (
                            <span style={{
                                position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
                                width: '8px', height: '8px', borderRadius: '50%',
                                background: userTeams.find(t => t.id === selectedTeamId)?.color || '#3b82f6',
                                pointerEvents: 'none', zIndex: 1
                            }}></span>
                        )}
                        <select
                            value={selectedTeamId}
                            onChange={(e) => setSelectedTeamId(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '7px 32px 7px 28px',
                                borderRadius: '8px',
                                border: '1px solid #cbd5e1',
                                background: 'var(--bg-secondary)',
                                color: '#1e293b',
                                fontSize: '13px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                outline: 'none',
                                appearance: 'none',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                                transition: 'border-color 0.2s, box-shadow 0.2s'
                            }}
                            onFocus={(e) => {
                                e.target.style.borderColor = '#4f46e5';
                                e.target.style.boxShadow = '0 0 0 3px rgba(79,70,229,0.1)';
                            }}
                            onBlur={(e) => {
                                e.target.style.borderColor = '#cbd5e1';
                                e.target.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)';
                            }}
                        >
                            {userTeams.map((t) => (
                                <option key={t.id} value={t.id} style={{ color: '#1e293b', padding: '8px', fontWeight: 500 }}>
                                    {t.name}
                                </option>
                            ))}
                        </select>
                        <div style={{
                            position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                            pointerEvents: 'none', color: 'var(--text-muted)', display: 'flex', alignItems: 'center'
                        }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                        </div>
                    </div>
                </div>
            )}

            {/* Messages Area */}
            {mode === 'team' && !checkingTeam && !hasJoinedTeam ? (
                <div className="chat-messages" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '32px', textAlign: 'center', background: 'var(--bg-primary)', minHeight: '300px' }}>
                    <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#fee2e2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                        <LockIcon style={{ fontSize: '30px' }} />
                    </div>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 8px 0' }}>Chưa tham gia nhóm làm việc</h3>
                    <p style={{ fontSize: '13px', color: 'var(--text-muted)', margin: '0 0 20px 0', maxWidth: '320px', lineHeight: 1.5 }}>
                        Bạn chỉ có thể trò chuyện với các thành viên khác khi đã tham gia ít nhất một nhóm làm việc. Hiện tại, bạn chỉ có thể trò chuyện cùng <b>Trợ lý AI</b>!
                    </p>
                    <button
                        onClick={() => navigate('/team')}
                        style={{
                            background: '#4f46e5', color: 'var(--bg-secondary)', border: 'none', borderRadius: '8px',
                            padding: '10px 18px', fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 12px rgba(79,70,229,0.2)', transition: 'all 0.2s'
                        }}
                    >
                        <TeamIcon style={{ fontSize: '18px' }} />
                        Khám phá Nhóm làm việc ngay
                    </button>
                </div>
            ) : (
                <div className="chat-messages">
                    {messages.map((msg) => {
                        const isMe = isMyMessage(msg);
                        return (
                            <div
                                key={msg.id}
                                className={`message-wrapper ${isMe ? 'user me' : 'other team'}`}
                            >
                                {!isMe && (
                                    <div className={`msg-avatar ${msg.role === 'ai' ? 'ai-avatar' : ''}`}>
                                        {msg.role === 'ai' ? (
                                            <SparklesIcon style={{ fontSize: '14px' }} />
                                        ) : (
                                            msg.avatar || (msg.sender ? msg.sender.trim().charAt(0).toUpperCase() : 'U')
                                        )}
                                    </div>
                                )}
                                <div className="message-bubble">
                                    <div className="msg-header">
                                        <span className="msg-sender">{msg.sender}</span>
                                        <span className="msg-time">{msg.timestamp}</span>
                                    </div>
                                    <div className="msg-content">{msg.content}</div>
                                </div>
                            </div>
                        );
                    })}

                    {(isTyping || activeTypingUser) && (
                        <div className="typing-indicator">
                            {mode === 'ai' ? (
                                <>
                                    <div className="typing-avatar ai-avatar">
                                        <SparklesIcon style={{ fontSize: '13px' }} />
                                    </div>
                                    <span>AI đang soạn câu trả lời...</span>
                                </>
                            ) : (
                                <>
                                    <div className="typing-avatar">
                                        {activeTypingUser ? activeTypingUser.trim().charAt(0).toUpperCase() : 'T'}
                                    </div>
                                    <span>
                                        <strong>{activeTypingUser}</strong> đang nhập...
                                    </span>
                                </>
                            )}
                            <div className="dots">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>
            )}

            {/* Quick Prompts (only in AI mode) */}
            {mode === 'ai' && (
                <div className="quick-prompts">
                    {QUICK_PROMPTS.map((prompt, idx) => (
                        <button
                            key={idx}
                            className="prompt-chip"
                            onClick={() => handleSendMessage(prompt)}
                        >
                            {prompt}
                        </button>
                    ))}
                </div>
            )}

            {/* Input Area */}
            <div className="chat-input-area" style={{ opacity: mode === 'team' && !hasJoinedTeam ? 0.6 : 1 }}>
                <input
                    type="text"
                    placeholder={
                        mode === 'ai'
                            ? "Hỏi Trợ lý AI..."
                            : hasJoinedTeam
                                ? (userTeams.find(t => t.id === selectedTeamId) ? `Nhắn tin cho "${userTeams.find(t => t.id === selectedTeamId)?.name}"...` : "Nhắn tin cho nhóm...")
                                : "Cần tham gia nhóm để gửi tin nhắn..."
                    }
                    value={inputMessage}
                    disabled={mode === 'team' && !hasJoinedTeam}
                    onChange={(e) => {
                        const val = e.target.value;
                        setInputMessage(val);
                        if (mode === 'team' && selectedTeamId && val.trim().length > 0) {
                            try {
                                const stored = localStorage.getItem('currentUser');
                                const u = stored ? JSON.parse(stored) : null;
                                if (u?.fullName) {
                                    chatService.setTypingStatus(selectedTeamId, u.fullName);
                                }
                            } catch { /* ignore */ }
                        }
                    }}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey && !(mode === 'team' && !hasJoinedTeam)) {
                            e.preventDefault();
                            handleSendMessage();
                        }
                    }}
                />
                <button
                    className="send-btn"
                    disabled={!inputMessage.trim() || (mode === 'team' && !hasJoinedTeam)}
                    onClick={() => handleSendMessage()}
                    title="Gửi tin nhắn"
                >
                    <SendIcon style={{ fontSize: '16px' }} />
                </button>
            </div>
        </div>
    );
}