import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Eye,
  BookOpen,
  FlipVertical,
  Clock,
  Moon,
  ChevronDown,
  Wand2,
  Compass,
} from 'lucide-react';
import Layout from '@/components/Layout';
import TarotCard from '@/components/TarotCard';
import { getRandomCard, tarotCards } from '@/data/tarotCards';
import type { TarotCard as TarotCardType } from '@/types/tarot';
import { supabase } from '@/lib/supabase';

/* ────────────────────────────────
   Animation Variants
   ──────────────────────────────── */

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
    },
  },
};

const goldGlowPulse = {
  animate: {
    boxShadow: [
      '0 0 15px rgba(201,168,76,0.15)',
      '0 0 30px rgba(201,168,76,0.35)',
      '0 0 15px rgba(201,168,76,0.15)',
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: [0.4, 0, 0.6, 1] as [number, number, number, number],
    },
  },
};

/* ────────────────────────────────
   Features Data
   ──────────────────────────────── */

const features = [
  {
    icon: Sparkles,
    title: '经典牌阵',
    description:
      '单张牌、三张牌（过去-现在-未来）、凯尔特十字——三种经典牌阵，满足不同深度的探索需求。',
  },
  {
    icon: Eye,
    title: 'AI 深度解牌',
    description:
      '基于你抽出的牌阵，AI为你提供个性化、深度化的塔罗解读。不只是牌义，更是属于你的独特启示。',
  },
  {
    icon: BookOpen,
    title: '78张完整牌库',
    description:
      '从愚者到世界，从权杖到星币——78张塔罗牌的完整图鉴，深入了解每张牌的象征与智慧。',
  },
  {
    icon: FlipVertical,
    title: '正位与逆位',
    description:
      '每张牌都有正位与逆位两种解读。我们尊重塔罗的全貌，为你呈现完整的牌义与启示。',
  },
  {
    icon: Clock,
    title: '占卜历史',
    description:
      '每一次占卜都值得被记录。回顾你过往的牌阵与解读，追踪生命中塔罗带来的指引。',
  },
  {
    icon: Moon,
    title: '沉浸式体验',
    description:
      '精心设计的洗牌、抽牌、翻牌动画，配合星空粒子效果，让每一次占卜都成为一场神圣仪式。',
  },
];

/* ────────────────────────────────
   Daily Card Section
   ──────────────────────────────── */

