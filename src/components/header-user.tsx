'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { User, LogOut } from 'lucide-react';

interface User {
	id: number;
	username: string;
}

export default function HeaderUser() {
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		fetchUser();
	}, []);

	const fetchUser = async () => {
		try {
			const response = await fetch('/api/auth/me');
			console.log('fetchUser response:', response.status);
			if (response.ok) {
				const data = await response.json();
				console.log('fetchUser data:', data);
				setUser(data.user);
			} else {
				const errorData = await response.json();
				console.log('fetchUser error:', errorData);
			}
		} catch (error) {
			console.error('获取用户信息失败:', error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleLogout = async () => {
		try {
			await fetch('/api/auth/logout', { method: 'POST' });
			setUser(null);
			window.location.reload();
		} catch (error) {
			console.error('注销失败:', error);
		}
	};

	if (isLoading) {
		return null;
	}

	if (user) {
		return (
			<div className="flex items-center gap-3">
				<Link href="/profile">
					<div className="flex items-center gap-2 px-4 py-2 rounded-full border-2 cursor-pointer hover:shadow-md transition-shadow" style={{ borderColor: '#FFE4E9', backgroundColor: '#FFF9FB' }}>
						<User className="h-4 w-4" style={{ color: '#FF69B4' }} />
						<span className="text-sm font-medium" style={{ color: '#FF69B4' }}>
							{user.username}
						</span>
					</div>
				</Link>
				<Button
					onClick={handleLogout}
					variant="outline"
					className="rounded-full"
					style={{ borderColor: '#FFE4E9', color: '#FF69B4' }}
				>
					<LogOut className="h-4 w-4 mr-2" />
					退出
				</Button>
			</div>
		);
	}

	return (
		<div className="flex items-center gap-3">
			<Link href="/login">
				<Button
					variant="outline"
					className="rounded-full"
					style={{ borderColor: '#87CEEB', color: '#87CEEB' }}
				>
					登录
				</Button>
			</Link>
			<Link href="/register">
				<Button
					className="rounded-full"
					style={{ backgroundColor: '#FF69B4' }}
				>
					注册
				</Button>
			</Link>
		</div>
	);
}
