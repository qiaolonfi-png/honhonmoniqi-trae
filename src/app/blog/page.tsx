'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  summary: string;
  created_at: string;
}

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBlogPosts();
  }, []);

  const fetchBlogPosts = async () => {
    try {
      const response = await fetch('/api/blog');
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('获取文章失败:', errorData);
        setError('获取文章列表失败');
        return;
      }

      const data = await response.json();
      setPosts(data.posts || []);
    } catch (err) {
      console.error('获取文章失败:', err);
      setError('获取文章列表失败');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FFF9F9] via-[#FFF0F5] to-[#F0F8FF] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" style={{ color: '#FF69B4' }} />
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FFF9F9] via-[#FFF0F5] to-[#F0F8FF] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😢</div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: '#FF69B4' }}>加载失败</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={fetchBlogPosts} style={{ backgroundColor: '#FF69B4' }}>
            重试
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF9F9] via-[#FFF0F5] to-[#F0F8FF]">
      {/* Header */}
      <section className="py-12 px-4 relative overflow-hidden">
        <div className="absolute top-10 right-10 w-16 h-16 opacity-60">
          <Image src="/sticker-heart.png" alt="爱心" fill className="object-contain" />
        </div>

        <div className="container mx-auto max-w-4xl relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 mb-6" style={{ color: '#FF69B4' }}>
            ← 返回首页
          </Link>
          <h1 className="text-4xl font-bold mb-4" style={{ color: '#FF69B4' }}>
            💕 恋爱攻略
          </h1>
          <p className="text-lg" style={{ color: '#666' }}>
            学习恋爱技巧，提升沟通能力，让你的感情生活更美好
          </p>
        </div>
      </section>

      {/* Blog Posts */}
      <section className="py-8 px-4">
        <div className="container mx-auto max-w-4xl">
          {posts.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: '#FF69B4' }}>
                暂无文章
              </h3>
              <p className="text-gray-600">
                敬请期待更多恋爱技巧文章！
              </p>
            </div>
          ) : (
            <div className="grid gap-6">
              {posts.map((post) => (
                <Link key={post.id} href={`/blog/${post.id}`}>
                  <Card className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2" style={{ borderColor: '#FFE4E9' }}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <Badge variant="outline" style={{ borderColor: '#FFB6C1', color: '#FF69B4' }}>
                          攻略
                        </Badge>
                        <span className="text-sm" style={{ color: '#999' }}>
                          {formatDate(post.created_at)}
                        </span>
                      </div>
                      <h2 className="text-xl font-bold mb-2" style={{ color: '#333' }}>
                        {post.title}
                      </h2>
                      <CardDescription className="text-base leading-relaxed">
                        {post.summary}
                      </CardDescription>
                      <div className="mt-4 text-sm font-medium" style={{ color: '#FF69B4' }}>
                        阅读全文 →
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 text-center" style={{ backgroundColor: '#FFF9F9' }}>
        <div className="container mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-sm" style={{ color: '#FF69B4' }}>
            ← 返回哄哄模拟器
          </Link>
        </div>
      </footer>
    </div>
  );
}
