# APNG Generator V120 修正計画書

## 📋 概要
APNG Generator V120の全体的な改善計画。実装済み機能と今後の修正予定をまとめる。

---

## ✅ 実装済み機能（V120 リリース済み）

### 機能改善
- [x] 再生スピード変更時にプレビュー自動再生
- [x] トランジションごとに再生スピードを記憶（`speedSettingsPerEffect`）
- [x] `playbackSpeedRef`による即時反映対応
- [x] 生成パフォーマンス向上（5フレームごとにUI更新）

### UI/UX改善
- [x] ロゴとサブタイトルの位置バランス調整
- [x] サブタイトルをタイトルロゴに近づけ（`-mt-5`）
- [x] ロゴセクションとカードの間に適切な余白を追加
- [x] 容量制限ボタンのサイズ拡大
- [x] クイックガイドポップオーバー改善
  - タイトル: 「使い方（クイックガイド）」
  - ステップ題目を大きく（`text-base font-semibold`）
  - 詳細マニュアルリンクをボタン風に
- [x] 生成中メッセージ更新（進捗パーセント表示）
- [x] 注意書き更新（「意見を送る」リンク化）
- [x] フッター余白追加

### インフラ・デプロイ
- [x] Discord Webhook環境変数設定（ローカル・Vercel本番）
- [x] `apng-generator-tan.vercel.app`へのデプロイ
- [x] フィードバック送信機能の動作確認

---

## 🔧 修正予定（Phase 0: 最優先）

### マニュアル修正

#### 1. 容量制限の表記修正
**修正箇所:**
- 推奨設定テーブル（line 448-450）
- FAQ「画質が悪い」（line 525-528）

**修正内容:**
| 用途 | 修正前 | 修正後 |
|------|--------|--------|
| キャラクター/前景/背景 | 1MB未満推奨 | 5MB以下 |
| スクリーン/マーカーパネル | - | 1MB未満 |

#### 2. 非ループAPNG再生問題の説明修正
**問題:**
現状の「NOIMAGEを試してみる」という説明が曖昧で不正確

**正しい説明:**
```
【問題】
非ループAPNGは、ココフォリアで初回しか再生されない

【原因】
ブラウザのキャッシュにより、同じ画像は再ダウンロードされず、
アニメーションが最初のフレームで止まった状態で表示される

【対処法】
1. 一度「NOIMAGE」に設定してから、再度APNGを設定する
2. ブラウザの強制リロード（Ctrl+F5 / Cmd+Shift+R）

【推奨】
カットインなど繰り返し再生が必要な場合は「ループ：ON」を推奨
```

**参考リソース:**
- FANBOX記事: https://shuarts-arca.fanbox.cc/posts/7176828
- YouTube動画: https://www.youtube.com/watch?v=lDUeTQy2X_0

---

### ファビコン・OGP設定 ✅ 完了

#### ファビコン
- [x] favicon-512.png（512x512）
- [x] apple-touch-icon.png（512x512）
- [x] favicon.svg（SVGファビコン）

#### OGP画像
- [x] og-image.png（1200x630）
- [x] Twitter Card設定
- [x] app/layout.tsx に metadata 追加

**必要なmetadata:**
```tsx
export const metadata: Metadata = {
  title: 'APNG Generator - アニメーションPNG作成ツール',
  description: '画像からトランジション効果付きのアニメーションPNG作成ツール',
  openGraph: {
    title: 'APNG Generator',
    description: '画像からトランジション効果付きのアニメーションPNG作成ツール',
    images: ['/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'APNG Generator',
    description: '画像からトランジション効果付きのアニメーションPNG作成ツール',
    images: ['/og-image.png'],
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
}
```

---

## 📸 マニュアル改善（Phase 1-5）

### Phase 1: スクリーンショット作成
- [ ] Step 1: 画像アップロード画面
- [ ] Step 2: トランジション選択画面（登場・退場・演出）
- [ ] Step 2: 効果オプション設定画面
- [ ] Step 2: 共通設定画面
- [ ] Step 3: プレビュー＆生成画面
- [ ] ココフォリア関連画像（5枚）

### Phase 2: エフェクト一覧ページ
- [ ] 登場エフェクト一覧と説明
- [ ] 退場エフェクト一覧と説明
- [ ] 演出エフェクト一覧と説明
- [ ] 各エフェクトのプレビューGIF

### Phase 3: コンテンツ簡潔化
- [ ] ステップ説明を短く要約
- [ ] 「詳細を見る」展開形式
- [ ] 重要ポイントのハイライト

### Phase 4: FAQ強化
- [ ] カテゴリ分け
- [ ] 検索機能
- [ ] よくある問題のトップ表示

### Phase 5: UI/UX改善
- [ ] モバイル対応強化
- [ ] ナビゲーション改善

---

## 📁 ファイル構成

```
/app/
  layout.tsx          # metadata設定追加
  manual/
    page.tsx          # マニュアル修正

/public/
  favicon.ico         # ファビコン
  apple-touch-icon.png
  og-image.png        # OGP画像
  manual/
    step1_upload.png
    step2_*.png
    step3_generate.png
    effect_*.gif
    cocofolia_*.png
```

---

## 🗓️ スケジュール

| 優先度 | タスク | 状態 |
|--------|--------|------|
| 最優先 | 容量制限の表記修正 | 📋 予定 |
| 最優先 | 非ループAPNG説明修正 | 📋 予定 |
| 最優先 | ファビコン設定 | 📋 予定 |
| 最優先 | OGP画像設定 | 📋 予定 |
| 高 | スクリーンショット作成 | 📋 予定 |
| 高 | エフェクト一覧ページ | 📋 予定 |
| 中 | コンテンツ簡潔化 | 📋 予定 |
| 中 | FAQ強化 | 📋 予定 |
| 低 | UI/UX改善 | 📋 予定 |

---

## 📝 備考
- ブランチ: `feature/manual-improvement`
- 参考リソース確認済み
- デプロイ先: https://apng-generator-tan.vercel.app/
