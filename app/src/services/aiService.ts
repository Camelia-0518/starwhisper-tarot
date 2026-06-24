import type { DrawnCard, AIReadingResponse, CardReading } from '@/store/readingStore';
import type { CardSpread } from '@/types/tarot';
import { supabase } from '@/lib/supabase';

/**
 * 星言塔罗 — AI 解牌服务
 *
 * 调用策略：
 * 1. Supabase 已配置 → 走 Supabase Edge Function（生产环境）
 * 2. Supabase 未配置但 DeepSeek Key 存在 → 前端直连 DeepSeek（本地开发）
 * 3. 否则 → 模拟解读（降级）
 */

export interface FixedAIConfig {
  providerName: string;
  baseUrl: string;
  model: string;
  configured: boolean;
}

export function getAIConfig(): FixedAIConfig {
  const hasSupabase = Boolean(
    import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
  );
  const hasDeepseek = Boolean(import.meta.env.VITE_DEEPSEEK_API_KEY);
  const model = import.meta.env.VITE_DEEPSEEK_MODEL || 'deepseek-chat';

  return {
    providerName: hasSupabase ? 'DeepSeek (云端)' : hasDeepseek ? 'DeepSeek (本地)' : 'DeepSeek',
    baseUrl: import.meta.env.VITE_DEEPSEEK_API_BASE_URL || 'https://api.deepseek.com/v1/chat/completions',
    model,
    configured: hasSupabase || hasDeepseek,
  };
}

export function isAIConfigured(): boolean {
  return getAIConfig().configured;
}

// ===== 提示词构建 =====

function buildSystemPrompt(): string {
  return `你是一位资深塔罗牌解读师。你的风格是：直接、精准、不绕弯子。

【绝对禁止】
- 禁止说"宇宙在为你安排"等空洞的漂亮话
- 禁止用"也许"、"可能"等模糊词汇
- 禁止给出一堆选项让用户自己选，必须给出明确倾向
- 禁止过度安慰

【必须做到】
1. 先给结论：第一句话就告诉用户牌阵的核心判断（是/否、该/不该、注意什么）
2. 再讲原因：用牌面证据支撑你的结论，引用具体牌名和位置
3. 再给行动：建议必须具体到"这周做什么"、"跟谁说"、"别做什么"
4. 逆位处理：逆位不是坏事，是"这件事你需要换个角度做"，给出具体调整方向

【输出格式】
必须是合法 JSON，不要任何 markdown 代码块或额外文字。`;
}

function buildUserPrompt(
  spread: CardSpread,
  drawnCards: DrawnCard[],
  question?: string
): string {
  const questionText = question
    ? `求问者的问题：${question}`
    : '求问者没有输入具体问题，请做一次整体运势解读。';

  const cardsInfo = drawnCards
    .map((dc, idx) => {
      const position = spread.positions[idx];
      const orientation = dc.isReversed ? '逆位' : '正位';
      const keywords = dc.isReversed
        ? dc.card.keywordsReversed.join('、')
        : dc.card.keywordsUpright.join('、');
      const meaning = dc.isReversed
        ? dc.card.meaningReversed
        : dc.card.meaningUpright;

      return `第${idx + 1}张牌 - ${position?.name || '未知位置'}
- 牌名：${dc.card.name}（${dc.card.nameEn}）
- 方向：${orientation}
- 元素：${dc.card.element}
- 关键词：${keywords}
- 牌义：${meaning}
- 位置含义：${position?.description || ''}`;
    })
    .join('\n\n');

  return `${questionText}

牌阵类型：${spread.name}（${spread.cardCount}张牌）

抽出的牌：
${cardsInfo}

请按以下 JSON 格式返回，不要输出任何 JSON 之外的文本：
{
  "overallReading": "先给核心结论（50字以内），再展开分析（总共200-400字）。结论必须是明确的判断。",
  "cardReadings": [
    {
      "position": 0,
      "keywords": ["关键词1", "关键词2", "关键词3"],
      "interpretation": "100-200字，结合位置和牌义，给出具体判断",
      "advice": "80-150字，具体可执行的建议，包含'做什么'和'不做什么'"
    }
  ]
}`;
}

