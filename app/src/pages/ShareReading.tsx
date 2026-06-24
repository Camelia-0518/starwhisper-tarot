import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router';
import { motion } from 'framer-motion';
import { Sparkles, ArrowLeft, Lock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { SavedReading } from '@/store/readingStore';

/**
 * 星言塔罗 — 公开解牌页
 *
 * 路由: /share/:slug
 * 无需登录即可访问公开的占卜记录
 */

interface PublicReading {
  id: string;
  spreadName: string;
  question: string;
  cards: SavedReading['cards'];
  aiReading: SavedReading['aiReading'];
  createdAt: string;
}

export default function ShareReading() {
  const { slug } = useParams<{ slug: string }>();
  const [reading, setReading] = useState<PublicReading | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!slug) return;

    const loadPublicReading = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('readings')
          .select('id, spread_name, question, cards, ai_overall_reading, ai_card_readings, created_at')
          .eq('share_slug', slug)
          .eq('is_public', true)
          .single();

        if (error || !data) {
          setError('这张解牌尚未公开或链接已失效');
          return;
        }

        setReading({
          id: data.id,
          spreadName: data.spread_name,
          question: data.question || '',
          cards: data.cards as SavedReading['cards'],
          aiReading: {
            overallReading: data.ai_overall_reading || '',
            cardReadings: (data.ai_card_readings as SavedReading['aiReading']['cardReadings']) || [],
          },
          createdAt: data.created_at,
        });
      } catch {
        setError('加载失败，请稍后重试');
      } finally {
        setIsLoading(false);
      }
    };

    loadPublicReading();
  }, [slug]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-deep-night flex items-center justify-center">
        <Sparkles className="w-10 h-10 text-star-gold animate-pulse" />
      </div>
    );
  }

  if (error || !reading) {
    return (
      <div className="min-h-screen bg-deep-night flex flex-col items-center justify-center text-moon-silver">
        <Lock className="w-12 h-12 mb-4 opacity-40" />
        <p className="font-serif-sc text-lg mb-2">{error || '解牌不存在'}</p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-star-gold hover:text-star-gold-light transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          返回首页
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-deep-night">
      {/* Background */}
      <div
        className="fixed inset-0 bg-cover bg-center opacity-30"
        style={{ backgroundImage: 'url(/assets/altar-bg.png)' }}
      />
      <div className="fixed inset-0 bg-deep-night/70" />

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-star-gold" />
            <span className="font-serif-sc text-xl text-star-gold font-bold">星言塔罗</span>
            <Sparkles className="w-5 h-5 text-star-gold" />
          </div>
          <div className="w-32 h-px bg-gradient-to-r from-transparent via-star-gold to-transparent mx-auto mb-6" />

          <h1 className="font-serif-sc text-2xl md:text-3xl text-star-white font-bold mb-2">
            {reading.spreadName}
          </h1>
          {reading.question && (
            <p className="text-moon-silver text-sm italic">「{reading.question}」</p>
          )}
          <p className="text-dark-gold text-xs mt-3">
            {new Date(reading.createdAt).toLocaleDateString('zh-CN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-10">
          {reading.cards.map((dc, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-deep-blue border border-star-gold/20 rounded-xl p-4"
            >
              <div className="text-center mb-2">
                <span className="text-xs text-star-gold font-medium">{dc.position.name}</span>
              </div>
              <div
                className={`aspect-[2/3.5] rounded-lg border-2 overflow-hidden mb-3 ${
                  dc.isReversed ? 'border-reversed-red/50' : 'border-star-gold/50'
                }`}
              >
                <img
                  src={dc.card.image}
                  alt={dc.card.name}
                  className={`w-full h-full object-cover ${dc.isReversed ? 'rotate-180' : ''}`}
                />
              </div>
              <div className="text-center">
                <p className="font-serif-sc text-sm text-star-white">{dc.card.name}</p>
                <span
                  className={`inline-block px-2 py-0.5 rounded-full text-[10px] mt-1 ${
                    dc.isReversed
                      ? 'bg-reversed-red/20 text-reversed-red'
                      : 'bg-upright-green/20 text-upright-green'
                  }`}
                >
                  {dc.isReversed ? '逆位' : '正位'}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Overall Reading */}
        <div className="bg-deep-blue border border-star-gold/20 rounded-xl p-6 mb-8">
          <h2 className="font-serif-sc text-lg text-star-gold font-bold mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            整体解读
          </h2>
          <p className="text-moon-silver text-sm leading-relaxed whitespace-pre-wrap">
            {reading.aiReading.overallReading}
          </p>
        </div>

        {/* Card Readings */}
        {reading.aiReading.cardReadings.length > 0 && (
          <div className="space-y-4 mb-10">
            <h2 className="font-serif-sc text-lg text-star-gold font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              逐牌解读
            </h2>
            {reading.aiReading.cardReadings.map((cr) => {
              const card = reading.cards[cr.position];
              return (
                <motion.div
                  key={cr.position}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: cr.position * 0.1 }}
                  className="bg-deep-blue border border-star-gold/10 rounded-xl p-5"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-star-gold font-serif-sc font-bold">
                      {card?.position.name}
                    </span>
                    <span className="text-moon-silver">·</span>
                    <span className="text-star-white font-serif-sc">{card?.card.name}</span>
                    <div className="flex gap-1">
                      {cr.keywords.map((k) => (
                        <span
                          key={k}
                          className="px-2 py-0.5 bg-star-gold/10 text-star-gold rounded text-[10px]"
                        >
                          {k}
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="text-moon-silver text-sm leading-relaxed mb-3">{cr.interpretation}</p>
                  <div className="bg-deep-night/50 rounded-lg p-3 border-l-2 border-star-gold">
                    <p className="text-dark-gold text-xs font-medium mb-1">建议</p>
                    <p className="text-moon-silver text-sm leading-relaxed">{cr.advice}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Footer CTA */}
        <div className="text-center">
          <div className="w-32 h-px bg-gradient-to-r from-transparent via-star-gold to-transparent mx-auto mb-6" />
          <p className="text-moon-silver text-sm mb-4">想获得属于你自己的塔罗指引？</p>
          <Link
            to="/reading"
            className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-gold text-deep-night font-sans-sc font-semibold rounded-full hover:shadow-gold-glow transition-all"
          >
            <Sparkles className="w-5 h-5" />
            开始占卜
          </Link>
        </div>
      </div>
    </div>
  );
}
