import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import ParticipantItem from './ParticipantItem'
import { Loader2, Search, Filter } from 'lucide-react'

export default function ParticipantList({ onCountUpdate }) {
    const [participants, setParticipants] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [filterStatus, setFilterStatus] = useState('all') // 'all', 'pending', 'checked_in'

    // データ取得
    const fetchParticipants = async () => {
        try {
            const { data, error } = await supabase
                .from('participants')
                .select('*')
                .order('created_at', { ascending: true })

            if (error) throw error
            setParticipants(data || [])
            updateCounts(data || [])
        } catch (err) {
            console.error('データ取得エラー:', err)
            setError('データの取得に失敗しました')
        } finally {
            setLoading(false)
        }
    }

    // カウント更新
    const updateCounts = (data) => {
        const total = data.length
        const checkedIn = data.filter((p) => p.status === 'checked_in').length
        onCountUpdate(total, checkedIn)
    }

    // チェックイン処理
    const handleCheckIn = async (id) => {
        try {
            // 対象の参加者を取得してメモを確認
            const participant = participants.find(p => p.id === id)
            const checkInTime = new Date().toISOString()

            // Supabase更新
            const { error } = await supabase
                .from('participants')
                .update({
                    status: 'checked_in',
                    check_in_time: checkInTime,
                })
                .eq('id', id)

            if (error) throw error

            // VIP通知 (メモに「重要」が含まれている場合)
            if (participant && participant.memo && participant.memo.includes('重要')) {
                sendVipNotification(participant, checkInTime)
            }

        } catch (err) {
            console.error('チェックインエラー:', err)
            alert('チェックインに失敗しました')
        }
    }

    // VIP通知送信 (Formspree)
    const sendVipNotification = async (participant, time) => {
        const endpoint = import.meta.env.VITE_FORMSPREE_ENDPOINT
        if (!endpoint) return

        try {
            await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subject: '【VIP来場通知】重要人物が来場しました',
                    name: participant.name,
                    company: participant.company || 'なし',
                    memo: participant.memo,
                    time: new Date(time).toLocaleString('ja-JP'),
                }),
            })
        } catch (err) {
            console.error('通知送信エラー:', err)
            // 通知失敗してもユーザーにはエラーを出さない（UX優先）
        }
    }

    // 初回ロード
    useEffect(() => {
        fetchParticipants()
    }, [])

    // リアルタイム更新
    useEffect(() => {
        const channel = supabase
            .channel('participants-changes')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'participants' },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        setParticipants((prev) => {
                            const updated = [...prev, payload.new]
                            updateCounts(updated)
                            return updated
                        })
                    } else if (payload.eventType === 'UPDATE') {
                        setParticipants((prev) => {
                            const updated = prev.map((p) =>
                                p.id === payload.new.id ? payload.new : p
                            )
                            updateCounts(updated)
                            return updated
                        })
                    } else if (payload.eventType === 'DELETE') {
                        setParticipants((prev) => {
                            const updated = prev.filter((p) => p.id !== payload.old.id)
                            updateCounts(updated)
                            return updated
                        })
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [])

    // フィルタリング
    const filteredParticipants = participants.filter((p) => {
        const matchesSearch =
            p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.company?.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesStatus =
            filterStatus === 'all' || p.status === filterStatus
        return matchesSearch && matchesStatus
    })

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-[#1e3a5f]" />
            </div>
        )
    }

    if (error) {
        return (
            <div className="text-center py-20 text-red-500">
                <p>{error}</p>
                <button
                    onClick={fetchParticipants}
                    className="mt-4 px-4 py-2 bg-[#1e3a5f] text-white rounded-lg"
                >
                    再読み込み
                </button>
            </div>
        )
    }

    return (
        <div className="flex-1 overflow-auto">
            {/* 検索・フィルター */}
            <div className="sticky top-0 z-5 bg-slate-50 px-4 py-3 border-b border-slate-100">
                <div className="flex gap-2">
                    {/* 検索 */}
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="名前・会社名で検索"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
                        />
                    </div>

                    {/* フィルター */}
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
                    >
                        <option value="all">全て</option>
                        <option value="pending">未</option>
                        <option value="checked_in">済</option>
                    </select>
                </div>
            </div>

            {/* リスト */}
            <div className="p-4 space-y-3">
                {filteredParticipants.length === 0 ? (
                    <div className="text-center py-10 text-slate-500">
                        {participants.length === 0
                            ? '参加者がまだ登録されていません'
                            : '該当する参加者がいません'}
                    </div>
                ) : (
                    filteredParticipants.map((participant) => (
                        <ParticipantItem
                            key={participant.id}
                            participant={participant}
                            onCheckIn={handleCheckIn}
                        />
                    ))
                )}
            </div>
        </div>
    )
}
