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
                                    <a href="#cocofolia-foreground-oneplay" className="text-gray-500 hover:text-blue-600 dark:text-gray-500 dark:hover:text-blue-300 text-xs ml-2">
                                        ・シーン切り替え時に1回だけ再生（前景・背景編）
                                    </a>
                                </li>
                                <li>
                                    <a href="#cocofolia-panel" className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-300">
                                        └ スクリーン/マーカーパネル
                                    </a>
                                </li>
                                <li>
                                    <a href="#cocofolia-marker-oneplay" className="text-gray-500 hover:text-blue-600 dark:text-gray-500 dark:hover:text-blue-300 text-xs ml-2">
                                        ・シーン切り替え時に1回だけ再生（マーカーパネル編）
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
                                <HelpCircle className="w-4 h-4 text-blue-500" /> FAQ（よくあるお問い合わせ）
                            </a>
                            <ul className="ml-4 mt-1 space-y-1">
                                <li>
                                    <a href="#faq-animation" className="text-gray-500 hover:text-blue-600 dark:text-gray-500 dark:hover:text-blue-300 text-sm">
                                        ・アニメーションが動かない / 重い / 表示されない
                                    </a>
                                </li>
                                <li>
                                    <a href="#faq-compress" className="text-gray-500 hover:text-blue-600 dark:text-gray-500 dark:hover:text-blue-300 text-sm">
                                        ・「圧縮しますか？」と聞かれたら
                                    </a>
                                </li>
                                <li>
                                    <a href="#faq-quality" className="text-gray-500 hover:text-blue-600 dark:text-gray-500 dark:hover:text-blue-300 text-sm">
                                        ・画質が悪い / 透過部分が白くなる
                                    </a>
                                </li>
                                <li>
                                    <a href="#faq-noloop" className="text-gray-500 hover:text-blue-600 dark:text-gray-500 dark:hover:text-blue-300 text-sm">
                                        ・非ループAPNGが再生されない
                                    </a>
                                </li>
                            </ul>
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
                                    <li>• <strong>容量制限</strong>：生成するファイルサイズの上限を設定（例：<strong className="text-red-500">5MB</strong>を選択すると<strong className="text-red-500">5MB以下に自動調整</strong>されます）</li>
                                    <li>• <strong>再生スピード</strong>：アニメーションの速度（0.25x〜2.0x）</li>
                                    <li>• <strong>フレームレート</strong>：1秒あたりのコマ数（10〜40fps）<br /><span className="ml-[7rem]">高いほど滑らかだがファイルサイズ増。低いとカクつく可能性はあるが軽量＆高画質にできる</span></li>
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

                    {/* ココフォリアの説明 */}
                    <div className="mb-4">
                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-1">ココフォリアとは</p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                            <a href="https://ccfolia.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline">ココフォリア</a>は、ブラウザで遊べるTRPGオンラインセッションツールです。<br />
                            APNGに対応しているため、本ツールで作成したアニメーションを演出として活用できます。
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                            <div className="flex items-start">
                                <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" aria-hidden="true" focusable="false" />
                                <div>
                                    <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">重要：ファイルサイズガイドライン</h4>
                                    <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-3">
                                        ココフォリアでは、画像のアップロード上限は<span className="text-red-500 font-bold">5MB</span>です。<br />
                                        5MBを超えると圧縮確認が表示され、圧縮するとAPNGアニメーションが動作しなくなります。<br />
                                        APNG Generatorで<span className="text-red-500 font-bold">容量制限「5MB」</span>を選択して生成してください。
                                    </p>
                                    <div className="flex items-center gap-2 text-sm mb-2">
                                        <span className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-0.5 rounded font-medium">5MB以下</span>
                                        <span className="text-yellow-700 dark:text-yellow-300">すべての用途（前景・背景・立ち絵・カットイン・パネル）</span>
                                    </div>
                                    <p className="text-xs text-yellow-600 dark:text-yellow-400">
                                        ※ 5MB以下の仕様は状況により変更される可能性があります（過去1MB制限だったことがあります）。<br />
                                        5MB以下でも圧縮警告が出てきた場合は、「1MB」での生成もお試しください。
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* サブセクションナビゲーション */}
                    <div id="cocofolia-nav" className="bg-slate-100 dark:bg-slate-700 rounded-lg p-3 mb-4 mt-4">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">📍 クイックナビ</p>
                        <div className="flex flex-wrap gap-2">
                            <a href="#cocofolia-foreground" className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full text-xs hover:bg-blue-200 dark:hover:bg-blue-800 transition">🖼️ 前景・背景</a>
                            <a href="#cocofolia-panel" className="px-3 py-1.5 bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300 rounded-full text-xs hover:bg-orange-200 dark:hover:bg-orange-800 transition">📺 スクリーン/マーカー</a>
                            <a href="#cocofolia-cutin" className="px-3 py-1.5 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded-full text-xs hover:bg-purple-200 dark:hover:bg-purple-800 transition">⚡ カットイン</a>
                            <a href="#cocofolia-character" className="px-3 py-1.5 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 rounded-full text-xs hover:bg-green-200 dark:hover:bg-green-800 transition">🧍 立ち絵</a>
                        </div>
                    </div>

                    <div className="space-y-4">
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
                                    <li><a href="#steps" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline">APNG作成手順</a>でAPNGを生成してダウンロード<br /><span className="text-orange-600 dark:text-orange-400">（🔄 ループ: <strong>用途による</strong> / 📦 容量: <strong>5MB</strong>）</span></li>
                                    <li>ココフォリアで、ルーム画面のなにもない所で<strong>右クリック</strong></li>
                                    <li><strong>「前景・背景を変更」</strong>をクリック</li>
                                    <li><strong>「背景」</strong>（または前景）を選択し、設定したい画像をアップロード</li>
                                    <li>設定する画像を選択する</li>
                                    <li>ルーム全体にアニメーション演出が適用されます</li>
                                </ol>
                                {/* 2x2グリッド: ① ② / ③ ④ */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
                                    <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-2">
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 text-center">① 共通設定（ループ:用途による / 容量制限:<span className="text-red-500 font-bold">5MB</span>）</p>
                                        <img
                                            src="/manual/common_settings_loop_choice_5mb.jpg"
                                            alt="共通設定：ループ用途による、容量5MB"
                                            className="w-full rounded border border-gray-200 dark:border-gray-600"
                                            loading="lazy"
                                            decoding="async"
                                        />
                                    </div>
                                    <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-2">
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 text-center">② 右クリック → 前景・背景を変更</p>
                                        <img
                                            src="/manual/cocofolia_rightclick_menu.png"
                                            alt="ココフォリアで右クリック→前景・背景を変更"
                                            className="w-full rounded border border-gray-200 dark:border-gray-600"
                                            loading="lazy"
                                            decoding="async"
                                        />
                                    </div>
                                    <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-2">
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 text-center">③ 「背景」または「前景」を選択</p>
                                        <img
                                            src="/manual/cocofolia_field_settings.jpg"
                                            alt="フィールド設定で背景選択・前景選択"
                                            className="w-full rounded border border-gray-200 dark:border-gray-600"
                                            loading="lazy"
                                            decoding="async"
                                        />
                                    </div>
                                    <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-2">
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 text-center">④ 画像をアップロードし、設定</p>
                                        <img
                                            src="/manual/cocofolia_select_image.png"
                                            alt="背景を選択して画像をアップロード"
                                            className="w-full rounded border border-gray-200 dark:border-gray-600"
                                            loading="lazy"
                                            decoding="async"
                                        />
                                    </div>
                                </div>

                                {/* 前景・背景の詳細手順 - 常時表示 */}
                                <div id="cocofolia-foreground-oneplay" className="mb-3 border border-green-200 dark:border-green-700 rounded-lg overflow-hidden">
                                    <div className="bg-green-50 dark:bg-green-900/30 p-3">
                                        <h4 className="font-bold text-green-800 dark:text-green-200">📍 シーン切り替え時に1回だけ再生させる方法（前景・背景の場合）</h4>
                                        <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                                            非ループAPNGをシーン切り替え時に1回だけ再生させたい場合の設定方法です。
                                        </p>
                                    </div>
                                    <div className="p-4 bg-white dark:bg-slate-700 space-y-4 text-sm text-gray-600 dark:text-gray-300">

                                        {/* ステップ1 */}
                                        <div>
                                            <h5 className="font-bold text-gray-800 dark:text-white mb-2">ステップ1: 前景または背景を設定して調整する</h5>
                                            <ul className="space-y-1 text-xs">
                                                <li>• 5MB以下、ループOFFのAPNGを用意（生成）する</li>
                                                <li>• ココフォリアのルーム(部屋)盤面を右クリックし「前景・背景を変更」をクリック</li>
                                                <li>• サイズ・位置を調整</li>
                                            </ul>
                                        </div>

                                        {/* ステップ2 */}
                                        <div>
                                            <h5 className="font-bold text-gray-800 dark:text-white mb-2">ステップ2: シーンを2つ保存する</h5>
                                            <p className="text-xs text-gray-600 dark:text-gray-300 mb-2">同じシーンを2つ作ります</p>
                                            <ul className="space-y-1 text-xs mb-3">
                                                <li>• 画面上部の「GMシーン管理」を開いて、<strong>+ボタンを2回押す</strong></li>
                                                <li>• 「新しいシーン」という名前から、<strong>わかりやすい名前に変更</strong></li>
                                            </ul>
                                            <div className="space-y-2 text-xs">
                                                <div className="bg-gray-50 dark:bg-slate-600 p-2 rounded">
                                                    <strong>シーンA（再生前用）：</strong>前景/背景に<strong>別の画像</strong>を設定 → シーン保存
                                                </div>
                                                <div className="bg-gray-50 dark:bg-slate-600 p-2 rounded">
                                                    <strong>シーンB（再生用）：</strong>前景/背景にAPNGを設定 → シーン保存
                                                </div>
                                            </div>
                                            <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-2 mt-2 rounded">
                                                <p className="text-xs text-red-700 dark:text-red-300">
                                                    ⚠️ シーン設定後は必ずシーン一覧で保存してください。保存しないと設定が消えます。
                                                </p>
                                            </div>
                                            <div className="bg-orange-50 dark:bg-orange-900/20 border-l-4 border-orange-500 p-2 mt-2 rounded">
                                                <p className="text-xs text-orange-700 dark:text-orange-300">
                                                    ⚠️ <strong>注意：</strong>前景・背景は「設定なし」→「画像」では再生されません。<br />
                                                    必ず「画像A」→「画像B（APNG）」のように、<strong>画像から画像への切り替え</strong>が必要です。
                                                </p>
                                            </div>
                                        </div>

                                        {/* ステップ3 */}
                                        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded p-3">
                                            <h5 className="font-bold text-blue-800 dark:text-blue-200 mb-1">ステップ3: シーンA → シーンB に切り替えて再生！</h5>
                                            <p className="text-xs text-blue-700 dark:text-blue-300">
                                                シーン一覧から <strong>シーンA</strong> を選択した後、<strong>シーンB</strong> に切り替えると<br />
                                                非ループAPNGが1回だけ再生されます。
                                            </p>
                                        </div>

                                        {/* スクリーンショット */}
                                        <div className="mt-4">
                                            <p className="font-medium text-gray-800 dark:text-white mb-2">📸 実際の設定画面</p>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <div className="bg-gray-50 dark:bg-slate-600 rounded-lg p-2">
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 text-center">① 右クリック → 前景・背景を変更</p>
                                                    <img
                                                        src="/manual/rightclick_foreground.png"
                                                        alt="右クリックメニュー"
                                                        className="w-full rounded border border-gray-200 dark:border-gray-600"
                                                        loading="lazy"
                                                        decoding="async"
                                                    />
                                                </div>
                                                <div className="bg-gray-50 dark:bg-slate-600 rounded-lg p-2">
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 text-center">② 前景に画像AとAPNGを用意</p>
                                                    <img
                                                        src="/manual/image_select_foreground.png"
                                                        alt="画像選択画面"
                                                        className="w-full rounded border border-gray-200 dark:border-gray-600"
                                                        loading="lazy"
                                                        decoding="async"
                                                    />
                                                </div>
                                                <div className="bg-gray-50 dark:bg-slate-600 rounded-lg p-2">
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 text-center">③ シーンA/Bを保存 + 盤面を保存</p>
                                                    <img
                                                        src="/manual/scene_transition_demo.jpg"
                                                        alt="シーン一覧"
                                                        className="w-full rounded border border-gray-200 dark:border-gray-600"
                                                        loading="lazy"
                                                        decoding="async"
                                                    />
                                                </div>
                                                <div className="bg-gray-50 dark:bg-slate-600 rounded-lg p-2">
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 text-center">④ シーンA→Bで再生！</p>
                                                    <img
                                                        src="/manual/scene_list_ab.png"
                                                        alt="シーン切り替えデモ"
                                                        className="w-full rounded border border-gray-200 dark:border-gray-600"
                                                        loading="lazy"
                                                        decoding="async"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* デモ動画 */}
                                        <div className="mt-4">
                                            <p className="font-medium text-gray-800 dark:text-white mb-2">🎬 実際の動作デモ</p>
                                            <div className="relative bg-black rounded-lg overflow-hidden">
                                                <video
                                                    id="scene-demo-video"
                                                    className="w-full"
                                                    playsInline
                                                    controls
                                                    onClick={(e) => {
                                                        const video = e.currentTarget;
                                                        if (video.paused) {
                                                            video.play();
                                                        } else {
                                                            video.pause();
                                                        }
                                                    }}
                                                    onPlay={(e) => {
                                                        const overlay = e.currentTarget.parentElement?.querySelector('.video-overlay') as HTMLElement;
                                                        if (overlay) overlay.style.display = 'none';
                                                    }}
                                                    onPause={(e) => {
                                                        const overlay = e.currentTarget.parentElement?.querySelector('.video-overlay') as HTMLElement;
                                                        if (overlay) overlay.style.display = 'flex';
                                                    }}
                                                    onEnded={(e) => {
                                                        const overlay = e.currentTarget.parentElement?.querySelector('.video-overlay') as HTMLElement;
                                                        const icon = overlay?.querySelector('.play-icon') as HTMLElement;
                                                        const label = overlay?.querySelector('.play-label') as HTMLElement;
                                                        if (overlay) {
                                                            overlay.style.display = 'flex';
                                                        }
                                                        if (icon) {
                                                            icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>';
                                                        }
                                                        if (label) {
                                                            label.textContent = 'もう一度再生する';
                                                        }
                                                        e.currentTarget.currentTime = 0;
                                                    }}
                                                >
                                                    <source src="/manual/scenesample.mp4" type="video/mp4" />
                                                </video>
                                                <div
                                                    className="video-overlay absolute inset-0 flex flex-col items-center justify-center bg-black/40 cursor-pointer"
                                                    onClick={(e) => {
                                                        const video = e.currentTarget.parentElement?.querySelector('video');
                                                        const icon = e.currentTarget.querySelector('.play-icon') as HTMLElement;
                                                        const label = e.currentTarget.querySelector('.play-label') as HTMLElement;
                                                        if (video) {
                                                            video.play();
                                                            if (icon) icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>';
                                                            if (label) label.textContent = '再生する';
                                                        }
                                                    }}
                                                >
                                                    <div className="play-icon w-20 h-20 bg-white/90 rounded-full flex items-center justify-center text-gray-800 shadow-lg hover:bg-white transition">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                                                            <polygon points="5 3 19 12 5 21 5 3" />
                                                        </svg>
                                                    </div>
                                                    <span className="play-label mt-3 text-white text-sm font-medium">再生する</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* 前景・背景の補足説明 */}
                                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-3">
                                    <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200 mb-2">💡 補足：前景・背景の仕組み</p>
                                    <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                                        <li>• <strong>背景を設定</strong>すると、自動的に前景にも同じ画像が設定されます</li>
                                        <li>• さらに<strong>前景を設定</strong>すると、背景と同じ画像の上に前景が重ねて表示されます</li>
                                        <li>→ この仕組みにより、前景に透過画像（切り抜き画像や透過アニメなど）を設定すると、<br /><strong>透明部分から背景（下敷きとして自動コピーされた画像）が透けて見えます</strong></li>
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
                                <BackToToc />
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
                                    <p className="text-sm text-orange-600 dark:text-orange-300">📦 5MB以下 / 🔄 ループ: 用途による</p>
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
                                                    <td className="text-center py-1 px-2">5MB以下</td>
                                                    <td className="text-center py-1 px-2">5MB以下</td>
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
                                        <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2">スクリーンパネル（簡易手順）</h4>
                                        <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600 dark:text-gray-300">
                                            <li><a href="#steps" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline">APNG作成手順</a>でAPNGを生成してダウンロード<br /><span className="text-orange-600 dark:text-orange-400">（🔄 ループ: <strong>ON</strong> / 📦 容量: <strong>5MB</strong>）</span></li>
                                            <li>ココフォリアで、画面右上の<strong>「スクリーンパネル」</strong>ボタンをクリック</li>
                                            <li>「+」ボタンで新規パネルを作成</li>
                                            <li>「スクリーンパネル」欄をクリックしてAPNGファイルを選択</li>
                                            <li>位置・サイズを調整して配置</li>
                                        </ol>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2">マーカーパネル（簡易手順）</h4>
                                        <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600 dark:text-gray-300">
                                            <li><a href="#steps" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline">APNG作成手順</a>でAPNGを生成してダウンロード<br /><span className="text-orange-600 dark:text-orange-400">（🔄 ループ: <strong>用途による</strong> / 📦 容量: <strong>5MB</strong>）</span></li>
                                            <li>ココフォリアで、画面右上の<strong>「マーカーパネル」</strong>ボタンをクリック</li>
                                            <li>「+」ボタンで新規マーカーを作成</li>
                                            <li>「マーカー」欄をクリックしてAPNGファイルを選択</li>
                                            <li>位置・サイズを調整して配置</li>
                                        </ol>
                                    </div>
                                </div>

                                {/* 4分割グリッド: スクリーンパネル（左）/ マーカーパネル（右） */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                                    {/* 左列: スクリーンパネル */}
                                    <div className="space-y-3">
                                        <h5 className="text-sm font-semibold text-center text-blue-600 dark:text-blue-400">スクリーンパネル</h5>
                                        <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-2">
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 text-center">① 共通設定（ループ:<span className="text-red-500 font-bold">ON</span> / 容量制限:<span className="text-red-500 font-bold">5MB</span>）</p>
                                            <img
                                                src="/manual/common_settings_loop_on_5mb.jpg"
                                                alt="共通設定：ループON、容量5MB"
                                                className="w-full rounded border border-gray-200 dark:border-gray-600"
                                                loading="lazy"
                                                decoding="async"
                                            />
                                        </div>
                                        <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-2">
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 text-center">② ボタンをクリック</p>
                                            <img
                                                src="/manual/cocofolia_screen_panel_button.jpg"
                                                alt="スクリーンパネルボタンをクリック"
                                                className="w-full rounded border border-gray-200 dark:border-gray-600"
                                                loading="lazy"
                                                decoding="async"
                                            />
                                        </div>
                                        <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-2">
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 text-center">③ 「スクリーン」タブでAPNGを選択</p>
                                            <img
                                                src="/manual/cocofolia_screen_panel_select.jpg"
                                                alt="スクリーンパネル選択画面"
                                                className="w-full rounded border border-gray-200 dark:border-gray-600"
                                                loading="lazy"
                                                decoding="async"
                                            />
                                        </div>
                                    </div>
                                    {/* 右列: マーカーパネル */}
                                    <div className="space-y-3">
                                        <h5 className="text-sm font-semibold text-center text-yellow-600 dark:text-yellow-400">マーカーパネル</h5>
                                        <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-2">
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 text-center">① 共通設定（ループ:用途による / 容量制限:<span className="text-red-500 font-bold">5MB</span>）</p>
                                            <img
                                                src="/manual/common_settings_loop_choice_5mb.jpg"
                                                alt="共通設定：ループ用途による、容量5MB"
                                                className="w-full rounded border border-gray-200 dark:border-gray-600"
                                                loading="lazy"
                                                decoding="async"
                                            />
                                        </div>
                                        <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-2">
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 text-center">② ボタンをクリック → 「+」で追加</p>
                                            <img
                                                src="/manual/cocofolia_marker_panel_button.jpg"
                                                alt="マーカーパネルボタンをクリック"
                                                className="w-full rounded border border-gray-200 dark:border-gray-600"
                                                loading="lazy"
                                                decoding="async"
                                            />
                                        </div>
                                        <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-2">
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 text-center">③ 「マーカー」タブでAPNGを選択</p>
                                            <img
                                                src="/manual/cocofolia_marker_panel_select.jpg"
                                                alt="マーカーパネル選択画面"
                                                className="w-full rounded border border-gray-200 dark:border-gray-600"
                                                loading="lazy"
                                                decoding="async"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* スクリーンパネルの注意点 */}
                                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-3">
                                    <h5 className="font-semibold text-sm text-blue-800 dark:text-blue-200 mb-1">💡 スクリーンパネルで非ループAPNGを使う場合</h5>
                                    <p className="text-xs text-blue-700 dark:text-blue-300">
                                        スクリーンパネルでAPNGを使う場合は、<strong>基本ループあり</strong>を選択お願いします。<br />
                                        非ループ画像を使うことは可能ですが、すぐに再生されず、予期しないタイミングで1回再生されるといった挙動をします。<br />
                                        狙ったタイミングで演出を出したい場合は、<strong>マーカーパネル</strong>を使用してください。
                                    </p>
                                </div>

                                {/* マーカーパネル詳細手順 - 常時表示 */}
                                <div id="cocofolia-marker-oneplay" className="mb-3 border border-blue-200 dark:border-blue-700 rounded-lg overflow-hidden">
                                    <div className="bg-blue-50 dark:bg-blue-900/30 p-3">
                                        <h4 className="font-bold text-blue-800 dark:text-blue-200">📍 シーン切り替え時に1回だけ再生させる方法（マーカーパネルの場合）</h4>
                                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                            非ループAPNGをシーン切り替え時に1回だけ再生させたい場合の設定方法です。
                                        </p>
                                    </div>
                                    <div className="p-4 bg-white dark:bg-slate-700 space-y-4 text-sm text-gray-600 dark:text-gray-300">

                                        {/* ステップ1 */}
                                        <div>
                                            <h5 className="font-bold text-gray-800 dark:text-white mb-2">ステップ1: マーカーパネルを追加してAPNGをアップロード</h5>
                                            <ul className="space-y-1 text-xs">
                                                <li>• 5MB以下、<strong>ループOFF</strong>のAPNGを用意</li>
                                                <li>• <a href="https://ccfolia.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 underline">ココフォリア</a>の画面右上の<strong>「マーカーパネル一覧」</strong>を開く</li>
                                                <li>• 「＋」ボタンでAPNGをアップロード</li>
                                            </ul>
                                        </div>

                                        {/* ステップ2 */}
                                        <div>
                                            <h5 className="font-bold text-gray-800 dark:text-white mb-2">ステップ2: 配置とパラメータ設定</h5>
                                            <ul className="space-y-1 text-xs">
                                                <li>• マーカー用の画像を選択</li>
                                                <li>• サイズ・位置を調整（画面全体を覆う場合は大きくリサイズ）</li>
                                                <li>• マーカーを右クリック → 編集画面で以下を設定：</li>
                                            </ul>
                                            <div className="mt-2 ml-4 space-y-2">
                                                <div className="bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-700 p-3 rounded text-sm">
                                                    <strong className="text-orange-700 dark:text-orange-300">⚙️ 重なり優先度：</strong><span className="text-gray-700 dark:text-gray-300">状況により設定が異なるので、他パネルやキャラ表示との兼ね合いで調節</span><br />
                                                    <span className="text-orange-600 dark:text-orange-400 ml-4">• 101以上：キャラクター立ち絵より前<br /><span className="ml-4">• -1以下：前景よりも後ろ</span></span>
                                                </div>
                                                <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 p-3 rounded text-sm">
                                                    <strong className="text-blue-700 dark:text-blue-300">🔒 配置固定：</strong><span className="text-gray-700 dark:text-gray-300">ON（誤操作防止）</span>
                                                </div>
                                            </div>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">※「保存」で設定を確定</p>
                                        </div>

                                        {/* ステップ3 */}
                                        <div>
                                            <h5 className="font-bold text-gray-800 dark:text-white mb-2">ステップ3: シーンを2つ保存する</h5>
                                            <p className="text-xs text-gray-600 dark:text-gray-300 mb-2">同じシーンを2つ作ります</p>
                                            <ul className="space-y-1 text-xs mb-3">
                                                <li>• 画面上部の「GMシーン管理」を開いて、<strong>+ボタンを2回押す</strong></li>
                                                <li>• 「新しいシーン」という名前から、<strong>わかりやすい名前に変更</strong></li>
                                            </ul>
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-xs border border-gray-200 dark:border-gray-600 rounded">
                                                    <thead className="bg-gray-100 dark:bg-slate-600">
                                                        <tr>
                                                            <th className="text-left py-2 px-3 border-b border-gray-200 dark:border-gray-600">シーン</th>
                                                            <th className="text-left py-2 px-3 border-b border-gray-200 dark:border-gray-600">設定内容</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        <tr className="border-b border-gray-200 dark:border-gray-600">
                                                            <td className="py-2 px-3 font-medium">シーンA（再生前）</td>
                                                            <td className="py-2 px-3">マーカーパネルを「NOIMAGE」に設定 → シーン保存</td>
                                                        </tr>
                                                        <tr>
                                                            <td className="py-2 px-3 font-medium">シーンB（再生用）</td>
                                                            <td className="py-2 px-3">マーカーパネルにAPNGを設定 → シーン保存</td>
                                                        </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                            <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-2 mt-2 rounded">
                                                <p className="text-xs text-red-700 dark:text-red-300">
                                                    ⚠️ 必ず「盤面に設定」を押して保存してください。保存しないと設定が消えます。
                                                </p>
                                            </div>
                                        </div>

                                        {/* ステップ4 */}
                                        <div>
                                            <h5 className="font-bold text-gray-800 dark:text-white mb-1">ステップ4: シーン切り替えで再生！</h5>
                                            <p className="text-xs text-gray-600 dark:text-gray-300">
                                                シーン一覧から <strong>シーンA → シーンB</strong> の順に切り替えると、<br />
                                                非ループAPNGが1回だけ再生されます。
                                            </p>
                                        </div>

                                        {/* スクリーンショット */}
                                        <div className="mt-4">
                                            <p className="font-medium text-gray-800 dark:text-white mb-2">📸 実際の設定画面</p>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <div className="bg-gray-50 dark:bg-slate-600 rounded-lg p-2">
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 text-center">①【ステップ1】マーカーパネル一覧を開く</p>
                                                    <img
                                                        src="/manual/marker_add_panel.jpg"
                                                        alt="マーカーパネル一覧"
                                                        className="w-full rounded border border-gray-200 dark:border-gray-600"
                                                        loading="lazy"
                                                        decoding="async"
                                                    />
                                                </div>
                                                <div className="bg-gray-50 dark:bg-slate-600 rounded-lg p-2">
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 text-center">②【ステップ2】画像を選択・配置</p>
                                                    <img
                                                        src="/manual/marker_image_select.jpg"
                                                        alt="画像選択画面"
                                                        className="w-full rounded border border-gray-200 dark:border-gray-600"
                                                        loading="lazy"
                                                        decoding="async"
                                                    />
                                                    <div className="mt-2 text-xs space-y-1">
                                                        <p className="text-orange-600 dark:text-orange-400">💡 重なり優先度：101以上でキャラより前 / -1以下で前景より後ろ</p>
                                                        <p className="text-orange-600 dark:text-orange-400">💡 配置固定：ONで誤操作を防止</p>
                                                    </div>
                                                </div>
                                                <div className="bg-gray-50 dark:bg-slate-600 rounded-lg p-2">
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 text-center">③【ステップ3】シーンA（NOIMAGE）を保存</p>
                                                    <img
                                                        src="/manual/marker_panel_noimage.jpg"
                                                        alt="NOIMAGE設定"
                                                        className="w-full rounded border border-gray-200 dark:border-gray-600"
                                                        loading="lazy"
                                                        decoding="async"
                                                    />
                                                </div>
                                                <div className="bg-gray-50 dark:bg-slate-600 rounded-lg p-2">
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 text-center">④【ステップ3】シーンB（APNG）を保存</p>
                                                    <img
                                                        src="/manual/marker_panel_image_set.jpg"
                                                        alt="APNG設定"
                                                        className="w-full rounded border border-gray-200 dark:border-gray-600"
                                                        loading="lazy"
                                                        decoding="async"
                                                    />
                                                </div>
                                                <div className="bg-gray-50 dark:bg-slate-600 rounded-lg p-2">
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 text-center">⑤【ステップ3】シーン一覧で盤面を保存</p>
                                                    <img
                                                        src="/manual/marker_scene_list.jpg"
                                                        alt="シーン一覧"
                                                        className="w-full rounded border border-gray-200 dark:border-gray-600"
                                                        loading="lazy"
                                                        decoding="async"
                                                    />
                                                </div>
                                                <div className="bg-gray-50 dark:bg-slate-600 rounded-lg p-2">
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 text-center">⑥【ステップ4】シーンA→Bで再生！</p>
                                                    <img
                                                        src="/manual/marker_transition_demo.png"
                                                        alt="シーン切り替えデモ"
                                                        className="w-full rounded border border-gray-200 dark:border-gray-600"
                                                        loading="lazy"
                                                        decoding="async"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* デモ動画1 - 登場 */}
                                        <div className="mt-4">
                                            <p className="font-medium text-gray-800 dark:text-white mb-2">🎬 実際の動作デモ（登場アニメーション）</p>
                                            <div className="relative bg-black rounded-lg overflow-hidden">
                                                <video
                                                    id="marker-demo-video"
                                                    className="w-full"
                                                    playsInline
                                                    controls
                                                    onClick={(e) => {
                                                        const video = e.currentTarget;
                                                        if (video.paused) {
                                                            video.play();
                                                        } else {
                                                            video.pause();
                                                        }
                                                    }}
                                                    onPlay={(e) => {
                                                        const overlay = e.currentTarget.parentElement?.querySelector('.video-overlay') as HTMLElement;
                                                        if (overlay) overlay.style.display = 'none';
                                                    }}
                                                    onPause={(e) => {
                                                        const overlay = e.currentTarget.parentElement?.querySelector('.video-overlay') as HTMLElement;
                                                        if (overlay) overlay.style.display = 'flex';
                                                    }}
                                                    onEnded={(e) => {
                                                        const overlay = e.currentTarget.parentElement?.querySelector('.video-overlay') as HTMLElement;
                                                        const icon = overlay?.querySelector('.play-icon') as HTMLElement;
                                                        const label = overlay?.querySelector('.play-label') as HTMLElement;
                                                        if (overlay) {
                                                            overlay.style.display = 'flex';
                                                        }
                                                        if (icon) {
                                                            icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>';
                                                        }
                                                        if (label) {
                                                            label.textContent = 'もう一度再生する';
                                                        }
                                                        e.currentTarget.currentTime = 0;
                                                    }}
                                                >
                                                    <source src="/manual/transition.mp4" type="video/mp4" />
                                                </video>
                                                <div
                                                    className="video-overlay absolute inset-0 flex flex-col items-center justify-center bg-black/40 cursor-pointer"
                                                    onClick={(e) => {
                                                        const video = e.currentTarget.parentElement?.querySelector('video');
                                                        const icon = e.currentTarget.querySelector('.play-icon') as HTMLElement;
                                                        const label = e.currentTarget.querySelector('.play-label') as HTMLElement;
                                                        if (video) {
                                                            video.play();
                                                            if (icon) icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>';
                                                            if (label) label.textContent = '再生する';
                                                        }
                                                    }}
                                                >
                                                    <div className="play-icon w-20 h-20 bg-white/90 rounded-full flex items-center justify-center text-gray-800 shadow-lg hover:bg-white transition">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                                                            <polygon points="5 3 19 12 5 21 5 3" />
                                                        </svg>
                                                    </div>
                                                    <span className="play-label mt-3 text-white text-sm font-medium">再生する</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* デモ動画2 - 退場 */}
                                        <div className="mt-4">
                                            <p className="font-medium text-gray-800 dark:text-white mb-2">🎬 実際の動作デモ（退場アニメーション）</p>
                                            <div className="relative bg-black rounded-lg overflow-hidden">
                                                <video
                                                    id="marker-demo-video-exit"
                                                    className="w-full"
                                                    playsInline
                                                    controls
                                                    onClick={(e) => {
                                                        const video = e.currentTarget;
                                                        if (video.paused) {
                                                            video.play();
                                                        } else {
                                                            video.pause();
                                                        }
                                                    }}
                                                    onPlay={(e) => {
                                                        const overlay = e.currentTarget.parentElement?.querySelector('.video-overlay') as HTMLElement;
                                                        if (overlay) overlay.style.display = 'none';
                                                    }}
                                                    onPause={(e) => {
                                                        const overlay = e.currentTarget.parentElement?.querySelector('.video-overlay') as HTMLElement;
                                                        if (overlay) overlay.style.display = 'flex';
                                                    }}
                                                    onEnded={(e) => {
                                                        const overlay = e.currentTarget.parentElement?.querySelector('.video-overlay') as HTMLElement;
                                                        const icon = overlay?.querySelector('.play-icon') as HTMLElement;
                                                        const label = overlay?.querySelector('.play-label') as HTMLElement;
                                                        if (overlay) {
                                                            overlay.style.display = 'flex';
                                                        }
                                                        if (icon) {
                                                            icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/></svg>';
                                                        }
                                                        if (label) {
                                                            label.textContent = 'もう一度再生する';
                                                        }
                                                        e.currentTarget.currentTime = 0;
                                                    }}
                                                >
                                                    <source src="/manual/transition2.mp4" type="video/mp4" />
                                                </video>
                                                <div
                                                    className="video-overlay absolute inset-0 flex flex-col items-center justify-center bg-black/40 cursor-pointer"
                                                    onClick={(e) => {
                                                        const video = e.currentTarget.parentElement?.querySelector('video');
                                                        const icon = e.currentTarget.querySelector('.play-icon') as HTMLElement;
                                                        const label = e.currentTarget.querySelector('.play-label') as HTMLElement;
                                                        if (video) {
                                                            video.play();
                                                            if (icon) icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg>';
                                                            if (label) label.textContent = '再生する';
                                                        }
                                                    }}
                                                >
                                                    <div className="play-icon w-20 h-20 bg-white/90 rounded-full flex items-center justify-center text-gray-800 shadow-lg hover:bg-white transition">
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                                                            <polygon points="5 3 19 12 5 21 5 3" />
                                                        </svg>
                                                    </div>
                                                    <span className="play-label mt-3 text-white text-sm font-medium">再生する</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <BackToToc />
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
                                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-3">
                                    <p className="text-sm text-blue-700 dark:text-blue-300">
                                        ⚠️ カットイン用のAPNGは<strong>ループON</strong>で生成してください。<br />
                                        （ループOFFの場合、アニメーションが再生されません）
                                    </p>
                                </div>

                                {/* 設定手順 */}
                                <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2">📋 設定手順</h4>
                                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600 dark:text-gray-300 mb-3">
                                    <li><a href="#steps" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline">APNG作成手順</a>でAPNGを生成してダウンロード<br /><span className="text-orange-600 dark:text-orange-400">（🔄 ループ: <strong>ON</strong> / 📦 容量: <strong>5MB</strong>）</span></li>
                                    <li>ココフォリアで、画面右上の「カットイン」ボタンをクリック → 「+」を押す</li>
                                    <li>「新しいエフェクト」が作成されるのでクリック</li>
                                    <li>「NO IMAGE」をクリックして、カットイン画像をアップロードして選択</li>
                                    <li>（任意）効果音を設定したい場合は音声ファイルを設定し、音量を調整</li>
                                    <li>カットイン名を入力して設定完了</li>
                                </ol>
                                {/* 共通設定の画像 */}
                                <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-2 max-w-[50%] mb-3">
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 text-center">① 共通設定（ループ:<span className="text-red-500 font-bold">ON</span> / 容量制限:<span className="text-red-500 font-bold">5MB</span>）</p>
                                    <img
                                        src="/manual/common_settings_loop_on_5mb.jpg"
                                        alt="共通設定：ループON / 容量5MB"
                                        className="w-full rounded border border-gray-200 dark:border-gray-600"
                                        loading="lazy"
                                        decoding="async"
                                    />
                                </div>

                                {/* 画像グリッド */}
                                <div className="grid grid-cols-2 gap-3 mb-3">
                                    <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-2">
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 text-center">② 「+」で新規作成</p>
                                        <img
                                            src="/manual/cocofolia_cutin_button.jpg"
                                            alt="カットインボタンをクリック"
                                            className="w-full rounded border border-gray-200 dark:border-gray-600"
                                            loading="lazy"
                                            decoding="async"
                                        />
                                    </div>
                                    <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-2">
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 text-center">③ 「新しいエフェクト」をクリック</p>
                                        <img
                                            src="/manual/cocofolia_cutin_neweffect.jpg"
                                            alt="新しいエフェクトをクリック"
                                            className="w-full rounded border border-gray-200 dark:border-gray-600"
                                            loading="lazy"
                                            decoding="async"
                                        />
                                    </div>
                                    <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-2">
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 text-center">④ 「NOIMAGE」をクリックして画像選択</p>
                                        <img
                                            src="/manual/cocofolia_cutin_noimage.jpg"
                                            alt="NOIMAGEをクリック"
                                            className="w-full rounded border border-gray-200 dark:border-gray-600"
                                            loading="lazy"
                                            decoding="async"
                                        />
                                    </div>
                                    <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-2">
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 text-center">⑤ タイトル・音源を設定して完了</p>
                                        <img
                                            src="/manual/cocofolia_cutin_complete.jpg"
                                            alt="設定完了画面"
                                            className="w-full rounded border border-gray-200 dark:border-gray-600"
                                            loading="lazy"
                                            decoding="async"
                                        />
                                    </div>
                                </div>

                                {/* 呼び出し方法 */}
                                <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2">🎬 呼び出し方法</h4>
                                <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-3 mb-3">
                                    <ul className="text-sm text-purple-700 dark:text-purple-300 space-y-2">
                                        <li>• <strong>方法1:</strong> カットイン一覧の再生ボタン（▶）を押す</li>
                                        <li>• <strong>方法2:</strong> ルームチャットに<strong>カットイン名</strong>を入力して送信</li>
                                    </ul>
                                </div>

                                {/* 補足情報 */}
                                <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2">💡 補足・Tips</h4>
                                <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                                    {/* @マークでログ非表示 */}
                                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded p-2">
                                        <p className="mb-2"><strong>@マークでログ非表示:</strong> チャットで<code className="bg-gray-200 dark:bg-gray-600 px-1 rounded">@カットイン名</code>と送信すると、カットインは再生されますがチャットログには残りません。</p>
                                        <div className="bg-gray-50 dark:bg-slate-700 rounded p-1 max-w-xs mx-auto">
                                            <img
                                                src="/manual/cocofolia_chatpalette_send.png"
                                                alt="@マーク付きで送信"
                                                className="w-full rounded border border-gray-200 dark:border-gray-600"
                                                loading="lazy"
                                            />
                                        </div>
                                    </div>
                                    {/* GMのChatパレットに登録 */}
                                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded p-2">
                                        <p className="mb-2"><strong>GMのChatパレットに登録:</strong> よく使うカットイン名をChatパレットに登録しておくと、ワンクリックで呼び出せて便利です！</p>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div className="bg-gray-50 dark:bg-slate-700 rounded p-1">
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 text-center">① パレットに登録</p>
                                                <img
                                                    src="/manual/cocofolia_chatpalette_register.png"
                                                    alt="Chatパレットに登録"
                                                    className="w-full rounded border border-gray-200 dark:border-gray-600"
                                                    loading="lazy"
                                                />
                                            </div>
                                            <div className="bg-gray-50 dark:bg-slate-700 rounded p-1">
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 text-center">② クリックで入力</p>
                                                <img
                                                    src="/manual/cocofolia_chatpalette_use.png"
                                                    alt="Chatパレットから入力"
                                                    className="w-full rounded border border-gray-200 dark:border-gray-600"
                                                    loading="lazy"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <BackToToc />
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
                                {/* 開始方法の分岐 */}
                                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                                    💡 キャラクターコマの作成方法は、<strong>キャラクターシートサイト</strong>を使用しているかで異なります。
                                </p>

                                {/* 2パターンのタブ風表示 */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    {/* パターンA: シートサイトなし */}
                                    <div className="border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden">
                                        <div className="bg-gray-100 dark:bg-slate-600 p-2">
                                            <h4 className="font-semibold text-sm text-center text-gray-700 dark:text-gray-200">🅰️ キャラクターシートサイトを使わない場合</h4>
                                        </div>
                                        <div className="p-3">
                                            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600 dark:text-gray-300">
                                                <li><a href="#steps" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline">APNG作成手順</a>でAPNGを生成してダウンロード<br /><span className="text-orange-600 dark:text-orange-400">（🔄 ループ: <strong>用途による</strong> / 📦 容量: <strong>5MB</strong>）</span></li>
                                                <li>ココフォリアで、ルーム画面左下の<strong>キャラクターアイコン</strong>をクリック</li>
                                                <li>「+」ボタンで新規キャラクター作成</li>
                                                <li>キャラクター名などを設定</li>
                                                <li>「キャラクター」タブを開く</li>
                                                <li>画像ファイルをアップロードして設定</li>
                                            </ol>
                                        </div>
                                    </div>

                                    {/* パターンB: シートサイトあり */}
                                    <div className="border border-green-200 dark:border-green-600 rounded-lg overflow-hidden">
                                        <div className="bg-green-100 dark:bg-green-900/30 p-2">
                                            <h4 className="font-semibold text-sm text-center text-green-700 dark:text-green-200">🅱️ キャラクターシートサイトを使う場合</h4>
                                        </div>
                                        <div className="p-3">
                                            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600 dark:text-gray-300">
                                                <li><a href="#steps" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline">APNG作成手順</a>でAPNGを生成してダウンロード<br /><span className="text-orange-600 dark:text-orange-400">（🔄 ループ: <strong>用途による</strong> / 📦 容量: <strong>5MB</strong>）</span></li>
                                                <li>各キャラクターシート作成サイトで「ココフォリア用コマ出力」などからコピー</li>
                                                <li>ココフォリアのルーム画面に貼り付け</li>
                                                <li>作成されたコマアイコンをクリック</li>
                                                <li>キャラクター名の左にあるアイコンをクリック</li>
                                                <li>キャラクタータブが開くので画像ファイルをアップロードして設定</li>
                                            </ol>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">※ キャラクターシートサービスによって手順が異なる場合があります</p>
                                        </div>
                                    </div>
                                </div>

                                {/* 共通手順の補足 */}
                                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-3">
                                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                                        ⚠️ キャラクターシートサイトからコピー&ペーストでコマを作成した場合<br />
                                        画像以外が設定済みの状態です。立ち絵を設定する場合は、「キャラクター」コマをクリックして、キャラ名の左のアイコンをクリックし、画像をアップロードし設定してください。
                                    </p>
                                </div>

                                {/* 画像グリッド */}
                                <div className="grid grid-cols-2 gap-3 mb-4">
                                    <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-2">
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 text-center">① キャラクター一覧を開く</p>
                                        <img
                                            src="/manual/cocofolia_character_list_button.jpg"
                                            alt="キャラクター一覧ボタン"
                                            className="w-full rounded border border-gray-200 dark:border-gray-600"
                                            loading="lazy"
                                        />
                                    </div>
                                    <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-2">
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 text-center">② アイコンをクリックして編集</p>
                                        <img
                                            src="/manual/cocofolia_character_edit_icon.jpg"
                                            alt="キャラクター編集画面"
                                            className="w-full rounded border border-gray-200 dark:border-gray-600"
                                            loading="lazy"
                                        />
                                    </div>
                                    <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-2">
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 text-center">③ キャラクタータブで画像アップロード</p>
                                        <img
                                            src="/manual/cocofolia_character_upload.png"
                                            alt="キャラクタータブで画像設定"
                                            className="w-full rounded border border-gray-200 dark:border-gray-600"
                                            loading="lazy"
                                        />
                                    </div>
                                    <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-2">
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 text-center">④ 完成！ルームに立ち絵表示</p>
                                        <img
                                            src="/manual/cocofolia_character_complete.png"
                                            alt="完成したキャラクター"
                                            className="w-full rounded border border-gray-200 dark:border-gray-600"
                                            loading="lazy"
                                        />
                                    </div>
                                </div>

                                {/* 差分設定の補足 */}
                                <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300 mb-2">💡 補足: 差分（表情差分）の設定</h4>
                                <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded p-3 text-sm text-gray-600 dark:text-gray-300">
                                    <p className="mb-2">キャラクターに複数の立ち絵（表情差分など）を設定できます。</p>
                                    <ol className="list-decimal list-inside space-y-1 mb-3">
                                        <li>複数の画像をアップロード</li>
                                        <li>キャラコマの設定画面で「立ち絵・差分」項目の<strong>「+」</strong>を押して差分設定を追加</li>
                                        <li>チャット欄で <code className="bg-gray-200 dark:bg-gray-600 px-1 rounded">@笑顔</code> などを入力して切り替え</li>
                                        <li>または、チャットパレットに差分コマンドを登録</li>
                                    </ol>
                                    {/* 差分画像 */}
                                    <div className="grid grid-cols-2 gap-2 mb-2">
                                        <div className="bg-gray-50 dark:bg-slate-700 rounded p-1">
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 text-center">立ち絵・差分の設定</p>
                                            <img
                                                src="/manual/cocofolia_character_sabun_setting.png"
                                                alt="差分設定画面"
                                                className="w-full rounded border border-gray-200 dark:border-gray-600"
                                                loading="lazy"
                                            />
                                        </div>
                                        <div className="bg-gray-50 dark:bg-slate-700 rounded p-1">
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 text-center">チャットパレットで差分切替</p>
                                            <img
                                                src="/manual/cocofolia_character_sabun_use.png"
                                                alt="差分使用画面"
                                                className="w-full rounded border border-gray-200 dark:border-gray-600"
                                                loading="lazy"
                                            />
                                        </div>
                                    </div>
                                    <p className="text-xs text-purple-600 dark:text-purple-400">💡 APNGの差分を複数登録すれば、表情ごとにアニメーション付き立ち絵を使い分けられます！</p>
                                </div>

                                <BackToToc />
                            </div>
                        </div>
                        <BackToToc />
                    </div>
                </section>

                {/* FAQ */}
                <section id="faq" className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 mb-6">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
                        <HelpCircle className="w-5 h-5 mr-2 text-blue-500" aria-hidden="true" focusable="false" />
                        FAQ
                    </h2>


                    <div className="space-y-4">
                        {/* FAQ1: トラブルシューティング（Q1, Q8, Q11を統合） */}
                        <details id="faq-animation" className="group border border-red-200 dark:border-red-800 rounded-lg overflow-hidden">
                            <summary className="cursor-pointer font-bold text-gray-800 dark:text-white hover:text-red-600 dark:hover:text-red-400 transition list-none flex items-center gap-2 bg-red-50 dark:bg-red-900/20 p-3">
                                <span className="text-lg">🚨</span>
                                <span className="flex-1">アニメーションが動かない / 重い / 表示されない</span>
                            </summary>
                            <div className="p-4 bg-white dark:bg-slate-700 text-sm text-gray-600 dark:text-gray-300 space-y-4">

                                {/* 用途別要件表 */}
                                <div>
                                    <p className="font-medium text-gray-800 dark:text-white mb-3">📋 用途別の設定要件</p>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-xs border-collapse border border-gray-300 dark:border-gray-600">
                                            <thead>
                                                <tr className="bg-gray-100 dark:bg-gray-700">
                                                    <th className="border border-gray-300 dark:border-gray-600 p-2 text-left font-bold">用途</th>
                                                    <th className="border border-gray-300 dark:border-gray-600 p-2 text-center font-bold">容量制限</th>
                                                    <th className="border border-gray-300 dark:border-gray-600 p-2 text-center font-bold">ループ</th>
                                                    <th className="border border-gray-300 dark:border-gray-600 p-2 text-left font-bold">備考</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr className="bg-orange-50 dark:bg-orange-900/20">
                                                    <td className="border border-gray-300 dark:border-gray-600 p-2 font-semibold">📺 スクリーンパネル</td>
                                                    <td className="border border-gray-300 dark:border-gray-600 p-2 text-center">
                                                        <span className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-0.5 rounded">5MB以下</span>
                                                    </td>
                                                    <td className="border border-gray-300 dark:border-gray-600 p-2 text-center">
                                                        <span className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 px-2 py-0.5 rounded font-bold">ON必須</span>
                                                    </td>
                                                    <td className="border border-gray-300 dark:border-gray-600 p-2">非ループは実質使用不可</td>
                                                </tr>
                                                <tr>
                                                    <td className="border border-gray-300 dark:border-gray-600 p-2 font-semibold">📍 マーカーパネル</td>
                                                    <td className="border border-gray-300 dark:border-gray-600 p-2 text-center">
                                                        <span className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-0.5 rounded">5MB以下</span>
                                                    </td>
                                                    <td className="border border-gray-300 dark:border-gray-600 p-2 text-center">
                                                        <span className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded">推奨</span>
                                                    </td>
                                                    <td className="border border-gray-300 dark:border-gray-600 p-2">非ループも可（※）</td>
                                                </tr>
                                                <tr className="bg-purple-50 dark:bg-purple-900/20">
                                                    <td className="border border-gray-300 dark:border-gray-600 p-2 font-semibold">⚡ カットイン</td>
                                                    <td className="border border-gray-300 dark:border-gray-600 p-2 text-center">
                                                        <span className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-0.5 rounded">5MB以下</span>
                                                    </td>
                                                    <td className="border border-gray-300 dark:border-gray-600 p-2 text-center">
                                                        <span className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 px-2 py-0.5 rounded font-bold">ON必須</span>
                                                    </td>
                                                    <td className="border border-gray-300 dark:border-gray-600 p-2">非ループはアニメが再生されない</td>
                                                </tr>
                                                <tr>
                                                    <td className="border border-gray-300 dark:border-gray-600 p-2 font-semibold">🧍 立ち絵</td>
                                                    <td className="border border-gray-300 dark:border-gray-600 p-2 text-center">
                                                        <span className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-0.5 rounded">5MB以下</span>
                                                    </td>
                                                    <td className="border border-gray-300 dark:border-gray-600 p-2 text-center">
                                                        <span className="bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded">任意</span>
                                                    </td>
                                                    <td className="border border-gray-300 dark:border-gray-600 p-2">どちらでもOK</td>
                                                </tr>
                                                <tr>
                                                    <td className="border border-gray-300 dark:border-gray-600 p-2 font-semibold">🖼️ 前景・背景</td>
                                                    <td className="border border-gray-300 dark:border-gray-600 p-2 text-center">
                                                        <span className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-0.5 rounded">5MB以下</span>
                                                    </td>
                                                    <td className="border border-gray-300 dark:border-gray-600 p-2 text-center">
                                                        <span className="bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded">任意</span>
                                                    </td>
                                                    <td className="border border-gray-300 dark:border-gray-600 p-2">どちらでもOK</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                        ※ 非ループの2回目以降の再生には、シーンを複製して前のシーンをNOIMAGEにしてからシーンを切り替える必要があります
                                    </p>
                                </div>

                                {/* 診断フロー */}
                                <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                                    <p className="font-medium text-gray-800 dark:text-white mb-3">🔍 それでも動かない場合の診断フロー</p>

                                    <div className="space-y-4">
                                        {/* チェック1: 容量 */}
                                        <div>
                                            <p className="font-bold text-sm mb-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 px-3 py-2 rounded">1️⃣ 容量オーバーしていませんか？</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-300 px-3 py-1">
                                                スクリーン/マーカーパネル：<strong>5MB以下推奨</strong> | カットイン/立ち絵/前景・背景：<strong>5MB以下推奨</strong><br />
                                                → 容量設定で「5MB」を選んでください<br />
                                                → または <a href="https://because-and-and.github.io/Cocofolia_image_minify/" target="_blank" rel="noopener noreferrer" className="text-orange-600 dark:text-orange-400 underline hover:text-orange-700">ココフォリア画像圧縮ツール</a> で5MB以下に圧縮してください
                                            </p>
                                        </div>

                                        {/* チェック2: 圧縮 */}
                                        <div>
                                            <p className="font-bold text-sm mb-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 px-3 py-2 rounded">2️⃣ 「圧縮しますか？」で「OK」を選びませんでしたか？</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-300 px-3 py-1">
                                                ココフォリアで「圧縮しますか？」と聞かれたら<strong>必ず「キャンセル」</strong>を選択<br />
                                                「OK」を選ぶと静止画になります → 5MB以下に圧縮してから再アップロードしてください
                                            </p>
                                        </div>

                                        {/* チェック3: ループ */}
                                        <div>
                                            <p className="font-bold text-sm mb-1 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 px-3 py-2 rounded">3️⃣ カットインやスクリーンパネルをループOFFで生成していませんか？</p>
                                            <p className="text-sm text-gray-600 dark:text-gray-300 px-3 py-1">
                                                <strong>カットイン・スクリーンパネル</strong>は<strong>ループON必須</strong>です<br />
                                                → 共通設定で「ループON」にして再生成してください
                                            </p>
                                        </div>

                                        {/* チェック4: マーカーパネル非ループ */}
                                        <div>
                                            <p className="font-bold text-sm mb-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-3 py-2 rounded">4️⃣ マーカーパネルをループOFFで設定していますか？</p>
                                            <div className="text-sm text-gray-600 dark:text-gray-300 px-3 py-2">
                                                <p className="font-medium mb-2">🎬 マーカーパネルで非ループアニメを1回だけ再生する方法</p>
                                                <ol className="list-decimal list-inside space-y-1 mb-2">
                                                    <li>「NOIMAGE」のシーンを作成（マーカーパネルを配置し、画像は「No Image」を選択）</li>
                                                    <li>そのシーンを複製し、複製したシーンのマーカーパネルに非ループAPNGを設定</li>
                                                    <li>「NOIMAGE」シーン → 「APNG設定済み」シーンの順に切り替えると再生される</li>
                                                </ol>
                                                <p className="text-blue-600 dark:text-blue-400">💡 毎回再生させたい場合は、必ずこの順番で切り替えてください。</p>
                                                <p className="mt-2">→ <a href="#cocofolia-marker-oneplay" className="text-blue-600 dark:text-blue-400 underline hover:text-blue-700">詳細手順はこちら</a></p>
                                            </div>
                                        </div>

                                        {/* チェック5: 前景・背景非ループ */}
                                        <div>
                                            <p className="font-bold text-sm mb-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 px-3 py-2 rounded">5️⃣ 前景・背景をループOFFで設定していますか？</p>
                                            <div className="text-sm text-gray-600 dark:text-gray-300 px-3 py-2">
                                                <p className="font-medium mb-2">🎬 前景・背景で非ループアニメを1回だけ再生する方法</p>
                                                <ol className="list-decimal list-inside space-y-1 mb-2">
                                                    <li>前景/背景に別の画像を設定したシーンAを保存</li>
                                                    <li>シーンAを複製し、複製したシーンBの前景/背景に非ループAPNGを設定して保存</li>
                                                    <li>シーンA → シーンB の順に切り替えると再生される</li>
                                                </ol>
                                                <p className="text-orange-600 dark:text-orange-400">⚠️ 前景・背景は「設定なし→画像」では再生されません。必ず「画像→APNG画像」への切り替えが必要です。</p>
                                                <p className="mt-2">→ <a href="#cocofolia-foreground-oneplay" className="text-green-600 dark:text-green-400 underline hover:text-green-700">詳細手順はこちら</a></p>
                                            </div>
                                        </div>

                                        {/* チェック6: その他 */}
                                        <div>
                                            <p className="font-bold text-sm mb-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 px-3 py-2 rounded">6️⃣ その他の原因</p>
                                            <ul className="text-sm text-gray-600 dark:text-gray-300 px-3 py-1 space-y-1">
                                                <li>• <strong>ブラウザキャッシュ:</strong> 強制リロード（Windows: Ctrl+F5 / Mac: Cmd+Shift+R）</li>
                                                <li>• <strong>データ量過多:</strong> ルームの不要な画像素材を削除</li>
                                                <li>• <strong>ブラウザ互換性:</strong> Chrome、Firefox、Edgeの最新版を使用</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </details>

                        {/* FAQ2: アップロード時の注意（Q7を維持・強化） */}
                        <details id="faq-compress" className="group border border-orange-200 dark:border-orange-800 rounded-lg overflow-hidden">
                            <summary className="cursor-pointer font-bold text-gray-800 dark:text-white hover:text-orange-600 dark:hover:text-orange-400 transition list-none flex items-center gap-2 bg-orange-50 dark:bg-orange-900/20 p-3">
                                <span className="text-lg">⚠️</span>
                                <span className="flex-1">「圧縮しますか？」と聞かれたら</span>
                            </summary>
                            <div className="p-4 bg-white dark:bg-slate-700 text-sm text-gray-600 dark:text-gray-300 space-y-4">
                                {/* 説明と画像 */}
                                <div>
                                    <p className="mb-2">ファイルサイズが5MBを超えている可能性があります。</p>
                                    <p className="font-medium">一旦キャンセルをしてください。</p>
                                </div>

                                {/* 圧縮ダイアログの画像 */}
                                <div className="bg-gray-50 dark:bg-slate-600 rounded-lg p-2 max-w-sm">
                                    <img
                                        src="/manual/cocofolia_compress_dialog.png"
                                        alt="ココフォリアの圧縮確認ダイアログ"
                                        className="w-full rounded border border-gray-200 dark:border-gray-600"
                                        loading="lazy"
                                        decoding="async"
                                    />
                                </div>

                                {/* 補足 */}
                                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded p-3">
                                    <p className="font-medium text-yellow-700 dark:text-yellow-300 mb-1">※ 補足</p>
                                    <p className="text-xs text-yellow-600 dark:text-yellow-400">
                                        このメッセージに「OK」を選んでアップロードすると、<br />
                                        APNGが静止画に変換されてしまいます。<br />
                                        アップロードはできますが、アニメーションしなくなります。
                                    </p>
                                </div>

                                {/* 対処方法 */}
                                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded p-3">
                                    <p className="font-medium text-blue-700 dark:text-blue-300 mb-2">💡 このポップアップが出た場合の対処方法</p>
                                    <p className="text-blue-600 dark:text-blue-400">
                                        ファイルサイズを5MB以下にする必要があるため、<br />
                                        5MB以下まで圧縮してご利用ください。
                                    </p>
                                </div>

                                {/* 圧縮方法 */}
                                <div>
                                    <p className="font-bold text-gray-800 dark:text-white mb-2">圧縮方法</p>
                                    <ul className="text-gray-700 dark:text-gray-200 space-y-1 mb-3">
                                        <li><strong>方法1：</strong>APNG Generatorで「5MB」のオプションを選ぶ</li>
                                        <li><strong>方法2：</strong><a href="https://minify.ccfolia.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 underline">ココフォリア画像圧縮ツール</a>を使う</li>
                                    </ul>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* 方法1 画像 */}
                                        <div className="bg-gray-50 dark:bg-slate-600 rounded-lg p-2">
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 text-center">方法1</p>
                                            <img
                                                src="/manual/common_settings_loop_choice_5mb.jpg"
                                                alt="共通設定：容量5MB"
                                                className="w-full rounded border border-gray-200 dark:border-gray-600"
                                                loading="lazy"
                                                decoding="async"
                                            />
                                        </div>
                                        {/* 方法2 画像 */}
                                        <div className="bg-gray-50 dark:bg-slate-600 rounded-lg p-2">
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1 text-center">方法2</p>
                                            <img
                                                src="/manual/cocofolia_minify_tool.png"
                                                alt="ココフォリア画像圧縮ツール"
                                                className="w-full rounded border border-gray-200 dark:border-gray-600"
                                                loading="lazy"
                                                decoding="async"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </details>

                        {/* FAQ3: 画質・表示設定（Q2, Q3を統合） */}
                        <details id="faq-quality" className="group border border-yellow-200 dark:border-yellow-800 rounded-lg overflow-hidden">
                            <summary className="cursor-pointer font-bold text-gray-800 dark:text-white hover:text-yellow-600 dark:hover:text-yellow-400 transition list-none flex items-center gap-2 bg-yellow-50 dark:bg-yellow-900/20 p-3">
                                <span className="text-lg">🖼️</span>
                                <span className="flex-1">画質が悪い / 透過部分が白くなる</span>
                            </summary>
                            <div className="p-4 bg-white dark:bg-slate-700 text-sm text-gray-600 dark:text-gray-300 space-y-3">
                                <div>
                                    <p className="font-medium text-gray-800 dark:text-white mb-1">📉 画質が悪い場合</p>
                                    <p className="mb-2">容量制限内に収めるため、自動で解像度や色数が調整されることがあります。</p>

                                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded p-2">
                                        <p className="font-medium text-green-700 dark:text-green-300 mb-1">💡 画質を上げるコツ</p>
                                        <ul className="text-gray-700 dark:text-gray-200 space-y-2">
                                            <li>• <strong>容量設定を「5MB」にする</strong>（すべての用途で5MB推奨）</li>
                                            <li>• <strong>生成元の画像サイズを調整する</strong>（高画質すぎると高圧縮がかかってしまいます）<br />
                                                <span className="text-xs text-gray-500 dark:text-gray-400 ml-4">※ 元画像の解像度が高すぎる場合は、事前にリサイズしてからアップロードすると、より狙った画質でAPNGを生成できます</span>
                                            </li>
                                            <li>• <strong>フレームレートを下げる</strong>（総フレーム数が減り、1枚あたりの画質が向上）<br />
                                                <span className="text-xs text-orange-600 dark:text-orange-400 ml-4">⚠️ 動きがカクカクになる可能性があります。生成結果をチェックしてください</span>
                                            </li>
                                            <li>• <strong><a href="https://because-and-and.github.io/Cocofolia_image_minify/" target="_blank" rel="noopener noreferrer" className="text-green-600 dark:text-green-400 underline hover:text-green-700">ココフォリア圧縮ツール</a>を使う</strong><br />
                                                <span className="text-xs text-orange-600 dark:text-orange-400 ml-4">⚠️ 容量のサイズ指定はできないので、圧縮の結果5MB以下になっているか確認する必要があります</span>
                                            </li>
                                        </ul>
                                        {/* フレームレート設定の画像 */}
                                        <div className="bg-white dark:bg-slate-700 rounded-lg p-2 mt-2 max-w-sm">
                                            <img
                                                src="/manual/faq_framerate_setting.png"
                                                alt="フレームレート設定"
                                                className="w-full rounded border border-gray-200 dark:border-gray-600"
                                                loading="lazy"
                                                decoding="async"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <p className="font-medium text-gray-800 dark:text-white mb-1">⬜ 透過部分が白くなる場合</p>
                                    <p>元画像が<strong>PNG形式で透過情報を持っているか</strong>確認してください。</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-3">JPG形式は透過に対応していません。必ずPNGを使用してください。</p>

                                    {/* 透過比較画像 */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-gray-50 dark:bg-slate-600 rounded-lg p-2">
                                            <p className="text-xs text-center text-red-500 font-medium mb-1">❌ 透過なし（白背景）</p>
                                            <img
                                                src="/manual/faq_no_transparency.png"
                                                alt="透過なし画像"
                                                className="w-full rounded border border-gray-200 dark:border-gray-600"
                                                loading="lazy"
                                                decoding="async"
                                            />
                                        </div>
                                        <div className="bg-gray-50 dark:bg-slate-600 rounded-lg p-2">
                                            <p className="text-xs text-center text-green-600 font-medium mb-1">✅ 透過あり</p>
                                            <img
                                                src="/manual/faq_with_transparency.png"
                                                alt="透過あり画像"
                                                className="w-full rounded border border-gray-200 dark:border-gray-600"
                                                loading="lazy"
                                                decoding="async"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </details>

                        {/* FAQ4: 非ループ素材の高度な使い方（Q4, Q6, Q9, Q10を統合） */}
                        <details id="faq-noloop" className="group border border-purple-200 dark:border-purple-800 rounded-lg overflow-hidden">
                            <summary className="cursor-pointer font-bold text-gray-800 dark:text-white hover:text-purple-600 dark:hover:text-purple-400 transition list-none flex items-center gap-2 bg-purple-50 dark:bg-purple-900/20 p-3">
                                <span className="text-lg">🔄</span>
                                <span className="flex-1">シーンを切り替えた時に非ループAPNGが再生されない</span>
                            </summary>
                            <div className="p-4 bg-white dark:bg-slate-700 text-sm text-gray-600 dark:text-gray-300 space-y-4">
                                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded p-3">
                                    <p className="font-medium text-yellow-800 dark:text-yellow-200 mb-1">💡 非ループAPNGとは？</p>
                                    <p className="text-xs text-yellow-700 dark:text-yellow-300">ループOFFで生成したAPNGで、アニメーションが1回だけ再生されて止まるタイプの画像です。</p>
                                </div>

                                {/* 用途別対応表 */}
                                <div>
                                    <p className="font-medium text-gray-800 dark:text-white mb-2">📋 用途別の対応状況</p>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-xs border-collapse">
                                            <thead>
                                                <tr className="bg-gray-100 dark:bg-gray-600">
                                                    <th className="border border-gray-300 dark:border-gray-500 p-2 text-left">用途</th>
                                                    <th className="border border-gray-300 dark:border-gray-500 p-2 text-center">非ループ利用</th>
                                                    <th className="border border-gray-300 dark:border-gray-500 p-2 text-left">備考</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td className="border border-gray-300 dark:border-gray-500 p-2 font-medium">スクリーンパネル</td>
                                                    <td className="border border-gray-300 dark:border-gray-500 p-2 text-center text-red-600 dark:text-red-400 font-bold">❌</td>
                                                    <td className="border border-gray-300 dark:border-gray-500 p-2">初回のみ再生。ループON推奨。</td>
                                                </tr>
                                                <tr>
                                                    <td className="border border-gray-300 dark:border-gray-500 p-2 font-medium">マーカーパネル</td>
                                                    <td className="border border-gray-300 dark:border-gray-500 p-2 text-center text-green-600 dark:text-green-400 font-bold">⭕</td>
                                                    <td className="border border-gray-300 dark:border-gray-500 p-2">可能。2回目はNOIMAGE経由で再設定。</td>
                                                </tr>
                                                <tr>
                                                    <td className="border border-gray-300 dark:border-gray-500 p-2 font-medium">カットイン</td>
                                                    <td className="border border-gray-300 dark:border-gray-500 p-2 text-center text-red-600 dark:text-red-400 font-bold">❌</td>
                                                    <td className="border border-gray-300 dark:border-gray-500 p-2">再生されません。必ずループON。</td>
                                                </tr>
                                                <tr>
                                                    <td className="border border-gray-300 dark:border-gray-500 p-2 font-medium">立ち絵（登場演出）</td>
                                                    <td className="border border-gray-300 dark:border-gray-500 p-2 text-center text-green-600 dark:text-green-400 font-bold">⭕</td>
                                                    <td className="border border-gray-300 dark:border-gray-500 p-2">最適。1回だけ再生して静止。</td>
                                                </tr>
                                                <tr>
                                                    <td className="border border-gray-300 dark:border-gray-500 p-2 font-medium">前景/背景</td>
                                                    <td className="border border-gray-300 dark:border-gray-500 p-2 text-center text-green-600 dark:text-green-400 font-bold">⭕</td>
                                                    <td className="border border-gray-300 dark:border-gray-500 p-2">可能。ただし「画像→APNG画像」へのシーン切り替えが必要。</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* NOIMAGE経由の再生法 */}
                                <div className="mb-4">
                                    <p className="font-medium text-blue-700 dark:text-blue-300 mb-2 bg-blue-100 dark:bg-blue-900/30 px-3 py-2 rounded">🎬 マーカーパネルで非ループアニメを1回だけ再生する方法</p>
                                    <ol className="text-sm text-gray-700 dark:text-gray-300 space-y-1 px-3">
                                        <li><strong>1.</strong> 「NOIMAGE」のシーンを作成（マーカーパネルを配置し、画像は「No Image」を選択）</li>
                                        <li><strong>2.</strong> そのシーンを複製し、複製したシーンのマーカーパネルに非ループAPNGを設定</li>
                                        <li><strong>3.</strong> 「NOIMAGE」シーン → 「APNG設定済み」シーンの順に切り替えると再生される</li>
                                    </ol>
                                    <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mt-2 px-3">→ <a href="#cocofolia-marker-oneplay" className="underline hover:text-blue-800 dark:hover:text-blue-300">詳しくはこちら</a></p>
                                </div>

                                {/* 前景・背景での再生法 */}
                                <div>
                                    <p className="font-medium text-green-700 dark:text-green-300 mb-2 bg-green-100 dark:bg-green-900/30 px-3 py-2 rounded">🎬 前景・背景で非ループアニメを1回だけ再生する方法</p>
                                    <ol className="text-sm text-gray-700 dark:text-gray-300 space-y-1 px-3">
                                        <li><strong>1.</strong> 前景/背景に<strong>別の画像</strong>を設定したシーンAを保存</li>
                                        <li><strong>2.</strong> シーンAを複製し、複製したシーンBの前景/背景に非ループAPNGを設定して保存</li>
                                        <li><strong>3.</strong> シーンA → シーンB の順に切り替えると再生される</li>
                                    </ol>
                                    <p className="text-sm text-orange-600 dark:text-orange-400 mt-2 px-3">⚠️ 前景・背景は「設定なし→画像」では再生されません。必ず「画像→APNG画像」への切り替えが必要です。</p>
                                    <p className="text-sm font-medium text-green-600 dark:text-green-400 mt-2 px-3">→ <a href="#cocofolia-foreground-oneplay" className="underline hover:text-green-800 dark:hover:text-green-300">詳しくはこちら</a></p>
                                </div>
                            </div>
                        </details>
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
                    <p className="text-xs text-gray-400">最終更新：2025年12月</p>
                    <div className="text-sm text-gray-500">
                        <Link href="/" className="text-blue-600 hover:underline">
                            ← APNG Generator に戻る
                        </Link>
                    </div>
                </div>
            </div >
            <FeedbackModal isOpen={isFeedbackModalOpen} onClose={() => setIsFeedbackModalOpen(false)} version="V120 Manual" />
        </div >
    )
}
