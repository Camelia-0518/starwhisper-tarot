export interface TarotCard {
  id: string;
  name: string;
  nameEn: string;
  number: number | string;
  arcana: 'major' | 'minor';
  suit?: 'wands' | 'cups' | 'swords' | 'pentacles';
  element: 'fire' | 'water' | 'air' | 'earth' | 'spirit';
  keywordsUpright: string[];
  keywordsReversed: string[];
  meaningUpright: string;
  meaningReversed: string;
  image: string;
  romanNum?: string;
}

export interface SpreadPosition {
  index: number;
  name: string;
  description: string;
  x: number;
  y: number;
  rotation?: number;
}

export interface CardSpread {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  positions: SpreadPosition[];
  cardCount: number;
  tags?: string[];
}

export interface DrawnCard {
  card: TarotCard;
  position: SpreadPosition;
  isReversed: boolean;
}

export interface ReadingResult {
  id: string;
  spreadId: string;
  cards: DrawnCard[];
  question: string;
  interpretation: string;
  createdAt: string;
}

export type Suit = 'wands' | 'cups' | 'swords' | 'pentacles';
export type Element = 'fire' | 'water' | 'air' | 'earth' | 'spirit';
export type Arcana = 'major' | 'minor';
