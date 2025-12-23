'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Upload, MousePointer, Download, AlertTriangle, Zap, Image, Settings, HelpCircle, ExternalLink, MessageSquare, ChevronDown, ChevronUp, ArrowUp, ArrowRight } from 'lucide-react'
import { FeedbackModal } from '../../components/FeedbackModal'

// マニュアルトップへ戻るリンクコンポーネント
const BackToToc = () => (
    <div className="flex justify-end mt-4 pt-2 border-t border-gray-100 dark:border-gray-700">
        <a
            href="#"
            onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors cursor-pointer"
        >
            <ArrowUp className="w-3 h-3" />
            マニュアルトップへ戻る
        </a>
    </div>
)

export default function ManualPage() {
    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false)
    const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set([1])) // ステップ1はデフォルトで開く
    const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())

    const toggleStep = (step: number) => {
        setExpandedSteps(prev => {
            const newSet = new Set(prev)
            if (newSet.has(step)) {
                newSet.delete(step)
            } else {
                newSet.add(step)
            }
            return newSet
        })
    }

    const toggleSection = (section: string) => {
        setExpandedSections(prev => {
            const newSet = new Set(prev)
            if (newSet.has(section)) {
                newSet.delete(section)
            } else {
                newSet.add(section)
            }
            return newSet
        })
    }


    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800 py-8 px-4 relative">
            {/* Feedback Floating Button */}
            <div className="absolute top-4 right-4 z-50">
                <button
                    onClick={() => setIsFeedbackModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-full shadow-sm transition-all hover:scale-105 active:scale-95 group"
                >
                    <MessageSquare className="w-4 h-4" />
                    <span className="text-sm font-medium">意見を送る</span>
                </button>
            </div>
            <div className="max-w-4xl mx-auto">
                {/* ヘッダー */}
                <div className="mb-8">
                    <Link
                        href="/"
                        className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" aria-hidden="true" focusable="false" />
                        ツールに戻る
                    </Link>
                    <div className="flex items-center gap-4">
                        <img src="/apng-generator-icon.svg" alt="APNG Generator" className="h-12 w-12" />
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                                APNG Generator
                            </h1>
                            <p className="text-lg text-gray-600 dark:text-gray-400">使い方ガイド</p>
                        </div>
                    </div>
                </div>

                {/* 目次 */}
                <nav id="toc" aria-label="目次" className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 mb-6">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-3">目次</h2>
                    <ul className="space-y-2 text-sm">
                        <li>
                            <a href="#steps" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1">
                                <Zap className="w-4 h-4 text-yellow-500" /> アニメーションPNG作成手順
                            </a>
                            <ul className="ml-5 mt-1 space-y-1">
                                <li>
                                    <a href="#step1" className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-300">
                                        └ 1. 画像を選択
                                    </a>
                                </li>
                                <li>
                                    <a href="#step2" className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-300">
                                        └ 2. トランジション効果を選択
                                    </a>
                                </li>
                                <li>
                                    <a href="#step3" className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-300">
                                        └ 3. プレビュー確認 & APNG生成
                                    </a>
                                </li>
                                <li>
                                    <a href="/effects" className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300">
                                        └ ※補足資料. トランジション効果一覧
                                    </a>
                                </li>
                            </ul>
                        </li>
                        <li>
                            <a href="#cocofolia" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1">
                                <Settings className="w-4 h-4 text-green-500" /> ココフォリアでの使い方
                            </a>
                            <ul className="ml-5 mt-1 space-y-1">
                                <li>
                                    <a href="#cocofolia-foreground" className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-300">
                                        └ 前景・背景として使う
                                    </a>
                                </li>
                                <li>
                                    <a href="#cocofolia-panel" className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-300">
                                        └ スクリーン/マーカーパネル
                                    </a>
                                </li>
                                <li>
                                    <a href="#cocofolia-cutin" className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-300">
                                        └ カットインとして使う
                                    </a>
                                </li>
                                <li>
                                    <a href="#cocofolia-character" className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-300">
                                        └ 立ち絵として使う
                                    </a>
                                </li>
                            </ul>
                        </li>
                        <li>
                            <a href="#faq" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1">
                                <HelpCircle className="w-4 h-4 text-blue-500" /> よくある質問
                            </a>
                        </li>
                        <li>
                            <a href="#links" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1">
                                <ExternalLink className="w-4 h-4 text-gray-500" /> 関連リンク
                            </a>
                        </li>
                    </ul>
                </nav>

                {/* アニメーションPNG作成手順 */}
                <section id="steps" className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 mb-6">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
                        <Zap className="w-5 h-5 mr-2 text-yellow-500" aria-hidden="true" focusable="false" />
                        アニメーションPNG作成手順
                    </h2>

                    {/* ステップ1 */}
                    <div id="step1" className="mb-4 border border-blue-200 dark:border-blue-800 rounded-lg overflow-hidden">
                        <div className="bg-blue-50 dark:bg-blue-900/30 p-3 flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-white font-bold">1</span>
                            </div>
                            <div className="flex-1 text-left">
                                <h3 className="font-semibold text-gray-800 dark:text-white">画像を選択</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-300">PNG/JPG画像をドラッグ＆ドロップ</p>
                            </div>
                        </div>
                        <div className="p-4 bg-white dark:bg-slate-700">
                            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600 dark:text-gray-300 mb-3">
                                <li>画面左側の<strong>「画像選択＆プレビュー」</strong>パネルに画像をドロップ</li>
                                <li>プレビューキャンバスに画像が表示されます</li>
                            </ol>
                            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded p-2 mb-3 text-sm text-green-700 dark:text-green-300">
                                💡 <strong>ポイント:</strong> 透過PNG画像を使うと、背景が透明なAPNGが作れます
                            </div>
                            <div className="max-w-[70%] mx-auto rounded overflow-hidden border border-gray-200 dark:border-gray-600">
                                <img
                                    src="/manual/step1_upload.png"
                                    alt="画像選択パネルの位置を示す画面"
                                    className="w-full"
                                    loading="lazy"
                                    decoding="async"
                                    width="800"
                                    height="450"
                                />
                            </div>
                        </div>
                    </div>

                    {/* ステップ2 */}
                    <div id="step2" className="mb-4 border border-blue-200 dark:border-blue-800 rounded-lg overflow-hidden">
                        <div className="bg-blue-50 dark:bg-blue-900/30 p-3 flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-white font-bold">2</span>
                            </div>
                            <div className="flex-1 text-left">
                                <h3 className="font-semibold text-gray-800 dark:text-white">トランジション効果を選択</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-300">登場・退場・演出から選択 + 共通設定を調整</p>
                            </div>
                        </div>
                        <div className="p-4 bg-white dark:bg-slate-700">
                            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600 dark:text-gray-300 mb-3">
                                <li>画像をセットしたら、<strong>登場・退場・演出</strong>から選択</li>
                                <li>各トランジションを選択すると、セットした画像がプレビュー再生される</li>
                                <li>効果オプションがあるもの（上下左右、大中小など）は、効果オプションを選ぶ</li>
                            </ol>

                            <div className="grid grid-cols-3 gap-2 mb-3">
                                <div className="bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500 p-2 rounded">
                                    <span className="font-bold text-blue-700 dark:text-blue-300 text-sm">登場</span>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">現れる効果</p>
                                </div>
                                <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-2 rounded">
                                    <span className="font-bold text-red-700 dark:text-red-300 text-sm">退場</span>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">消える効果</p>
                                </div>
                                <div className="bg-purple-50 dark:bg-purple-900/30 border-l-4 border-purple-500 p-2 rounded">
                                    <span className="font-bold text-purple-700 dark:text-purple-300 text-sm">演出</span>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">ループ効果</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                                <div className="rounded overflow-hidden border border-gray-200 dark:border-gray-600">
                                    <img
                                        src="/manual/step2_transition_entrance.png"
                                        alt="登場トランジション効果の選択画面"
                                        className="w-full"
                                        loading="lazy"
                                        decoding="async"
                                        width="800"
                                        height="300"
                                    />
                                </div>
                                <div className="rounded overflow-hidden border border-gray-200 dark:border-gray-600">
                                    <img
                                        src="/manual/step2_effect_options.png"
                                        alt="効果オプション（方向など）の選択画面"
                                        className="w-full"
                                        loading="lazy"
                                        decoding="async"
                                        width="800"
                                        height="200"
                                    />
                                </div>
                            </div>



                            <ol start={4} className="list-decimal list-inside space-y-2 text-sm text-gray-600 dark:text-gray-300 mb-3">
                                <li>共通設定を必要に応じて調整</li>
                            </ol>

                            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded p-3 mb-3">
                                <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">⚙️ 共通設定のポイント</p>
                                <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                                    <li>• <strong>ループ ON</strong>：アニメーションを繰り返し再生</li>
                                    <li>• <strong>ループ OFF</strong>：アニメーションを1回だけ再生</li>
                                    <li>• <strong>容量制限</strong>：生成するファイルサイズの上限を設定（例：5MBを選択すると5MB以下に自動調整されます）</li>
                                    <li>• <strong>再生スピード</strong>：アニメーションの速度（0.25x〜2.0x）</li>
                                    <li>• <strong>フレームレート</strong>：1秒あたりのコマ数（10〜40fps）。高いほど滑らかだがファイルサイズ増</li>
                                </ul>
                            </div>
                            <div className="max-w-[70%] mx-auto rounded overflow-hidden border border-gray-200 dark:border-gray-600">
                                <img
                                    src="/manual/step2_common_settings.png"
                                    alt="共通設定画面"
                                    className="w-full"
                                    loading="lazy"
                                    decoding="async"
                                    width="800"
                                    height="200"
                                />
                            </div>
                        </div>
                    </div>

                    {/* ステップ3 */}
                    <div id="step3" className="border border-indigo-200 dark:border-indigo-800 rounded-lg overflow-hidden">
                        <div className="bg-indigo-50 dark:bg-indigo-900/30 p-3 flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-white font-bold">3</span>
                            </div>
                            <div className="flex-1 text-left">
                                <h3 className="font-semibold text-gray-800 dark:text-white">プレビュー確認 & APNG生成</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-300">「APNG生成」ボタンでダウンロード</p>
                            </div>
                        </div>
                        <div className="p-4 bg-white dark:bg-slate-700">
                            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600 dark:text-gray-300 mb-3">
                                <li>効果を選択すると自動でプレビュー再生</li>
                                <li><strong>「APNG生成」</strong>ボタンをクリック</li>
                                <li>自動的にダウンロードされます</li>
                            </ol>
                            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded p-2 text-sm text-green-700 dark:text-green-300 mb-3">
                                ✅ 容量制限を超えた場合は自動で圧縮されます
                            </div>
                            <div className="max-w-[70%] mx-auto rounded overflow-hidden border border-gray-200 dark:border-gray-600 mb-3">
                                <img
                                    src="/manual/step3_generate_button.png"
                                    alt="APNG生成ボタンの位置（上下どちらでもOK）"
                                    className="w-full"
                                    loading="lazy"
                                    decoding="async"
                                    width="800"
                                    height="450"
                                />
                            </div>
                            {/* 生成中・完了の横並び画像 */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                <div className="rounded overflow-hidden border border-gray-200 dark:border-gray-600">
                                    <img
                                        src="/manual/step3_generating.png"
                                        alt="APNG生成中の画面"
                                        className="w-full"
                                        loading="lazy"
                                        decoding="async"
                                        width="400"
                                        height="300"
                                    />
                                </div>
                                <div className="rounded overflow-hidden border border-gray-200 dark:border-gray-600">
                                    <img
                                        src="/manual/step3_complete.png"
                                        alt="APNG生成完了の画面"
                                        className="w-full"
                                        loading="lazy"
                                        decoding="async"
                                        width="400"
                                        height="300"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 補足事項 */}
                    <div id="step-supplement" className="border border-purple-200 dark:border-purple-800 rounded-lg overflow-hidden">
                        <div className="bg-purple-50 dark:bg-purple-900/30 p-3 flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-white font-bold text-xl">💡</span>
                            </div>
                            <div className="flex-1 text-left">
                                <h3 className="font-semibold text-gray-800 dark:text-white">補足事項</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-300">トランジション効果の詳しいカタログ</p>
                            </div>
                        </div>
                        <div className="p-4 bg-white dark:bg-slate-700">
                            <a href="/effects" className="block group relative overflow-hidden rounded-xl border-2 border-purple-100 dark:border-purple-800 hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-300">
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 opacity-50 group-hover:opacity-100 transition-opacity" />
                                <div className="relative p-6 flex flex-col sm:flex-row items-center gap-6">
                                    <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-full shadow-md flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform duration-300">
                                        <Zap className="w-8 h-8" />
                                    </div>
                                    <div className="flex-1 text-center sm:text-left">
                                        <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors">
                                            ✨ トランジション効果カタログ
                                        </h4>

                                        <div className="inline-flex items-center text-sm font-semibold text-purple-600 dark:text-purple-400">
                                            全効果一覧を見る <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </div>
                                </div>
                            </a>
                        </div>
                    </div>
                    <BackToToc />
                </section>

                {/* ココフォリア設定ガイド */}
                <section id="cocofolia" className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 mb-6">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
                        <Settings className="w-5 h-5 mr-2 text-green-500" aria-hidden="true" focusable="false" />
                        ココフォリアでの使い方
                    </h2>

                    <div className="space-y-4">
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                            <div className="flex items-start">
                                <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" aria-hidden="true" focusable="false" />
                                <div>
                                    <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">重要：ファイルサイズガイドライン</h4>
                                    <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-3">
                                        画像のアップロード上限を超えると圧縮確認が表示される場合があります。
                                        圧縮が適用されるとAPNGアニメーションが動作しなくなるため、
                                        ココフォリアでAPNGを使う場合は、以下ファイル容量を目安にお願いします。
                                    </p>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center gap-2">
                                            <span className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-0.5 rounded font-medium">5MB以下</span>
                                            <span className="text-yellow-700 dark:text-yellow-300">キャラクターイラスト・前景・背景</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 px-2 py-0.5 rounded font-medium">1MB以下</span>
                                            <span className="text-yellow-700 dark:text-yellow-300">スクリーンパネル・マーカーパネル</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 1. 前景・背景 */}
                        <div id="cocofolia-foreground" className="mb-4 border border-blue-200 dark:border-blue-800 rounded-lg overflow-hidden">
                            <div className="bg-blue-50 dark:bg-blue-900/30 p-3 flex items-center gap-3">
                                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-white text-lg">🖼️</span>
                                </div>
                                <div className="flex-1 text-left">
                                    <h3 className="font-semibold text-gray-800 dark:text-white">前景・背景として使う</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">📦 5MB以下 / 🔄 ループ: 用途による</p>
                                </div>
                            </div>
                            <div className="p-4 bg-white dark:bg-slate-700">
                                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600 dark:text-gray-300 mb-3">
                                    <li>ココフォリアのルーム画面のなにもない所で<strong>右クリック</strong></li>
                                    <li><strong>「前景・背景を変更」</strong>をクリック</li>
                                    <li><strong>「背景」</strong>（または前景）を選択し、設定したい画像をアップロード</li>
                                    <li>設定する画像を選択する</li>
                                    <li>ルーム全体にアニメーション演出が適用されます</li>
                                </ol>
                                {/* 2枚の画像を横並び */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                                    <div className="rounded overflow-hidden border border-gray-200 dark:border-gray-600">
                                        <img
                                            src="/manual/cocofolia_rightclick_menu.png"
                                            alt="ココフォリアで右クリック→前景・背景を変更"
                                            className="w-full"
                                            loading="lazy"
                                            decoding="async"
                                            width="600"
                                            height="400"
                                        />
                                    </div>
                                    <div className="rounded overflow-hidden border border-gray-200 dark:border-gray-600">
                                        <img
                                            src="/manual/cocofolia_select_image.png"
                                            alt="背景を選択して画像をアップロード"
                                            className="w-full"
                                            loading="lazy"
                                            decoding="async"
                                            width="800"
                                            height="400"
                                        />
                                    </div>
                                </div>

                                {/* 前景・背景の補足説明 */}
                                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-3">
                                    <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">💡 補足：前景・背景の仕組み</p>
                                    <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                                        <li>• <strong>背景を設定</strong>すると、自動的に前景にも同じ画像が設定されます</li>
                                        <li>• さらに<strong>前景を設定</strong>すると、背景と同じ画像の上に前景が重ねて表示されます</li>
                                    </ul>
                                </div>
                                {/* 前景・背景の図解 */}
                                <div className="max-w-[70%] mx-auto mb-3 rounded overflow-hidden border border-gray-200 dark:border-gray-600">
                                    <img
                                        src="/manual/foreground_background_explanation.png"
                                        alt="前景・背景レイヤーの仕組み図解"
                                        className="w-full"
                                        loading="lazy"
                                        decoding="async"
                                        width="1024"
                                        height="576"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 2. スクリーン/マーカーパネル */}
                        <div id="cocofolia-panel" className="mb-4 border border-orange-200 dark:border-orange-800 rounded-lg overflow-hidden">
                            <div className="bg-orange-50 dark:bg-orange-900/30 p-3 flex items-center gap-3">
                                <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-white text-lg">📺</span>
                                </div>
                                <div className="flex-1 text-left">
                                    <h3 className="font-semibold text-gray-800 dark:text-white">スクリーン/マーカーパネルとして使う</h3>
                                    <p className="text-sm text-orange-600 dark:text-orange-300">📦 1MB未満（必須） / 🔄 ループ: 用途による</p>
                                </div>
                            </div>
                            <div className="p-4 bg-white dark:bg-slate-700">
                                {/* 制限事項比較表 */}
                                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-lg p-4 mb-3">
                                    <p className="font-bold text-yellow-800 dark:text-yellow-200 mb-2">⚠️ 制限事項まとめ</p>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead>
                                                <tr className="border-b border-yellow-300 dark:border-yellow-700">
                                                    <th className="text-left py-1 px-2 text-yellow-700 dark:text-yellow-300">項目</th>
                                                    <th className="text-center py-1 px-2 text-yellow-700 dark:text-yellow-300">スクリーンパネル</th>
                                                    <th className="text-center py-1 px-2 text-yellow-700 dark:text-yellow-300">マーカーパネル</th>
                                                </tr>
                                            </thead>
                                            <tbody className="text-gray-700 dark:text-gray-300">
                                                <tr className="border-b border-yellow-200 dark:border-yellow-800">
                                                    <td className="py-1 px-2">容量制限</td>
                                                    <td className="text-center py-1 px-2">1MB未満</td>
                                                    <td className="text-center py-1 px-2">1MB未満</td>
                                                </tr>
                                                <tr className="border-b border-yellow-200 dark:border-yellow-800">
                                                    <td className="py-1 px-2">ループON</td>
                                                    <td className="text-center py-1 px-2">✅ 必須</td>
                                                    <td className="text-center py-1 px-2">⭕ 任意</td>
                                                </tr>
                                                <tr>
                                                    <td className="py-1 px-2">ループOFF</td>
                                                    <td className="text-center py-1 px-2">❌ 実質不可</td>
                                                    <td className="text-center py-1 px-2">⭕ 可能（※）</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-2">※ 非ループの2回目以降再生にはNOIMAGE→再設定が必要</p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                                    <div>
                                        <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2">スクリーンパネル</h4>
                                        <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600 dark:text-gray-300">
                                            <li>画面左上の「≡」メニュー →「スクリーンパネル」を選択</li>
                                            <li>「+」ボタンで新規パネルを作成</li>
                                            <li>「画像」欄にAPNGファイルをドラッグ&ドロップ</li>
                                            <li>位置・サイズを調整して配置</li>
                                        </ol>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2">マーカーパネル</h4>
                                        <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600 dark:text-gray-300">
                                            <li>画面左上の「≡」メニュー →「マーカーパネル」を選択</li>
                                            <li>「+」ボタンで新規マーカーを作成</li>
                                            <li>「画像」欄にAPNGファイルをドラッグ&ドロップ</li>
                                            <li>マップ上の任意の場所に配置</li>
                                        </ol>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                                    <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-2">
                                        <img
                                            src="/manual/cocofolia_screen_panel.png"
                                            alt="ココフォリアでのスクリーンパネル設定画面"
                                            className="w-full rounded border border-gray-200 dark:border-gray-600"
                                            loading="lazy"
                                            decoding="async"
                                            width="800"
                                            height="450"
                                        />
                                    </div>
                                    <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-2">
                                        <img
                                            src="/manual/cocofolia_marker_panel.png"
                                            alt="ココフォリアでのマーカーパネル設定画面"
                                            className="w-full rounded border border-gray-200 dark:border-gray-600"
                                            loading="lazy"
                                            decoding="async"
                                            width="800"
                                            height="450"
                                        />
                                    </div>
                                </div>

                                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
                                    <p className="text-sm font-medium text-red-700 dark:text-red-300 mb-1">⚠️ スクリーンパネルの制限</p>
                                    <ul className="text-sm text-red-600 dark:text-red-400 space-y-1">
                                        <li>• <strong>容量:</strong> 1MB未満必須（超えると圧縮されアニメーションが動作しません）</li>
                                        <li>• <strong>ループ:</strong> ON必須（非ループAPNGは実質使用不可）</li>
                                    </ul>
                                    <p className="text-xs text-red-500 dark:text-red-400 mt-2">※ 非ループAPNGはブラウザキャッシュの影響で初回以降再生されません</p>
                                </div>
                            </div>
                        </div>

                        {/* 3. カットイン */}
                        <div id="cocofolia-cutin" className="mb-4 border border-purple-200 dark:border-purple-800 rounded-lg overflow-hidden">
                            <div className="bg-purple-50 dark:bg-purple-900/30 p-3 flex items-center gap-3">
                                <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-white text-lg">⚡</span>
                                </div>
                                <div className="flex-1 text-left">
                                    <h3 className="font-semibold text-gray-800 dark:text-white">カットインとして使う</h3>
                                    <p className="text-sm text-purple-600 dark:text-purple-300">📦 5MB以下 / 🔄 ループ: ON（必須）</p>
                                </div>
                            </div>
                            <div className="p-4 bg-white dark:bg-slate-700">
                                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-2">
                                    <p className="text-sm text-blue-700 dark:text-blue-300">
                                        ※カットイン用のAPNGはループONでお願いします。<br />
                                        （現状、ループOFFの場合、カットインでアニメーションが読み込みされないため）
                                    </p>
                                </div>
                                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600 dark:text-gray-300 mb-3">
                                    <li>ココフォリアでキャラクターを選択</li>
                                    <li>「カットイン」タブを開く</li>
                                    <li>生成したAPNGファイルを設定</li>
                                </ol>
                                <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-2">
                                    <img
                                        src="/manual/cocofolia_cutin.png"
                                        alt="ココフォリアでのカットイン設定画面"
                                        className="w-full rounded border border-gray-200 dark:border-gray-600"
                                        loading="lazy"
                                        decoding="async"
                                        width="800"
                                        height="450"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 4. 立ち絵 */}
                        <div id="cocofolia-character" className="mb-4 border border-green-200 dark:border-green-800 rounded-lg overflow-hidden">
                            <div className="bg-green-50 dark:bg-green-900/30 p-3 flex items-center gap-3">
                                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="text-white text-lg">🧍</span>
                                </div>
                                <div className="flex-1 text-left">
                                    <h3 className="font-semibold text-gray-800 dark:text-white">立ち絵として使う</h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">📦 5MB以下 / 🔄 ループ: 用途による</p>
                                </div>
                            </div>
                            <div className="p-4 bg-white dark:bg-slate-700">
                                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600 dark:text-gray-300 mb-3">
                                    <li>ココフォリアでキャラクターを選択</li>
                                    <li>「キャラクター」タブを開く</li>
                                    <li>生成したAPNGファイルをドラッグ&ドロップ</li>
                                    <li>立ち絵がアニメーションで表示されます</li>
                                </ol>
                                <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-2">
                                    <img
                                        src="/manual/cocofolia_character.png"
                                        alt="ココフォリアでのキャラクター立ち絵設定画面"
                                        className="w-full rounded border border-gray-200 dark:border-gray-600"
                                        loading="lazy"
                                        decoding="async"
                                        width="800"
                                        height="450"
                                    />
                                </div>
                            </div>
                        </div>
                        <BackToToc />
                    </div>
                </section>

                {/* FAQ */}
                <section id="faq" className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 mb-6">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
                        <HelpCircle className="w-5 h-5 mr-2 text-blue-500" aria-hidden="true" focusable="false" />
                        よくある質問
                    </h2>

                    {/* よくある問題トップ表示 */}
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
                        <p className="font-bold text-red-700 dark:text-red-300 mb-2 flex items-center">
                            <AlertTriangle className="w-4 h-4 mr-2" />
                            最もよくある問題
                        </p>
                        <ul className="text-sm text-red-600 dark:text-red-400 space-y-1">
                            <li>• <strong>圧縮確認で「はい」を選んでしまった</strong> → 「いいえ」を選択し直してください</li>
                            <li>• <strong>カットインが動かない</strong> → ループをONにして再生成してください</li>
                            <li>• <strong>パネルでアニメーションが動かない</strong> → 1MB未満で再生成してください</li>
                        </ul>
                    </div>

                    {/* カテゴリタブ */}
                    <div className="flex flex-wrap gap-2 mb-4">
                        {['すべて', 'アニメーション問題', 'ココフォリア', '設定・画質'].map(cat => (
                            <button
                                key={cat}
                                onClick={() => setExpandedSections(prev => {
                                    const newSet = new Set(prev)
                                    newSet.forEach(s => { if (s.startsWith('faq-cat-')) newSet.delete(s) })
                                    newSet.add(`faq-cat-${cat}`)
                                    return newSet
                                })}
                                className={`px-3 py-1 text-sm rounded-full transition-colors ${(expandedSections.has(`faq-cat-${cat}`) || (!Array.from(expandedSections).some(s => s.startsWith('faq-cat-')) && cat === 'すべて'))
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    <div className="space-y-3">
                        {/* Q1: アニメーションが動かない - カテゴリ: アニメーション問題 */}
                        {(expandedSections.has('faq-cat-すべて') || expandedSections.has('faq-cat-アニメーション問題') || !Array.from(expandedSections).some(s => s.startsWith('faq-cat-'))) && (
                            <details className="group border-b border-gray-200 dark:border-gray-700 pb-3">
                                <summary className="cursor-pointer font-semibold text-gray-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition list-none flex items-center gap-2">
                                    <span className="text-xs bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 px-1.5 py-0.5 rounded">問題</span>
                                    Q. アニメーションが動かない
                                </summary>
                                <div className="mt-3 ml-7 text-sm text-gray-600 dark:text-gray-300 space-y-2">
                                    <p>以下を確認してください：</p>
                                    <ul className="list-disc list-inside space-y-1 ml-4">
                                        <li>ココフォリアで「圧縮しますか？」→<strong>「いいえ」</strong>を選択</li>
                                        <li>カットインの場合は<strong>ループON</strong>で生成</li>
                                        <li>パネル系は<strong>1MB未満</strong>で生成</li>
                                    </ul>
                                </div>
                            </details>
                        )}

                        {/* Q2: 画質が悪い - カテゴリ: 設定・画質 */}
                        {(expandedSections.has('faq-cat-すべて') || expandedSections.has('faq-cat-設定・画質') || !Array.from(expandedSections).some(s => s.startsWith('faq-cat-'))) && (
                            <details className="group border-b border-gray-200 dark:border-gray-700 pb-3">
                                <summary className="cursor-pointer font-semibold text-gray-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition list-none flex items-center gap-2">
                                    <span className="text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 px-1.5 py-0.5 rounded">設定</span>
                                    Q. 画質が悪い
                                </summary>
                                <div className="mt-3 ml-7 text-sm text-gray-600 dark:text-gray-300 space-y-2">
                                    <p>容量制限により自動で解像度が下がります。用途に応じて設定を調整：</p>
                                    <ul className="list-disc list-inside space-y-1 ml-4">
                                        <li><strong>立ち絵/前景/背景</strong>：「5MB」を選択可</li>
                                        <li><strong>スクリーン/マーカーパネル</strong>：「1MB」推奨</li>
                                    </ul>
                                </div>
                            </details>
                        )}

                        {/* Q3: 透過部分が真っ白 - カテゴリ: 設定・画質 */}
                        {(expandedSections.has('faq-cat-すべて') || expandedSections.has('faq-cat-設定・画質') || !Array.from(expandedSections).some(s => s.startsWith('faq-cat-'))) && (
                            <details className="group border-b border-gray-200 dark:border-gray-700 pb-3">
                                <summary className="cursor-pointer font-semibold text-gray-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition list-none flex items-center gap-2">
                                    <span className="text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 px-1.5 py-0.5 rounded">設定</span>
                                    Q. 透過部分が真っ白になる
                                </summary>
                                <div className="mt-3 ml-7 text-sm text-gray-600 dark:text-gray-300">
                                    <p>元画像が<strong>PNG形式で透過情報を持っているか</strong>確認してください。JPG形式は透過に対応していません。</p>
                                </div>
                            </details>
                        )}

                        {/* Q4: ループOFFで再生されない - カテゴリ: ココフォリア */}
                        {(expandedSections.has('faq-cat-すべて') || expandedSections.has('faq-cat-ココフォリア') || !Array.from(expandedSections).some(s => s.startsWith('faq-cat-'))) && (
                            <details className="group border-b border-gray-200 dark:border-gray-700 pb-3">
                                <summary className="cursor-pointer font-semibold text-gray-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition list-none flex items-center gap-2">
                                    <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-1.5 py-0.5 rounded">ココフォ</span>
                                    Q. ループOFFのAPNGが再生されない
                                </summary>
                                <div className="mt-3 ml-7 text-sm text-gray-600 dark:text-gray-300 space-y-2">
                                    <p><strong>カットインにはループONが推奨</strong>です。ループOFFは立ち絵の登場演出向けです。</p>
                                </div>
                            </details>
                        )}



                        {/* Q6: 2回目以降再生されない - カテゴリ: アニメーション問題 */}
                        {(expandedSections.has('faq-cat-すべて') || expandedSections.has('faq-cat-アニメーション問題') || !Array.from(expandedSections).some(s => s.startsWith('faq-cat-'))) && (
                            <details className="group border-b border-gray-200 dark:border-gray-700 pb-3">
                                <summary className="cursor-pointer font-semibold text-gray-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition list-none flex items-center gap-2">
                                    <span className="text-xs bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 px-1.5 py-0.5 rounded">問題</span>
                                    Q. 非ループAPNGが2回目以降再生されない
                                </summary>
                                <div className="mt-3 ml-7 text-sm text-gray-600 dark:text-gray-300 space-y-3">
                                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                                        <p className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">💡 非ループAPNGとは？</p>
                                        <p className="text-yellow-700 dark:text-yellow-300 text-xs">ループOFFで生成したAPNGで、アニメーションが1回だけ再生されて止まるタイプの画像です。</p>
                                    </div>
                                    <p><strong>原因:</strong> ブラウザのキャッシュにより、同じURLの画像は再ダウンロードされず、アニメーションが最初のフレームで止まった状態で表示されます。</p>
                                    <p><strong>対処法:</strong></p>
                                    <ol className="list-decimal list-inside space-y-2 ml-4">
                                        <li><strong>「NOIMAGE」経由で再設定</strong><br />
                                            <span className="text-xs text-gray-500 dark:text-gray-400">画像を一度「NOIMAGE」に設定してから、再度APNGを設定する</span>
                                        </li>
                                        <li><strong>強制リロード</strong><br />
                                            <span className="text-xs text-gray-500 dark:text-gray-400">Windows: Ctrl+F5 / Mac: Cmd+Shift+R</span>
                                        </li>
                                    </ol>
                                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
                                        <p className="font-medium text-blue-700 dark:text-blue-300">✅ 推奨</p>
                                        <p className="text-blue-600 dark:text-blue-400 text-xs">カットインなど繰り返し再生が必要な場合は<strong>ループON</strong>で生成してください。</p>
                                    </div>
                                </div>
                            </details>
                        )}

                        {/* Q7: 圧縮確認 - カテゴリ: ココフォリア */}
                        {(expandedSections.has('faq-cat-すべて') || expandedSections.has('faq-cat-ココフォリア') || !Array.from(expandedSections).some(s => s.startsWith('faq-cat-'))) && (
                            <details className="group border-b border-gray-200 dark:border-gray-700 pb-3">
                                <summary className="cursor-pointer font-semibold text-gray-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition list-none flex items-center gap-2">
                                    <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-1.5 py-0.5 rounded">ココフォ</span>
                                    Q. 「圧縮しますか？」と聞かれた
                                </summary>
                                <div className="mt-3 ml-7 text-sm text-gray-600 dark:text-gray-300">
                                    <p><strong className="text-red-600 dark:text-red-400">必ず「いいえ」を選択</strong>してください。「はい」を選ぶとアニメーションが動かなくなります。</p>
                                </div>
                            </details>
                        )}

                        {/* Q8: 急に動かなくなった - カテゴリ: アニメーション問題 */}
                        {(expandedSections.has('faq-cat-すべて') || expandedSections.has('faq-cat-アニメーション問題') || !Array.from(expandedSections).some(s => s.startsWith('faq-cat-'))) && (
                            <details className="group border-b border-gray-200 dark:border-gray-700 pb-3">
                                <summary className="cursor-pointer font-semibold text-gray-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition list-none flex items-center gap-2">
                                    <span className="text-xs bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 px-1.5 py-0.5 rounded">問題</span>
                                    Q. 急にアニメーションが動かなくなった
                                </summary>
                                <div className="mt-3 ml-7 text-sm text-gray-600 dark:text-gray-300 space-y-2">
                                    <p>ブラウザキャッシュが原因の可能性：</p>
                                    <ul className="list-disc list-inside space-y-1 ml-4">
                                        <li>強制リロード（Ctrl+F5 / Cmd+Shift+R）</li>
                                        <li>キャッシュとCookieを削除</li>
                                        <li>再ログイン</li>
                                    </ul>
                                </div>
                            </details>
                        )}

                        {/* スクリーンパネル/マーカーパネル関連 */}


                        {/* Q9: スクリーンパネルで非ループ */}
                        {(expandedSections.has('faq-cat-すべて') || expandedSections.has('faq-cat-ココフォリア') || !Array.from(expandedSections).some(s => s.startsWith('faq-cat-'))) && (
                            <details className="group border-b border-gray-200 dark:border-gray-700 pb-3 mb-3">
                                <summary className="cursor-pointer font-semibold text-gray-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition list-none flex items-center gap-2">
                                    <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-1.5 py-0.5 rounded">ココフォ</span>
                                    Q. スクリーンパネルで非ループAPNGを使いたい
                                </summary>
                                <div className="mt-3 ml-7 text-sm text-gray-600 dark:text-gray-300 space-y-2">
                                    <p className="text-red-600 dark:text-red-400 font-medium">❌ 実質使用不可です</p>
                                    <p>スクリーンパネルでは非ループAPNGが正常に動作しません。ブラウザキャッシュの影響で初回以降アニメーションが再生されなくなります。</p>
                                    <p className="font-medium">✅ 必ずループONで生成してください。</p>
                                </div>
                            </details>
                        )}

                        {/* Q10: マーカーパネルで非ループ */}
                        {(expandedSections.has('faq-cat-すべて') || expandedSections.has('faq-cat-ココフォリア') || !Array.from(expandedSections).some(s => s.startsWith('faq-cat-'))) && (
                            <details className="group border-b border-gray-200 dark:border-gray-700 pb-3 mb-3">
                                <summary className="cursor-pointer font-semibold text-gray-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition list-none flex items-center gap-2">
                                    <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-1.5 py-0.5 rounded">ココフォ</span>
                                    Q. マーカーパネルで非ループAPNGを使いたい
                                </summary>
                                <div className="mt-3 ml-7 text-sm text-gray-600 dark:text-gray-300 space-y-2">
                                    <p className="text-green-600 dark:text-green-400 font-medium">⭕ 使用可能です（条件あり）</p>
                                    <p>マーカーパネルでは非ループAPNGを使用できますが、<strong>2回目以降の再生</strong>には以下の手順が必要です：</p>
                                    <ol className="list-decimal list-inside space-y-1 ml-4">
                                        <li>一度「NOIMAGE」に設定</li>
                                        <li>再度APNGを設定</li>
                                    </ol>
                                </div>
                            </details>
                        )}

                        {/* Q11: パネルでAPNGが動かない */}
                        {(expandedSections.has('faq-cat-すべて') || expandedSections.has('faq-cat-ココフォリア') || !Array.from(expandedSections).some(s => s.startsWith('faq-cat-'))) && (
                            <details className="group">
                                <summary className="cursor-pointer font-semibold text-gray-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition list-none flex items-center gap-2">
                                    <span className="text-xs bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 px-1.5 py-0.5 rounded">問題</span>
                                    Q. スクリーン/マーカーパネルでAPNGが動かない
                                </summary>
                                <div className="mt-3 ml-7 text-sm text-gray-600 dark:text-gray-300 space-y-2">
                                    <p><strong>チェックリスト:</strong></p>
                                    <ul className="list-disc list-inside space-y-1 ml-4">
                                        <li>✅ 容量が<strong>1MB未満</strong>で生成されているか</li>
                                        <li>✅ スクリーンパネルの場合は<strong>ループON</strong>で生成されているか</li>
                                        <li>✅ アップロード時に「圧縮しますか？」で<strong>「いいえ」</strong>を選択したか</li>
                                    </ul>
                                    <p className="text-red-600 dark:text-red-400 text-xs">※ 1つでも該当しない場合は再生成してください</p>
                                </div>
                            </details>
                        )}

                    </div>
                    <BackToToc />
                </section>

                {/* 関連リンク */}
                <section id="links" className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
                        <ExternalLink className="w-5 h-5 mr-2 text-gray-500" aria-hidden="true" focusable="false" />
                        関連リンク
                    </h2>
                    <div className="flex flex-wrap gap-3">
                        <a
                            href="https://ccfolia.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                            ココフォリア公式
                            <ExternalLink className="w-3 h-3 ml-1" aria-hidden="true" focusable="false" />
                        </a>
                        <a
                            href="https://minify.ccfolia.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                            ココフォリア画像圧縮ツール
                            <ExternalLink className="w-3 h-3 ml-1" aria-hidden="true" focusable="false" />
                        </a>
                        <a
                            href="https://blink-animation-tool.vercel.app/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                            瞬きアニメーション作成ツール
                            <ExternalLink className="w-3 h-3 ml-1" aria-hidden="true" focusable="false" />
                        </a>
                    </div>
                    <BackToToc />
                </section>

                {/* フッター */}
                <div className="text-center mt-8 space-y-2">
                    <p className="text-xs text-gray-400">最終更新：2025年1月</p>
                    <div className="text-sm text-gray-500">
                        <Link href="/" className="text-blue-600 hover:underline">
                            ← APNG Generator に戻る
                        </Link>
                    </div>
                </div>
            </div>
            <FeedbackModal isOpen={isFeedbackModalOpen} onClose={() => setIsFeedbackModalOpen(false)} version="V120 Manual" />
        </div>
    )
}
