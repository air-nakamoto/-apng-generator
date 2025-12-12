// components/TransitionEffectsSelector.tsx
// 3カテゴリ表示 + 方向選択UI

'use client'

import React from 'react'
import { transitionEffects, findEffectByName } from '../constants/transitionEffects'
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, MoveVertical, MoveHorizontal } from 'lucide-react'

interface Props {
    transition: string
    setTransition: (t: string) => void
    effectDirection: string
    setEffectDirection: (d: string) => void
}

export const TransitionEffectsSelector: React.FC<Props> = ({
    transition,
    setTransition,
    effectDirection,
    setEffectDirection,
}) => {
    const selectedEffect = findEffectByName(transition)

    return (
        <div className="bg-white rounded-lg p-4 shadow-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">トランジション効果</h3>

            {transitionEffects.map((category) => (
                <div key={category.category} className="mb-6 last:mb-0">
                    {/* カテゴリヘッダー */}
                    <h4 className="text-sm font-medium text-gray-500 mb-3 border-b border-gray-200 pb-2">
                        {category.category}
                    </h4>

                    {/* 効果グリッド */}
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                        {category.effects.map((effect) => {
                            const Icon = effect.icon
                            const isSelected = transition === effect.name

                            return (
                                <div key={effect.name} className="flex flex-col gap-1">
                                    <button
                                        onClick={() => setTransition(effect.name)}
                                        className={`
                      flex flex-col items-center justify-center p-3 rounded-lg
                      transition-all duration-200 min-h-[70px]
                      ${isSelected
                                                ? 'bg-blue-500 text-white ring-2 ring-blue-300 shadow-md'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }
                    `}
                                    >
                                        <Icon className="w-5 h-5 mb-1" />
                                        <span className="text-xs text-center leading-tight">
                                            {effect.label}
                                        </span>
                                    </button>

                                    {/* 方向選択UI（4方向） */}
                                    {effect.hasDirection && isSelected && effect.directions?.includes('up') && (
                                        <div className="grid grid-cols-4 gap-1 mt-1">
                                            {(['up', 'down', 'left', 'right'] as const).map((dir) => (
                                                <button
                                                    key={dir}
                                                    onClick={() => setEffectDirection(dir)}
                                                    className={`
                            p-1.5 rounded text-xs flex items-center justify-center
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
                                        <div className="grid grid-cols-2 gap-1 mt-1">
                                            {(['vertical', 'horizontal'] as const).map((dir) => (
                                                <button
                                                    key={dir}
                                                    onClick={() => setEffectDirection(dir)}
                                                    className={`
                            p-1.5 rounded text-xs flex items-center justify-center
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
            ))}
        </div>
    )
}

export default TransitionEffectsSelector
