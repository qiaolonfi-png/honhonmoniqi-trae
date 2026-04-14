import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/auth';

// POST /api/auth/register - 用户注册
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

		// 验证用户名长度
		if (username.length < 3 || username.length > 20) {
			return NextResponse.json(
				{ error: '用户名长度必须在3-20个字符之间' },
				{ status: 400 }
			);
		}

		// 验证密码长度
		if (password.length < 6) {
			return NextResponse.json(
				{ error: '密码长度至少6个字符' },
				{ status: 400 }
			);
		}

		const client = getSupabaseClient();

		// 检查用户名是否已存在
		const { data: existingUser } = await client
			.from('users')
			.select('id')
			.eq('username', username)
			.maybeSingle();

		if (existingUser) {
			return NextResponse.json(
				{ error: '用户名已存在' },
				{ status: 409 }
			);
		}

		// 哈希密码
		const hashedPassword = await bcrypt.hash(password, 10);

		// 创建用户
		const { data, error } = await client
			.from('users')
			.insert({
				username,
				password: hashedPassword,
			})
			.select()
			.single();

		if (error) {
			throw new Error(`注册失败: ${error.message}`);
		}

		// 生成 token
		const token = await signToken({
			userId: data.id,
			username: data.username,
		});

		// 设置 cookie
		const response = NextResponse.json({
			message: '注册成功',
			user: {
				id: data.id,
				username: data.username,
			},
		});

		response.cookies.set('token', token, {
			httpOnly: true,
			secure: process.env.NODE_ENV === 'production',
			sameSite: 'lax',
			maxAge: 60 * 60 * 24 * 7, // 7 days
		});

		console.log('register - setting cookie');
		console.log('register - all cookies in response:', response.cookies.getAll());

		return response;
	} catch (error) {
		console.error('注册失败:', error);
		return NextResponse.json(
			{ error: '注册失败' },
			{ status: 500 }
		);
	}
}
