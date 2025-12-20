'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Upload, MousePointer, Download, AlertTriangle, CheckCircle, Zap, Image, Settings, HelpCircle, ExternalLink, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react'
import { FeedbackModal } from '../../components/FeedbackModal'

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
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                        APNG Generator 使い方ガイド
                    </h1>
                </div>

                {/* 目次 */}
                <nav aria-label="目次" className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 mb-6">
                    <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-3">目次</h2>
                    <ul className="space-y-2 text-sm">
                        <li>
                            <a href="#steps" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                                📝 アニメーションPNG作成手順
                            </a>
                        </li>
                        <li>
                            <a href="#cocofolia" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                                🎮 ココフォリアでの使い方
                            </a>
                            <ul className="ml-5 mt-1 space-y-1">
                                <li>
                                    <a href="#cocofolia-character" className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-300">
                                        └ 立ち絵として使う
                                    </a>
                                </li>
                                <li>
                                    <a href="#cocofolia-cutin" className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-300">
                                        └ カットインとして使う
                                    </a>
                                </li>
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
                            </ul>
                        </li>
                        <li>
                            <a href="/effects" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                                ✨ トランジション効果一覧
                            </a>
                        </li>
                        <li>
                            <a href="#settings" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                                ⚙️ 推奨設定
                            </a>
                        </li>
                        <li>
                            <a href="#faq" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                                ❓ よくある質問
                            </a>
                        </li>
                        <li>
                            <a href="#links" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                                🔗 関連リンク
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
                    <div className="mb-4 border border-blue-200 dark:border-blue-800 rounded-lg overflow-hidden">
                        <button
                            onClick={() => toggleStep(1)}
                            className="w-full bg-blue-50 dark:bg-blue-900/30 p-3 flex items-center gap-3 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                        >
                            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-white font-bold">1</span>
                            </div>
                            <div className="flex-1 text-left">
                                <h3 className="font-semibold text-gray-800 dark:text-white">画像を選択</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-300">PNG/JPG画像をドラッグ＆ドロップ</p>
                            </div>
                            {expandedSteps.has(1) ? (
                                <ChevronUp className="w-5 h-5 text-gray-400" />
                            ) : (
                                <ChevronDown className="w-5 h-5 text-gray-400" />
                            )}
                        </button>
                        {expandedSteps.has(1) && (
                            <>
                                <div className="p-4 bg-white dark:bg-slate-700">
                                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded p-2 mb-3 text-sm text-green-700 dark:text-green-300">
                                        💡 <strong>ポイント:</strong> 透過PNG画像を使うと、背景が透明なAPNGが作れます
                                    </div>
                                    <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600 dark:text-gray-300">
                                        <li>画面左側の<strong>「画像選択＆プレビュー」</strong>パネルに画像をドロップ</li>
                                        <li>プレビューキャンバスに画像が表示されます</li>
                                    </ol>
                                </div>
                                <button
                                    onClick={() => toggleSection('step1-image')}
                                    className="w-full p-2 bg-gray-50 dark:bg-slate-700 border-t border-gray-200 dark:border-gray-600 text-sm text-blue-600 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-slate-600 flex items-center justify-center gap-2"
                                >
                                    {expandedSections.has('step1-image') ? '画面を隠す' : '画面を見る'}
                                    {expandedSections.has('step1-image') ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </button>
                                {expandedSections.has('step1-image') && (
                                    <div className="p-2 bg-gray-50 dark:bg-slate-700 border-t border-gray-200 dark:border-gray-600">
                                        <img
                                            src="/manual/step1_upload.png"
                                            alt="画像選択パネルの位置を示す画面"
                                            className="w-full rounded border border-gray-200 dark:border-gray-600"
                                            loading="lazy"
                                            decoding="async"
                                            width="800"
                                            height="450"
                                        />
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* ステップ2 */}
                    <div className="mb-4 border border-blue-200 dark:border-blue-800 rounded-lg overflow-hidden">
                        <button
                            onClick={() => toggleStep(2)}
                            className="w-full bg-blue-50 dark:bg-blue-900/30 p-3 flex items-center gap-3 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                        >
                            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-white font-bold">2</span>
                            </div>
                            <div className="flex-1 text-left">
                                <h3 className="font-semibold text-gray-800 dark:text-white">トランジション効果を選択</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-300">登場・退場・演出から選択 + 共通設定を調整</p>
                            </div>
                            {expandedSteps.has(2) ? (
                                <ChevronUp className="w-5 h-5 text-gray-400" />
                            ) : (
                                <ChevronDown className="w-5 h-5 text-gray-400" />
                            )}
                        </button>
                        {expandedSteps.has(2) && (
                            <div className="p-4 bg-white dark:bg-slate-700">
                                {/* カテゴリ簡潔表示 */}
                                <div className="grid grid-cols-3 gap-2 mb-4">
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

                                {/* 効果一覧へのリンク */}
                                <Link
                                    href="/effects"
                                    className="flex items-center justify-center gap-2 w-full py-2 mb-4 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/70 transition-colors text-sm font-medium"
                                >
                                    ✨ 全効果一覧を見る
                                    <ExternalLink className="w-4 h-4" />
                                </Link>

                                {/* 重要ポイント */}
                                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded p-3 mb-4">
                                    <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">⚙️ 共通設定のポイント</p>
                                    <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                                        <li>• <strong>ループ ON</strong>：カットイン向け（繰り返し再生）</li>
                                        <li>• <strong>ループ OFF</strong>：立ち絵向け（1回再生）</li>
                                        <li>• <strong>容量制限</strong>：立ち絵/前景/背景→5MB / パネル→1MB</li>
                                    </ul>
                                </div>

                                {/* 詳細画像の折りたたみ */}
                                <button
                                    onClick={() => toggleSection('step2-images')}
                                    className="w-full p-2 bg-gray-50 dark:bg-slate-600 text-sm text-blue-600 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-slate-500 flex items-center justify-center gap-2 rounded"
                                >
                                    {expandedSections.has('step2-images') ? '画面を隠す' : '各タブの画面を見る'}
                                    {expandedSections.has('step2-images') ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </button>
                                {expandedSections.has('step2-images') && (
                                    <div className="mt-3 space-y-3">
                                        <div className="bg-gray-50 dark:bg-slate-600 rounded-lg p-2">
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">登場タブ</p>
                                            <img
                                                src="/manual/step2_transition_entrance.png"
                                                alt="登場トランジション効果の例"
                                                className="w-full rounded border border-gray-200 dark:border-gray-600"
                                                loading="lazy"
                                                decoding="async"
                                                width="800"
                                                height="300"
                                            />
                                        </div>
                                        <div className="bg-gray-50 dark:bg-slate-600 rounded-lg p-2">
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">共通設定</p>
                                            <img
                                                src="/manual/step2_common_settings.png"
                                                alt="共通設定画面"
                                                className="w-full rounded border border-gray-200 dark:border-gray-600"
                                                loading="lazy"
                                                decoding="async"
                                                width="800"
                                                height="300"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* ステップ3 */}
                    <div className="border border-indigo-200 dark:border-indigo-800 rounded-lg overflow-hidden">
                        <button
                            onClick={() => toggleStep(3)}
                            className="w-full bg-indigo-50 dark:bg-indigo-900/30 p-3 flex items-center gap-3 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                        >
                            <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-white font-bold">3</span>
                            </div>
                            <div className="flex-1 text-left">
                                <h3 className="font-semibold text-gray-800 dark:text-white">プレビュー確認 & APNG生成</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-300">「APNG生成」ボタンでダウンロード</p>
                            </div>
                            {expandedSteps.has(3) ? (
                                <ChevronUp className="w-5 h-5 text-gray-400" />
                            ) : (
                                <ChevronDown className="w-5 h-5 text-gray-400" />
                            )}
                        </button>
                        {expandedSteps.has(3) && (
                            <>
                                <div className="p-4 bg-white dark:bg-slate-700">
                                    <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600 dark:text-gray-300 mb-3">
                                        <li>効果を選択すると自動でプレビュー再生</li>
                                        <li><strong>「APNG生成」</strong>ボタンをクリック</li>
                                        <li>自動的にダウンロードされます</li>
                                    </ol>
                                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded p-2 text-sm text-green-700 dark:text-green-300">
                                        ✅ 容量制限を超えた場合は自動で圧縮されます
                                    </div>
                                </div>
                                <button
                                    onClick={() => toggleSection('step3-image')}
                                    className="w-full p-2 bg-gray-50 dark:bg-slate-700 border-t border-gray-200 dark:border-gray-600 text-sm text-blue-600 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-slate-600 flex items-center justify-center gap-2"
                                >
                                    {expandedSections.has('step3-image') ? '画面を隠す' : '画面を見る'}
                                    {expandedSections.has('step3-image') ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </button>
                                {expandedSections.has('step3-image') && (
                                    <div className="p-2 bg-gray-50 dark:bg-slate-700 border-t border-gray-200 dark:border-gray-600">
                                        <img
                                            src="/manual/step3_generate.png"
                                            alt="ステップ3: APNG生成画面"
                                            className="w-full rounded border border-gray-200 dark:border-gray-600"
                                            loading="lazy"
                                            decoding="async"
                                            width="800"
                                            height="450"
                                        />
                                    </div>
                                )}
                            </>
                        )}
                    </div>
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

                        <div id="cocofolia-character">
                            <h3 className="font-semibold text-gray-800 dark:text-white mb-2">立ち絵として使う場合</h3>
                            <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-3 mb-2">
                                <p className="text-xs text-gray-500 dark:text-gray-400">容量目安: 5MB未満推奨 / ループ: 用途による</p>
                            </div>
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

                        <div id="cocofolia-cutin">
                            <h3 className="font-semibold text-gray-800 dark:text-white mb-2">カットインとして使う場合</h3>
                            <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-3 mb-2">
                                <p className="text-xs text-gray-500 dark:text-gray-400">容量目安: 5MB未満推奨 / ループ: ON</p>
                            </div>
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

                        <div id="cocofolia-foreground">
                            <h3 className="font-semibold text-gray-800 dark:text-white mb-2">前景・背景として使う場合</h3>
                            <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-3 mb-2">
                                <p className="text-xs text-gray-500 dark:text-gray-400">容量目安: 5MB未満推奨 / ループ: 用途による</p>
                            </div>
                            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600 dark:text-gray-300 mb-3">
                                <li>ココフォリアのルーム画面右側にある「前景/背景」タブを開く</li>
                                <li>「前景」または「背景」の「+」ボタンをクリック</li>
                                <li>生成したAPNGファイルをドラッグ&ドロップまたは選択</li>
                                <li>ルーム全体にアニメーション演出が適用されます</li>
                            </ol>
                            <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-2">
                                <img
                                    src="/manual/cocofolia_foreground.png"
                                    alt="ココフォリアでの前景・背景設定画面"
                                    className="w-full rounded border border-gray-200 dark:border-gray-600"
                                    loading="lazy"
                                    decoding="async"
                                    width="800"
                                    height="450"
                                />
                            </div>
                        </div>

                        <div id="cocofolia-panel">
                            <h3 className="font-semibold text-gray-800 dark:text-white mb-2">スクリーンパネル／マーカーパネルとして使う場合</h3>
                            <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-3 mb-2">
                                <p className="text-xs text-gray-500 dark:text-gray-400">容量目安: 1MB未満推奨 / ループ: 用途による</p>
                            </div>
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-2">
                                <p className="text-sm text-red-700 dark:text-red-300">
                                    ⚠️ スクリーンパネルは1MB未満を選択お願いします。<br />
                                    （1MB超の場合、圧縮が適用される可能性があり、現状圧縮されるとアニメーションが動作しません）
                                </p>
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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        </div>
                    </div>
                </section>

                {/* 推奨設定 */}
                <section id="settings" className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 mb-6">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
                        <CheckCircle className="w-5 h-5 mr-2 text-green-500" aria-hidden="true" focusable="false" />
                        推奨設定
                    </h2>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b dark:border-gray-700">
                                    <th className="text-left py-2 px-3 text-gray-600 dark:text-gray-400">項目</th>
                                    <th className="text-left py-2 px-3 text-gray-600 dark:text-gray-400">ココフォリア推奨</th>
                                    <th className="text-left py-2 px-3 text-gray-600 dark:text-gray-400">理由</th>
                                </tr>
                            </thead>
                            <tbody className="text-gray-800 dark:text-gray-200">
                                <tr className="border-b dark:border-gray-700">
                                    <td className="py-2 px-3 font-medium">容量制限<br /><span className="text-xs text-gray-500">(立ち絵/前景/背景)</span></td>
                                    <td className="py-2 px-3"><span className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-0.5 rounded">5MB以下</span></td>
                                    <td className="py-2 px-3 text-gray-600 dark:text-gray-400">ココフォリアのアップロード上限内で高画質を維持</td>
                                </tr>
                                <tr className="border-b dark:border-gray-700">
                                    <td className="py-2 px-3 font-medium">容量制限<br /><span className="text-xs text-gray-500">(スクリーン/マーカー)</span></td>
                                    <td className="py-2 px-3"><span className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 px-2 py-0.5 rounded">1MB未満を強く推奨</span></td>
                                    <td className="py-2 px-3 text-gray-600 dark:text-gray-400">パネル系は特に注意が必要</td>
                                </tr>
                                <tr className="border-b dark:border-gray-700">
                                    <td className="py-2 px-3 font-medium">ループ</td>
                                    <td className="py-2 px-3"><span className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded">用途による</span></td>
                                    <td className="py-2 px-3 text-gray-600 dark:text-gray-400">カットイン→ON推奨 / 登場退場→OFF</td>
                                </tr>
                                <tr className="border-b dark:border-gray-700">
                                    <td className="py-2 px-3 font-medium">フレームレート</td>
                                    <td className="py-2 px-3"><span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded">20-30 fps</span></td>
                                    <td className="py-2 px-3 text-gray-600 dark:text-gray-400">滑らかさと容量のバランス</td>
                                </tr>
                                <tr>
                                    <td className="py-2 px-3 font-medium">元画像サイズ</td>
                                    <td className="py-2 px-3"><span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded">720px程度</span></td>
                                    <td className="py-2 px-3 text-gray-600 dark:text-gray-400">大きすぎると容量超過</td>
                                </tr>
                            </tbody>
                        </table>
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

                        {/* Q5: パネルで動かない - カテゴリ: ココフォリア */}
                        {(expandedSections.has('faq-cat-すべて') || expandedSections.has('faq-cat-ココフォリア') || !Array.from(expandedSections).some(s => s.startsWith('faq-cat-'))) && (
                            <details className="group border-b border-gray-200 dark:border-gray-700 pb-3">
                                <summary className="cursor-pointer font-semibold text-gray-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition list-none flex items-center gap-2">
                                    <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-1.5 py-0.5 rounded">ココフォ</span>
                                    Q. スクリーン/マーカーパネルで動かない
                                </summary>
                                <div className="mt-3 ml-7 text-sm text-gray-600 dark:text-gray-300 space-y-2">
                                    <p>パネル系は特に厳格です：</p>
                                    <ul className="list-disc list-inside space-y-1 ml-4">
                                        <li>ファイルサイズを<strong>1MB未満</strong>にする</li>
                                        <li>動かない場合はNOIMAGE→再設定を試す</li>
                                    </ul>
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
                                <div className="mt-3 ml-7 text-sm text-gray-600 dark:text-gray-300 space-y-2">
                                    <p><strong>原因:</strong> ブラウザキャッシュにより再ダウンロードされない</p>
                                    <p><strong>対処法:</strong></p>
                                    <ul className="list-disc list-inside space-y-1 ml-4">
                                        <li>NOIMAGE→再設定</li>
                                        <li>強制リロード（Ctrl+F5 / Cmd+Shift+R）</li>
                                        <li>カットインは<strong>ループON</strong>で生成</li>
                                    </ul>
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
                            <details className="group">
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
                    </div>
                </section>

                {/* 関連リンク */}
                <section id="links" className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
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
