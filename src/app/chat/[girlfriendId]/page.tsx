'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getGirlfriendTypeById, GIRLFRIEND_TYPES } from '@/data/girlfriends';
import { GirlfriendType, MoodValue, Message, ReplyOption } from '@/types/girlfriend';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ArrowLeft, Send, Volume2, Heart, Share2, Trophy, RotateCcw } from 'lucide-react';

export default function ChatPage() {
  const params = useParams();
  const router = useRouter();
  const girlfriendId = params.girlfriendId as string;
  const girlfriend = getGirlfriendTypeById(girlfriendId);

  const [messages, setMessages] = useState<Message[]>([]);
  const [moodValue, setMoodValue] = useState<MoodValue>(0);
  const [initialAngerScenario, setInitialAngerScenario] = useState('');
  const [inputText, setInputText] = useState('');
  const [replyOptions, setReplyOptions] = useState<ReplyOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingOptions, setIsGeneratingOptions] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [successSummary, setSuccessSummary] = useState<string>('');
  const [isGeneratingScenario, setIsGeneratingScenario] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showSaveMessage, setShowSaveMessage] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, replyOptions]);

  // 初始化对话
  useEffect(() => {
    if (girlfriend && isGeneratingScenario) {
      generateInitialScenario();
    }
  }, [girlfriend]);

  // 检查登录状态
  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      const response = await fetch('/api/auth/me');
      setIsLoggedIn(response.ok);
    } catch (error) {
      setIsLoggedIn(false);
    }
  };

  // 保存游戏记录
  const saveGameRecord = async (result: string) => {
    try {
      const response = await fetch('/api/game-records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenario: initialAngerScenario,
          final_score: moodValue,
          result,
        }),
      });

      if (response.ok) {
        setSaveMessage('您的游戏记录已经保存');
        setShowSaveMessage(true);
        setTimeout(() => setShowSaveMessage(false), 3000);
      }
    } catch (error) {
      console.error('保存游戏记录失败:', error);
    }
  };

  // 生成初始生气场景
  const generateInitialScenario = async () => {
    if (!girlfriend) return;

    try {
      const response = await fetch('/api/generate-scenario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ girlfriendType: girlfriend }),
      });

      if (!response.ok) throw new Error('Failed to generate scenario');

      const data = await response.json();
      setInitialAngerScenario(data.scenario);
      setMoodValue(data.initialMoodValue);

      const initialMessage: Message = {
        id: Date.now().toString(),
        role: 'girlfriend',
        content: `（生气地）${data.scenario}我现在很生气！`,
        timestamp: new Date(),
        moodValue: data.initialMoodValue,
      };
      setMessages([initialMessage]);
      setIsGeneratingScenario(false);

      // 生成6种回复选项
      generateReplyOptions('');
    } catch (error) {
      console.error('Generate scenario error:', error);
      setIsGeneratingScenario(false);
    }
  };

  // 生成回复选项
  const generateReplyOptions = async (userMessage: string) => {
    if (!girlfriend) return;

    try {
      setIsGeneratingOptions(true);
      const response = await fetch('/api/generate-options', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          girlfriendType: girlfriend,
          userMessage: userMessage || '(初始回复)',
          moodValue,
          messageHistory: messages,
          initialAngerScenario,
        }),
      });

      if (!response.ok) throw new Error('Failed to generate options');

      const data = await response.json();
      setReplyOptions(data.options);
    } catch (error) {
      console.error('Generate options error:', error);
    } finally {
      setIsGeneratingOptions(false);
    }
  };

  // 发送消息
  const handleSendMessage = async (message: string) => {
    if (!message.trim() || isLoading || !girlfriend) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setReplyOptions([]);
    setAttemptCount((prev) => prev + 1);
    setIsLoading(true);

    try {
      // 调用 API 获取回复
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          girlfriendId: girlfriend.id,
          girlfriendType: girlfriend,
          userMessage: message,
          moodValue,
          messageHistory: messages,
          initialAngerScenario,
        }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();

      const girlfriendMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'girlfriend',
        content: data.response,
        timestamp: new Date(),
        moodValue: data.moodValue,
        audioUrl: data.audioUrl,
      };

      setMessages((prev) => [...prev, girlfriendMessage]);
      setMoodValue(data.moodValue);
      setAudioUrl(data.audioUrl || null);
      setIsSuccess(data.isSuccess || false);

      // 播放语音
      if (data.audioUrl) {
        playAudio(data.audioUrl);
      }

      // 判断是否成功
      if (data.isSuccess) {
        generateSuccessSummary();

        // 检查登录状态并保存记录
        if (isLoggedIn) {
          saveGameRecord('成功');
        } else {
          setSaveMessage('登录后可保存你的游戏记录');
          setShowSaveMessage(true);
          setTimeout(() => setShowSaveMessage(false), 3000);
        }

        setShowSuccessDialog(true);
      } else {
        // 继续生成回复选项
        generateReplyOptions(message);
      }
    } catch (error) {
      console.error('Send message error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 播放语音
  const playAudio = (url: string) => {
    const audio = new Audio(url);
    audio.play();
  };

  // 生成成功总结
  const generateSuccessSummary = async () => {
    if (!girlfriend) return;

    const summary = `恭喜你成功哄好了${girlfriend.name}！

📊 过程总结：
- 初始情绪值：${messages[0]?.moodValue || 0}
- 最终情绪值：${moodValue}
- 共经历 ${attemptCount} 轮对话

💡 成功原因：
你通过真诚的沟通和不断的努力，理解了她的感受，并给出了合适的回应，让她的情绪逐渐好转。

✨ 关键时刻：
你学会了如何用正确的方式哄女朋友，这是一次很好的实践！`;

    setSuccessSummary(summary);
  };

  // 分享成功
  const shareSuccess = () => {
    if (!girlfriend) return;

    const text = `我在哄哄模拟器中成功哄好了${girlfriend.name}！\n用了${attemptCount}轮对话，从初始情绪值${messages[0]?.moodValue}哄到了${moodValue}！\n\n快来试试你能用几轮哄好女朋友吧！`;

    if (navigator.share) {
      navigator.share({
        title: '哄哄模拟器 - 成功哄好女朋友！',
        text: text,
      });
    } else {
      // 复制到剪贴板
      navigator.clipboard.writeText(text);
      alert('已复制到剪贴板！');
    }
  };

  // 重新开始
  const handleRestart = () => {
    setShowSuccessDialog(false);
    setMessages([]);
    setMoodValue(0);
    setInitialAngerScenario('');
    setAttemptCount(0);
    setIsSuccess(false);
    setIsGeneratingScenario(true);
    generateInitialScenario();
  };

  // 获取情绪值对应的颜色
  const getMoodColor = (value: MoodValue) => {
    if (value >= 80) return 'text-pink-500';
    if (value >= 20) return 'text-blue-500';
    if (value < 0) return 'text-red-500';
    return 'text-gray-500';
  };

  // 获取情绪值对应的文本
  const getMoodText = (value: MoodValue) => {
    if (value >= 80) return '开心';
    if (value >= 20) return '平静';
    if (value < 0) return '生气';
    return '还可以';
  };

  // 计算进度条百分比（将-50到100映射到0到100）
  const getProgressPercentage = (value: MoodValue) => {
    return ((value + 50) / 150) * 100;
  };

  // 获取进度条颜色
  const getProgressColor = (value: MoodValue) => {
    if (value >= 80) return 'bg-pink-500';
    if (value >= 20) return 'bg-blue-500';
    if (value < 0) return 'bg-red-500';
    return 'bg-gray-500';
  };

  if (!girlfriend) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg text-muted-foreground">女朋友类型不存在</p>
      </div>
    );
  }

  if (isGeneratingScenario) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="p-6 text-center">
            <div className="text-6xl mb-4">{girlfriend.avatar}</div>
            <p className="text-lg font-medium mb-2">正在生成生气场景...</p>
            <p className="text-sm text-muted-foreground">请稍候</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900">
      {/* 保存消息提示 */}
      {showSaveMessage && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-full shadow-lg animate-in slide-in-from-top fade-in-20">
          <div className="flex items-center gap-2 text-sm font-medium" style={{ backgroundColor: isLoggedIn ? '#D1FAE5' : '#FEE2E2', color: isLoggedIn ? '#065F46' : '#991B1B' }}>
            {isLoggedIn ? '✓' : 'ℹ️'} {saveMessage}
          </div>
        </div>
      )}

      {/* 顶部状态栏 */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 py-3">
          {/* 第一行：女朋友信息 */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => router.push('/')}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="text-3xl">{girlfriend.avatar}</div>
                <div>
                  <h2 className="font-bold text-lg">{girlfriend.name}</h2>
                  <p className="text-sm text-muted-foreground">{girlfriend.personality}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline">已尝试 {attemptCount} 次</Badge>
              {isSuccess && (
                <Badge className="bg-pink-500 text-white animate-pulse">
                  🎉 成功哄好！
                </Badge>
              )}
            </div>
          </div>

          {/* 第二行：情绪值进度条 */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium w-16">情绪值:</span>
            <Progress 
              value={getProgressPercentage(moodValue)} 
              className="flex-1"
              style={{
                background: moodValue < 0 ? '#fee2e2' : moodValue >= 80 ? '#fce7f3' : '#dbeafe',
              }}
            />
            <div className="flex items-center gap-2 w-20">
              <span className={`text-lg font-bold ${getMoodColor(moodValue)}`}>{moodValue}</span>
              <span className={`text-xs font-medium ${getMoodColor(moodValue)}`}>
                {getMoodText(moodValue)}
              </span>
            </div>
          </div>
          <div className="text-xs text-muted-foreground mt-1 text-center">
            -50 愤怒 | 20 平静 | 80 开心
          </div>
        </div>
      </div>

      {/* 消息展示区域 */}
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="space-y-4 mb-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <Card
                className={`max-w-[80%] ${
                  message.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white dark:bg-gray-800'
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-2">
                    {message.role === 'girlfriend' && (
                      <span className="text-2xl">{girlfriend.avatar}</span>
                    )}
                    <div className="flex-1">
                      <p className="text-sm">{message.content}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs opacity-70">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </span>
                        {message.role === 'girlfriend' && message.moodValue !== undefined && (
                          <Badge variant="outline" className="text-xs">
                            情绪值: {message.moodValue}
                          </Badge>
                        )}
                        {message.audioUrl && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => playAudio(message.audioUrl!)}
                          >
                            <Volume2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <Card className="bg-white dark:bg-gray-800">
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">正在思考回复...</p>
                </CardContent>
              </Card>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* 回复选项区域 */}
        {replyOptions.length > 0 && !isLoading && !isSuccess && (
          <div className="mb-4">
            <p className="text-sm text-muted-foreground mb-3">💡 选择回复方式：</p>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {replyOptions.map((option) => (
                <Card
                  key={option.id}
                  className="cursor-pointer hover:shadow-md transition-all hover:scale-[1.02] bg-white dark:bg-gray-800"
                  onClick={() => handleSendMessage(option.content)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="text-xs">
                        {option.type}
                      </Badge>
                    </div>
                    <p className="text-sm font-medium">{option.content}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* 自定义输入区域 */}
        {!isSuccess && !isLoading && (
          <Card className="bg-white dark:bg-gray-800">
            <CardContent className="p-4">
              <div className="flex gap-2">
                <Textarea
                  placeholder="或者自己输入回复..."
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(inputText);
                    }
                  }}
                  className="flex-1 min-h-[60px] resize-none"
                  disabled={isLoading}
                />
                <Button
                  onClick={() => handleSendMessage(inputText)}
                  disabled={!inputText.trim() || isLoading}
                  style={{ backgroundColor: girlfriend.color }}
                  className="self-end"
                >
                  <Send className="h-4 w-4 mr-2" />
                  发送
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 加载回复选项 */}
        {isGeneratingOptions && !isLoading && !isSuccess && (
          <div className="text-center text-sm text-muted-foreground mb-4">
            正在生成回复选项...
          </div>
        )}
      </div>

      {/* 成功弹窗 */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="text-6xl">🎉</div>
            </div>
            <DialogTitle className="text-2xl font-bold text-center">
              恭喜成功哄好！
            </DialogTitle>
            <DialogDescription className="text-center">
              你成功哄好了{girlfriend.name}！
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-gray-800 dark:to-gray-700 rounded-lg p-4 mb-4">
              <pre className="whitespace-pre-wrap text-sm">{successSummary}</pre>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={shareSuccess}
              >
                <Share2 className="h-4 w-4 mr-2" />
                分享
              </Button>
              <Button
                className="flex-1"
                style={{ backgroundColor: girlfriend.color }}
                onClick={handleRestart}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                再来一次
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
