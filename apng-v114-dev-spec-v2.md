# APNG Generator V114 開発企画書

> **対象**: 開発者 & AI開発アシスタント  
> **形式**: 構造化Markdown + コードスニペット  
> **最終更新**: 2025-12-12

---

## 1. プロジェクト概要

### 1.1 現状 (V113)
- **URL**: https://uhufsgi7tsulfe5amp1bm1q7bojn9uof.vercel.app/
- **効果数**: 25種（未分類、横並び表示）
- **方向選択**: 方向別に独立した効果（スライド×4、ワイプ×4、振動×2）
- **UI**: ダークグレー背景、カード型レイアウト

### 1.2 目標 (V114)
- **効果数**: 45種（方向統合で-5、新規+25）
- **分類**: 3カテゴリ（登場・退場・演出）
- **方向選択**: 統合UIで4方向選択可能に
- **UI**: 現状のデザイン・色合いを維持

---

## 2. V113 現行効果一覧（正確版）

### 2.1 V113の全25効果

```
1. フェードイン        14. ブラー
2. フェードアウト      15. TV砂嵐
3. 右にスライド        16. 巨大化
4. 左にスライド        17. 最小化
5. 下にスライド        18. カーテン
6. 上にスライド        19. スパイラル
7. 右にワイプ          20. 指紋
8. 左にワイプ          21. バウンス
9. 下にワイプ          22. 縦振動
10. 上にワイプ         23. 横振動
11. ズームイン         24. グリッジ
12. ズームアウト       25. 開扉
13. 回転
```

### 2.2 方向統合による削減

| 現状（V113） | 統合後（V114） | 削減数 |
|-------------|---------------|--------|
| 右/左/下/上にスライド ×4 | スライドイン + スライドアウト（各4方向選択） | -2 |
| 右/左/下/上にワイプ ×4 | ワイプイン + ワイプアウト（各4方向選択） | -2 |
| 縦振動 + 横振動 | 振動（2方向選択） | -1 |
| **合計** | | **-5** |

---

## 3. V114 効果一覧（完成形）

### 3.1 効果数サマリー

```
V113: 25種
方向統合: -5種
新規追加: +25種
─────────────
V114: 45種
```

### 3.2 カテゴリ別内訳

| カテゴリ | 既存 | 新規 | 合計 |
|----------|------|------|------|
| 登場（Entrance） | 4 | 10 | **14種** |
| 退場（Exit） | 5 | 9 | **14種** |
| 演出（Effects） | 11 | 6 | **17種** |
| **合計** | 20 | 25 | **45種** |

### 3.3 データ構造

```typescript
interface TransitionEffect {
  name: string;           // 内部識別子（英語）
  label: string;          // 表示名（日本語）
  icon: React.ComponentType;
  hasDirection: boolean;  // 方向選択UIを表示するか
  directions?: ('up' | 'down' | 'left' | 'right' | 'vertical' | 'horizontal')[];
}

interface EffectCategory {
  category: string;
  effects: TransitionEffect[];
}
```

---

### 3.4 登場効果（Entrance）- 14種

| # | name | label | hasDirection | 状態 |
|---|------|-------|--------------|------|
| 1 | `fadeIn` | フェードイン | false | 既存 |
| 2 | `slideIn` | スライドイン | true (4方向) | 既存統合 |
| 3 | `wipeIn` | ワイプイン | true (4方向) | 既存統合 |
| 4 | `zoomIn` | ズームイン | false | 既存 |
| 5 | `doorClose` | 閉扉 | false | **新規** |
| 6 | `tvStaticIn` | 砂嵐イン | false | **新規** |
| 7 | `glitchIn` | グリッチイン | false | **新規** |
| 8 | `focusIn` | フォーカスイン | false | **新規** |
| 9 | `sliceIn` | スライスイン | false | **新規** |
| 10 | `lightLeakIn` | ライトリークイン | false | **新規** |
| 11 | `tileIn` | タイルイン | false | **新規** |
| 12 | `pixelateIn` | ピクセレートイン | false | **新規** |
| 13 | `irisIn` | アイリスイン | false | **新規** |
| 14 | `pageFlipIn` | 本めくりイン | false | **新規** |

---

### 3.5 退場効果（Exit）- 14種

| # | name | label | hasDirection | 状態 |
|---|------|-------|--------------|------|
| 1 | `fadeOut` | フェードアウト | false | 既存 |
| 2 | `slideOut` | スライドアウト | true (4方向) | 既存統合 |
| 3 | `wipeOut` | ワイプアウト | true (4方向) | 既存統合 |
| 4 | `zoomOut` | ズームアウト | false | 既存 |
| 5 | `doorOpen` | 開扉 | false | 既存 |
| 6 | `tvStaticOut` | 砂嵐アウト | false | **新規** |
| 7 | `glitchOut` | グリッチアウト | false | **新規** |
| 8 | `focusOut` | フォーカスアウト | false | **新規** |
| 9 | `sliceOut` | スライスアウト | false | **新規** |
| 10 | `filmBurn` | フィルムバーン | false | **新規** |
| 11 | `tileOut` | タイルアウト | false | **新規** |
| 12 | `pixelateOut` | ピクセレートアウト | false | **新規** |
| 13 | `irisOut` | アイリスアウト | false | **新規** |
| 14 | `pageFlipOut` | 本めくりアウト | false | **新規** |

