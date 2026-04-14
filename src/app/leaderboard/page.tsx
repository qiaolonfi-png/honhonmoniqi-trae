'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Trophy, Medal, Award, Crown } from 'lucide-react'
import { toast } from 'sonner'

interface LeaderboardEntry {
  rank: number
  userId: number
  username: string
  finalScore: number
  scenario: string
  playedAt: string
}

export default function LeaderboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [currentUserId, setCurrentUserId] = useState<number | null>(null)

  useEffect(() => {
    fetchLeaderboard()
  }, [])

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch('/api/leaderboard', {
        credentials: 'include'
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || '获取排行榜失败')
      }

      const data = await response.json()
      setLeaderboard(data.leaderboard || [])
      setCurrentUserId(data.currentUserId || null)
    } catch (error) {
      console.error('获取排行榜失败:', error)
      toast.error('获取排行榜失败')
    } finally {
      setLoading(false)
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-8 w-8 text-yellow-500" />
      case 2:
        return <Medal className="h-7 w-7 text-gray-400" />
      case 3:
        return <Award className="h-6 w-6 text-amber-600" />
      default:
        return <span className="text-2xl font-bold text-gray-500">#{rank}</span>
    }
  }

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-50 via-yellow-100 to-yellow-50 border-yellow-300 dark:from-yellow-950/50 dark:via-yellow-900/30 dark:to-yellow-950/50 dark:border-yellow-700'
      case 2:
        return 'bg-gradient-to-r from-gray-50 via-gray-100 to-gray-50 border-gray-300 dark:from-gray-950/50 dark:via-gray-900/30 dark:to-gray-950/50 dark:border-gray-700'
      case 3:
        return 'bg-gradient-to-r from-amber-50 via-amber-100 to-amber-50 border-amber-300 dark:from-amber-950/50 dark:via-amber-900/30 dark:to-amber-950/50 dark:border-amber-700'
      default:
        return 'hover:shadow-lg transition-shadow'
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 80) return 'text-emerald-600'
    if (score >= 70) return 'text-blue-600'
    if (score >= 50) return 'text-yellow-600'
    return 'text-red-600'
  }

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const isCurrentUser = (userId: number) => {
    return currentUserId !== null && userId === currentUserId
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 dark:from-gray-900 dark:via-amber-900/20 dark:to-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* 页面标题 */}
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-4">
            <Trophy className="h-16 w-16 text-yellow-500" />
          </div>
          <h1 className="text-4xl font-bold mb-2" style={{ color: '#FFD700' }}>
            🏆 哄哄大师排行榜
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            看看谁是最会哄女朋友的高手
          </p>
        </div>

        {/* 返回按钮 */}
        <div className="mb-6">
          <Button
            onClick={() => router.push('/')}
            variant="outline"
          >
            ← 返回游戏选择
          </Button>
        </div>

        {/* 当前用户在榜提示 */}
        {currentUserId && leaderboard.some(entry => isCurrentUser(entry.userId)) && (
          <div className="mb-6 p-4 rounded-lg bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-700">
            <p className="text-sm text-purple-700 dark:text-purple-300 text-center">
              ✨ 恭喜！你在排行榜上！
            </p>
          </div>
        )}

        {/* 加载状态 */}
        {loading ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-gray-500 dark:text-gray-400">
                加载中...
              </div>
            </CardContent>
          </Card>
        ) : leaderboard.length === 0 ? (
          /* 空状态 */
          <Card>
            <CardContent className="py-16">
              <div className="text-center">
                <div className="text-6xl mb-4">🎮</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  还没有排行榜数据
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  成为第一个上榜的人吧！
                </p>
                <Button onClick={() => router.push('/')} style={{ backgroundColor: '#FFD700' }}>
                  开始游戏
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* 排行榜列表 */
          <div className="space-y-3">
            {leaderboard.map((entry) => (
              <Card
                key={entry.userId}
                className={`border-2 ${getRankStyle(entry.rank)} ${isCurrentUser(entry.userId) ? 'ring-2 ring-purple-500 ring-offset-2' : ''}`}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {/* 排名 */}
                    <div className="flex-shrink-0 w-16 flex justify-center">
                      {getRankIcon(entry.rank)}
                    </div>

                    {/* 用户信息 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {entry.username}
                        </h3>
                        {isCurrentUser(entry.userId) && (
                          <Badge variant="default" className="bg-purple-500">
                            我
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {entry.scenario}
                      </p>
                    </div>

                    {/* 分数和时间 */}
                    <div className="text-right flex-shrink-0">
                      <div className={`text-3xl font-bold ${getScoreColor(entry.finalScore)} mb-1`}>
                        {entry.finalScore}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDateTime(entry.playedAt)}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* 说明文字 */}
        {!loading && leaderboard.length > 0 && (
          <div className="mt-8 p-6 rounded-xl bg-white/50 dark:bg-gray-800/50 border-2 border-dashed" style={{ borderColor: '#FFD70040' }}>
            <h4 className="text-lg font-semibold mb-3 text-center" style={{ color: '#FFD700' }}>
              📋 排行榜规则
            </h4>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-start gap-2">
                <span>🎯</span>
                <span>排行榜显示每位用户的最高分数记录</span>
              </li>
              <li className="flex items-start gap-2">
                <span>🏆</span>
                <span>分数相同时，按达成时间先后排序</span>
              </li>
              <li className="flex items-start gap-2">
                <span>👤</span>
                <span>只有登录用户的游戏记录才会被计入排行榜</span>
              </li>
              <li className="flex items-start gap-2">
                <span>✨</span>
                <span>快来挑战，争取成为第一名吧！</span>
              </li>
            </ul>
          </div>
        )}

        {/* 底部按钮 */}
        {!loading && (
          <div className="mt-8 text-center">
            <Button
              onClick={() => router.push('/')}
              size="lg"
              style={{ backgroundColor: '#FFD700' }}
              className="hover:scale-105 transition-transform"
            >
              🎮 我也要挑战
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
