'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wand2, Loader2, CheckCircle2 } from 'lucide-react';

export default function AdminBlogPage() {
  const [topic, setTopic] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPost, setGeneratedPost] = useState<{
    id: number;
    title: string;
    summary: string;
    content: string;
    created_at: string;
  } | null>(null);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError('请输入文章主题');
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      const response = await fetch('/api/blog/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '生成失败');
      }

      setGeneratedPost(data.post);
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成失败，请稍后重试');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF9F9] via-[#FFF0F5] to-[#F0F8FF]">
      <div className="container mx-auto max-w-4xl py-12 px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4" style={{ color: '#FF69B4' }}>
            后台管理 📝
          </h1>
          <p className="text-lg" style={{ color: '#FFB6C1' }}>
            生成新的恋爱攻略文章
          </p>
        </div>

        {/* Generate Form */}
        <Card className="mb-8 border-2 rounded-3xl" style={{ borderColor: '#FFE4E9', backgroundColor: '#FFF9FB' }}>
          <CardHeader>
            <CardTitle style={{ color: '#FF69B4' }}>生成新文章</CardTitle>
            <CardDescription style={{ color: '#999' }}>
              输入主题，AI 会自动生成一篇恋爱攻略文章
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Input
                placeholder="例如：如何送女朋友礼物"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleGenerate()}
                disabled={isGenerating}
                className="flex-1"
                style={{ borderColor: '#FFE4E9' }}
              />
              <Button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="rounded-full gap-2"
                style={{ backgroundColor: '#FF69B4' }}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    生成中...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4" />
                    生成文章
                  </>
                )}
              </Button>
            </div>
            {error && (
              <p className="text-sm" style={{ color: '#EF4444' }}>
                {error}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Result */}
        {generatedPost && (
          <Card className="border-2 rounded-3xl" style={{ borderColor: '#E8F8F5', backgroundColor: '#F0FFFC' }}>
            <CardHeader>
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-5 w-5" style={{ color: '#87CEEB' }} />
                <CardTitle style={{ color: '#87CEEB' }}>生成成功</CardTitle>
              </div>
              <CardDescription style={{ color: '#999' }}>
                文章已保存到数据库
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <h3 className="text-lg font-bold mb-2" style={{ color: '#FF69B4' }}>
                  {generatedPost.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: '#666' }}>
                  {generatedPost.summary}
                </p>
              </div>
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={() => window.open(`/blog/${generatedPost.id}`, '_blank')}
                  className="rounded-full"
                  style={{ borderColor: '#87CEEB', color: '#87CEEB' }}
                >
                  查看文章
                </Button>
                <Button
                  onClick={() => {
                    setGeneratedPost(null);
                    setTopic('');
                  }}
                  className="rounded-full"
                  style={{ backgroundColor: '#FFB6C1' }}
                >
                  继续生成
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tips */}
        <Card className="mt-8 border-2 rounded-3xl" style={{ borderColor: '#FFF8E7', backgroundColor: '#FFFEF9' }}>
          <CardHeader>
            <CardTitle style={{ color: '#FFB6C1' }}>💡 小贴士</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm" style={{ color: '#666' }}>
              <li>• 主题越具体，生成的文章质量越高</li>
              <li>• 可以尝试不同的角度，比如&ldquo;道歉技巧&rdquo;、&ldquo;约会攻略&rdquo;等</li>
              <li>• 生成后可以直接在博客列表中查看</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
