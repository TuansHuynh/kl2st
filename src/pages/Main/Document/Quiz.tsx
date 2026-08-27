import { useTitle } from "../../../hooks/useTitle";
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import QuizIcon from '@mui/icons-material/Quiz';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import TimerIcon from '@mui/icons-material/Timer';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import SendIcon from '@mui/icons-material/Send';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StyleIcon from '@mui/icons-material/Style';
import { documentService } from '../../../service/documentService';
import { flashcardService } from '../../../service/flashcardService';
import type { Document } from '../../../types';

interface QuizQuestion {
    id: number;
    question: string;
    options: { label: string; text: string }[];
    correctAnswer: string; // 'A', 'B', 'C', 'D'
}

/**
 * Parse quiz content from raw text.
 */
function parseQuizContent(text: string): QuizQuestion[] {
    const questions: QuizQuestion[] = [];
    let normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    normalized = normalized
        .replace(/Downloaded by .+?\n/gi, '\n')
        .replace(/lOMoARcPSD\|\d+\n/g, '\n')
        .replace(/Scan to open on Studeersnel\n/gi, '\n')
        .replace(/Studocu is not sponsored .+?\n/gi, '\n')
        .replace(/\[BOLD\]\s*\[\/BOLD\]/g, '') // empty bold tags
        .replace(/\n\s*\d+\s*\n/g, '\n') // remove standalone page numbers!
        .replace(/\n\s*\n\s*\n/g, '\n\n'); // collapse multiple blank lines

    const questionStarts: { index: number; num: number }[] = [];
    const headerRegex = /(?:\[BOLD\])?\s*(?:Câu|Question|Bài)\s*(\d+)\s*[:.-]?\s*(?:\[\/BOLD\])?/gi;
    let headerMatch;
    while ((headerMatch = headerRegex.exec(normalized)) !== null) {
        const num = parseInt(headerMatch[1]);
        if (!isNaN(num)) {
            questionStarts.push({ index: headerMatch.index, num });
        }
    }

    if (questionStarts.length === 0) {
        const bareNumRegex = /(?:^|\n)(\d+)\s+(?=\S)/g;
        let bareMatch;
        const candidates: { index: number; num: number }[] = [];
        while ((bareMatch = bareNumRegex.exec(normalized)) !== null) {
            const num = parseInt(bareMatch[1]);
            if (!isNaN(num) && num <= 999) {
                candidates.push({ index: bareMatch.index, num });
            }
        }

        for (let i = 0; i < candidates.length; i++) {
            const start = candidates[i].index;
            const end = i < candidates.length - 1 ? candidates[i + 1].index : normalized.length;
            const block = normalized.substring(start, end);
            if (/(?:^|\n|\s+)(?:\[BOLD\])?[A-Da-d]\s*[.)]/i.test(block)) {
                questionStarts.push(candidates[i]);
            }
        }
    }

    if (questionStarts.length === 0) return questions;

    for (let i = 0; i < questionStarts.length; i++) {
        const start = questionStarts[i].index;
        const end = i < questionStarts.length - 1 ? questionStarts[i + 1].index : normalized.length;
        const block = normalized.substring(start, end);

        const headerRemoveRegex = /^(?:\[BOLD\])?\s*(?:Câu|Question|Bài)\s*\d+\s*[:.-]?\s*(?:\[\/BOLD\])?\s*/i;
        const bareHeaderRemoveRegex = /^\n?\d+\s+/;
        let content = block.replace(headerRemoveRegex, '');
        if (content === block) {
            content = block.replace(bareHeaderRemoveRegex, '');
        }

        content = content.replace(/\n\d+\s*\n/g, '\n');

        const options: { label: string; text: string }[] = [];
        let correctAnswer = '';

        const optionRegex = /(?:^|\n|\s+)(?:\[BOLD\])?([A-Da-d])\s*[.)]\s*(.*?)(?:\[\/BOLD\])?(?=(?:^|\n|\s+)(?:\[BOLD\])?[A-Da-d]\s*[.)]|\s*(?:Đáp án|đáp án|Answer|HD|Hướng dẫn)\s*[:.:-]|$)/gis;
        let optMatch;
        let firstOptionIndex = -1;

        while ((optMatch = optionRegex.exec(content)) !== null) {
            const letterIdxInMatch = optMatch[0].indexOf(optMatch[1]);
            const actualIndex = optMatch.index + letterIdxInMatch;
            
            if (firstOptionIndex === -1) {
                firstOptionIndex = actualIndex;
            }
            const label = optMatch[1].toUpperCase();
            const optText = optMatch[2].replace(/\[\/?BOLD\]/g, '').replace(/\n/g, ' ').trim();

            const fullMatch = optMatch[0];
            if (fullMatch.includes('[BOLD]')) {
                correctAnswer = label;
            }

            options.push({ label, text: optText });
        }

        if (options.length < 2) continue;

        const questionText = content
            .substring(0, firstOptionIndex)
            .replace(/\[\/?BOLD\]/g, '')
            .replace(/\n/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
        if (!questionText) continue;

        if (!correctAnswer) {
            const answerMatch = content.match(/(?:Đáp án|đáp án|Answer|Dap an|HD|Hướng dẫn)\s*[:.:\s]\s*(?:\[BOLD\])?\s*([A-Da-d])/i);
            if (answerMatch) {
                correctAnswer = answerMatch[1].toUpperCase();
            }
        }

        questions.push({
            id: questionStarts[i].num,
            question: questionText,
            options,
            correctAnswer,
        });
    }

    return questions;
}

