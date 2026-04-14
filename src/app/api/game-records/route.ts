import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';
import { verifyToken } from '@/lib/auth';

// POST /api/game-records - 保存游戏记录
export async function POST(request: NextRequest) {
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

		const body = await request.json();
		const { scenario, final_score, result } = body;

		// 验证输入
		if (!scenario || final_score === undefined || !result) {
			return NextResponse.json(
				{ error: '缺少必要参数' },
				{ status: 400 }
			);
		}

		// 验证 result 值
		if (!['成功', '失败'].includes(result)) {
			return NextResponse.json(
				{ error: 'result 必须是 "成功" 或 "失败"' },
				{ status: 400 }
			);
		}

		const client = getSupabaseClient();

		// 保存游戏记录
		const { data, error } = await client
			.from('game_records')
			.insert({
				user_id: payload.userId,
				scenario,
				final_score,
				result,
			})
			.select()
			.single();

		if (error) {
			throw new Error(`保存失败: ${error.message}`);
		}

		return NextResponse.json({
			message: '保存成功',
			record: data,
		});
	} catch (error) {
		console.error('保存游戏记录失败:', error);
		return NextResponse.json(
			{ error: '保存失败' },
			{ status: 500 }
		);
	}
}
