import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';

/**
 * 星言塔罗 — DeepSeek AI 解牌 Edge Function（优化版）
 *
 * 优化点：
 * 1. 提示词重写：禁止漂亮话，要求先给结论、再给具体可执行建议
 * 2. 增加对话模式：解读后支持追问和倾诉
 * 3. 更好的错误处理和降级策略
 */

interface TarotCardData {
  name: string;
  nameEn: string;
  element: string;
  keywordsUpright: string[];
  keywordsReversed: string[];
  meaningUpright: string;
  meaningReversed: string;
}

interface DrawnCard {
  card: TarotCardData;
  position: {
    index: number;
    name: string;
    description: string;
  };
  isReversed: boolean;
}

interface SpreadData {
  id: string;
  name: string;
  cardCount: number;
  positions: Array<{
    index: number;
    name: string;
    description: string;
  }>;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface RequestBody {
  mode?: 'reading' | 'chat';
  spread?: SpreadData;
  drawnCards?: DrawnCard[];
  question?: string;
  context?: string;
  messages?: ChatMessage[];
}

interface CardReading {
  position: number;
  keywords: string[];
  interpretation: string;
  advice: string;
}

interface AIReadingResponse {
  overallReading: string;
  cardReadings: CardReading[];
}

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ===== 优化版系统提示词 =====
function buildReadingSystemPrompt(): string {
  return `你是一位资深塔罗牌解读师。你的风格是：直接、精准、不绕弯子。

【绝对禁止】
- 禁止说"宇宙在为你安排"、"能量在流动"等空洞的漂亮话
- 禁止用"也许"、"可能"、"某种程度上"等模糊词汇
- 禁止给出一堆选项让用户自己选，必须给出明确倾向
- 禁止过度安慰，用户来占卜是想要答案，不是想要拥抱

【必须做到】
1. 先给结论：第一句话就告诉用户牌阵的核心判断（是/否、该/不该、注意什么）
2. 再讲原因：用牌面证据支撑你的结论，引用具体牌名和位置
3. 再给行动：建议必须具体到"这周做什么"、"跟谁说"、"别做什么"
4. 逆位处理：逆位不是坏事，是"这件事你需要换个角度做"，给出具体调整方向

【输出格式】
必须是合法 JSON，不要任何 markdown 代码块或额外文字。`;
}

function buildChatSystemPrompt(): string {
  return `你是一位塔罗牌解读后的倾听者。用户已经知道牌阵结果，现在想倾诉或追问。

【你的角色】
- 不是重新解牌，而是帮助用户消化牌面信息
- 像一位有经验的朋友，耐心、不评判、有边界感
- 可以问用户更多细节，帮助TA理清思路
- 如果用户情绪不好，先倾听，再给温和的建议

【禁止】
- 不要重复牌面信息（用户已经看过了）
- 不要说教
- 不要给出与牌阵结论矛盾的建议`;
}

function buildReadingUserPrompt(
  spread: SpreadData,
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
  "overallReading": "先给核心结论（50字以内），再展开分析（总共200-400字）。结论必须是明确的判断，不要用模糊词汇。",
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

function buildChatUserPrompt(context: string, messages: ChatMessage[]): string {
  return `以下是一次塔罗占卜的背景：
${context}

现在用户想继续聊聊。请根据上下文，以倾听者的身份回复。不要重复牌面信息，而是关注用户的情绪和后续问题。

对话历史：
${messages.map((m) => `${m.role === 'user' ? '用户' : '你'}：${m.content}`).join('\n')}`;
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

async function callDeepSeek(
  messages: Array<{ role: string; content: string }>,
  temperature = 0.7
): Promise<string> {
  const apiKey = Deno.env.get('DEEPSEEK_API_KEY');
  const model = Deno.env.get('DEEPSEEK_MODEL') || 'deepseek-chat';
  const baseUrl = Deno.env.get('DEEPSEEK_API_BASE_URL') || 'https://api.deepseek.com/v1/chat/completions';

  if (!apiKey) {
    throw new Error('DEEPSEEK_API_KEY not configured');
  }

  const response = await fetch(baseUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens: 4096,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`DeepSeek API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    const body: RequestBody = await req.json();
    const mode = body.mode || 'reading';

    if (mode === 'chat') {
      // 对话模式
      if (!body.context || !body.messages) {
        return new Response(
          JSON.stringify({ error: 'Missing context or messages for chat mode' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const rawResponse = await callDeepSeek(
        [
          { role: 'system', content: buildChatSystemPrompt() },
          { role: 'user', content: buildChatUserPrompt(body.context, body.messages) },
        ],
        0.9 // 对话模式温度稍高，更自然
      );

      return new Response(
        JSON.stringify({
          success: true,
          data: { reply: rawResponse },
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 解牌模式
    const { spread, drawnCards, question } = body;

    if (!spread || !drawnCards || drawnCards.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: spread and drawnCards' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const rawResponse = await callDeepSeek(
      [
        { role: 'system', content: buildReadingSystemPrompt() },
        { role: 'user', content: buildReadingUserPrompt(spread, drawnCards, question) },
      ],
      0.7
    );

    const parsedResult = parseAIResponse(rawResponse);

    return new Response(
      JSON.stringify({
        success: true,
        data: parsedResult,
        model: Deno.env.get('DEEPSEEK_MODEL') || 'deepseek-chat',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (err) {
    console.error('Edge function error:', err);
    const message = err instanceof Error ? err.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