export default function Quiz() {
    useTitle("Làm bài trắc nghiệm");
    const { docId } = useParams<{ docId: string }>();
    const navigate = useNavigate();

    const [document, setDocument] = useState<Document | null>(null);
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [rawText, setRawText] = useState('');

    const [answers, setAnswers] = useState<Record<number, string>>({});
    
    // New states for Mode and Timer
    const [quizMode, setQuizMode] = useState<'setup' | 'playing' | 'finished'>('setup');
    const [resultMode, setResultMode] = useState<'immediate' | 'after_submit'>('immediate');
    const [timeElapsed, setTimeElapsed] = useState(0);

    // Fetch document and parse content
    useEffect(() => {
        if (!docId) return;
        const fetchAndParse = async () => {
            try {
                setLoading(true);
                const doc = await documentService.getDocumentById(docId);
                setDocument(doc);

                let text = '';
                if (doc.type === 'word' || doc.type === 'pdf') {
                    text = await documentService.extractDocumentText(docId);
                }
                
                setRawText(text);

                const parsed = parseQuizContent(text);
                if (parsed.length === 0) {
                    setError('Không thể trích xuất câu hỏi từ file. Đảm bảo file có định dạng: "Câu X: ... A. ... B. ... C. ... D. ... Đáp án: A"');
                } else {
                    setQuestions(parsed);
                }
            } catch (err) {
                console.error('Quiz load error:', err);
                setError('Không thể tải file. Vui lòng thử lại.');
            } finally {
                setLoading(false);
            }
        };
        fetchAndParse();
    }, [docId]);

    // Timer effect
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (quizMode === 'playing') {
            interval = setInterval(() => {
                setTimeElapsed(prev => prev + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [quizMode]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleStart = () => {
        setQuizMode('playing');
        setTimeElapsed(0);
        setAnswers({});
    };

    const handleSubmit = () => {
        if (Object.keys(answers).length < questions.length) {
            if (!window.confirm("Bạn chưa hoàn thành tất cả câu hỏi. Vẫn nộp bài?")) {
                return;
            }
        }
        setQuizMode('finished');
        (window.document.querySelector('.link-outlet') as HTMLElement | null)?.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleReset = () => {
        setQuizMode('setup');
        setAnswers({});
        setTimeElapsed(0);
        (window.document.querySelector('.link-outlet') as HTMLElement | null)?.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleSaveFlashcards = () => {
        if (!document) return;
        const wrongQuestions = questions.filter(q => answers[q.id] !== q.correctAnswer);
        if (wrongQuestions.length === 0) {
            alert('Tuyệt vời! Bạn không có câu trả lời sai nào.');
            return;
        }

        const cardsToSave = wrongQuestions.map(q => ({
            questionId: q.id,
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer
        }));

        flashcardService.addCardsToDeck(docId || 'unknown', document.name, cardsToSave);
        alert(`Đã lưu ${wrongQuestions.length} câu sai vào bộ Flashcard để ôn tập sau!`);
    };

    const selectAnswer = (questionId: number, label: string) => {
        if (quizMode !== 'playing') return;
        // In immediate mode, if already answered, do nothing
        if (resultMode === 'immediate' && answers[questionId]) return;
        setAnswers(prev => ({ ...prev, [questionId]: label }));
    };

    if (loading) {
        return (
            <div className="quiz-container">
                <div className="quiz-loading">
                    <div className="quiz-spinner"></div>
                    <p>Đang đọc nội dung file...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="quiz-container">
                <div className="quiz-error-wrap">
                    <QuizIcon style={{ fontSize: 48, color: '#ef4444' }} />
                    <h2>Lỗi đọc file</h2>
                    <p>{error}</p>
                    <button className="quiz-btn-back" onClick={() => navigate(-1)}>
                        <ArrowBackIcon fontSize="small" />
                        Quay lại
                    </button>
                    <div style={{ marginTop: 20, textAlign: 'left', width: '100%', maxWidth: 800, background: 'var(--bg-secondary)', padding: 16, borderRadius: 8, border: '1px solid #ddd', fontSize: 13, maxHeight: 300, overflow: 'auto' }}>
                        <p style={{ fontWeight: 'bold', margin: '0 0 8px', color: '#ef4444' }}>Nội dung text đã trích xuất (Raw Text):</p>
                        <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: '#333' }}>{rawText || "Không có nội dung"}</pre>
                    </div>
                </div>
            </div>
        );
    }

    if (quizMode === 'setup') {
        return (
            <div className="quiz-container">
                <div className="quiz-header" style={{ marginBottom: 24 }}>
                    <div className="quiz-header-left">
                        <button className="quiz-btn-back-icon" onClick={() => navigate(-1)} title="Quay lại">
                            <ArrowBackIcon />
                        </button>
                        <div className="quiz-header-info">
                            <h1><QuizIcon /> {document?.name || 'Bài tập trắc nghiệm'}</h1>
                            <p>Số lượng: {questions.length} câu hỏi</p>
                        </div>
                    </div>
                </div>

                <div style={{ maxWidth: 600, margin: '40px auto', background: 'var(--bg-secondary)', padding: 32, borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.05)', textAlign: 'center' }}>
                    <QuizIcon style={{ fontSize: 64, color: '#6366f1', marginBottom: 16 }} />
                    <h2 style={{ marginBottom: 24, fontSize: 24, color: 'var(--text-primary)' }}>Cấu hình bài thi</h2>
                    
                    <div style={{ textAlign: 'left', marginBottom: 32 }}>
                        <h3 style={{ fontSize: 16, marginBottom: 12, color: 'var(--text-secondary)' }}>Chế độ hiển thị kết quả:</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer', padding: 16, border: '2px solid', borderColor: resultMode === 'immediate' ? '#6366f1' : 'var(--border-color)', borderRadius: 12, background: resultMode === 'immediate' ? '#eef2ff' : 'transparent', transition: 'all 0.2s' }}>
                                <input type="radio" checked={resultMode === 'immediate'} onChange={() => setResultMode('immediate')} style={{ marginTop: 4, width: 18, height: 18, accentColor: '#6366f1' }} />
                                <div>
                                    <strong style={{ fontSize: 16, display: 'block', marginBottom: 4, color: 'var(--text-primary)' }}>Xem kết quả ngay (Chế độ Học)</strong>
                                    <p style={{ margin: 0, fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.5 }}>Hiển thị đúng/sai ngay sau khi chọn đáp án. Giúp ghi nhớ kiến thức nhanh chóng.</p>
                                </div>
                            </label>
                            
                            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer', padding: 16, border: '2px solid', borderColor: resultMode === 'after_submit' ? '#6366f1' : 'var(--border-color)', borderRadius: 12, background: resultMode === 'after_submit' ? '#eef2ff' : 'transparent', transition: 'all 0.2s' }}>
                                <input type="radio" checked={resultMode === 'after_submit'} onChange={() => setResultMode('after_submit')} style={{ marginTop: 4, width: 18, height: 18, accentColor: '#6366f1' }} />
                                <div>
                                    <strong style={{ fontSize: 16, display: 'block', marginBottom: 4, color: 'var(--text-primary)' }}>Xem kết quả sau khi nộp (Chế độ Thi)</strong>
                                    <p style={{ margin: 0, fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.5 }}>Ẩn kết quả cho đến khi bấm nộp bài. Phù hợp để làm bài kiểm tra thử.</p>
                                </div>
                            </label>
                        </div>
                    </div>

                    <button className="quiz-btn-submit" onClick={handleStart} style={{ padding: '16px 24px', fontSize: 16 }}>
                        <PlayArrowIcon /> Bắt đầu làm bài
                    </button>
                </div>
            </div>
        );
    }

    const answeredCount = Object.keys(answers).length;
    const correctCount = questions.filter(q => answers[q.id] === q.correctAnswer).length;

    return (
        <div className="quiz-container">
            {/* Header */}
            <div className="quiz-header" style={{ marginBottom: 24 }}>
                <div className="quiz-header-left">
                    <button className="quiz-btn-back-icon" onClick={() => navigate(-1)} title="Quay lại">
                        <ArrowBackIcon />
                    </button>
                    <div className="quiz-header-info">
                        <h1><QuizIcon /> {document?.name || 'Bài tập trắc nghiệm'}</h1>
                        <p>Đã trả lời {answeredCount}/{questions.length} câu</p>
                    </div>
                </div>
                <div className="quiz-header-right">
                    <div className="quiz-timer">
                        <TimerIcon />
                        <span>{formatTime(timeElapsed)}</span>
                    </div>
                </div>
            </div>

            {quizMode === 'finished' && (
                <div className={`quiz-result-banner ${correctCount >= questions.length / 2 ? 'pass' : 'fail'}`}>
                    <div className="quiz-result-content">
                        <EmojiEventsIcon style={{ fontSize: 32 }} />
                        <div className="quiz-result-text">
                            <h2>Kết quả: {correctCount} / {questions.length} câu đúng ({(correctCount / questions.length * 10).toFixed(1)} điểm)</h2>
                            <p>Thời gian làm bài: {formatTime(timeElapsed)}</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 12 }}>
                        <button className="quiz-btn-reset" onClick={handleSaveFlashcards} style={{ background: '#4f46e5', color: '#fff', borderColor: '#4f46e5' }}>
                            <StyleIcon fontSize="small" /> Lưu câu sai vào Flashcard
                        </button>
                        <button className="quiz-btn-reset" onClick={handleReset}>
                            <RestartAltIcon fontSize="small" /> Làm lại bài
                        </button>
                    </div>
                </div>
            )}

            {/* Main content */}
            <div className="quiz-body">
                <div className="quiz-questions">
                    {questions.map((q, index) => {
                        const userAnswer = answers[q.id];
                        const isAnswered = !!userAnswer;
                        const isCorrectAnswer = userAnswer === q.correctAnswer;
                        const showResult = resultMode === 'immediate' || quizMode === 'finished';

                        return (
                            <div key={q.id} id={`question-${index}`} className={`quiz-question-card ${showResult && isAnswered ? (isCorrectAnswer ? 'correct' : 'incorrect') : ''}`}>
                                <div className="quiz-question-header" style={{ marginBottom: 12 }}>
                                    <span className="quiz-question-num">CÂU {index + 1}</span>
                                    {showResult && isAnswered && (
                                        <span className={`quiz-question-status ${isCorrectAnswer ? 'correct' : 'incorrect'}`} style={{ marginLeft: 'auto' }}>
                                            {isCorrectAnswer ? (
                                                <><CheckCircleIcon style={{ fontSize: 16 }} /> Chính xác</>
                                            ) : (
                                                <><CancelIcon style={{ fontSize: 16 }} /> Chưa đúng</>
                                            )}
                                        </span>
                                    )}
                                </div>
                                <p className="quiz-question-text" style={{ fontSize: 16, fontWeight: 700, marginBottom: 20 }}>{q.question}</p>
                                <div className="quiz-options">
                                    {q.options.map(opt => {
                                        const isSelected = userAnswer === opt.label;
                                        const isCorrectOption = opt.label === q.correctAnswer;
                                        
                                        let optionClass = 'quiz-option';
                                        if (showResult && isAnswered) {
                                            if (isCorrectOption) optionClass += ' correct-answer';
                                            else if (isSelected && !isCorrectOption) optionClass += ' wrong-answer';
                                        } else if (isSelected) {
                                            optionClass += ' selected';
                                        } else if (quizMode === 'playing') {
                                            optionClass += ' interactive';
                                        }
                                        
                                        return (
                                            <div
                                                key={opt.label}
                                                className={optionClass}
                                                style={isSelected && !showResult ? { borderColor: '#6366f1', background: '#eef2ff' } : {}}
                                                onClick={() => selectAnswer(q.id, opt.label)}
                                            >
                                                <span className="quiz-option-label" style={isSelected && !showResult ? { background: '#6366f1', color: 'var(--bg-secondary)' } : {}}>{opt.label}</span>
                                                <span className="quiz-option-text">{opt.text}</span>
                                                {showResult && isAnswered && isCorrectOption && (
                                                    <CheckCircleIcon className="quiz-option-icon correct" style={{ fontSize: 20 }} />
                                                )}
                                                {showResult && isAnswered && isSelected && !isCorrectOption && (
                                                    <CancelIcon className="quiz-option-icon wrong" style={{ fontSize: 20 }} />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                                {showResult && isAnswered && !isCorrectAnswer && q.correctAnswer && (
                                    <div className="quiz-correct-note" style={{ marginTop: 16, display: 'inline-flex' }}>
                                        <CheckCircleIcon style={{ fontSize: 16 }} />
                                        <span>Đáp án đúng là: <strong>{q.correctAnswer}</strong></span>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="quiz-sidebar">
                    <div className="quiz-sidebar-card" style={{ flex: 1 }}>
                        <h3>Điều hướng</h3>
                        <div className="quiz-nav-grid-wrap">
                            <div className="quiz-nav-grid">
                            {questions.map((q, index) => {
                                const userAnswer = answers[q.id];
                                const isAnswered = !!userAnswer;
                                const isCorrectAnswer = userAnswer === q.correctAnswer;
                                const showResult = resultMode === 'immediate' || quizMode === 'finished';
                                
                                let navClass = 'quiz-nav-item';
                                if (showResult && isAnswered) {
                                    navClass += isCorrectAnswer ? ' correct' : ' incorrect';
                                } else if (isAnswered) {
                                    navClass += ' answered';
                                }
                                
                                return (
                                    <button 
                                        key={q.id} 
                                        type="button"
                                        className={navClass}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            const el = window.document.getElementById(`question-${index}`);
                                            if (el) {
                                                // Thử cách 1: scrollIntoView gốc (cơ bản nhất)
                                                el.scrollIntoView({ block: 'start' });
                                                
                                                // Thử cách 2: Tự tính toán dựa trên link-outlet (an toàn nhất)
                                                const outlet = window.document.querySelector('.link-outlet') as HTMLElement | null;
                                                if (outlet) {
                                                    const elRect = el.getBoundingClientRect();
                                                    const outletRect = outlet.getBoundingClientRect();
                                                    // Cuộn thêm một khoảng đúng bằng khoảng cách từ mép trên outlet tới mép trên element
                                                    outlet.scrollBy(0, elRect.top - outletRect.top - 24);
                                                }
                                                // Thêm hiệu ứng highlight nhẹ
                                                el.style.transition = 'box-shadow 0.3s';
                                                el.style.boxShadow = '0 0 0 4px rgba(99, 102, 241, 0.4)';
                                                setTimeout(() => {
                                                    el.style.boxShadow = '';
                                                }, 1500);
                                            }
                                        }}
                                        title={`Câu ${index + 1}`}
                                    >
                                        {index + 1}
                                    </button>
                                );
                            })}
                            </div>
                        </div>
                    </div>

                    <div className="quiz-sidebar-card">
                        <h3>Thống kê</h3>
                        <div className="quiz-stat-row">
                            <span>Đã làm:</span>
                            <strong>{answeredCount} / {questions.length}</strong>
                        </div>
                        {quizMode === 'finished' && (
                            <>
                                <div className="quiz-stat-row">
                                    <span>Đúng:</span>
                                    <strong className="stat-correct">{correctCount}</strong>
                                </div>
                                <div className="quiz-stat-row">
                                    <span>Sai:</span>
                                    <strong className="stat-incorrect">{questions.length - correctCount}</strong>
                                </div>
                            </>
                        )}
                        
                        {quizMode === 'playing' && (
                            <button className="quiz-btn-submit" style={{ marginTop: 16 }} onClick={handleSubmit}>
                                <SendIcon fontSize="small" /> Nộp bài
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
