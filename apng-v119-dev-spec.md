# 📋 V119実装指示書

## バージョン情報
- **バージョン**: V119
- **ベース**: V118（エフェクトオプション拡張版）
- **テーマ**: APNG圧縮機能の改善（ココフォリア互換）

---

## 🎯 実装内容サマリー

### A. 圧縮ロジックの改善（3項目）
1. 実サイズ測定後の再調整ループ
2. UPNG.js色数最適化の活用
3. 圧縮率を考慮した推定式の改善

### B. UI改善（3項目）
1. 生成後の実サイズ表示
2. 圧縮進捗ステータス表示
3. ヘッダーレイアウトのコンパクト化（実装済み）

### C. 新規エフェクト追加（1項目）
1. シルエット化（silhouette）エフェクト
   - カラーオプション: 白 / 黒 / 赤 / 縁取り

---

## 📝 詳細仕様

### A-1. 実サイズ測定後の再調整ループ

#### 現在の問題
```typescript
// 現在の実装：非圧縮サイズで推定（実際のAPNGサイズと大きく異なる）
const estimatedSize = (scaledWidth * scaledHeight * 4 * frameCount) / (1024 * 1024)
```

#### 改善後のロジック
```typescript
const generateAPNG = async () => {
    let scaleFactor = 1
    let attempts = 0
    const maxAttempts = 5
    
    while (attempts < maxAttempts) {
        // APNGを生成
        const apng = UPNG.encode(frames, width, height, colorDepth, delays)
        const blob = new Blob([apng], { type: 'image/png' })
        const actualSizeMB = blob.size / (1024 * 1024)
        
        // 目標サイズ以下なら終了
        if (sizeLimit === null || actualSizeMB <= sizeLimit) {
            return blob
        }
        
        // 目標を超えている場合、スケールを10%縮小して再試行
        scaleFactor *= 0.9
        attempts++
        
        // 進捗表示を更新
        setCompressionStatus(`圧縮中... (${attempts}/${maxAttempts}) ${actualSizeMB.toFixed(2)}MB → 目標${sizeLimit}MB`)
    }
    
    // 最大試行回数に達した場合は最後の結果を返す
    return blob
}
```

#### 仕様
- 最大試行回数: 5回
- 縮小率: 毎回10%縮小（scaleFactor *= 0.9）
- 終了条件: 実サイズ ≤ 目標サイズ または 最大試行回数

---

### A-2. UPNG.js色数最適化の活用

#### 現在の実装
```typescript
// 色数制限なし（0 = フルカラー）
const apng = UPNG.encode(frames, width, height, 0, delays)
```

#### 改善後の実装
```typescript
// 目標サイズに応じて色数を調整
const getOptimalColorDepth = (sizeLimit: number | null): number => {
    if (sizeLimit === null) return 0 // 制限なし = フルカラー
    if (sizeLimit <= 1) return 64    // 1MB以下 = 64色
    if (sizeLimit <= 5) return 128   // 5MB以下 = 128色
    return 256                        // 10MB以下 = 256色
}

const colorDepth = getOptimalColorDepth(sizeLimit)
const apng = UPNG.encode(frames, width, height, colorDepth, delays)
```

#### 仕様
| 目標サイズ | 色数 | 備考 |
|-----------|------|-----|
| 制限なし | 0（フルカラー） | 最高画質 |
| 10MB | 256色 | 高画質 |
| 5MB | 128色 | 中画質 |
| 1MB | 64色 | 軽量優先 |

---

### A-3. 圧縮率を考慮した推定式の改善

#### 現在の推定式
```typescript
// 非圧縮サイズ（実際の3〜10倍の誤差）
const estimatedSize = (width * height * 4 * frameCount) / (1024 * 1024)
```

#### 改善後の推定式
```typescript
// PNG圧縮率を考慮（経験的に0.2〜0.4程度）
const compressionRatio = 0.3 // 30%程度に圧縮される想定
const estimatedSize = (width * height * 4 * frameCount * compressionRatio) / (1024 * 1024)
```

---

### B-1. 生成後の実サイズ表示

#### UI追加
```tsx
{generatedSize !== null && (
    <p className="text-sm text-green-600 mt-2">
        ✅ 生成完了: {generatedSize.toFixed(2)} MB
        {sizeLimit && generatedSize <= sizeLimit && (
            <span className="ml-2">（目標{sizeLimit}MB達成）</span>
        )}
    </p>
)}
```

#### State追加
```typescript
const [generatedSize, setGeneratedSize] = useState<number | null>(null)
```

---

### B-2. 圧縮進捗ステータス表示

#### UI追加
```tsx
{compressionStatus && (
    <p className="text-sm text-blue-600 mt-2">
        🔄 {compressionStatus}
    </p>
)}
```

#### State追加
```typescript
const [compressionStatus, setCompressionStatus] = useState<string | null>(null)
```

---

### C-1. シルエット化（silhouette）エフェクト

#### 概要
画像を単色のシルエットに変化させる演出エフェクト

#### カラーオプション
| オプション | 効果 |
|-----------|------|
| `white` | 白色シルエット |
| `black` | 黒色シルエット |
| `red` | 赤色シルエット |
| `outline` | 縁取りのみ（中は透明） |

#### 実装方針
```typescript
case 'silhouette': {
    drawScaledImage(0, 0, canvas.width, canvas.height)
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data
    
    // シルエットの色を決定
    const colors = {
        white: [255, 255, 255],
        black: [0, 0, 0],
        red: [255, 0, 0],
    }
    const [r, g, b] = colors[effectOption] || colors.black
    
    // 不透明ピクセルを単色に変換
    for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] > 0) { // 不透明なら
            data[i] = r
            data[i + 1] = g
            data[i + 2] = b
            // アルファは維持
        }
    }
    
    ctx.putImageData(imageData, 0, 0)
    break
}
```

#### transitionEffects.ts への追加
```typescript
{
    name: 'silhouette',
    label: 'シルエット',
    icon: UserRound, // または適切なアイコン
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
}
```

---

## 🔧 ファイル変更一覧

### 変更するファイル（1ファイル）

**APNGGenerator.tsx**
- State追加: `generatedSize`, `compressionStatus`
- 関数変更: `generateAPNG`（再調整ループ追加）
- 関数追加: `getOptimalColorDepth`
- UI変更: 圧縮ステータス、実サイズ表示追加

---

## ✅ テスト項目

### A. 圧縮ロジック
- [ ] 1MB制限で1MB以下のAPNGが生成されるか
- [ ] 5MB制限で5MB以下のAPNGが生成されるか
- [ ] 10MB制限で10MB以下のAPNGが生成されるか
- [ ] 制限なしでフルカラーAPNGが生成されるか
- [ ] 大きな画像（4000x4000等）でも正常に圧縮されるか

### B. UI
- [ ] 圧縮中のステータスが表示されるか
- [ ] 生成後の実サイズが表示されるか
- [ ] 目標達成時にメッセージが表示されるか

### C. ビルド
- [ ] `npm run build` が成功するか
- [ ] TypeScriptエラーがないか

---

## 📊 期待される結果

| 項目 | V118 | V119 |
|------|------|------|
| 圧縮精度 | 推定値（誤差大） | 実測値（正確） |
| 色数最適化 | なし | あり（64/128/256色） |
| 再調整 | なし | 最大5回自動リトライ |
| ステータス表示 | なし | 圧縮中/完了表示 |
