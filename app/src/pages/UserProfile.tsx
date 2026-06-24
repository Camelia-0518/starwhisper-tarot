import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router';
import {
  User,
  LogOut,
  Trash2,
  AlertTriangle,
  ChevronRight,
  Sparkles,
  BookOpen,
  History,
} from 'lucide-react';
import Layout from '@/components/Layout';
import { supabase } from '@/lib/supabase';

export default function UserProfile() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [stats, setStats] = useState({ readings: 0, journal: 0 });

  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        setUser(data.session.user);
        // Load profile
        const { data: profileData } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', data.session.user.id)
          .single();
        setProfile(profileData);

        // Load stats
        const [{ count: readingCount }, { count: journalCount }] = await Promise.all([
          supabase.from('readings').select('*', { count: 'exact', head: true }).eq('user_id', data.session.user.id),
          supabase.from('journal_entries').select('*', { count: 'exact', head: true }).eq('user_id', data.session.user.id),
        ]);
        setStats({ readings: readingCount || 0, journal: journalCount || 0 });
      }
      setIsLoading(false);
    };
    loadUser();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-[100dvh] flex items-center justify-center">
          <Sparkles className="w-8 h-8 text-star-gold animate-pulse" />
        </div>
      </Layout>
    );
  }

  if (!user) {
    return (
      <Layout>
        <div className="min-h-[100dvh] flex flex-col items-center justify-center text-moon-silver">
          <User className="w-12 h-12 mb-4 opacity-40" />
          <p className="font-serif-sc text-lg mb-4">请先登录</p>
          <Link
            to="/"
            className="px-6 py-2 bg-gradient-gold text-deep-night rounded-full font-sans-sc font-medium hover:shadow-gold-glow transition-all"
          >
            返回首页
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-[100dvh] bg-deep-night pt-20 pb-12">
        <div className="max-w-2xl mx-auto px-4">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-deep-blue border border-star-gold/20 rounded-xl p-6 mb-6"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-star-gold/10 flex items-center justify-center">
                <User className="w-8 h-8 text-star-gold" />
              </div>
              <div>
                <h2 className="font-serif-sc text-xl text-star-gold font-bold">
                  {profile?.display_name || '塔罗行者'}
                </h2>
                <p className="text-moon-silver text-sm">{user.email}</p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-deep-night/60 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-star-gold">{stats.readings}</p>
                <p className="text-xs text-moon-silver mt-1">占卜记录</p>
              </div>
              <div className="bg-deep-night/60 rounded-lg p-4 text-center">
                <p className="text-2xl font-bold text-star-gold">{stats.journal}</p>
                <p className="text-xs text-moon-silver mt-1">日记条目</p>
              </div>
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-3 mb-6"
          >
            <Link
              to="/history"
              className="flex items-center justify-between bg-deep-blue border border-star-gold/10 rounded-xl p-4 hover:border-star-gold/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <History className="w-5 h-5 text-star-gold" />
                <span className="text-star-white font-sans-sc">占卜历史</span>
              </div>
              <ChevronRight className="w-4 h-4 text-moon-silver" />
            </Link>
            <Link
              to="/journal"
              className="flex items-center justify-between bg-deep-blue border border-star-gold/10 rounded-xl p-4 hover:border-star-gold/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-star-gold" />
                <span className="text-star-white font-sans-sc">塔罗日记</span>
              </div>
              <ChevronRight className="w-4 h-4 text-moon-silver" />
            </Link>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-3"
          >
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 bg-deep-blue border border-star-gold/10 rounded-xl p-4 text-moon-silver hover:text-star-gold hover:border-star-gold/30 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-sans-sc">退出登录</span>
            </button>

            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full flex items-center justify-center gap-2 bg-reversed-red/5 border border-reversed-red/10 rounded-xl p-4 text-reversed-red/60 hover:text-reversed-red hover:border-reversed-red/30 transition-colors"
            >
              <Trash2 className="w-5 h-5" />
              <span className="font-sans-sc">删除账号</span>
            </button>
          </motion.div>
        </div>
      </div>

      {/* Delete Confirm */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-deep-night/80 backdrop-blur-sm p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-deep-blue border border-reversed-red/30 rounded-xl p-6 max-w-sm w-full"
          >
            <div className="flex items-center gap-2 text-reversed-red mb-3">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="font-serif-sc text-lg">确认删除账号</h3>
            </div>
            <p className="text-moon-silver text-sm mb-6">
              此操作将永久删除你的所有数据，包括占卜记录、日记和账号信息。不可恢复。
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 rounded-full text-moon-silver hover:text-star-white text-sm transition-colors"
              >
                取消
              </button>
              <button
                onClick={async () => {
                  await supabase.rpc('delete_user');
                  await supabase.auth.signOut();
                  window.location.href = '/';
                }}
                className="px-4 py-2 rounded-full bg-reversed-red/20 text-reversed-red text-sm hover:bg-reversed-red/30 transition-colors"
              >
                确认删除
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </Layout>
  );
}
