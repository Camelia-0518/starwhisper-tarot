import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Save, RotateCcw, Share2, Check, Loader2, Bot, BookOpen, Image, MessageCircle, Send } from 'lucide-react';
import { useReadingStore } from '@/store/readingStore';
import { getAIConfig, isAIConfigured } from '@/services/aiService';
import { supabase } from '@/lib/supabase';
import ShareCard from '@/components/ShareCard';
import type { SavedReading } from '@/store/readingStore';

const slowEase = [0.16, 1, 0.3, 1] as [number, number, number, number];

interface TypingTextProps {
  text: string;
  speed?: number;
  onComplete?: () => void;
  className?: string;
}

function TypingText({ text, speed = 20, onComplete, className = '' }: TypingTextProps) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  const indexRef = useRef(0);

  useEffect(() => {
    setDisplayed('');
    setDone(false);
    indexRef.current = 0;

    const interval = setInterval(() => {
      indexRef.current += 1;
      if (indexRef.current <= text.length) {
        setDisplayed(text.slice(0, indexRef.current));
      } else {
        clearInterval(interval);
        setDone(true);
        onComplete?.();
      }
    }, speed);

    return () => clearInterval(interval);
  }, [text, speed, onComplete]);

  return (
    <span className={className}>
      {displayed}
      {!done && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ repeat: Infinity, duration: 0.5 }}
          className="inline-block w-0.5 h-[1em] bg-star-gold ml-0.5 align-middle"
        />
      )}
    </span>
  );
}

/* ─────────────── 对话/倾诉模式 ─────────────── */

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