---

### 3.6 演出効果（Effects）- 17種

| # | name | label | hasDirection | 状態 |
|---|------|-------|--------------|------|
| 1 | `rotate` | 回転 | false | 既存 |
| 2 | `blur` | ブラー | false | 既存 |
| 3 | `tvStatic` | TV砂嵐 | false | 既存 |
| 4 | `enlarge` | 巨大化 | false | 既存 |
| 5 | `minimize` | 最小化 | false | 既存 |
| 6 | `curtain` | カーテン | false | 既存 |
| 7 | `spiral` | スパイラル | false | 既存 |
| 8 | `fingerprint` | 指紋 | false | 既存 |
| 9 | `bounce` | バウンス | false | 既存 |
| 10 | `vibration` | 振動 | true (縦/横) | 既存統合 |
| 11 | `glitch` | グリッジ | false | 既存 |
| 12 | `rgbShift` | RGBずれ | false | **新規** |
| 13 | `scanlines` | 走査線 | false | **新規** |
| 14 | `vignette` | ビネット | false | **新規** |
| 15 | `jitter` | ジッター | false | **新規** |
| 16 | `chromaticAberration` | 色収差 | false | **新規** |
| 17 | `flash` | 閃光 | false | **新規** |

---

## 4. 新規効果の詳細説明

### 4.1 登場効果（+10種）

| 効果名 | 動作説明 | 用途・シーン |
|--------|----------|--------------|
| 閉扉 | 左右から扉が閉じるように現れる | 登場、シーン切り替え |
| 砂嵐イン | 砂嵐ノイズから画像が現れる | TV演出、異常出現 |
| グリッチイン | ノイズ・分断から実体化 | 異常存在、ハッキング |
| フォーカスイン | ぼやけ→ピント合焦 | 覚醒、意識回復 |
| スライスイン | 水平分断→結合して登場 | データ転送、召喚 |
| ライトリークイン | 光漏れの中から現れる | フラッシュバック、記憶 |
| タイルイン | 格子状にランダムに現れる | デジタル、転送 |
| ピクセレートイン | モザイク→鮮明化 | デジタル、解像度変化 |
| アイリスイン | 中央の円から広がる | 映画風、注目 |
| 本めくりイン | ページがめくれて現れる | 本、記憶、回想 |

### 4.2 退場効果（+9種）

| 効果名 | 動作説明 | 用途・シーン |
|--------|----------|--------------|
| 砂嵐アウト | 画像が砂嵐ノイズに消える | TV消失、通信断絶 |
| グリッチアウト | ノイズ化して消失 | 異常消滅、バグ |
| フォーカスアウト | ピントがぼけて消える | 意識喪失、気絶 |
| スライスアウト | 分断されて消える | データ削除、消去 |
| フィルムバーン | フィルムが焼けて消える | 狂気、SAN値喪失 |
| タイルアウト | 格子状にランダムに消える | デジタル消失 |
| ピクセレートアウト | 画像→モザイク化 | デジタル劣化 |
| アイリスアウト | 円が縮小して消える | 映画風、終了 |
| 本めくりアウト | ページがめくれて消える | 本、記憶消去 |

### 4.3 演出効果（+6種）

| 効果名 | 動作説明 | 用途・シーン |
|--------|----------|--------------|
| RGBずれ | 赤・緑・青チャンネルがずれる | 異常、認識の歪み |
| 走査線 | 横線オーバーレイ + スキャン移動 | 監視カメラ風 |
| ビネット | 四隅が暗くなる | 視野狭窄、SAN低下 |
| ジッター | 小刻みにブレる | 緊張、恐怖 |
| 色収差 | 輪郭に虹色のにじみ | レンズ効果、異常視界 |
| 閃光 | 白くフラッシュする | 爆発、衝撃、記憶 |

---

## 5. 変更対象ファイル

### 5.1 ファイル構成

```
src/
├── components/
│   ├── APNGGenerator.tsx              # 変更なし
│   ├── TransitionEffectsSelector.tsx  # ★カテゴリUI実装
│   ├── ImagePreview.tsx               # 変更なし
│   ├── SettingsPanel.tsx              # 変更なし
│   └── GenerationModal.tsx            # 変更なし
├── hooks/
│   └── useAPNGGenerator.ts            # ★効果ロジック追加
└── constants/
    └── transitionEffects.ts           # ★新規作成
```

### 5.2 変更優先度

| 優先度 | ファイル | 作業内容 |
|--------|----------|----------|
| 1 | `transitionEffects.ts` | 効果定義を分離・3カテゴリ化 |
| 2 | `useAPNGGenerator.ts` | 新規25効果の描画ロジック追加 |
| 3 | `TransitionEffectsSelector.tsx` | 3カテゴリUI + 方向選択UI |
| 4 | アイコン整理 | lucide-react インポート追加 |

