import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { SavedReading } from '@/store/readingStore';

/**
 * 星言塔罗 — Supabase 云端历史记录 Hook
 *
 * 职责：
 * 1. 已登录用户：读写 Supabase 云端记录
 * 2. 未登录用户：回退到 localStorage 本地记录
 * 3. 登录后自动同步本地记录到云端
 */

interface UseSupabaseHistoryReturn {
  readings: SavedReading[];
  isLoading: boolean;
  isLoggedIn: boolean;
  saveReading: (reading: SavedReading) => Promise<void>;
  deleteReading: (id: string) => Promise<void>;
  refreshReadings: () => Promise<void>;
}

const LOCAL_STORAGE_KEY = 'tarot-readings';

function getLocalReadings(): SavedReading[] {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function setLocalReadings(readings: SavedReading[]) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(readings.slice(0, 50)));
}

// 将云端原始数据转换为前端 SavedReading 格式
function mapDbReading(dbRow: Record<string, unknown>): SavedReading {
  return {
    id: dbRow.id as string,
    spreadId: dbRow.spread_id as string,
    spreadName: dbRow.spread_name as string,
    question: (dbRow.question as string) || '',
    cards: (dbRow.cards as SavedReading['cards']) || [],
    aiReading: {
      overallReading: (dbRow.ai_overall_reading as string) || '',
      cardReadings: (dbRow.ai_card_readings as SavedReading['aiReading']['cardReadings']) || [],
    },
    createdAt: dbRow.created_at as string,
  };
}

// 将前端 SavedReading 转换为云端插入格式
function toDbInsert(reading: SavedReading, userId: string) {
  return {
    user_id: userId,
    spread_id: reading.spreadId,
    spread_name: reading.spreadName,
    question: reading.question,
    cards: reading.cards,
    ai_overall_reading: reading.aiReading.overallReading,
    ai_card_readings: reading.aiReading.cardReadings,
  };
}

export function useSupabaseHistory(): UseSupabaseHistoryReturn {
  const [readings, setReadings] = useState<SavedReading[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // 监听登录状态
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      setIsLoggedIn(!!session);
      setUserId(session?.user?.id || null);
    };

    checkSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
      setUserId(session?.user?.id || null);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // 加载记录
  const refreshReadings = useCallback(async () => {
    setIsLoading(true);

    try {
      if (isLoggedIn && userId) {
        // 从云端加载
        const { data, error } = await supabase
          .from('readings')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) {
          console.error('Failed to load cloud readings:', error);
          // 降级到本地
          setReadings(getLocalReadings());
        } else {
          const mapped = (data || []).map(mapDbReading);
          setReadings(mapped);

          // 同步本地记录到云端（如有）
          const local = getLocalReadings();
          if (local.length > 0) {
            const cloudIds = new Set(mapped.map((r) => r.id));
            const toSync = local.filter((r) => !cloudIds.has(r.id));

            if (toSync.length > 0) {
              const inserts = toSync.map((r) => toDbInsert(r, userId));
              const { error: syncError } = await supabase.from('readings').insert(inserts);
              if (!syncError) {
                // 同步成功后清空本地
                localStorage.removeItem(LOCAL_STORAGE_KEY);
                // 重新加载
                const { data: refreshed } = await supabase
                  .from('readings')
                  .select('*')
                  .eq('user_id', userId)
                  .order('created_at', { ascending: false })
                  .limit(50);
                setReadings((refreshed || []).map(mapDbReading));
              }
            }
          }
        }
      } else {
        // 未登录，从本地加载
        setReadings(getLocalReadings());
      }
    } finally {
      setIsLoading(false);
    }
  }, [isLoggedIn, userId]);

  useEffect(() => {
    refreshReadings();
  }, [refreshReadings]);

  // 保存记录
  const saveReading = useCallback(
    async (reading: SavedReading) => {
      if (isLoggedIn && userId) {
        // 保存到云端
        const { error } = await supabase.from('readings').insert(toDbInsert(reading, userId));
        if (error) {
          console.error('Failed to save to cloud:', error);
          // 降级到本地
          const local = getLocalReadings();
          local.unshift(reading);
          setLocalReadings(local);
          setReadings(local);
        } else {
          // 刷新列表
          await refreshReadings();
        }
      } else {
        // 保存到本地
        const local = getLocalReadings();
        local.unshift(reading);
        setLocalReadings(local);
        setReadings(local);
      }
    },
    [isLoggedIn, userId, refreshReadings]
  );

  // 删除记录
  const deleteReading = useCallback(
    async (id: string) => {
      if (isLoggedIn && userId) {
        const { error } = await supabase.from('readings').delete().eq('id', id).eq('user_id', userId);
        if (error) {
          console.error('Failed to delete from cloud:', error);
        }
        await refreshReadings();
      } else {
        // 删除本地
        const local = getLocalReadings().filter((r) => r.id !== id);
        setLocalReadings(local);
        setReadings(local);
      }
    },
    [isLoggedIn, userId, refreshReadings]
  );

  return {
    readings,
    isLoading,
    isLoggedIn,
    saveReading,
    deleteReading,
    refreshReadings,
  };
}
