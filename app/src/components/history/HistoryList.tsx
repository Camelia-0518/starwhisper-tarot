import { useState } from 'react';
import { motion } from 'framer-motion';
import type { StoredReading } from '@/hooks/useReadingHistory';
import HistoryCard from './HistoryCard';
import ReadingDetailModal from './ReadingDetailModal';
import DeleteConfirmDialog from './DeleteConfirmDialog';

interface HistoryListProps {
  groupedReadings: {
    label: string;
    readings: StoredReading[];
  }[];
  onDeleteReading: (id: string) => void;
}

export default function HistoryList({
  groupedReadings,
  onDeleteReading,
}: HistoryListProps) {
  const [selectedReading, setSelectedReading] = useState<StoredReading | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const handleView = (reading: StoredReading) => {
    setSelectedReading(reading);
    setIsDetailOpen(true);
  };

  const handleDeleteRequest = (id: string) => {
    setDeleteTarget(id);
  };

  const handleConfirmDelete = () => {
    if (deleteTarget) {
      onDeleteReading(deleteTarget);
      // If the deleted reading is currently being viewed, close the modal
      if (selectedReading?.id === deleteTarget) {
        setIsDetailOpen(false);
        setSelectedReading(null);
      }
      setDeleteTarget(null);
    }
  };

  const allReadings = groupedReadings.flatMap((g) => g.readings);
  const latestId = allReadings[0]?.id;

  return (
    <div className="relative">
      {/* Timeline vertical line - desktop */}
      <div className="hidden lg:block absolute left-[140px] top-0 bottom-0 w-px bg-dark-gold/30" />

      {/* Timeline vertical line - mobile */}
      <div className="lg:hidden absolute left-3 top-0 bottom-0 w-px bg-dark-gold/30" />

      <div className="space-y-8">
        {groupedReadings.map((group) => (
          <div key={group.label}>
            {/* Group Label */}
            <div className="relative mb-4 flex items-center">
              {/* Desktop label on timeline */}
              <div className="hidden lg:flex w-[120px] flex-shrink-0 justify-end pr-6">
                <span className="font-serif-sc text-sm text-moon-silver font-medium">
                  {group.label}
                </span>
              </div>
              {/* Timeline node */}
              <div className="absolute left-[140px] top-1/2 -translate-y-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-dark-gold hidden lg:block" />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-dark-gold lg:hidden" />
              {/* Mobile label */}
              <div className="lg:hidden pl-8">
                <span className="font-serif-sc text-sm text-moon-silver font-medium">
                  {group.label}
                </span>
              </div>
            </div>

            {/* Cards in group */}
            <div className="lg:pl-[160px] pl-8 space-y-4">
              {group.readings.map((reading) => {
                // Calculate global index for stagger animation
                const globalIdx = allReadings.indexOf(reading);
                return (
                  <div key={reading.id} className="relative">
                    {/* Timeline node on card level */}
                    <div
                      className={`absolute -left-[calc(2rem+4px)] lg:-left-[calc(10rem+4px)] top-6 w-2 h-2 rounded-full ${
                        reading.id === latestId ? 'bg-star-gold' : 'bg-dark-gold'
                      }`}
                    />
                    {reading.id === latestId && (
                      <motion.div
                        className="absolute -left-[calc(2rem+6px)] lg:-left-[calc(10rem+6px)] top-[22px] w-3 h-3 rounded-full border border-star-gold hidden lg:block"
                        animate={{
                          boxShadow: [
                            '0 0 4px rgba(201, 168, 76, 0.3)',
                            '0 0 10px rgba(201, 168, 76, 0.6)',
                            '0 0 4px rgba(201, 168, 76, 0.3)',
                          ],
                          scale: [1, 1.2, 1],
                        }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      />
                    )}
                    <HistoryCard
                      reading={reading}
                      onView={handleView}
                      onDelete={handleDeleteRequest}
                      index={globalIdx}
                      isLatest={reading.id === latestId}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Detail Modal */}
      <ReadingDetailModal
        reading={selectedReading}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedReading(null);
        }}
        onDelete={handleDeleteRequest}
      />

      {/* Delete Confirmation */}
      <DeleteConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
