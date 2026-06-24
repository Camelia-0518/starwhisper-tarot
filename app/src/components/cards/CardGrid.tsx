import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { TarotCard as TarotCardType } from '@/types/tarot';

interface CardGridItemProps {
  card: TarotCardType;
  index: number;
  onClick: () => void;
}

const suitBorderColors: Record<string, string> = {
  major: 'rgba(201,168,76,0.35)',
  wands: 'rgba(212,64,64,0.45)',
  cups: 'rgba(58,107,139,0.45)',
  swords: 'rgba(107,139,107,0.45)',
  pentacles: 'rgba(139,122,58,0.45)',
};

const suitHoverBorderColors: Record<string, string> = {
  major: 'rgba(201,168,76,0.7)',
  wands: 'rgba(212,64,64,0.7)',
  cups: 'rgba(58,107,139,0.7)',
  swords: 'rgba(107,139,107,0.7)',
  pentacles: 'rgba(139,122,58,0.7)',
};

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

function CardGridItem({ card, index, onClick }: CardGridItemProps) {
  const [isHovered, setIsHovered] = useState(false);

  const suitKey = card.suit || 'major';
  const elementColor = elementColors[card.element] || '#C9A84C';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{
        duration: 0.4,
        delay: index * 0.03,
        ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
      }}
      className="relative cursor-pointer group"
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        className="relative overflow-hidden bg-deep-blue"
        style={{
          borderRadius: '8px / 120% 8px',
          border: `1px solid ${isHovered ? suitHoverBorderColors[suitKey] : suitBorderColors[suitKey]}`,
        }}
        animate={{
          y: isHovered ? -6 : 0,
          boxShadow: isHovered
            ? '0 12px 40px rgba(0,0,0,0.4)'
            : '0 4px 12px rgba(0,0,0,0.2)',
        }}
        transition={{ duration: 0.2 }}
      >
        {/* Card image (aspect ratio 2:3) */}
        <div className="relative w-full aspect-[2/3]">
          <img
            src={card.image || '/assets/card-back.jpg'}
            alt={card.name}
            className="w-full h-full object-cover"
            draggable={false}
            style={{
              filter: isHovered ? 'brightness(0.35) blur(1px)' : 'brightness(0.95)',
              transition: 'filter 0.3s ease',
            }}
          />

          {/* Hover overlay */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {/* Element color dot */}
                <div
                  className="w-3 h-3 rounded-full mb-2"
                  style={{
                    backgroundColor: elementColor,
                    boxShadow: `0 0 8px ${elementColor}60`,
                  }}
                />

                {/* Card name */}
                <h3 className="font-serif-sc text-base sm:text-lg font-semibold text-star-gold leading-tight mb-1">
                  {card.name}
                </h3>

                {/* English name */}
                <p className="font-cinzel text-[10px] sm:text-xs text-moon-silver mb-1">
                  {card.nameEn}
                </p>

                {/* Roman numeral for major arcana */}
                {card.romanNum && (
                  <span className="font-playfair text-xs text-dark-gold mb-2">
                    {card.romanNum}
                  </span>
                )}

                {/* Element label */}
                <span
                  className="text-[10px] font-sans-sc px-2 py-0.5 rounded-full mb-3"
                  style={{
                    backgroundColor: `${elementColor}25`,
                    color: elementColor,
                  }}
                >
                  {elementLabels[card.element] || card.element}
                </span>

                {/* View details hint */}
                <span className="text-[10px] text-star-gold/70 font-sans-sc">
                  查看详情 &rarr;
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Suit color accent line at bottom */}
          <div
            className="absolute bottom-0 left-0 right-0 h-0.5"
            style={{
              backgroundColor: elementColor,
              opacity: isHovered ? 0.8 : 0.3,
              transition: 'opacity 0.3s ease',
            }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ────────────────────────────────
   Grouped Card Grid
   ──────────────────────────────── */

interface CardGroup {
  label: string;
  labelColor: string;
  cards: TarotCardType[];
}

interface CardGridProps {
  cards: TarotCardType[];
  onCardClick: (card: TarotCardType) => void;
  activeFilter: string;
}

export default function CardGrid({ cards, onCardClick, activeFilter }: CardGridProps) {
  // Group cards for display
  const groups: CardGroup[] = [];

  if (activeFilter === 'all') {
    // Major arcana first
    const majorCards = cards.filter((c) => c.arcana === 'major');
    if (majorCards.length > 0) {
      groups.push({
        label: '✦ 大阿尔卡纳 MAJOR ARCANA ✦',
        labelColor: '#8B7A3A',
        cards: majorCards,
      });
    }

    // Then each suit
    const suitOrder: Array<{ suit: string; label: string; color: string }> = [
      { suit: 'wands', label: '权杖 WANDS — 火之意志', color: '#D44040' },
      { suit: 'cups', label: '圣杯 CUPS — 水之情感', color: '#3A6B8B' },
      { suit: 'swords', label: '宝剑 SWORDS — 风之思想', color: '#6B8B6B' },
      { suit: 'pentacles', label: '星币 PENTACLES — 土之物质', color: '#8B7A3A' },
    ];

    for (const { suit, label, color } of suitOrder) {
      const suitCards = cards.filter((c) => c.suit === suit);
      if (suitCards.length > 0) {
        groups.push({ label, labelColor: color, cards: suitCards });
      }
    }
  } else if (activeFilter === 'major') {
    const majorCards = cards.filter((c) => c.arcana === 'major');
    if (majorCards.length > 0) {
      groups.push({
        label: '✦ 大阿尔卡纳 MAJOR ARCANA ✦',
        labelColor: '#8B7A3A',
        cards: majorCards,
      });
    }
  } else {
    // Filter by specific suit
    const suitColors: Record<string, string> = {
      wands: '#D44040',
      cups: '#3A6B8B',
      swords: '#6B8B6B',
      pentacles: '#8B7A3A',
    };
    const suitLabels: Record<string, string> = {
      wands: '权杖 WANDS — 火之意志',
      cups: '圣杯 CUPS — 水之情感',
      swords: '宝剑 SWORDS — 风之思想',
      pentacles: '星币 PENTACLES — 土之物质',
    };
    const filteredCards = cards.filter((c) => c.suit === activeFilter);
    if (filteredCards.length > 0) {
      groups.push({
        label: `✦ ${suitLabels[activeFilter]} ✦`,
        labelColor: suitColors[activeFilter] || '#8B7A3A',
        cards: filteredCards,
      });
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-16">
      <AnimatePresence mode="wait">
        {cards.length === 0 ? (
          <motion.div
            key="empty"
            className="flex flex-col items-center justify-center py-24"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <p className="font-serif-sc text-xl text-moon-silver mb-4">
              未找到匹配的牌
            </p>
            <p className="text-sm text-dark-gold font-sans-sc mb-6">
              尝试其他关键词或筛选条件
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {groups.map((group, groupIndex) => (
              <div key={group.label} className={groupIndex > 0 ? 'mt-12' : ''}>
                {/* Group label */}
                <motion.div
                  className="text-center mb-6"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: groupIndex * 0.1 }}
                >
                  <span
                    className="font-serif-sc text-sm tracking-[0.1em]"
                    style={{ color: group.labelColor }}
                  >
                    {group.label}
                  </span>
                </motion.div>

                {/* Grid */}
                <motion.div
                  className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 2xl:grid-cols-6 gap-4 sm:gap-6"
                  layout
                >
                  <AnimatePresence mode="popLayout">
                    {group.cards.map((card, cardIndex) => (
                      <CardGridItem
                        key={card.id}
                        card={card}
                        index={cardIndex}
                        onClick={() => onCardClick(card)}
                      />
                    ))}
                  </AnimatePresence>
                </motion.div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
