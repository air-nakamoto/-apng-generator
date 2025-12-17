📋 V118実装指示書
バージョン情報
バージョン: V118
ベース: V117（クリーンアップ版）
テーマ: APNG設定UI改善 + エフェクトオプション拡張
🎯 実装内容サマリー
A. APNG生成設定の改善（3項目）
再生スピードスライダー追加（新規）
ループ設定UI改善（チェックボックス→トグルボタン）
容量制限UI改善（チェックボックス→セグメントボタン）
B. エフェクトオプション拡張（4効果）
pixelateIn/Out, rgbShift, tileIn/Out, glitchIn/Outにオプション追加

※ 削除済み項目:
- blur: focusInと重複のため削除
- curtain, fingerprint: 不要と判断し削除
📝 詳細仕様
A-1. 再生スピードスライダー（新規追加）
State追加
// APNGGenerator.tsx の state部分に追加
const [playbackSpeed, setPlaybackSpeed] = useState(1.0)

UI実装（1693行目付近、fpsスライダーの下に追加）
<div>
    <label htmlFor="speed-range" className="block text-sm font-medium text-gray-700 mb-2">
        再生スピード: {playbackSpeed.toFixed(2)}x
    </label>
    <input
        id="speed-range"
        type="range"
        min="0.25"
        max="2.0"
        step="0.05"
        value={playbackSpeed}
        onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
    />
    <div className="flex justify-between text-xs text-gray-500 mt-1">
        <span>0.25x (遅い)</span>
        <span>1.0x (通常)</span>
        <span>2.0x (速い)</span>
    </div>
</div>

ロジック変更（APNG生成部分）
// generateAPNG関数内（1400行目付近）
// 変更前:
const frameDelay = 1000 / fps

// 変更後:
const frameDelay = (1000 / fps) / playbackSpeed

// delays配列の生成
const delays = new Array(frameCount).fill(Math.round(frameDelay))

仕様
範囲: 0.25x 〜 2.0x
刻み: 0.05
デフォルト: 1.0x
表示: 小数点2桁（例: 1.00x）
計算式: frameDelay = (1000 / fps) / playbackSpeed
A-2. ループ設定UI改善
現在（1670-1677行目）
// チェックボックス
<label className="flex items-center space-x-2">
    <input type="checkbox" checked={isLooping} ... />
    <span>ループする（繰り返し再生）</span>
</label>

変更後
<div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
        ループ設定
    </label>
    <div className="flex gap-2">
        <button
            onClick={() => setIsLooping(true)}
            className={`
                flex-1 px-4 py-2 rounded-lg font-medium text-sm
                transition-all duration-200
                ${isLooping
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }
            `}
        >
            🔁 ループ再生
        </button>
        <button
            onClick={() => setIsLooping(false)}
            className={`
                flex-1 px-4 py-2 rounded-lg font-medium text-sm
                transition-all duration-200
                ${!isLooping
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }
            `}
        >
            ▶️ 1回のみ再生
        </button>
    </div>
</div>

仕様
UI: トグルボタン（2択）
選択肢: ループ再生 / 1回のみ再生
デフォルト: 1回のみ再生（false）
ロジック変更: なし（既存のisLooping stateをそのまま使用）
A-3. 容量制限UI改善
State変更
// 変更前:
const [adjustToOneMB, setAdjustToOneMB] = useState(false)

// 変更後:
const [sizeLimit, setSizeLimit] = useState<number | null>(null)
// null = 制限なし, 1 = 1MB, 3 = 3MB, 5 = 5MB, 10 = 10MB

UI実装（1680-1690行目を置き換え）
<div>
    <label className="block text-sm font-medium text-gray-700 mb-2">
        容量制限
    </label>
    <div className="flex gap-2">
        {[null, 1, 3, 5, 10].map((limit) => (
            <button
                key={limit ?? 'none'}
                onClick={() => setSizeLimit(limit)}
                className={`
                    flex-1 px-3 py-2 rounded-lg font-medium text-sm
                    transition-all duration-200
                    ${sizeLimit === limit
                        ? 'bg-blue-500 text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }
                `}
            >
                {limit === null ? '制限なし' : `${limit}MB`}
            </button>
        ))}
    </div>