function parseAIResponse(rawText: string): AIReadingResponse {
  let jsonText = rawText.trim();

  const codeBlockMatch = jsonText.match(/```(?:json)?\s*\n?([\s\S]*?)```/);
  if (codeBlockMatch) {
    jsonText = codeBlockMatch[1].trim();
  }

  const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    jsonText = jsonMatch[0];
  }

  try {
    const parsed = JSON.parse(jsonText);

    const cardReadings: CardReading[] = (parsed.cardReadings || []).map(
      (cr: CardReading) => ({
        position: cr.position ?? 0,
        keywords: cr.keywords || [],
        interpretation: cr.interpretation || '暂无解读',
        advice: cr.advice || '保持开放的心态，相信直觉给你的提醒。',
      })
    );

    return {
      overallReading:
        parsed.overallReading || '牌阵已经传来讯息，请在安静中感受它的方向。',
      cardReadings,
    };
  } catch {
    return {
      overallReading: rawText.slice(0, 800) || '星光仍在沉淀答案，请稍后再试。',
      cardReadings: [],
    };
  }
}

// ===== 本地直连 DeepSeek =====

async function generateLocalAIReading(
  spread: CardSpread,
  drawnCards: DrawnCard[],
  question: string
): Promise<AIReadingResponse> {
  const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY;
  const model = import.meta.env.VITE_DEEPSEEK_MODEL || 'deepseek-chat';
  const baseUrl =
    import.meta.env.VITE_DEEPSEEK_API_BASE_URL || 'https://api.deepseek.com/v1/chat/completions';

  if (!apiKey) {
    throw new Error('未配置 DeepSeek API Key');
  }

  const systemPrompt = buildSystemPrompt();
  const userPrompt = buildUserPrompt(spread, drawnCards, question);

  const response = await fetch(baseUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.8,
      max_tokens: 4096,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`DeepSeek API error: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  const rawContent = data.choices?.[0]?.message?.content || '';
  return parseAIResponse(rawContent);
}

// ===== Supabase Edge Function =====

interface EdgeFunctionPayload {
  spread: { id: string; name: string; cardCount: number; positions: any[] };
  drawnCards: any[];
  question?: string;
}

interface EdgeFunctionResponse {
  success: boolean;
  data: AIReadingResponse;
  model: string;
  error?: string;
}

async function generateCloudAIReading(
  spread: CardSpread,
  drawnCards: DrawnCard[],
  question: string
): Promise<AIReadingResponse> {
  const payload: EdgeFunctionPayload = {
    spread: {
      id: spread.id,
      name: spread.name,
      cardCount: spread.cardCount,
      positions: spread.positions,
    },
    drawnCards: drawnCards.map((dc) => ({
      card: {
        name: dc.card.name,
        nameEn: dc.card.nameEn,
        element: dc.card.element,
        keywordsUpright: dc.card.keywordsUpright,
        keywordsReversed: dc.card.keywordsReversed,
        meaningUpright: dc.card.meaningUpright,
        meaningReversed: dc.card.meaningReversed,
      },
      position: {
        index: dc.position.index,
        name: dc.position.name,
        description: dc.position.description,
      },
      isReversed: dc.isReversed,
    })),
    question: question || undefined,
  };

  const { data, error } = await supabase.functions.invoke<EdgeFunctionResponse>(
    'tarot-reading',
    { body: payload }
  );

  if (error) {
    throw new Error(`Edge Function: ${error.message}`);
  }

  if (!data?.success || !data.data) {
    throw new Error(data?.error || '云端解牌返回数据异常');
  }

  return data.data;
}

// ===== 主入口 =====

export async function generateRealAIReading(
  spread: CardSpread,
  drawnCards: DrawnCard[],
  question: string
): Promise<AIReadingResponse> {
  const hasSupabase = Boolean(
    import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
  );
  const hasDeepseek = Boolean(import.meta.env.VITE_DEEPSEEK_API_KEY);

  if (hasSupabase) {
    return generateCloudAIReading(spread, drawnCards, question);
  }

  if (hasDeepseek) {
    return generateLocalAIReading(spread, drawnCards, question);
  }

  throw new Error('未配置 AI 服务（请配置 Supabase 或 DeepSeek API Key）');
}

// ===== 模拟 AI 解读（降级方案） =====

export function generateSimulatedAIReading(
  spread: CardSpread,
  drawnCards: DrawnCard[],
  question: string
): AIReadingResponse {
  let overallReading = '';

  if (question) {
    overallReading = `关于「${question}」，牌阵已经显露出一条清晰的情绪与行动线索。`;
  } else {
    overallReading = '宇宙正通过这组牌阵，为你呈现此刻最值得看见的能量主题。';
  }

  const majorArcanaCount = drawnCards.filter((dc) => dc.card.arcana === 'major').length;
  const reversedCount = drawnCards.filter((dc) => dc.isReversed).length;

  if (majorArcanaCount >= drawnCards.length / 2) {
    overallReading +=
      ' 这次大阿尔卡纳占比较高，意味着你正处在一个更深层的人生课题之中，变化不是偶然，而是阶段性的召唤。';
  } else {
    overallReading +=
      ' 这次小阿尔卡纳较多，说明当前重点仍落在日常关系、现实抉择与具体执行层面。';
  }

  if (reversedCount === 0) {
    overallReading += ' 所有牌皆为正位，能量流动顺畅，适合主动推进。';
  } else if (reversedCount >= drawnCards.length / 2) {
    overallReading += ' 逆位较多，提示你需要先整理内在阻滞，再决定外在动作。';
  } else {
    overallReading += ' 正逆位交织，代表机会与挑战并存，关键在于节奏与取舍。';
  }

  if (spread.id === 'single') {
    overallReading += ` 单张牌${drawnCards[0]?.card.name}像一束聚焦的光，直指你此刻最核心的提醒。`;
  } else if (spread.id === 'three-card') {
    overallReading += ' 三张牌串联出从过去到现在再到未来的演变，让局势的脉络更加清晰。';
  } else if (spread.id === 'celtic-cross') {
    overallReading += ' 凯尔特十字会把表层现状、深层动机和外部环境一并展开，适合处理复杂问题。';
  }

  const cardReadings: CardReading[] = drawnCards.map((dc, idx) => {
    const keywords = dc.isReversed
      ? dc.card.keywordsReversed.slice(0, 3)
      : dc.card.keywordsUpright.slice(0, 3);

    const interpretation = dc.isReversed
      ? `${dc.card.name}逆位落在「${dc.position.name}」，说明这里的能量更偏向内在拉扯或尚未理顺的课题。它提醒你关注 ${dc.card.meaningReversed.slice(0, 56)}。`
      : `${dc.card.name}正位落在「${dc.position.name}」，代表这一位置拥有较清晰的外显力量，与你当前的 ${dc.card.meaningUpright.slice(0, 56)} 有很强呼应。`;

    const advice = dc.isReversed
      ? `在「${dc.position.name}」这一面向，先别急着求快。试着面对「${dc.card.keywordsReversed[0]}」背后的真实原因，给自己一点调整与沉淀空间。`
      : `在「${dc.position.name}」这一面向，可以主动借力「${dc.card.keywordsUpright[0]}」的能量，把灵感转成具体行动。`;

    return {
      position: idx,
      keywords,
      interpretation,
      advice,
    };
  });

  return {
    overallReading,
    cardReadings,
  };
}
