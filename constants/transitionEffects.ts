// constants/transitionEffects.ts
// APNG Generator V118 - エフェクト定義（オプション対応版）

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
    Grid3X3,
    Puzzle,
    CircleDot,
    BookOpen,
    Blinds,

    // 退場効果用
    MoveLeft,
    PanelRightOpen,
    ZoomOut,
    DoorOpen,
    Zap,
    Scissors,  // 斬撃用

    // 演出効果用
    RotateCw,
    Cloud,
    Maximize2,
    Minimize2,
    RotateCcw,
    ArrowUpDown,
    Vibrate,
    Palette,
    Scan,
    Circle,
    Sun,
    RefreshCw,
    Crosshair,  // 集中線用
    Activity,   // 脈動用
    UserRound,  // シルエット用
} from 'lucide-react'

// オプション定義
export interface EffectOption {
    value: string
    label: string
    numericValue: number
}

// 型定義
export interface TransitionEffect {
    name: string
    label: string
    icon: React.ComponentType<{ className?: string }>
    hasDirection: boolean
    directions?: ('up' | 'down' | 'left' | 'right' | 'vertical' | 'horizontal' | 'random')[]
    // V118: オプションシステム
    hasOptions?: boolean
    optionType?: 'size' | 'intensity' | 'count' | 'shape' | 'direction' | 'transparency' | 'speed' | 'color'
    options?: EffectOption[]
    defaultOption?: string
    // V118: 2段階オプション（方向＋強度など）
    hasIntensity?: boolean
    intensityOptions?: EffectOption[]
    defaultIntensity?: string
}

export interface EffectCategory {
    category: string
    description: string  // V118: タブ説明文
    effects: TransitionEffect[]
}

