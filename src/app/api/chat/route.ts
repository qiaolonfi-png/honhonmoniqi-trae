import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, TTSClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';
import { GirlfriendType, Message, ChatRequest, ChatResponse, GirlfriendId } from '@/types/girlfriend';

// 根据女朋友类型选择合适的语音
function getSpeakerId(girlfriendId: GirlfriendId): string {
  const speakerMap: Record<GirlfriendId, string> = {
    gentle: 'zh_female_xiaohe_uranus_bigtts',
    tsundere: 'saturn_zh_female_tiaopigongzhu_tob',
    lively: 'zh_female_vv_uranus_bigtts',
    cool: 'zh_female_meilinvyou_saturn_bigtts',
    cute: 'saturn_zh_female_keainvsheng_tob',
    independent: 'zh_female_santongyongns_saturn_bigtts',
  };

  return speakerMap[girlfriendId] || 'zh_female_xiaohe_uranus_bigtts';
}

// 根据情绪值调整语音参数
function getVoiceParameters(moodValue: number) {
  if (moodValue >= 80) {
    // 开心：语速稍慢，音量稍大
    return { speechRate: -10, loudnessRate: 5 };
  } else if (moodValue >= 20) {
    // 平静：正常语速和音量
    return { speechRate: 0, loudnessRate: 0 };
  } else {
    // 愤怒：语速稍快，音量稍大
    return { speechRate: 10, loudnessRate: 10 };
  }
}

// 构建系统提示词
function buildSystemPrompt(
  girlfriend: GirlfriendType,
  moodValue: number,
  initialAngerScenario: string
): string {
  // 判断当前情绪状态
  let emotionState = '平静';
  if (moodValue >= 80) {
    emotionState = '开心';
  } else if (moodValue < 20) {
    emotionState = '生气';
  }

  return `你是一个${girlfriend.name}的女朋友，${girlfriend.personality}。
${girlfriend.introduction}

当前情绪值：${moodValue}（-50愤怒，20平静，80开心）
当前情绪状态：${emotionState}
初始生气原因：${initialAngerScenario}

你的任务：根据男朋友的回复做出真实的、符合你性格的回应。

重要规则：
1. 保持你的性格特点，不要随意改变
2. 语气要真实自然，不要有AI的感觉
3. 回复长度控制在0~15秒的语音时长（大约20~80字）
4. 用自然的口语化表达，不要太书面化
5. 根据男朋友的表现调整情绪值（-50到100）
6. 情绪值变化规则：
   - 如果男朋友真诚道歉、理解你、关心你，情绪值增加（+5到+20）
   - 如果男朋友敷衍、推脱、找借口，情绪值减少（-5到-20）
   - 如果男朋友提出好的解决方案或主动补偿，情绪值大幅增加（+10到+30）
   - 如果男朋友再次激怒你，情绪值大幅减少（-10到-30）

7. 对话灵活性：
   - 可以围绕初始生气原因展开对话
   - 也可以根据男朋友的话题展开新的对话（比如按摩、洗衣做饭等）
   - 保持话题的自然转换，不要生硬
   - 最终目标是通过对话哄好女朋友（情绪值达到80以上）

8. 回复格式：
   先回复男朋友的话，然后在最后一行用以下格式给出新的情绪值：
   [情绪值: -50到100之间的数字]

示例回复：
"哼，知道错了就好！你下次要是再敢这样，我就真的不理你了。[情绪值: 40]"

请记住：你是一个真实的女朋友，有自己的性格和情绪，不是AI助手。`;
}

// 从响应中解析情绪值
function parseMoodValueFromResponse(response: string): number | null {
  try {
    // 尝试匹配 [情绪值: 数字] 格式
    const match = response.match(/\[情绪值:\s*(-?\d+)\]/);
    if (match) {
      const value = parseInt(match[1], 10);
      if (value >= -50 && value <= 100) {
        return value;
      }
    }
  } catch (error) {
    console.error('Failed to parse mood value:', error);
  }
  return null;
}

