import { useState, useRef } from 'react'
import { supabase } from '../lib/supabaseClient'
import { X, Upload, FileText, Loader2, CheckCircle, AlertCircle, Download } from 'lucide-react'

export default function CsvImportModal({ isOpen, onClose }) {
    const [file, setFile] = useState(null)
    const [preview, setPreview] = useState([])
    const [loading, setLoading] = useState(false)
    const [result, setResult] = useState(null)
    const fileInputRef = useRef(null)

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0]
        if (!selectedFile) return

        setFile(selectedFile)
        setResult(null)

        // CSVをパース
        const reader = new FileReader()
        reader.onload = (event) => {
            const text = event.target.result
            const rows = parseCSV(text)
            setPreview(rows.slice(0, 5)) // 最初の5件をプレビュー
        }
        reader.readAsText(selectedFile, 'UTF-8')
    }

    const parseCSV = (text) => {
        const lines = text.split('\n').filter(line => line.trim())
        const rows = []

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim()
            if (!line) continue

            // カンマで分割（簡易パーサー）
            const cols = line.split(',').map(col => col.trim().replace(/^["']|["']$/g, ''))

            // ヘッダー行をスキップ（氏名、名前、name などを含む場合）
            if (i === 0 && (cols[0].toLowerCase().includes('name') || cols[0].includes('氏名') || cols[0].includes('名前'))) {
                continue
            }

            if (cols[0]) {
                rows.push({
                    name: cols[0] || '',
                    company: cols[1] || '',
                    memo: cols[2] || '',
                })
            }
        }
        return rows
    }

    const handleImport = async () => {
        if (!file) return

        setLoading(true)
        setResult(null)

        try {
            const reader = new FileReader()
            reader.onload = async (event) => {
                const text = event.target.result
                const rows = parseCSV(text)

                if (rows.length === 0) {
                    setResult({ success: false, message: 'インポートできるデータがありません' })
                    setLoading(false)
                    return
                }

                // Supabaseに一括挿入
                const insertData = rows.map(row => ({
                    name: row.name,
                    company: row.company || null,
                    memo: row.memo || null,
                    status: 'pending',
                }))

                const { error } = await supabase.from('participants').insert(insertData)

                if (error) throw error

                setResult({ success: true, message: `${rows.length}件の参加者を登録しました` })
                setFile(null)
                setPreview([])
            }
            reader.readAsText(file, 'UTF-8')
        } catch (err) {
            console.error('インポートエラー:', err)
            setResult({ success: false, message: 'インポートに失敗しました' })
        } finally {
            setLoading(false)
        }
    }

    const handleDownloadSample = () => {
        const sampleData = `氏名,会社名,メモ
山田太郎,株式会社サンプル,
鈴木花子,デザイン工房,重要: VIP対応必要
田中一郎,マーケティング社,`

        const blob = new Blob(['\uFEFF' + sampleData], { type: 'text/csv;charset=utf-8' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = 'sample_participants.csv'
        a.click()
        URL.revokeObjectURL(url)
    }

    const handleClose = () => {
        setFile(null)
        setPreview([])
        setResult(null)
        onClose()
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-auto">
                {/* ヘッダー */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                    <h2 className="text-lg font-bold text-slate-700">CSV一括登録</h2>
                    <button
                        onClick={handleClose}
                        className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-4 space-y-4">
                    {/* CSV形式の説明 */}
                    <div className="bg-slate-50 rounded-lg p-3">
                        <p className="text-sm font-medium text-slate-700 mb-2">CSVファイルの形式</p>
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-slate-500">
                                    <th className="pb-1">列1</th>
                                    <th className="pb-1">列2</th>
                                    <th className="pb-1">列3</th>
                                </tr>
                            </thead>
                            <tbody className="text-slate-700">
                                <tr>
                                    <td className="font-medium">氏名 <span className="text-red-500">*</span></td>
                                    <td>会社名</td>
                                    <td>メモ</td>
                                </tr>
                            </tbody>
                        </table>
                        <p className="text-xs text-slate-500 mt-2">※ 1行目がヘッダーの場合は自動でスキップされます</p>
                        <button
                            onClick={handleDownloadSample}
                            className="mt-2 text-sm text-[#3d5a73] hover:underline flex items-center gap-1"
                        >
                            <Download className="w-4 h-4" />
                            サンプルCSVをダウンロード
                        </button>
                    </div>

                    {/* ファイル選択 */}
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center cursor-pointer hover:border-[#3d5a73] hover:bg-slate-50 transition-all"
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".csv"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                        {file ? (
                            <div className="flex items-center justify-center gap-2 text-[#3d5a73]">
                                <FileText className="w-6 h-6" />
                                <span className="font-medium">{file.name}</span>
                            </div>
                        ) : (
                            <div className="text-slate-500">
                                <Upload className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                <p>CSVファイルをクリックして選択</p>
                            </div>
                        )}
                    </div>

                    {/* プレビュー */}
                    {preview.length > 0 && (
                        <div className="bg-slate-50 rounded-lg p-3">
                            <p className="text-sm font-medium text-slate-700 mb-2">プレビュー（最初の5件）</p>
                            <div className="space-y-1 text-sm">
                                {preview.map((row, i) => (
                                    <div key={i} className="flex gap-2 text-slate-600">
                                        <span className="font-medium">{row.name}</span>
                                        {row.company && <span className="text-slate-400">/ {row.company}</span>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 結果表示 */}
                    {result && (
                        <div className={`flex items-center gap-2 p-3 rounded-lg ${result.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                            {result.success ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                            <span>{result.message}</span>
                        </div>
                    )}

                    {/* ボタン */}
                    <button
                        onClick={handleImport}
                        disabled={!file || loading}
                        className="w-full py-3 bg-gradient-to-r from-[#3d5a73] to-[#2d4a63] text-white font-bold rounded-xl shadow-md hover:from-[#2d4a63] hover:to-[#1e3a5f] focus:outline-none focus:ring-2 focus:ring-[#3d5a73] focus:ring-offset-2 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                インポート中...
                            </>
                        ) : (
                            <>
                                <Upload className="w-5 h-5" />
                                インポート実行
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}
