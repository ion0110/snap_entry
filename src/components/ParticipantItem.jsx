import { useState, useRef } from 'react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { Check, Clock, Building2, User } from 'lucide-react'

export default function ParticipantItem({ participant, onCheckIn }) {
    const { id, name, company, status, check_in_time, memo } = participant
    const isCheckedIn = status === 'checked_in'

    // スワイプ状態
    const [isSwiped, setIsSwiped] = useState(false)
    const touchStartX = useRef(0)
    const touchEndX = useRef(0)

    const handleCheckIn = () => {
        if (!isCheckedIn) {
            onCheckIn(id)
            setIsSwiped(false)
        }
    }

    // タッチイベント処理
    const handleTouchStart = (e) => {
        if (isCheckedIn) return
        touchStartX.current = e.touches[0].clientX
    }

    const handleTouchMove = (e) => {
        if (isCheckedIn) return
        touchEndX.current = e.touches[0].clientX
    }

    const handleTouchEnd = () => {
        if (isCheckedIn) return
        const diff = touchStartX.current - touchEndX.current
        // 左に50px以上スワイプしたらアクション表示
        if (diff > 50) {
            setIsSwiped(true)
        } else if (diff < -30) {
            setIsSwiped(false)
        }
    }

    // カード背景色（チェックイン済みはグレー）
    const cardBg = isCheckedIn
        ? 'bg-slate-100 border-slate-200'
        : 'bg-white border-slate-100'

    return (
        <div
            className={`swipe-container rounded-xl shadow-sm border overflow-hidden ${cardBg} ${isSwiped ? 'swiped' : ''}`}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {/* スワイプアクション部分 */}
            {!isCheckedIn && (
                <div
                    className="swipe-action"
                    onClick={handleCheckIn}
                >
                    <div className="text-center">
                        <Check className="w-6 h-6 mx-auto mb-1" />
                        <span className="text-sm">受付</span>
                    </div>
                </div>
            )}

            {/* メインコンテンツ */}
            <div className={`swipe-content p-4 ${isCheckedIn ? 'bg-slate-100' : 'bg-white'}`}>
                <div className="flex items-start justify-between gap-3">
                    {/* 左側: 情報 */}
                    <div className="flex-1 min-w-0">
                        {/* 氏名 */}
                        <div className="flex items-center gap-2 mb-1">
                            <User className="w-4 h-4 text-slate-400 flex-shrink-0" />
                            <p className={`font-bold truncate ${isCheckedIn ? 'text-slate-500' : 'text-slate-800'}`}>{name}</p>
                        </div>

                        {/* 会社名 */}
                        <div className="flex items-center gap-2 mb-2">
                            <Building2 className="w-4 h-4 text-slate-400 flex-shrink-0" />
                            <p className={`text-sm truncate ${isCheckedIn ? 'text-slate-400' : 'text-slate-600'}`}>{company || '—'}</p>
                        </div>

                        {/* メモ (あれば) */}
                        {memo && (
                            <p className="text-xs text-slate-500 bg-slate-50 rounded-lg px-2 py-1 mt-2 line-clamp-2">
                                {memo}
                            </p>
                        )}

                        {/* 来場時刻 (チェックイン済みの場合) */}
                        {isCheckedIn && check_in_time && (
                            <div className="flex items-center gap-1 mt-2 text-xs text-slate-500">
                                <Clock className="w-3 h-3" />
                                <span>
                                    {format(new Date(check_in_time), 'HH:mm', { locale: ja })}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* 右側: ステータスボタン（PCフォールバック） */}
                    <button
                        onClick={handleCheckIn}
                        disabled={isCheckedIn}
                        className={`flex-shrink-0 w-16 h-16 rounded-xl flex flex-col items-center justify-center gap-1 font-bold text-sm transition-all ${isCheckedIn
                                ? 'bg-slate-200 text-slate-500 cursor-default'
                                : 'bg-slate-100 text-slate-600 hover:bg-[#1e3a5f] hover:text-white active:scale-95'
                            }`}
                    >
                        {isCheckedIn ? (
                            <>
                                <Check className="w-5 h-5" />
                                <span className="text-xs">済</span>
                            </>
                        ) : (
                            <>
                                <span className="text-lg">受付</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}
