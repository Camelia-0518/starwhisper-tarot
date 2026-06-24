import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RotateCcw } from 'lucide-react';
import { Link } from 'react-router';
import type { StoredReading } from '@/hooks/useReadingHistory';
import { tarotCards } from '@/data/tarotCards';
import { spreads } from '@/data/spreads';
import TarotCard from '@/components/TarotCard';

interface ReadingDetailModalProps {
  reading: StoredReading | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete: (id: string) => void;
}

function formatFullDate(dateStr: string): string {
  const d = new Date(dateStr);
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');
  const seconds = d.getSeconds().toString().padStart(2, '0');
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const weekday = weekdays[d.getDay()];
  return `${year}年${month}月${day}日 ${weekday} ${hours}:${minutes}:${seconds}`;
}

export default function ReadingDetailModal({
  reading,
  isOpen,
  onClose,
  onDelete,
}: ReadingDetailModalProps) {
  const resolvedCards = useMemo(() => {
    if (!reading) return [];
    return reading.cards.map((c) => {
      const cardData = tarotCards.find((tc) => tc.id === c.cardId);
      const spread = spreads.find((s) => s.id === reading.spreadId);
      const position = spread?.positions.find((p) => p.index === c.positionIndex);
      return {
        ...c,
        cardData,
        positionDescription: position?.description || '',
      };
    });
  }, [reading]);

  return (
    <AnimatePresence>
      {isOpen && reading && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-deep-night/85 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Panel */}
          <motion.div
            className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-deep-blue border border-star-gold/30 rounded-xl"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{
              duration: 0.4,
              ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
            }}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-deep-blue/95 backdrop-blur-sm border-b border-star-gold/15 px-6 py-4 flex items-start justify-between">
              <div className="flex-1 min-w-0 pr-4">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                >
                  <p className="text-moon-silver text-xs mb-1.5">
                    {formatFullDate(reading.date)}
                  </p>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-star-gold/10 text-star-gold text-xs font-medium">
                      {reading.spreadName}
                    </span>
                  </div>
                  {reading.question && (
                    <h3 className="font-serif-sc text-lg font-semibold text-star-white">
                      {reading.question}
                    </h3>
                  )}
                </motion.div>
              </div>
              <button
                onClick={onClose}
                className="flex-shrink-0 p-2 rounded-lg text-moon-silver/50 hover:text-star-white hover:bg-star-gold/10 transition-all duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-6">
              {/* Cards Grid */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h4 className="font-serif-sc text-star-gold text-base font-semibold mb-4">
                  牌阵回顾
                </h4>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 mb-8">
                  {resolvedCards.map((rc, i) => (
                    <motion.div
                      key={i}
                      className="flex flex-col items-center gap-2"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.25 + i * 0.08, duration: 0.4 }}
                    >
                      <TarotCard
                        card={rc.cardData}
                        isReversed={rc.isReversed}
                        showFront={true}
                        width={100}
                        height={175}
                      />
                      <div className="text-center">
                        <p className="text-star-gold text-[11px] font-medium">
                          {rc.positionName}
                        </p>
                        <p className="text-moon-silver text-[10px]">
                          {rc.cardName}
                        </p>
                        <span
                          className={`text-[9px] ${
                            rc.isReversed ? 'text-reversed-red' : 'text-upright-green'
                          }`}
                        >
                          {rc.isReversed ? '逆位' : '正位'}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* AI Interpretation */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mb-8"
              >
                <h4 className="font-serif-sc text-star-gold text-base font-semibold mb-4">
                  星辰解读
                </h4>
                <div className="bg-indigo-main/50 border border-star-gold/10 rounded-lg p-5">
                  <p className="text-star-white text-sm leading-[1.85] whitespace-pre-wrap">
                    {reading.interpretation}
                  </p>
                </div>
              </motion.div>

              {/* Card details */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mb-8"
              >
                <h4 className="font-serif-sc text-star-gold text-base font-semibold mb-4">
                  逐牌详解
                </h4>
                <div className="space-y-4">
                  {resolvedCards.map((rc, i) => (
                    <motion.div
                      key={i}
                      className="bg-indigo-main/30 border border-star-gold/10 rounded-lg p-4"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.55 + i * 0.06 }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-star-gold text-xs font-medium">
                          {rc.positionName}
                        </span>
                        <span className="text-moon-silver/40">·</span>
                        <span className="text-star-white text-xs font-medium">
                          {rc.cardName}
                        </span>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                            rc.isReversed
                              ? 'bg-reversed-red/10 text-reversed-red'
                              : 'bg-upright-green/10 text-upright-green'
                          }`}
                        >
                          {rc.isReversed ? '逆位' : '正位'}
                        </span>
                      </div>
                      <p className="text-moon-silver/70 text-xs leading-relaxed">
                        {rc.positionDescription}
                      </p>
                      {rc.cardData && (
                        <p className="text-moon-silver/60 text-xs leading-relaxed mt-1.5">
                          {rc.isReversed
                            ? rc.cardData.meaningReversed
                            : rc.cardData.meaningUpright}
                        </p>
                      )}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Footer actions */}
            <div className="sticky bottom-0 z-10 bg-deep-blue/95 backdrop-blur-sm border-t border-star-gold/15 px-6 py-4 flex flex-wrap items-center gap-3">
              <Link
                to={`/reading?question=${encodeURIComponent(reading.question)}&spread=${reading.spreadId}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-star-gold to-star-gold-light text-deep-night font-sans-sc text-sm font-medium transition-all duration-200 hover:shadow-gold hover:scale-[1.03] active:scale-[0.97]"
              >
                <RotateCcw className="w-4 h-4" />
                <span>用同一问题重新占卜</span>
              </Link>
              <button
                onClick={() => onDelete(reading.id)}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-reversed-red/40 text-reversed-red font-sans-sc text-sm font-medium transition-all duration-200 hover:bg-reversed-red/10"
              >
                <span>删除记录</span>
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
