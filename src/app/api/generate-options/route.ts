import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';
import { GirlfriendType, GenerateOptionsRequest, GenerateOptionsResponse, ReplyOption } from '@/types/girlfriend';

// 6种回复类型的详细说明
const REPLY_TYPES = [
  {
    id: 'humorous',
    name: '幽默型',
    description: '用幽默的方式缓解气氛',
    examples: ['开个轻松的玩笑逗她笑', '用自嘲的方式化解尴尬'],
    style: '轻松幽默，带点小聪明',
    keywords: ['哈哈', '嘿嘿', '逗你', '开玩笑']
  },
  {
    id: 'funny',
    name: '搞笑型',
    description: '用搞笑的方式逗她开心',
    examples: ['夸张的表情或动作描述', '有趣的比喻或拟人化'],
    style: '夸张搞笑，让人忍俊不禁',
    keywords: ['哈哈大笑', '搞笑', '逗趣']
  },
  {
    id: 'apology',
    name: '道歉型',
    description: '真诚道歉并承认错误',
    examples: ['直接承认错误', '表达愧疚和歉意'],
    style: '诚恳认真，承担责任',
    keywords: ['对不起', '抱歉', '错了', '不该']
  },
  {
    id: 'romantic',
    name: '浪漫型',
    description: '用浪漫的方式表达爱意',
    examples: ['甜蜜的话语', '温柔的称呼'],
    style: '浪漫温馨，充满爱意',
    keywords: ['宝贝', '亲爱的', '喜欢', '爱', '甜蜜']
  },
  {
    id: 'sincere',
    name: '真诚型',
    description: '真诚地表达理解和关心',
    examples: ['表达理解她的感受', '主动提出解决方案'],
    style: '真诚实在，理性分析',
    keywords: ['理解', '心疼', '委屈', '补偿']
  },
  {
    id: 'explanation',
    name: '解释型',
    description: '耐心解释情况并安抚',
    examples: ['解释事情的原委', '安抚她的情绪'],
    style: '耐心细致，以理服人',
    keywords: ['因为', '所以', '解释', '安抚']
  },
];

