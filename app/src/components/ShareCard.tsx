import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Download, Sparkles } from 'lucide-react';
import type { SavedReading } from '@/store/readingStore';

/**
 * 星言塔罗 — 分享海报组件
 *
 * 功能：
 * 1. 将单次占卜结果渲染为精美海报
 * 2. 支持下载为图片（html2canvas 方案）
 * 3. 暗色主题，与产品视觉统一
 *
 * 使用方式：
 * <ShareCard reading={savedReading} onClose={() => {}} />
 */

interface ShareCardProps {
  reading: SavedReading;
  onClose: () => void;
}

export default function ShareCard({ reading, onClose }: ShareCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setIsGenerating(true);

    try {
      // 动态导入 html2canvas（减小初始包体积）
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: '#0A0A1A',
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const link = document.createElement('a');
      link.download = `星言塔罗-${reading.spreadName}-${new Date(reading.createdAt).toLocaleDateString('zh-CN')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('海报生成失败:', err);
      alert('海报生成失败，请重试');
    } finally {
      setIsGenerating(false);
    }
  };

  const majorCount = reading.cards.filter((c) => c.card.arcana === 'major').length;
  const reversedCount = reading.cards.filter((c) => c.isReversed).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-deep-night/90 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-lg"
      >
        {/* 海报主体 */}
        <div
          ref={cardRef}
          className="bg-gradient-to-b from-deep-blue to-deep-night border border-star-gold/30 rounded-2xl p-8"
        >
          {/* 品牌头 */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-star-gold" />
              <span className="font-serif-sc text-lg text-star-gold font-bold">星言塔罗</span>
              <Sparkles className="w-5 h-5 text-star-gold" />
            </div>
            <div className="w-24 h-px bg-gradient-to-r from-transparent via-star-gold to-transparent mx-auto" />
          </div>

          {/* 牌阵信息 */}
          <div className="text-center mb-6">
            <h2 className="font-serif-sc text-2xl text-star-white font-bold mb-1">
              {reading.spreadName}
            </h2>
            {reading.question && (
              <p className="text-moon-silver text-sm italic">「{reading.question}」</p>
            )}
            <p className="text-dark-gold text-xs mt-2">
              {new Date(reading.createdAt).toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>

          {/* 牌面缩略 */}
          <div className="flex justify-center gap-3 mb-6">
            {reading.cards.map((dc, idx) => (
              <div key={idx} className="text-center">
                <div
                  className={`w-16 h-28 rounded-lg border-2 overflow-hidden ${
                    dc.isReversed ? 'border-reversed-red/50' : 'border-star-gold/50'
                  }`}
                >
                  <img
                    src={dc.card.image}
                    alt={dc.card.name}
                    className={`w-full h-full object-cover ${dc.isReversed ? 'rotate-180' : ''}`}
                  />
                </div>
                <p className="text-[10px] text-moon-silver mt-1 truncate w-16">{dc.position.name}</p>
              </div>
            ))}
          </div>

          {/* 统计 */}
          <div className="flex justify-center gap-6 mb-6 text-xs">
            <span className="text-moon-silver">
              大阿尔卡纳 <span className="text-star-gold">{majorCount}</span> 张
            </span>
            <span className="text-moon-silver">
              逆位 <span className="text-reversed-red">{reversedCount}</span> 张
            </span>
          </div>

          {/* AI 解读摘要 */}
          <div className="bg-deep-night/60 rounded-xl p-4 border border-star-gold/10">
            <p className="text-moon-silver text-sm leading-relaxed line-clamp-6">
              {reading.aiReading.overallReading}
            </p>
          </div>

          {/* 底部 */}
          <div className="text-center mt-6">
            <p className="text-dark-gold text-xs">让星辰为你低语，让塔罗指引前路</p>
            <p className="text-moon-silver/40 text-[10px] mt-1">starwhisper-tarot.com</p>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex items-center justify-center gap-3 mt-4">
          <button
            onClick={onClose}
            className="px-5 py-2 text-moon-silver hover:text-star-white text-sm font-sans-sc transition-colors"
          >
            关闭
          </button>
          <button
            onClick={handleDownload}
            disabled={isGenerating}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-gold text-deep-night font-sans-sc font-medium rounded-full hover:shadow-gold-glow disabled:opacity-60 transition-all"
          >
            {isGenerating ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin" />
                生成中...
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                保存海报
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
