import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Mail, Lock, Sparkles, Loader2, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        setMessage('登录成功');
        onSuccess?.();
        setTimeout(onClose, 800);
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              display_name: '塔罗行者',
            },
          },
        });
        if (error) throw error;
        setMessage('注册成功，请查收验证邮件');
        setTimeout(onClose, 2000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '操作失败');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-deep-night/80 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="relative w-full max-w-md bg-deep-blue border border-star-gold/30 rounded-2xl p-6 shadow-gold-glow"
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-moon-silver hover:text-star-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-star-gold/10 mb-3">
            <Sparkles className="w-6 h-6 text-star-gold" />
          </div>
          <h2 className="font-serif-sc text-xl font-bold text-star-gold">
            {mode === 'login' ? '欢迎回来' : '开启塔罗之旅'}
          </h2>
          <p className="text-moon-silver text-sm mt-1">
            {mode === 'login' ? '登录以同步你的占卜记录' : '注册后云端保存所有记录'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs text-moon-silver/60 mb-1.5 font-sans-sc">邮箱</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-moon-silver/40" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full bg-deep-night border border-star-gold/20 rounded-lg pl-10 pr-4 py-2.5 text-sm text-star-white placeholder-moon-silver/30 focus:border-star-gold/50 focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-moon-silver/60 mb-1.5 font-sans-sc">密码</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-moon-silver/40" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="至少6位"
                required
                minLength={6}
                className="w-full bg-deep-night border border-star-gold/20 rounded-lg pl-10 pr-10 py-2.5 text-sm text-star-white placeholder-moon-silver/30 focus:border-star-gold/50 focus:outline-none transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-moon-silver/40 hover:text-moon-silver"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Error / Message */}
          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-reversed-red text-xs bg-reversed-red/10 rounded-lg p-2"
              >
                {error}
              </motion.p>
            )}
            {message && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-upright-green text-xs bg-upright-green/10 rounded-lg p-2"
              >
                {message}
              </motion.p>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 bg-gradient-gold text-deep-night font-sans-sc font-medium rounded-full hover:shadow-gold-glow disabled:opacity-60 transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {mode === 'login' ? '登录' : '注册'}
          </button>
        </form>

        {/* Toggle */}
        <p className="text-center text-sm text-moon-silver mt-4">
          {mode === 'login' ? (
            <>
              还没有账号？{' '}
              <button
                onClick={() => { setMode('register'); setError(''); setMessage(''); }}
                className="text-star-gold hover:text-star-gold-light transition-colors"
              >
                立即注册
              </button>
            </>
          ) : (
            <>
              已有账号？{' '}
              <button
                onClick={() => { setMode('login'); setError(''); setMessage(''); }}
                className="text-star-gold hover:text-star-gold-light transition-colors"
              >
                直接登录
              </button>
            </>
          )}
        </p>
      </motion.div>
    </div>
  );
}
