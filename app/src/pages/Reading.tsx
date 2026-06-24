import { useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Layout from '@/components/Layout';
import { useReadingStore } from '@/store/readingStore';
import SpreadSelector from '@/components/reading/SpreadSelector';
import QuestionInput from '@/components/reading/QuestionInput';
import ShuffleAnimation from '@/components/reading/ShuffleAnimation';
import CardDrawing from '@/components/reading/CardDrawing';
import CardRevealing from '@/components/reading/CardRevealing';
import AIInterpretation from '@/components/reading/AIInterpretation';

const slowEase = [0.16, 1, 0.3, 1] as [number, number, number, number];

const STEPS = [
  { label: '牌阵选择', num: 1 },
  { label: '冥想提问', num: 2 },
  { label: '洗牌仪式', num: 3 },
  { label: '翻牌解义', num: 4 },
  { label: 'AI解读', num: 5 },
];

export default function Reading() {
  const {
    step,
    isTransitioning,
    isLoadingAI,
    showInterpretation,
    setStep,
    setIsTransitioning,
    startShuffling,
    drawCards,
    startDrawing,
    canGoNext,
    canGoBack,
  } = useReadingStore();

  const goToStep = useCallback(
    (newStep: number) => {
      if (isTransitioning) return;
      setIsTransitioning(true);
      setTimeout(() => {
        setStep(newStep);
        setIsTransitioning(false);
      }, 300);
    },
    [isTransitioning, setStep, setIsTransitioning]
  );

  const handleNext = useCallback(() => {
    if (!canGoNext()) return;

    if (step === 2) {
      // Going to step 3 - start shuffling
      startShuffling();
    } else if (step === 3) {
      // Going to step 4 - draw cards
      drawCards();
      startDrawing();
    }

    goToStep(step + 1);
  }, [step, canGoNext, goToStep, startShuffling, drawCards, startDrawing]);

  const handleBack = useCallback(() => {
    if (!canGoBack()) return;
    goToStep(step - 1);
  }, [step, canGoBack, goToStep]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 忽略输入框有焦点时的按键（对话输入框等）
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      if (e.key === 'ArrowRight' || e.key === 'Enter') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handleBack();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handleBack]);

  // Auto-advance from step 3 when shuffle completes
  useEffect(() => {
    const check = useReadingStore.getState();
    if (step === 3 && check.shuffleComplete && !isTransitioning) {
      // Wait a moment then auto-advance
      const timer = setTimeout(() => {
        drawCards();
        startDrawing();
        goToStep(4);
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [step, isTransitioning, goToStep, drawCards, startDrawing]);

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return <SpreadSelector />;
      case 2:
        return <QuestionInput />;
      case 3:
        return <ShuffleAnimation />;
      case 4:
        return <CardDrawing />;
      case 5:
        // Step 5 shows CardRevealing first, then AIInterpretation
        if (!showInterpretation && !isLoadingAI) {
          return <CardRevealing />;
        }
        return <AIInterpretation />;
      default:
        return <SpreadSelector />;
    }
  };

  const getNextButtonText = () => {
    switch (step) {
      case 1:
        return '下一步';
      case 2:
        return '开始洗牌';
      case 3:
        return '准备抽牌';
      case 4:
        return '解读牌义';
      case 5:
        return '完成';
      default:
        return '下一步';
    }
  };

  // Hide bottom navigation during interpretation loading/display
  const hideNav = step === 5 && (isLoadingAI || showInterpretation);

  return (
    <Layout>
      <div
        className="min-h-[100dvh] flex flex-col relative bg-cover bg-center"
        style={{ backgroundImage: 'url(/assets/altar-bg.png)' }}
      >
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-deep-night/70" />

        {/* Content wrapper */}
        <div className="relative z-10 flex-1 flex flex-col min-h-[100dvh]">
          {/* Step indicator */}
          {!hideNav && (
            <motion.div
              className="pt-20 pb-4 px-4"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: slowEase }}
            >
              <div className="max-w-3xl mx-auto">
                {/* Progress info */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-moon-silver/60 text-xs">
                    步骤 {step} / 5
                  </span>
                  <span className="text-star-gold text-xs font-medium">
                    {STEPS[step - 1]?.label}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="h-0.5 bg-bright-indigo/30 rounded-full overflow-hidden mb-3">
                  <motion.div
                    className="h-full bg-star-gold rounded-full"
                    initial={{ width: 0 }}
                    animate={{
                      width: `${(step / 5) * 100}%`,
                    }}
                    transition={{ duration: 0.5, ease: slowEase }}
                  />
                </div>

                {/* Step labels */}
                <div className="flex items-center justify-between">
                  {STEPS.map((s, i) => {
                    const isCompleted = i + 1 < step;
                    const isCurrent = i + 1 === step;

                    return (
                      <button
                        key={s.num}
                        onClick={() => {
                          if (isCompleted) goToStep(s.num);
                        }}
                        className={`text-[10px] md:text-xs transition-colors ${
                          isCurrent
                            ? 'text-star-gold font-medium'
                            : isCompleted
                            ? 'text-star-gold/50 cursor-pointer hover:text-star-gold/80'
                            : 'text-moon-silver/30'
                        }`}
                        disabled={!isCompleted && !isCurrent}
                      >
                        <span className="hidden sm:inline">{s.label}</span>
                        <span className="sm:hidden">{s.num}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* Main content area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={step + (isLoadingAI ? '-loading' : showInterpretation ? '-ai' : '')}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="flex-1 flex flex-col overflow-y-auto"
              >
                {renderStepContent()}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Bottom action bar */}
          {!hideNav && (
            <motion.div
              className="border-t border-star-gold/10 px-4 py-4"
              style={{
                background: 'rgba(10, 10, 26, 0.9)',
                backdropFilter: 'blur(12px)',
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
            >
              <div className="max-w-3xl mx-auto flex items-center justify-between">
                {/* Back button */}
                {canGoBack() ? (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleBack}
                    className="px-5 py-2.5 rounded-full text-moon-silver hover:text-star-white transition-colors text-sm font-sans-sc"
                  >
                    上一步
                  </motion.button>
                ) : (
                  <div />
                )}

                {/* Next button */}
                <motion.button
                  whileHover={canGoNext() ? { scale: 1.03 } : undefined}
                  whileTap={canGoNext() ? { scale: 0.97 } : undefined}
                  onClick={handleNext}
                  disabled={!canGoNext()}
                  className={`px-8 py-2.5 rounded-full font-sans-sc text-sm font-medium transition-all ${
                    canGoNext()
                      ? 'bg-gradient-gold text-deep-night hover:shadow-gold-glow'
                      : 'bg-bright-indigo/30 text-moon-silver/40 cursor-not-allowed'
                  }`}
                >
                  {getNextButtonText()}
                </motion.button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </Layout>
  );
}
