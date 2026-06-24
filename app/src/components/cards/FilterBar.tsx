import { useState, useCallback, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal } from 'lucide-react';

export type FilterType = 'all' | 'major' | 'wands' | 'cups' | 'swords' | 'pentacles';
export type SortType = 'default' | 'name' | 'element';

interface FilterBarProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: SortType;
  onSortChange: (sort: SortType) => void;
  resultCount: number;
}

const filterLabels: { value: FilterType; label: string }[] = [
  { value: 'all', label: '全部' },
  { value: 'major', label: '大阿尔卡纳' },
  { value: 'wands', label: '权杖' },
  { value: 'cups', label: '圣杯' },
  { value: 'swords', label: '宝剑' },
  { value: 'pentacles', label: '星币' },
];

const sortOptions: { value: SortType; label: string }[] = [
  { value: 'default', label: '默认排序' },
  { value: 'name', label: '按名称' },
  { value: 'element', label: '按元素' },
];

export default function FilterBar({
  activeFilter,
  onFilterChange,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  resultCount,
}: FilterBarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

  // Listen for scroll to add backdrop blur when sticky
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close sort dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(e.target as Node)) {
        setShowSortDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onSearchChange(e.target.value);
    },
    [onSearchChange]
  );

  const clearSearch = useCallback(() => {
    onSearchChange('');
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [onSearchChange]);

  return (
    <motion.div
      className={`sticky top-16 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-deep-night/95 backdrop-blur-xl border-b border-star-gold/20 shadow-lg'
          : 'bg-transparent'
      }`}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        {/* Top row: filters + search */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-4">
          {/* Filter tabs - horizontal scrollable on mobile */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide w-full lg:w-auto">
            {filterLabels.map((filter, index) => (
              <motion.button
                key={filter.value}
                onClick={() => onFilterChange(filter.value)}
                className={`relative px-4 sm:px-5 py-2 rounded-full text-sm font-sans-sc whitespace-nowrap transition-all duration-200 border ${
                  activeFilter === filter.value
                    ? 'bg-star-gold/15 border-star-gold text-star-gold'
                    : 'bg-transparent border-moon-silver/30 text-moon-silver hover:border-moon-silver/60 hover:text-star-white'
                }`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05, duration: 0.3 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                {filter.label}
              </motion.button>
            ))}
          </div>

          {/* Right side: search + sort */}
          <div className="flex items-center gap-3 w-full lg:w-auto lg:ml-auto">
            {/* Search input */}
            <div className="relative flex-1 lg:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-gold" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="搜索牌名..."
                className="w-full bg-deep-blue/80 border border-star-gold/30 rounded-full pl-10 pr-10 py-2.5 text-sm text-star-white placeholder:text-moon-silver/50 font-sans-sc focus:outline-none focus:border-star-gold/70 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-moon-silver/50 hover:text-star-white transition-colors"
                >
                  <span className="text-xs">&#10005;</span>
                </button>
              )}
            </div>

            {/* Sort dropdown */}
            <div className="relative" ref={sortDropdownRef}>
              <button
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                className="flex items-center gap-2 px-4 py-2.5 bg-deep-blue/80 border border-star-gold/30 rounded-full text-sm text-moon-silver hover:border-star-gold/60 hover:text-star-white transition-colors"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span className="hidden sm:inline font-sans-sc">
                  {sortOptions.find((o) => o.value === sortBy)?.label}
                </span>
              </button>

              {showSortDropdown && (
                <motion.div
                  className="absolute right-0 top-full mt-2 bg-deep-blue border border-star-gold/30 rounded-xl shadow-xl overflow-hidden z-50 min-w-[140px]"
                  initial={{ opacity: 0, y: -5, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -5, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                >
                  {sortOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        onSortChange(option.value);
                        setShowSortDropdown(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm font-sans-sc transition-colors ${
                        sortBy === option.value
                          ? 'bg-star-gold/15 text-star-gold'
                          : 'text-moon-silver hover:bg-bright-indigo/30 hover:text-star-white'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* Result count */}
        <div className="mt-3 flex items-center justify-between">
          <p className="text-xs text-dark-gold font-sans-sc">
            共 <span className="text-star-gold">{resultCount}</span> 张牌
          </p>
        </div>
      </div>
    </motion.div>
  );
}
