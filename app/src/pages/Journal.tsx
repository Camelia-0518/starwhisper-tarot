import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Plus,
  Trash2,
  Calendar,
  Tag,
  Sparkles,
  X,
  Save,
  ChevronLeft,
} from 'lucide-react';
import Layout from '@/components/Layout';
import { useJournal } from '@/hooks/useJournal';
import type { JournalEntry } from '@/hooks/useJournal';

const MOODS = [
  { label: '平静', color: 'bg-spirit-blue/20 text-spirit-blue' },
  { label: '喜悦', color: 'bg-star-gold/20 text-star-gold' },
  { label: '困惑', color: 'bg-nebula-purple/20 text-nebula-purple' },
  { label: '忧伤', color: 'bg-reversed-red/20 text-reversed-red' },
  { label: '期待', color: 'bg-upright-green/20 text-upright-green' },
  { label: '疲惫', color: 'bg-moon-silver/20 text-moon-silver' },
];

/* ─────────────── 日记列表 ─────────────── */

function JournalList({
  entries,
  onSelect,
  onDelete,
}: {
  entries: JournalEntry[];
  onSelect: (entry: JournalEntry) => void;
  onDelete: (id: string) => void;
}) {
  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-moon-silver">
        <BookOpen className="w-12 h-12 mb-4 opacity-40" />
        <p className="font-sans-sc text-sm">还没有日记记录</p>
        <p className="text-xs mt-1 opacity-60">点击右上角开始写下你的第一页</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {entries.map((entry, i) => (
        <motion.div
          key={entry.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="group bg-deep-blue border border-star-gold/20 rounded-xl p-5 hover:border-star-gold/40 transition-all cursor-pointer"
          onClick={() => onSelect(entry)}
        >
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-serif-sc text-lg text-star-white font-medium">
              {entry.title || '无标题'}
            </h3>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(entry.id);
              }}
              className="opacity-0 group-hover:opacity-100 text-reversed-red hover:text-reversed-red/80 transition-opacity p-1"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <p className="text-moon-silver text-sm line-clamp-2 mb-3 leading-relaxed">
            {entry.content}
          </p>

          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1 text-moon-silver/60">
              <Calendar className="w-3 h-3" />
              {new Date(entry.createdAt).toLocaleDateString('zh-CN')}
            </span>
            {entry.mood && (
              <span className={`px-2 py-0.5 rounded-full ${MOODS.find((m) => m.label === entry.mood)?.color || 'bg-moon-silver/20 text-moon-silver'}`}>
                {entry.mood}
              </span>
            )}
            {entry.tags.map((tag) => (
              <span key={tag} className="flex items-center gap-0.5 text-dark-gold">
                <Tag className="w-3 h-3" />
                {tag}
              </span>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

/* ─────────────── 编辑/新建 ─────────────── */

function JournalEditor({
  entry,
  onSave,
  onCancel,
}: {
  entry?: JournalEntry;
  onSave: (data: { title: string; content: string; mood?: string; tags: string[] }) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(entry?.title || '');
  const [content, setContent] = useState(entry?.content || '');
  const [mood, setMood] = useState(entry?.mood || '');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState(entry?.tags || []);

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) {
      setTags([...tags, t]);
      setTagInput('');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-deep-blue border border-star-gold/20 rounded-xl p-6"
    >
      <div className="flex items-center gap-2 mb-6">
        <button onClick={onCancel} className="text-moon-silver hover:text-star-white">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="font-serif-sc text-xl text-star-gold">
          {entry ? '编辑日记' : '新日记'}
        </h2>
      </div>

      {/* Title */}
      <input
        type="text"
        placeholder="标题（可选）"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full bg-deep-night border border-star-gold/20 rounded-lg px-4 py-3 text-star-white placeholder-moon-silver/40 font-serif-sc mb-4 focus:border-star-gold/50 focus:outline-none transition-colors"
      />

      {/* Content */}
      <textarea
        placeholder="写下你此刻的感受、对牌阵的感悟，或者任何想记录的心情..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={8}
        className="w-full bg-deep-night border border-star-gold/20 rounded-lg px-4 py-3 text-moon-silver placeholder-moon-silver/40 text-sm leading-relaxed mb-4 focus:border-star-gold/50 focus:outline-none transition-colors resize-none"
      />

      {/* Mood */}
      <div className="mb-4">
        <p className="text-xs text-moon-silver/60 mb-2 font-sans-sc">心情</p>
        <div className="flex flex-wrap gap-2">
          {MOODS.map((m) => (
            <button
              key={m.label}
              onClick={() => setMood(mood === m.label ? '' : m.label)}
              className={`px-3 py-1.5 rounded-full text-xs font-sans-sc transition-all ${
                mood === m.label ? m.color + ' ring-1 ring-current' : 'bg-deep-night text-moon-silver/60 hover:text-moon-silver'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tags */}
      <div className="mb-6">
        <p className="text-xs text-moon-silver/60 mb-2 font-sans-sc">标签</p>
        <div className="flex items-center gap-2 mb-2">
          <input
            type="text"
            placeholder="输入标签按回车"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
            className="flex-1 bg-deep-night border border-star-gold/20 rounded-lg px-3 py-2 text-sm text-star-white placeholder-moon-silver/40 focus:border-star-gold/50 focus:outline-none"
          />
          <button
            onClick={addTag}
            className="px-3 py-2 bg-star-gold/10 text-star-gold rounded-lg text-sm hover:bg-star-gold/20 transition-colors"
          >
            添加
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2 py-1 bg-dark-gold/20 text-dark-gold rounded text-xs"
            >
              {tag}
              <button onClick={() => setTags(tags.filter((t) => t !== tag))}>
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <button
          onClick={onCancel}
          className="px-5 py-2 text-moon-silver hover:text-star-white text-sm font-sans-sc transition-colors"
        >
          取消
        </button>
        <button
          onClick={() => onSave({ title, content, mood: mood || undefined, tags })}
          disabled={!content.trim()}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-gold text-deep-night font-sans-sc font-medium rounded-full hover:shadow-gold-glow disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <Save className="w-4 h-4" />
          保存
        </button>
      </div>
    </motion.div>
  );
}

/* ─────────────── 页面 ─────────────── */

export default function JournalPage() {
  const { entries, isLoading, createEntry, updateEntry, deleteEntry } = useJournal();
  const [mode, setMode] = useState<'list' | 'new' | 'edit'>('list');
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | undefined>();

  const handleSave = async (data: { title: string; content: string; mood?: string; tags: string[] }) => {
    if (mode === 'edit' && selectedEntry) {
      await updateEntry(selectedEntry.id, data);
    } else {
      await createEntry(data);
    }
    setMode('list');
    setSelectedEntry(undefined);
  };

  return (
    <Layout>
      <div
        className="min-h-[100dvh] bg-cover bg-center"
        style={{ backgroundImage: 'url(/assets/library-bg.png)' }}
      >
        <div className="absolute inset-0 bg-deep-night/80" />

        <div className="relative z-10 max-w-3xl mx-auto px-4 pt-24 pb-12">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-serif-sc text-2xl md:text-3xl font-bold text-star-gold flex items-center gap-2">
                <BookOpen className="w-6 h-6" />
                塔罗日记
              </h1>
              <p className="text-moon-silver text-sm mt-1 font-sans-sc">
                记录每一次与星辰对话的感悟
              </p>
            </div>

            {mode === 'list' && (
              <button
                onClick={() => {
                  setMode('new');
                  setSelectedEntry(undefined);
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-gold text-deep-night font-sans-sc font-medium rounded-full hover:shadow-gold-glow transition-all"
              >
                <Plus className="w-4 h-4" />
                写日记
              </button>
            )}
          </div>

          {/* Content */}
          <AnimatePresence mode="wait">
            {mode === 'list' ? (
              <motion.div
                key="list"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {isLoading ? (
                  <div className="flex justify-center py-20">
                    <Sparkles className="w-8 h-8 text-star-gold animate-pulse" />
                  </div>
                ) : (
                  <JournalList
                    entries={entries}
                    onSelect={(entry) => {
                      setSelectedEntry(entry);
                      setMode('edit');
                    }}
                    onDelete={deleteEntry}
                  />
                )}
              </motion.div>
            ) : (
              <motion.div
                key="editor"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <JournalEditor
                  entry={selectedEntry}
                  onSave={handleSave}
                  onCancel={() => {
                    setMode('list');
                    setSelectedEntry(undefined);
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Layout>
  );
}
