# APNG Generator V120 リリースノート

**リリース日:** 2025年12月26日  
**前バージョン:** V113 → **新バージョン:** V120

---

## 📋 概要

V113からV120への大型アップデートです。マニュアルの全面改善、新機能追加、UI/UX向上、SEO対応など、多岐にわたる改善を行いました。

**変更規模:**
- コミット数: 61件
- 追加行数: 約5,700行
- 新規画像: 40枚以上

---

## 🆕 新機能

### エフェクト関連
| 機能 | 説明 |
|-----|------|
| **エフェクト一覧ページ** | `/effects` に全エフェクトのカタログページを新設 |
| **透過エフェクト対応** | 背景透過画像でのエフェクト生成に対応 |

### 再生・生成機能
| 機能 | 説明 |
|-----|------|
| **再生スピード記憶** | トランジションごとに再生スピードを記憶 |
| **自動プレビュー再生** | スピード変更時に自動で再生開始 |
| **生成パフォーマンス向上** | 5フレームごとにUI更新で高速化 |
| **進捗表示改善** | 生成中にパーセント表示 |

---

## 📖 マニュアル改善（大幅更新）

### 構成の見直し
| 項目 | 変更内容 |
|-----|---------|
| **ステップ構成** | 複雑な説明 → 3ステップに簡潔化 |
| **詳細表示** | 折りたたみ式「詳細を見る」形式に |
| **FAQ** | 11項目 → 4カテゴリに再編成 |
| **ナビゲーション** | 目次へ戻るリンク、セクション内クイックナビ追加 |

### スクリーンショット追加（40枚以上）
| セクション | 追加画像 |
|-----------|---------|
| **Step 1** | 画像アップロード画面 |
| **Step 2** | 登場・退場・演出タブ、効果オプション、共通設定 |
| **Step 3** | 生成ボタン、生成中、完了画面 |
| **前景・背景** | 右クリックメニュー、画像選択、レイヤー説明図 |
| **スクリーン/マーカー** | ボタンクリック、パネル選択（4枚グリッド） |
| **カットイン** | 新規作成〜完成（4枚グリッド）、Chatパレット連携（3枚） |
| **立ち絵** | 一覧〜完成（4枚グリッド）、差分設定・使用（2枚） |

### ココフォリア使い方セクション
| 項目 | 追加内容 |
|-----|---------|
| **前景・背景** | レイヤー構造の図解、ループ設定の説明 |
| **スクリーン/マーカー** | 制限事項比較表、4ステップ画像ガイド |
| **カットイン** | 設定手順5ステップ、呼び出し方法、@マーク・Chatパレット連携Tips |
| **立ち絵** | シートサイト有無の2パターン分岐、差分設定の補足 |

---

## 🎨 UI/UX改善

### ヘッダー・レイアウト
| 項目 | 変更内容 |
|-----|---------|
| **ロゴ** | タイトルとサブタイトルの位置バランス調整 |
| **ヘッダー余白** | 上部スペースを削減 |
| **フッター** | 余白追加 |

### コントロール
| 項目 | 変更内容 |
|-----|---------|
| **容量制限ボタン** | サイズ拡大、視認性向上 |
| **共通設定エリア** | iOSスタイルの横並びレイアウト |
| **クイックガイド** | タイトル・ステップ題目のデザイン改善 |

### アイコン
| 項目 | 変更内容 |
|-----|---------|
| **統一** | 全体をlucide-reactアイコンに統一 |
| **ループボタン** | 絵文字 → lucide-reactアイコンに変更 |

---

## 🌐 SEO・メタデータ

### ファビコン
| ファイル | サイズ |
|---------|--------|
| `favicon.svg` | SVGファビコン |
| `favicon-512.png` | 512x512 |
| `apple-touch-icon.png` | 512x512 |

### OGP（Open Graph Protocol）
| 設定 | 内容 |
|-----|------|
| `og-image.png` | 1200x630 |
| Twitter Card | summary_large_image |
| メタデータ | title, description設定済み |

---

## 🔧 バグ修正

| 問題 | 修正内容 |
|-----|---------|
| **ループなし表示** | 終了時にエフェクト完成状態を表示するよう修正 |
| **プレビューループ** | ループなし選択時にプレビューがループし続ける不具合を修正 |

---

## 📁 新規ファイル一覧

### ページ
- `app/effects/page.tsx` - エフェクト一覧ページ

### 画像（public/manual/）
```
cocofolia_character_complete.png
cocofolia_character_edit_icon.jpg
cocofolia_character_list.png
cocofolia_character_list_button.jpg
cocofolia_character_sabun_setting.png
cocofolia_character_sabun_use.png
cocofolia_character_upload.jpg
cocofolia_character_upload.png
cocofolia_chatpalette_register.png
cocofolia_chatpalette_send.png
cocofolia_chatpalette_use.png
cocofolia_cutin_button.jpg
cocofolia_cutin_complete.jpg
cocofolia_cutin_neweffect.jpg
cocofolia_cutin_noimage.jpg
cocofolia_marker_panel_button.jpg
cocofolia_marker_panel_select.jpg
cocofolia_rightclick_menu.png
cocofolia_screen_panel_button.jpg
cocofolia_screen_panel_select.jpg
cocofolia_select_image.png
foreground_background_explanation.png
step1_upload.png
step2_common_settings.png
step2_effect_options.png
step2_transition_entrance.png
step2_transition_exit.png
step2_transition_performance.png
step3_complete.png
step3_generate.png
step3_generate_button.png
step3_generating.png
```

### その他
- `public/og-image.png` - OGP画像
- `public/favicon.svg` - SVGファビコン
- `public/apple-touch-icon.png` - Appleタッチアイコン
- `public/favicon-512.png` - 512pxファビコン

---

## 🔗 関連リンク

- **本番URL:** https://apng-generator-tan.vercel.app/
- **マニュアル:** https://apng-generator-tan.vercel.app/manual
- **エフェクト一覧:** https://apng-generator-tan.vercel.app/effects

---

## 📝 備考

- 開発ブランチ: `feature/manual-improvement`
- コミット範囲: `ab939f1e` (V113) → `1f6175fa` (V120)
