import { useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { motion, AnimatePresence } from 'framer-motion';
import { useReadingStore } from '@/store/readingStore';
import { SkipForward } from 'lucide-react';

export default function ShuffleAnimation() {
  const { completeShuffling } = useReadingStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const deckRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [phase, setPhase] = useState<'preparing' | 'shuffling' | 'complete'>('preparing');
  const [titleText, setTitleText] = useState('集中精神，感受牌的能量...');

  const CARD_COUNT = 5; // visible stacked cards

  useGSAP(
    () => {
      if (!containerRef.current || cardRefs.current.some((c) => !c)) return;

      const cards = cardRefs.current.filter(Boolean) as HTMLDivElement[];
      const tl = gsap.timeline();

      // Phase A: Preparation (0-1s)
      tl.fromTo(
        cards,
        { opacity: 0, scale: 0.5, y: 50 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.05,
          ease: 'power2.out',
          onComplete: () => setPhase('shuffling'),
        }
      );

      // Phase B-E: Two rounds of cutting + fanning
      for (let round = 0; round < 2; round++) {
        // Cut: split left/right
        tl.to(cards, {
          x: (idx: number) => (idx < CARD_COUNT / 2 ? -80 : 80),
          rotation: (idx: number) => (idx < CARD_COUNT / 2 ? -15 : 15),
          duration: 0.6,
          stagger: 0.03,
          ease: 'power2.inOut',
        });

        // Pause at cut position
        tl.to({}, { duration: 0.4 });

        // Merge back
        tl.to(cards, {
          x: (_idx: number) => (_idx - CARD_COUNT / 2) * 2 + gsap.utils.random(-2, 2),
          y: () => gsap.utils.random(-2, 2),
          rotation: () => gsap.utils.random(-3, 3),
          duration: 0.5,
          stagger: 0.02,
          ease: 'power2.inOut',
        });

        // Fan out in arc
        tl.to(cards, {
          rotation: (idx: number) => (idx - (CARD_COUNT - 1) / 2) * 12,
          x: (idx: number) => (idx - (CARD_COUNT - 1) / 2) * 50,
          y: (idx: number) => Math.abs(idx - (CARD_COUNT - 1) / 2) * -5,
          duration: 0.6,
          stagger: 0.02,
          ease: 'power2.out',
        });

        // Pause at fanned position
        tl.to({}, { duration: 0.4 });

        // Gather back
        tl.to(cards, {
          x: (_idx: number) => (_idx - CARD_COUNT / 2) * 2 + gsap.utils.random(-2, 2),
          y: () => gsap.utils.random(-2, 2),
          rotation: () => gsap.utils.random(-3, 3),
          duration: 0.5,
          stagger: 0.02,
          ease: 'power2.inOut',
        });

        // Brief pause between rounds
        if (round === 0) {
          tl.to({}, { duration: 0.2 });
        }
      }

      // Phase F: Settled
      tl.to(cards, {
        x: (idx: number) => (idx - CARD_COUNT / 2) * 1.5 + gsap.utils.random(-1, 1),
        y: () => gsap.utils.random(-1, 1),
        rotation: () => gsap.utils.random(-2, 2),
        duration: 0.5,
        stagger: 0.02,
        ease: 'power2.out',
        onComplete: () => {
          setPhase('complete');
          setTitleText('牌已洗好，准备抽牌');
          completeShuffling();
        },
      });
    },
    { scope: containerRef }
  );

  return (
    <div
      ref={containerRef}
      className="w-full h-full flex flex-col items-center justify-center relative px-4"
    >
      {/* Title */}
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="font-serif-sc text-2xl md:text-3xl font-semibold text-star-gold mb-2">
          {titleText}
        </h2>
        <AnimatePresence mode="wait">
          {phase === 'shuffling' && (
            <motion.p
              key="shuffling"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-moon-silver/70 text-sm"
            >
              牌正在重新排列它们的能量...
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Deck of cards */}
      <div
        ref={deckRef}
        className="relative"
        style={{ width: 170, height: 290 }}
      >
        {Array.from({ length: CARD_COUNT }).map((_, i) => (
          <div
            key={i}
            ref={(el) => { cardRefs.current[i] = el; }}
            className="absolute top-0 left-0"
            style={{
              width: 160,
              height: 280,
              zIndex: CARD_COUNT - i,
            }}
          >
            <div
              className="w-full h-full bg-deep-blue border-2 border-star-gold/50 overflow-hidden relative"
              style={{ borderRadius: '8px / 120% 8px' }}
            >
              <img
                src="/assets/card-back.jpg"
                alt="Card Back"
                className="w-full h-full object-cover"
                style={{ borderRadius: '8px / 120% 8px' }}
                draggable={false}
              />
            </div>
          </div>
        ))}

        {/* Glow effect around deck */}
        <AnimatePresence>
          {phase === 'complete' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 pointer-events-none"
              style={{ margin: -10 }}
            >
              <div
                className="w-full h-full animate-pulse-glow"
                style={{
                  borderRadius: '12px / 120% 12px',
                  boxShadow: '0 0 30px rgba(201, 168, 76, 0.3)',
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Skip button */}
      {phase !== 'complete' && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          onClick={() => {
            gsap.killTweensOf(cardRefs.current.filter(Boolean));
            setPhase('complete');
            setTitleText('牌已洗好，准备抽牌');
            completeShuffling();
          }}
          className="absolute bottom-8 left-8 flex items-center gap-2 text-moon-silver/50 hover:text-moon-silver text-sm transition-colors"
        >
          <SkipForward className="w-4 h-4" />
          跳过动画
        </motion.button>
      )}
    </div>
  );
}