</div>

ロジック変更（APNG生成部分）
// generateAPNG関数内（770行目付近）
// 変更前:
if (adjustToOneMB && estimatedSize > 1) {
    const targetSizeInBytes = 1 * 1024 * 1024
    // ...
}

// 変更後:
if (sizeLimit !== null && estimatedSize > sizeLimit) {
    const targetSizeInBytes = sizeLimit * 1024 * 1024
    // ...
}

予想容量表示の変更（1710-1718行目）
{estimatedSize !== null && (
    <p className="text-sm text-gray-600 mt-1">
        予想APNG容量: {estimatedSize.toFixed(2)} MB
        {sizeLimit !== null && estimatedSize > sizeLimit && (
            <span className="text-yellow-600 ml-2">
                ({sizeLimit}MB以下に自動調整されます)
            </span>
        )}
    </p>
)}

仕様
UI: セグメントボタン（5択）
選択肢: 制限なし / 1MB / 3MB / 5MB / 10MB
デフォルト: 制限なし（null）
ロジック: estimatedSize > sizeLimitの場合、画像縮小処理を実行
B. エフェクトオプションシステム
1. 型定義の拡張（constants/transitionEffects.ts）
// 既存の型に追加
export interface TransitionEffect {
    name: string
    label: string
    icon: React.ComponentType<{ className?: string }>
    hasDirection: boolean
    directions?: ('up' | 'down' | 'left' | 'right' | 'vertical' | 'horizontal' | 'random')[]
    // 👇 新規追加
    hasOptions?: boolean
    optionType?: 'size' | 'intensity' | 'count'
    options?: {
        value: string
        label: string
        numericValue: number
    }[]
    defaultOption?: string
}

2. 効果定義の更新（5効果）
// constants/transitionEffects.ts の該当部分を更新

// pixelateIn（77行目）
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
        { value: 'large', label: '大', numericValue: 16 }
    ],
    defaultOption: 'medium'
},

// pixelateOut（99行目）
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
        { value: 'large', label: '大', numericValue: 16 }
    ],
    defaultOption: 'medium'
},

// blur（110行目）
{ 
    name: 'blur', 
    label: 'ブラー', 
    icon: Cloud, 
    hasDirection: false,
    hasOptions: true,
    optionType: 'intensity',
    options: [
        { value: 'weak', label: '弱', numericValue: 5 },
        { value: 'medium', label: '中', numericValue: 10 },
        { value: 'strong', label: '強', numericValue: 20 }
    ],
    defaultOption: 'medium'
},

// rgbShift（119行目）
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
        { value: 'large', label: '大', numericValue: 12 }
    ],
    defaultOption: 'medium'
},

// tileIn（76行目）
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
        { value: '16', label: '16分割', numericValue: 16 }
    ],
    defaultOption: '16'
},

// tileOut（98行目）
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
        { value: '16', label: '16分割', numericValue: 16 }
    ],
    defaultOption: '16'
},

// glitchIn（72行目）
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
        { value: 'strong', label: '強', numericValue: 20 }
    ],
    defaultOption: 'medium'
},

// glitchOut（94行目）
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
        { value: 'strong', label: '強', numericValue: 20 }
    ],
    defaultOption: 'medium'
},

3. APNGGenerator.tsxのState追加
// State追加（22行目付近）
const [effectOption, setEffectOption] = useState<string>('medium')

4. TransitionEffectsSelector.tsxのUI実装
// components/TransitionEffectsSelector.tsx（160行目付近に追加）

{/* オプション選択UI（サイズ・強度・数） */}
{effect.hasOptions && isSelected && (
    <div className="grid grid-cols-3 gap-0.5 mt-1">
        {effect.options?.map((option) => (
            <button
                key={option.value}
                onClick={() => {
                    setEffectOption(option.value)
                    onOptionChange?.(option.value)
                }}
                className={`
                    p-1 rounded text-xs flex items-center justify-center
                    ${effectOption === option.value
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                    }
                `}
                title={`${effect.optionType}: ${option.label}`}
            >
                {option.label}
            </button>
        ))}
    </div>
)}

