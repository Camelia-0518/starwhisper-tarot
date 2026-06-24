import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookMarked } from 'lucide-react';
import Layout from '@/components/Layout';
import FilterBar, { type FilterType, type SortType } from '@/components/cards/FilterBar';
import CardGrid from '@/components/cards/CardGrid';
import CardDetailModal from '@/components/cards/CardDetailModal';
import TarotKnowledge from '@/components/cards/TarotKnowledge';
import { tarotCards } from '@/data/tarotCards';
import type { TarotCard as TarotCardType } from '@/types/tarot';

/* ────────────────────────────────
   Hero Section
   ──────────────────────────────── */

function HeroSection() {
  return (
    <section className="relative py-16 md:py-20 overflow-hidden">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-fixed"
        style={{ backgroundImage: 'url(/assets/library-bg.png)' }}
      >
        <div className="absolute inset-0 bg-deep-night/88" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-4xl mx-auto">
        {/* Book icon */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            duration: 0.5,
            delay: 0.2,
            ease: [0.68, -0.55, 0.265, 1.55] as [number, number, number, number],
          }}
        >
          <BookMarked
            className="w-10 h-10 md:w-12 md:h-12 text-star-gold mb-4"
            strokeWidth={1.5}
          />
        </motion.div>

        {/* Title */}
        <motion.h1
          className="font-serif-sc text-4xl md:text-[56px] font-bold text-star-gold mb-4 leading-tight"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.6,
            ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
          }}
        >
          塔罗牌库
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="font-sans-sc text-moon-silver text-sm md:text-base max-w-2xl leading-relaxed mb-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          七十八张牌，七十八段智慧的低语。探索每张牌背后的象征与启示。
        </motion.p>

        {/* Stats */}
        <motion.p
          className="font-sans-sc text-xs md:text-sm tracking-wider"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <span className="text-star-gold font-semibold">22</span>
          <span className="text-dark-gold mx-1"> 张大阿尔卡纳 · </span>
          <span className="text-star-gold font-semibold">56</span>
          <span className="text-dark-gold mx-1"> 张小阿尔卡纳 · </span>
          <span className="text-star-gold font-semibold">正位与逆位</span>
          <span className="text-dark-gold"> 双义</span>
        </motion.p>
      </div>
    </section>
  );
}

/* ────────────────────────────────
   Cards Page
   ──────────────────────────────── */

export default function Cards() {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortType>('default');
  const [selectedCard, setSelectedCard] = useState<TarotCardType | null>(null);

  const gridRef = useRef<HTMLDivElement>(null);

  // Scroll to grid when filter changes
  useEffect(() => {
    if (gridRef.current) {
      const yOffset = -120;
      const y = gridRef.current.getBoundingClientRect().top + window.scrollY + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  }, [activeFilter]);

  /* ── Filter & Sort Logic ── */

  const filteredCards = useMemo(() => {
    let cards = [...tarotCards];

    // Apply category filter
    if (activeFilter !== 'all') {
      if (activeFilter === 'major') {
        cards = cards.filter((c) => c.arcana === 'major');
      } else {
        cards = cards.filter((c) => c.suit === activeFilter);
      }
    }

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      cards = cards.filter(
        (c) =>
          c.name.includes(query) ||
          c.nameEn.toLowerCase().includes(query) ||
          c.keywordsUpright.some((k) => k.includes(query)) ||
          c.keywordsReversed.some((k) => k.includes(query))
      );
    }

    // Apply sort
    switch (sortBy) {
      case 'name':
        cards.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));
        break;
      case 'element': {
        const elementOrder: Record<string, number> = {
          fire: 0,
          water: 1,
          air: 2,
          earth: 3,
          spirit: 4,
        };
        cards.sort((a, b) => {
          const elDiff =
            (elementOrder[a.element] ?? 5) - (elementOrder[b.element] ?? 5);
          if (elDiff !== 0) return elDiff;
          return a.name.localeCompare(b.name, 'zh-CN');
        });
        break;
      }
      default:
        // Default: major arcana first (by number), then minor by suit
        cards.sort((a, b) => {
          if (a.arcana === 'major' && b.arcana === 'major') {
            return (a.number as number) - (b.number as number);
          }
          if (a.arcana === 'major') return -1;
          if (b.arcana === 'major') return 1;

          const suitOrder = ['wands', 'cups', 'swords', 'pentacles'];
          const suitDiff =
            suitOrder.indexOf(a.suit || '') - suitOrder.indexOf(b.suit || '');
          if (suitDiff !== 0) return suitDiff;

          if (typeof a.number === 'number' && typeof b.number === 'number') {
            return a.number - b.number;
          }
          return a.name.localeCompare(b.name, 'zh-CN');
        });
        break;
    }

    return cards;
  }, [activeFilter, searchQuery, sortBy]);

  /* ── Card Navigation for Modal ── */

  const selectedCardIndex = useMemo(() => {
    if (!selectedCard) return -1;
    return filteredCards.findIndex((c) => c.id === selectedCard.id);
  }, [selectedCard, filteredCards]);

  const handlePrevCard = useCallback(() => {
    if (selectedCardIndex > 0) {
      setSelectedCard(filteredCards[selectedCardIndex - 1]);
    }
  }, [selectedCardIndex, filteredCards]);

  const handleNextCard = useCallback(() => {
    if (selectedCardIndex < filteredCards.length - 1) {
      setSelectedCard(filteredCards[selectedCardIndex + 1]);
    }
  }, [selectedCardIndex, filteredCards]);

  return (
    <Layout>
      {/* Hero Section */}
      <HeroSection />

      {/* Filter Bar */}
      <div ref={gridRef}>
        <FilterBar
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sortBy={sortBy}
          onSortChange={setSortBy}
          resultCount={filteredCards.length}
        />
      </div>

      {/* Card Grid */}
      <CardGrid
        cards={filteredCards}
        onCardClick={setSelectedCard}
        activeFilter={activeFilter}
      />

      {/* Tarot Knowledge Section */}
      <TarotKnowledge />

      {/* Card Detail Modal */}
      <CardDetailModal
        card={selectedCard}
        onClose={() => setSelectedCard(null)}
        onPrev={handlePrevCard}
        onNext={handleNextCard}
        hasPrev={selectedCardIndex > 0}
        hasNext={selectedCardIndex < filteredCards.length - 1}
      />
    </Layout>
  );
}
