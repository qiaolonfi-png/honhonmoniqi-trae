import { NextRequest, NextResponse } from 'next/server';
import { LLMClient, Config, HeaderUtils } from 'coze-coding-dev-sdk';
import { GirlfriendType, GenerateScenarioRequest, GenerateScenarioResponse, GirlfriendId } from '@/types/girlfriend';

// 6种女朋友类型的不同生气场景模板
const scenarioTemplates: Record<GirlfriendId, string[]> = {
  gentle: [
    "你答应陪我一起看我最喜欢的电影，结果临时因为和朋友去打游戏就取消了，而且没有提前告诉我。",
    "我们约定好的纪念日，你完全忘记了，我特意准备了一切，等你到深夜。",
    "我生病了很难受，想让你陪我去医院，你却说'多喝热水就行，忙完再说'。",
    "我给你发消息想分享一件有趣的事，你只回了'哦'两个字就没有下文了。",
    "我们约定一起做饭，结果你自己先吃了，完全没有等我。",
    "我说想和你一起散步聊天，你却一直低头玩手机，都不看我。",
  ],
  tsundere: [
    "我给你发了好几条消息，你竟然一条都不回，你是不是故意气我！",
    "我说想喝奶茶，你竟然说'你自己去买不就行了'，一点都不体贴！",
    "我故意发脾气想让你哄我，结果你竟然真的生气了，笨蛋！",
    "我给你做了饭，你竟然说'味道一般般'，气死我了！",
    "我说今天想和你一起出去玩，你却说'太累了不想动'，一点都不主动！",
    "我给你分享了最喜欢的歌，你竟然说'还行吧'，一点都不懂我！",
  ],
  lively: [
    "我们去朋友聚会，你全程只顾着玩手机，都不和大家聊天，让我觉得很尴尬。",
    "我说想一起参加party，你却说'太吵了不想去'，一点都不合群！",
    "我给你看我的新造型，你竟然说'和平时差不多'，一点都不惊喜！",
    "我们约好一起去游乐园，结果临时说有事要加班，放我鸽子！",
    "我给你表演才艺，你竟然在旁边玩手机，一点都不认真看！",
    "我说想一起拍短视频，你却说'太羞耻了'，一点都不配合！",
  ],
  cool: [
    "你答应帮我看的设计方案，随便看了一眼就说'挺好的'，没有认真对待我的作品。",
    "我们一起商定的周末约会时间，你临时说要加班但没有提前沟通。",
    "我给你准备了礼物，你收到后只是淡淡地说了声'谢谢'，没有表现出惊喜。",
    "我说想和你讨论未来的规划，你却说'以后再说吧'，一点都不积极。",
    "我们约定一起学习新技能，结果你自己学了却不愿意教我。",
    "我给你分享我的成就，你却说'这没什么了不起的'，一点都不鼓励我。",
  ],
  cute: [
    "我想让你陪我玩角色扮演游戏，你却说'太幼稚了'，一点都不配合！",
    "我特意给你做了爱心便当，你竟然说'下次别麻烦了'，一点都不感动！",
    "我想让你给我讲睡前故事，你却说'你自己看书去'，一点都不温柔！",
    "我给你看我的可爱照片，你竟然说'表情很傻'，一点都不夸我！",
    "我想让你陪我看动画片，你却说'这太幼稚了'，一点都不陪我！",
    "我给你撒娇要抱抱，你竟然躲开了，一点都不宠我！",
  ],
  independent: [
    "我们约定好的项目分工，你临时改变计划却没有和我商量。",
    "我给你发了重要的工作邮件，你竟然三天都没有回复，太不专业了。",
    "我们说好一起提升自己，结果你自己偷偷学习却不分享资源。",
    "我给你提出建议，你完全听不进去，一点都不尊重我的意见。",
    "我们约定好的会议时间，你迟到还找各种借口，浪费时间。",
    "我给你分享了职业发展机会，你却说'我不感兴趣'，一点都不上进。",
  ],
};

// 根据场景难度生成初始情绪值
function generateInitialMoodValue(difficulty: 'easy' | 'medium' | 'hard'): number {
  switch (difficulty) {
    case 'easy':
      return -10; // -10，比较容易哄
    case 'medium':
      return -30; // -30，中等难度
    case 'hard':
      return -50; // -50，最高难度
    default:
      return -30;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { girlfriendType }: GenerateScenarioRequest = await request.json();

    if (!girlfriendType) {
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

    // 从模板中随机选择一个基础场景
    const templates = scenarioTemplates[girlfriendType.id as GirlfriendId];
    const baseScenario = templates[Math.floor(Math.random() * templates.length)];

    // 使用LLM生成更详细的场景描述
    const systemPrompt = `你是一个${girlfriendType.name}的女朋友，${girlfriendType.personality}。
${girlfriendType.introduction}

你的任务：基于以下基础场景，生成一个详细的、符合你性格特点的生气场景描述。

基础场景：${baseScenario}

要求：
1. 场景描述要生动具体，符合你的性格特点
2. 场景要真实可信，让用户能够理解你为什么生气
3. 场景描述控制在50-100字之间
4. 用第一人称描述
5. 不要在描述中包含"生气"这个词，通过语气和内容表现出来

只返回场景描述，不要有任何其他内容。`;

    const messages = [{ role: 'system' as const, content: systemPrompt }];

    const response = await client.invoke(messages, {
      model: 'doubao-seed-1-8-251228',
      temperature: 0.9,
    });

    // 随机选择难度
    const difficulties: Array<'easy' | 'medium' | 'hard'> = ['easy', 'medium', 'hard'];
    const difficulty = difficulties[Math.floor(Math.random() * difficulties.length)];

    const initialMoodValue = generateInitialMoodValue(difficulty);

    return NextResponse.json({
      scenario: response.content,
      initialMoodValue,
      difficulty,
    } as GenerateScenarioResponse);
  } catch (error) {
    console.error('Generate scenario error:', error);
    return NextResponse.json({ error: '生成场景失败' }, { status: 500 });
  }
}
