import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { TarotCard as TarotCardType } from '@/types/tarot';

interface TarotCardProps {
  card?: TarotCardType;
  isReversed?: boolean;
  showFront?: boolean;
  width?: number;
  height?: number;
  onClick?: () => void;
  className?: string;
  animate?: boolean;
}

export default function TarotCard({
  card,
  isReversed = false,
  showFront = false,
  width = 160,
  height = 280,
  onClick,
  className = '',
  animate = false,
}: TarotCardProps) {
  const [isFlipped, setIsFlipped] = useState(showFront);
  const [isHovered, setIsHovered] = useState(false);

  // Sync internal flip state with showFront prop
  useEffect(() => {
    setIsFlipped(showFront);
  }, [showFront]);

  const handleClick = () => {
    if (onClick) {
      onClick();
      // Also flip the card locally if not already flipped
      if (!isFlipped) {
        setIsFlipped(true);
      }
    } else if (!isFlipped && card) {
      setIsFlipped(true);
    }
  };

  const aspectRatio = height / width;
  const actualWidth = width;
  const actualHeight = width * aspectRatio;

  return (
    <div
      className={`relative cursor-pointer perspective-[1000px] ${className}`}
      style={{ width: actualWidth, height: actualHeight }}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        className="relative w-full h-full"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{
          rotateY: isFlipped ? 180 : 0,
          scale: isHovered && !isFlipped ? 1.05 : 1,
          translateY: isHovered && !isFlipped ? -8 : 0,
        }}
        transition={{
          duration: isFlipped ? 0.8 : 0.3,
          ease: isFlipped
            ? ([0.16, 1, 0.3, 1] as [number, number, number, number])
            : ([0.4, 0, 0.2, 1] as [number, number, number, number]),
        }}
      >
        {/* Card Back */}
        <div
          className="absolute inset-0 overflow-hidden"
          style={{ backfaceVisibility: 'hidden' }}
        >
          <div
            className="w-full h-full bg-deep-blue border-2 border-star-gold/50 flex items-center justify-center relative"
            style={{ borderRadius: '8px / 120% 8px' }}
          >
            <img
              src="/assets/card-back.jpg"
              alt="Card Back"
              className="w-full h-full object-cover"
              style={{ borderRadius: '8px / 120% 8px' }}
              draggable={false}
            />
            {animate && (
              <div className="absolute inset-0 animate-pulse-glow" style={{ borderRadius: '8px / 120% 8px' }} />
            )}
          </div>
        </div>

        {/* Card Front */}
        <div
          className="absolute inset-0 bg-deep-blue border-2 border-star-gold overflow-hidden"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            borderRadius: '8px / 120% 8px',
          }}
        >
          {card && (
            <div
              className="w-full h-full flex flex-col items-center p-2 relative"
              style={{
                transform: isReversed ? 'rotate(180deg)' : 'none',
                borderRadius: '8px / 120% 8px',
              }}
            >
              {/* Roman numeral + name */}
              <div className="text-center w-full">
                {card.romanNum && (
                  <span className="font-playfair text-[10px] text-star-gold block leading-tight">
                    {card.romanNum}
                  </span>
                )}
                <span className="font-serif-sc text-[10px] text-star-gold-light block truncate leading-tight">
                  {card.name}
                </span>
              </div>

              {/* Card illustration - uses unique card image for major arcana, styled placeholder for minor */}
              <div className="flex-1 w-full my-1 flex items-center justify-center relative overflow-hidden" style={{ borderRadius: '4px' }}>
                {card.image ? (
                  <>
                    <img
                      src={card.image}
                      alt={card.name}
                      className="w-full h-full object-cover"
                      draggable={false}
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-deep-blue/60 via-transparent to-deep-blue/30 pointer-events-none" />
                  </>
                ) : (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-b from-indigo-main/50 to-deep-blue/80" />
                    <span className="relative text-moon-silver/40 font-cinzel text-[8px] text-center px-1">
                      {card.nameEn}
                    </span>
                  </>
                )}
                {/* Corner decorations */}
                <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-star-gold/40" />
                <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-star-gold/40" />
                <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-star-gold/40" />
                <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-star-gold/40" />
              </div>

              {/* Reversed indicator */}
              <div className="text-center w-full">
                <span
                  className={`text-[8px] font-sans-sc ${
                    isReversed ? 'text-reversed-red' : 'text-upright-green'
                  }`}
                >
                  {isReversed ? '逆位' : '正位'}
                </span>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Gold glow on hover (back side only) */}
      {!isFlipped && isHovered && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{ borderRadius: '8px / 120% 8px' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div
            className="w-full h-full"
            style={{
              borderRadius: '8px / 120% 8px',
              boxShadow: '0 0 25px rgba(201, 168, 76, 0.4), 0 0 50px rgba(201, 168, 76, 0.2)',
            }}
          />
        </motion.div>
      )}
    </div>
  );
}
