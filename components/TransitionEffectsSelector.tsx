// components/TransitionEffectsSelector.tsx
// タブ切り替え式 3カテゴリ表示 + 方向選択UI

'use client'

import React, { useState } from 'react'
import { transitionEffects, findEffectByName } from '../constants/transitionEffects'
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, MoveVertical, MoveHorizontal, LogIn, LogOut, Sparkles } from 'lucide-react'

interface Props {
    transition: string
    setTransition: (t: string) => void
    effectDirection: string
    setEffectDirection: (d: string) => void
    onDirectionChange?: () => void  // 方向変更時にプレビューを開始するコールバック
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

    // 現在選択中の効果がどのタブにあるか確認し、そのタブをアクティブにする
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
    }

    const currentCategory = transitionEffects[activeTab]

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

                        return (
                            <div key={effect.name} className="flex flex-col gap-1">
                                <button
                                    onClick={() => handleEffectSelect(effect.name)}
                                    className={`
                                        flex flex-col items-center justify-center p-2 rounded-lg
                                        transition-all duration-200 min-h-[60px]
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
                                </button>

                                {/* 方向選択UI（4方向） */}
                                {effect.hasDirection && isSelected && effect.directions?.includes('up') && (
                                    <div className="grid grid-cols-4 gap-0.5 mt-1">
                                        {(['up', 'down', 'left', 'right'] as const).map((dir) => (
                                            <button
                                                key={dir}
                                                onClick={() => {
                                                    setEffectDirection(dir)
                                                    onDirectionChange?.()
                                                }}
                                                className={`
                                                    p-1 rounded text-xs flex items-center justify-center
                                                    ${effectDirection === dir
                                                        ? 'bg-blue-500 text-white'
                                                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                                    }
                                                `}
                                                title={dir === 'up' ? '上' : dir === 'down' ? '下' : dir === 'left' ? '左' : '右'}
                                            >
                                                {dir === 'up' && <ArrowUp className="w-3 h-3" />}
                                                {dir === 'down' && <ArrowDown className="w-3 h-3" />}
                                                {dir === 'left' && <ArrowLeft className="w-3 h-3" />}
                                                {dir === 'right' && <ArrowRight className="w-3 h-3" />}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {/* 方向選択UI（縦/横） */}
                                {effect.hasDirection && isSelected && effect.directions?.includes('vertical') && (
                                    <div className="grid grid-cols-2 gap-0.5 mt-1">
                                        {(['vertical', 'horizontal'] as const).map((dir) => (
                                            <button
                                                key={dir}
                                                onClick={() => {
                                                    setEffectDirection(dir)
                                                    onDirectionChange?.()
                                                }}
                                                className={`
                                                    p-1 rounded text-xs flex items-center justify-center
                                                    ${effectDirection === dir
                                                        ? 'bg-blue-500 text-white'
                                                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                                    }
                                                `}
                                                title={dir === 'vertical' ? '縦' : '横'}
                                            >
                                                {dir === 'vertical' && <MoveVertical className="w-3 h-3" />}
                                                {dir === 'horizontal' && <MoveHorizontal className="w-3 h-3" />}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

export default TransitionEffectsSelector
