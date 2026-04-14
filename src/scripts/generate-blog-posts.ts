import { LLMClient, Config } from 'coze-coding-dev-sdk';

const config = new Config();
const client = new LLMClient(config);

async function generateBlogPost(title: string, summary: string) {
  const messages = [
    {
      role: 'system' as const,
      content: `你是一个恋爱博客的专业作者，擅长用轻松幽默的风格写恋爱攻略文章。

写作要求：
1. 风格轻松幽默，像朋友聊天一样
2. 内容实用，给出具体的建议和技巧
3. 加入一些生动的例子和场景
4. 语言通俗易懂，不要太学术化
5. 文章长度控制在300-500字
6. 偶尔用一些可爱的表情符号来增加亲和力
7. 结构清晰，有起承转合

请根据提供的标题和摘要，写一篇完整的博客文章。`,
    },
    {
      role: 'user' as const,
      content: `标题：${title}\n\n摘要：${summary}\n\n请根据以上信息写一篇完整的博客文章。`,
    },
  ];

  const response = await client.invoke(messages, {
    model: 'doubao-seed-2-0-lite-260215',
    temperature: 0.8,
  });

  return response.content;
}

async function generateAllPosts() {
  const posts = [
    {
      id: 'golden-30-minutes',
      title: '吵架之后的黄金30分钟',
      summary: '吵架后如何把握黄金30分钟，有效修复关系，让感情升温。',
      slug: 'golden-30-minutes',
      category: '恋爱技巧',
      date: '2024-01-15',
    },
    {
      id: 'you-are-right-worst-reply',
      title: '为什么「你说得对」是最烂的回复',
      summary: '揭示敷衍式道歉的真相，教你如何真诚道歉，避免越描越黑。',
      slug: 'you-are-right-worst-reply',
      category: '沟通技巧',
      date: '2024-01-16',
    },
    {
      id: 'how-to-apologize',
      title: '道歉的正确打开方式',
      summary: '真诚道歉的三个步骤，让你轻松化解矛盾，重获女朋友的信任。',
      slug: 'how-to-apologize',
      category: '情感修复',
      date: '2024-01-17',
    },
  ];

  const generatedPosts = [];

  for (const post of posts) {
    console.log(`正在生成文章: ${post.title}...`);
    const content = await generateBlogPost(post.title, post.summary);
    console.log(`✅ ${post.title} 生成完成`);

    generatedPosts.push({
      ...post,
      content,
    });
  }

  console.log('\n所有文章生成完成！');
  console.log(JSON.stringify(generatedPosts, null, 2));

  return generatedPosts;
}

generateAllPosts().catch(console.error);
