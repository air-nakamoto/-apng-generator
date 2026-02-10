# 目覚めエフェクト (awakeIn / awakeOut) 実装計画

## 概要
「目を閉じた状態から目覚める」登場アニメーションと、その逆再生による退場アニメーションを追加する。
寝起きの視覚体験を再現する複合エフェクト。

## アニメーション演出フロー

### 登場 (awakeIn) — 時系列順

```
progress: 0.0                    0.5                    1.0
          |---- 暗闘・薄目 ----|---- 覚醒・クリア ----|

1. まぶた    ████████████████  →  ██==開く==██  →  パチパチ  →  全開
2. blur      blur(20px)        →  blur(8px)     →  blur(2px) →  blur(0)
3. brightness brightness(0.2)  →  brightness(0.6)→ brightness(0.9)→ 1.0
4. 揺らぎ    translate±5px     →  translate±3px →  ±1px      →  静止
             scale 0.98~1.02   →  0.99~1.01    →  収束      →  1.0
```

### 退場 (awakeOut)
上記の逆再生（progress を 1→0 として適用）。
クリアな状態 → 視界がぼやけ → まぶたが閉じていく → 暗転。

## オプション設計

### Primary Option — まぶたの形 (shape)

| value | label | 説明 |
|-------|-------|------|
| `flat` | 黒帯 | 上下から平らな黒い矩形で挟む。シンプル |
| `curved` | 曲線 | 円弧(楕円弧)状のclipパスでまぶたの丸みを表現 |
| `slit` | スリット | まぶた自体は描画せず、clip領域を上下から狭めるだけ |

### Secondary Option — まばたき回数 (count)

| value | label | numericValue |
|-------|-------|-------------|
| `1` | 1回 | 0 |
| `2` | 2回 | 1 |
| `3` | 3回 | 2 |

## エフェクト定義 (transitionEffects.ts)

```typescript
// 登場カテゴリに追加
{
  name: 'awakeIn',
  label: '目覚め',
  icon: Eye,  // lucide-react の Eye アイコン
  hasDirection: false,
  hasOptions: true,
  optionType: 'shape',
  options: [
    { value: 'flat', label: '黒帯', numericValue: 0 },
    { value: 'curved', label: '曲線', numericValue: 1 },
    { value: 'slit', label: 'スリット', numericValue: 2 },
  ],
  defaultOption: 'curved',
  hasIntensity: true,
  intensityOptions: [
    { value: '1', label: '1回', numericValue: 0 },
    { value: '2', label: '2回', numericValue: 1 },
    { value: '3', label: '3回', numericValue: 2 },
  ],
  defaultIntensity: '2',
},

// 退場カテゴリに追加
{
  name: 'awakeOut',
  label: '眠り',
  icon: EyeOff,  // lucide-react の EyeOff アイコン
  // ... 同じオプション構造
},
```

## 描画ロジック設計 (APNGGenerator.tsx)

### フェーズ分割

progress (0〜1) を以下のフェーズに分割:

```
awakeIn の場合:

Phase 1: 開眼 (0.0 〜 0.4)
  - まぶたが閉じた状態からゆっくり開く
  - blur: 20px → 5px
  - brightness: 0.2 → 0.7
  - 揺らぎ: 最大振幅

Phase 2: まばたき (0.4 〜 0.8)
  - まぶたが素早く開閉を繰り返す（回数はオプション依存）
  - 各まばたき: 開→閉→開 を短いサイクルで
  - blur: 5px → 1px（まばたき中も徐々にクリアに）
  - brightness: 0.7 → 0.95
  - 揺らぎ: 振幅縮小

Phase 3: 覚醒 (0.8 〜 1.0)
  - まぶた完全に開く
  - blur: 1px → 0px
  - brightness: 0.95 → 1.0
  - 揺らぎ: 収束 → 静止
```

### まぶた描画の実装方針

