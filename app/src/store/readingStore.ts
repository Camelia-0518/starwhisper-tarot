import { create } from 'zustand';
import type { TarotCard, SpreadPosition } from '@/types/tarot';
import { tarotCards } from '@/data/tarotCards';
import { spreads } from '@/data/spreads';
import {
  generateRealAIReading,
  generateSimulatedAIReading,
  isAIConfigured,
} from '@/services/aiService';

export interface DrawnCard {
  card: TarotCard;
  position: SpreadPosition;
  isReversed: boolean;
}

export interface CardReading {
  position: number;
  keywords: string[];
  interpretation: string;
  advice: string;
}

export interface AIReadingResponse {
  overallReading: string;
  cardReadings: CardReading[];
}

export interface SavedReading {
  id: string;
  spreadId: string;
  spreadName: string;
  question: string;
  cards: DrawnCard[];
  aiReading: AIReadingResponse;
  createdAt: string;
}

interface ReadingState {
  // Step management
  step: number;
  isTransitioning: boolean;
  
  // Step 1: Spread selection
  selectedSpreadId: string | null;
  
  // Step 2: Question
  question: string;
  
  // Step 3: Shuffling
  isShuffling: boolean;
  shuffleComplete: boolean;
  
  // Step 4: Card drawing
  drawnCards: DrawnCard[];
  isDrawing: boolean;
  drawComplete: boolean;
  
  // Step 5: Revealing
  revealedCards: Set<number>;
  allCardsRevealed: boolean;
  
  // AI Interpretation
  aiReading: AIReadingResponse | null;
  isLoadingAI: boolean;
  showInterpretation: boolean;
  
  // Actions
  setStep: (step: number) => void;
  setIsTransitioning: (val: boolean) => void;
  selectSpread: (spreadId: string) => void;
  setQuestion: (question: string) => void;
  startShuffling: () => void;
  completeShuffling: () => void;
  drawCards: () => void;
  startDrawing: () => void;
  completeDrawing: () => void;
  revealCard: (index: number) => void;
  revealAllCards: () => void;
  generateAIReading: () => void;
  saveReading: () => SavedReading | null;
  resetReading: () => void;
  canGoNext: () => boolean;
  canGoBack: () => boolean;
}

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export const useReadingStore = create<ReadingState>((set, get) => ({
  // Initial state
  step: 1,
  isTransitioning: false,
  selectedSpreadId: 'three-card', // default as per design
  question: '',
  isShuffling: false,
  shuffleComplete: false,
  drawnCards: [],
  isDrawing: false,
  drawComplete: false,
  revealedCards: new Set<number>(),
  allCardsRevealed: false,
  aiReading: null,
  isLoadingAI: false,
  showInterpretation: false,

  setStep: (step) => set({ step }),
  setIsTransitioning: (val) => set({ isTransitioning: val }),

  selectSpread: (spreadId) => set({ selectedSpreadId: spreadId }),

  setQuestion: (question) => set({ question }),

  startShuffling: () => set({ isShuffling: true, shuffleComplete: false }),

  completeShuffling: () => set({ isShuffling: false, shuffleComplete: true }),

  startDrawing: () => set({ isDrawing: true, drawComplete: false }),

  completeDrawing: () => set({ isDrawing: false, drawComplete: true }),

  drawCards: () => {
    const { selectedSpreadId } = get();
    if (!selectedSpreadId) return;

    const spread = spreads.find((s) => s.id === selectedSpreadId);
    if (!spread) return;

    // Shuffle all tarot cards and pick the needed amount
    const shuffled = shuffleArray(tarotCards);
    const selected = shuffled.slice(0, spread.cardCount);

    const drawnCards: DrawnCard[] = selected.map((card, index) => ({
      card,
      position: spread.positions[index],
      isReversed: Math.random() < 0.5, // 50% chance
    }));

    set({ drawnCards });
  },

  revealCard: (index) =>
    set((state) => {
      const newRevealed = new Set(state.revealedCards);
      newRevealed.add(index);
      const allCardsRevealed = newRevealed.size === state.drawnCards.length;
      return { revealedCards: newRevealed, allCardsRevealed };
    }),

  revealAllCards: () =>
    set((state) => {
      const newRevealed = new Set<number>();
      state.drawnCards.forEach((_, i) => newRevealed.add(i));
      return { revealedCards: newRevealed, allCardsRevealed: true };
    }),

  generateAIReading: async () => {
    const state = get();
    if (!state.selectedSpreadId || state.drawnCards.length === 0) return;

    set({ isLoadingAI: true });

    const spread = spreads.find((s) => s.id === state.selectedSpreadId)!;

    try {
      // Try real AI if configured
      if (isAIConfigured()) {
        const aiReading = await generateRealAIReading(
          spread,
          state.drawnCards,
          state.question
        );
        set({ aiReading, isLoadingAI: false, showInterpretation: true });
      } else {
        // Fall back to simulated AI with a delay
        await new Promise((resolve) => setTimeout(resolve, 2000));
        const aiReading = generateSimulatedAIReading(
          spread,
          state.drawnCards,
          state.question
        );
        set({ aiReading, isLoadingAI: false, showInterpretation: true });
      }
    } catch (err: unknown) {
      // On error, fall back to simulated AI
      const message = err instanceof Error ? err.message : 'AI 调用失败';
      console.warn('AI 调用失败，使用模拟解读:', message);
      const aiReading = generateSimulatedAIReading(
        spread,
        state.drawnCards,
        state.question
      );
      set({ aiReading, isLoadingAI: false, showInterpretation: true });
    }
  },

  saveReading: () => {
    const state = get();
    if (!state.aiReading || !state.selectedSpreadId) return null;

    const spread = spreads.find((s) => s.id === state.selectedSpreadId)!;
    const reading: SavedReading = {
      id: `reading-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      spreadId: state.selectedSpreadId,
      spreadName: spread.name,
      question: state.question,
      cards: state.drawnCards,
      aiReading: state.aiReading,
      createdAt: new Date().toISOString(),
    };

    // 本地兜底保存（未登录时可用）
    const existing = JSON.parse(localStorage.getItem('tarot-readings') || '[]');
    existing.unshift(reading);
    localStorage.setItem('tarot-readings', JSON.stringify(existing.slice(0, 50)));

    return reading;
  },

  resetReading: () =>
    set({
      step: 1,
      selectedSpreadId: 'three-card',
      question: '',
      isShuffling: false,
      shuffleComplete: false,
      drawnCards: [],
      isDrawing: false,
      drawComplete: false,
      revealedCards: new Set<number>(),
      allCardsRevealed: false,
      aiReading: null,
      isLoadingAI: false,
      showInterpretation: false,
    }),

  canGoNext: () => {
    const state = get();
    switch (state.step) {
      case 1:
        return !!state.selectedSpreadId;
      case 2:
        return true; // optional question
      case 3:
        return state.shuffleComplete;
      case 4:
        return state.drawComplete;
      case 5:
        return false; // 最后一步，没有下一步
      default:
        return false;
    }
  },

  canGoBack: () => {
    const state = get();
    return state.step > 1;
  },
}));

export default useReadingStore;
