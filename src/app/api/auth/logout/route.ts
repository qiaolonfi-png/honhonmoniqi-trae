import { NextResponse } from 'next/server';

// POST /api/auth/logout - 用户注销
export async function POST() {
	const response = NextResponse.json({
		message: '注销成功',
	});

	response.cookies.delete('token');

	return response;
}
