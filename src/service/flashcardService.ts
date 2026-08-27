import { Flashcard, FlashcardDeck } from '../types/flashcard';

const STORAGE_KEY = 'kl2stu_flashcards';

export const flashcardService = {
    getAllDecks(): FlashcardDeck[] {
        const data = localStorage.getItem(STORAGE_KEY);
        if (!data) return [];
        try {
            return JSON.parse(data);
        } catch {
            return [];
        }
    },

    saveAllDecks(decks: FlashcardDeck[]): void {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(decks));
    },

    getDueCards(): Flashcard[] {
        const decks = this.getAllDecks();
        const now = Date.now();
        const dueCards: Flashcard[] = [];
        
        decks.forEach(deck => {
            deck.cards.forEach(card => {
                if (card.nextReviewDate <= now) {
                    dueCards.push(card);
                }
            });
        });
        
        // Sắp xếp thẻ nào quá hạn lâu nhất lên trước
        return dueCards.sort((a, b) => a.nextReviewDate - b.nextReviewDate);
    },

    addCardsToDeck(docId: string, docName: string, newCards: Omit<Flashcard, 'id' | 'nextReviewDate' | 'interval' | 'easeFactor' | 'repetitions' | 'createdAt'>[]): void {
        const decks = this.getAllDecks();
        let deck = decks.find(d => d.docId === docId);
        
        if (!deck) {
            deck = { docId, docName, cards: [] };
            decks.push(deck);
        }
        
        const now = Date.now();
        newCards.forEach(c => {
            // Kiểm tra xem thẻ này đã tồn tại chưa (dựa trên questionId)
            const exists = deck!.cards.find(existing => existing.questionId === c.questionId);
            if (!exists) {
                deck!.cards.push({
                    ...c,
                    id: Math.random().toString(36).substring(2, 9),
                    nextReviewDate: now,
                    interval: 0,
                    easeFactor: 2.5,
                    repetitions: 0,
                    createdAt: now,
                });
            }
        });
        
        this.saveAllDecks(decks);
    },

    // Thuật toán SM-2 (SuperMemo 2)
    // quality: 0-5 (0: Blackout, 1: Wrong, 2: Hard Wrong, 3: Hard Correct, 4: Good, 5: Easy)
    reviewCard(cardId: string, quality: number): void {
        const decks = this.getAllDecks();
        let found = false;
        
        for (const deck of decks) {
            const card = deck.cards.find(c => c.id === cardId);
            if (card) {
                found = true;
                
                // SM-2 Algorithm
                if (quality < 3) {
                    // Trả lời sai
                    card.repetitions = 0;
                    card.interval = 1;
                } else {
                    // Trả lời đúng
                    card.repetitions += 1;
                    if (card.repetitions === 1) {
                        card.interval = 1;
                    } else if (card.repetitions === 2) {
                        card.interval = 6;
                    } else {
                        card.interval = Math.round(card.interval * card.easeFactor);
                    }
                }
                
                // Cập nhật easeFactor
                card.easeFactor = card.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
                if (card.easeFactor < 1.3) {
                    card.easeFactor = 1.3;
                }
                
                // Tính ngày review tiếp theo
                card.nextReviewDate = Date.now() + card.interval * 24 * 60 * 60 * 1000;
                card.lastReviewedAt = Date.now();
                
                break;
            }
        }
        
        if (found) {
            this.saveAllDecks(decks);
        }
    },
    
    deleteDeck(docId: string): void {
        let decks = this.getAllDecks();
        decks = decks.filter(d => d.docId !== docId);
        this.saveAllDecks(decks);
    }
};
