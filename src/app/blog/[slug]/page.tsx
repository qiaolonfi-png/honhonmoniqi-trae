'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Clock, User, Loader2 } from 'lucide-react';

interface BlogPost {
  id: string;
  title: string;
  content: string;
  created_at: string;
}

export default function BlogDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      fetchBlogPost(slug);
    }
  }, [slug]);

  const fetchBlogPost = async (id: string) => {
    try {
      const response = await fetch(`/api/blog/${id}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('获取文章失败:', errorData);
        setError('获取文章失败');
        return;
      }

      const data = await response.json();
      setPost(data.post);
    } catch (err) {
      console.error('获取文章失败:', err);
      setError('获取文章失败');
    } finally {
      setLoading(false);
    }
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

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#FFF9F9] via-[#FFF0F5] to-[#F0F8FF] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">😢</div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: '#FF69B4' }}>文章不存在</h2>
          <p className="text-gray-600 mb-6">{error || '文章未找到'}</p>
          <Link href="/blog">
            <Button style={{ backgroundColor: '#FF69B4' }}>
              返回列表
            </Button>
          </Link>
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
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 mb-6 text-sm font-medium transition-colors hover:opacity-80"
            style={{ color: '#FF69B4' }}
          >
            <ArrowLeft className="h-4 w-4" />
            返回列表
          </Link>

          <Badge
            className="mb-4 text-sm font-medium"
            style={{ backgroundColor: '#FF69B4' }}
          >
            恋爱攻略
          </Badge>

          <h1 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#FF69B4' }}>
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm" style={{ color: '#999' }}>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>恋爱小助手</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>3分钟</span>
            </div>
            <span>{new Date(post.created_at).toLocaleDateString('zh-CN')}</span>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-8 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-white rounded-3xl p-8 shadow-lg">
            <div className="prose prose-pink max-w-none">
              {/* Convert markdown-style content to HTML-like structure */}
              <div
                className="blog-content"
                dangerouslySetInnerHTML={{
                  __html: post.content
                    .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mb-4" style="color: #FF69B4;">$1</h1>')
                    .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mb-3 mt-6" style="color: #FFB6C1;">$1</h2>')
                    .replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold mb-2 mt-4" style="color: #87CEEB;">$1</h3>')
                    .replace(/\*\*(.*?)\*\*/gim, '<strong style="color: #FF69B4;">$1</strong>')
                    .replace(/\*(.*?)\*/gim, '<em style="color: #FFB6C1;">$1</em>')
                    .replace(/^---$/gim, '<hr class="my-6 border-pink-200" />')
                    .replace(/^- (.*$)/gim, '<li class="mb-2" style="color: #666;">$1</li>')
                    .replace(/\n\n/gim, '</p><p class="mb-4 leading-relaxed" style="color: #666;">')
                    .replace(/^<li.*<\/li>$/gim, '<ul class="list-disc pl-6 mb-4">$&</ul>'),
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Back to List */}
      <section className="py-8 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <Link href="/blog">
            <Button
              className="rounded-full"
              style={{ backgroundColor: '#FF69B4' }}
            >
              返回文章列表
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 text-center" style={{ backgroundColor: '#FFF9F9' }}>
        <div className="container mx-auto max-w-4xl">
          <p className="text-sm" style={{ color: '#999' }}>
            💕 感谢阅读，希望能帮到你
          </p>
        </div>
      </footer>
    </div>
  );
}
