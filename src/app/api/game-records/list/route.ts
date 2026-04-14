import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { verifyToken } from '@/lib/auth';

// GET /api/game-records - 获取当前用户的游戏记录
export async function GET(request: NextRequest) {
	try {
		// 验证用户身份
		const token = request.cookies.get('token')?.value;
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

		const client = getSupabaseClient();

		// 获取游戏记录
		const { data, error } = await client
			.from('game_records')
			.select('*')
			.eq('user_id', payload.userId)
			.order('played_at', { ascending: false })
			.limit(100);

		if (error) {
			throw new Error(`获取失败: ${error.message}`);
		}

		return NextResponse.json({
			records: data || [],
		});
	} catch (error) {
		console.error('获取游戏记录失败:', error);
		return NextResponse.json(
			{ error: '获取失败' },
			{ status: 500 }
		);
	}
}
