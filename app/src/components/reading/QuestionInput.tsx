import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, MessageCircle, Heart, Briefcase, Users, Compass } from 'lucide-react';
import { useReadingStore } from '@/store/readingStore';

/**
 * 星言塔罗 — 提问输入（优化版）
 *
 * 优化点：
 * 1. 增加问题引导模板，降低用户"不知道问什么"的门槛
 * 2. 模糊问题检测 + 提示，引导用户问具体
 * 3. 分类引导（感情/事业/人际/自我），帮助用户聚焦
 */

const QUESTION_CATEGORIES = [
  {
    icon: Heart,
    label: '感情',
    color: 'text-reversed-red',
    bg: 'bg-reversed-red/10 border-reversed-red/20',
    examples: [
      '我和TA最近的关系走向如何？',
      '这段感情中我最需要注意什么？',
      '我应该主动推进还是再等等？',
    ],
  },
  {
    icon: Briefcase,
    label: '事业',
    color: 'text-star-gold',
    bg: 'bg-star-gold/10 border-star-gold/20',
    examples: [
      '这份工作值得我继续投入吗？',
      '我目前的事业瓶颈该怎么突破？',
      '接下来三个月我的工作运势如何？',
    ],
  },
  {
    icon: Users,
    label: '人际',
    color: 'text-nebula-purple',
    bg: 'bg-nebula-purple/10 border-nebula-purple/20',
    examples: [
      '我和某个朋友的关系为什么会变冷淡？',
      '这段人际关系中我该怎么调整自己？',
      '新环境里我该如何建立信任？',
    ],
  },
  {
    icon: Compass,
    label: '自我',
    color: 'text-spirit-blue',
    bg: 'bg-spirit-blue/10 border-spirit-blue/20',
    examples: [
      '我最近为什么总是感到焦虑？',
      '我当下最需要关注自己的哪个方面？',
      '我该如何走出目前的情绪低谷？',
    ],
  },
];

// 模糊问题关键词检测
const VAGUE_PATTERNS = [
  /运势/i, /运气/i, /怎么样/i, /好不好/i, /行吗/i, /可以吗/i,
  /未来/i, /明天/i, /最近/i, /将来/i,
];

function isVagueQuestion(question: string): boolean {
  if (!question || question.length < 8) return true;
  const vagueCount = VAGUE_PATTERNS.filter((p) => p.test(question)).length;
  return vagueCount >= 2 || question.length < 15;
}

function getVagueHint(question: string): string {
  if (!question || question.length < 8) {
    return '问题太短了，试着描述一下你具体想解决什么困扰';
  }
  if (/运势|运气/.test(question)) {
    return '「运势」比较宽泛，可以具体到某个方面，比如「感情中我接下来该怎么做」或「这份工作值得继续吗」';
  }
  if (/怎么样|好不好|行吗/.test(question)) {
    return '试着把问题改成「我应该…」或「我需要注意…」，这样解读会更精准';
  }
  if (/未来|将来/.test(question) && !/具体|三个月|半年/.test(question)) {
    return '可以限定一个时间范围，比如「接下来三个月」或「今年内」，解读会更有针对性';
  }
  return '试着把问题说得更具体一些，比如加入具体的人、事、时间，解读会更精准';
}

export default function QuestionInput() {
  const { question, setQuestion } = useReadingStore();
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [showVagueHint, setShowVagueHint] = useState(false);

  const handleQuestionChange = (value: string) => {
    setQuestion(value);
    if (value.length > 5) {
      setShowVagueHint(isVagueQuestion(value));
    } else {
      setShowVagueHint(false);
    }
  };

  const selectExample = (example: string) => {
    setQuestion(example);
    setShowVagueHint(false);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-8">
      <motion.div
        className="w-full max-w-xl"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-star-gold/10 mb-4"
            animate={{ boxShadow: ['0 0 20px rgba(201,168,76,0.1)', '0 0 40px rgba(201,168,76,0.3)', '0 0 20px rgba(201,168,76,0.1)'] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <MessageCircle className="w-7 h-7 text-star-gold" />
          </motion.div>
          <h2 className="font-serif-sc text-2xl md:text-3xl font-bold text-star-gold mb-2">
            向星辰倾诉你的困惑
          </h2>
          <p className="text-moon-silver text-sm">
            越具体的问题，越能得到精准的指引
          </p>
        </div>

        {/* Category Selector */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {QUESTION_CATEGORIES.map((cat, i) => (
            <button
              key={cat.label}
              onClick={() => setSelectedCategory(selectedCategory === i ? null : i)}
              className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${
                selectedCategory === i
                  ? `${cat.bg} border-current`
                  : 'bg-deep-blue border-star-gold/10 hover:border-star-gold/30'
              }`}
            >
              <cat.icon className={`w-5 h-5 ${cat.color}`} />
              <span className={`text-sm font-sans-sc ${selectedCategory === i ? cat.color : 'text-moon-silver'}`}>
                {cat.label}
              </span>
            </button>
          ))}
        </div>

        {/* Example Questions */}
        <AnimatePresence>
          {selectedCategory !== null && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 space-y-2"
            >
              <p className="text-xs text-moon-silver/60 mb-2 font-sans-sc">参考提问：</p>
              {QUESTION_CATEGORIES[selectedCategory].examples.map((ex) => (
                <button
                  key={ex}
                  onClick={() => selectExample(ex)}
                  className="block w-full text-left px-4 py-2.5 bg-deep-night border border-star-gold/10 rounded-lg text-sm text-moon-silver hover:text-star-gold hover:border-star-gold/30 transition-all"
                >
                  {ex}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Question Input */}
        <div className="relative mb-4">
          <textarea
            value={question}
            onChange={(e) => handleQuestionChange(e.target.value)}
            placeholder="例如：我和TA最近的关系走向如何？我应该主动推进还是再等等？"
            rows={4}
            className="w-full bg-deep-night border border-star-gold/20 rounded-xl px-4 py-4 text-star-white placeholder-moon-silver/30 text-sm leading-relaxed focus:border-star-gold/50 focus:outline-none transition-colors resize-none"
          />
          <div className="absolute bottom-3 right-3 text-[10px] text-moon-silver/40">
            {question.length}/200
          </div>
        </div>

        {/* Vague Hint */}
        {showVagueHint && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-2 bg-reversed-red/10 border border-reversed-red/20 rounded-lg p-3 mb-4"
          >
            <AlertCircle className="w-4 h-4 text-reversed-red flex-shrink-0 mt-0.5" />
            <p className="text-xs text-reversed-red/80 leading-relaxed">
              {getVagueHint(question)}
            </p>
          </motion.div>
        )}

        {/* Tips */}
        <div className="flex flex-wrap gap-2 mb-6">
          {['包含具体的人或事', '限定时间范围', '用"我应该"开头', '描述当前困扰'].map((tip) => (
            <span
              key={tip}
              className="px-3 py-1 bg-dark-gold/10 text-dark-gold rounded-full text-xs font-sans-sc"
            >
              {tip}
            </span>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
