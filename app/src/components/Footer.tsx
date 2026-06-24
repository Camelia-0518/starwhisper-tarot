import { Link } from 'react-router';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

const quickLinks = [
  { path: '/', label: '首页' },
  { path: '/reading', label: '开始占卜' },
  { path: '/cards', label: '牌库浏览' },
  { path: '/history', label: '历史记录' },
];

export default function Footer() {
  return (
    <motion.footer
      className="relative border-t border-star-gold/30 bg-deep-night"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {/* Brand */}
          <div className="flex flex-col gap-3">
            <Link to="/" className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-star-gold" />
              <span className="font-serif-sc text-lg font-bold text-star-gold tracking-wider">
                星言塔罗
              </span>
            </Link>
            <p className="text-moon-silver text-sm leading-relaxed max-w-xs">
              融合千年塔罗智慧与现代AI洞察，为你指引生命的方向。每一次抽牌，都是与宇宙对话的神圣时刻。
            </p>
          </div>

          {/* Quick Links */}
          <div className="flex flex-col gap-3">
            <h3 className="font-serif-sc text-star-gold text-base font-semibold">
              快速链接
            </h3>
            <div className="flex flex-col gap-2">
              {quickLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className="text-moon-silver text-sm hover:text-star-gold transition-colors w-fit"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Disclaimer */}
          <div className="flex flex-col gap-3">
            <h3 className="font-serif-sc text-star-gold text-base font-semibold">
              免责声明
            </h3>
            <p className="text-moon-silver/70 text-xs leading-relaxed">
              塔罗牌占卜仅供娱乐与自我探索参考，不能替代专业心理咨询或医疗建议。请理性看待占卜结果，重大决策请咨询专业人士。
            </p>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-10 pt-6 border-t border-star-gold/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-dark-gold text-xs">
            &copy; 2025 星言塔罗 StarWhisper Tarot. 保留所有权利。
          </p>
          <div className="flex items-center gap-1 text-dark-gold text-xs">
            <Sparkles className="w-3 h-3" />
            <span>让星辰为你低语</span>
          </div>
        </div>
      </div>
    </motion.footer>
  );
}
