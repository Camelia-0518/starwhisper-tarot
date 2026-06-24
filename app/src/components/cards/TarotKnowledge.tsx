import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Flame, Droplets, Wind, Mountain, Sparkles } from 'lucide-react';

interface KnowledgeItem {
  id: string;
  title: string;
  subtitle: string;
  content: string;
  icon: typeof Sparkles;
  iconColor: string;
}

const knowledgeItems: KnowledgeItem[] = [
  {
    id: 'what-is-tarot',
    title: '什么是塔罗',
    subtitle: '七十八张牌中的宇宙智慧',
    content:
      '塔罗牌是一套包含78张牌的占卜工具，起源于15世纪的欧洲，历经数百年的演变与传承。塔罗不仅是占卜的工具，更是一面映照内心的镜子。每张牌都蕴含着丰富的象征符号、神话原型与哲学智慧，通过牌阵的排列组合，帮助我们洞察问题的本质，获得超越日常思维的视角与启发。',
    icon: Sparkles,
    iconColor: '#C9A84C',
  },
  {
    id: 'major-minor',
    title: '大阿尔卡纳与小阿尔卡纳',
    subtitle: '灵魂旅程与日常镜像',
    content:
      '大阿尔卡纳（Major Arcana）共22张，编号从0号"愚者"到21号"世界"，描绘了一段完整的灵魂进化之旅。每张牌代表人生中的重要课题与转折点。小阿尔卡纳（Minor Arcana）共56张，分为权杖、圣杯、宝剑、星币四组花色，每组14张（数字牌1-10与宫廷牌侍从、骑士、王后、国王），映射日常生活中的具体事件、情感与挑战。大小阿尔卡纳相互补充，共同构成完整的塔罗体系。',
    icon: Mountain,
    iconColor: '#6B4EE6',
  },
  {
    id: 'four-elements',
    title: '四元素与四牌组',
    subtitle: '火、水、风、土的塔罗之舞',
    content:
      '塔罗小阿尔卡纳的四组花色对应西方神秘学中的四大元素。权杖（Wands）属火，代表意志、行动、创造力与生命热情；圣杯（Cups）属水，象征情感、直觉、人际关系与内在世界；宝剑（Swords）属风，代表思想、理智、沟通与挑战；星币（Pentacles）属土，象征物质、财富、身体与现实成就。四大元素在塔罗中相互交织，共同描绘出生命的全貌。',
    icon: Flame,
    iconColor: '#D44040',
  },
];

const elementDetails = [
  {
    name: '火',
    suit: '权杖',
    color: '#D44040',
    icon: Flame,
    description: '意志与行动',
  },
  {
    name: '水',
    suit: '圣杯',
    color: '#3A6B8B',
    icon: Droplets,
    description: '情感与直觉',
  },
  {
    name: '风',
    suit: '宝剑',
    color: '#6B8B6B',
    icon: Wind,
    description: '思想与沟通',
  },
  {
    name: '土',
    suit: '星币',
    color: '#8B7A3A',
    icon: Mountain,
    description: '物质与现实',
  },
];

function AccordionItem({
  item,
  isOpen,
  onToggle,
  index,
}: {
  item: KnowledgeItem;
  isOpen: boolean;
  onToggle: () => void;
  index: number;
}) {
  const Icon = item.icon;

  return (
    <motion.div
      className="border border-star-gold/15 rounded-xl overflow-hidden bg-deep-blue/40"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-5 sm:p-6 text-left hover:bg-bright-indigo/10 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${item.iconColor}15` }}
          >
            <Icon className="w-5 h-5" style={{ color: item.iconColor }} />
          </div>
          <div>
            <h3 className="font-serif-sc text-base sm:text-lg font-semibold text-star-white">
              {item.title}
            </h3>
            <p className="text-xs text-dark-gold font-sans-sc mt-0.5">
              {item.subtitle}
            </p>
          </div>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown className="w-5 h-5 text-moon-silver" />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              height: { duration: 0.3, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] },
              opacity: { duration: 0.2, delay: isOpen ? 0.1 : 0 },
            }}
          >
            <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-0">
              <p className="text-sm text-moon-silver leading-relaxed font-sans-sc pl-14">
                {item.content}
              </p>

              {/* Show element details for the four elements section */}
              {item.id === 'four-elements' && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pl-14">
                  {elementDetails.map((el) => {
                    const ElIcon = el.icon;
                    return (
                      <div
                        key={el.name}
                        className="flex flex-col items-center p-3 rounded-lg border border-star-gold/10 bg-deep-night/50"
                      >
                        <ElIcon
                          className="w-5 h-5 mb-1"
                          style={{ color: el.color }}
                        />
                        <span
                          className="font-serif-sc text-sm font-semibold"
                          style={{ color: el.color }}
                        >
                          {el.name}
                        </span>
                        <span className="text-[10px] text-dark-gold font-sans-sc">
                          {el.suit}
                        </span>
                        <span className="text-[10px] text-moon-silver/60 font-sans-sc mt-0.5">
                          {el.description}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function TarotKnowledge() {
  const [openItem, setOpenItem] = useState<string | null>('what-is-tarot');

  const handleToggle = (id: string) => {
    setOpenItem((prev) => (prev === id ? null : id));
  };

  return (
    <section
      className="relative py-16 md:py-24"
      style={{
        background:
          'linear-gradient(180deg, transparent, rgba(18,18,43,0.5))',
      }}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section title */}
        <motion.div
          className="text-center mb-10"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="font-serif-sc text-2xl md:text-4xl font-bold text-star-white mb-3">
            关于塔罗
          </h2>
          <div className="w-16 h-px bg-gradient-to-r from-transparent via-star-gold to-transparent mx-auto" />
        </motion.div>

        {/* Accordion */}
        <div className="flex flex-col gap-4">
          {knowledgeItems.map((item, index) => (
            <AccordionItem
              key={item.id}
              item={item}
              isOpen={openItem === item.id}
              onToggle={() => handleToggle(item.id)}
              index={index}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