---

## 6. 実装コード

### 6.1 効果定義（transitionEffects.ts）

```typescript
// src/constants/transitionEffects.ts

import {
  // 既存効果用
  CircleFadingPlus, MoveRight, MoveLeft, PanelLeftOpen, PanelRightOpen,
  ZoomIn, ZoomOut, RotateCw, Cloud, Tv, Maximize, Minimize,
  Theater, RotateCcw, Fingerprint, ArrowUpDown, Zap, DoorOpen, DoorClosed, Vibrate,
  // 新規効果用
  ZapOff, Focus, Sparkles, Flame, Palette, ScanLine,
  Circle, Activity, Rainbow, SplitSquareHorizontal,
  Grid3X3, Puzzle, CircleDot, BookOpen, Sun
} from 'lucide-react'

export const transitionEffects = [
  {
    category: '登場（Entrance）',
    effects: [
      // 既存
      { name: 'fadeIn', label: 'フェードイン', icon: CircleFadingPlus, hasDirection: false },
      { name: 'slideIn', label: 'スライドイン', icon: MoveRight, hasDirection: true, directions: ['up', 'down', 'left', 'right'] },
      { name: 'wipeIn', label: 'ワイプイン', icon: PanelLeftOpen, hasDirection: true, directions: ['up', 'down', 'left', 'right'] },
      { name: 'zoomIn', label: 'ズームイン', icon: ZoomIn, hasDirection: false },
      // 新規
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
      // 既存
      { name: 'fadeOut', label: 'フェードアウト', icon: CircleFadingPlus, hasDirection: false },
      { name: 'slideOut', label: 'スライドアウト', icon: MoveLeft, hasDirection: true, directions: ['up', 'down', 'left', 'right'] },
      { name: 'wipeOut', label: 'ワイプアウト', icon: PanelRightOpen, hasDirection: true, directions: ['up', 'down', 'left', 'right'] },
      { name: 'zoomOut', label: 'ズームアウト', icon: ZoomOut, hasDirection: false },
      { name: 'doorOpen', label: '開扉', icon: DoorOpen, hasDirection: false },
      // 新規
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
      // 既存
      { name: 'rotate', label: '回転', icon: RotateCw, hasDirection: false },
      { name: 'blur', label: 'ブラー', icon: Cloud, hasDirection: false },
      { name: 'tvStatic', label: 'TV砂嵐', icon: Tv, hasDirection: false },
      { name: 'enlarge', label: '巨大化', icon: Maximize, hasDirection: false },
      { name: 'minimize', label: '最小化', icon: Minimize, hasDirection: false },
      { name: 'curtain', label: 'カーテン', icon: Theater, hasDirection: false },
      { name: 'spiral', label: 'スパイラル', icon: RotateCcw, hasDirection: false },
      { name: 'fingerprint', label: '指紋', icon: Fingerprint, hasDirection: false },
      { name: 'bounce', label: 'バウンス', icon: ArrowUpDown, hasDirection: false },
      { name: 'vibration', label: '振動', icon: Vibrate, hasDirection: true, directions: ['vertical', 'horizontal'] },
      { name: 'glitch', label: 'グリッジ', icon: Zap, hasDirection: false },
      // 新規
      { name: 'rgbShift', label: 'RGBずれ', icon: Palette, hasDirection: false },
      { name: 'scanlines', label: '走査線', icon: ScanLine, hasDirection: false },
      { name: 'vignette', label: 'ビネット', icon: Circle, hasDirection: false },
      { name: 'jitter', label: 'ジッター', icon: Activity, hasDirection: false },
      { name: 'chromaticAberration', label: '色収差', icon: Rainbow, hasDirection: false },
      { name: 'flash', label: '閃光', icon: Sun, hasDirection: false },
    ],
  },
]
```

---

### 6.2 新規効果の描画ロジック（useAPNGGenerator.ts に追加）

