'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ChevronDown, ChevronUp, ArrowRight, ArrowDown, ArrowUp, ArrowLeftIcon } from 'lucide-react'
import { transitionEffects } from '../../constants/transitionEffects'

export default function EffectsPage() {
    const [expandedEffects, setExpandedEffects] = useState<Set<string>>(new Set())

    const toggleEffect = (effectName: string) => {
        setExpandedEffects(prev => {
            const newSet = new Set(prev)
            if (newSet.has(effectName)) {
                newSet.delete(effectName)
            } else {
                newSet.add(effectName)
            }
            return newSet
        })
    }

    const getCategoryColor = (category: string) => {
        if (category.includes('登場')) return 'blue'
        if (category.includes('退場')) return 'red'
        return 'purple'
    }

    const getCategoryBgClass = (color: string) => {
        switch (color) {
            case 'blue': return 'bg-blue-500'
            case 'red': return 'bg-red-500'
            case 'purple': return 'bg-purple-500'
            default: return 'bg-gray-500'
        }
    }

    const getCategoryBorderClass = (color: string) => {
        switch (color) {
            case 'blue': return 'border-blue-200 dark:border-blue-800'
            case 'red': return 'border-red-200 dark:border-red-800'
            case 'purple': return 'border-purple-200 dark:border-purple-800'
            default: return 'border-gray-200 dark:border-gray-700'
        }
    }

    const getDirectionIcon = (direction: string) => {
        switch (direction) {
            case 'up': return <ArrowUp className="w-3 h-3" />
            case 'down': return <ArrowDown className="w-3 h-3" />
            case 'left': return <ArrowLeftIcon className="w-3 h-3" />
            case 'right': return <ArrowRight className="w-3 h-3" />
            case 'vertical': return <span className="text-xs">↕</span>
            case 'horizontal': return <span className="text-xs">↔</span>
            case 'random': return <span className="text-xs">⟳</span>
            default: return null
        }
    }

    const getEffectDescription = (effectName: string): string => {
        const descriptions: Record<string, string> = {
            // 登場
            fadeIn: '透明な状態から徐々に現れるシンプルな効果',
            slideIn: '画面外から指定方向へスライドして登場',
            wipeIn: '指定方向から徐々に描画されて登場',
            zoomUp: '小さい/大きいサイズから通常サイズに変化しながら登場',
            doorClose: '左右から扉が閉まるように画像が現れる',
            tvStaticIn: 'アナログテレビのノイズから画像が浮かび上がる',
            glitchIn: 'デジタルノイズやズレを伴って登場',
            focusIn: 'ぼやけた状態からピントが合うように登場',
            sliceIn: '横スライスに分割されて交互に登場',
            blindIn: 'ブラインドカーテンのように登場',
            tileIn: 'タイル状に分割されてランダムに登場',
            pixelateIn: 'モザイク状態から徐々に鮮明になって登場',
            irisIn: '中央から円形/四角形/ダイヤ型に広がって登場',
            pageFlipIn: '本のページをめくるように登場',
            cardFlipIn: 'カードが回転しながら登場',
            // 退場
            fadeOut: '徐々に透明になって消える',
            slideOut: '指定方向へスライドして退場',
            wipeOut: '指定方向へ徐々に消去されて退場',
            zoomUpOut: '通常サイズから拡大/縮小しながらフェードアウト',
            doorOpen: '左右に扉が開くように画像が消える',
            tvStaticOut: '画像がノイズに埋もれて消える',
            glitchOut: 'デジタルノイズを伴って消える',
            focusOut: 'ピントがぼやけながら消える',
            sliceOut: 'スライス状に分割されて消える',
            blindOut: 'ブラインドカーテンのように消える',
            tileOut: 'タイル状に分割されてランダムに消える',
            pixelateOut: '徐々にモザイク化して消える',
            irisOut: '円形/四角形/ダイヤ型に縮小して消える',
            pageFlipOut: '本のページをめくるように消える',
            cardFlipOut: 'カードが回転しながら消える',
            swordSlashOut: '斜めの斬撃エフェクトで切り裂かれて消える',
            // 演出
            rotate: 'その場で回転し続けるループ演出',
            tvStatic: 'TVの砂嵐ノイズが重なるループ演出',
            enlarge: '周期的に拡大・縮小を繰り返すループ演出',
            minimize: '周期的に縮小・拡大を繰り返すループ演出',
            spiral: '回転しながら縮小するスパイラル演出',
            bounce: '上下に跳ねるバウンス演出',
            vibration: '指定方向に震える振動演出',
            glitch: 'デジタルノイズが断続的に発生するループ演出',
            rgbShift: 'RGB色がずれて重なる演出',
            pulsation: '脈打つように明滅する演出',
            scanlines: 'ブラウン管テレビ風の走査線演出',
            vignette: '画面端が暗くなるビネット演出',
            flash: '周期的に発光する閃光演出',
            concentrationLines: '中心に向かう集中線演出',
            cardFlipLoop: 'カードが連続して回転するループ演出',
            silhouette: '画像がシルエット化する演出',
        }
        return descriptions[effectName] || '効果の説明'
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800 py-8 px-4">
            <div className="max-w-6xl mx-auto">
                {/* ヘッダー */}
                <div className="mb-8">
                    <Link
                        href="/manual"
                        className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        マニュアルに戻る
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                        トランジション効果一覧
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 mt-2">
                        APNG Generatorで使用できるすべてのトランジション効果とオプションの説明
                    </p>
                </div>

                {/* 効果サマリー */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    {transitionEffects.map((category) => {
                        const color = getCategoryColor(category.category)
                        return (
                            <div
                                key={category.category}
                                className={`bg-white dark:bg-slate-800 rounded-lg p-4 border-l-4 ${color === 'blue' ? 'border-blue-500' : color === 'red' ? 'border-red-500' : 'border-purple-500'}`}
                            >
                                <h3 className="font-bold text-gray-800 dark:text-white">
                                    {category.category.split('（')[0]}
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {category.description}
                                </p>
                                <p className={`text-2xl font-bold mt-2 ${color === 'blue' ? 'text-blue-500' : color === 'red' ? 'text-red-500' : 'text-purple-500'}`}>
                                    {category.effects.length}種類
                                </p>
                            </div>
                        )
                    })}
                </div>

                {/* カテゴリ別効果一覧 */}
                {transitionEffects.map((category) => {
                    const color = getCategoryColor(category.category)
                    return (
                        <section key={category.category} className="mb-8">
                            <div className={`${getCategoryBgClass(color)} text-white px-4 py-3 rounded-t-lg`}>
                                <h2 className="text-xl font-bold">{category.category}</h2>
                                <p className="text-sm opacity-90">{category.description}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 p-2">
                                {category.effects.map((effect) => {
                                    const IconComponent = effect.icon
                                    const isExpanded = expandedEffects.has(effect.name)

                                    return (
                                        <div key={effect.name} className={`rounded-lg border ${getCategoryBorderClass(color)} hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors`}>
                                            <button
                                                onClick={() => toggleEffect(effect.name)}
                                                className="w-full px-3 py-2 flex items-center justify-between text-left"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-8 h-8 rounded-lg ${getCategoryBgClass(color)} bg-opacity-10 flex items-center justify-center flex-shrink-0`}>
                                                        <IconComponent className={`w-4 h-4 ${color === 'blue' ? 'text-blue-500' : color === 'red' ? 'text-red-500' : 'text-purple-500'}`} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h3 className="font-semibold text-gray-800 dark:text-white text-sm truncate">
                                                            {effect.label}
                                                        </h3>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                            {effect.name}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 flex-shrink-0">
                                                    {effect.hasDirection && (
                                                        <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded">
                                                            方向
                                                        </span>
                                                    )}
                                                    {effect.hasOptions && (
                                                        <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-1.5 py-0.5 rounded">
                                                            OP
                                                        </span>
                                                    )}
                                                    {isExpanded ? (
                                                        <ChevronUp className="w-4 h-4 text-gray-400" />
                                                    ) : (
                                                        <ChevronDown className="w-4 h-4 text-gray-400" />
                                                    )}
                                                </div>
                                            </button>

                                            {isExpanded && (
                                                <div className="px-3 pb-3">
                                                    <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-3">
                                                        <p className="text-xs text-gray-600 dark:text-gray-300 mb-2">
                                                            {getEffectDescription(effect.name)}
                                                        </p>

                                                        {/* 方向選択 */}
                                                        {effect.hasDirection && effect.directions && (
                                                            <div className="mb-2">
                                                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">
                                                                    方向:
                                                                </span>
                                                                <div className="flex gap-1 flex-wrap">
                                                                    {effect.directions.map(dir => (
                                                                        <span
                                                                            key={dir}
                                                                            className="inline-flex items-center gap-0.5 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-1.5 py-0.5 rounded"
                                                                        >
                                                                            {getDirectionIcon(dir)}
                                                                            {dir === 'up' ? '上' : dir === 'down' ? '下' : dir === 'left' ? '左' : dir === 'right' ? '右' : dir === 'vertical' ? '縦' : dir === 'horizontal' ? '横' : 'ランダム'}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* オプション */}
                                                        {effect.hasOptions && effect.options && (
                                                            <div className="mb-2">
                                                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">
                                                                    {effect.optionType === 'size' ? 'サイズ' :
                                                                        effect.optionType === 'intensity' ? '強度' :
                                                                            effect.optionType === 'count' ? '分割数' :
                                                                                effect.optionType === 'shape' ? '形状' :
                                                                                    effect.optionType === 'direction' ? '方向' :
                                                                                        effect.optionType === 'transparency' ? '透明度' :
                                                                                            effect.optionType === 'speed' ? '速度' :
                                                                                                effect.optionType === 'color' ? '色' : 'オプション'}:
                                                                </span>
                                                                <div className="flex gap-1 flex-wrap">
                                                                    {effect.options.map(opt => (
                                                                        <span
                                                                            key={opt.value}
                                                                            className="text-xs px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300"
                                                                        >
                                                                            {opt.label}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* 強度オプション（2段階） */}
                                                        {effect.hasIntensity && effect.intensityOptions && (
                                                            <div>
                                                                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 block mb-1">
                                                                    強度:
                                                                </span>
                                                                <div className="flex gap-1 flex-wrap">
                                                                    {effect.intensityOptions.map(opt => (
                                                                        <span
                                                                            key={opt.value}
                                                                            className="text-xs px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300"
                                                                        >
                                                                            {opt.label}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </section>
                    )
                })}

                {/* フッター */}
                <div className="text-center mt-8 space-y-2">
                    <div className="flex justify-center gap-4">
                        <Link href="/manual" className="text-blue-600 hover:underline">
                            ← マニュアルに戻る
                        </Link>
                        <Link href="/" className="text-blue-600 hover:underline">
                            ツールを開く →
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}
