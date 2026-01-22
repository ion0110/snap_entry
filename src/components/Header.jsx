import { useAuth } from '../contexts/AuthContext'
import { LogOut, Users, UserCheck, Upload } from 'lucide-react'

export default function Header({ totalCount, checkedInCount, onCsvImport }) {
    const { signOut } = useAuth()

    const handleLogout = async () => {
        try {
            await signOut()
        } catch (err) {
            console.error('ログアウトエラー:', err)
        }
    }

    return (
        <header className="sticky top-0 z-10">
            {/* タイトルバー（ダークグレーブルーの帯） */}
            <div className="bg-[#3d5a73] text-white px-4 py-3">
                <div className="flex items-center justify-between">
                    <h1 className="text-lg font-bold">セミナー受付</h1>
                    <div className="flex items-center gap-2">
                        {/* CSV一括登録ボタン */}
                        <button
                            onClick={onCsvImport}
                            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                            aria-label="CSV一括登録"
                            title="CSV一括登録"
                        >
                            <Upload className="w-5 h-5" />
                        </button>
                        <button
                            onClick={handleLogout}
                            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                            aria-label="ログアウト"
                            title="ログアウト"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* 統計カード */}
            <div className="bg-white/95 backdrop-blur-sm border-b border-slate-100 shadow-sm px-4 py-3">
                <div className="grid grid-cols-2 gap-3">
                    {/* 来場済み */}
                    <div className="bg-gradient-to-br from-[#3d5a73] to-[#2d4a63] rounded-xl p-3 text-white shadow-md">
                        <div className="flex items-center gap-2 mb-1">
                            <UserCheck className="w-4 h-4 opacity-80" />
                            <span className="text-xs opacity-80">来場済み</span>
                        </div>
                        <p className="text-2xl font-bold">{checkedInCount}</p>
                    </div>

                    {/* 予定人数 */}
                    <div className="bg-slate-100 rounded-xl p-3 text-slate-700">
                        <div className="flex items-center gap-2 mb-1">
                            <Users className="w-4 h-4 opacity-60" />
                            <span className="text-xs opacity-60">予定人数</span>
                        </div>
                        <p className="text-2xl font-bold">{totalCount}</p>
                    </div>
                </div>
            </div>
        </header>
    )
}
