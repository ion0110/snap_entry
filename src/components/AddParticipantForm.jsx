import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { X, Loader2, UserPlus } from 'lucide-react'

export default function AddParticipantForm({ isOpen, onClose }) {
    const [name, setName] = useState('')
    const [company, setCompany] = useState('')
    const [memo, setMemo] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!name.trim()) {
            setError('氏名は必須です')
            return
        }

        setLoading(true)
        setError('')

        try {
            const { error: insertError } = await supabase.from('participants').insert({
                name: name.trim(),
                company: company.trim() || null,
                memo: memo.trim() || null,
                status: 'pending',
            })

            if (insertError) throw insertError

            // フォームリセット
            setName('')
            setCompany('')
            setMemo('')
            onClose()
        } catch (err) {
            console.error('登録エラー:', err)
            setError('登録に失敗しました')
        } finally {
            setLoading(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40">
            <div className="w-full max-w-lg bg-white rounded-t-3xl shadow-2xl animate-slide-up safe-area-bottom">
                {/* ヘッダー */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                    <h2 className="text-lg font-bold text-slate-700">参加者を追加</h2>
                    <button
                        onClick={onClose}
                        className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* フォーム */}
                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    {/* 氏名 */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            氏名 <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="山田 太郎"
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] text-base"
                            autoFocus
                        />
                    </div>

                    {/* 会社名 */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            会社名
                        </label>
                        <input
                            type="text"
                            value={company}
                            onChange={(e) => setCompany(e.target.value)}
                            placeholder="株式会社サンプル"
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] text-base"
                        />
                    </div>

                    {/* メモ */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            担当者へのメモ
                        </label>
                        <textarea
                            value={memo}
                            onChange={(e) => setMemo(e.target.value)}
                            placeholder="特記事項があれば記入"
                            rows={2}
                            className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] text-base resize-none"
                        />
                    </div>

                    {error && <p className="text-red-500 text-sm">{error}</p>}

                    {/* 送信ボタン */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-gradient-to-r from-[#1e3a5f] to-[#2d4a63] text-white font-bold rounded-xl shadow-md hover:from-[#2d4a63] hover:to-[#1e3a5f] focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:ring-offset-2 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                登録中...
                            </>
                        ) : (
                            <>
                                <UserPlus className="w-5 h-5" />
                                登録する
                            </>
                        )}
                    </button>
                </form>
            </div>

            <style>{`
        @keyframes slide-up {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-slide-up {
          animation: slide-up 0.3s ease-out;
        }
      `}</style>
        </div>
    )
}