```
■ flat (黒帯)
  ctx.fillStyle = 'black'
  ctx.fillRect(0, 0, width, eyelidHeight)              // 上まぶた
  ctx.fillRect(0, height - eyelidHeight, width, eyelidHeight)  // 下まぶた
  ※ eyelidHeight は開閉度に応じて height/2 → 0 に変化

■ curved (曲線)
  ctx.beginPath()
  ctx.ellipse(centerX, 0, width, eyelidHeight, 0, 0, Math.PI)  // 上まぶた楕円弧
  ctx.fill()
  // 下まぶたも同様に逆向き楕円弧
  ※ まぶたの丸みを楕円で表現

■ slit (スリット)
  まぶた自体は描画しない
  ctx.beginPath()
  ctx.rect(0, eyelidHeight, width, height - eyelidHeight * 2)  // 中央の見える領域
  ctx.clip()
  // clip の外側は描画されないため、自然に上下が隠れる
```

### 揺らぎの実装

```typescript
// vibration エフェクトと同じ仕組み
const shakeIntensity = (1 - progress) * 5  // 覚醒に近づくと収束
const offsetX = Math.sin(progress * Math.PI * 12) * shakeIntensity
const offsetY = Math.cos(progress * Math.PI * 8) * shakeIntensity * 0.5
const scaleJitter = 1 + Math.sin(progress * Math.PI * 10) * 0.02 * (1 - progress)

ctx.translate(centerX + offsetX, centerY + offsetY)
ctx.scale(scaleJitter, scaleJitter)
```

### blur + brightness の実装

```typescript
// focusIn と同じ仕組みで blur + brightness を同時適用
const blurAmount = 20 * (1 - progress)  // 20px → 0px
const brightnessAmount = 0.2 + 0.8 * progress  // 0.2 → 1.0
ctx.filter = `blur(${blurAmount}px) brightness(${brightnessAmount})`
```

## 実装手順

### Step 1: エフェクト定義の追加
- `constants/transitionEffects.ts` に `awakeIn` / `awakeOut` を追加
- lucide-react から `Eye` / `EyeOff` アイコンをインポート

### Step 2: プレビュー描画の実装
- `APNGGenerator.tsx` の `drawPreviewFrame()` 内に `awakeIn` / `awakeOut` の分岐を追加
- Phase 1〜3 の進行度計算
- まぶた描画（3種類の shape 分岐）
- blur + brightness フィルター適用
- 揺らぎ translate/scale 適用

### Step 3: APNG生成描画の実装
- `generateFramesOnly()` 内にも同じロジックを追加
- プレビューとフレーム生成で描画結果が一致するように注意

### Step 4: エフェクトカタログページの更新
- `app/effects/page.tsx` に awakeIn / awakeOut の説明を追加

### Step 5: テスト・調整
- 各 shape オプションの見た目確認
- まばたき回数 1/2/3 の動作確認
- 揺らぎの振幅・周波数の微調整
- 退場 (awakeOut) の逆再生が自然か確認
- APNG 出力のサイズ・品質確認

## 既存エフェクトとの参照関係

| 参照先 | 流用する要素 |
|--------|-------------|
| `focusIn` / `focusOut` | `ctx.filter = 'blur()'` の使い方 |
| `irisIn` | shape オプション構造 (circle/square/diamond → flat/curved/slit) |
| `blindIn` | primary + secondary の2軸オプション構造 |
| `vibration` | sin/cos による位置揺らぎの計算 |
| `fadeIn` | globalAlpha / brightness の段階的変化 |

## 注意事項

- `ctx.filter` の `blur()` と `brightness()` はスペース区切りで同時指定可能
- まぶた描画は画像描画の **後** に重ねる（黒帯/曲線の場合）
- slit の場合は画像描画の **前** に clip を設定する
- awakeOut は awakeIn の progress を `1 - progress` に置き換えるだけで実現可能
- まばたきのタイミング計算は、Phase 2 の区間を回数で等分し、各区間内で sin カーブで開閉
