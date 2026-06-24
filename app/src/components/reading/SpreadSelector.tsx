import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Sparkles } from 'lucide-react';
import { spreads } from '@/data/spreads';
import { useReadingStore } from '@/store/readingStore';

const slowEase = [0.16, 1, 0.3, 1] as [number, number, number, number];

/**
 * 根据牌阵生成视觉预览
 * 统一卡片尺寸：40×60px（2:3 塔罗比例）
 */
function SpreadPreview({ spreadId, cardCount }: { spreadId: string; cardCount: number }) {
  const CARD_W = 40;
  const CARD_H = 60;

  if (spreadId === 'celtic-cross') {
    return (
      <div className="relative" style={{ width: 120, height: 80 }}>
        <div
          className="absolute rounded bg-deep-night border border-star-gold/40"
          style={{ width: CARD_W, height: CARD_H, left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
        />
        <div
          className="absolute rounded bg-deep-night border border-star-gold/40"
          style={{ width: CARD_H, height: CARD_W, left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
        />
        <div
          className="absolute rounded bg-deep-night border border-star-gold/30"
          style={{ width: CARD_W * 0.7, height: CARD_H * 0.7, left: '50%', top: 2, transform: 'translateX(-50%)' }}
        />
        <div
          className="absolute rounded bg-deep-night border border-star-gold/30"
          style={{ width: CARD_W * 0.7, height: CARD_H * 0.7, left: '50%', bottom: 2, transform: 'translateX(-50%)' }}
        />
        <div
          className="absolute rounded bg-deep-night border border-star-gold/30"
          style={{ width: CARD_W * 0.7, height: CARD_H * 0.7, left: 2, top: '50%', transform: 'translateY(-50%)' }}
        />
        <div
          className="absolute rounded bg-deep-night border border-star-gold/30"
          style={{ width: CARD_W * 0.7, height: CARD_H * 0.7, right: 2, top: '50%', transform: 'translateY(-50%)' }}
        />
      </div>
    );
  }

  // 通用牌背预览：所有卡片统一 40×60
  const showCount = Math.min(cardCount, 5);
  const cardEls = Array.from({ length: showCount }, (_, i) => (
    <div
      key={i}
      className="rounded-md bg-deep-night border border-star-gold/30 flex items-center justify-center flex-shrink-0"
      style={{
        width: CARD_W,
        height: CARD_H,
        transform: `rotate(${(i - (showCount - 1) / 2) * 6}deg)`,
        marginLeft: i > 0 ? -10 : 0,
        zIndex: showCount - i,
      }}
    >
      <Sparkles className="w-3 h-3 text-star-gold/40" />
    </div>
  ));

  return (
    <div className="flex items-center justify-center relative">
      {cardEls}
      {cardCount > 5 && (
        <span className="absolute -bottom-3 text-star-gold/50 text-[10px] font-medium">
          +{cardCount - 5}
        </span>
      )}
    </div>
  );
}

export default function SpreadSelector() {
  const { selectedSpreadId, selectSpread } = useReadingStore();
  const [selected, setSelected] = useState(selectedSpreadId || 'three-card');

  useEffect(() => {
    if (selected) selectSpread(selected);
  }, [selected, selectSpread]);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8">
      {/* Title */}
      <motion.div
        className="text-center mb-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: slowEase }}
      >
        <h1 className="font-serif-sc text-3xl md:text-4xl font-bold text-star-gold mb-3">
          选择你的牌阵
        </h1>
        <p className="text-moon-silver text-base md:text-lg">
          不同的牌阵揭示不同层面的答案
        </p>
      </motion.div>

      {/* Spread Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {spreads.map((spread, index) => {
          const isSelected = selected === spread.id;
          return (
            <motion.div
              key={spread.id}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                duration: 0.7,
                delay: index * 0.15,
                ease: slowEase,
              }}
              whileHover={{ y: -8 }}
              onClick={() => setSelected(spread.id)}
              className={`relative cursor-pointer rounded-xl p-6 border-2 transition-all duration-200 ${
                isSelected
                  ? 'border-star-gold/80 shadow-gold-glow bg-star-gold/5'
                  : 'border-star-gold/20 bg-deep-blue hover:border-star-gold/50'
              }`}
              style={{ minHeight: 380 }}
            >
              {/* Selected checkmark */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-star-gold flex items-center justify-center"
                >
                  <Check className="w-4 h-4 text-deep-night" strokeWidth={3} />
                </motion.div>
              )}

              {/* Card count badge */}
              <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-star-gold/15 border border-star-gold/30">
                <span className="text-star-gold text-xs font-medium">
                  {spread.cardCount} 张牌
                </span>
              </div>

              {/* Visual preview */}
              <div className="mt-12 mb-6 flex items-center justify-center h-32">
                <SpreadPreview spreadId={spread.id} cardCount={spread.cardCount} />
              </div>

              {/* Name */}
              <h3 className="font-serif-sc text-xl font-semibold text-star-gold mb-1 text-center">
                {spread.name}
              </h3>
              <p className="font-cinzel text-xs text-moon-silver/60 text-center tracking-widest mb-4">
                {spread.nameEn.toUpperCase()}
              </p>

              {/* Description */}
              <p className="text-moon-silver/80 text-sm leading-relaxed text-center mb-4">
                {spread.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap justify-center gap-2">
                {spread.tags?.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded-full bg-bright-indigo/50 text-moon-silver text-xs"
                  >
                    {tag}
                  </span>
                )) || getDefaultTags(spread.id).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded-full bg-bright-indigo/50 text-moon-silver text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function getDefaultTags(spreadId: string): string[] {
  const tagMap: Record<string, string[]> = {
    'single': ['日常指引', '快速问答'],
    'mind-body-spirit': ['身心灵', '平衡'],
    'three-card': ['经典牌阵', '时间线', '过去·现在·未来'],
    'relationship': ['感情', '人际关系', '情感透视'],
    'choice': ['抉择', '两难', '对比分析'],
    'career': ['事业', '职场', '发展导航'],
    'horseshoe': ['全面', '深度', 'U形排列'],
    'weekly': ['运势', '规划', '每日指引'],
    'celtic-cross': ['深度解读', '全面分析', '10个位置'],
  };
  return tagMap[spreadId] || [];
}
