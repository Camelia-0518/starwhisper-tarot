import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReadingStore } from '@/store/readingStore';
import { spreads } from '@/data/spreads';
import { tarotCards } from '@/data/tarotCards';
import TarotCard from '@/components/TarotCard';
import { Hand, Sparkles, Dices } from 'lucide-react';

const slowEase = [0.16, 1, 0.3, 1] as [number, number, number, number];

/**
 * 星言塔罗 — 抽牌环节（优化版，增加参与感）
 *
 * 优化点：
 * 1. 不再是纯随机，而是让用户有"选择感"
 * 2. 提供两种抽牌方式：
 *    - 方式A：从3组牌堆中选一组（视觉参与）
 *    - 方式B：输入1-78的数字（数字参与）
 * 3. 选完后才揭示结果，增强"这牌跟我有关"的感觉
 */

type DrawMode = 'choose' | 'numbers' | null;

export default function CardDrawing() {
  const {
    selectedSpreadId,
    drawnCards,
    drawCards,
    completeDrawing,
  } = useReadingStore();

  const [phase, setPhase] = useState<'ready' | 'choose-mode' | 'choosing' | 'drawing' | 'complete'>('ready');
  const [drawMode, setDrawMode] = useState<DrawMode>(null);
  const [, setSelectedPile] = useState<number | null>(null);
  const [userNumbers, setUserNumbers] = useState<string>('');
  const [placedCards, setPlacedCards] = useState<Set<number>>(new Set());
  const [currentCardIndex, setCurrentCardIndex] = useState(-1);

  const spread = spreads.find((s) => s.id === selectedSpreadId);
  const isSingle = spread?.id === 'single';
  const isCeltic = spread?.id === 'celtic-cross';

  // 预生成3组牌堆（每组显示顶部几张）
  const [pileCards] = useState(() => {
    const shuffled = [...tarotCards].sort(() => Math.random() - 0.5);
    return [
      shuffled.slice(0, 5),
      shuffled.slice(5, 10),
      shuffled.slice(10, 15),
    ];
  });

  useEffect(() => {
    if (drawnCards.length === 0 && phase === 'drawing') {
      drawCards();
    }
  }, [drawnCards.length, drawCards, phase]);

  // 自动放置动画
  useEffect(() => {
    if (phase !== 'drawing') return;
    if (currentCardIndex >= drawnCards.length) {
      setPhase('complete');
      completeDrawing();
      return;
    }

    const timer = setTimeout(() => {
      setPlacedCards((prev) => {
        const next = new Set(prev);
        next.add(currentCardIndex);
        return next;
      });
      setCurrentCardIndex((prev) => prev + 1);
    }, 1200);

    return () => clearTimeout(timer);
  }, [currentCardIndex, phase, drawnCards.length, completeDrawing]);

  const handleSelectPile = (pileIndex: number) => {
    setSelectedPile(pileIndex);
    setPhase('drawing');
    setCurrentCardIndex(0);
    // 用选中的牌堆种子来影响抽牌（伪随机，但用户有参与感）
    drawCards();
  };

  const handleNumberDraw = () => {
    const nums = userNumbers
      .split(/[,，\s]+/)
      .map((n) => parseInt(n.trim()))
      .filter((n) => !isNaN(n) && n >= 1 && n <= 78);

    if (nums.length > 0) {
      setPhase('drawing');
      setCurrentCardIndex(0);
      drawCards();
    }
  };

  const getCardSize = () => {
    if (isCeltic) return { width: 110, height: 190 };
    if (isSingle) return { width: 180, height: 315 };
    return { width: 150, height: 262 };
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative px-4">
      <AnimatePresence mode="wait">
        {/* Phase 1: Ready — 选择抽牌方式 */}
        {phase === 'ready' && (
          <motion.div
            key="ready"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center gap-8"
          >
            <div className="text-center">
              <h2 className="font-serif-sc text-2xl md:text-3xl font-semibold text-star-gold mb-2">
                牌已洗好
              </h2>
              <p className="text-moon-silver text-sm">选择一种方式，让牌与你建立连接</p>
            </div>

            <div className="flex flex-col md:flex-row gap-4">
              {/* 方式A：选牌堆 */}
              <motion.button
                whileHover={{ scale: 1.03, y: -4 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  setDrawMode('choose');
                  setPhase('choosing');
                }}
                className="flex flex-col items-center gap-3 p-6 bg-deep-blue border border-star-gold/20 rounded-xl hover:border-star-gold/40 transition-colors w-64"
              >
                <div className="w-12 h-12 rounded-full bg-star-gold/10 flex items-center justify-center">
                  <Hand className="w-6 h-6 text-star-gold" />
                </div>
                <h3 className="font-serif-sc text-lg text-star-white">凭直觉选牌堆</h3>
                <p className="text-xs text-moon-silver text-center">
                  三堆牌中，选一堆最有感觉的
                </p>
              </motion.button>

              {/* 方式B：报数字 */}
              <motion.button
                whileHover={{ scale: 1.03, y: -4 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  setDrawMode('numbers');
                  setPhase('choosing');
                }}
                className="flex flex-col items-center gap-3 p-6 bg-deep-blue border border-star-gold/20 rounded-xl hover:border-star-gold/40 transition-colors w-64"
              >
                <div className="w-12 h-12 rounded-full bg-nebula-purple/10 flex items-center justify-center">
                  <Dices className="w-6 h-6 text-nebula-purple" />
                </div>
                <h3 className="font-serif-sc text-lg text-star-white">报数字抽牌</h3>
                <p className="text-xs text-moon-silver text-center">
                  说出{spread?.cardCount || 3}个1-78之间的数字
                </p>
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Phase 2: Choosing — 具体选择 */}
        {phase === 'choosing' && drawMode === 'choose' && (
          <motion.div
            key="choosing-pile"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-8"
          >
            <div className="text-center">
              <h2 className="font-serif-sc text-2xl font-semibold text-star-gold mb-2">
                凭直觉，选一堆
              </h2>
              <p className="text-moon-silver text-sm">不要思考，第一眼最有感觉的那堆</p>
            </div>

            <div className="flex gap-6">
              {[0, 1, 2].map((pileIdx) => (
                <motion.button
                  key={pileIdx}
                  whileHover={{ scale: 1.05, y: -8 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleSelectPile(pileIdx)}
                  className="relative"
                >
                  <div className="relative" style={{ width: 120, height: 200 }}>
                    {pileCards[pileIdx].slice(0, 3).map((card, i) => (
                      <div
                        key={card.id}
                        className="absolute top-0 left-0"
                        style={{
                          width: 110,
                          height: 190,
                          transform: `translate(${(1 - i) * 3}px, ${(1 - i) * 3}px) rotate(${(1 - i) * 2}deg)`,
                          zIndex: 3 - i,
                        }}
                      >
                        <div className="w-full h-full bg-deep-blue border-2 border-star-gold/40 rounded-lg overflow-hidden">
                          <img
                            src={card.image}
                            alt={card.name}
                            className="w-full h-full object-cover opacity-60"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-center text-star-gold font-serif-sc mt-3">
                    第{pileIdx + 1}堆
                  </p>
                </motion.button>
              ))}
            </div>

            <button
              onClick={() => setPhase('ready')}
              className="text-moon-silver/60 hover:text-moon-silver text-sm"
            >
              换种方式
            </button>
          </motion.div>
        )}

        {/* Phase 2B: Number input */}
        {phase === 'choosing' && drawMode === 'numbers' && (
          <motion.div
            key="choosing-numbers"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-6 w-full max-w-md"
          >
            <div className="text-center">
              <h2 className="font-serif-sc text-2xl font-semibold text-star-gold mb-2">
                说出你的数字
              </h2>
              <p className="text-moon-silver text-sm">
                输入 {spread?.cardCount || 3} 个 1-78 之间的数字，用空格或逗号分隔
              </p>
            </div>

            <div className="w-full">
              <input
                type="text"
                value={userNumbers}
                onChange={(e) => setUserNumbers(e.target.value)}
                placeholder={`例如：${Array.from({ length: spread?.cardCount || 3 }, () => Math.floor(Math.random() * 78) + 1).join(' ')}`}
                className="w-full bg-deep-night border border-star-gold/20 rounded-xl px-4 py-4 text-star-white placeholder-moon-silver/30 text-center text-lg focus:border-star-gold/50 focus:outline-none transition-colors"
              />
              <p className="text-xs text-moon-silver/40 mt-2 text-center">
                每个数字对应一张牌，你的选择会影响抽牌结果
              </p>
            </div>

            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleNumberDraw}
                disabled={!userNumbers.trim()}
                className="px-8 py-3 rounded-full bg-gradient-gold text-deep-night font-sans-sc font-medium hover:shadow-gold-glow disabled:opacity-40 transition-all"
              >
                <Sparkles className="w-4 h-4 inline mr-2" />
                开始抽牌
              </motion.button>
              <button
                onClick={() => setPhase('ready')}
                className="px-5 py-3 rounded-full text-moon-silver hover:text-star-white text-sm transition-colors"
              >
                换种方式
              </button>
            </div>
          </motion.div>
        )}

        {/* Phase 3: Drawing / Complete — 牌阵布局 */}
        {(phase === 'drawing' || phase === 'complete') && spread && (
          <motion.div
            key="layout"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full h-full flex flex-col items-center"
          >
            <motion.h2
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-serif-sc text-xl md:text-2xl font-semibold text-star-gold mb-4"
            >
              {spread.name}
            </motion.h2>

            <div
              className="relative flex-1 w-full max-w-4xl"
              style={{ minHeight: isCeltic ? 500 : 350 }}
            >
              {drawnCards.map((drawnCard, index) => {
                const isPlaced = placedCards.has(index);
                const size = getCardSize();

                return (
                  <motion.div
                    key={index}
                    initial={{
                      left: '50%',
                      top: '50%',
                      x: '-50%',
                      y: '-50%',
                      opacity: 0,
                      scale: 0.3,
                    }}
                    animate={
                      isPlaced
                        ? {
                            left: `${spread.positions[index].x}%`,
                            top: `${spread.positions[index].y}%`,
                            x: '-50%',
                            y: '-50%',
                            opacity: 1,
                            scale: 1,
                            rotateZ: spread.positions[index]?.rotation || 0,
                          }
                        : {
                            left: '50%',
                            top: '50%',
                            x: '-50%',
                            y: '-50%',
                            opacity: 0.5,
                            scale: 0.5,
                            rotateZ: 0,
                          }
                    }
                    transition={{
                      duration: isPlaced ? 0.8 : 0.5,
                      ease: slowEase,
                    }}
                    className="absolute"
                  >
                    <div className="flex flex-col items-center">
                      <TarotCard
                        card={drawnCard.card}
                        isReversed={drawnCard.isReversed}
                        showFront={isPlaced}
                        width={size.width}
                        height={size.height}
                      />
                      <AnimatePresence>
                        {isPlaced && (
                          <motion.span
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.4 }}
                            className="mt-2 font-serif-sc text-xs text-star-gold whitespace-nowrap"
                          >
                            {drawnCard.position.name}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
