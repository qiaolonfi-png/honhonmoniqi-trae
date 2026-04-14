import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

// GET /api/auth/me - 获取当前用户信息
export async function GET(request: NextRequest) {
	try {
		const token = request.cookies.get('token')?.value;

		console.log('auth/me - all cookies:', request.cookies.getAll());
		console.log('auth/me - token:', token ? 'exists' : 'not found');

		if (!token) {
			return NextResponse.json(
				{ error: '未登录' },
				{ status: 401 }
			);
		}

		const payload = await verifyToken(token);

		if (!payload) {
			return NextResponse.json(
				{ error: 'Token 无效' },
				{ status: 401 }
			);
		}

		return NextResponse.json({
			user: {
				id: payload.userId,
				username: payload.username,
			},
		});
	} catch (error) {
		console.error('获取用户信息失败:', error);
		return NextResponse.json(
			{ error: '获取用户信息失败' },
			{ status: 500 }
		);
	}
}
