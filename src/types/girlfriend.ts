// 女朋友类型定义
export type GirlfriendId = 'gentle' | 'tsundere' | 'lively' | 'cool' | 'cute' | 'independent';

export interface GirlfriendType {
  id: GirlfriendId;
  name: string;
  personality: string; // 性格描述
  introduction: string; // 个人介绍
  avatar: string; // 头像（emoji或图标）
  color: string; // 主题色
  voiceId: string; // 语音ID
}

// 情绪值（-50 到 100）
// -50 ~ -20: 愤怒
// -20 ~ 20: 平静
// 20 ~ 80: 还可以
// 80 ~ 100: 开心
export type MoodValue = number; // -50 到 100

// 消息类型
export interface Message {
  id: string;
  role: 'user' | 'girlfriend';
  content: string;
  audioUrl?: string; // 语音音频URL
  timestamp: Date;
  moodValue?: MoodValue; // 当前情绪值
}

// 回复选项（AI生成的6种选择）
export interface ReplyOption {
  id: string;
  type: string; // 幽默、搞笑、道歉、浪漫、真诚、解释等
  content: string;
  moodChangeHint?: number; // 隐藏的数值变化提示（不显示给用户）
}

// 对话会话
export interface ConversationSession {
  girlfriendId: GirlfriendId;
  messages: Message[];
  moodValue: MoodValue;
  attemptCount: number; // 哄女朋友的轮数
  initialAngerScenario: string; // 初始生气场景
  createdAt: Date;
  updatedAt: Date;
}

// LLM 请求参数
export interface ChatRequest {
  girlfriendId: GirlfriendId;
  girlfriendType: GirlfriendType;
  userMessage: string;
  moodValue: MoodValue;
  messageHistory: Message[];
  initialAngerScenario: string;
}

// LLM 响应参数
export interface ChatResponse {
  response: string; // 女朋友的回复文字
  moodValue: MoodValue; // 更新后的情绪值
  audioUrl?: string; // 语音URL
  isSuccess: boolean; // 是否成功哄好（moodValue >= 80）
}

// 生成生气场景请求
export interface GenerateScenarioRequest {
  girlfriendType: GirlfriendType;
}

// 生成生气场景响应
export interface GenerateScenarioResponse {
  scenario: string; // 生气场景描述
  initialMoodValue: MoodValue; // 根据场景生成的初始情绪值
  difficulty: 'easy' | 'medium' | 'hard'; // 难度等级
}

// 生成回复选项请求
export interface GenerateOptionsRequest {
  girlfriendType: GirlfriendType;
  userMessage: string;
  moodValue: MoodValue;
  messageHistory: Message[];
  initialAngerScenario: string;
}

// 生成回复选项响应
export interface GenerateOptionsResponse {
  options: ReplyOption[]; // 6种回复选项
}

// 成功总结
export interface SuccessSummary {
  girlfriendName: string;
  rounds: number;
  initialMoodValue: MoodValue;
  finalMoodValue: MoodValue;
  successReason: string; // 成功原因总结
  keyMoments: string[]; // 关键时刻
}
