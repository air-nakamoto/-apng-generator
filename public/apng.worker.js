// APNG Encoding Web Worker
// UPNGライブラリを使用してAPNGエンコードを行う

// Worker環境ではwindowが存在しないため、selfをwindowとして定義
self.window = self;

// pakoを先に読み込む（UPNGが依存）
importScripts('/pako.min.js');
importScripts('/upng.custom.js');

self.onmessage = function (e) {
    const { type, payload } = e.data;

    if (type === 'encode') {
        try {
            const { frames, width, height, colorNum, delays, loop, forceFullCanvasLastFrame } = payload;

            // 進捗通知（エンコード開始）
            self.postMessage({ type: 'progress', payload: { stage: 'encoding', progress: 0.9 } });

            if (typeof UPNG !== 'undefined') {
                UPNG.forceFullCanvasLastFrame = !!forceFullCanvasLastFrame;
            }
            // UPNG.encodeでAPNGを生成
            const apngBuffer = UPNG.encode(frames, width, height, colorNum, delays, { loop: loop });
            if (typeof UPNG !== 'undefined') {
                UPNG.forceFullCanvasLastFrame = false;
            }

            // 進捗通知（完了）
            self.postMessage({ type: 'progress', payload: { stage: 'complete', progress: 1 } });

            // 結果を返送（Transferableで効率的に転送）
            self.postMessage(
                { type: 'complete', payload: { apngBuffer, sizeMB: apngBuffer.byteLength / 1024 / 1024 } },
                [apngBuffer]
            );
        } catch (error) {
            self.postMessage({ type: 'error', payload: { message: error.message || String(error) } });
        }
    }
};
