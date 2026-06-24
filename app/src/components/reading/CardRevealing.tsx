import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCcw, Zap, Sparkles } from 'lucide-react';
// slowEase is used in animation transitions
import { useReadingStore } from '@/store/readingStore';
import { spreads } from '@/data/spreads';
import TarotCard from '@/components/TarotCard';

// Animation easing used by Framer Motion transitions
// const slowEase = [0.16, 1, 0.3, 1] as [number, number, number, number];

export default function CardRevealing() {
  const {
    selectedSpreadId,
    drawnCards,
    revealedCards,
    allCardsRevealed,
    revealCard,
    revealAllCards,
    generateAIReading,
    resetReading,
  } = useReadingStore();

  const [showConfirm, setShowConfirm] = useState(false);

  const spread = selectedSpreadId
    ? spreads.find((s) => s.id === selectedSpreadId)
    : null;

  const isSingle = spread?.id === 'single';
  const isCeltic = spread?.id === 'celtic-cross';

  const handleRevealCard = useCallback(
    (index: number) => {
      if (!revealedCards.has(index)) {
        revealCard(index);
      }
    },
    [revealedCards, revealCard]
  );

  const handleRevealAll = useCallback(() => {
    revealAllCards();
  }, [revealAllCards]);

  const handleStartInterpretation = useCallback(() => {
    generateAIReading();
  }, [generateAIReading]);

  const handleRestart = useCallback(() => {
    setShowConfirm(true);
  }, []);

  const confirmRestart = useCallback(() => {
    resetReading();
    setShowConfirm(false);
  }, [resetReading]);

  const getCardSize = () => {
    if (isCeltic) return { width: 110, height: 190 };
    if (isSingle) return { width: 180, height: 315 };
    return { width: 150, height: 262 };
  };

  const size = getCardSize();

  if (!spread || drawnCards.length === 0) return null;

  return (
    <div className="w-full h-full flex flex-col items-center justify-center relative px-4 py-8">
      {/* Title */}
      <motion.div
        className="text-center mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="font-serif-sc text-2xl md:text-3xl font-semibold text-star-gold mb-2">
          翻牌解义
        </h2>
        <p className="text-moon-silver/70 text-sm">
          {allCardsRevealed
            ? '所有牌已翻开，点击下方按钮获取AI解读'
            : '点击每张牌来揭示它的含义'}
        </p>
      </motion.div>

      {/* Spread layout */}
      <div
        className="relative flex-1 w-full max-w-4xl"
        style={{ minHeight: isCeltic ? 500 : 350 }}
      >
        {drawnCards.map((drawnCard, index) => {
          const isRevealed = revealedCards.has(index);

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: index * 0.1 }}
              className="absolute flex flex-col items-center"
              style={{
                left: `${drawnCard.position.x}%`,
                top: `${drawnCard.position.y}%`,
                transform: `translate(-50%, -50%)`,
              }}
            >
              <motion.div
                whileHover={!isRevealed ? { scale: 1.05 } : undefined}
                className="relative"
              >
                <TarotCard
                  card={drawnCard.card}
                  isReversed={drawnCard.isReversed}
                  showFront={isRevealed}
                  width={size.width}
                  height={size.height}
                  onClick={() => handleRevealCard(index)}
                  animate={!isRevealed}
                />

                {/* Gold sweep effect on reveal */}
                <AnimatePresence>
                  {isRevealed && (
                    <motion.div
                      initial={{ x: '-100%', opacity: 0.8 }}
                      animate={{ x: '200%', opacity: 0 }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      className="absolute inset-0 pointer-events-none overflow-hidden"
                      style={{ borderRadius: '8px / 120% 8px' }}
                    >
                      <div
                        className="w-1/2 h-full"
                        style={{
                          background:
                            'linear-gradient(90deg, transparent, rgba(201,168,76,0.5), transparent)',
                        }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Revealed glow */}
                {isRevealed && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      borderRadius: '8px / 120% 8px',
                      boxShadow: '0 0 20px rgba(201, 168, 76, 0.3)',
                    }}
                  />
                )}
              </motion.div>

              {/* Position label */}
              <motion.span
                className="mt-2 font-serif-sc text-xs text-star-gold whitespace-nowrap"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {drawnCard.position.name}
              </motion.span>

              {/* Card name when revealed */}
              <AnimatePresence>
                {isRevealed && (
                  <motion.span
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                    className="font-serif-sc text-[10px] text-moon-silver/70 whitespace-nowrap"
                  >
                    {drawnCard.card.name}
                    {drawnCard.isReversed ? ' · 逆位' : ' · 正位'}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Action buttons */}
      <motion.div
        className="flex flex-wrap items-center justify-center gap-3 mt-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        {!allCardsRevealed && (
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleRevealAll}
            className="flex items-center gap-2 px-6 py-2.5 rounded-full border border-star-gold text-star-gold hover:bg-star-gold/10 transition-colors font-sans-sc text-sm"
          >
            <Zap className="w-4 h-4" />
            一键翻牌
          </motion.button>
        )}

        {allCardsRevealed && (
          <motion.button
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleStartInterpretation}
            className="flex items-center gap-2 px-8 py-3 rounded-full bg-gradient-gold text-deep-night font-sans-sc font-medium hover:shadow-gold-glow transition-shadow"
          >
            <Sparkles className="w-4 h-4" />
            AI解牌
          </motion.button>
        )}

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleRestart}
          className="flex items-center gap-2 px-4 py-2.5 rounded-full text-moon-silver/60 hover:text-moon-silver text-sm transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
          重新抽牌
        </motion.button>
      </motion.div>

      {/* Confirm restart modal */}
      <AnimatePresence>
        {showConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(10,10,26,0.85)] backdrop-blur-sm"
            onClick={() => setShowConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-deep-blue border border-star-gold/30 rounded-xl p-6 max-w-sm mx-4"
            >
              <h3 className="font-serif-sc text-lg text-star-gold mb-3">
                确认重新抽牌
              </h3>
              <p className="text-moon-silver text-sm mb-6">
                当前的占卜进度将会丢失，是否重新开始？
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="px-4 py-2 rounded-full text-moon-silver hover:text-star-gold text-sm transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={confirmRestart}
                  className="px-4 py-2 rounded-full bg-gradient-gold text-deep-night text-sm font-medium hover:shadow-gold-glow transition-shadow"
                >
                  确认
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
