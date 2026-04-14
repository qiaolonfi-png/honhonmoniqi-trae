'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface GameRecord {
  id: number
  user_id: string
  scenario: string
  final_score: number
  result: string
  played_at: string
}

export default function ProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [records, setRecords] = useState<GameRecord[]>([])

  useEffect(() => {
    fetchGameRecords()
  }, [])

  const fetchGameRecords = async () => {
    try {
      const response = await fetch('/api/game-records/list', {
        credentials: 'include'
      })

      if (!response.ok) {
        const error = await response.json()
        if (response.status === 401) {
          toast.error('请先登录')
          router.push('/auth/login')
          return
        }
        throw new Error(error.message || '获取游戏记录失败')
      }

      const data = await response.json()
      setRecords(data.records || [])
    } catch (error) {
      console.error('获取游戏记录失败:', error)
      toast.error('获取游戏记录失败')
    } finally {
      setLoading(false)
    }
  }

  const getResultBadge = (result: string) => {
    const resultMap: Record<string, { text: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      success: { text: '成功', variant: 'default' },
      failed: { text: '失败', variant: 'destructive' },
      ongoing: { text: '进行中', variant: 'secondary' }
    }
    const resultInfo = resultMap[result] || { text: result, variant: 'outline' }
    return <Badge variant={resultInfo.variant}>{resultInfo.text}</Badge>
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 50) return 'text-yellow-600'
    return 'text-red-600'
  }

  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            我的游戏记录
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            查看您的历史游戏记录和成绩
          </p>
        </div>

        {/* 返回游戏按钮 */}
        <div className="mb-6">
          <Button
            onClick={() => router.push('/')}
            variant="outline"
          >
            返回游戏选择
          </Button>
        </div>

        {/* 加载状态 */}
        {loading ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-gray-500 dark:text-gray-400">
                加载中...
              </div>
            </CardContent>
          </Card>
        ) : records.length === 0 ? (
          /* 空状态 */
          <Card>
            <CardContent className="py-16">
              <div className="text-center">
                <div className="text-6xl mb-4">🎮</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  还没有游戏记录
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  开始您的第一次模拟之旅吧！
                </p>
                <Button onClick={() => router.push('/')}>
                  开始游戏
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          /* 游戏记录列表 */
          <div className="space-y-4">
            {records.map((record) => (
              <Card key={record.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        {record.scenario}
                      </h3>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {formatDateTime(record.played_at)}
                        </span>
                        {getResultBadge(record.result)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        最终得分
                      </div>
                      <div className={`text-3xl font-bold ${getScoreColor(record.final_score)}`}>
                        {record.final_score}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* 统计信息 */}
        {!loading && records.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="py-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                    {records.length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    游戏总次数
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                    {records.filter(r => r.result === 'success').length}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    成功次数
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="py-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                    {records.length > 0 ? Math.round(records.reduce((sum, r) => sum + r.final_score, 0) / records.length) : 0}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    平均得分
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
