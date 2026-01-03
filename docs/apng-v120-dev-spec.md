# V120 意見募集システム実装計画

## ゴール
V120に向けて、ユーザーが新機能（登場・退場エフェクト等）の要望や改善案を送れるフィードバック機能を実装します。送信された内容はDiscordのWebhookを通じて開発者に即時通知されるようにします。

## ユーザー確認事項
> [!IMPORTANT]
> **Discord Webhook URL**: DiscordサーバーでWebhookを作成し、環境変数 `DISCORD_WEBHOOK_URL` に設定していただく必要があります。
> **通知方法**: Botアカウント（トークン等が必要）ではなく、手軽なWebhook（URLのみで動作）を使用する方針で良いでしょうか？

## 変更内容

### バックエンド (Next.js API Route)
#### [NEW] [app/api/feedback/route.ts](file:///Users/air/projects/apng-generator/app/api/feedback/route.ts)
- POSTリクエストを処理するハンドラーを作成します。
- 受信データ:
    ```typescript
    type FeedbackType = 'bug' | 'feature' | 'impression';
    interface FeedbackRequest {
        type: FeedbackType;
        content: string;
        contact?: string; // 任意
        userAgent?: string; // ブラウザ情報（自動取得）
    }
    ```
- Discord Webhookへの送信フォーマットを工夫し、タイプごとに色を変えるなどして視認性を高めます（例：バグ=赤、要望=緑、感想=青）。

### フロントエンド (Components)
#### [NEW] [components/FeedbackModal.tsx](file:///Users/air/projects/apng-generator/components/FeedbackModal.tsx)
- モーダル内に以下のフォーム要素を配置します：
    1. **投稿タイプ（必須）**: ラジオボタンまたはセレクトボックス
        - 🐛 不具合報告 (Bug Fix)
        - ✨ 機能・エフェクト要望 (New Feature / Effect / UI)
        - 💭 感想・その他 (Impression - 優先度低)
    2. **内容（必須）**: テキストエリア（プレースホルダーで「XXのエフェクトが欲しい」「この画面のここが使いにくい」等の例示）
    3. **返信先（任意）**: メールアドレスやTwitter/Discord IDなど
- 送信中はローディング表示、送信後は「ありがとうございます！」のメッセージを表示し、数秒後に自動で閉じます。

### メイン UI
#### [MODIFY] [APNGGenerator.tsx](file:///Users/air/projects/apng-generator/APNGGenerator.tsx)
- 「意見を送る / エフェクト要望」ボタンを追加します（ヘッダーまたはフッターなど、目立つ場所に配置）。
- ユーザーのアクションを促すデザインにします。

### 環境設定
#### [MODIFY] [.env.local](file:///Users/air/projects/apng-generator/.env.local)
- `DISCORD_WEBHOOK_URL` を追加します。

## 検証計画
### 自動テスト
- 今回は外部API連携が主のため、特別な自動テストは作成しません。

### 手動検証
1. ダミーのWebhook URL（または実際のURL）を設定します。
2. フィードバックモーダルを開きます。
3. メッセージを入力して送信します。
4. Discordチャンネルにメッセージが届くことを確認します。