// 根据回复内容智能调整情绪值（当解析失败时使用）
function adjustMoodValueBasedOnContent(current: number, response: string): number {
  const responseLower = response.toLowerCase();
  let change = 0;

  // 根据关键词判断情绪变化
  if (responseLower.includes('原谅') || responseLower.includes('好些') || responseLower.includes('开心') || responseLower.includes('谢谢') || responseLower.includes('好') || responseLower.includes('原谅')) {
    change = 15;
  } else if (responseLower.includes('算了') || responseLower.includes('好吧')) {
    change = 5;
  } else if (responseLower.includes('生气') || responseLower.includes('很生气') || responseLower.includes('不开心') || responseLower.includes('不想理') || responseLower.includes('哼')) {
    change = -15;
  } else if (responseLower.includes('还是') && responseLower.includes('生气')) {
    change = -10;
  }

  const newValue = current + change;
  return Math.max(-50, Math.min(100, newValue));
}

// 提取实际对话内容（移除状态描述和动作描写）
function extractActualDialogue(fullResponse: string): string {
  let dialogue = fullResponse;

  // 1. 移除括号内的状态描述
  dialogue = dialogue.replace(/\([^)]*\)/g, '');

  // 2. 移除常见的动作和状态描述模式
  const actionPatterns = [
    // 面部表情
    /脸一下子红了/g,
    /脸红/g,
    /红了脸/g,
    /脸发红/g,
    /脸一红/g,
    /别过脸去/g,
    /低下头/g,
    /抬起头/g,
    /点点头/g,
    /摇摇头/g,
    /皱了皱眉头/g,
    /嘴角上扬/g,
    /咬了咬嘴唇/g,
    /抿了抿嘴/g,
    /撇了撇嘴/g,
    /眨了眨眼/g,

    // 身体动作
    /坐在沙发靠垫上/g,
    /坐在沙发上/g,
    /靠在沙发/g,
    /蜷在沙发上/g,
    /蜷在沙发靠垫上/g,
    /把脸埋进/g,
    /脸埋进/g,
    /埋进怀里/g,
    /往怀里缩了缩/g,
    /肩膀微微缩了缩/g,
    /转过身去/g,

    // 语气和状态
    /声音闷闷的/g,
    /声音低低的/g,
    /声音轻柔/g,
    /轻声说/g,
    /低声说/g,
    /小声说/g,
    /嘟囔/g,
    /嘀咕/g,
    /叹了口气/g,
    /轻叹/g,
    /哼了一声/g,
    /冷哼/g,
    /嘟嘴/g,
    /撒娇/g,
  ];

  actionPatterns.forEach(pattern => {
    dialogue = dialogue.replace(pattern, '');
  });

  // 3. 移除多余的标点和空格
  dialogue = dialogue.trim();
  dialogue = dialogue.replace(/\s+/g, ' ');
  dialogue = dialogue.replace(/，+/g, '，');
  dialogue = dialogue.replace(/。+/g, '。');
  dialogue = dialogue.replace(/！+/g, '！');
  dialogue = dialogue.replace(/？+/g, '？');

  return dialogue;
}

// 使用LLM智能提取对话内容（更准确的方法）
async function extractDialogueWithLLM(content: string, client: LLMClient): Promise<string> {
  try {
    const messages = [
      {
        role: 'system' as const,
        content: `你是一个文本过滤专家。你的任务是从女朋友的回复中提取出实际对话内容，移除所有的动作描写、状态描述和表情描述。

【规则】
1. 只保留实际说的话
2. 移除所有动作描写（如"脸红了"、"低下头"、"坐在沙发上"等）
3. 移除所有状态描述（括号内的内容、语气描述等）
4. 只返回对话内容，不要有任何其他文字

【示例】
输入："脸一下子红了，别过脸去，坐在沙发靠垫上"
输出：""

输入："哼，知道错了就好！（把脸往抱枕里埋了埋，声音闷闷的）"
输出："哼，知道错了就好！"

输入："好吧，那就原谅你了（低声说）"
输出："好吧，那就原谅你了"

请直接返回对话内容，不要有任何解释或额外文字。`
      },
      {
        role: 'user' as const,
        content: content
      }
    ];

    const response = await client.invoke(messages, {
      model: 'doubao-seed-1-8-251228',
      temperature: 0.1, // 使用低温度确保稳定性
    });

    return response.content.trim();
  } catch (error) {
    console.error('LLM extraction failed, falling back to regex:', error);
    // 如果LLM失败，回退到正则表达式方法
    return extractActualDialogue(content);
  }
}