```typescript
// applyTransitionEffect 関数内の switch 文に追加
// ※既存のcase文の後に追加すること

// ========================================
// 登場効果（新規10種）
// ========================================

case 'doorClose':
  // 左右から扉が閉じるように現れる
  const doorCloseProgress = progress
  const leftDoor = width / 2 * (1 - doorCloseProgress)
  const rightDoor = width / 2 + width / 2 * doorCloseProgress
  ctx.drawImage(imageRef.current!, 0, 0, width / 2, height, 0, 0, width / 2, height)
  ctx.drawImage(imageRef.current!, width / 2, 0, width / 2, height, width / 2, 0, width / 2, height)
  // 扉の境界線
  ctx.fillStyle = '#000'
  ctx.fillRect(0, 0, leftDoor, height)
  ctx.fillRect(rightDoor, 0, width - rightDoor, height)
  ctx.restore()
  return

case 'tvStaticIn':
  // 砂嵐から画像が現れる
  ctx.drawImage(imageRef.current!, 0, 0, width, height)
  const staticInData = ctx.getImageData(0, 0, width, height)
  const staticInPixels = staticInData.data
  const staticInIntensity = 1 - progress
  for (let i = 0; i < staticInPixels.length; i += 4) {
    if (Math.random() < staticInIntensity) {
      const noise = Math.random() * 255
      staticInPixels[i] = staticInPixels[i + 1] = staticInPixels[i + 2] = noise
    }
  }
  ctx.putImageData(staticInData, 0, 0)
  ctx.restore()
  return

case 'glitchIn':
  // ノイズ・分断から実体化
  const glitchInIntensity = 1 - progress
  ctx.globalAlpha = progress
  for (let i = 0; i < 10; i++) {
    const sliceY = i * (height / 10)
    const offsetX = (Math.random() - 0.5) * width * 0.3 * glitchInIntensity
    ctx.drawImage(imageRef.current!, 0, sliceY, width, height / 10, offsetX, sliceY, width, height / 10)
  }
  ctx.restore()
  return

case 'focusIn':
  // ぼやけ→ピント合焦
  const focusInBlur = (1 - progress) * 20
  ctx.filter = `blur(${focusInBlur}px)`
  break

case 'sliceIn':
  // 水平分断→結合して登場
  const numSlicesIn = 5
  for (let i = 0; i < numSlicesIn; i++) {
    const sliceH = height / numSlicesIn
    const offsetX = (i % 2 === 0 ? -1 : 1) * (1 - progress) * width * 0.5
    ctx.drawImage(imageRef.current!, 0, i * sliceH, width, sliceH, offsetX, i * sliceH, width, sliceH)
  }
  ctx.restore()
  return

case 'lightLeakIn':
  // 光漏れの中から現れる
  ctx.globalAlpha = progress
  ctx.drawImage(imageRef.current!, 0, 0, width, height)
  ctx.globalCompositeOperation = 'screen'
  const lightGradientIn = ctx.createRadialGradient(width * 0.3, height * 0.3, 0, width * 0.5, height * 0.5, width)
  lightGradientIn.addColorStop(0, `rgba(255, 200, 100, ${(1 - progress) * 0.8})`)
  lightGradientIn.addColorStop(1, 'rgba(255, 200, 100, 0)')
  ctx.fillStyle = lightGradientIn
  ctx.fillRect(0, 0, width, height)
  ctx.restore()
  return

case 'tileIn':
  // 格子状にランダムに現れる
  const tileInCols = 4
  const tileInRows = 4
  const tileInW = width / tileInCols
  const tileInH = height / tileInRows
  const tileInTotal = tileInCols * tileInRows
  const tileInVisible = Math.floor(progress * tileInTotal)
  // シード付きランダム順序（毎フレーム同じ順序になるよう）
  const tileInOrder = Array.from({ length: tileInTotal }, (_, i) => i)
    .sort(() => 0.3 - 0.7) // 固定のシャッフル
  for (let i = 0; i < tileInVisible; i++) {
    const idx = tileInOrder[i]
    const col = idx % tileInCols
    const row = Math.floor(idx / tileInCols)
    ctx.drawImage(
      imageRef.current!,
      col * tileInW, row * tileInH, tileInW, tileInH,
      col * tileInW, row * tileInH, tileInW, tileInH
    )
  }
  ctx.restore()
  return

case 'pixelateIn':
  // モザイク→鮮明化
  const pixelInSize = Math.max(1, Math.floor((1 - progress) * 30))
  const tempCanvasIn = document.createElement('canvas')
  tempCanvasIn.width = width
  tempCanvasIn.height = height
  const tempCtxIn = tempCanvasIn.getContext('2d')!
  // 小さく描画して拡大
  tempCtxIn.drawImage(imageRef.current!, 0, 0, width / pixelInSize, height / pixelInSize)
  ctx.imageSmoothingEnabled = false
  ctx.drawImage(tempCanvasIn, 0, 0, width / pixelInSize, height / pixelInSize, 0, 0, width, height)
  ctx.imageSmoothingEnabled = true
  ctx.restore()
  return

case 'irisIn':
  // 中央の円から広がる
  const irisInRadius = Math.max(width, height) * progress
  ctx.beginPath()
  ctx.arc(width / 2, height / 2, irisInRadius, 0, Math.PI * 2)
  ctx.clip()
  break

case 'pageFlipIn':
  // ページがめくれて現れる（カール風）
  const flipInProgress = progress
  ctx.save()
  // 左端を軸に右から左へめくれる感じ
  const flipInSkew = (1 - flipInProgress) * 0.5
  ctx.transform(flipInProgress, 0, flipInSkew, 1, width * (1 - flipInProgress), 0)
  ctx.globalAlpha = flipInProgress
  ctx.drawImage(imageRef.current!, 0, 0, width, height)
  // ページの影
  ctx.fillStyle = `rgba(0, 0, 0, ${(1 - flipInProgress) * 0.3})`
  ctx.fillRect(0, 0, width * 0.1, height)
  ctx.restore()
  return

// ========================================
// 退場効果（新規9種）
// ========================================

case 'tvStaticOut':
  // 画像が砂嵐に消える
  ctx.drawImage(imageRef.current!, 0, 0, width, height)
  const staticOutData = ctx.getImageData(0, 0, width, height)
  const staticOutPixels = staticOutData.data
  const staticOutIntensity = progress
  for (let i = 0; i < staticOutPixels.length; i += 4) {
    if (Math.random() < staticOutIntensity) {
      const noise = Math.random() * 255
      staticOutPixels[i] = staticOutPixels[i + 1] = staticOutPixels[i + 2] = noise
    }
  }
  ctx.putImageData(staticOutData, 0, 0)
  ctx.restore()
  return

case 'glitchOut':
  // 実体→ノイズ消失
  const glitchOutIntensity = progress
  ctx.globalAlpha = 1 - progress
  for (let i = 0; i < 10; i++) {
    const sliceY = i * (height / 10)
    const offsetX = (Math.random() - 0.5) * width * 0.3 * glitchOutIntensity
    ctx.drawImage(imageRef.current!, 0, sliceY, width, height / 10, offsetX, sliceY, width, height / 10)
  }
  ctx.restore()
  return

case 'focusOut':
  // ピントがぼけて消える
  const focusOutBlur = progress * 20
  ctx.filter = `blur(${focusOutBlur}px)`
  ctx.globalAlpha = 1 - progress * 0.5
  break

case 'sliceOut':
  // 分断されて消える
  const numSlicesOut = 5
  ctx.globalAlpha = 1 - progress
  for (let i = 0; i < numSlicesOut; i++) {
    const sliceH = height / numSlicesOut
    const offsetX = (i % 2 === 0 ? -1 : 1) * progress * width * 0.5
    ctx.drawImage(imageRef.current!, 0, i * sliceH, width, sliceH, offsetX, i * sliceH, width, sliceH)
  }
  ctx.restore()
  return

case 'filmBurn':
  // フィルムが焼けて消える
  ctx.globalAlpha = 1 - progress
  ctx.drawImage(imageRef.current!, 0, 0, width, height)
  ctx.globalCompositeOperation = 'overlay'
  const burnGradient = ctx.createRadialGradient(width * 0.5, height * 0.5, 0, width * 0.5, height * 0.5, width * 0.7)
  burnGradient.addColorStop(0, `rgba(255, 100, 0, ${progress})`)
  burnGradient.addColorStop(0.5, `rgba(255, 50, 0, ${progress * 0.7})`)
  burnGradient.addColorStop(1, `rgba(0, 0, 0, ${progress})`)
  ctx.fillStyle = burnGradient
  ctx.fillRect(0, 0, width, height)
  ctx.restore()
  return

case 'tileOut':
  // 格子状にランダムに消える
  const tileOutCols = 4
  const tileOutRows = 4
  const tileOutW = width / tileOutCols
  const tileOutH = height / tileOutRows
  const tileOutTotal = tileOutCols * tileOutRows
  const tileOutVisible = Math.floor((1 - progress) * tileOutTotal)
  const tileOutOrder = Array.from({ length: tileOutTotal }, (_, i) => i)
    .sort(() => 0.3 - 0.7)
  for (let i = 0; i < tileOutVisible; i++) {
    const idx = tileOutOrder[i]
    const col = idx % tileOutCols
    const row = Math.floor(idx / tileOutCols)
    ctx.drawImage(
      imageRef.current!,
      col * tileOutW, row * tileOutH, tileOutW, tileOutH,
      col * tileOutW, row * tileOutH, tileOutW, tileOutH
    )
  }
  ctx.restore()
  return

case 'pixelateOut':
  // 画像→モザイク化
  const pixelOutSize = Math.max(1, Math.floor(progress * 30))
  const tempCanvasOut = document.createElement('canvas')
  tempCanvasOut.width = width
  tempCanvasOut.height = height
  const tempCtxOut = tempCanvasOut.getContext('2d')!
  tempCtxOut.drawImage(imageRef.current!, 0, 0, width / pixelOutSize, height / pixelOutSize)
  ctx.imageSmoothingEnabled = false
  ctx.drawImage(tempCanvasOut, 0, 0, width / pixelOutSize, height / pixelOutSize, 0, 0, width, height)
  ctx.imageSmoothingEnabled = true
  ctx.globalAlpha = 1 - progress * 0.3
  ctx.restore()
  return

case 'irisOut':
  // 円が縮小して消える
  const irisOutRadius = Math.max(width, height) * (1 - progress)
  ctx.beginPath()
  ctx.arc(width / 2, height / 2, irisOutRadius, 0, Math.PI * 2)
  ctx.clip()
  break

case 'pageFlipOut':
  // ページがめくれて消える
  const flipOutProgress = 1 - progress
  ctx.save()
  const flipOutSkew = progress * 0.5
  ctx.transform(flipOutProgress, 0, flipOutSkew, 1, width * progress, 0)
  ctx.globalAlpha = flipOutProgress
  ctx.drawImage(imageRef.current!, 0, 0, width, height)
  ctx.fillStyle = `rgba(0, 0, 0, ${progress * 0.3})`
  ctx.fillRect(width * 0.9, 0, width * 0.1, height)
  ctx.restore()
  return

// ========================================
// 演出効果（新規6種）
// ========================================

case 'rgbShift':
  // RGBチャンネルがずれる
  const shiftAmount = Math.sin(progress * Math.PI) * 10
  ctx.globalCompositeOperation = 'lighter'
  // Red channel
  ctx.fillStyle = 'rgba(255, 0, 0, 0.5)'
  ctx.drawImage(imageRef.current!, -shiftAmount, 0, width, height)
  // Green channel (center)
  ctx.fillStyle = 'rgba(0, 255, 0, 0.5)'
  ctx.drawImage(imageRef.current!, 0, 0, width, height)
  // Blue channel
  ctx.fillStyle = 'rgba(0, 0, 255, 0.5)'
  ctx.drawImage(imageRef.current!, shiftAmount, 0, width, height)
  ctx.restore()
  return

case 'scanlines':
  // 走査線オーバーレイ
  ctx.drawImage(imageRef.current!, 0, 0, width, height)
  ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
  for (let y = 0; y < height; y += 4) {
    ctx.fillRect(0, y, width, 2)
  }
  // 走査線の移動エフェクト
  const scanOffset = (progress * height * 2) % height
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)'
  ctx.fillRect(0, scanOffset - 10, width, 20)
  ctx.restore()
  return

case 'vignette':
  // 四隅が暗くなる
  ctx.drawImage(imageRef.current!, 0, 0, width, height)
  const vignetteGradient = ctx.createRadialGradient(
    width / 2, height / 2, 0,
    width / 2, height / 2, Math.max(width, height) * 0.7
  )
  vignetteGradient.addColorStop(0, 'rgba(0, 0, 0, 0)')
  vignetteGradient.addColorStop(0.5, 'rgba(0, 0, 0, 0)')
  vignetteGradient.addColorStop(1, `rgba(0, 0, 0, ${0.3 + progress * 0.5})`)
  ctx.fillStyle = vignetteGradient
  ctx.fillRect(0, 0, width, height)
  ctx.restore()
  return

case 'jitter':
  // 小刻みにブレる
  const jitterIntensity = Math.sin(progress * Math.PI * 8)
  const jitterX = (Math.random() - 0.5) * 10 * jitterIntensity
  const jitterY = (Math.random() - 0.5) * 10 * jitterIntensity
  ctx.translate(jitterX, jitterY)
  break

case 'chromaticAberration':
  // 輪郭に虹色のにじみ（色収差）
  const aberrationAmount = Math.sin(progress * Math.PI) * 5
  ctx.globalCompositeOperation = 'screen'
  ctx.globalAlpha = 0.8
  // Red
  ctx.drawImage(imageRef.current!, -aberrationAmount, -aberrationAmount, width, height)
  // Green
  ctx.drawImage(imageRef.current!, 0, 0, width, height)
  // Blue
  ctx.drawImage(imageRef.current!, aberrationAmount, aberrationAmount, width, height)
  ctx.restore()
  return

case 'flash':
  // 白くフラッシュする
  ctx.drawImage(imageRef.current!, 0, 0, width, height)
  const flashIntensity = Math.sin(progress * Math.PI)
  ctx.fillStyle = `rgba(255, 255, 255, ${flashIntensity * 0.8})`
  ctx.fillRect(0, 0, width, height)
  ctx.restore()
  return
```