function ChatMode({
  initialContext,
  onClose,
}: {
  initialContext: string;
  onClose: () => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content:
        '牌阵已经给出了方向。如果你还想聊聊，我在这里倾听。你可以说说你现在的感受，或者问任何想问的。',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = { role: 'user', content: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('tarot-reading', {
        body: {
          mode: 'chat',
          context: initialContext,
          messages: [...messages, userMsg].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        },
      });

      if (error) throw error;

      const reply = data?.data?.reply || '星光仍在沉淀，让我们稍等片刻再聊。';
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch (err) {
      console.error('Chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: '抱歉，此刻的连接有些微弱。你可以稍后再试，或者继续说说你的想法。',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-deep-blue border border-star-gold/20 rounded-xl overflow-hidden mt-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-star-gold/10">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-star-gold" />
          <span className="font-serif-sc text-sm text-star-gold">继续对话</span>
        </div>
        <button onClick={onClose} className="text-moon-silver hover:text-star-white text-xs">
          收起
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="h-64 overflow-y-auto px-4 py-3 space-y-3">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-xl px-3 py-2 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-star-gold/15 text-star-white'
                  : 'bg-deep-night/60 text-moon-silver border border-star-gold/10'
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-deep-night/60 rounded-xl px-3 py-2 border border-star-gold/10">
              <Sparkles className="w-4 h-4 text-star-gold animate-pulse" />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 px-4 py-3 border-t border-star-gold/10">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.stopPropagation();
              sendMessage();
            }
          }}
          placeholder="说说你的感受，或问任何想问的..."
          className="flex-1 bg-deep-night border border-star-gold/20 rounded-lg px-3 py-2 text-sm text-star-white placeholder-moon-silver/40 focus:border-star-gold/50 focus:outline-none"
        />
        <button
          onClick={sendMessage}
          disabled={isLoading || !input.trim()}
          className="p-2 bg-gradient-gold text-deep-night rounded-lg hover:shadow-gold-glow disabled:opacity-40 transition-all"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
}

export default function AIInterpretation() {
  const {
    drawnCards,
    aiReading,
    isLoadingAI,
    showInterpretation,
    question,
    saveReading,
    resetReading,
  } = useReadingStore();

  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showConfirmRestart, setShowConfirmRestart] = useState(false);
  const [typingComplete, setTypingComplete] = useState(false);
  const [showShareCard, setShowShareCard] = useState(false);
  const [savedReading, setSavedReading] = useState<SavedReading | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [expandedCard, setExpandedCard] = useState<number | null>(null);

  const aiEnabled = isAIConfigured();
  const aiConfig = getAIConfig();

  const handleSave = useCallback(() => {
    const reading = saveReading();
    if (reading) {
      setSavedReading(reading);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  }, [saveReading]);

  const handleShare = useCallback(() => {
    if (!aiReading) return;

    const text =
      `${aiReading.overallReading}\n\n` +
      aiReading.cardReadings
        .map((cr, i) => {
          const card = drawnCards[i];
          return `${card?.position.name}: ${card?.card.name}${
            card?.isReversed ? '（逆位）' : '（正位）'
          }\n${cr.interpretation}`;
        })
        .join('\n\n');

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    });
  }, [aiReading, drawnCards]);

  const handleRestart = useCallback(() => {
    setShowConfirmRestart(true);
  }, []);

  if (isLoadingAI) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center px-4">
        <motion.div
          className="relative w-24 h-24 mb-8"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-b from-nebula-purple/30 to-transparent" />
          <motion.div
            className="absolute inset-2 rounded-full bg-gradient-to-b from-spirit-blue/20 to-deep-night/80 border border-star-gold/20"
            animate={{ rotate: 360 }}
            transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-star-gold" />
          </motion.div>
          <motion.div
            className="absolute inset-4 rounded-full flex items-center justify-center"
            animate={{
              boxShadow: [
                '0 0 10px rgba(201,168,76,0.2)',
                '0 0 30px rgba(201,168,76,0.4)',
                '0 0 10px rgba(201,168,76,0.2)',
              ],
            }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Sparkles className="w-8 h-8 text-star-gold/60" />
          </motion.div>
        </motion.div>

        <motion.h3
          className="font-serif-sc text-xl md:text-2xl text-star-gold mb-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          星轨正在解读你的牌阵...
        </motion.h3>
        <motion.div
          className="flex items-center gap-1 text-moon-silver/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">
            {aiEnabled
              ? `${aiConfig.providerName} ${aiConfig.model} 正在深度分析牌面...`
              : `正在使用内置解牌模式，等待接入 ${aiConfig.providerName} ${aiConfig.model}...`}
          </span>
        </motion.div>
      </div>
    );
  }

  if (!showInterpretation || !aiReading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center px-4">
        <p className="text-moon-silver/60">正在准备解读...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      {/* Card thumbnails */}
      <motion.div
        className="mb-8 flex justify-center gap-2 flex-wrap"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {drawnCards.map((dc, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className="flex flex-col items-center"
          >
            <div className="w-[60px] h-[105px] rounded overflow-hidden border border-star-gold/30 bg-deep-blue flex items-center justify-center">
              <span className="text-[8px] text-star-gold/60 text-center px-1">{dc.card.name}</span>
            </div>
            <span className="text-[8px] text-moon-silver/50 mt-1 whitespace-nowrap">
              {dc.position.name}
            </span>
            <span
              className={`text-[7px] ${dc.isReversed ? 'text-reversed-red' : 'text-upright-green'}`}
            >
              {dc.isReversed ? '逆' : '正'}
            </span>
          </motion.div>
        ))}
      </motion.div>

      {/* Title */}
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <h2 className="font-serif-sc text-2xl md:text-3xl font-bold text-star-gold">
            星轨为你揭示...
          </h2>
          <span
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border ${
              aiEnabled
                ? 'border-upright-green/40 text-upright-green bg-upright-green/10'
                : 'border-star-gold/30 text-star-gold bg-star-gold/5'
            }`}
          >
            <Bot className="w-3 h-3" />
            {aiEnabled ? 'DeepSeek 已接入' : '当前为内置解牌'}
          </span>
        </div>
        {question && <p className="text-moon-silver/70 text-sm mb-3">关于「{question}」</p>}
        <div className="w-24 h-px bg-star-gold/30 mx-auto" />
      </motion.div>

      {/* ── 核心结论（先给答案）── */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h3 className="font-serif-sc text-lg text-star-gold mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          核心指引
        </h3>
        <div className="bg-deep-blue border border-star-gold/20 rounded-lg p-5">
          {!typingComplete ? (
            <p className="text-star-white leading-relaxed text-sm md:text-base">
              <TypingText
                text={aiReading.overallReading}
                speed={25}
                onComplete={() => setTypingComplete(true)}
              />
            </p>
          ) : (
            <motion.p
              className="text-star-white leading-relaxed text-sm md:text-base"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {aiReading.overallReading}
            </motion.p>
          )}
        </div>
      </motion.div>

      {/* ── 逐牌展开（可折叠）── */}
      {typingComplete && (
        <motion.div
          className="space-y-3 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="font-serif-sc text-lg text-star-gold mb-3 flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            逐牌详解
          </h3>
          {aiReading.cardReadings.map((cardReading, index) => {
            const drawnCard = drawnCards[index];
            if (!drawnCard) return null;
            const isExpanded = expandedCard === index;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.15, duration: 0.5, ease: slowEase }}
                className="bg-deep-blue border border-star-gold/20 rounded-lg overflow-hidden"
              >
                {/* 折叠头 */}
                <button
                  onClick={() => setExpandedCard(isExpanded ? null : index)}
                  className="w-full flex items-center gap-4 p-4 text-left hover:bg-star-gold/5 transition-colors"
                >
                  <div className="w-12 h-20 rounded overflow-hidden border border-star-gold/30 flex-shrink-0">
                    <img
                      src={drawnCard.card.image}
                      alt={drawnCard.card.name}
                      className={`w-full h-full object-cover ${drawnCard.isReversed ? 'rotate-180' : ''}`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-dark-gold text-xs">{drawnCard.position.name}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] ${
                          drawnCard.isReversed
                            ? 'bg-reversed-red/20 text-reversed-red'
                            : 'bg-upright-green/20 text-upright-green'
                        }`}
                      >
                        {drawnCard.isReversed ? '逆位' : '正位'}
                      </span>
                    </div>
                    <h4 className="font-serif-sc text-base text-star-gold">
                      {drawnCard.card.name}
                    </h4>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {cardReading.keywords.map((kw, ki) => (
                        <span
                          key={ki}
                          className="px-2 py-0.5 rounded-full bg-star-gold/10 text-star-gold text-[10px] border border-star-gold/20"
                        >
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                  <span className="text-moon-silver/40 text-xs">
                    {isExpanded ? '收起' : '展开'}
                  </span>
                </button>

                {/* 展开内容 */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 pb-4 space-y-3">
                        <p className="text-star-white/90 text-sm leading-relaxed">
                          {cardReading.interpretation}
                        </p>
                        <div className="bg-indigo-main/50 rounded-md p-3 border border-star-gold/10">
                          <p className="text-spirit-blue text-xs mb-1 font-medium">建议</p>
                          <p className="text-moon-silver text-sm leading-relaxed">{cardReading.advice}</p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* ── 操作按钮 ── */}
      {typingComplete && (
        <motion.div
          className="flex flex-wrap items-center justify-center gap-3 mt-8 pb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-gold text-deep-night font-sans-sc font-medium text-sm hover:shadow-gold-glow transition-shadow"
          >
            {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saved ? '已保存' : '保存记录'}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => savedReading && setShowShareCard(true)}
            disabled={!savedReading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-star-gold text-star-gold hover:bg-star-gold/10 transition-colors text-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Image className="w-4 h-4" />
            生成海报
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowChat(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-nebula-purple/50 text-nebula-purple hover:bg-nebula-purple/10 transition-colors text-sm"
          >
            <MessageCircle className="w-4 h-4" />
            继续聊聊
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleShare}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-star-gold/50 text-moon-silver hover:text-star-gold hover:border-star-gold transition-colors text-sm"
          >
            {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
            {copied ? '已复制' : '复制文本'}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleRestart}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-moon-silver/60 hover:text-moon-silver text-sm transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            重新占卜
          </motion.button>
        </motion.div>
      )}

      {/* ── 对话模式 ── */}
      <AnimatePresence>
        {showChat && (
          <ChatMode
            initialContext={
              `牌阵：${question || '整体运势'}\n整体解读：${aiReading.overallReading}`
            }
            onClose={() => setShowChat(false)}
          />
        )}
      </AnimatePresence>

      {/* Share Card Modal */}
      {showShareCard && savedReading && (
        <ShareCard reading={savedReading} onClose={() => setShowShareCard(false)} />
      )}

      {/* Restart Confirm */}
      <AnimatePresence>
        {showConfirmRestart && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(10,10,26,0.85)] backdrop-blur-sm"
            onClick={() => setShowConfirmRestart(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-deep-blue border border-star-gold/30 rounded-xl p-6 max-w-sm mx-4"
            >
              <h3 className="font-serif-sc text-lg text-star-gold mb-3">确认重新开始</h3>
              <p className="text-moon-silver text-sm mb-6">
                当前占卜进度会被清空，是否开始新的解牌？
              </p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowConfirmRestart(false)}
                  className="px-4 py-2 rounded-full text-moon-silver hover:text-star-gold text-sm transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={() => {
                    setShowConfirmRestart(false);
                    resetReading();
                  }}
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
