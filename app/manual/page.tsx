'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Upload, MousePointer, Download, AlertTriangle, CheckCircle, Zap, Image, Settings, HelpCircle, ExternalLink, MessageSquare } from 'lucide-react'
import { FeedbackModal } from '../../components/FeedbackModal'

export default function ManualPage() {
    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false)

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
                    <div className="mb-6 border border-blue-200 dark:border-blue-800 rounded-lg overflow-hidden">
                        <div className="bg-blue-50 dark:bg-blue-900/30 p-3 flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-white font-bold">1</span>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-800 dark:text-white">画像を選択</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-300">「画像選択＆プレビュー」パネルで画像を読み込みます</p>
                            </div>
                        </div>
                        <div className="p-4 bg-white dark:bg-slate-700">
                            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600 dark:text-gray-300 mb-3">
                                <li>画面左側の<strong>「画像選択＆プレビュー」</strong>パネルに、PNG/JPG画像をドラッグ＆ドロップ（またはクリックして選択）</li>
                                <li>アップロードされると、プレビューキャンバスに画像が表示されます</li>
                            </ol>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                ※透過PNG画像を使用すると、背景が透明なAPNGが生成できます
                            </p>
                        </div>
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
                    </div>

                    {/* ステップ2 */}
                    <div className="mb-6 border border-blue-200 dark:border-blue-800 rounded-lg overflow-hidden">
                        <div className="bg-blue-50 dark:bg-blue-900/30 p-3 flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-white font-bold">2</span>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-800 dark:text-white">トランジション効果を選択</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-300">登場・退場・演出の中から好みの効果を選びます</p>
                            </div>
                        </div>
                        <div className="p-4 bg-white dark:bg-slate-700">
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                                        画面右側の<strong>「トランジション効果」</strong>パネルで、タブから効果カテゴリを選択：
                                    </p>
                                    <div className="space-y-2 mb-3">
                                        <div className="bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500 p-2 rounded">
                                            <span className="font-bold text-blue-700 dark:text-blue-300 text-sm">登場</span>
                                            <span className="text-xs text-gray-600 dark:text-gray-400">：画像が現れるアニメーション</span>
                                        </div>
                                        <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-2 rounded">
                                            <span className="font-bold text-red-700 dark:text-red-300 text-sm">退場</span>
                                            <span className="text-xs text-gray-600 dark:text-gray-400">：画像が消えるアニメーション</span>
                                        </div>
                                        <div className="bg-purple-50 dark:bg-purple-900/30 border-l-4 border-purple-500 p-2 rounded">
                                            <span className="font-bold text-purple-700 dark:text-purple-300 text-sm">演出</span>
                                            <span className="text-xs text-gray-600 dark:text-gray-400">：ループするエフェクト</span>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-2 mb-3">
                                        <img
                                            src="/manual/step2_transitions.png"
                                            alt="トランジション効果の種類"
                                            className="w-full rounded border border-gray-200 dark:border-gray-600"
                                            loading="lazy"
                                            decoding="async"
                                            width="800"
                                            height="450"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                                        <strong>「効果オプション」</strong>で方向や強度を調整できます
                                    </p>
                                    <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-2 mb-3">
                                        <img
                                            src="/manual/step2_effect_options.png"
                                            alt="効果オプション設定画面"
                                            className="w-full rounded border border-gray-200 dark:border-gray-600"
                                            loading="lazy"
                                            decoding="async"
                                            width="800"
                                            height="300"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                                        <strong>「共通設定」</strong>で以下を設定：
                                    </p>
                                    <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1 list-disc list-inside mb-2">
                                        <li><strong>ループ</strong>：ON=繰り返し再生 / OFF=1回のみ再生</li>
                                        <li><strong>容量制限</strong>：用途に合わせて1MB/5MB/制限なしを選択</li>
                                    </ul>
                                    <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-2">
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
                            </div>
                        </div>
                    </div>

                    {/* ステップ3 */}
                    <div className="border border-indigo-200 dark:border-indigo-800 rounded-lg overflow-hidden">
                        <div className="bg-indigo-50 dark:bg-indigo-900/30 p-3 flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-white font-bold">3</span>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-800 dark:text-white">プレビュー確認 & APNG生成</h3>
                                <p className="text-sm text-gray-600 dark:text-gray-300">仕上がりを確認してダウンロードします</p>
                            </div>
                        </div>
                        <div className="p-4 bg-white dark:bg-slate-700">
                            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600 dark:text-gray-300 mb-3">
                                <li>効果を選択すると自動でプレビューが再生されます（手動で確認したい場合は<strong>「プレビュー」</strong>ボタンをクリック）</li>
                                <li>問題なければ<strong>「APNG生成」</strong>ボタンをクリック</li>
                                <li>生成が完了すると自動的にAPNGファイルがダウンロードされます</li>
                            </ol>
                            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded p-2 text-xs text-green-700 dark:text-green-300">
                                ✅ 生成後、ファイルサイズが表示されます。容量制限を超えた場合は自動で圧縮されます。
                            </div>
                        </div>
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

                        <div>
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

                        <div>
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

                        <div>
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

                        <div>
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
                                    <td className="py-2 px-3"><span className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-0.5 rounded">1MB未満推奨</span></td>
                                    <td className="py-2 px-3 text-gray-600 dark:text-gray-400">圧縮を避けアニメーション安定動作</td>
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

                    <div className="space-y-3">
                        <details className="group border-b border-gray-200 dark:border-gray-700 pb-3">
                            <summary className="cursor-pointer font-semibold text-gray-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition list-none flex items-center gap-2">
                                <svg
                                    className="w-5 h-5 transition-transform group-open:rotate-90"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    aria-hidden="true"
                                    focusable="false"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                                Q. アニメーションが動かない
                            </summary>
                            <div className="mt-3 ml-7 text-sm text-gray-600 dark:text-gray-300 space-y-2">
                                <p>ファイルサイズと圧縮が原因の可能性があります。以下を確認してください：</p>
                                <ul className="list-disc list-inside space-y-1 ml-4">
                                    <li>ファイルサイズが1MB未満か確認</li>
                                    <li>ココフォリア側で圧縮が適用されていないか確認（「圧縮しますか？」で「いいえ」を選択）</li>
                                    <li>カットインの場合、ループがONになっているか確認</li>
                                    <li>動かない場合はNOIMAGEを試してみる（下記参照）</li>
                                </ul>
                            </div>
                        </details>

                        <details className="group border-b border-gray-200 dark:border-gray-700 pb-3">
                            <summary className="cursor-pointer font-semibold text-gray-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition list-none flex items-center gap-2">
                                <svg
                                    className="w-5 h-5 transition-transform group-open:rotate-90"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    aria-hidden="true"
                                    focusable="false"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                                Q. 画質が悪い
                            </summary>
                            <div className="mt-3 ml-7 text-sm text-gray-600 dark:text-gray-300">
                                <p>
                                    容量制限により自動で解像度が下げられます。より高画質にしたい場合は容量制限を「5MB」または「制限なし」にしてください。
                                    ただし、ココフォリア側で圧縮が適用される可能性があるため、1MB未満を推奨します。
                                </p>
                            </div>
                        </details>

                        <details className="group border-b border-gray-200 dark:border-gray-700 pb-3">
                            <summary className="cursor-pointer font-semibold text-gray-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition list-none flex items-center gap-2">
                                <svg
                                    className="w-5 h-5 transition-transform group-open:rotate-90"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    aria-hidden="true"
                                    focusable="false"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                                Q. 透過部分が真っ白になる
                            </summary>
                            <div className="mt-3 ml-7 text-sm text-gray-600 dark:text-gray-300">
                                <p>
                                    元画像がPNG形式で透過情報を持っているか確認してください。JPG形式は透過に対応していません。
                                </p>
                            </div>
                        </details>

                        <details className="group border-b border-gray-200 dark:border-gray-700 pb-3">
                            <summary className="cursor-pointer font-semibold text-gray-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition list-none flex items-center gap-2">
                                <svg
                                    className="w-5 h-5 transition-transform group-open:rotate-90"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    aria-hidden="true"
                                    focusable="false"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                                Q. ループOFFのAPNGがココフォリアで再生されない
                            </summary>
                            <div className="mt-3 ml-7 text-sm text-gray-600 dark:text-gray-300 space-y-2">
                                <p>
                                    <strong>カットインの場合はループONが推奨</strong>されます。ループOFFの場合、再読み込みされないなど動作が不安定になることがあります。
                                </p>
                                <p>
                                    登場・退場効果を使う場合は、立ち絵やキャラクター設定では正常に動作しますが、カットインには向いていません。
                                    カットイン用には「ループ：ON」を選択して再生成してください。
                                </p>
                            </div>
                        </details>

                        <details className="group border-b border-gray-200 dark:border-gray-700 pb-3">
                            <summary className="cursor-pointer font-semibold text-gray-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition list-none flex items-center gap-2">
                                <svg
                                    className="w-5 h-5 transition-transform group-open:rotate-90"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    aria-hidden="true"
                                    focusable="false"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                                Q. スクリーンパネル・マーカーパネルでアニメーションが動かない
                            </summary>
                            <div className="mt-3 ml-7 text-sm text-gray-600 dark:text-gray-300 space-y-2">
                                <p><strong>パネル系は特に注意が必要</strong>です。以下を確認してください：</p>
                                <ul className="list-disc list-inside space-y-1 ml-4">
                                    <li>ファイルサイズが<strong>1MB未満</strong>であること</li>
                                    <li>動かない場合は、NOIMAGEを試してみてください（状況によっては効果的なワークアラウンドです）</li>
                                    <li>「容量制限：1MB以下」を選択して再生成してください</li>
                                </ul>
                            </div>
                        </details>

                        <details className="group border-b border-gray-200 dark:border-gray-700 pb-3">
                            <summary className="cursor-pointer font-semibold text-gray-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition list-none flex items-center gap-2">
                                <svg
                                    className="w-5 h-5 transition-transform group-open:rotate-90"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    aria-hidden="true"
                                    focusable="false"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                                Q. NOIMAGEは必須ですか？
                            </summary>
                            <div className="mt-3 ml-7 text-sm text-gray-600 dark:text-gray-300 space-y-2">
                                <p>
                                    <strong>必須ではありません</strong>が、状況によっては効果的なワークアラウンドです。
                                </p>
                                <p>以下のケースで試してみてください：</p>
                                <ul className="list-disc list-inside space-y-1 ml-4">
                                    <li>非ループ素材で再生されない場合</li>
                                    <li>再生トリガーがうまく働かない場合</li>
                                    <li>一度NOIMAGEを挟んでから設定すると起動するという報告があります</li>
                                </ul>
                            </div>
                        </details>

                        <details className="group border-b border-gray-200 dark:border-gray-700 pb-3">
                            <summary className="cursor-pointer font-semibold text-gray-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition list-none flex items-center gap-2">
                                <svg
                                    className="w-5 h-5 transition-transform group-open:rotate-90"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    aria-hidden="true"
                                    focusable="false"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                                Q. アップロード時に「圧縮しますか？」と聞かれた
                            </summary>
                            <div className="mt-3 ml-7 text-sm text-gray-600 dark:text-gray-300">
                                <p>
                                    <strong>必ず「いいえ」を選択</strong>してください。「はい」を選ぶとアニメーション情報が失われ、動かなくなります。
                                    この確認が出る場合は、ファイルサイズが1MBを超えている可能性があります。1MB未満で再生成することを推奨します。
                                </p>
                            </div>
                        </details>

                        <details className="group">
                            <summary className="cursor-pointer font-semibold text-gray-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition list-none flex items-center gap-2">
                                <svg
                                    className="w-5 h-5 transition-transform group-open:rotate-90"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    aria-hidden="true"
                                    focusable="false"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                                Q. 急にアニメーションが動かなくなった
                            </summary>
                            <div className="mt-3 ml-7 text-sm text-gray-600 dark:text-gray-300 space-y-2">
                                <p>ブラウザのキャッシュが原因の可能性があります。以下を試してください：</p>
                                <ul className="list-disc list-inside space-y-1 ml-4">
                                    <li>Ctrl+F5（またはCmd+Shift+R）で強制リロード</li>
                                    <li>ブラウザのキャッシュとCookieを削除</li>
                                    <li>一度ログアウトして再ログイン</li>
                                </ul>
                            </div>
                        </details>
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
