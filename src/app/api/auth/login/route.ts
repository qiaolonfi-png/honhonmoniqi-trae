import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/auth';

// POST /api/auth/login - 用户登录
export async function POST(request: NextRequest) {
	try {
		const { username, password } = await request.json();

		// 验证输入
		if (!username || !password) {
			return NextResponse.json(
				{ error: '用户名和密码不能为空' },
				{ status: 400 }
			);
		}

		const client = getSupabaseClient();

		// 查找用户
		const { data: user, error } = await client
			.from('users')
			.select('*')
			.eq('username', username)
			.single();

		if (error || !user) {
			return NextResponse.json(
				{ error: '用户名或密码错误' },
				{ status: 401 }
			);
		}

		// 验证密码
		const isValidPassword = await bcrypt.compare(password, user.password);

		if (!isValidPassword) {
			return NextResponse.json(
				{ error: '用户名或密码错误' },
				{ status: 401 }
			);
		}

		// 生成 token
		const token = await signToken({
			userId: user.id,
			username: user.username,
		});

		// 设置 cookie
		const response = NextResponse.json({
			message: '登录成功',
			user: {
				id: user.id,
				username: user.username,
			},
		});

		response.cookies.set('token', token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			maxAge: 60 * 60 * 24 * 7, // 7 days
		});

		console.log('login - setting cookie');
		console.log('login - all cookies in response:', response.cookies.getAll());

		return response;
	} catch (error) {
		console.error('登录失败:', error);
		return NextResponse.json(
			{ error: '登录失败' },
			{ status: 500 }
		);
	}
}
