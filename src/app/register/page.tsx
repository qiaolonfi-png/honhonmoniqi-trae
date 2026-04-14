'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Lock, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
	const router = useRouter();
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [error, setError] = useState('');
	const [isLoading, setIsLoading] = useState(false);

	const handleRegister = async (e: React.FormEvent) => {
		e.preventDefault();
		setError('');

		// 验证密码是否一致
		if (password !== confirmPassword) {
			setError('两次输入的密码不一致');
			return;
		}

		setIsLoading(true);

		try {
			const response = await fetch('/api/auth/register', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ username, password }),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || '注册失败');
			}

			// 注册成功，跳转到首页
			window.location.href = '/';
		} catch (err) {
			setError(err instanceof Error ? err.message : '注册失败，请稍后重试');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-b from-[#FFF9F9] via-[#FFF0F5] to-[#F0F8FF] flex items-center justify-center px-4">
			<Card className="w-full max-w-md border-2 rounded-3xl" style={{ borderColor: '#FFE4E9', backgroundColor: '#FFF9FB' }}>
				<CardHeader className="text-center">
					<CardTitle className="text-3xl font-bold" style={{ color: '#FF69B4' }}>
						注册账号 💝
					</CardTitle>
					<CardDescription className="text-base" style={{ color: '#FFB6C1' }}>
						开启你的恋爱模拟之旅
					</CardDescription>
				</CardHeader>
				<CardContent>
					<form onSubmit={handleRegister} className="space-y-4">
						<div className="space-y-2">
							<label htmlFor="username" className="text-sm font-medium" style={{ color: '#FF69B4' }}>
								用户名
							</label>
							<div className="relative">
								<User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: '#FFB6C1' }} />
								<Input
									id="username"
									type="text"
									placeholder="请输入用户名（3-20个字符）"
									value={username}
									onChange={(e) => setUsername(e.target.value)}
									disabled={isLoading}
									className="pl-10"
									style={{ borderColor: '#FFE4E9' }}
									required
									minLength={3}
									maxLength={20}
								/>
							</div>
						</div>

						<div className="space-y-2">
							<label htmlFor="password" className="text-sm font-medium" style={{ color: '#FF69B4' }}>
								密码
							</label>
							<div className="relative">
								<Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: '#FFB6C1' }} />
								<Input
									id="password"
									type="password"
									placeholder="请输入密码（至少6个字符）"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									disabled={isLoading}
									className="pl-10"
									style={{ borderColor: '#FFE4E9' }}
									required
									minLength={6}
								/>
							</div>
						</div>

						<div className="space-y-2">
							<label htmlFor="confirmPassword" className="text-sm font-medium" style={{ color: '#FF69B4' }}>
								确认密码
							</label>
							<div className="relative">
								<Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" style={{ color: '#FFB6C1' }} />
								<Input
									id="confirmPassword"
									type="password"
									placeholder="请再次输入密码"
									value={confirmPassword}
									onChange={(e) => setConfirmPassword(e.target.value)}
									disabled={isLoading}
									className="pl-10"
									style={{ borderColor: '#FFE4E9' }}
									required
									minLength={6}
								/>
							</div>
						</div>

						{error && (
							<div className="p-3 rounded-lg text-sm" style={{ backgroundColor: '#FFEBEE', color: '#EF4444' }}>
								{error}
							</div>
						)}

						<Button
							type="submit"
							disabled={isLoading}
							className="w-full rounded-full gap-2"
							style={{ backgroundColor: '#FF69B4' }}
						>
							{isLoading ? '注册中...' : (
								<>
									注册
									<ArrowRight className="h-4 w-4" />
								</>
							)}
						</Button>
					</form>

					<div className="mt-6 text-center text-sm">
						<span style={{ color: '#999' }}>已有账号？</span>
						<Link href="/login" className="ml-2 font-medium transition-colors hover:opacity-80" style={{ color: '#FF69B4' }}>
							立即登录
						</Link>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
