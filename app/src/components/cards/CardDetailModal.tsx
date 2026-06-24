import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import type { TarotCard as TarotCardType } from '@/types/tarot';

type Orientation = 'upright' | 'reversed';

interface CardDetailModalProps {
  card: TarotCardType | null;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
}

const elementColors: Record<string, string> = {
  fire: '#D44040',
  water: '#3A6B8B',
  air: '#6B8B6B',
  earth: '#8B7A3A',
  spirit: '#C9A84C',
};

const elementLabels: Record<string, string> = {
  fire: '火',
  water: '水',
  air: '风',
  earth: '土',
  spirit: '灵',
};

const suitLabels: Record<string, string> = {
  wands: '权杖',
  cups: '圣杯',
  swords: '宝剑',
  pentacles: '星币',
};

export default function CardDetailModal({
  card,
  onClose,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
}: CardDetailModalProps) {
  const [orientation, setOrientation] = useState<Orientation>('upright');
  const [imageRotation, setImageRotation] = useState(0);

  // Reset to upright when card changes
  useEffect(() => {
    setOrientation('upright');
    setImageRotation(0);
  }, [card?.id]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!card) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft' && hasPrev) onPrev();
      if (e.key === 'ArrowRight' && hasNext) onNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [card, onClose, onPrev, onNext, hasPrev, hasNext]);

  const toggleOrientation = useCallback((newOrientation: Orientation) => {
    setOrientation(newOrientation);
    setImageRotation(newOrientation === 'reversed' ? 180 : 0);
  }, []);

  if (!card) return null;

  const elementColor = elementColors[card.element] || '#C9A84C';
  const keywords =
    orientation === 'upright' ? card.keywordsUpright : card.keywordsReversed;
  const meaning =
    orientation === 'upright' ? card.meaningUpright : card.meaningReversed;

  return (
    <AnimatePresence>
      {card && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-deep-night/90 backdrop-blur-lg"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal panel */}
          <motion.div
            className="relative bg-deep-blue border border-star-gold/30 rounded-2xl max-w-4xl w-full max-h-[90dvh] overflow-y-auto scrollbar-thin"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{
              duration: 0.4,
              ease: [0.68, -0.55, 0.265, 1.55] as [number, number, number, number],
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 w-9 h-9 flex items-center justify-center rounded-full text-moon-silver hover:text-star-gold hover:bg-star-gold/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="p-6 sm:p-8">
              {/* Main content: card image + info */}
              <div className="flex flex-col md:flex-row gap-8">
                {/* Left: Card image */}
                <div className="flex flex-col items-center md:w-[40%]">
                  <motion.div
                    className="relative"
                    style={{ perspective: 1000 }}
                  >
                    <motion.div
                      animate={{ rotateY: imageRotation }}
                      transition={{
                        duration: 0.6,
                        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
                      }}
                      style={{ transformStyle: 'preserve-3d' }}
                    >
                      <div
                        className="relative overflow-hidden border-2 border-star-gold/50"
                        style={{ borderRadius: '8px / 120% 8px' }}
                      >
                        <img
                          src={card.image || '/assets/card-back.jpg'}
                          alt={card.name}
                          className="w-[200px] h-[350px] sm:w-[240px] sm:h-[420px] md:w-[280px] md:h-[490px] object-cover"
                          draggable={false}
                          style={{
                            transform:
                              orientation === 'reversed'
                                ? 'rotate(180deg)'
                                : 'none',
                            transition: 'transform 0.6s ease',
                          }}
                        />
                        {/* Overlay with card name when reversed */}
                        {orientation === 'reversed' && (
                          <div className="absolute inset-0 flex items-center justify-center bg-deep-night/30 pointer-events-none" />
                        )}
                      </div>
                    </motion.div>
                  </motion.div>

                  {/* Orientation toggle */}
                  <div className="flex items-center mt-5 bg-deep-night/80 rounded-full p-1 border border-star-gold/20">
                    <button
                      onClick={() => toggleOrientation('upright')}
                      className={`px-4 py-1.5 rounded-full text-xs font-sans-sc transition-all duration-200 ${
                        orientation === 'upright'
                          ? 'bg-star-gold/20 text-star-gold'
                          : 'text-moon-silver hover:text-star-white'
                      }`}
                    >
                      正位
                    </button>
                    <button
                      onClick={() => toggleOrientation('reversed')}
                      className={`px-4 py-1.5 rounded-full text-xs font-sans-sc transition-all duration-200 ${
                        orientation === 'reversed'
                          ? 'bg-reversed-red/20 text-reversed-red'
                          : 'text-moon-silver hover:text-star-white'
                      }`}
                    >
                      逆位
                    </button>
                  </div>
                </div>

                {/* Right: Card info */}
                <div className="flex-1 md:w-[60%]">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`${card.id}-${orientation}`}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      {/* Card name */}
                      <div className="mb-4">
                        <h2 className="font-serif-sc text-2xl sm:text-3xl font-bold text-star-gold mb-1">
                          {card.name}
                        </h2>
                        <p className="font-cinzel text-sm text-moon-silver mb-1">
                          {card.nameEn}
                        </p>
                        {card.romanNum && (
                          <span className="font-playfair text-sm text-dark-gold">
                            {card.romanNum}
                          </span>
                        )}
                      </div>

                      {/* Badges */}
                      <div className="flex flex-wrap items-center gap-2 mb-5">
                        {/* Element badge */}
                        <span
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-sans-sc"
                          style={{
                            backgroundColor: `${elementColor}20`,
                            color: elementColor,
                            border: `1px solid ${elementColor}40`,
                          }}
                        >
                          <span
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: elementColor }}
                          />
                          {elementLabels[card.element] || card.element}元素
                        </span>

                        {/* Suit badge for minor arcana */}
                        {card.suit && (
                          <span
                            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-sans-sc"
                            style={{
                              backgroundColor: `${elementColor}15`,
                              color: elementColor,
                              border: `1px solid ${elementColor}30`,
                            }}
                          >
                            {suitLabels[card.suit]}
                          </span>
                        )}

                        {/* Arcana badge */}
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-sans-sc bg-star-gold/10 text-star-gold border border-star-gold/20">
                          {card.arcana === 'major' ? '大阿尔卡纳' : '小阿尔卡纳'}
                        </span>
                      </div>

                      {/* Keywords */}
                      <div className="mb-5">
                        <h3 className="font-serif-sc text-sm font-semibold text-star-white mb-2">
                          关键词
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {keywords.map((keyword) => (
                            <span
                              key={keyword}
                              className="px-3 py-1 rounded-full text-xs font-sans-sc border border-star-gold/30 text-star-gold bg-star-gold/5"
                            >
                              {keyword}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Meaning */}
                      <div className="mb-5">
                        <h3 className="font-serif-sc text-sm font-semibold text-star-white mb-2">
                          牌义解读
                        </h3>
                        <p className="text-sm text-moon-silver leading-relaxed font-sans-sc">
                          {meaning}
                        </p>
                      </div>

                      {/* Guidance */}
                      <div className="mb-4 p-4 rounded-xl bg-indigo-main/50 border border-star-gold/10">
                        <h3 className="font-serif-sc text-sm font-semibold text-star-gold mb-2">
                          在占卜中出现此牌
                        </h3>
                        <p className="text-xs text-moon-silver leading-relaxed font-sans-sc">
                          {orientation === 'upright'
                            ? `当${card.name}以正位出现时，它带来的是${card.keywordsUpright.slice(0, 3).join('、')}的能量。这是一张充满积极意义的牌，提示你当前正处于或即将进入一个有利的阶段。${card.meaningUpright.slice(0, 60)}...`
                            : `当${card.name}以逆位出现时，需要特别关注${card.keywordsReversed.slice(0, 3).join('、')}方面的问题。这不是一张"坏"牌，而是在提醒你需要调整和注意的领域。${card.meaningReversed.slice(0, 60)}...`}
                        </p>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>

              {/* Navigation buttons */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-star-gold/10">
                <button
                  onClick={onPrev}
                  disabled={!hasPrev}
                  className="inline-flex items-center gap-1 px-4 py-2 text-sm text-moon-silver hover:text-star-gold disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-moon-silver transition-colors font-sans-sc"
                >
                  <ChevronLeft className="w-4 h-4" />
                  上一张
                </button>

                <span className="text-xs text-dark-gold font-sans-sc">
                  使用键盘方向键浏览
                </span>

                <button
                  onClick={onNext}
                  disabled={!hasNext}
                  className="inline-flex items-center gap-1 px-4 py-2 text-sm text-moon-silver hover:text-star-gold disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:text-moon-silver transition-colors font-sans-sc"
                >
                  下一张
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
