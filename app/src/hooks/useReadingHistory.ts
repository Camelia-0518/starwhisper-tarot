import { useState, useCallback, useEffect } from 'react';

export interface StoredReading {
  id: string;
  date: string;
  spreadId: string;
  spreadName: string;
  question: string;
  cards: {
    positionIndex: number;
    positionName: string;
    cardId: string;
    cardName: string;
    isReversed: boolean;
  }[];
  interpretation: string;
}

const STORAGE_KEY = 'tarot-reading-history';
const MAX_RECORDS = 50;

function loadFromStorage(): StoredReading[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StoredReading[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveToStorage(readings: StoredReading[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(readings));
  } catch {
    // Silently fail if localStorage is full or unavailable
  }
}

export function useReadingHistory() {
  const [readings, setReadings] = useState<StoredReading[]>(loadFromStorage);

  // Persist whenever readings change
  useEffect(() => {
    saveToStorage(readings);
  }, [readings]);

  const addReading = useCallback((reading: Omit<StoredReading, 'id' | 'date'>) => {
    const newReading: StoredReading = {
      ...reading,
      id: `reading-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      date: new Date().toISOString(),
    };
    setReadings((prev) => {
      const updated = [newReading, ...prev];
      if (updated.length > MAX_RECORDS) {
        return updated.slice(0, MAX_RECORDS);
      }
      return updated;
    });
    return newReading.id;
  }, []);

  const deleteReading = useCallback((id: string) => {
    setReadings((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const clearAllReadings = useCallback(() => {
    setReadings([]);
  }, []);

  const getReadingById = useCallback(
    (id: string): StoredReading | undefined => {
      return readings.find((r) => r.id === id);
    },
    [readings]
  );

  // Group readings by date category
  const getGroupedReadings = useCallback(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Start of current week (Sunday)
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    const groups: {
      label: string;
      readings: StoredReading[];
    }[] = [
      { label: '今天', readings: [] },
      { label: '昨天', readings: [] },
      { label: '本周', readings: [] },
      { label: '更早', readings: [] },
    ];

    for (const reading of readings) {
      const d = new Date(reading.date);
      const dateOnly = new Date(d.getFullYear(), d.getMonth(), d.getDate());

      if (dateOnly.getTime() === today.getTime()) {
        groups[0].readings.push(reading);
      } else if (dateOnly.getTime() === yesterday.getTime()) {
        groups[1].readings.push(reading);
      } else if (dateOnly >= startOfWeek) {
        groups[2].readings.push(reading);
      } else {
        groups[3].readings.push(reading);
      }
    }

    return groups.filter((g) => g.readings.length > 0);
  }, [readings]);

  return {
    readings,
    addReading,
    deleteReading,
    clearAllReadings,
    getReadingById,
    getGroupedReadings,
    count: readings.length,
  };
}