export async function POST(request: NextRequest) {
  try {
    const { girlfriendType, userMessage, moodValue, messageHistory, initialAngerScenario }: GenerateOptionsRequest = await request.json();

    if (!girlfriendType || !userMessage || moodValue === undefined) {
      return NextResponse.json(
        { error: '缺少必要参数' },
        { status: 400 }
      );
    }

    // 提取并转发请求头
    const customHeaders = HeaderUtils.extractForwardHeaders(request.headers);

    // 初始化 LLM 客户端
    const config = new Config();
    const client = new LLMClient(config, customHeaders);

    // 构建对话上下文
    const recentMessages = messageHistory.slice(-3);
    let contextSummary = '';

    if (recentMessages.length > 0) {
      contextSummary = '最近对话：\n';
      recentMessages.forEach((msg, idx) => {
        if (msg.role === 'user') {
          contextSummary += `  你：${msg.content}\n`;
        } else {
          // 提取女朋友的实际对话内容
          const actualDialogue = extractDialogueOnly(msg.content);
          contextSummary += `  她：${actualDialogue}\n`;
        }
      });
    }

    // 判断当前情绪状态
    let moodState = '平静';
    if (moodValue >= 80) moodState = '开心';
    else if (moodValue < 20) moodState = '生气';

    // 分析女朋友最近回复的情绪和含义
    const lastGirlfriendMessage = recentMessages.reverse().find(msg => msg.role === 'girlfriend');
    let girlEmotionAnalysis = '';
    if (lastGirlfriendMessage) {
      const dialogue = extractDialogueOnly(lastGirlfriendMessage.content);
      girlEmotionAnalysis = `女朋友刚才说："${dialogue}"\n`;
      girlEmotionAnalysis += `分析：她的话语中包含的情绪和含义，比如是否害羞、是否还在生气、是否开始软化等\n`;
    }

    // 构建系统提示词
    const systemPrompt = `你是一个恋爱沟通专家，专门帮助男朋友哄女朋友。

【背景信息】
女朋友类型：${girlfriendType.name}（${girlfriendType.personality}）
女朋友性格：${girlfriendType.introduction}

【当前状态】
- 情绪值：${moodValue}（${moodState}，-50愤怒，20平静，80开心）
- 生气原因：${initialAngerScenario}
${contextSummary}
${girlEmotionAnalysis}

【你的任务】
为男朋友生成6种不同类型的回复选项，帮助他哄好女朋友。

【6种回复类型的详细说明】

1. 幽默型（${REPLY_TYPES[0].style}）
   - ${REPLY_TYPES[0].description}
   - 示例：${REPLY_TYPES[0].examples.join('、')}
   - 关键词：${REPLY_TYPES[0].keywords.join('、')}
   - 要求：轻松有趣，用幽默化解紧张，但不能轻浮

2. 搞笑型（${REPLY_TYPES[1].style}）
   - ${REPLY_TYPES[1].description}
   - 示例：${REPLY_TYPES[1].examples.join('、')}
   - 关键词：${REPLY_TYPES[1].keywords.join('、')}
   - 要求：夸张逗趣，让人忍不住笑出声

3. 道歉型（${REPLY_TYPES[2].style}）
   - ${REPLY_TYPES[2].description}
   - 示例：${REPLY_TYPES[2].examples.join('、')}
   - 关键词：${REPLY_TYPES[2].keywords.join('、')}
   - 要求：诚恳直接，承认错误，不找借口

4. 浪漫型（${REPLY_TYPES[3].style}）
   - ${REPLY_TYPES[3].description}
   - 示例：${REPLY_TYPES[3].examples.join('、')}
   - 关键词：${REPLY_TYPES[3].keywords.join('、')}
   - 要求：甜蜜温馨，表达爱意和珍惜

5. 真诚型（${REPLY_TYPES[4].style}）
   - ${REPLY_TYPES[4].description}
   - 示例：${REPLY_TYPES[4].examples.join('、')}
   - 关键词：${REPLY_TYPES[4].keywords.join('、')}
   - 要求：实在理性，表达理解和提出解决方案

6. 解释型（${REPLY_TYPES[5].style}）
   - ${REPLY_TYPES[5].description}
   - 示例：${REPLY_TYPES[5].examples.join('、')}
   - 关键词：${REPLY_TYPES[5].keywords.join('、')}
   - 要求：耐心细致，解释原委并安抚情绪

【重要规则 - 必须遵守】

1. **理解上下文**：
   - 必须仔细分析女朋友刚才的回复内容
   - 根据她的话语含义、情绪、语气来生成对应的回复
   - 如果她脸红了、害羞了，回复要温柔体贴
   - 如果她还在生气，回复要诚恳耐心
   - 如果她开始软化，回复要抓住机会哄好她

2. **使用合适的称呼**：
   - 根据女朋友类型选择合适的称呼
   - 温柔型：宝贝、亲爱的、小可爱
   - 傲娇型：小笨蛋、傻瓜（带宠溺感）
   - 活泼型：亲爱的、宝贝
   - 冷艳型：亲爱的
   - 可爱型：宝贝、小可爱、小天使
   - 独立型：亲爱的
   - ❌ 禁止使用：小胖妞、胖子等不恰当的称呼

3. **回复要有针对性**：
   - 每种回复类型必须有明显区别，不能雷同
   - 回复必须针对女朋友刚才的具体回复进行回应
   - 如果提到某个具体话题（比如做饭、按摩），回复要呼应这个话题
   - 6种回复的内容必须完全不同

4. **符合性格特点**：
   - 温柔型：温柔体贴，说话轻声细语
   - 傲娇型：有点傲娇但心里在意
   - 活泼型：开朗直爽，热情积极
   - 冷艳型：理性独立，但内心温柔
   - 可爱型：撒娇依赖，需要宠溺
   - 独立型：成熟理性，注重效率

5. **回复长度**：20-50字，简短有力

6. **自然口语化**：不要书面语，要像真实对话

【示例】
如果女朋友说"脸一下子红了，别过脸去，坐在沙发靠垫上"（表示她害羞了）
- 幽默型："哎呀，我的小宝贝脸都红了，真可爱！"
- 搞笑型："哈哈，我也要脸红了，咱们一起红着吧！"
- 道歉型："对不起，让你害羞了，我以后温柔点"
- 浪漫型："宝贝害羞的样子真迷人，我想抱抱你"
- 真诚型："我知道你害羞，慢慢来，我会等你的"
- 解释型："其实我只是想逗你开心，没想到让你害羞了"

【输出格式】
严格按照以下JSON格式返回，不要有任何其他文字：
\`\`\`json
{
  "options": [
    { "type": "humorous", "content": "具体的幽默回复内容" },
    { "type": "funny", "content": "具体的搞笑回复内容" },
    { "type": "apology", "content": "具体的道歉回复内容" },
    { "type": "romantic", "content": "具体的浪漫回复内容" },
    { "type": "sincere", "content": "具体的真诚回复内容" },
    { "type": "explanation", "content": "具体的解释回复内容" }
  ]
}
\`\`\``;

    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: systemPrompt },
    ];

    // 调用 LLM 生成回复选项
    const response = await client.invoke(messages, {
      model: 'doubao-seed-1-8-251228',
      temperature: 0.9, // 提高温度，增加多样性
    });

    // 解析 JSON 响应
    let options: ReplyOption[] = [];

    try {
      // 提取JSON部分
      const jsonMatch = response.content.match(/```json\s*({[\s\S]*?})\s*```/) ||
                      response.content.match(/\{[\s\S]*\}/);

      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[1] || jsonMatch[0]);
        if (parsed.options && Array.isArray(parsed.options)) {
          options = parsed.options
            .map((opt: { type: string; content: string }, index: number) => {
              const typeInfo = REPLY_TYPES.find(t => t.id === opt.type);
              return {
                id: `${opt.type}_${index}_${Date.now()}`,
                type: typeInfo?.name || opt.type,
                content: opt.content,
              };
            })
            .filter((opt: { id: string; type: string; content: string }) => opt.content && opt.content.length > 8); // 过滤掉太短的回复
        }
      }
    } catch (error) {
      console.error('Failed to parse options JSON:', error);
      console.error('Response content:', response.content);
    }

    // 如果解析失败或选项不足，生成默认选项
    if (options.length < 6) {
      options = REPLY_TYPES.map((t, index) => ({
        id: `${t.id}_${index}_${Date.now()}`,
        type: t.name,
        content: `我是真心想哄你开心，别生气了好不好？`,
      }));
    }

    return NextResponse.json({ options } as GenerateOptionsResponse);
  } catch (error) {
    console.error('Generate options error:', error);
    return NextResponse.json({ error: '生成选项失败' }, { status: 500 });
  }
}

// 提取对话内容（过滤掉动作描述）
function extractDialogueOnly(content: string): string {
  // 移除括号内的状态描述
  let result = content.replace(/\([^)]*\)/g, '');

  // 移除常见的动作描述模式
  const actionPatterns = [
    /脸一下子红了/g,
    /别过脸去/g,
    /坐在沙发上/g,
    /坐在沙发靠垫上/g,
    /低下头/g,
    /抬起头/g,
    /点点头/g,
    /摇摇头/g,
    /叹了口气/g,
    /咬了咬嘴唇/g,
    /皱了皱眉头/g,
    /嘴角上扬/g,
    /脸埋进/g,
    /把脸埋进/g,
    /靠在/g,
    /蜷在/g,
  ];

  actionPatterns.forEach(pattern => {
    result = result.replace(pattern, '');
  });

  return result.trim();
}
