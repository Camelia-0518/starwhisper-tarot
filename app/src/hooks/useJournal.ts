import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

/**
 * 星言塔罗 — 日记系统 Hook
 *
 * 功能：
 * 1. 创建/编辑/删除日记条目
 * 2. 关联占卜记录
 * 3. 心情标签 + 自定义标签
 * 4. 已登录走云端，未登录本地 localStorage 兜底
 */

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  mood?: string;
  tags: string[];
  linkedReadingId?: string;
  linkedReadingName?: string;
  createdAt: string;
  updatedAt: string;
}

interface UseJournalReturn {
  entries: JournalEntry[];
  isLoading: boolean;
  isLoggedIn: boolean;
  createEntry: (entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateEntry: (id: string, updates: Partial<JournalEntry>) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  refreshEntries: () => Promise<void>;
}

const LOCAL_KEY = 'tarot-journal';

function getLocal(): JournalEntry[] {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_KEY) || '[]');
  } catch {
    return [];
  }
}

function setLocal(entries: JournalEntry[]) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(entries.slice(0, 100)));
}

function mapDb(row: Record<string, unknown>): JournalEntry {
  return {
    id: row.id as string,
    title: (row.title as string) || '',
    content: row.content as string,
    mood: (row.mood as string) || undefined,
    tags: (row.tags as string[]) || [],
    linkedReadingId: (row.linked_reading_id as string) || undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export function useJournal(): UseJournalReturn {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setIsLoggedIn(!!data.session);
      setUserId(data.session?.user?.id || null);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
      setUserId(session?.user?.id || null);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const refreshEntries = useCallback(async () => {
    setIsLoading(true);
    try {
      if (isLoggedIn && userId) {
        const { data, error } = await supabase
          .from('journal_entries')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(100);
        if (error) {
          console.error(error);
          setEntries(getLocal());
        } else {
          setEntries((data || []).map(mapDb));
        }
      } else {
        setEntries(getLocal());
      }
    } finally {
      setIsLoading(false);
    }
  }, [isLoggedIn, userId]);

  useEffect(() => {
    refreshEntries();
  }, [refreshEntries]);

  const createEntry = useCallback(
    async (entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
      const now = new Date().toISOString();
      const newEntry: JournalEntry = {
        ...entry,
        id: `journal-${Date.now()}`,
        createdAt: now,
        updatedAt: now,
      };

      if (isLoggedIn && userId) {
        const { error } = await supabase.from('journal_entries').insert({
          user_id: userId,
          title: entry.title,
          content: entry.content,
          mood: entry.mood,
          tags: entry.tags,
          linked_reading_id: entry.linkedReadingId,
        });
        if (error) console.error(error);
        await refreshEntries();
      } else {
        const local = getLocal();
        local.unshift(newEntry);
        setLocal(local);
        setEntries(local);
      }
    },
    [isLoggedIn, userId, refreshEntries]
  );

  const updateEntry = useCallback(
    async (id: string, updates: Partial<JournalEntry>) => {
      if (isLoggedIn && userId) {
        const { error } = await supabase
          .from('journal_entries')
          .update({
            title: updates.title,
            content: updates.content,
            mood: updates.mood,
            tags: updates.tags,
            linked_reading_id: updates.linkedReadingId,
          })
          .eq('id', id)
          .eq('user_id', userId);
        if (error) console.error(error);
        await refreshEntries();
      } else {
        const local = getLocal().map((e) =>
          e.id === id ? { ...e, ...updates, updatedAt: new Date().toISOString() } : e
        );
        setLocal(local);
        setEntries(local);
      }
    },
    [isLoggedIn, userId, refreshEntries]
  );

  const deleteEntry = useCallback(
    async (id: string) => {
      if (isLoggedIn && userId) {
        const { error } = await supabase
          .from('journal_entries')
          .delete()
          .eq('id', id)
          .eq('user_id', userId);
        if (error) console.error(error);
        await refreshEntries();
      } else {
        const local = getLocal().filter((e) => e.id !== id);
        setLocal(local);
        setEntries(local);
      }
    },
    [isLoggedIn, userId, refreshEntries]
  );

  return { entries, isLoading, isLoggedIn, createEntry, updateEntry, deleteEntry, refreshEntries };
}
