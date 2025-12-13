// components/TransitionEffectsSelector.tsx
// タブ切り替え式 3カテゴリ表示 + 効果オプションセクション

'use client'

import React, { useState, useEffect } from 'react'
import { transitionEffects, findEffectByName } from '../constants/transitionEffects'
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, MoveVertical, MoveHorizontal, LogIn, LogOut, Sparkles, Shuffle, ChevronDown } from 'lucide-react'

interface Props {
    transition: string
    setTransition: (t: string) => void
    effectDirection: string
    setEffectDirection: (d: string) => void
    onDirectionChange?: () => void
}

// タブのアイコンと短いラベル
const tabConfig = [
    { index: 0, label: '登場', icon: LogIn },
    { index: 1, label: '退場', icon: LogOut },
    { index: 2, label: '演出', icon: Sparkles },
]

export const TransitionEffectsSelector: React.FC<Props> = ({
    transition,
    setTransition,
    effectDirection,
    setEffectDirection,
    onDirectionChange,
}) => {
    const [activeTab, setActiveTab] = useState(0)
    const selectedEffect = findEffectByName(transition)

    // 現在選択中の効果がどのタブにあるか確認
    const findTabForEffect = (effectName: string) => {
        for (let i = 0; i < transitionEffects.length; i++) {
            if (transitionEffects[i].effects.some(e => e.name === effectName)) {
                return i
            }
        }
        return 0
    }

    // 効果選択時にタブも切り替え
    const handleEffectSelect = (effectName: string) => {
        setTransition(effectName)
        setActiveTab(findTabForEffect(effectName))
        // オプションありの効果ならアニメーショントリガー（毎回リセット）
        const effect = findEffectByName(effectName)
        if (effect?.hasDirection && effect.directions) {
            // 一度非表示にしてから再表示でアニメーションを毎回発火
            setLineVisible(false)
            setTimeout(() => setLineVisible(true), 100)
        } else {
            setLineVisible(false)
        }
    }

    // ラインの表示状態
    const [lineVisible, setLineVisible] = useState(false)

    const currentCategory = transitionEffects[activeTab]

    // 方向オプションがあるかチェック
    const hasDirectionOption = selectedEffect?.hasDirection && selectedEffect.directions
    const is4Direction = hasDirectionOption && selectedEffect.directions?.includes('up')
    const is3Direction = hasDirectionOption && selectedEffect.directions?.includes('random')  // 縦/横/ランダム
    const is2Direction = hasDirectionOption && selectedEffect.directions?.includes('vertical') && !is3Direction

    return (
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
            {/* タブヘッダー */}
            <div className="flex border-b border-gray-200">
                {tabConfig.map((tab) => {
                    const TabIcon = tab.icon
                    const isActive = activeTab === tab.index
                    return (
                        <button
                            key={tab.index}
                            onClick={() => setActiveTab(tab.index)}
                            className={`
                                flex-1 flex items-center justify-center gap-2 py-3 px-4
                                font-medium text-sm transition-all duration-200
                                ${isActive
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                }
                            `}
                        >
                            <TabIcon className="w-4 h-4" />
                            <span>{tab.label}</span>
                        </button>
                    )
                })}
            </div>

            {/* 効果グリッド */}
            <div className="p-4">
                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-2">
                    {currentCategory.effects.map((effect) => {
                        const Icon = effect.icon
                        const isSelected = transition === effect.name
                        const hasOptions = effect.hasDirection && effect.directions

                        return (
                            <button
                                key={effect.name}
                                onClick={() => handleEffectSelect(effect.name)}
                                className={`
                                    relative flex flex-col items-center justify-center p-2 rounded-lg
                                    transition-all duration-200 min-h-[60px] overflow-hidden
                                    ${isSelected
                                        ? 'bg-blue-500 text-white ring-2 ring-blue-300 shadow-md'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }
                                `}
                            >
                                <Icon className="w-5 h-5 mb-1" />
                                <span className="text-[10px] text-center leading-tight">
                                    {effect.label}
                                </span>
                                {/* オプションありインジケーター：右端に下矢印、底辺にライン */}
                                {hasOptions && (
                                    <>
                                        <ChevronDown className={`absolute bottom-0.5 right-0.5 w-3 h-3 ${isSelected ? 'text-blue-200' : 'text-blue-400'}`} />
                                        <div
                                            className={`absolute bottom-0 left-0 right-0 h-0.5 ${isSelected ? 'bg-blue-200' : 'bg-blue-400'} ${isSelected ? 'animate-pulse' : ''}`}
                                        />
                                    </>
                                )}
                            </button>
                        )
                    })}
                </div>
            </div>

            {/* 効果オプションセクション（常に表示） */}
            <hr className="border-gray-200" />
            <div className="p-4 bg-blue-50">
                <h4 className="text-sm font-medium text-gray-700 mb-3 relative inline-block">
                    効果オプション
                    {/* アニメーションライン：選択時に毎回アニメーション */}
                    <span
                        className={`absolute bottom-0 left-0 h-0.5 bg-blue-500 transition-all duration-500 ease-out ${lineVisible ? 'w-full' : 'w-0'}`}
                    />
                </h4>

                {/* 4方向選択（上下左右） */}
                {is4Direction && (
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 mr-2">方向:</span>
                        <div className="flex gap-2">
                            {(['left', 'up', 'down', 'right'] as const).map((dir) => (
                                <button
                                    key={dir}
                                    onClick={() => {
                                        setEffectDirection(dir)
                                        onDirectionChange?.()
                                    }}
                                    className={`
                                        p-3 rounded-lg flex items-center justify-center
                                        transition-all duration-200
                                        ${effectDirection === dir
                                            ? 'bg-blue-500 text-white shadow-md'
                                            : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                                        }
                                    `}
                                    title={dir === 'up' ? '上' : dir === 'down' ? '下' : dir === 'left' ? '左' : '右'}
                                >
                                    {dir === 'up' && <ArrowUp className="w-5 h-5" />}
                                    {dir === 'down' && <ArrowDown className="w-5 h-5" />}
                                    {dir === 'left' && <ArrowLeft className="w-5 h-5" />}
                                    {dir === 'right' && <ArrowRight className="w-5 h-5" />}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* 3方向選択（縦/横/ランダム） */}
                {is3Direction && (
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 mr-2">方向:</span>
                        <div className="flex gap-2">
                            {(['vertical', 'horizontal', 'random'] as const).map((dir) => (
                                <button
                                    key={dir}
                                    onClick={() => {
                                        setEffectDirection(dir)
                                        onDirectionChange?.()
                                    }}
                                    className={`
                                        px-4 py-2 rounded-lg flex items-center justify-center gap-2
                                        transition-all duration-200
                                        ${effectDirection === dir
                                            ? 'bg-blue-500 text-white shadow-md'
                                            : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                                        }
                                    `}
                                    title={dir === 'vertical' ? '縦' : dir === 'horizontal' ? '横' : 'ランダム'}
                                >
                                    {dir === 'vertical' && <MoveVertical className="w-5 h-5" />}
                                    {dir === 'horizontal' && <MoveHorizontal className="w-5 h-5" />}
                                    {dir === 'random' && <Shuffle className="w-5 h-5" />}
                                    <span className="text-sm">{dir === 'vertical' ? '縦' : dir === 'horizontal' ? '横' : 'ランダム'}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* 2方向選択（縦/横のみ） */}
                {is2Direction && (
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 mr-2">方向:</span>
                        <div className="flex gap-2">
                            {(['vertical', 'horizontal'] as const).map((dir) => (
                                <button
                                    key={dir}
                                    onClick={() => {
                                        setEffectDirection(dir)
                                        onDirectionChange?.()
                                    }}
                                    className={`
                                        px-4 py-2 rounded-lg flex items-center justify-center gap-2
                                        transition-all duration-200
                                        ${effectDirection === dir
                                            ? 'bg-blue-500 text-white shadow-md'
                                            : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                                        }
                                    `}
                                    title={dir === 'vertical' ? '縦' : '横'}
                                >
                                    {dir === 'vertical' && <MoveVertical className="w-5 h-5" />}
                                    {dir === 'horizontal' && <MoveHorizontal className="w-5 h-5" />}
                                    <span className="text-sm">{dir === 'vertical' ? '縦' : '横'}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* オプションなしの場合 */}
                {!hasDirectionOption && (
                    <p className="text-sm text-gray-500">この効果にはオプションがありません</p>
                )}
            </div>
        </div>
    )
}

export default TransitionEffectsSelector
