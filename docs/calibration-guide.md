# APNG Generator キャリブレーションガイド

## キャリブレーション用ログの追加方法

### 1. 推測精度ログを追加

`APNGGenerator.tsx` の圧縮採用ログ（`→ ${step.name}を採用`の後）に以下を追加：

```typescript
// キャリブレーション用: 推測精度ログ
const accuracy = (trySizeMB / estimatedMB * 100).toFixed(0)
console.log(`📊 推測精度: ${accuracy}% (${transition}) - 推測${estimatedMB.toFixed(2)}MB → 実際${trySizeMB.toFixed(2)}MB`)
```

### 2. 出力例
```
📊 推測精度: 90% (rgbShift) - 推測4.12MB → 実際3.85MB
```

---

## 係数更新手順

1. 複数のエフェクトで生成してログを確認
2. 精度%を記録（目標: 90-110%）
3. 新係数 = 現在係数 × (精度% / 100)
4. `EFFECT_DELTA_FACTORS` を更新

---

## EFFECT_DELTA_FACTORS の場所

`APNGGenerator.tsx` 内、約3838行目付近：

```typescript
const EFFECT_DELTA_FACTORS: Record<string, number> = {
    // 入退場エフェクト（V121.31: In/Out同期）
    fadeIn: 0.63, fadeOut: 0.63,
    // ... 他のエフェクト
}
```

---

## タイミングログ（オプション）

フレーム生成開始時:
```typescript
console.time('⏱フレーム生成')
```

フレーム生成終了時:
```typescript
console.timeEnd('⏱フレーム生成')
```

同様に `⏱初回エンコード`, `⏱圧縮リトライ`, `⏱総生成時間` も使用可能。
