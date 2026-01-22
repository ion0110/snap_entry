import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Lock, Loader2 } from 'lucide-react'

export default function LockScreen() {
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const { signIn } = useAuth()

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!password.trim()) {
            setError('合言葉を入力してください')
            return
        }

        setLoading(true)
        setError('')

        try {
            await signIn(password)
        } catch (err) {
            console.error('ログインエラー:', err)
            setError('合言葉が正しくありません')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
            <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-8">
                {/* ロックアイコン */}
                <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#1e3a5f] to-[#2d4a63] flex items-center justify-center shadow-lg">
                        <Lock className="w-10 h-10 text-white" />
                    </div>
                </div>

                {/* タイトル */}
                <h1 className="text-xl font-bold text-center text-slate-700 mb-2">
                    セミナー受付
                </h1>
                <p className="text-sm text-center text-slate-500 mb-6">
                    続けるには合言葉を入力してください
                </p>

                {/* フォーム */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="合言葉"
                            className="w-full px-4 py-3 text-lg border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-transparent transition-all"
                            autoFocus
                            disabled={loading}
                        />
                    </div>

                    {error && (
                        <p className="text-red-500 text-sm text-center">{error}</p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 px-4 bg-gradient-to-r from-[#1e3a5f] to-[#2d4a63] text-white font-semibold rounded-xl shadow-md hover:from-[#2d4a63] hover:to-[#1e3a5f] focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:ring-offset-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                確認中...
                            </>
                        ) : (
                            'ログイン'
                        )}
                    </button>
                </form>
            </div>
        </div>
    )
}
