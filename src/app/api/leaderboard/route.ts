import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function GET(request: NextRequest) {
  try {
    // 获取当前登录用户（可选）
    let currentUserId: number | null = null;
    const token = request.cookies.get('token')?.value;

    if (token) {
      const payload = await verifyToken(token);
      if (payload && payload.userId) {
        currentUserId = payload.userId;
      }
    }

    // 使用Supabase客户端查询排行榜
    const supabase = getSupabaseClient();

    // 查询每个用户的最高分记录
    const { data: leaderboardData, error: leaderboardError } = await supabase
      .rpc('get_leaderboard', { limit_count: 20 });

    if (leaderboardError) {
      console.error('查询排行榜失败:', leaderboardError);
      return NextResponse.json(
        { error: '查询排行榜失败' },
        { status: 500 }
      );
    }

    // 如果RPC不存在，使用备用查询方式
    let leaderboard = leaderboardData;

    if (!leaderboard || leaderboard.length === 0) {
      // 备用方案：使用子查询获取每个用户的最高分
      const { data: backupData, error: backupError } = await supabase
        .from('game_records')
        .select(`
          id,
          user_id,
          final_score,
          played_at,
          scenario,
          users!inner (
            username
          )
        `)
        .order('final_score', { ascending: false })
        .limit(20);

      if (backupError) {
        console.error('备用查询排行榜失败:', backupError);
        return NextResponse.json(
          { error: '查询排行榜失败' },
          { status: 500 }
        );
      }

      // 去重：每个用户只保留最高分
      const userMaxScores = new Map<number, {
        id: number;
        user_id: number;
        final_score: number;
        played_at: string;
        scenario: string;
        username: string;
      }>();

      for (const record of backupData) {
        const recordData = record as {
          id: number;
          user_id: number;
          final_score: number;
          played_at: string;
          scenario: string;
          users: { username: string } | { username: string }[];
        };
        const userId = recordData.user_id;
        const usersArray = Array.isArray(recordData.users) ? recordData.users : [recordData.users];
        const username = usersArray[0]?.username || '匿名用户';

        if (!userMaxScores.has(userId) || recordData.final_score > userMaxScores.get(userId)!.final_score) {
          userMaxScores.set(userId, {
            id: recordData.id,
            user_id: recordData.user_id,
            final_score: recordData.final_score,
            played_at: recordData.played_at,
            scenario: recordData.scenario,
            username
          });
        }
      }

      leaderboard = Array.from(userMaxScores.values())
        .sort((a, b) => b.final_score - a.final_score)
        .slice(0, 20);
    }

    // 格式化返回数据
    const formattedLeaderboard = leaderboard.map((record: {
      id: number;
      user_id: number;
      final_score: number;
      played_at: string;
      scenario: string;
      username?: string;
      users?: { username: string };
    }, index: number) => ({
      rank: index + 1,
      userId: record.user_id,
      username: record.username || record.users?.username || '匿名用户',
      finalScore: record.final_score,
      scenario: record.scenario,
      playedAt: record.played_at
    }));

    return NextResponse.json({
      leaderboard: formattedLeaderboard,
      currentUserId
    });
  } catch (error) {
    console.error('获取排行榜失败:', error);
    return NextResponse.json(
      { error: '获取排行榜失败' },
      { status: 500 }
    );
  }
}
