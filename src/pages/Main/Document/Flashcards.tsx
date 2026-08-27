import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import StyleIcon from '@mui/icons-material/Style';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useTitle } from '../../../hooks/useTitle';
import { flashcardService } from '../../../service/flashcardService';
import type { Flashcard } from '../../../types/flashcard';
import '../../../styles/pages/Document/Flashcards.scss';

export default function Flashcards() {
    useTitle("Ôn tập Flashcards");
    const navigate = useNavigate();
    const [dueCards, setDueCards] = useState<Flashcard[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);

    useEffect(() => {
        const cards = flashcardService.getDueCards();
        setDueCards(cards);
    }, []);

    const handleRate = (quality: number) => {
        const currentCard = dueCards[currentIndex];
        flashcardService.reviewCard(currentCard.id, quality);
        
        setShowAnswer(false);
        setCurrentIndex(prev => prev + 1);
    };

    if (dueCards.length === 0 || currentIndex >= dueCards.length) {
        return (
            <div className="flashcards-container">
                <div className="fc-header">
                    <button className="fc-btn-back" onClick={() => navigate(-1)}>
                        <ArrowBackIcon />
                    </button>
                    <h1><StyleIcon /> Ôn tập Flashcard</h1>
                </div>
                <div className="fc-empty">
                    <CheckCircleIcon style={{ fontSize: 64, color: '#10b981' }} />
                    <h2>Chúc mừng!</h2>
                    <p>Bạn đã ôn tập xong tất cả các thẻ bài đến hạn trong ngày hôm nay.</p>
                    <button className="fc-btn-home" onClick={() => navigate('/')}>
                        Về trang chủ
                    </button>
                </div>
            </div>
        );
    }

    const card = dueCards[currentIndex];

    // Estimate next interval for UI display only
    const getEstimate = (q: number) => {
        if (q < 3) return '< 1 phút';
        let nextI = 1;
        if (card.repetitions === 0) {
            if (q === 3) nextI = 1;
            if (q === 4) nextI = 3;
            if (q === 5) nextI = 4;
        } else if (card.repetitions === 1) {
            nextI = 6;
        } else {
            nextI = Math.round(card.interval * card.easeFactor);
            if (q === 5) nextI = Math.round(nextI * 1.3);
            if (q === 3) nextI = Math.round(card.interval * 1.2);
        }
        return `${nextI} ngày`;
    };

    return (
        <div className="flashcards-container">
            <div className="fc-header">
                <button className="fc-btn-back" onClick={() => navigate(-1)}>
                    <ArrowBackIcon />
                </button>
                <h1><StyleIcon /> Ôn tập Flashcard</h1>
            </div>
            
            <div className="fc-progress">
                Đang ôn tập: {currentIndex + 1} / {dueCards.length} thẻ
            </div>
            
            <div className="fc-card-wrap">
                <div className="fc-card">
                    {/* Hack to show docName if we passed it down, for now we just show docId or hardcode Nguồn */}
                    <div className="fc-doc-name">Nguồn tài liệu</div>
                    <div className="fc-question">{card.question}</div>
                    
                    {showAnswer ? (
                        <div className="fc-options">
                            {card.options.map(opt => (
                                <div key={opt.label} className={`fc-option ${opt.label === card.correctAnswer ? 'correct' : ''}`}>
                                    <span className="fc-opt-label">{opt.label}</span>
                                    <span className="fc-opt-text">{opt.text}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="fc-actions">
                            <button className="fc-btn-reveal" onClick={() => setShowAnswer(true)}>
                                Xem đáp án
                            </button>
                        </div>
                    )}
                </div>
            </div>
            
            {showAnswer && (
                <div className="fc-rating">
                    <button className="fc-btn-rate again" onClick={() => handleRate(1)}>
                        Lại (Again)
                        <span>{getEstimate(1)}</span>
                    </button>
                    <button className="fc-btn-rate hard" onClick={() => handleRate(3)}>
                        Khó (Hard)
                        <span>{getEstimate(3)}</span>
                    </button>
                    <button className="fc-btn-rate good" onClick={() => handleRate(4)}>
                        Tốt (Good)
                        <span>{getEstimate(4)}</span>
                    </button>
                    <button className="fc-btn-rate easy" onClick={() => handleRate(5)}>
                        Dễ (Easy)
                        <span>{getEstimate(5)}</span>
                    </button>
                </div>
            )}
        </div>
    );
}