5. Props追加（TransitionEffectsSelector）
// components/TransitionEffectsSelector.tsx
interface Props {
    transition: string
    setTransition: (t: string) => void
    effectDirection: string
    setEffectDirection: (d: string) => void
    onDirectionChange?: () => void
    // 👇 新規追加
    effectOption?: string
    setEffectOption?: (o: string) => void
    onOptionChange?: (o: string) => void
}

6. APNGGenerator.tsxでの使用
// APNGGenerator.tsx（TransitionEffectsSelectorの呼び出し部分）
<TransitionEffectsSelector
    transition={transition}
    setTransition={setTransition}
    effectDirection={effectDirection}
    setEffectDirection={setEffectDirection}
    onDirectionChange={startPreview}
    effectOption={effectOption}
    setEffectOption={setEffectOption}
    onOptionChange={startPreview}
/>

7. 効果実装でのオプション使用
// APNGGenerator.tsx drawPreviewFrame関数内（各effectのcase）

// pixelateInの例（250行目付近）
case 'pixelateIn': {
    const selectedEffect = findEffectByName('pixelateIn')
    const option = selectedEffect?.options?.find(o => o.value === effectOption)
    const pixelSize = option?.numericValue ?? 8  // デフォルト8
    
    const scale = 1 - progress
    const currentPixelSize = Math.max(1, Math.floor(pixelSize * scale))
    // ... 既存のpixelate実装
    break
}

// blurの例（600行目付近）
case 'blur': {
    const selectedEffect = findEffectByName('blur')
    const option = selectedEffect?.options?.find(o => o.value === effectOption)
    const blurAmount = option?.numericValue ?? 10  // デフォルト10
    
    ctx.filter = `blur(${blurAmount * (1 - Math.abs(progress - 0.5) * 2)}px)`
    // ... 既存のblur実装
    break
}

C. 不整合解消
curtain, fingerprint追加
// constants/transitionEffects.ts
// 演出カテゴリに追加（114行目と115行目の間に挿入）

{ name: 'curtain', label: 'カーテン', icon: Clapperboard, hasDirection: false },
{ name: 'fingerprint', label: '指紋', icon: Fingerprint, hasDirection: false },

アイコンのインポート追加
// constants/transitionEffects.ts（4行目付近）
import {
    // ... 既存のインポート
    Clapperboard,  // 追加
    Fingerprint,   // 追加
} from 'lucide-react'

🔧 ファイル変更一覧
変更するファイル（3ファイル）
APNGGenerator.tsx

State追加: playbackSpeed, sizeLimit, effectOption
UI変更: 再生スピードスライダー、ループトグルボタン、容量制限ボタン
ロジック変更: frameDelay計算、容量制限ロジック、オプション対応
constants/transitionEffects.ts

型定義拡張: hasOptions, optionType, options追加
効果定義更新: 8効果にオプション追加
効果追加: curtain, fingerprint
components/TransitionEffectsSelector.tsx

Props追加: effectOption, setEffectOption, onOptionChange
UI追加: オプション選択ボタン（3択）
✅ テスト項目
A. APNG設定
 再生スピード 0.25x で超スロー再生されるか
 再生スピード 2.0x で超高速再生されるか
 ループトグルボタンで切り替えできるか
 容量制限 1MB/3MB/5MB で画像が縮小されるか
B. エフェクトオプション
 pixelate: サイズ小/中/大でピクセルサイズが変わるか
 blur: 強度弱/中/強でぼかしが変わるか
 rgbShift: ずれ幅小/中/大でRGBずれが変わるか
 tile: 分割数4/9/16でタイル数が変わるか
 glitch: 強度弱/中/強でグリッチが変わるか
C. 新効果
 curtain が演出カテゴリに表示されるか
 fingerprint が演出カテゴリに表示されるか
D. ビルド
 npm run build が成功するか
 TypeScriptエラーがないか
📊 期待される結果
効果総数: 44個 → 46個（curtain, fingerprint追加）
オプション付き効果: 5個 → 13個（8効果にオプション追加）
APNG設定: より直感的で柔軟なUI
コード削減: なし（機能追加のため）