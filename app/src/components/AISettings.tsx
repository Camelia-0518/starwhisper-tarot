import { Sparkles, Shield, Server, Zap } from 'lucide-react';

interface AISettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * AI 设置页 — 已改为状态展示页
 *
 * 不再允许用户配置多 Provider / 手填 API Key。
 * 统一由服务端托管 DeepSeek，前端仅展示接入状态。
 */
export default function AISettings({ isOpen, onClose }: AISettingsProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-deep-night/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md mx-4 bg-deep-blue border border-star-gold/30 rounded-2xl p-6 shadow-gold-glow">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif-sc text-xl font-bold text-star-gold flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            智能解牌
          </h2>
          <button
            onClick={onClose}
            className="text-moon-silver hover:text-star-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Status Card */}
        <div className="bg-star-gold/10 border border-star-gold/20 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-upright-green/20 flex items-center justify-center">
              <Zap className="w-5 h-5 text-upright-green" />
            </div>
            <div>
              <p className="font-sans-sc font-medium text-star-white">DeepSeek 已接入</p>
              <p className="text-xs text-moon-silver">服务端统一托管，安全高效</p>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-moon-silver">
              <Server className="w-4 h-4" />
              <span>模型：deepseek-chat</span>
            </div>
            <div className="flex items-center gap-2 text-moon-silver">
              <Shield className="w-4 h-4" />
              <span>API Key 由服务端保管，前端不可见</span>
            </div>
          </div>
        </div>

        {/* Info */}
        <p className="text-xs text-moon-silver leading-relaxed">
          星言塔罗采用 DeepSeek 大模型进行塔罗牌深度解读。所有解牌请求通过服务端中转，
          确保您的占卜数据安全，同时获得稳定、高质量的 AI 解读体验。
        </p>

        {/* Close button */}
        <button
          onClick={onClose}
          className="mt-4 w-full py-2.5 bg-gradient-gold text-deep-night font-sans-sc font-medium rounded-full hover:shadow-gold-glow transition-all"
        >
          知道了
        </button>
      </div>
    </div>
  );
}