---

### 6.3 方向統合ロジック（既存効果の修正）

```typescript
// slideIn / slideOut の方向対応
case 'slideIn':
  switch (effectDirection) {
    case 'left':
      ctx.translate((1 - progress) * -width, 0)
      break
    case 'right':
      ctx.translate((1 - progress) * width, 0)
      break
    case 'up':
      ctx.translate(0, (1 - progress) * -height)
      break
    case 'down':
      ctx.translate(0, (1 - progress) * height)
      break
  }
  break

case 'slideOut':
  switch (effectDirection) {
    case 'left':
      ctx.translate(progress * -width, 0)
      break
    case 'right':
      ctx.translate(progress * width, 0)
      break
    case 'up':
      ctx.translate(0, progress * -height)
      break
    case 'down':
      ctx.translate(0, progress * height)
      break
  }
  break

// wipeIn / wipeOut の方向対応
case 'wipeIn':
  ctx.beginPath()
  switch (effectDirection) {
    case 'left':
      ctx.rect(width * (1 - progress), 0, width * progress, height)
      break
    case 'right':
      ctx.rect(0, 0, width * progress, height)
      break
    case 'up':
      ctx.rect(0, height * (1 - progress), width, height * progress)
      break
    case 'down':
      ctx.rect(0, 0, width, height * progress)
      break
  }
  ctx.clip()
  break

case 'wipeOut':
  ctx.beginPath()
  switch (effectDirection) {
    case 'left':
      ctx.rect(0, 0, width * (1 - progress), height)
      break
    case 'right':
      ctx.rect(width * progress, 0, width * (1 - progress), height)
      break
    case 'up':
      ctx.rect(0, 0, width, height * (1 - progress))
      break
    case 'down':
      ctx.rect(0, height * progress, width, height * (1 - progress))
      break
  }
  ctx.clip()
  break

// vibration の方向対応
case 'vibration':
  const vibrationAmplitude = 10 * Math.sin(progress * Math.PI * 8)
  if (effectDirection === 'vertical') {
    ctx.translate(0, (Math.random() - 0.5) * vibrationAmplitude)
  } else {
    ctx.translate((Math.random() - 0.5) * vibrationAmplitude, 0)
  }
  break
```

