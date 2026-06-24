import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Cloud, CloudOff } from 'lucide-react';
import Layout from '@/components/Layout';
import { useSupabaseHistory } from '@/hooks/useSupabaseHistory';
import type { SavedReading } from '@/store/readingStore';
import EmptyState from '@/components/history/EmptyState';
import HistoryList from '@/components/history/HistoryList';
import DeleteConfirmDialog from '@/components/history/DeleteConfirmDialog';

const filterOptions = [
  { label: '全部', value: 'all' },
  { label: '最近7天', value: '7days' },
  { label: '最近30天', value: '30days' },
  { label: '本月', value: 'thisMonth' },
  { label: '更早', value: 'earlier' },
] as const;

type FilterValue = (typeof filterOptions)[number]['value'];

function getDaysDiff(dateStr: string): number {
  const now = new Date();
  const d = new Date(dateStr);
  const diffMs = now.getTime() - d.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

// 将云端 SavedReading 转换为本地 StoredReading 格式
function convertToStoredFormat(readings: SavedReading[]) {
  return readings.map((r) => ({
    id: r.id,
    date: r.createdAt,
    spreadId: r.spreadId,
    spreadName: r.spreadName,
    question: r.question,
    cards: r.cards.map((c, i) => ({
      positionIndex: i,
      positionName: c.position.name,
      cardId: c.card.id,
      cardName: c.card.name,
      isReversed: c.isReversed,
    })),
    interpretation: r.aiReading?.overallReading || '',
  }));
}

export default function HistoryPage() {
  const { readings: cloudReadings, isLoading, isLoggedIn, deleteReading, refreshReadings } =
    useSupabaseHistory();
  const [activeFilter, setActiveFilter] = useState<FilterValue>('all');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // 转换后的 readings
  const readings = convertToStoredFormat(cloudReadings);
  const count = readings.length;

  // Apply time filter to grouped readings
  const filteredReadings = (() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const filtered = readings.filter((r) => {
      const d = new Date(r.date);
      switch (activeFilter) {
        case '7days':
          return getDaysDiff(r.date) < 7;
        case '30days':
          return getDaysDiff(r.date) < 30;
        case 'thisMonth':
          return d >= startOfMonth;
        case 'earlier':
          return d < startOfMonth;
        default:
          return true;
      }
    });

    // Regroup filtered readings
    const todayTime = today.getTime();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayTime = yesterday.getTime();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    const groups: { label: string; readings: typeof filtered }[] = [
      { label: '今天', readings: [] },
      { label: '昨天', readings: [] },
      { label: '本周', readings: [] },
      { label: '更早', readings: [] },
    ];

    for (const reading of filtered) {
      const dateOnly = new Date(
        new Date(reading.date).getFullYear(),
        new Date(reading.date).getMonth(),
        new Date(reading.date).getDate()
      );
      const dateTime = dateOnly.getTime();

      if (dateTime === todayTime) {
        groups[0].readings.push(reading);
      } else if (dateTime === yesterdayTime) {
        groups[1].readings.push(reading);
      } else if (dateOnly >= startOfWeek) {
        groups[2].readings.push(reading);
      } else {
        groups[3].readings.push(reading);
      }
    }

    return groups.filter((g) => g.readings.length > 0);
  })();

  // Calculate "recent days" for stats
  const recentDays = (() => {
    if (readings.length === 0) return 0;
    const lastReading = new Date(readings[0].date);
    const now = new Date();
    return Math.floor((now.getTime() - lastReading.getTime()) / (1000 * 60 * 60 * 24));
  })();

  return (
    <Layout>
      <div
        className="min-h-[100dvh] relative bg-cover bg-center bg-fixed"
        style={{ backgroundImage: 'url(/assets/history-bg.png)' }}
      >
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-deep-night/90" />

        {/* Content */}
        <div className="relative z-10 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            {/* Empty state */}
            {count === 0 && !isLoading ? (
              <EmptyState />
            ) : (
              <>
                {/* Header Section */}
                <motion.div
                  className="text-center mb-10"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <h1 className="font-serif-sc text-4xl md:text-5xl lg:text-[56px] font-bold text-star-gold mb-4 tracking-wide">
                    占卜纪事
                  </h1>
                  <p className="text-moon-silver text-base max-w-xl mx-auto leading-relaxed mb-6">
                    星辰记得每一次对话。回顾过往的指引，感受时间中的变化。
                  </p>

                  {/* Stats row */}
                  <div className="flex items-center justify-center gap-3 text-sm flex-wrap">
                    <span className="text-dark-gold">
                      共 {count} 次占卜 · 最近 {recentDays} 日
                    </span>
                    <span className="text-dark-gold/40">|</span>
                    <span className="inline-flex items-center gap-1 text-xs text-moon-silver/60">
                      {isLoggedIn ? (
                        <>
                          <Cloud className="w-3 h-3 text-upright-green" />
                          已同步云端
                        </>
                      ) : (
                        <>
                          <CloudOff className="w-3 h-3 text-dark-gold" />
                          本地存储，登录后同步
                        </>
                      )}
                    </span>
                    {isLoggedIn && count > 0 && (
                      <>
                        <span className="text-dark-gold/40">|</span>
                        <button
                          onClick={() => setShowClearConfirm(true)}
                          className="inline-flex items-center gap-1 text-reversed-red/60 hover:text-reversed-red transition-colors text-xs"
                        >
                          <Trash2 className="w-3 h-3" />
                          清空记录
                        </button>
                      </>
                    )}
                  </div>
                </motion.div>

                {/* Filter Tabs */}
                <motion.div
                  className="flex items-center justify-center gap-2 mb-10 flex-wrap"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.15 }}
                >
                  {filterOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setActiveFilter(opt.value)}
                      className={`px-4 py-2 rounded-full text-sm font-sans-sc font-medium transition-all duration-200 ${
                        activeFilter === opt.value
                          ? 'bg-star-gold/15 text-star-gold border border-star-gold/40'
                          : 'text-moon-silver/60 border border-transparent hover:text-moon-silver hover:bg-star-gold/5'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </motion.div>

                {/* History List */}
                {isLoading ? (
                  <div className="flex justify-center py-20">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    >
                      <Cloud className="w-8 h-8 text-star-gold" />
                    </motion.div>
                  </div>
                ) : filteredReadings.length > 0 ? (
                  <HistoryList
                    groupedReadings={filteredReadings}
                    onDeleteReading={deleteReading}
                  />
                ) : (
                  <motion.div
                    className="text-center py-16"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <p className="text-moon-silver/40 text-sm">
                      该时间段暂无占卜记录
                    </p>
                  </motion.div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Clear All Confirmation */}
      <DeleteConfirmDialog
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={async () => {
          // 逐个删除所有记录
          for (const r of readings) {
            await deleteReading(r.id);
          }
          await refreshReadings();
          setShowClearConfirm(false);
        }}
        title="确认清空所有记录"
        message="此操作不可撤销。确定要清空所有占卜记录吗？"
      />
    </Layout>
  );
}
