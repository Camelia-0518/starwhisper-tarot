import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Sparkles, History, User } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import AuthModal from '@/components/AuthModal';

const navLinks = [
  { path: '/', label: '首页' },
  { path: '/reading', label: '开始占卜' },
  { path: '/cards', label: '牌库' },
  { path: '/journal', label: '日记' },
  { path: '/history', label: '历史记录' },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [user, setUser] = useState<any>(null);
  const location = useLocation();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user || null);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <motion.header
        className="fixed top-0 left-0 right-0 z-50 backdrop-tarot border-b border-star-gold/20"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{
          duration: 0.6,
          ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
        }}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <Sparkles className="w-6 h-6 text-star-gold group-hover:text-star-gold-light transition-colors" />
            <span className="font-serif-sc text-lg font-bold text-star-gold tracking-wider">
              星言塔罗
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative font-sans-sc text-sm tracking-wide transition-colors ${
                  isActive(link.path)
                    ? 'text-star-gold'
                    : 'text-moon-silver hover:text-star-gold'
                }`}
              >
                {link.label}
                {isActive(link.path) && (
                  <motion.div
                    className="absolute -bottom-1 left-0 right-0 h-px bg-star-gold"
                    layoutId="nav-underline"
                    transition={{ duration: 0.3 }}
                  />
                )}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/history"
              className="hidden md:flex items-center justify-center w-9 h-9 rounded-full border border-star-gold/30 text-moon-silver hover:text-star-gold hover:border-star-gold/60 transition-colors"
            >
              <History className="w-4 h-4" />
            </Link>

            {/* User / Login */}
            {user ? (
              <Link
                to="/profile"
                className="flex items-center justify-center w-9 h-9 rounded-full bg-star-gold/10 text-star-gold hover:bg-star-gold/20 transition-colors"
              >
                <User className="w-4 h-4" />
              </Link>
            ) : (
              <button
                onClick={() => setShowAuth(true)}
                className="hidden md:flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-star-gold/40 text-star-gold text-sm font-sans-sc hover:bg-star-gold/10 transition-colors"
              >
                <User className="w-4 h-4" />
                登录
              </button>
            )}

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden flex items-center justify-center w-9 h-9 text-moon-silver hover:text-star-gold transition-colors"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </nav>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              className="md:hidden fixed inset-0 top-16 z-40 bg-deep-night/95 backdrop-blur-lg"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex flex-col items-center justify-center h-full gap-8">
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.path}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.4 }}
                  >
                    <Link
                      to={link.path}
                      onClick={() => setIsOpen(false)}
                      className={`font-serif-sc text-2xl tracking-wider transition-colors ${
                        isActive(link.path)
                          ? 'text-star-gold'
                          : 'text-moon-silver hover:text-star-gold'
                      }`}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
                {/* Mobile login */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: navLinks.length * 0.1, duration: 0.4 }}
                >
                  {user ? (
                    <Link
                      to="/profile"
                      onClick={() => setIsOpen(false)}
                      className="font-serif-sc text-2xl tracking-wider text-star-gold"
                    >
                      我的账号
                    </Link>
                  ) : (
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        setShowAuth(true);
                      }}
                      className="font-serif-sc text-2xl tracking-wider text-star-gold"
                    >
                      登录 / 注册
                    </button>
                  )}
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      <AuthModal isOpen={showAuth} onClose={() => setShowAuth(false)} />
    </>
  );
}
