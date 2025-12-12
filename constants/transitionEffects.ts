// constants/transitionEffects.ts
// APNG Generator V114 - 45種のトランジション効果定義

import {
    // 登場効果用
    CircleFadingPlus,
    MoveRight,
    PanelLeftOpen,
    ZoomIn,
    DoorClosed,
    Tv,
    ZapOff,
    Focus,
    SplitSquareHorizontal,
    Sparkles,
    Grid3X3,
    Puzzle,
    CircleDot,
    BookOpen,

    // 退場効果用
    MoveLeft,
    PanelRightOpen,
    ZoomOut,
    DoorOpen,
    Zap,
    Flame,

    // 演出効果用
    RotateCw,
    Cloud,
    Maximize2,
    Minimize2,
    Clapperboard,
    RotateCcw,
    Fingerprint,
    ArrowUpDown,
    Vibrate,
    Palette,
    Scan,
    Circle,
    Activity,
    Rainbow,
    Sun,
} from 'lucide-react'

// 型定義
export interface TransitionEffect {
    name: string
    label: string
    icon: React.ComponentType<{ className?: string }>
    hasDirection: boolean
    directions?: ('up' | 'down' | 'left' | 'right' | 'vertical' | 'horizontal')[]
}

export interface EffectCategory {
    category: string
    effects: TransitionEffect[]
}

// 45種の効果を3カテゴリに分類
export const transitionEffects: EffectCategory[] = [
    {
        category: '登場（Entrance）',
        effects: [
            // 既存効果
            { name: 'fadeIn', label: 'フェードイン', icon: CircleFadingPlus, hasDirection: false },
            { name: 'slideIn', label: 'スライドイン', icon: MoveRight, hasDirection: true, directions: ['up', 'down', 'left', 'right'] },
            { name: 'wipeIn', label: 'ワイプイン', icon: PanelLeftOpen, hasDirection: true, directions: ['up', 'down', 'left', 'right'] },
            { name: 'zoomIn', label: 'ズームイン', icon: ZoomIn, hasDirection: false },
            // 新規効果
            { name: 'doorClose', label: '閉扉', icon: DoorClosed, hasDirection: false },
            { name: 'tvStaticIn', label: '砂嵐イン', icon: Tv, hasDirection: false },
            { name: 'glitchIn', label: 'グリッチイン', icon: ZapOff, hasDirection: false },
            { name: 'focusIn', label: 'フォーカスイン', icon: Focus, hasDirection: false },
            { name: 'sliceIn', label: 'スライスイン', icon: SplitSquareHorizontal, hasDirection: false },
            { name: 'lightLeakIn', label: 'ライトリークイン', icon: Sparkles, hasDirection: false },
            { name: 'tileIn', label: 'タイルイン', icon: Grid3X3, hasDirection: false },
            { name: 'pixelateIn', label: 'ピクセレートイン', icon: Puzzle, hasDirection: false },
            { name: 'irisIn', label: 'アイリスイン', icon: CircleDot, hasDirection: false },
            { name: 'pageFlipIn', label: '本めくりイン', icon: BookOpen, hasDirection: false },
        ],
    },
    {
        category: '退場（Exit）',
        effects: [
            // 既存効果
            { name: 'fadeOut', label: 'フェードアウト', icon: CircleFadingPlus, hasDirection: false },
            { name: 'slideOut', label: 'スライドアウト', icon: MoveLeft, hasDirection: true, directions: ['up', 'down', 'left', 'right'] },
            { name: 'wipeOut', label: 'ワイプアウト', icon: PanelRightOpen, hasDirection: true, directions: ['up', 'down', 'left', 'right'] },
            { name: 'zoomOut', label: 'ズームアウト', icon: ZoomOut, hasDirection: false },
            { name: 'doorOpen', label: '開扉', icon: DoorOpen, hasDirection: false },
            // 新規効果
            { name: 'tvStaticOut', label: '砂嵐アウト', icon: Tv, hasDirection: false },
            { name: 'glitchOut', label: 'グリッチアウト', icon: Zap, hasDirection: false },
            { name: 'focusOut', label: 'フォーカスアウト', icon: Focus, hasDirection: false },
            { name: 'sliceOut', label: 'スライスアウト', icon: SplitSquareHorizontal, hasDirection: false },
            { name: 'filmBurn', label: 'フィルムバーン', icon: Flame, hasDirection: false },
            { name: 'tileOut', label: 'タイルアウト', icon: Grid3X3, hasDirection: false },
            { name: 'pixelateOut', label: 'ピクセレートアウト', icon: Puzzle, hasDirection: false },
            { name: 'irisOut', label: 'アイリスアウト', icon: CircleDot, hasDirection: false },
            { name: 'pageFlipOut', label: '本めくりアウト', icon: BookOpen, hasDirection: false },
        ],
    },
    {
        category: '演出（Effects）',
        effects: [
            // 既存効果
            { name: 'rotate', label: '回転', icon: RotateCw, hasDirection: false },
            { name: 'blur', label: 'ブラー', icon: Cloud, hasDirection: false },
            { name: 'tvStatic', label: 'TV砂嵐', icon: Tv, hasDirection: false },
            { name: 'enlarge', label: '巨大化', icon: Maximize2, hasDirection: false },
            { name: 'minimize', label: '最小化', icon: Minimize2, hasDirection: false },
            { name: 'curtain', label: 'カーテン', icon: Clapperboard, hasDirection: false },
            { name: 'spiral', label: 'スパイラル', icon: RotateCcw, hasDirection: false },
            { name: 'fingerprint', label: '指紋', icon: Fingerprint, hasDirection: false },
            { name: 'bounce', label: 'バウンス', icon: ArrowUpDown, hasDirection: false },
            { name: 'vibration', label: '振動', icon: Vibrate, hasDirection: true, directions: ['vertical', 'horizontal'] },
            { name: 'glitch', label: 'グリッジ', icon: Zap, hasDirection: false },
            // 新規効果
            { name: 'rgbShift', label: 'RGBずれ', icon: Palette, hasDirection: false },
            { name: 'scanlines', label: '走査線', icon: Scan, hasDirection: false },
            { name: 'vignette', label: 'ビネット', icon: Circle, hasDirection: false },
            { name: 'jitter', label: 'ジッター', icon: Activity, hasDirection: false },
            { name: 'chromaticAberration', label: '色収差', icon: Rainbow, hasDirection: false },
            { name: 'flash', label: '閃光', icon: Sun, hasDirection: false },
        ],
    },
]

// フラット化した効果リストを取得（互換性用）
export const getAllEffects = (): TransitionEffect[] => {
    return transitionEffects.flatMap(category => category.effects)
}

// 効果名から効果を検索
export const findEffectByName = (name: string): TransitionEffect | undefined => {
    return getAllEffects().find(effect => effect.name === name)
}

// 効果名からカテゴリを検索
export const findCategoryByEffectName = (name: string): string | undefined => {
    for (const category of transitionEffects) {
        if (category.effects.some(effect => effect.name === name)) {
            return category.category
        }
    }
    return undefined
}