function DailyCardSection() {
  const [dailyCard, setDailyCard] = useState<TarotCardType | null>(null);
  const [isReversed, setIsReversed] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [cardRevealed, setCardRevealed] = useState(false);
  const [hasDrawnToday, setHasDrawnToday] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // 监听登录状态
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user || null);
      setIsLoggedIn(!!data.session?.user);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      setIsLoggedIn(!!session?.user);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  // 加载今日抽牌记录
  useEffect(() => {
    const loadDailyCard = async () => {
      const today = new Date().toISOString().split('T')[0];

      if (isLoggedIn && user) {
        // 从云端加载
        const { data } = await supabase
          .from('daily_draws')
          .select('*')
          .eq('user_id', user.id)
          .eq('draw_date', today)
          .single();

        if (data) {
          const card = tarotCards.find((c: TarotCardType) => c.id === data.card_id);
          if (card) {
            setDailyCard(card);
            setIsReversed(data.is_reversed);
            setCardRevealed(true);
            setHasDrawnToday(true);
          }
        }
      } else {
        // 从本地加载
        const saved = localStorage.getItem('dailyCardDate');
        if (saved === new Date().toDateString()) {
          const savedCardId = localStorage.getItem('dailyCardId');
          if (savedCardId) {
            setHasDrawnToday(true);
          }
        }
      }
    };

    loadDailyCard();
  }, [isLoggedIn, user]);

  const handleDrawCard = useCallback(async () => {
    if (hasDrawnToday) return;
    setIsDrawing(true);

    setTimeout(async () => {
      const card = getRandomCard();
      const reversed = Math.random() < 0.3;
      setDailyCard(card);
      setIsReversed(reversed);
      setIsDrawing(false);
      setCardRevealed(true);
      setHasDrawnToday(true);

      const today = new Date().toISOString().split('T')[0];

      if (isLoggedIn && user) {
        // 保存到云端
        await supabase.from('daily_draws').upsert({
          user_id: user.id,
          card_id: card.id,
          is_reversed: reversed,
          draw_date: today,
        });
      }

      // 本地也保存（作为备份）
      localStorage.setItem('dailyCardDate', new Date().toDateString());
      localStorage.setItem('dailyCardId', card.id);
      localStorage.setItem('dailyCardReversed', String(reversed));
    }, 1500);
  }, [hasDrawnToday, isLoggedIn, user]);

  const todayStr = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    return `${year}年${month}月${day}日`;
  }, []);

  return (
    <section className="relative py-16 md:py-24 overflow-hidden">
      {/* Background gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, #0A0A1A 0%, #12122B 50%, #0A0A1A 100%)',
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
        {/* Section Title */}
        <motion.div
          className="mb-10"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-serif-sc text-3xl md:text-4xl font-bold text-star-gold flex items-center justify-center gap-3">
            <Compass className="w-6 h-6" />
            今日星辰指引
            <Compass className="w-6 h-6" />
          </h2>
          <p className="text-dark-gold text-sm mt-3 font-serif-sc">{todayStr}</p>
          {!isLoggedIn && (
            <p className="text-moon-silver/50 text-xs mt-2">
              <Link to="/profile" className="text-star-gold/60 hover:text-star-gold underline">
                登录后云端同步每日抽牌记录
              </Link>
            </p>
          )}
        </motion.div>

        {/* Crystal Ball */}
        <motion.div
          className="mb-8 flex justify-center"
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="relative">
            <img
              src="/assets/crystal-ball.png"
              alt="Crystal Ball"
              className="w-28 h-28 md:w-32 md:h-32 object-contain"
              draggable={false}
            />
            {isDrawing && (
              <motion.div
                className="absolute inset-0 rounded-full"
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(107,78,230,0.3)',
                    '0 0 60px rgba(107,78,230,0.6)',
                    '0 0 20px rgba(107,78,230,0.3)',
                  ],
                }}
                transition={{ duration: 0.5, repeat: Infinity }}
              />
            )}
          </div>
        </motion.div>

        {/* Draw Button / Result */}
        <AnimatePresence mode="wait">
          {!cardRevealed ? (
            <motion.div
              key="draw"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              <p className="text-moon-silver mb-6 font-sans-sc">
                点击下方，抽取你今日的指引之牌
              </p>
              <button
                onClick={handleDrawCard}
                disabled={isDrawing}
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-gold text-deep-night font-sans-sc font-semibold rounded-full hover:shadow-gold-glow-lg transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.97]"
              >
                <Wand2 className="w-5 h-5" />
                {isDrawing ? '星辰汇聚中...' : '抽取今日之牌'}
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="result"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="flex flex-col items-center gap-6"
            >
              {/* Card */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  duration: 0.8,
                  ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
                  delay: 0.2,
                }}
              >
                <TarotCard
                  card={dailyCard!}
                  isReversed={isReversed}
                  showFront={true}
                  width={160}
                  height={280}
                />
              </motion.div>

              {/* Card Info */}
              <motion.div
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <h3 className="font-serif-sc text-2xl font-bold text-star-gold mb-1">
                  {dailyCard?.name}
                </h3>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-sans-sc mb-3 ${
                    isReversed
                      ? 'bg-reversed-red/20 text-reversed-red'
                      : 'bg-upright-green/20 text-upright-green'
                  }`}
                >
                  {isReversed ? '逆位' : '正位'}
                </span>
                <p className="text-moon-silver text-sm max-w-md leading-relaxed mb-4">
                  {isReversed
                    ? dailyCard?.meaningReversed
                    : dailyCard?.meaningUpright}
                </p>
                <Link
                  to="/reading"
                  className="text-nebula-purple hover:text-star-gold-light transition-colors text-sm font-sans-sc inline-flex items-center gap-1"
                >
                  查看完整解读
                  <ChevronDown className="w-4 h-4 -rotate-90" />
                </Link>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

/* ────────────────────────────────
   Hero Section
   ──────────────────────────────── */

function HeroSection() {
  const brandChars = '星言塔罗'.split('');

  return (
    <section className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: 'url(/assets/hero-bg.png)' }}
      >
        <div className="absolute inset-0 bg-deep-night/40" />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-4">
        {/* Star icon */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            duration: 0.6,
            delay: 0.4,
            ease: [0.68, -0.55, 0.265, 1.55] as [number, number, number, number],
          }}
          className="mb-6"
        >
          <div className="w-20 h-20 md:w-24 md:h-24 flex items-center justify-center">
            <Sparkles className="w-16 h-16 md:w-20 md:h-20 text-star-gold" strokeWidth={1} />
          </div>
        </motion.div>

        {/* Brand name - character by character */}
        <motion.h1
          className="font-serif-sc text-[32px] md:text-[56px] font-bold text-star-gold mb-3 flex"
          initial="hidden"
          animate="visible"
        >
          {brandChars.map((char, i) => (
            <motion.span
              key={i}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: {
                    duration: 0.5,
                    delay: 0.6 + i * 0.08,
                    ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
                  },
                },
              }}
            >
              {char}
            </motion.span>
          ))}
        </motion.h1>

        {/* English name */}
        <motion.p
          className="font-cinzel text-xs md:text-sm text-moon-silver tracking-[0.3em] mb-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 1.2 }}
        >
          STARWHISPER TAROT
        </motion.p>

        {/* Subtitle */}
        <motion.p
          className="font-sans-sc text-sm md:text-base text-moon-silver mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 1.4 }}
        >
          让星辰为你低语，让塔罗指引前路
        </motion.p>

        {/* Decorative line */}
        <motion.div
          className="w-[120px] h-px bg-gradient-to-r from-transparent via-star-gold to-transparent mb-8"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.4, delay: 1.6 }}
        />

        {/* CTA Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row items-center gap-4 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.8 }}
        >
          <Link
            to="/reading"
            className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-gold text-deep-night font-sans-sc font-semibold rounded-full hover:shadow-gold-glow-lg hover:scale-[1.03] active:scale-[0.97] transition-all duration-200"
          >
            <Wand2 className="w-5 h-5" />
            开始占卜
          </Link>
          <Link
            to="/cards"
            className="inline-flex items-center gap-2 px-8 py-3 border border-star-gold text-star-gold font-sans-sc font-medium rounded-full hover:bg-star-gold/10 hover:border-star-gold-light hover:text-star-gold-light active:scale-[0.97] transition-all duration-200"
          >
            <BookOpen className="w-5 h-5" />
            浏览牌库
          </Link>
        </motion.div>

        {/* Tagline */}
        <motion.p
          className="text-dark-gold text-xs font-sans-sc tracking-wider"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 2.0 }}
        >
          78张塔罗牌 · AI深度解读 · 多种牌阵
        </motion.p>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2, duration: 0.5 }}
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        >
          <ChevronDown className="w-6 h-6 text-star-gold/60" />
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ────────────────────────────────
   Features Section
   ──────────────────────────────── */

function FeaturesSection() {
  return (
    <section className="relative py-16 md:py-24 bg-deep-night/80">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <motion.div
          className="text-center mb-12 md:mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="font-serif-sc text-2xl md:text-4xl font-bold text-star-white mb-4">
            塔罗的智慧，在此显现
          </h2>
          <p className="text-moon-silver font-sans-sc text-sm md:text-base max-w-2xl mx-auto">
            融合千年塔罗传统与现代AI洞察，为你揭示生命中的迷雾
          </p>
        </motion.div>

        {/* Feature Cards Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={staggerItem}
              className="group relative bg-deep-blue border border-star-gold/30 rounded-xl p-8 hover:border-star-gold/60 hover:-translate-y-1 hover:shadow-gold-glow transition-all duration-300"
            >
              {/* Icon */}
              <motion.div
                className="w-12 h-12 rounded-full bg-star-gold/10 flex items-center justify-center mb-5 group-hover:bg-star-gold/20 transition-colors"
                variants={goldGlowPulse}
                animate="animate"
              >
                <feature.icon className="w-6 h-6 text-star-gold" />
              </motion.div>

              {/* Title */}
              <h3 className="font-serif-sc text-lg md:text-xl font-semibold text-star-white mb-3">
                {feature.title}
              </h3>

              {/* Description */}
              <p className="text-moon-silver text-sm leading-relaxed font-sans-sc">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ────────────────────────────────
   CTA Footer Section
   ──────────────────────────────── */

function CTAFooterSection() {
  return (
    <section className="relative py-16 bg-deep-night border-t border-star-gold/30">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <motion.h2
          className="font-serif-sc text-2xl md:text-4xl font-bold text-star-white mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          准备好开启你的塔罗之旅了吗？
        </motion.h2>

        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Link
            to="/reading"
            className="inline-flex items-center gap-2 px-10 py-4 bg-gradient-gold text-deep-night font-sans-sc font-semibold rounded-full hover:shadow-gold-glow-lg hover:scale-[1.03] active:scale-[0.97] transition-all duration-200 text-base"
          >
            <Wand2 className="w-5 h-5" />
            开始占卜
          </Link>
          <Link
            to="/cards"
            className="inline-flex items-center gap-2 px-10 py-4 border border-star-gold text-star-gold font-sans-sc font-medium rounded-full hover:bg-star-gold/10 hover:border-star-gold-light hover:text-star-gold-light active:scale-[0.97] transition-all duration-200 text-base"
          >
            <BookOpen className="w-5 h-5" />
            了解牌库
          </Link>
        </motion.div>

        {/* Decorative stars */}
        <div className="mt-10 flex justify-center gap-2">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-star-gold"
              animate={{
                opacity: [0.3, 1, 0.3],
                scale: [0.8, 1.2, 0.8],
              }}
              transition={{
                duration: 2 + i * 0.5,
                repeat: Infinity,
                delay: i * 0.3,
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────
   Home Page
   ──────────────────────────────── */

export default function Home() {
  return (
    <Layout>
      <HeroSection />
      <FeaturesSection />
      <DailyCardSection />
      <CTAFooterSection />
    </Layout>
  );
}
