import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { Link } from 'react-router';

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
      {/* Animated icon */}
      <motion.div
        className="relative mb-8"
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* Dashed circle */}
        <div className="w-32 h-32 rounded-full border-2 border-dashed border-dark-gold/40 flex items-center justify-center">
          <Sparkles className="w-12 h-12 text-dark-gold/60" />
        </div>
        {/* Orbiting dot */}
        <motion.div
          className="absolute inset-0"
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
        >
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 w-2 h-2 rounded-full bg-star-gold/60" />
        </motion.div>
      </motion.div>

      {/* Text */}
      <motion.h2
        className="font-serif-sc text-2xl md:text-3xl font-semibold text-moon-silver mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        暂无占卜记录
      </motion.h2>
      <motion.p
        className="text-moon-silver/60 text-base text-center max-w-md mb-8 leading-relaxed"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        每一次抽牌都是灵魂的对话，开始你的第一次占卜吧
      </motion.p>

      {/* CTA Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Link
          to="/reading"
          className="inline-flex items-center gap-2 px-8 py-3 rounded-full bg-gradient-to-r from-star-gold to-star-gold-light text-deep-night font-sans-sc font-medium text-base transition-all duration-200 hover:shadow-gold-lg hover:scale-[1.03] active:scale-[0.97]"
        >
          <span>开始占卜</span>
          <span>→</span>
        </Link>
      </motion.div>
    </div>
  );
}
