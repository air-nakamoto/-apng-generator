'use client'

import Link from 'next/link'
import { ArrowLeft, Upload, MousePointer, Download, AlertTriangle, CheckCircle, Zap, Image, Settings, HelpCircle, ExternalLink } from 'lucide-react'

export default function ManualPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* ヘッダー */}
                <div className="mb-8">
                    <Link
                        href="/"
                        className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        ツールに戻る
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                        APNG Generator 使い方ガイド
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300">
                        ココフォリアで使えるアニメーション立ち絵・エフェクトの作り方
                    </p>
                </div>

                {/* 目次 */}
                <nav className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 mb-6">
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
                        <Zap className="w-5 h-5 mr-2 text-yellow-500" />
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
                            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600 dark:text-gray-300">
                                <li>画面左側の<strong>「画像選択＆プレビュー」</strong>パネルに、PNG/JPG画像をドラッグ＆ドロップ（またはクリックして選択）</li>
                                <li>アップロードされると、プレビューキャンバスに画像が表示されます</li>
                                <li>透過PNG画像を使用すると、背景が透明なAPNGが生成できます</li>
                            </ol>
                        </div>
                        <div className="p-2 bg-gray-50 dark:bg-slate-700 border-t border-gray-200 dark:border-gray-600">
                            <img
                                src="/manual/step1_upload.png"
                                alt="ステップ1: 画像選択画面"
                                className="w-full rounded border border-gray-200 dark:border-gray-600"
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
                            <ol className="list-decimal list-inside space-y-3 text-sm text-gray-600 dark:text-gray-300 mb-3">
                                <li>画面右側の<strong>「トランジション効果」</strong>パネルで、タブから効果カテゴリを選択：
                                    <div className="ml-6 mt-2 space-y-2">
                                        <div className="bg-blue-50 dark:bg-blue-900/30 border-l-4 border-blue-500 p-2 rounded">
                                            <span className="font-bold text-blue-700 dark:text-blue-300">登場</span>：画像が現れるアニメーション（フェードイン、スライドインなど）
                                        </div>
                                        <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-2 rounded">
                                            <span className="font-bold text-red-700 dark:text-red-300">退場</span>：画像が消えるアニメーション（フェードアウト、斬撃など）
                                        </div>
                                        <div className="bg-purple-50 dark:bg-purple-900/30 border-l-4 border-purple-500 p-2 rounded">
                                            <span className="font-bold text-purple-700 dark:text-purple-300">演出</span>：ループするエフェクト（振動、グリッチなど）
                                        </div>
                                    </div>
                                </li>
                                <li>効果ボタンをクリックして選択すると、プレビューが自動で再生されます（「プレビュー」ボタンを押しても再生できます）</li>
                                <li><strong>「効果オプション」</strong>で方向や強度を調整できます</li>
                                <li><strong>「共通設定」</strong>で以下を設定：
                                    <ul className="ml-6 mt-1 space-y-1 list-disc">
                                        <li><strong>ループ</strong>：ON=繰り返し再生 / OFF=1回のみ再生</li>
                                        <li><strong>容量制限</strong>：用途に合わせて1MB/5MB/制限なしを選択</li>
                                        <li><strong>FPS</strong>：フレームレート（20-30推奨）</li>
                                        <li><strong>再生速度</strong>：アニメーションの速さ</li>
                                    </ul>
                                </li>
                            </ol>
                        </div>
                        <div className="p-2 bg-gray-50 dark:bg-slate-700 border-t border-gray-200 dark:border-gray-600">
                            <img
                                src="/manual/step2_effects.png"
                                alt="ステップ2: 効果選択画面"
                                className="w-full rounded border border-gray-200 dark:border-gray-600"
                            />
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
                                <li>ダウンロードしたファイルをココフォリアにアップロードして使用</li>
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
                            />
                        </div>
                    </div>
                </section>

                {/* ココフォリア設定ガイド */}
                <section id="cocofolia" className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 mb-6">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
                        <Settings className="w-5 h-5 mr-2 text-green-500" />
                        ココフォリアでの使い方
                    </h2>

                    <div className="space-y-4">
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                            <div className="flex items-start">
                                <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h4 className="font-semibold text-yellow-800 dark:text-yellow-200">重要：ファイルサイズ制限（有料・無料共通）</h4>
                                    <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-3">
                                        用途によってファイルサイズの上限が異なります。超過するとアニメーションが再生されません。
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
                                <p className="text-xs text-gray-500 dark:text-gray-400">容量制限: 5MB以下 / ループ: 用途による</p>
                            </div>
                            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600 dark:text-gray-300">
                                <li>ココフォリアでキャラクターを選択</li>
                                <li>「キャラクター」タブを開く</li>
                                <li>生成したAPNGファイルをドラッグ&ドロップ</li>
                                <li>立ち絵がアニメーションで表示されます</li>
                            </ol>
                        </div>

                        <div>
                            <h3 className="font-semibold text-gray-800 dark:text-white mb-2">カットインとして使う場合</h3>
                            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-2">
                                <p className="text-sm text-blue-700 dark:text-blue-300">
                                    ⚠️ カットインには<strong>ループON必須</strong>です。ループOFFのAPNGはアニメーションが再生されません。
                                </p>
                            </div>
                            <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-3 mb-2">
                                <p className="text-xs text-gray-500 dark:text-gray-400">容量制限: 5MB以下 / ループ: ON必須</p>
                            </div>
                            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600 dark:text-gray-300">
                                <li>ココフォリアでキャラクターを選択</li>
                                <li>「カットイン」タブを開く</li>
                                <li>生成したAPNGファイルを設定</li>
                            </ol>
                        </div>

                        <div>
                            <h3 className="font-semibold text-gray-800 dark:text-white mb-2">前景・背景として使う場合</h3>
                            <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-3 mb-2">
                                <p className="text-xs text-gray-500 dark:text-gray-400">容量制限: 5MB以下 / ループ: 用途による</p>
                            </div>
                            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600 dark:text-gray-300">
                                <li>ココフォリアのルーム画面右側にある「前景/背景」タブを開く</li>
                                <li>「前景」または「背景」の「+」ボタンをクリック</li>
                                <li>生成したAPNGファイルをドラッグ&ドロップまたは選択</li>
                                <li>ルーム全体にアニメーション演出が適用されます</li>
                            </ol>
                        </div>

                        <div>
                            <h3 className="font-semibold text-gray-800 dark:text-white mb-2">スクリーンパネルとして使う場合</h3>
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-2">
                                <p className="text-sm text-red-700 dark:text-red-300">
                                    ⚠️ スクリーンパネルは<strong>1MB以下</strong>でないとアニメーションが再生されません。
                                </p>
                            </div>
                            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600 dark:text-gray-300">
                                <li>画面左上の「≡」メニュー →「スクリーンパネル」を選択</li>
                                <li>「+」ボタンで新規パネルを作成</li>
                                <li>「画像」欄にAPNGファイルをドラッグ&ドロップ</li>
                                <li>位置・サイズを調整して配置</li>
                            </ol>
                        </div>

                        <div>
                            <h3 className="font-semibold text-gray-800 dark:text-white mb-2">マーカーパネルとして使う場合</h3>
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-2">
                                <p className="text-sm text-red-700 dark:text-red-300">
                                    ⚠️ マーカーパネルは<strong>1MB以下</strong>でないとアニメーションが再生されません。
                                </p>
                            </div>
                            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600 dark:text-gray-300">
                                <li>画面左上の「≡」メニュー →「マーカーパネル」を選択</li>
                                <li>「+」ボタンで新規マーカーを作成</li>
                                <li>「画像」欄にAPNGファイルをドラッグ&ドロップ</li>
                                <li>マップ上の任意の場所に配置</li>
                            </ol>
                        </div>
                    </div>
                </section>

                {/* 推奨設定 */}
                <section id="settings" className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 mb-6">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center">
                        <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
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
                                    <td className="py-2 px-3 text-gray-600 dark:text-gray-400">高画質で使用可能</td>
                                </tr>
                                <tr className="border-b dark:border-gray-700">
                                    <td className="py-2 px-3 font-medium">容量制限<br /><span className="text-xs text-gray-500">(スクリーン/マーカー)</span></td>
                                    <td className="py-2 px-3"><span className="bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 px-2 py-0.5 rounded">1MB以下</span></td>
                                    <td className="py-2 px-3 text-gray-600 dark:text-gray-400">パネル系は制限が厳しい</td>
                                </tr>
                                <tr className="border-b dark:border-gray-700">
                                    <td className="py-2 px-3 font-medium">ループ</td>
                                    <td className="py-2 px-3"><span className="bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded">用途による</span></td>
                                    <td className="py-2 px-3 text-gray-600 dark:text-gray-400">カットイン→ON / 登場退場→OFF</td>
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
                        <HelpCircle className="w-5 h-5 mr-2 text-blue-500" />
                        よくある質問
                    </h2>

                    <div className="space-y-4">
                        <div>
                            <h3 className="font-semibold text-gray-800 dark:text-white mb-1">
                                Q. アニメーションが動かない
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300 pl-4">
                                ファイルサイズ制限を超えている可能性があります。<br />
                                ・立ち絵/前景/背景 → 5MB以下で設定<br />
                                ・スクリーン/マーカーパネル → 1MB以下で設定<br />
                                用途に合った容量制限を選択して再生成してください。
                            </p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-800 dark:text-white mb-1">
                                Q. 画質が悪い
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300 pl-4">
                                容量制限により自動で解像度が下げられます。より高画質にしたい場合は容量制限を「5MB」または「制限なし」にしてください。
                            </p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-800 dark:text-white mb-1">
                                Q. 透過部分が真っ白になる
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300 pl-4">
                                元画像がPNG形式で透過情報を持っているか確認してください。JPG形式は透過に対応していません。
                            </p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-800 dark:text-white mb-1">
                                Q. ループOFFのAPNGがココフォリアで再生されない
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300 pl-4">
                                <strong>A. カットインの場合はループONが必須</strong>です。ループOFFのAPNGはカットインでは再生されません。<br />
                                登場・退場効果を使う場合は、立ち絵やキャラクター設定では正常に動作しますが、カットインには向いていません。<br />
                                カットイン用には必ず「ループ：ON」を選択して再生成してください。
                            </p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-800 dark:text-white mb-1">
                                Q. スクリーンパネル・マーカーパネルでアニメーションが動かない
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300 pl-4">
                                <strong>A. パネル系は特別な設定が必要</strong>です。以下を確認してください：<br />
                                1. ファイルサイズが<strong>1MB以下</strong>であること（超えると再生されません）<br />
                                2. パネル設定で、APNGファイルを設定する<strong>前</strong>に「NOIMAGE」を設定する必要があります<br />
                                3. 「容量制限：1MB以下」を選択して再生成してください
                            </p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-800 dark:text-white mb-1">
                                Q. アップロード時に「圧縮しますか？」と聞かれた
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300 pl-4">
                                <strong>必ず「いいえ」を選択</strong>してください。「はい」を選ぶとアニメーション情報が失われ、動かなくなります。
                            </p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-800 dark:text-white mb-1">
                                Q. 急にアニメーションが動かなくなった
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-300 pl-4">
                                ブラウザのキャッシュが原因の可能性があります。以下を試してください：<br />
                                ・Ctrl+F5（またはCmd+Shift+R）で強制リロード<br />
                                ・ブラウザのキャッシュとCookieを削除<br />
                                ・一度ログアウトして再ログイン
                            </p>
                        </div>
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
                            <ExternalLink className="w-3 h-3 ml-1" />
                        </a>
                        <a
                            href="https://minify.ccfolia.com/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                            ココフォリア画像圧縮ツール
                            <ExternalLink className="w-3 h-3 ml-1" />
                        </a>
                        <a
                            href="https://blink-animation-tool.vercel.app/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                            瞬きアニメーション作成ツール
                            <ExternalLink className="w-3 h-3 ml-1" />
                        </a>
                    </div>
                </section>

                {/* フッター */}
                <div className="text-center mt-8 text-sm text-gray-500">
                    <Link href="/" className="text-blue-600 hover:underline">
                        ← APNG Generator に戻る
                    </Link>
                </div>
            </div>
        </div>
    )
}
