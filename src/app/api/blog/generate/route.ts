import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { LLMClient, Config } from 'coze-coding-dev-sdk';

// POST /api/blog/generate - 生成新的博客文章
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { topic } = body;

    if (!topic) {
      return NextResponse.json(
        { error: '缺少主题参数' },
        { status: 400 }
      );
    }

    // 使用 LLM 生成文章
    const config = new Config();
    const client = new LLMClient(config);

    const prompt = `请写一篇关于"${topic}"的恋爱攻略文章。

要求：
1. 标题要吸引人，不要太长
2. 写一个简短的摘要（2-3句话）
3. 正文要有实用价值，用轻松幽默的语气
4. 使用emoji增加趣味性
5. 内容要真实有用，帮助18-30岁的年轻人解决恋爱问题
6. 格式为Markdown
7. 标题用# 一级标题
8. 不要包含代码块

请按以下JSON格式返回：
{
  "title": "文章标题",
  "summary": "文章摘要",
  "content": "文章正文内容（Markdown格式）"
}

只返回JSON，不要有其他内容。`;

    const response = await client.invoke([
      {
        role: 'system',
        content: '你是一位专业的恋爱攻略博主，擅长写轻松实用、幽默风趣的恋爱文章。'
      },
      {
        role: 'user',
        content: prompt
      }
    ], { model: 'doubao-seed-1-8-251228', temperature: 0.8 });

    const content = response.content || '';

    // 解析 JSON
    let articleData;
    try {
      articleData = JSON.parse(content);
    } catch {
      // 如果 LLM 没有返回纯 JSON，尝试提取 JSON
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        articleData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('LLM 返回的内容无法解析为 JSON');
      }
    }

    // 插入数据库
    const supabaseClient = getSupabaseClient();
    const { data, error } = await supabaseClient
      .from('blog_posts')
      .insert({
        title: articleData.title,
        summary: articleData.summary,
        content: articleData.content,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`插入失败: ${error.message}`);
    }

    return NextResponse.json({ post: data });
  } catch (error) {
    console.error('生成文章失败:', error);
    return NextResponse.json(
      { error: '生成文章失败' },
      { status: 500 }
    );
  }
}
