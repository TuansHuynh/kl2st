export interface FlashcardOption {
    label: string;
    text: string;
}

export interface Flashcard {
    id: string; // Unique ID cho thẻ
    docId: string; // ID của document gốc
    questionId: number; // ID/Index của câu hỏi trong document
    
    // Nội dung thẻ
    question: string;
    options: FlashcardOption[];
    correctAnswer: string;
    
    // Thuật toán Spaced Repetition (SuperMemo-2)
    nextReviewDate: number; // Timestamp milliseconds
    interval: number; // Khoảng cách ôn tập (ngày)
    easeFactor: number; // Hệ số dễ (E-factor), mặc định 2.5
    repetitions: number; // Số lần ôn tập thành công liên tiếp
    
    createdAt: number;
    lastReviewedAt?: number;
}

export interface FlashcardDeck {
    docId: string;
    docName: string;
    cards: Flashcard[];
}
