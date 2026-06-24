import { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, Trash2 } from 'lucide-react';
import type { StoredReading } from '@/hooks/useReadingHistory';

interface HistoryCardProps {
  reading: StoredReading;
  onView: (reading: StoredReading) => void;
  onDelete: (id: string) => void;
  index: number;
  isLatest?: boolean;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const weekday = weekdays[d.getDay()];
  return `${year}年${month}月${day}日 · ${weekday} · ${hours}:${minutes}`;
}

function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen) + '...';
}

export default function HistoryCard({
  reading,
  onView,
  onDelete,
  index,
  isLatest = false,
}: HistoryCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(reading.id);
  };

  const handleViewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onView(reading);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.08,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
      }}
      className="relative"
    >
      <motion.div
        className="relative bg-deep-blue border border-star-gold/15 rounded-lg p-5 cursor-pointer transition-colors duration-200"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => onView(reading)}
        animate={{
          y: isHovered ? -2 : 0,
          borderColor: isHovered ? 'rgba(201, 168, 76, 0.4)' : 'rgba(201, 168, 76, 0.15)',
        }}
        transition={{ duration: 0.2 }}
        style={{
          boxShadow: isHovered
            ? '0 4px 20px rgba(201, 168, 76, 0.15)'
            : '0 2px 8px rgba(0, 0, 0, 0.2)',
        }}
      >
        {/* Latest indicator glow */}
        {isLatest && (
          <motion.div
            className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-star-gold"
            animate={{
              boxShadow: [
                '0 0 4px rgba(201, 168, 76, 0.4)',
                '0 0 12px rgba(201, 168, 76, 0.8)',
                '0 0 4px rgba(201, 168, 76, 0.4)',
              ],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}

        {/* Card Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <p className="text-dark-gold text-xs mb-1.5">
              {formatDate(reading.date)}
            </p>
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-star-gold/10 text-star-gold text-xs font-medium">
                {reading.spreadName}
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-upright-green/10 text-upright-green text-[10px]">
                已解读
              </span>
            </div>
            {reading.question && (
              <p className="text-star-white text-sm font-medium truncate">
                {reading.question}
              </p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1 ml-3 flex-shrink-0">
            <button
              onClick={handleViewClick}
              className="p-2 rounded-lg text-moon-silver/50 hover:text-star-gold hover:bg-star-gold/10 transition-all duration-200"
              title="查看详情"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={handleDeleteClick}
              className="p-2 rounded-lg text-moon-silver/50 hover:text-reversed-red hover:bg-reversed-red/10 transition-all duration-200"
              title="删除"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Cards preview */}
        <div className="flex items-center gap-3 mb-3">
          <div className="flex items-center gap-2">
            {reading.cards.slice(0, 5).map((card, i) => (
              <div key={i} className="flex flex-col items-center gap-0.5">
                <div
                  className="relative w-10 h-[56px] rounded border border-star-gold/30 overflow-hidden bg-indigo-main flex-shrink-0"
                  style={{ borderRadius: '3px / 30% 3px' }}
                >
                  <img
                    src="/assets/card-back.jpg"
                    alt={card.cardName}
                    className="w-full h-full object-cover"
                    style={{
                      borderRadius: '3px / 30% 3px',
                      transform: card.isReversed ? 'rotate(180deg)' : undefined,
                    }}
                  />
                  {card.isReversed && (
                    <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-reversed-red/80 flex items-center justify-center">
                      <span className="text-[6px] text-white font-bold">逆</span>
                    </div>
                  )}
                </div>
                <span className="text-[8px] text-moon-silver/50 truncate max-w-[40px]">
                  {card.positionName}
                </span>
              </div>
            ))}
            {reading.cards.length > 5 && (
              <div className="flex items-center justify-center w-10 h-[56px] rounded border border-star-gold/20 bg-indigo-main/50 flex-shrink-0">
                <span className="text-[10px] text-moon-silver/50">
                  +{reading.cards.length - 5}
                </span>
              </div>
            )}
          </div>

          <div className="ml-auto text-right flex-shrink-0">
            <p className="text-moon-silver/40 text-xs">
              共 {reading.cards.length} 张牌
            </p>
          </div>
        </div>

        {/* Interpretation preview */}
        {reading.interpretation && (
          <p className="text-moon-silver/60 text-xs leading-relaxed line-clamp-2">
            {truncate(reading.interpretation, 80)}
          </p>
        )}

        {/* View full link */}
        <div className="mt-2 flex items-center justify-between">
          <button
            onClick={handleViewClick}
            className="text-nebula-purple text-xs hover:text-star-gold-light transition-colors"
          >
            查看完整解读 →
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
