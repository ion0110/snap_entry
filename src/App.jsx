import { useState } from 'react'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { isSupabaseConfigured } from './lib/supabaseClient'
import LockScreen from './components/LockScreen'
import Header from './components/Header'
import ParticipantList from './components/ParticipantList'
import AddParticipantForm from './components/AddParticipantForm'
import CsvImportModal from './components/CsvImportModal'
import { Plus, Loader2, AlertTriangle, Upload } from 'lucide-react'

// Supabase未設定時の画面
function SetupRequired() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-amber-600" />
          </div>
        </div>
        <h1 className="text-xl font-bold text-slate-700 mb-2">
          セットアップが必要です
        </h1>
        <p className="text-sm text-slate-500 mb-6">
          このアプリを使用するには、Supabaseの設定が必要です。
        </p>
        <div className="bg-slate-50 rounded-lg p-4 text-left text-sm">
          <p className="font-bold text-slate-700 mb-2">手順:</p>
          <ol className="list-decimal list-inside space-y-2 text-slate-600">
            <li>Supabaseでプロジェクトを作成</li>
            <li><code className="bg-slate-200 px-1 rounded">.env</code> ファイルを編集</li>
            <li>URL と Anon Key を設定</li>
            <li>開発サーバーを再起動</li>
          </ol>
        </div>
      </div>
    </div>
  )
}

function MainApp() {
  const { isAuthenticated, loading } = useAuth()
  const [totalCount, setTotalCount] = useState(0)
  const [checkedInCount, setCheckedInCount] = useState(0)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isCsvOpen, setIsCsvOpen] = useState(false)

  const handleCountUpdate = (total, checkedIn) => {
    setTotalCount(total)
    setCheckedInCount(checkedIn)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 animate-spin text-[#3d5a73]" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <LockScreen />
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header
        totalCount={totalCount}
        checkedInCount={checkedInCount}
        onCsvImport={() => setIsCsvOpen(true)}
      />

      <ParticipantList onCountUpdate={handleCountUpdate} />

      {/* 追加ボタン (FAB) */}
      <button
        onClick={() => setIsFormOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-[#3d5a73] to-[#2d4a63] text-white rounded-full shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center z-20"
        aria-label="参加者を追加"
      >
        <Plus className="w-7 h-7" />
      </button>

      {/* 追加フォーム */}
      <AddParticipantForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
      />

      {/* CSV一括登録 */}
      <CsvImportModal
        isOpen={isCsvOpen}
        onClose={() => setIsCsvOpen(false)}
      />
    </div>
  )
}

export default function App() {
  // Supabaseが設定されていない場合はセットアップ画面を表示
  if (!isSupabaseConfigured) {
    return <SetupRequired />
  }

  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  )
}