---

### 6.4 TransitionEffectsSelector UI

```tsx
// src/components/TransitionEffectsSelector.tsx

import React from 'react'
import { transitionEffects } from '../constants/transitionEffects'
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
  return (
    <div className="bg-gray-800 rounded-lg p-4 space-y-6">
      <h2 className="text-lg font-semibold text-white mb-4">トランジション効果</h2>
      
      {transitionEffects.map((category) => (
        <div key={category.category}>
          {/* カテゴリヘッダー */}
          <h3 className="text-sm font-medium text-gray-400 mb-3 border-b border-gray-700 pb-2">
            {category.category}
          </h3>
          
          {/* 効果グリッド */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 mb-4">
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
                        ? 'bg-blue-600 text-white ring-2 ring-blue-400'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
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
                      {['up', 'down', 'left', 'right'].map((dir) => (
                        <button
                          key={dir}
                          onClick={() => setEffectDirection(dir)}
                          className={`
                            p-1.5 rounded text-xs flex items-center justify-center
                            ${effectDirection === dir
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
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
                      {['vertical', 'horizontal'].map((dir) => (
                        <button
                          key={dir}
                          onClick={() => setEffectDirection(dir)}
                          className={`
                            p-1.5 rounded text-xs flex items-center justify-center
                            ${effectDirection === dir
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
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
```

---

## 7. 実装フェーズ

### Phase 1: 準備（30分）
```markdown
- [ ] V113のGitタグ作成（ロールバック用）
- [ ] `src/constants/transitionEffects.ts` 新規作成
- [ ] 既存効果を3カテゴリに分類して定義
```

### Phase 2: 方向統合（1時間）
```markdown
- [ ] スライド4種 → スライドイン/アウト + 方向選択
- [ ] ワイプ4種 → ワイプイン/アウト + 方向選択
- [ ] 振動2種 → 振動 + 縦横選択
- [ ] TransitionEffectsSelector UIを更新
```

### Phase 3: 新規効果追加（3〜4時間）
```markdown
登場効果（10種）:
- [ ] 閉扉 実装・テスト
- [ ] 砂嵐イン 実装・テスト
- [ ] グリッチイン 実装・テスト
- [ ] フォーカスイン 実装・テスト
- [ ] スライスイン 実装・テスト
- [ ] ライトリークイン 実装・テスト
- [ ] タイルイン 実装・テスト
- [ ] ピクセレートイン 実装・テスト
- [ ] アイリスイン 実装・テスト
- [ ] 本めくりイン 実装・テスト

退場効果（9種）:
- [ ] 砂嵐アウト 実装・テスト
- [ ] グリッチアウト 実装・テスト
- [ ] フォーカスアウト 実装・テスト
- [ ] スライスアウト 実装・テスト
- [ ] フィルムバーン 実装・テスト
- [ ] タイルアウト 実装・テスト
- [ ] ピクセレートアウト 実装・テスト
- [ ] アイリスアウト 実装・テスト
- [ ] 本めくりアウト 実装・テスト

演出効果（6種）:
- [ ] RGBずれ 実装・テスト
- [ ] 走査線 実装・テスト
- [ ] ビネット 実装・テスト
- [ ] ジッター 実装・テスト
- [ ] 色収差 実装・テスト
- [ ] 閃光 実装・テスト
```

### Phase 4: 統合テスト（1時間）
```markdown
- [ ] 全45効果の動作確認
- [ ] 方向選択の動作確認
- [ ] APNG生成の正常動作確認
- [ ] 1MB調整機能の正常動作確認
```

### Phase 5: デプロイ（30分）
```markdown
- [ ] Vercelへデプロイ
- [ ] 本番動作確認
- [ ] V114タグ作成
```

---

## 8. デザイン仕様（維持）

### 8.1 カラーパレット

```css
/* 現行V113のカラーを維持 */
--bg-primary: #1f2937;     /* gray-800 */
--bg-secondary: #374151;   /* gray-700 */
--bg-tertiary: #4b5563;    /* gray-600 */
--text-primary: #ffffff;
--text-secondary: #9ca3af; /* gray-400 */
--accent-primary: #3b82f6; /* blue-500 */
--accent-selected: #2563eb;/* blue-600 */
```

### 8.2 グリッドレイアウト

```
カテゴリごと:
- Mobile (< 640px): 3列
- Tablet (640-768px): 4列
- Desktop (> 768px): 5列

ボタン:
- 最小高さ: 70px
- パディング: 12px
- アイコン: 20x20px
- ラベル: 12px
```

---

## 9. ロールバック手順

```bash
# 方法1: Vercelダッシュボード
# Deployments → V113のデプロイを選択 → Promote to Production

# 方法2: Gitタグ
git checkout v113
git push origin main --force

# 方法3: revert
git revert HEAD~N  # Nはコミット数
```

---

## 10. チェックリスト

### 実装前
```markdown
- [ ] V113バックアップ完了（Gitタグ）
- [ ] 本企画書の内容理解
- [ ] 必要なlucide-reactアイコン確認
```

### 実装中
```markdown
- [ ] 3カテゴリUI表示OK
- [ ] 方向選択UI（4方向）表示OK
- [ ] 方向選択UI（縦横）表示OK
- [ ] 既存20効果の動作維持
- [ ] 新規25効果すべて動作OK
```

### 実装後
```markdown
- [ ] 全45効果の動作確認
- [ ] APNG生成の正常動作
- [ ] 1MB調整機能の正常動作
- [ ] モバイル表示確認
- [ ] V114タグ作成
```

---

## 付録A: 効果名マッピング（V113→V114）

| V113の効果名 | V114の効果名 | 変更内容 |
|-------------|-------------|----------|
| 右にスライド | slideIn (right) | 統合 |
| 左にスライド | slideIn (left) | 統合 |
| 下にスライド | slideIn (down) | 統合 |
| 上にスライド | slideIn (up) | 統合 |
| 右にワイプ | wipeIn (right) | 統合 |
| 左にワイプ | wipeIn (left) | 統合 |
| 下にワイプ | wipeIn (down) | 統合 |
| 上にワイプ | wipeIn (up) | 統合 |
| 縦振動 | vibration (vertical) | 統合 |
| 横振動 | vibration (horizontal) | 統合 |
| その他 | 変更なし | - |

---

## 付録B: lucide-react アイコン一覧

```typescript
// 必要なインポート
import {
  // 既存
  CircleFadingPlus,  // フェードイン/アウト
  MoveRight,         // スライドイン
  MoveLeft,          // スライドアウト
  PanelLeftOpen,     // ワイプイン
  PanelRightOpen,    // ワイプアウト
  ZoomIn,            // ズームイン
  ZoomOut,           // ズームアウト
  RotateCw,          // 回転
  Cloud,             // ブラー
  Tv,                // TV砂嵐、砂嵐イン/アウト
  Maximize,          // 巨大化
  Minimize,          // 最小化
  Theater,           // カーテン
  RotateCcw,         // スパイラル
  Fingerprint,       // 指紋
  ArrowUpDown,       // バウンス
  Vibrate,           // 振動
  Zap,               // グリッジ、グリッチアウト
  DoorOpen,          // 開扉
  DoorClosed,        // 閉扉
  
  // 新規
  ZapOff,            // グリッチイン
  Focus,             // フォーカスイン/アウト
  SplitSquareHorizontal, // スライスイン/アウト
  Sparkles,          // ライトリークイン
  Flame,             // フィルムバーン
  Palette,           // RGBずれ
  ScanLine,          // 走査線
  Circle,            // ビネット
  Activity,          // ジッター
  Rainbow,           // 色収差
  Grid3X3,           // タイルイン/アウト
  Puzzle,            // ピクセレートイン/アウト
  CircleDot,         // アイリスイン/アウト
  BookOpen,          // 本めくりイン/アウト
  Sun,               // 閃光
  
  // 方向UI用
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  MoveVertical,
  MoveHorizontal,
} from 'lucide-react'
```

---

## 付録C: 新規効果の実装難易度

| 効果名 | 難易度 | 備考 |
|--------|--------|------|
| 閉扉 | ⭐ | 開扉の逆 |
| 砂嵐イン/アウト | ⭐⭐ | ピクセル操作 |
| グリッチイン/アウト | ⭐⭐ | スライス描画 |
| フォーカスイン/アウト | ⭐ | filter: blur |
| スライスイン/アウト | ⭐⭐ | スライス描画 |
| ライトリークイン | ⭐⭐ | グラデーション |
| フィルムバーン | ⭐⭐ | グラデーション |
| タイルイン/アウト | ⭐⭐ | 分割描画 |
| ピクセレートイン/アウト | ⭐⭐ | 縮小拡大 |
| アイリスイン/アウト | ⭐ | 円形クリップ |
| 本めくりイン/アウト | ⭐⭐⭐ | transform + カール |
| RGBずれ | ⭐⭐ | 複数描画 |
| 走査線 | ⭐ | 線描画 |
| ビネット | ⭐ | グラデーション |
| ジッター | ⭐ | translate |
| 色収差 | ⭐⭐ | 複数描画 |
| 閃光 | ⭐ | 白オーバーレイ |

---

*文書終了*