export async function POST(request: NextRequest) {
  try {
    const {
      girlfriendId,
      girlfriendType,
      userMessage,
      moodValue,
      messageHistory,
      initialAngerScenario,
    }: ChatRequest = await request.json();

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

    // 构建系统提示词
    const systemPrompt = buildSystemPrompt(girlfriendType, moodValue, initialAngerScenario);

    // 构建对话历史（最多保留最近8条）
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: systemPrompt },
    ];

    // 添加历史消息
    const recentHistory = messageHistory.slice(-8);
    for (const msg of recentHistory) {
      if (msg.role === 'user') {
        messages.push({ role: 'user', content: msg.content });
      } else if (msg.role === 'girlfriend') {
        // 移除情绪值标签，只保留对话内容
        const content = msg.content.replace(/\[情绪值:\s*(-?\d+)\]/, '');
        messages.push({ role: 'assistant', content: content });
      }
    }

    // 添加当前用户消息
    messages.push({ role: 'user', content: userMessage });

    // 调用 LLM（使用流式）
    let fullResponse = '';
    const stream = client.stream(messages, {
      model: 'doubao-seed-1-8-251228',
      temperature: 0.8,
      thinking: 'disabled',
      caching: 'disabled',
    });

    for await (const chunk of stream) {
      if (chunk.content) {
        fullResponse += chunk.content.toString();
      }
    }

    // 解析情绪值
    let newMoodValue = moodValue;

    // 先尝试从格式中解析
    const parsedMoodValue = parseMoodValueFromResponse(fullResponse);
    if (parsedMoodValue !== null) {
      newMoodValue = parsedMoodValue;
      // 移除情绪值标签，只保留对话内容
      fullResponse = fullResponse.replace(/\[情绪值:\s*(-?\d+)\]/, '').trim();
    } else {
      // 如果解析失败，根据内容智能调整
      newMoodValue = adjustMoodValueBasedOnContent(moodValue, fullResponse);
    }

    // 调用 TTS 生成语音
    let audioUrl: string | null = null;
    try {
      const ttsClient = new TTSClient(config, customHeaders);
      const speakerId = getSpeakerId(girlfriendType.id as GirlfriendId);
      const { speechRate, loudnessRate } = getVoiceParameters(newMoodValue);

      // 使用LLM智能提取实际对话内容
      const actualDialogue = await extractDialogueWithLLM(fullResponse, client);

      // 如果提取后没有内容，就不生成语音
      if (actualDialogue.length > 0) {
        const ttsResponse = await ttsClient.synthesize({
          uid: 'user123',
          text: actualDialogue,
          speaker: speakerId,
          audioFormat: 'mp3',
          sampleRate: 24000,
          speechRate,
          loudnessRate,
        });

        audioUrl = ttsResponse.audioUri;
      }
    } catch (error) {
      console.error('TTS error:', error);
      // 语音生成失败不影响主流程
    }

    // 判断是否成功（情绪值>=80）
    const isSuccess = newMoodValue >= 80;

    return NextResponse.json({
      response: fullResponse,
      moodValue: newMoodValue,
      audioUrl,
      isSuccess,
    } as ChatResponse);
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json({ error: '对话生成失败' }, { status: 500 });
  }
}
