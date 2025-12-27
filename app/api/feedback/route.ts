import { NextResponse } from 'next/server';

type FeedbackType = 'bug' | 'feature' | 'impression';

interface FeedbackRequest {
    type: FeedbackType;
    content: string;
    contact?: string;
    version?: string;
    wantsReply?: boolean;
}

export async function POST(request: Request) {
    try {
        const body: FeedbackRequest = await request.json();
        const { type, content, contact, version, wantsReply } = body;

        if (!type || !content) {
            return NextResponse.json(
                { error: 'Type and content are required' },
                { status: 400 }
            );
        }

        const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

        console.log('Webhook URL exists:', !!webhookUrl);
        console.log('Webhook URL length:', webhookUrl?.length || 0);

        if (!webhookUrl) {
            console.error('DISCORD_WEBHOOK_URL is not defined');
            return NextResponse.json(
                { error: 'フィードバック機能は現在利用できません。しばらくしてから再度お試しください。' },
                { status: 503 }
            );
        }

        // Color mapping for Discord Embeds
        const colors = {
            bug: 15158332,      // Red #E74C3C
            feature: 3066993,   // Green #2ECC71
            impression: 3447003, // Blue #3498DB
        };

        const typeEmoji = type === 'bug' ? '🐛' : type === 'feature' ? '✨' : '💭';
        const typeLabel = type === 'bug' ? '不具合報告' : type === 'feature' ? '機能・エフェクト要望' : '感想・その他';

        const titlePrefix = wantsReply ? '🔴【返信希望】' : '';
        const title = `${titlePrefix}${typeEmoji} ${typeLabel}`;

        const embed = {
            title,
            description: content,
            color: colors[type] || 3447003,
            timestamp: new Date().toISOString(),
            fields: [] as any[],
            footer: {
                text: `APNG Generator ${version || 'Feedback'}`,
            },
        };

        if (contact) {
            embed.fields.push({
                name: 'Contact',
                value: contact,
                inline: true,
            });
        }

        // Add User Agent info if available (header)
        const userAgent = request.headers.get('user-agent');
        if (userAgent) {
            embed.fields.push({
                name: 'User Agent',
                value: userAgent,
                inline: false, // User Agent is long, so not inline
            });
        }

        const discordBody = {
            embeds: [embed],
        };

        const discordResponse = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(discordBody),
        });

        console.log('Discord API Response Status:', discordResponse.status);

        if (!discordResponse.ok) {
            const errorText = await discordResponse.text();
            console.error('Discord API Error Response:', errorText);
            throw new Error(`Discord API responded with ${discordResponse.status}: ${errorText}`);
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Feedback submission error:', error);

        // ネットワークエラーの詳細を判定
        let errorMessage = 'Failed to submit feedback';

        if (error instanceof Error) {
            if (error.message.includes('getaddrinfo') || error.message.includes('ENOTFOUND') || error.message.includes('EAI_AGAIN')) {
                errorMessage = 'ネットワークエラー: Discord APIに接続できませんでした。インターネット接続を確認してください。';
            } else if (error.message.includes('fetch failed')) {
                errorMessage = 'Discord APIへのリクエストが失敗しました。しばらく待ってから再度お試しください。';
            } else {
                errorMessage = `エラー: ${error.message}`;
            }
        }

        return NextResponse.json(
            { error: errorMessage },
            { status: 500 }
        );
    }
}
