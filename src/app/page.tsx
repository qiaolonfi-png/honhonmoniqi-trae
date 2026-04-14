import type { Metadata } from 'next';
import { GIRLFRIEND_TYPES } from '@/data/girlfriends';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import Image from 'next/image';
import HeaderUser from '@/components/header-user';

export const metadata: Metadata = {
  title: '哄哄模拟器 - 练习哄女朋友的最佳选择',
  description: '选择一种类型的女朋友，开始练习如何哄她吧！真实场景模拟，提升你的情感沟通能力',
};

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FFF9F9] via-[#FFF0F5] to-[#F0F8FF]">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 px-4">
        {/* User Info / Login Buttons */}
        <div className="absolute top-6 right-6 z-20">
          <HeaderUser />
        </div>

        {/* Decorative stickers */}
        <div className="absolute top-10 left-10 w-20 h-20 opacity-60 animate-bounce" style={{ animationDuration: '3s' }}>
          <Image src="/sticker-heart.png" alt="爱心" fill className="object-contain" />
        </div>
        <div className="absolute top-20 right-20 w-16 h-16 opacity-60 animate-bounce" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}>
          <Image src="/sticker-star.png" alt="星星" fill className="object-contain" />
        </div>
        <div className="absolute bottom-10 left-1/4 w-24 h-16 opacity-60 animate-bounce" style={{ animationDuration: '3.5s', animationDelay: '1s' }}>
          <Image src="/sticker-cloud.png" alt="云朵" fill className="object-contain" />
        </div>

        <div className="container mx-auto max-w-6xl text-center relative z-10">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="relative w-32 h-32 rounded-full overflow-hidden shadow-2xl border-4 border-white hover:scale-110 transition-transform duration-300">
              <Image src="/logo.png" alt="哄哄模拟器 Logo" fill className="object-cover" priority />
            </div>
          </div>

          {/* Main Title */}
          <h1 className="text-5xl md:text-6xl font-bold mb-4" style={{ color: '#8B5CF6' }}>
            哄哄模拟器
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl mb-6" style={{ color: '#FFB6C1' }}>
            练习哄女朋友的最佳选择 💕
          </p>

          {/* Description */}
          <p className="text-base md:text-lg max-w-3xl mx-auto mb-8 leading-relaxed" style={{ color: '#666' }}>
            不知道怎么哄女朋友？在这里你可以选择不同类型的女朋友，模拟真实场景，
            通过选择合适的回复方式，学习如何哄好她，提升你的情感沟通能力！
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="#girlfriends"
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-base font-semibold transition-all hover:scale-105 hover:shadow-lg px-8 py-3 text-white"
              style={{ backgroundColor: '#FF69B4' }}
            >
              🌸 开始体验
            </Link>
            <Link
              href="/blog"
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-base font-semibold transition-all hover:scale-105 border-2 px-8 py-3"
              style={{ borderColor: '#87CEEB', color: '#87CEEB' }}
            >
              📖 恋爱攻略
            </Link>
            <Link
              href="/leaderboard"
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-base font-semibold transition-all hover:scale-105 border-2 px-8 py-3"
              style={{ borderColor: '#FFD700', color: '#FFD700' }}
            >
              🏆 排行榜
            </Link>
            <Link
              href="#features"
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-base font-semibold transition-all hover:scale-105 border-2 px-8 py-3"
              style={{ borderColor: '#FFB6C1', color: '#FF69B4' }}
            >
              ✨ 了解更多
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 px-4 bg-white/50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#FF69B4' }}>
              核心功能 💖
            </h2>
            <p className="text-base" style={{ color: '#999' }}>
              精心设计的功能，让你更真实地模拟哄女朋友的场景
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <Card className="border-2 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 rounded-3xl" style={{ borderColor: '#FFE4E9', backgroundColor: '#FFF9FB' }}>
              <CardHeader>
                <div className="relative w-full h-48 rounded-2xl overflow-hidden mb-4">
                  <Image src="/feature-chat.png" alt="模拟哄女朋友" fill className="object-cover" />
                </div>
                <CardTitle className="text-xl text-center" style={{ color: '#FF69B4' }}>
                  💬 真实对话模拟
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm text-center leading-relaxed" style={{ color: '#666' }}>
                  AI驱动的智能对话系统，根据女朋友的类型和情绪，生成真实自然的回复，
                  让你体验真实的沟通场景
                </CardDescription>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="border-2 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 rounded-3xl" style={{ borderColor: '#FFF8E7', backgroundColor: '#FFFEF9' }}>
              <CardHeader>
                <div className="relative w-full h-48 rounded-2xl overflow-hidden mb-4">
                  <Image src="/feature-characters.png" alt="多种女朋友类型" fill className="object-cover" />
                </div>
                <CardTitle className="text-xl text-center" style={{ color: '#FFB6C1' }}>
                  👧 6种性格类型
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm text-center leading-relaxed" style={{ color: '#666' }}>
                  温柔型、傲娇型、活泼型、冷艳型、可爱型、独立型，
                  每种类型都有独特的性格和应对方式，满足不同练习需求
                </CardDescription>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="border-2 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 rounded-3xl" style={{ borderColor: '#E8F8F5', backgroundColor: '#F0FFFC' }}>
              <CardHeader>
                <div className="relative w-full h-48 rounded-2xl overflow-hidden mb-4">
                  <Image src="/feature-mood.png" alt="情绪值系统" fill className="object-cover" />
                </div>
                <CardTitle className="text-xl text-center" style={{ color: '#87CEEB' }}>
                  💓 情绪值系统
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm text-center leading-relaxed" style={{ color: '#666' }}>
                  实时显示女朋友的情绪状态，从愤怒到开心，通过正确的回复方式提升情绪值，
                  达到80分即视为哄好成功
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Examples Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#FF69B4' }}>
              使用示例 📱
            </h2>
            <p className="text-base" style={{ color: '#999' }}>
              简单三步，开始你的哄人之旅
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Example 1 */}
            <div className="relative">
              <div className="relative w-full max-w-sm mx-auto rounded-3xl overflow-hidden shadow-2xl border-4" style={{ borderColor: '#FFE4E9' }}>
                <Image src="/example-home.png" alt="选择女朋友" fill className="object-cover" />
              </div>
              <div className="absolute -top-4 -right-4 w-12 h-12 opacity-60">
                <Image src="/sticker-ribbon.png" alt="蝴蝶结" fill className="object-contain" />
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: '#FF69B4' }}>
                  1
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: '#FF69B4' }}>
                    选择女朋友类型
                  </h3>
                  <p className="text-sm" style={{ color: '#666' }}>
                    从6种不同性格的女朋友中选择一个，每种类型都有独特的性格特点和应对方式
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: '#FFB6C1' }}>
                  2
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: '#FFB6C1' }}>
                    选择回复方式
                  </h3>
                  <p className="text-sm" style={{ color: '#666' }}>
                    根据女朋友的回复和情绪状态，从6种不同类型的回复方式中选择最合适的一个
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: '#87CEEB' }}>
                  3
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: '#87CEEB' }}>
                    提升情绪值
                  </h3>
                  <p className="text-sm" style={{ color: '#666' }}>
                    通过正确的回复方式提升女朋友的情绪值，达到80分即视为哄好成功！
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Girlfriend Selection Section */}
      <section id="girlfriends" className="py-16 px-4 bg-white/50">
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: '#FF69B4' }}>
              选择你的女朋友 💕
            </h2>
            <p className="text-base" style={{ color: '#999' }}>
              每种类型都有独特的性格，选择一个开始练习吧！
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {GIRLFRIEND_TYPES.map((girlfriend, index) => (
              <Card
                key={girlfriend.id}
                className="hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer border-2 rounded-3xl"
                style={{ borderColor: `${girlfriend.color}40`, backgroundColor: `${girlfriend.color}08` }}
              >
                <CardHeader>
                  <div className="flex items-center justify-between mb-3">
                    <div className="relative w-16 h-16 rounded-full overflow-hidden border-4" style={{ borderColor: girlfriend.color }}>
                      <div className="w-full h-full flex items-center justify-center text-4xl">
                        {girlfriend.avatar}
                      </div>
                    </div>
                    <div
                      className="px-4 py-1.5 rounded-full text-xs font-bold text-white shadow-md"
                      style={{ backgroundColor: girlfriend.color }}
                    >
                      {girlfriend.name}
                    </div>
                  </div>
                  <CardTitle className="text-xl mb-2" style={{ color: girlfriend.color }}>
                    {girlfriend.name}
                  </CardTitle>
                  <CardDescription className="text-sm leading-relaxed" style={{ color: '#666' }}>
                    {girlfriend.personality}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 rounded-xl bg-white/50">
                      <p className="text-xs font-semibold mb-1" style={{ color: girlfriend.color }}>
                        个人介绍
                      </p>
                      <p className="text-xs leading-relaxed" style={{ color: '#666' }}>
                        {girlfriend.introduction}
                      </p>
                    </div>
                    <Link
                      href={`/chat/${girlfriend.id}`}
                      className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-full text-sm font-semibold transition-all hover:scale-105 hover:shadow-lg w-full text-white h-10"
                      style={{ backgroundColor: girlfriend.color }}
                    >
                      开始哄她 💖
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom Decoration */}
      <section className="py-12 px-4 text-center relative overflow-hidden">
        <div className="absolute top-10 left-10 w-16 h-16 opacity-40 animate-bounce" style={{ animationDuration: '4s' }}>
          <Image src="/sticker-dots.png" alt="装饰" fill className="object-contain" />
        </div>
        <div className="absolute top-20 right-20 w-20 h-20 opacity-40 animate-bounce" style={{ animationDuration: '3.5s', animationDelay: '0.3s' }}>
          <Image src="/sticker-heart.png" alt="爱心" fill className="object-contain" />
        </div>

        <div className="container mx-auto max-w-4xl relative z-10">
          <div className="p-8 rounded-3xl" style={{ backgroundColor: 'rgba(255, 182, 193, 0.1)' }}>
            <p className="text-lg font-semibold mb-3" style={{ color: '#FF69B4' }}>
              💡 小提示
            </p>
            <p className="text-sm leading-relaxed mb-4" style={{ color: '#666' }}>
              选择回复方式来哄女朋友，情绪值达到80即为成功。不同的回复方式会产生不同的效果，
              观察女朋友的反应，选择最合适的回复方式！
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <span className="px-4 py-1.5 rounded-full text-xs font-medium bg-white text-[#FF69B4]">
                真诚道歉 🙏
              </span>
              <span className="px-4 py-1.5 rounded-full text-xs font-medium bg-white text-[#FFB6C1]">
                浪漫表达 💕
              </span>
              <span className="px-4 py-1.5 rounded-full text-xs font-medium bg-white text-[#87CEEB]">
                幽默化解 😄
              </span>
              <span className="px-4 py-1.5 rounded-full text-xs font-medium bg-white text-[#FFD700]">
                温柔沟通 🌸
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 text-center" style={{ backgroundColor: '#FFF9F9' }}>
        <div className="container mx-auto max-w-6xl">
          <div className="flex justify-center items-center gap-2 mb-4">
            <Image src="/logo.png" alt="Logo" width={40} height={40} className="rounded-full" />
            <span className="font-bold text-lg" style={{ color: '#FF69B4' }}>
              哄哄模拟器
            </span>
          </div>
          <p className="text-sm" style={{ color: '#999' }}>
            © 2024 哄哄模拟器. All rights reserved. 💕
          </p>
          <p className="text-xs mt-2" style={{ color: '#CCC' }}>
            真实场景模拟 · 情感沟通练习 · 提升恋爱技巧
          </p>
        </div>
      </footer>
    </div>
  );
}