// 効果を3カテゴリに分類
export const transitionEffects: EffectCategory[] = [
    {
        category: '登場（Entrance）',
        description: '画像が現れる効果',
        effects: [
            { name: 'fadeIn', label: 'フェードイン', icon: CircleFadingPlus, hasDirection: false },
            { name: 'slideIn', label: 'スライドイン', icon: MoveRight, hasDirection: true, directions: ['up', 'down', 'left', 'right'] },
            { name: 'wipeIn', label: 'ワイプイン', icon: PanelLeftOpen, hasDirection: true, directions: ['up', 'down', 'left', 'right'] },
            { name: 'zoomIn', label: 'ズームイン', icon: ZoomIn, hasDirection: false },
            { name: 'doorClose', label: '閉扉', icon: DoorClosed, hasDirection: false },
            {
                name: 'tvStaticIn',
                label: '砂嵐イン',
                icon: Tv,
                hasDirection: false,
                hasOptions: true,
                optionType: 'transparency',
                options: [
                    { value: 'fade', label: 'フェード', numericValue: 1 },
                    { value: 'none', label: '効果のみ', numericValue: 0 },
                ],
                defaultOption: 'fade'
            },
            {
                name: 'glitchIn',
                label: 'グリッチイン',
                icon: ZapOff,
                hasDirection: false,
                hasOptions: true,
                optionType: 'intensity',
                options: [
                    { value: 'weak', label: '弱', numericValue: 5 },
                    { value: 'medium', label: '中', numericValue: 10 },
                    { value: 'strong', label: '強', numericValue: 20 },
                ],
                defaultOption: 'medium'
            },
            {
                name: 'focusIn',
                label: 'フォーカスイン',
                icon: Focus,
                hasDirection: false,
                hasOptions: true,
                optionType: 'transparency',
                options: [
                    { value: 'fade', label: 'フェード', numericValue: 1 },
                    { value: 'none', label: '効果のみ', numericValue: 0 },
                ],
                defaultOption: 'fade'
            },
            {
                name: 'sliceIn',
                label: 'スライスイン',
                icon: SplitSquareHorizontal,
                hasDirection: false,
                hasOptions: true,
                optionType: 'count',
                options: [
                    { value: '2', label: '2分割', numericValue: 2 },
                    { value: '4', label: '4分割', numericValue: 4 },
                    { value: '6', label: '6分割', numericValue: 6 },
                ],
                defaultOption: '4'
            },
            {
                name: 'blindIn',
                label: 'ブラインドイン',
                icon: Blinds,
                hasDirection: true,
                directions: ['horizontal', 'vertical'],
                hasOptions: true,
                optionType: 'count',
                options: [
                    { value: '4', label: '4本', numericValue: 4 },
                    { value: '7', label: '7本', numericValue: 7 },
                    { value: '10', label: '10本', numericValue: 10 },
                ],
                defaultOption: '7'
            },
            {
                name: 'tileIn',
                label: 'タイルイン',
                icon: Grid3X3,
                hasDirection: false,
                hasOptions: true,
                optionType: 'count',
                options: [
                    { value: '4', label: '4分割', numericValue: 4 },
                    { value: '9', label: '9分割', numericValue: 9 },
                    { value: '16', label: '16分割', numericValue: 16 },
                ],
                defaultOption: '9'
            },
            {
                name: 'pixelateIn',
                label: 'ピクセレートイン',
                icon: Puzzle,
                hasDirection: false,
                hasOptions: true,
                optionType: 'size',
                options: [
                    { value: 'small', label: '小', numericValue: 4 },
                    { value: 'medium', label: '中', numericValue: 8 },
                    { value: 'large', label: '大', numericValue: 16 },
                ],
                defaultOption: 'medium',
                hasIntensity: true,
                intensityOptions: [
                    { value: 'fade', label: 'フェード', numericValue: 1 },
                    { value: 'none', label: '効果のみ', numericValue: 0 },
                ],
                defaultIntensity: 'fade'
            },
            {
                name: 'irisIn',
                label: 'アイリスイン',
                icon: CircleDot,
                hasDirection: false,
                hasOptions: true,
                optionType: 'shape',
                options: [
                    { value: 'circle', label: '丸', numericValue: 0 },
                    { value: 'square', label: '四角', numericValue: 1 },
                    { value: 'diamond', label: 'ダイヤ', numericValue: 2 },
                ],
                defaultOption: 'circle'
            },
            {
                name: 'pageFlipIn',
                label: '本めくりイン',
                icon: BookOpen,
                hasDirection: false,
                hasOptions: true,
                optionType: 'direction',
                options: [
                    { value: 'left', label: '左めくり', numericValue: 0 },
                    { value: 'right', label: '右めくり', numericValue: 1 },
                ],
                defaultOption: 'left'
            },
            {
                name: 'cardFlipIn',
                label: 'カード回転イン',
                icon: RotateCw,
                hasDirection: false,
                hasOptions: true,
                optionType: 'speed', // speedとして扱う（回転数）
                options: [
                    { value: '1x', label: '1回転', numericValue: 1 },
                    { value: '3x', label: '3回転', numericValue: 3 },
                    { value: '5x', label: '5回転', numericValue: 5 },
                ],
                defaultOption: '1x'
            },
        ],
    },
    {
        category: '退場（Exit）',
        description: '画像が消える効果',
        effects: [
            { name: 'fadeOut', label: 'フェードアウト', icon: CircleFadingPlus, hasDirection: false },
            { name: 'slideOut', label: 'スライドアウト', icon: MoveLeft, hasDirection: true, directions: ['up', 'down', 'left', 'right'] },
            { name: 'wipeOut', label: 'ワイプアウト', icon: PanelRightOpen, hasDirection: true, directions: ['up', 'down', 'left', 'right'] },
            { name: 'zoomOut', label: 'ズームアウト', icon: ZoomOut, hasDirection: false },
            { name: 'doorOpen', label: '開扉', icon: DoorOpen, hasDirection: false },
            {
                name: 'tvStaticOut',
                label: '砂嵐アウト',
                icon: Tv,
                hasDirection: false,
                hasOptions: true,
                optionType: 'transparency',
                options: [
                    { value: 'fade', label: 'フェード', numericValue: 1 },
                    { value: 'none', label: '効果のみ', numericValue: 0 },
                ],
                defaultOption: 'fade'
            },
            {
                name: 'glitchOut',
                label: 'グリッチアウト',
                icon: Zap,
                hasDirection: false,
                hasOptions: true,
                optionType: 'intensity',
                options: [
                    { value: 'weak', label: '弱', numericValue: 5 },
                    { value: 'medium', label: '中', numericValue: 10 },
                    { value: 'strong', label: '強', numericValue: 20 },
                ],
                defaultOption: 'medium'
            },
            {
                name: 'focusOut',
                label: 'フォーカスアウト',
                icon: Focus,
                hasDirection: false,
                hasOptions: true,
                optionType: 'transparency',
                options: [
                    { value: 'fade', label: 'フェード', numericValue: 1 },
                    { value: 'none', label: '効果のみ', numericValue: 0 },
                ],
                defaultOption: 'fade'
            },
            {
                name: 'sliceOut',
                label: 'スライスアウト',
                icon: SplitSquareHorizontal,
                hasDirection: false,
                hasOptions: true,
                optionType: 'count',
                options: [
                    { value: '2', label: '2分割', numericValue: 2 },
                    { value: '4', label: '4分割', numericValue: 4 },
                    { value: '6', label: '6分割', numericValue: 6 },
                ],
                defaultOption: '4'
            },
            {
                name: 'blindOut',
                label: 'ブラインドアウト',
                icon: Blinds,
                hasDirection: true,
                directions: ['horizontal', 'vertical'],
                hasOptions: true,
                optionType: 'count',
                options: [
                    { value: '4', label: '4本', numericValue: 4 },
                    { value: '7', label: '7本', numericValue: 7 },
                    { value: '10', label: '10本', numericValue: 10 },
                ],
                defaultOption: '7'
            },
            {
                name: 'tileOut',
                label: 'タイルアウト',
                icon: Grid3X3,
                hasDirection: false,
                hasOptions: true,
                optionType: 'count',
                options: [
                    { value: '4', label: '4分割', numericValue: 4 },
                    { value: '9', label: '9分割', numericValue: 9 },
                    { value: '16', label: '16分割', numericValue: 16 },
                ],
                defaultOption: '9'
            },
            {
                name: 'pixelateOut',
                label: 'ピクセレートアウト',
                icon: Puzzle,
                hasDirection: false,
                hasOptions: true,
                optionType: 'size',
                options: [
                    { value: 'small', label: '小', numericValue: 4 },
                    { value: 'medium', label: '中', numericValue: 8 },
                    { value: 'large', label: '大', numericValue: 16 },
                ],
                defaultOption: 'medium',
                hasIntensity: true,
                intensityOptions: [
                    { value: 'fade', label: 'フェード', numericValue: 1 },
                    { value: 'none', label: '効果のみ', numericValue: 0 },
                ],
                defaultIntensity: 'fade'
            },
            {
                name: 'irisOut',
                label: 'アイリスアウト',
                icon: CircleDot,
                hasDirection: false,
                hasOptions: true,
                optionType: 'shape',
                options: [
                    { value: 'circle', label: '丸', numericValue: 0 },
                    { value: 'square', label: '四角', numericValue: 1 },
                    { value: 'diamond', label: 'ダイヤ', numericValue: 2 },
                ],
                defaultOption: 'circle'
            },
            {
                name: 'pageFlipOut',
                label: '本めくりアウト',
                icon: BookOpen,
                hasDirection: false,
                hasOptions: true,
                optionType: 'direction',
                options: [
                    { value: 'left', label: '左めくり', numericValue: 0 },
                    { value: 'right', label: '右めくり', numericValue: 1 },
                ],
                defaultOption: 'left'
            },
            {
                name: 'cardFlipOut',
                label: 'カード回転アウト',
                icon: RotateCcw,
                hasDirection: false,
                hasOptions: true,
                optionType: 'speed',
                options: [
                    { value: '1x', label: '1回転', numericValue: 1 },
                    { value: '3x', label: '3回転', numericValue: 3 },
                    { value: '5x', label: '5回転', numericValue: 5 },
                ],
                defaultOption: '1x'
            },
            {
                name: 'swordSlashOut',
                label: '斬撃',
                icon: Scissors,
                hasDirection: false,
                hasOptions: true,
                optionType: 'direction',
                options: [
                    { value: 'right', label: '右斬り ╲', numericValue: 0 },
                    { value: 'left', label: '左斬り ╱', numericValue: 1 },
                ],
                defaultOption: 'right'
            },
        ],
    },
    {
        category: '演出（Effects）',
        description: 'その場で変化する演出効果',
        effects: [
            {
                name: 'rotate',
                label: '回転',
                icon: RotateCw,
                hasDirection: false,
                hasOptions: true,
                optionType: 'direction',
                options: [
                    { value: 'left', label: '左回転', numericValue: -1 },
                    { value: 'right', label: '右回転', numericValue: 1 },
                ],
                defaultOption: 'left'
            },

            { name: 'tvStatic', label: 'TV砂嵐', icon: Tv, hasDirection: false },
            { name: 'enlarge', label: '巨大化', icon: Maximize2, hasDirection: false },
            { name: 'minimize', label: '最小化', icon: Minimize2, hasDirection: false },
            {
                name: 'spiral',
                label: 'スパイラル',
                icon: RotateCcw,
                hasDirection: false,
                hasOptions: true,
                optionType: 'direction',
                options: [
                    { value: 'left', label: '左回転', numericValue: -1 },
                    { value: 'right', label: '右回転', numericValue: 1 },
                ],
                defaultOption: 'left'
            },
            { name: 'bounce', label: 'バウンス', icon: ArrowUpDown, hasDirection: false },
            {
                name: 'vibration',
                label: '振動',
                icon: Vibrate,
                hasDirection: true,
                directions: ['vertical', 'horizontal', 'random'],
                hasIntensity: true,
                intensityOptions: [
                    { value: 'weak', label: '弱', numericValue: 5 },
                    { value: 'medium', label: '中', numericValue: 10 },
                    { value: 'strong', label: '強', numericValue: 20 },
                ],
                defaultIntensity: 'medium'
            },
            {
                name: 'glitch',
                label: 'グリッチ',
                icon: Zap,
                hasDirection: false,
                hasOptions: true,
                optionType: 'intensity',
                options: [
                    { value: 'weak', label: '弱', numericValue: 5 },
                    { value: 'medium', label: '中', numericValue: 10 },
                    { value: 'strong', label: '強', numericValue: 20 },
                ],
                defaultOption: 'medium'
            },
            {
                name: 'rgbShift',
                label: 'RGBずれ',
                icon: Palette,
                hasDirection: false,
                hasOptions: true,
                optionType: 'intensity',
                options: [
                    { value: 'small', label: '小', numericValue: 2 },
                    { value: 'medium', label: '中', numericValue: 6 },
                    { value: 'large', label: '大', numericValue: 12 },
                ],
                defaultOption: 'medium'
            },
            { name: 'pulsation', label: '脈動', icon: Activity, hasDirection: false },
            {
                name: 'scanlines',
                label: '走査線',
                icon: Scan,
                hasDirection: false,
                hasOptions: true,
                optionType: 'size',
                options: [
                    { value: 'thin', label: '細', numericValue: 1 },
                    { value: 'medium', label: '中', numericValue: 2 },
                    { value: 'thick', label: '太', numericValue: 4 },
                ],
                defaultOption: 'medium'
            },
            { name: 'vignette', label: 'ビネット', icon: Circle, hasDirection: false },
            { name: 'flash', label: '閃光', icon: Sun, hasDirection: false },
            {
                name: 'concentrationLines',
                label: '集中線',
                icon: Crosshair,
                hasDirection: false,
                hasOptions: true,
                optionType: 'size', // sizeとして扱う
                options: [
                    { value: 'weak', label: '外向け', numericValue: 0 },
                    { value: 'medium', label: '中', numericValue: 1 },
                    { value: 'strong', label: '中心向け', numericValue: 2 },
                ],
                defaultOption: 'medium'
            },
            { name: 'cardFlipLoop', label: 'カード回転ループ', icon: RefreshCw, hasDirection: false },
            {
                name: 'silhouette',
                label: 'シルエット',
                icon: UserRound,
                hasDirection: false,
                hasOptions: true,
                optionType: 'color',
                options: [
                    { value: 'white', label: '白', numericValue: 0 },
                    { value: 'black', label: '黒', numericValue: 1 },
                    { value: 'red', label: '赤', numericValue: 2 },
                    { value: 'outline', label: '縁取り', numericValue: 3 },
                ],
                defaultOption: 'black'
            },
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

// カテゴリの説明文を取得
export const getCategoryDescription = (categoryName: string): string | undefined => {
    const category = transitionEffects.find(c => c.category === categoryName)
    return category?.description
}
