"use client"

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Settings, Upload, Info, Play, Pause, Download, Repeat, ArrowRightToLine, MessageSquare } from 'lucide-react'
import * as Popover from '@radix-ui/react-popover'
import { TransitionEffectsSelector } from './components/TransitionEffectsSelector'
import { FeedbackModal } from './components/FeedbackModal'
import { findEffectByName, findCategoryByEffectName } from './constants/transitionEffects'

// @ts-ignore
import UPNG from 'upng-js'

/**
 * APNGのacTLチャンクのnum_playsを修正する
 * UPNGは常にnum_plays=0（無限ループ）でエンコードするため、
 * ループなしの場合はバイナリを直接修正する必要がある
 * @param apngData - UPNG.encodeで生成されたArrayBuffer
 * @param numPlays - 再生回数（0=無限、1=1回のみ、など）
 * @returns 修正されたArrayBuffer
 */
function setApngLoopCount(apngData: ArrayBuffer, numPlays: number): ArrayBuffer {
    const data = new Uint8Array(apngData)

    // acTLチャンクを探す（'acTL' = 0x61, 0x63, 0x54, 0x4C）
    for (let i = 8; i < data.length - 12; i++) {
        if (data[i] === 0x61 && data[i + 1] === 0x63 &&
            data[i + 2] === 0x54 && data[i + 3] === 0x4C) {
            // acTLチャンク発見: チャンクタイプの後にnum_frames(4bytes)とnum_plays(4bytes)
            // num_playsはオフセット i+8 から i+11 (4バイト、ビッグエンディアン)
            const numPlaysOffset = i + 8
            data[numPlaysOffset] = (numPlays >> 24) & 0xFF
            data[numPlaysOffset + 1] = (numPlays >> 16) & 0xFF
            data[numPlaysOffset + 2] = (numPlays >> 8) & 0xFF
            data[numPlaysOffset + 3] = numPlays & 0xFF

            // CRCを再計算（チャンクタイプ + データ）
            // acTLのデータ長は8バイト
            const crcStart = i  // チャンクタイプの開始位置
            const crcData = data.slice(crcStart, crcStart + 12)  // 'acTL' + 8バイトデータ
            const crc = calculateCRC32(crcData)

            // CRCを書き込み（データの直後）
            const crcOffset = crcStart + 12
            data[crcOffset] = (crc >> 24) & 0xFF
            data[crcOffset + 1] = (crc >> 16) & 0xFF
            data[crcOffset + 2] = (crc >> 8) & 0xFF
            data[crcOffset + 3] = crc & 0xFF

            console.log(`acTLチャンクを修正: num_plays=${numPlays}`)
            break
        }
    }

    return data.buffer
}

/**
 * CRC32を計算する（PNG仕様準拠）
 */
function calculateCRC32(data: Uint8Array): number {
    // CRC32テーブル（PNG/zlib標準）
    const crcTable: number[] = []
    for (let n = 0; n < 256; n++) {
        let c = n
        for (let k = 0; k < 8; k++) {
            c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1))
        }
        crcTable[n] = c
    }

    let crc = 0xFFFFFFFF
    for (let i = 0; i < data.length; i++) {
        crc = crcTable[(crc ^ data[i]) & 0xFF] ^ (crc >>> 8)
    }
    return (crc ^ 0xFFFFFFFF) >>> 0
}

/**
 * Web Workerを使ってAPNGをエンコードする（UIブロック防止）
 * V121.20: 汎用関数として抽出し、リトライ時にも使用可能に
 */
interface EncodeParams {
    frames: ArrayBuffer[]
    width: number
    height: number
    colorNum: number
    delays: number[]
    loop: number
    onProgress?: (progress: number) => void
}

async function encodeApngWithWorker(params: EncodeParams): Promise<ArrayBuffer> {
    const { frames, width, height, colorNum, delays, loop, onProgress } = params

    return new Promise((resolve, reject) => {
        const worker = new Worker('/apng.worker.js')

        worker.onmessage = (e) => {
            const { type, payload } = e.data
            if (type === 'progress') {
                onProgress?.(payload.progress)
            } else if (type === 'complete') {
                worker.terminate()
                resolve(payload.apngBuffer)
            } else if (type === 'error') {
                worker.terminate()
                reject(new Error(payload.message))
            }
        }

        worker.onerror = (error) => {
            worker.terminate()
            reject(new Error(`Worker error: ${error.message}`))
        }

        // ArrayBufferをWorkerに転送（Transferable）
        const transferableFrames = frames.map(f => f.slice(0))
        worker.postMessage(
            {
                type: 'encode',
                payload: {
                    frames: transferableFrames,
                    width,
                    height,
                    colorNum,
                    delays,
                    loop
                }
            },
            transferableFrames
        )
    })
}

// タイル効果用のランダム順序（プレビュー・生成共通）
const tileOrders: { [key: number]: number[] } = {
    4: [0, 3, 1, 2],
    9: [4, 0, 8, 2, 6, 1, 5, 3, 7],
    16: [7, 10, 1, 14, 4, 11, 2, 13, 8, 5, 15, 0, 9, 6, 3, 12]
}


const DoorOpenPreview: React.FC<{ src: string; progress: number }> = ({ src, progress }) => {
    const doorProgress = Math.min(progress * 2, 1)
    return (
        <div className="relative w-full h-full overflow-hidden">
            <div
                className="absolute top-0 left-0 w-1/2 h-full bg-cover transition-transform duration-300 ease-out"
                style={{
                    backgroundImage: `url(${src})`,
                    backgroundPosition: 'left',
                    transform: `translateX(${-doorProgress * 100}%)`,
                }}
            />
            <div
                className="absolute top-0 right-0 w-1/2 h-full bg-cover transition-transform duration-300 ease-out"
                style={{
                    backgroundImage: `url(${src})`,
                    backgroundPosition: 'right',
                    transform: `translateX(${doorProgress * 100}%)`,
                }}
            />
        </div>
    )
}

const DoorClosePreview: React.FC<{ src: string; progress: number }> = ({ src, progress }) => {
    return (
        <div className="relative w-full h-full overflow-hidden">
            {/* 左扉: 左外から中央へ */}
            <div
                className="absolute top-0 left-0 w-1/2 h-full bg-cover transition-transform duration-100 ease-out"
                style={{
                    backgroundImage: `url(${src})`,
                    backgroundPosition: 'left',
                    transform: `translateX(${(1 - progress) * -100}%)`,
                }}
            />
            {/* 右扉: 右外から中央へ */}
            <div
                className="absolute top-0 right-0 w-1/2 h-full bg-cover transition-transform duration-100 ease-out"
                style={{
                    backgroundImage: `url(${src})`,
                    backgroundPosition: 'right',
                    transform: `translateX(${(1 - progress) * 100}%)`,
                }}
            />
        </div>
    )
}

export default function APNGGenerator() {
    const [sourceImage, setSourceImage] = useState<HTMLImageElement | null>(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [fps, setFps] = useState(20)
    const [transition, setTransition] = useState('fadeIn')
    const [effectDirection, setEffectDirection] = useState<string>('right')
    const [isLooping, setIsLooping] = useState(false)
    const [loopSettingsPerEffect, setLoopSettingsPerEffect] = useState<Record<string, boolean>>({}) // エフェクトごとのループ設定記憶
    // V118: 新規ステート
    const [playbackSpeed, setPlaybackSpeed] = useState(1.0)
    const [speedSettingsPerEffect, setSpeedSettingsPerEffect] = useState<Record<string, number>>({}) // エフェクトごとの再生スピード記憶
    const [sizeLimit, setSizeLimit] = useState<number | null>(null)  // null=制限なし, 1/5/10=MB制限
    const [effectOption, setEffectOption] = useState<string>('medium')
    const [effectIntensity, setEffectIntensity] = useState<string>('medium')
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [previewProgress, setPreviewProgress] = useState(0)
    const animationRef = useRef<number | null>(null)
    const isLoopingRef = useRef<boolean>(false)
    const playbackSpeedRef = useRef<number>(1.0)
    const [error, setError] = useState<string | null>(null)
    const [generationProgress, setGenerationProgress] = useState(0)
    const [generationPhase, setGenerationPhase] = useState<'idle' | 'measuring' | 'generating' | 'encoding' | 'optimizing' | 'completing'>('idle')
    const [imageSize, setImageSize] = useState<{ width: number; height: number } | null>(null)
    const [estimatedSize, setEstimatedSize] = useState<number | null>(null)
    // adjustToOneMB は sizeLimit に置換されたため削除
    const [generationState, setGenerationState] = useState<'idle' | 'generating' | 'completed'>('idle');
    const fileInputRef = useRef<HTMLInputElement>(null)
    const previewContainerRef = useRef<HTMLDivElement>(null)
    const previewCanvasRef = useRef<HTMLCanvasElement>(null)
    const [optimizedSize, setOptimizedSize] = useState<{ width: number; height: number } | null>(null)
    const [compressionInfo, setCompressionInfo] = useState<{ colorNum: number; estimatedMB: number; actualMB?: number } | null>(null)
    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false)



    const getFrameCount = () => Math.floor(fps)

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement> | React.DragEvent<HTMLDivElement>) => {
        try {
            let file: File | null = null;
            if (event.type === "drop") {
                const droppedFile = (event as React.DragEvent<HTMLDivElement>).dataTransfer.files[0];
                if (droppedFile && droppedFile.type.startsWith('image/')) {
                    file = droppedFile;
                }
            } else {
                file = (event.target as HTMLInputElement).files?.[0] || null;
            }

            if (file) {
                console.log('File selected:', file.name, file.type, file.size)
                const reader = new FileReader()
                reader.onload = (e) => {
                    const img = new Image()
                    img.onload = () => {
                        setSourceImage(img)
                        setImageSize({ width: img.width, height: img.height })
                        setError(null)
                        setOptimizedSize(null)
                        setCompressionInfo(null)
                        estimateAPNGSize(img.width, img.height)
                    }
                    img.onerror = (imgError) => {
                        console.error('Image loading failed:', imgError)
                        setError('画像の読み込みに失敗しました。別の画像を試してください。')
                    }
                    img.src = e.target?.result as string
                }
                reader.onerror = (readerError) => {
                    console.error('File reading failed:', readerError)
                    setError(`ファイルの読み込みに失敗しました。別のファイルを試してください。エラー: ${readerError}`)
                }
                reader.readAsDataURL(file)
            } else {
                setError('ファイルが選択されていません。')
            }
        } catch (error) {
            console.error('File upload error:', error)
            setError(`ファイルアップロード中にエラーが発生しました: ${error instanceof Error ? error.message : String(error)}`)
        }
    }

    const estimateAPNGSize = (width: number, height: number) => {
        try {
            const frameCount = getFrameCount()
            const estimatedBytes = width * height * 4 * frameCount // Assuming 4 bytes per pixel (RGBA)
            setEstimatedSize(estimatedBytes / (1024 * 1024)) // Convert to MB
        } catch (error) {
            console.error('Error estimating APNG size:', error)
            setError(`APNG サイズの推定中にエラーが発生しました: ${error instanceof Error ? error.message : String(error)}`)
        }
    }

    const stopPreview = () => {
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current)
            animationRef.current = null
        }
        setIsPlaying(false)
        // progress=1 で終了状態を表示（線などのアーティファクト防止）
        setPreviewProgress(1)
    }

    const startPreview = () => {
        if (!sourceImage) {
            setError('画像が選択されていません。画像を選択してからプレビューを開始してください。')
            return
        }

        if (animationRef.current) cancelAnimationFrame(animationRef.current)

        try {
            setIsPlaying(true)
            setError(null)
            let startTime: number | null = null
            const duration = 1000 / playbackSpeedRef.current // V118: 再生スピード対応（useRefで最新値を参照）

            const animate = (timestamp: number) => {
                if (!startTime) startTime = timestamp
                const elapsedTime = timestamp - startTime
                const progress = elapsedTime / duration

                if (isLoopingRef.current) {
                    setPreviewProgress(progress % 1)
                    animationRef.current = requestAnimationFrame(animate)
                } else {
                    if (progress < 1) {
                        setPreviewProgress(progress)
                        animationRef.current = requestAnimationFrame(animate)
                    } else {
                        // アニメーション終了後はエフェクトの完成状態を表示するためprogress=1に
                        setPreviewProgress(1)
                        setIsPlaying(false)
                    }
                }
            }

            animationRef.current = requestAnimationFrame(animate)
        } catch (error) {
            console.error('プレビュー開始中にエラーが発生しました:', error)
            setError(`プレビュー開始中にエラーが発生しました: ${error instanceof Error ? error.message : String(error)}`)
            setIsPlaying(false)
        }
    }

    const handlePreview = () => {
        if (isPlaying) {
            stopPreview()
        } else {
            startPreview()
        }
    }

    // Canvas プレビュー描画関数（生成ロジックと同一）
    const drawPreviewFrame = useCallback((progress: number) => {
        if (!sourceImage || !previewCanvasRef.current || !previewContainerRef.current) return

        const canvas = previewCanvasRef.current
        const ctx = canvas.getContext('2d', { willReadFrequently: true })
        if (!ctx) return

        // プレビューサイズを計算（コンテナに収まる最大サイズ）
        const containerRect = previewContainerRef.current.getBoundingClientRect()
        const containerAspectRatio = containerRect.width / containerRect.height
        const imageAspectRatio = sourceImage.width / sourceImage.height

        let canvasWidth, canvasHeight
        if (containerAspectRatio > imageAspectRatio) {
            // コンテナが横長 → 高さに合わせる
            canvasHeight = containerRect.height * 0.9  // 90%で余白確保
            canvasWidth = canvasHeight * imageAspectRatio
        } else {
            // コンテナが縦長 → 幅に合わせる
            canvasWidth = containerRect.width * 0.9  // 90%で余白確保
            canvasHeight = canvasWidth / imageAspectRatio
        }

        // キャンバスサイズを設定
        if (canvas.width !== Math.floor(canvasWidth) || canvas.height !== Math.floor(canvasHeight)) {
            canvas.width = Math.floor(canvasWidth)
            canvas.height = Math.floor(canvasHeight)
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height)

        // 生成と同じ描画ロジック
        const drawScaledImage = (x: number, y: number, width: number, height: number) => {
            ctx.drawImage(sourceImage, 0, 0, sourceImage.width, sourceImage.height, x, y, width, height)
        }

        switch (transition) {
            case 'fadeIn':
                ctx.globalAlpha = progress
                drawScaledImage(0, 0, canvas.width, canvas.height)
                ctx.globalAlpha = 1
                break
            case 'fadeOut':
                if (effectIntensity !== 'none' || effectOption !== 'none') {
                    if (progress >= 0.95) break // 最終フレームは完全透明（効果のみ以外）
                }
                ctx.globalAlpha = 1 - progress
                drawScaledImage(0, 0, canvas.width, canvas.height)
                ctx.globalAlpha = 1
                break
            case 'slideIn':
                switch (effectDirection) {
                    case 'left':
                        ctx.drawImage(sourceImage, (1 - progress) * canvas.width, 0, canvas.width, canvas.height)
                        break
                    case 'right':
                        ctx.drawImage(sourceImage, (1 - progress) * -canvas.width, 0, canvas.width, canvas.height)
                        break
                    case 'up':
                        ctx.drawImage(sourceImage, 0, (1 - progress) * canvas.height, canvas.width, canvas.height)
                        break
                    case 'down':
                    default:
                        ctx.drawImage(sourceImage, 0, (1 - progress) * -canvas.height, canvas.width, canvas.height)
                        break
                }
                break
            case 'slideOut':
                if (effectIntensity !== 'none' || effectOption !== 'none') {
                    if (progress >= 0.95) break // 最終フレームは完全透明（効果のみ以外）
                }
                switch (effectDirection) {
                    case 'left':
                        ctx.drawImage(sourceImage, progress * -canvas.width, 0, canvas.width, canvas.height)
                        break
                    case 'right':
                        ctx.drawImage(sourceImage, progress * canvas.width, 0, canvas.width, canvas.height)
                        break
                    case 'up':
                        ctx.drawImage(sourceImage, 0, progress * -canvas.height, canvas.width, canvas.height)
                        break
                    case 'down':
                    default:
                        ctx.drawImage(sourceImage, 0, progress * canvas.height, canvas.width, canvas.height)
                        break
                }
                break
            case 'wipeIn':
                ctx.save()
                switch (effectDirection) {
                    case 'left':
                        ctx.beginPath()
                        ctx.rect(canvas.width * (1 - progress), 0, canvas.width * progress, canvas.height)
                        ctx.clip()
                        break
                    case 'right':
                        ctx.beginPath()
                        ctx.rect(0, 0, canvas.width * progress, canvas.height)
                        ctx.clip()
                        break
                    case 'up':
                        ctx.beginPath()
                        ctx.rect(0, canvas.height * (1 - progress), canvas.width, canvas.height * progress)
                        ctx.clip()
                        break
                    case 'down':
                    default:
                        ctx.beginPath()
                        ctx.rect(0, 0, canvas.width, canvas.height * progress)
                        ctx.clip()
                        break
                }
                drawScaledImage(0, 0, canvas.width, canvas.height)
                ctx.restore()
                break
            case 'zoomUp': {
                // アップ: 小→通常 (0.5→1.0), ダウン: 大→通常 (1.5→1.0)
                const isUp = effectOption === 'up'
                const scaleZoomUp = isUp ? (0.5 + progress * 0.5) : (1.5 - progress * 0.5)
                ctx.save()
                ctx.translate(canvas.width / 2, canvas.height / 2)
                ctx.scale(scaleZoomUp, scaleZoomUp)
                ctx.translate(-canvas.width / 2, -canvas.height / 2)
                drawScaledImage(0, 0, canvas.width, canvas.height)
                ctx.restore()
                break
            }
            case 'zoomUpOut': {
                if (effectIntensity !== 'none' || effectOption !== 'none') {
                    if (progress >= 0.95) break // 最終フレームは完全透明（効果のみ以外）
                }
                // アップ: 通常→大 (1.0→1.5) + フェードアウト, ダウン: 通常→小 (1.0→0.5) + フェードアウト
                const isUpOut = effectOption === 'up'
                const scaleZoomUpOut = isUpOut ? (1.0 + progress * 0.5) : (1.0 - progress * 0.5)
                ctx.save()
                ctx.globalAlpha = 1.0 - progress
                ctx.translate(canvas.width / 2, canvas.height / 2)
                ctx.scale(scaleZoomUpOut, scaleZoomUpOut)
                ctx.translate(-canvas.width / 2, -canvas.height / 2)
                drawScaledImage(0, 0, canvas.width, canvas.height)
                ctx.restore()
                break
            }
            case 'doorClose':
                const halfW = canvas.width / 2
                ctx.drawImage(sourceImage, 0, 0, sourceImage.width / 2, sourceImage.height,
                    -halfW + progress * halfW, 0, halfW, canvas.height)
                ctx.drawImage(sourceImage, sourceImage.width / 2, 0, sourceImage.width / 2, sourceImage.height,
                    canvas.width - progress * halfW, 0, halfW, canvas.height)
                break
            case 'doorOpen':
                const doHalfW = canvas.width / 2
                ctx.drawImage(sourceImage, 0, 0, sourceImage.width / 2, sourceImage.height,
                    -progress * doHalfW, 0, doHalfW, canvas.height)
                ctx.drawImage(sourceImage, sourceImage.width / 2, 0, sourceImage.width / 2, sourceImage.height,
                    doHalfW + progress * doHalfW, 0, doHalfW, canvas.height)
                break
            case 'sliceIn': {
                // effectOptionで分割数を決定（デフォルト4）
                const sliceInCount = effectOption ? parseInt(effectOption) : 4
                for (let s = 0; s < sliceInCount; s++) {
                    const srcSliceH = sourceImage.height / sliceInCount
                    const dstSliceH = canvas.height / sliceInCount
                    const offsetX = (s % 2 === 0 ? -1 : 1) * (1 - progress) * canvas.width * 0.5
                    ctx.drawImage(sourceImage, 0, s * srcSliceH, sourceImage.width, srcSliceH, offsetX, s * dstSliceH, canvas.width, dstSliceH)
                }
                break
            }
            case 'tileIn':
                const tileInCount = effectOption ? parseInt(effectOption) : 9
                const tileCols = Math.sqrt(tileInCount), tileRows = Math.sqrt(tileInCount)
                const srcTileW = sourceImage.width / tileCols, srcTileH = sourceImage.height / tileRows
                const dstTileW = canvas.width / tileCols, dstTileH = canvas.height / tileRows
                const tileTotal = tileCols * tileRows
                const currentTileInOrder = tileOrders[tileInCount] || tileOrders[9]
                const tileVisible = Math.floor(progress * tileTotal)

                for (let t = 0; t < tileVisible; t++) {
                    const idx = currentTileInOrder[t]
                    if (idx === undefined) continue
                    const col = idx % tileCols, row = Math.floor(idx / tileCols)
                    ctx.drawImage(sourceImage, col * srcTileW, row * srcTileH, srcTileW, srcTileH, col * dstTileW, row * dstTileH, dstTileW, dstTileH)
                }
                break
            case 'pixelateIn': {
                // effectOptionでブロックサイズを決定（small=15, medium=30, large=60）
                const maxPixelSize = effectOption === 'small' ? 15 : effectOption === 'large' ? 60 : 30
                const pixelSize = Math.max(1, Math.floor((1 - progress) * maxPixelSize))
                const tempCanvas = document.createElement('canvas')
                tempCanvas.width = canvas.width / pixelSize
                tempCanvas.height = canvas.height / pixelSize
                const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true })!
                tempCtx.drawImage(sourceImage, 0, 0, tempCanvas.width, tempCanvas.height)
                ctx.imageSmoothingEnabled = false
                // fadeオプションの場合、透明度も変化
                if (effectIntensity === 'fade') {
                    ctx.globalAlpha = progress
                }
                ctx.drawImage(tempCanvas, 0, 0, canvas.width, canvas.height)
                ctx.globalAlpha = 1
                ctx.imageSmoothingEnabled = true
                break
            }
            case 'focusIn':
                if (effectOption === 'fade') ctx.globalAlpha = progress
                ctx.filter = `blur(${(1 - progress) * 20}px)`
                drawScaledImage(0, 0, canvas.width, canvas.height)
                ctx.filter = 'none'
                if (effectOption === 'fade') ctx.globalAlpha = 1
                break
            case 'irisIn': {
                ctx.save()
                ctx.beginPath()
                const irisInRadius = Math.max(canvas.width, canvas.height) * progress
                const irisInCx = canvas.width / 2
                const irisInCy = canvas.height / 2

                // effectOptionで形状を決定（circle, square, diamond）
                if (effectOption === 'square') {
                    // 四角形
                    const halfSize = irisInRadius * 0.7
                    ctx.rect(irisInCx - halfSize, irisInCy - halfSize, halfSize * 2, halfSize * 2)
                } else if (effectOption === 'diamond') {
                    // ダイヤモンド（回転した四角）
                    const halfSize = irisInRadius * 0.7
                    ctx.moveTo(irisInCx, irisInCy - halfSize)
                    ctx.lineTo(irisInCx + halfSize, irisInCy)
                    ctx.lineTo(irisInCx, irisInCy + halfSize)
                    ctx.lineTo(irisInCx - halfSize, irisInCy)
                    ctx.closePath()
                } else {
                    // デフォルト: 円
                    ctx.arc(irisInCx, irisInCy, irisInRadius, 0, Math.PI * 2)
                }
                ctx.clip()
                drawScaledImage(0, 0, canvas.width, canvas.height)
                ctx.restore()
                break
            }
            case 'pageFlipIn':
                // ページめくり：左めくり（デフォルト）と右めくりに対応
                const isRightFlip = effectOption === 'right'

                // プレビューの最後に完全に画像を表示するための閾値
                // progressがほぼ1なら、変形なしで描画して終了
                if (progress > 0.98) {
                    drawScaledImage(0, 0, canvas.width, canvas.height)
                    break
                }

                ctx.save()

                // 簡易的なページめくり表現（台形変形＋陰影）
                const flipInSkew = (1 - progress) * 0.5

                if (isRightFlip) {
                    // 右めくり（左端固定、右端が移動）
                    // transform(scaleX, skewY, skewX, scaleY, dx, dy)
                    // scaleX = progress (0->1)
                    // dx = 0 (左固定)
                    // skewX = -flipInSkew (右に傾く)
                    ctx.transform(progress, 0, -flipInSkew, 1, 0, 0)

                    // 画像描画
                    drawScaledImage(0, 0, canvas.width, canvas.height)

                    // 陰影
                    const flipInGrad = ctx.createLinearGradient(0, 0, canvas.width, 0)
                    // 軸（左）は明るく、めくれる端（右）は暗く
                    flipInGrad.addColorStop(0, 'rgba(255,255,255,0.3)') // 折り目（左）
                    flipInGrad.addColorStop(0.5, 'rgba(0,0,0,0.1)')
                    flipInGrad.addColorStop(1, 'rgba(0,0,0,0.4)')   // めくれる端（右）

                    ctx.fillStyle = flipInGrad
                    ctx.fillRect(0, 0, canvas.width, canvas.height)

                } else {
                    // 左めくり（右端固定、左端が移動）（既存）
                    // transform(scaleX, skewY, skewX, scaleY, dx, dy)
                    // scaleX = progress (0->1)
                    // dx = canvas.width * (1 - progress) (左端が右から左へ移動)
                    // skewX = flipInSkew (左に傾く)
                    ctx.transform(progress, 0, flipInSkew, 1, canvas.width * (1 - progress), 0)

                    drawScaledImage(0, 0, canvas.width, canvas.height)

                    const flipInGrad = ctx.createLinearGradient(0, 0, canvas.width, 0)
                    // めくれ口（左）は暗く、軸（右）はハイライト
                    flipInGrad.addColorStop(0, 'rgba(0,0,0,0.4)')   // めくれ口（左）は暗く
                    flipInGrad.addColorStop(0.5, 'rgba(0,0,0,0.1)')
                    flipInGrad.addColorStop(0.9, 'rgba(255,255,255,0.3)') // 軸（右）はハイライト
                    flipInGrad.addColorStop(1, 'rgba(0,0,0,0)')

                    ctx.fillStyle = flipInGrad
                    ctx.fillRect(0, 0, canvas.width, canvas.height)
                }

                // フェードも併用
                ctx.globalAlpha = Math.max(0, Math.min(1, progress * 1.5))
                ctx.restore()
                break
            case 'cardFlipIn': {
                ctx.save()
                // 回転数オプション取得 (1, 3, 5)
                const flipInCount = effectOption ? parseInt(effectOption.replace('x', '')) : 1

                // (N)回転させるなら
                // logic: scale = Math.cos(angle)
                // angle goes from [Start] to [0]

                const startAngleIn = (flipInCount - 1) * Math.PI + (Math.PI / 2)
                const currentAngleIn = startAngleIn * (1 - progress)
                const cardInScale = Math.cos(currentAngleIn)

                ctx.translate(canvas.width / 2, canvas.height / 2)
                ctx.scale(cardInScale, 1)
                ctx.translate(-canvas.width / 2, -canvas.height / 2)

                drawScaledImage(0, 0, canvas.width, canvas.height)
                ctx.restore()
                break
            }
            case 'tvStaticIn': {
                ctx.drawImage(sourceImage, 0, 0, canvas.width, canvas.height)
                const staticData = ctx.getImageData(0, 0, canvas.width, canvas.height)
                const staticIntensity = 1 - progress
                for (let p = 0; p < staticData.data.length; p += 4) {
                    if (Math.random() < staticIntensity) {
                        const noise = Math.random() * 255
                        staticData.data[p] = staticData.data[p + 1] = staticData.data[p + 2] = noise
                    }
                    // fadeオプションの場合、透明度も変化
                    if (effectOption === 'fade') {
                        staticData.data[p + 3] = staticData.data[p + 3] * progress
                    }
                }
                ctx.putImageData(staticData, 0, 0)
                break
            }
            case 'glitchIn': {
                // effectOptionで強度を決定（weak=0.15, medium=0.3, strong=0.5）
                const glitchInBase = effectOption === 'weak' ? 0.15 : effectOption === 'strong' ? 0.5 : 0.3
                const glitchIntensity = 1 - progress
                ctx.globalAlpha = progress
                for (let s = 0; s < 10; s++) {
                    const srcSliceY = s * (sourceImage.height / 10)
                    const dstSliceY = s * (canvas.height / 10)
                    const srcSliceH = sourceImage.height / 10
                    const dstSliceH = canvas.height / 10
                    const offsetX = (Math.random() - 0.5) * canvas.width * glitchInBase * glitchIntensity
                    ctx.drawImage(sourceImage, 0, srcSliceY, sourceImage.width, srcSliceH, offsetX, dstSliceY, canvas.width, dstSliceH)
                }
                ctx.globalAlpha = 1
                break
            }
            // V118: blindIn効果
            case 'blindIn': {
                // progress=1 では完全な画像を描画（アーティファクト防止）
                if (progress >= 1) {
                    drawScaledImage(0, 0, canvas.width, canvas.height)
                    break
                }
                const blindCount = effectOption ? parseInt(effectOption) : 7
                const isVertical = effectDirection === 'horizontal' // 逆にする：horizontalを選ぶと縦に開く
                const blindSize = isVertical ? canvas.height / blindCount : canvas.width / blindCount
                const openAmount = progress * blindSize

                for (let i = 0; i < blindCount; i++) {
                    ctx.save()
                    ctx.beginPath()
                    if (isVertical) {
                        ctx.rect(0, i * blindSize, canvas.width, openAmount)
                    } else {
                        ctx.rect(i * blindSize, 0, openAmount, canvas.height)
                    }
                    ctx.clip()
                    drawScaledImage(0, 0, canvas.width, canvas.height)
                    ctx.restore()
                }
                break
            }
            // === 退場エフェクト ===
            case 'wipeOut':
                if (effectIntensity !== 'none' || effectOption !== 'none') {
                    if (progress >= 0.95) break // 最終フレームは完全透明（効果のみ以外）
                }
                ctx.save()
                switch (effectDirection) {
                    case 'left':
                        ctx.beginPath()
                        ctx.rect(0, 0, canvas.width * (1 - progress), canvas.height)
                        ctx.clip()
                        break
                    case 'right':
                        ctx.beginPath()
                        ctx.rect(canvas.width * progress, 0, canvas.width * (1 - progress), canvas.height)
                        ctx.clip()
                        break
                    case 'up':
                        ctx.beginPath()
                        ctx.rect(0, 0, canvas.width, canvas.height * (1 - progress))
                        ctx.clip()
                        break
                    case 'down':
                    default:
                        ctx.beginPath()
                        ctx.rect(0, canvas.height * progress, canvas.width, canvas.height * (1 - progress))
                        ctx.clip()
                        break
                }
                drawScaledImage(0, 0, canvas.width, canvas.height)
                ctx.restore()
                break
            case 'sliceOut': {
                // effectOptionで分割数を決定（デフォルト4）
                if (effectIntensity !== 'none' || effectOption !== 'none') {
                    if (progress >= 0.95) break // 最終フレームは完全透明（効果のみ以外）
                }
                const sliceOutCount = effectOption ? parseInt(effectOption) : 4
                ctx.globalAlpha = 1 - progress
                for (let s = 0; s < sliceOutCount; s++) {
                    const srcSliceH = sourceImage.height / sliceOutCount
                    const dstSliceH = canvas.height / sliceOutCount
                    const offsetX = (s % 2 === 0 ? -1 : 1) * progress * canvas.width * 0.5
                    ctx.drawImage(sourceImage, 0, s * srcSliceH, sourceImage.width, srcSliceH, offsetX, s * dstSliceH, canvas.width, dstSliceH)
                }
                ctx.globalAlpha = 1
                break
            }
            case 'tileOut':
                if (effectIntensity !== 'none' || effectOption !== 'none') {
                    if (progress >= 0.95) break // 最終フレームは完全透明（効果のみ以外）
                }
                const tileOutCount = effectOption ? parseInt(effectOption) : 9
                const tileOutCols = Math.sqrt(tileOutCount), tileOutRows = Math.sqrt(tileOutCount)
                const srcTileOutW = sourceImage.width / tileOutCols, srcTileOutH = sourceImage.height / tileOutRows
                const dstTileOutW = canvas.width / tileOutCols, dstTileOutH = canvas.height / tileOutRows
                const tileOutTotal = tileOutCols * tileOutRows
                const currentTileOutOrder = tileOrders[tileOutCount] || tileOrders[9]
                const tileOutVisible = Math.floor((1 - progress) * tileOutTotal)

                for (let t = 0; t < tileOutVisible; t++) {
                    const idx = currentTileOutOrder[t]
                    if (idx === undefined) continue
                    const col = idx % tileOutCols, row = Math.floor(idx / tileOutCols)
                    ctx.drawImage(sourceImage, col * srcTileOutW, row * srcTileOutH, srcTileOutW, srcTileOutH, col * dstTileOutW, row * dstTileOutH, dstTileOutW, dstTileOutH)
                }
                break
            case 'pixelateOut': {
                if (effectIntensity !== 'none' && progress >= 0.9) break // 最終フレームは完全透明（効果のみ以外）閾値を緩和
                // effectOptionでブロックサイズを決定（small=15, medium=30, large=60）
                const maxPixelOut = effectOption === 'small' ? 15 : effectOption === 'large' ? 60 : 30
                const pixelOutSize = Math.max(1, Math.floor(progress * maxPixelOut))
                const tempOutCanvas = document.createElement('canvas')
                tempOutCanvas.width = canvas.width / pixelOutSize
                tempOutCanvas.height = canvas.height / pixelOutSize
                const tempOutCtx = tempOutCanvas.getContext('2d', { willReadFrequently: true })!
                tempOutCtx.drawImage(sourceImage, 0, 0, tempOutCanvas.width, tempOutCanvas.height)
                ctx.imageSmoothingEnabled = false
                // fadeオプションの場合、透明度も変化
                if (effectIntensity === 'fade') {
                    ctx.globalAlpha = 1 - progress
                }
                ctx.drawImage(tempOutCanvas, 0, 0, canvas.width, canvas.height)
                ctx.globalAlpha = 1
                ctx.imageSmoothingEnabled = true
                break
            }
            case 'focusOut':
                if (effectOption === 'fade') ctx.globalAlpha = 1 - progress
                ctx.filter = `blur(${progress * 20}px)`
                drawScaledImage(0, 0, canvas.width, canvas.height)
                ctx.filter = 'none'
                if (effectOption === 'fade') ctx.globalAlpha = 1
                break
            case 'irisOut': {
                if (effectIntensity !== 'none' || effectOption !== 'none') {
                    if (progress >= 0.95) break // 最終フレームは完全透明（効果のみ以外）
                }
                ctx.save()
                ctx.beginPath()
                const irisOutRadius = Math.max(canvas.width, canvas.height) * (1 - progress)
                const irisOutCx = canvas.width / 2
                const irisOutCy = canvas.height / 2

                // effectOptionで形状を決定（circle, square, diamond）
                if (effectOption === 'square') {
                    const halfSize = irisOutRadius * 0.7
                    ctx.rect(irisOutCx - halfSize, irisOutCy - halfSize, halfSize * 2, halfSize * 2)
                } else if (effectOption === 'diamond') {
                    const halfSize = irisOutRadius * 0.7
                    ctx.moveTo(irisOutCx, irisOutCy - halfSize)
                    ctx.lineTo(irisOutCx + halfSize, irisOutCy)
                    ctx.lineTo(irisOutCx, irisOutCy + halfSize)
                    ctx.lineTo(irisOutCx - halfSize, irisOutCy)
                    ctx.closePath()
                } else {
                    ctx.arc(irisOutCx, irisOutCy, irisOutRadius, 0, Math.PI * 2)
                }
                ctx.clip()
                drawScaledImage(0, 0, canvas.width, canvas.height)
                ctx.restore()
                break
            }
            case 'pageFlipOut':
                // ページめくりアウト：左めくり（デフォルト）と右めくりに対応
                const isRightFlipOut = effectOption === 'right'

                if (effectIntensity !== 'none' || effectOption !== 'none') {
                    if (progress > 0.98) {
                        // ほぼ終わりなら描画しない（消える）（効果のみ以外）
                        break
                    }
                }

                ctx.save()

                // 簡易的なページめくり表現（台形変形＋陰影）
                const flipOutSkew = progress * 0.5

                if (isRightFlipOut) {
                    // 右めくりアウト：右端固定、左端が閉じていく（奥へ倒れる）
                    // 修正: "Right Flip" = 右へ移動させたい（通常の「右へめくる」動作）
                    // つまり、動きとして右方向への退場

                    // 右方向への移動 = 左端が右へ移動
                    // Hinge: Right (w)? No, if moving Right, usually starts flat and folds Up-Right?
                    // Or Hinge Right, Left edge closes to Right.

                    // 以前の "Left" ロジック（右端固定、左端が右移動）を "Right" に適用

                    // Hinge: Right (w)
                    // Motion: Left edge (0) -> Right (w)

                    ctx.transform(1 - progress, 0, flipOutSkew, 1, canvas.width * progress, 0)

                    drawScaledImage(0, 0, canvas.width, canvas.height)

                    const flipOutGrad = ctx.createLinearGradient(0, 0, canvas.width, 0)
                    // 端（左）は暗く、軸（右）はハイライト
                    flipOutGrad.addColorStop(0, 'rgba(0,0,0,0.4)') // 端（左）
                    flipOutGrad.addColorStop(0.5, 'rgba(0,0,0,0.1)')
                    flipOutGrad.addColorStop(0.9, 'rgba(255,255,255,0.3)') // 軸（右）
                    flipOutGrad.addColorStop(1, 'rgba(0,0,0,0)')

                    ctx.fillStyle = flipOutGrad
                    ctx.fillRect(0, 0, canvas.width, canvas.height)

                } else {
                    // 左めくりアウト（デフォルト）：左端固定、右端が閉じていく（奥へ倒れる）
                    // 修正: "Left Flip" = 左へ移動させたい

                    // 左方向への移動 = 右端が左へ移動
                    // Hinge: Left (0)
                    // Motion: Right edge (w) -> Left (0)

                    // 以前の "Right" ロジック（左端固定、右端が左移動）を "Left" に適用

                    ctx.transform(1 - progress, 0, -flipOutSkew, 1, 0, 0)

                    drawScaledImage(0, 0, canvas.width, canvas.height)

                    const flipOutGrad = ctx.createLinearGradient(0, 0, canvas.width, 0)
                    // 軸（左）は明るく、めくれる端（右）は暗く
                    flipOutGrad.addColorStop(0, 'rgba(255,255,255,0.3)') // 軸（左）
                    flipOutGrad.addColorStop(0.5, 'rgba(0,0,0,0.1)')
                    flipOutGrad.addColorStop(1, 'rgba(0,0,0,0.4)')   // 端（右）

                    ctx.fillStyle = flipOutGrad
                    ctx.fillRect(0, 0, canvas.width, canvas.height)
                }

                // フェード
                ctx.globalAlpha = Math.max(0, Math.min(1, (1 - progress) * 1.5))

                ctx.restore()
                break
            case 'cardFlipOut':
                if (effectIntensity !== 'none' || effectOption !== 'none') {
                    if (progress >= 0.95) break // 最終フレームは完全透明（効果のみ以外）
                }
                ctx.save()
                const flipOutCount = effectOption ? parseInt(effectOption.replace('x', '')) : 1

                // N=1: 0 -> PI/2 (scale 1->0)
                // N=3: 0 -> 2.5PI ?

                const endAngleOut = (flipOutCount - 1) * Math.PI + (Math.PI / 2)
                const currentAngleOut = endAngleOut * progress
                const cardOutScale = Math.cos(currentAngleOut)

                // const cardOutOffsetX = (canvas.width / 2) * progress

                ctx.translate(canvas.width / 2, canvas.height / 2)
                ctx.scale(cardOutScale, 1)
                ctx.translate(-canvas.width / 2, -canvas.height / 2)

                drawScaledImage(0, 0, canvas.width, canvas.height)
                ctx.restore()
                break
            case 'tvStaticOut':
                drawScaledImage(0, 0, canvas.width, canvas.height)
                const tvOutData = ctx.getImageData(0, 0, canvas.width, canvas.height)
                for (let p = 0; p < tvOutData.data.length; p += 4) {
                    if (Math.random() < progress) {
                        const noise = Math.random() * 255
                        tvOutData.data[p] = tvOutData.data[p + 1] = tvOutData.data[p + 2] = noise
                    }
                    // fadeオプションの場合でも、完全に消えるよりは砂嵐になって終わる方が面白いかもだが、
                    // ユーザー要望は「グレーの砂あらしシルエットでおわる」
                    // fadeの場合は透明になるので、シルエットは残らない
                    // なので、fadeオプションが効いていると、少し矛盾するかも
                    // ここでは要望通り、砂嵐確率を 1.0 (100%) まで上げる
                    if (effectOption === 'fade') {
                        tvOutData.data[p + 3] = tvOutData.data[p + 3] * (1 - progress)
                    }
                }
                ctx.putImageData(tvOutData, 0, 0)
                break
            case 'glitchOut': {
                if (effectIntensity !== 'none' || effectOption !== 'none') {
                    if (progress >= 0.95) break // 最終フレームは完全透明（効果のみ以外）
                }
                // effectOptionで強度を決定（weak=0.15, medium=0.3, strong=0.5）
                const glitchOutBase = effectOption === 'weak' ? 0.15 : effectOption === 'strong' ? 0.5 : 0.3
                const glitchOutIntensity = progress
                ctx.globalAlpha = 1 - progress
                for (let s = 0; s < 10; s++) {
                    const srcSliceOutY = s * (sourceImage.height / 10)
                    const dstSliceOutY = s * (canvas.height / 10)
                    const srcSliceOutH = sourceImage.height / 10
                    const dstSliceOutH = canvas.height / 10
                    const offsetX = (Math.random() - 0.5) * canvas.width * glitchOutBase * glitchOutIntensity
                    ctx.drawImage(sourceImage, 0, srcSliceOutY, sourceImage.width, srcSliceOutH, offsetX, dstSliceOutY, canvas.width, dstSliceOutH)
                }
                ctx.globalAlpha = 1
                break
            }
            // V118: blindOut効果
            case 'blindOut': {
                if (effectIntensity !== 'none' || effectOption !== 'none') {
                    if (progress >= 0.95) break // 最終フレームは完全透明（効果のみ以外）
                }
                const blindOutCount = effectOption ? parseInt(effectOption) : 7
                const isVerticalOut = effectDirection === 'horizontal' // 逆にする
                const blindOutSize = isVerticalOut ? canvas.height / blindOutCount : canvas.width / blindOutCount
                const closeAmount = (1 - progress) * blindOutSize

                for (let i = 0; i < blindOutCount; i++) {
                    ctx.save()
                    ctx.beginPath()
                    if (isVerticalOut) {
                        ctx.rect(0, i * blindOutSize, canvas.width, closeAmount)
                    } else {
                        ctx.rect(i * blindOutSize, 0, closeAmount, canvas.height)
                    }
                    ctx.clip()
                    drawScaledImage(0, 0, canvas.width, canvas.height)
                    ctx.restore()
                }
                break
            }
            // V118: 斬撃効果（斜めに斬られて上下がスライドして消える）
            case 'swordSlashOut': {
                if (effectIntensity !== 'none' || effectOption !== 'none') {
                    if (progress >= 0.95) break // 最終フレームは完全透明（効果のみ以外）
                }
                const isRightSlash = effectOption !== 'left' // デフォルトは右斬り（╲）
                ctx.save()

                // 斬撃フラッシュ効果（0-15%のプログレス）
                const flashPhase = progress < 0.15
                if (flashPhase) {
                    // 斬撃線を描画
                    drawScaledImage(0, 0, canvas.width, canvas.height)
                    const flashIntensity = Math.sin((progress / 0.15) * Math.PI)
                    ctx.strokeStyle = `rgba(255, 255, 255, ${flashIntensity})`
                    ctx.lineWidth = 8
                    ctx.beginPath()
                    if (isRightSlash) {
                        // 右斬り：左上から右下
                        ctx.moveTo(0, 0)
                        ctx.lineTo(canvas.width, canvas.height)
                    } else {
                        // 左斬り：右上から左下
                        ctx.moveTo(canvas.width, 0)
                        ctx.lineTo(0, canvas.height)
                    }
                    ctx.stroke()
                } else {
                    // スライドフェーズ（15-100%のプログレス）
                    const slideProgress = (progress - 0.15) / 0.85
                    const slideAmount = slideProgress * canvas.width * 0.6
                    const fadeAlpha = 1 - slideProgress

                    ctx.globalAlpha = fadeAlpha

                    // 上三角形（対角線の上側）
                    ctx.save()
                    ctx.beginPath()
                    if (isRightSlash) {
                        // 右斬り（╲）：上三角形 = (0,0), (w,h), (w,0)
                        // 左上へスライド
                        ctx.moveTo(0, 0)
                        ctx.lineTo(canvas.width, canvas.height)
                        ctx.lineTo(canvas.width, 0)
                        ctx.closePath()
                        ctx.clip()
                        ctx.drawImage(sourceImage, -slideAmount, -slideAmount * 0.5, canvas.width, canvas.height)
                    } else {
                        // 左斬り（╱）：上三角形 = (w,0), (0,h), (0,0)
                        // 右上へスライド
                        ctx.moveTo(canvas.width, 0)
                        ctx.lineTo(0, canvas.height)
                        ctx.lineTo(0, 0)
                        ctx.closePath()
                        ctx.clip()
                        ctx.drawImage(sourceImage, slideAmount, -slideAmount * 0.5, canvas.width, canvas.height)
                    }
                    ctx.restore()

                    // 下三角形（対角線の下側）
                    ctx.save()
                    ctx.beginPath()
                    if (isRightSlash) {
                        // 右斬り（╲）：下三角形 = (0,0), (0,h), (w,h)
                        // 右下へスライド
                        ctx.moveTo(0, 0)
                        ctx.lineTo(0, canvas.height)
                        ctx.lineTo(canvas.width, canvas.height)
                        ctx.closePath()
                        ctx.clip()
                        ctx.drawImage(sourceImage, slideAmount, slideAmount * 0.5, canvas.width, canvas.height)
                    } else {
                        // 左斬り（╱）：下三角形 = (w,0), (w,h), (0,h)
                        // 左下へスライド
                        ctx.moveTo(canvas.width, 0)
                        ctx.lineTo(canvas.width, canvas.height)
                        ctx.lineTo(0, canvas.height)
                        ctx.closePath()
                        ctx.clip()
                        ctx.drawImage(sourceImage, -slideAmount, slideAmount * 0.5, canvas.width, canvas.height)
                    }
                    ctx.restore()
                }

                ctx.globalAlpha = 1
                ctx.restore()
                break
            }
            // === 演出エフェクト ===
            case 'rotate':
                const rotateDir = effectOption === 'right' ? 1 : -1
                ctx.save()
                ctx.translate(canvas.width / 2, canvas.height / 2)
                ctx.rotate(progress * Math.PI * 2 * rotateDir)
                ctx.translate(-canvas.width / 2, -canvas.height / 2)
                drawScaledImage(0, 0, canvas.width, canvas.height)
                ctx.restore()
                break

            case 'enlarge':
                const enlargeScale = 1 + progress * 4
                ctx.save()
                ctx.translate(canvas.width / 2, canvas.height / 2)
                ctx.scale(enlargeScale, enlargeScale)
                ctx.translate(-canvas.width / 2, -canvas.height / 2)
                drawScaledImage(0, 0, canvas.width, canvas.height)
                ctx.restore()
                break
            case 'minimize':
                const minimizeScale = 5 - progress * 4
                ctx.save()
                ctx.translate(canvas.width / 2, canvas.height / 2)
                ctx.scale(minimizeScale, minimizeScale)
                ctx.translate(-canvas.width / 2, -canvas.height / 2)
                drawScaledImage(0, 0, canvas.width, canvas.height)
                ctx.restore()
                break
            case 'vibration': {
                // effectIntensityで振動幅を決定（weak=5, medium=10, strong=20）
                const vibBase = effectIntensity === 'weak' ? 5 : effectIntensity === 'strong' ? 20 : 10
                const vibAmp = Math.sin(progress * Math.PI * 8) * vibBase
                if (effectDirection === 'vertical') {
                    ctx.drawImage(sourceImage, 0, (Math.random() - 0.5) * vibAmp, canvas.width, canvas.height)
                } else if (effectDirection === 'horizontal') {
                    ctx.drawImage(sourceImage, (Math.random() - 0.5) * vibAmp, 0, canvas.width, canvas.height)
                } else {
                    // random: X,Y両方ランダム（ジッター）
                    const jitterX = (Math.random() - 0.5) * vibAmp
                    const jitterY = (Math.random() - 0.5) * vibAmp
                    ctx.drawImage(sourceImage, jitterX, jitterY, canvas.width, canvas.height)
                }
                break
            }
            case 'bounce':
                const bounceY = Math.abs(Math.sin(progress * Math.PI * 2)) * canvas.height * 0.2
                ctx.drawImage(sourceImage, 0, -bounceY, canvas.width, canvas.height)
                break
            case 'flash':
                drawScaledImage(0, 0, canvas.width, canvas.height)
                const flashIntensity = Math.sin(progress * Math.PI)
                // 透過部分を保持するため、source-atopモードで閃光を描画
                ctx.save()
                ctx.globalCompositeOperation = 'source-atop'
                ctx.fillStyle = `rgba(255, 255, 255, ${flashIntensity * 0.8})`
                ctx.fillRect(0, 0, canvas.width, canvas.height)
                ctx.restore()
                break
            case 'rgbShift': {
                // RGBシフト: effectOptionで強度を決定（small=2, medium=6, large=12）
                const rgbBase = effectOption === 'small' ? 0.02 : effectOption === 'large' ? 0.06 : 0.04
                const shiftAmt = Math.sin(progress * Math.PI) * canvas.width * rgbBase

                // 各チャンネルのオフセット計算（120度間隔）
                const rOffsetX = Math.round(Math.sin(0) * shiftAmt)                    // 0°: 右0, 上-
                const rOffsetY = Math.round(-Math.cos(0) * shiftAmt)                   // 上方向
                const gOffsetX = Math.round(Math.sin(Math.PI * 4 / 3) * shiftAmt)      // 240°: 左下
                const gOffsetY = Math.round(-Math.cos(Math.PI * 4 / 3) * shiftAmt)
                const bOffsetX = Math.round(Math.sin(Math.PI * 2 / 3) * shiftAmt)      // 120°: 右下
                const bOffsetY = Math.round(-Math.cos(Math.PI * 2 / 3) * shiftAmt)

                // 元画像を描画
                drawScaledImage(0, 0, canvas.width, canvas.height)
                const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height)
                const data = imgData.data
                const newData = ctx.createImageData(canvas.width, canvas.height)
                const out = newData.data

                for (let y = 0; y < canvas.height; y++) {
                    for (let x = 0; x < canvas.width; x++) {
                        const i = (y * canvas.width + x) * 4

                        // 赤チャンネル: 上方向からサンプル
                        const rX = Math.min(Math.max(x - rOffsetX, 0), canvas.width - 1)
                        const rY = Math.min(Math.max(y - rOffsetY, 0), canvas.height - 1)
                        const rI = (rY * canvas.width + rX) * 4
                        out[i] = data[rI]

                        // 緑チャンネル: 左下方向からサンプル
                        const gX = Math.min(Math.max(x - gOffsetX, 0), canvas.width - 1)
                        const gY = Math.min(Math.max(y - gOffsetY, 0), canvas.height - 1)
                        const gI = (gY * canvas.width + gX) * 4
                        out[i + 1] = data[gI + 1]

                        // 青チャンネル: 右下方向からサンプル
                        const bX = Math.min(Math.max(x - bOffsetX, 0), canvas.width - 1)
                        const bY = Math.min(Math.max(y - bOffsetY, 0), canvas.height - 1)
                        const bI = (bY * canvas.width + bX) * 4
                        out[i + 2] = data[bI + 2]

                        // アルファ
                        out[i + 3] = data[i + 3]
                    }
                }
                ctx.putImageData(newData, 0, 0)
                break
            }
            case 'scanlines': {
                drawScaledImage(0, 0, canvas.width, canvas.height)

                // effectOptionで太さを決定（thin=1, medium=2, thick=4）
                const scanlineThickness = effectOption === 'thin' ? 1 : effectOption === 'thick' ? 4 : 2
                const scanlineSpacing = scanlineThickness * 2

                // effectIntensityで色を決定（gray/blue/green）
                const scanlineColor = effectIntensity === 'blue' ? 'rgba(0, 100, 255, 0.3)' :
                    effectIntensity === 'green' ? 'rgba(0, 200, 100, 0.3)' :
                        'rgba(0, 0, 0, 0.3)'

                // 透過部分を保持するため、source-atopモードでスキャンラインを描画
                ctx.save()
                ctx.globalCompositeOperation = 'source-atop'
                ctx.fillStyle = scanlineColor
                for (let y = 0; y < canvas.height; y += scanlineSpacing) {
                    ctx.fillRect(0, y, canvas.width, scanlineThickness)
                }

                // 動く光のライン効果
                const scanOffset = (progress * canvas.height) % canvas.height
                const scanGrad = ctx.createLinearGradient(0, scanOffset - 30, 0, scanOffset + 30)
                scanGrad.addColorStop(0, 'rgba(255, 255, 255, 0)')
                scanGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.15)')
                scanGrad.addColorStop(1, 'rgba(255, 255, 255, 0)')
                ctx.fillStyle = scanGrad
                ctx.fillRect(0, scanOffset - 30, canvas.width, 60)
                ctx.restore()
                break
            }
            case 'vignette':
                drawScaledImage(0, 0, canvas.width, canvas.height)
                // 揺らぎを追加 (半径と濃さが呼吸するように変化)
                const vigTime = progress * Math.PI * 2 // 1往復程度
                const vigRadiusBase = 0.7
                const vigRadiusAmp = 0.05
                const vigRadius = canvas.width * (vigRadiusBase + Math.sin(vigTime) * vigRadiusAmp)

                const vigAlphaBase = 0.8
                const vigAlphaAmp = 0.1
                const vigAlpha = Math.max(0, Math.min(1, vigAlphaBase + Math.sin(vigTime * 1.3) * vigAlphaAmp)) // 周期をずらす

                const vigGrad = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, vigRadius)
                vigGrad.addColorStop(0, 'transparent')
                vigGrad.addColorStop(1, `rgba(0, 0, 0, ${vigAlpha})`)
                // 透過部分を保持するため、source-atopモードでビネットを描画
                ctx.save()
                ctx.globalCompositeOperation = 'source-atop'
                ctx.fillStyle = vigGrad
                ctx.fillRect(0, 0, canvas.width, canvas.height)
                ctx.restore()
                break
            case 'pulsation': {
                // 脈動: エッジ部分に色のフリンジ（上下左右にズレ）
                const pulsationSize = effectOption === 'small' ? 3 : effectOption === 'large' ? 12 : 6
                const aberAmt = Math.sin(progress * Math.PI) * pulsationSize
                // 元画像を先に描画
                drawScaledImage(0, 0, canvas.width, canvas.height)
                // エッジに色を乗せる
                ctx.globalCompositeOperation = 'screen'
                ctx.globalAlpha = 0.3
                // 赤（左上にズレ）
                ctx.save()
                ctx.translate(-aberAmt, -aberAmt)
                drawScaledImage(0, 0, canvas.width, canvas.height)
                ctx.restore()
                // シアン（右下にズレ）
                ctx.save()
                ctx.translate(aberAmt, aberAmt)
                drawScaledImage(0, 0, canvas.width, canvas.height)
                ctx.restore()
                ctx.globalAlpha = 1
                ctx.globalCompositeOperation = 'source-over'
                break
            }
            case 'tvStatic':
                // TV砂嵐
                drawScaledImage(0, 0, canvas.width, canvas.height)
                const tvStaticData = ctx.getImageData(0, 0, canvas.width, canvas.height)
                for (let p = 0; p < tvStaticData.data.length; p += 4) {
                    if (Math.random() < 0.3) {
                        const noise = Math.random() * 255
                        tvStaticData.data[p] = tvStaticData.data[p + 1] = tvStaticData.data[p + 2] = noise
                    }
                }
                ctx.putImageData(tvStaticData, 0, 0)
                break
            case 'spiral':
                const spiralDir = effectOption === 'right' ? 1 : -1
                ctx.save()
                ctx.translate(canvas.width / 2, canvas.height / 2)
                ctx.rotate(progress * Math.PI * 4 * spiralDir)
                ctx.scale(1 - progress * 0.5, 1 - progress * 0.5)
                ctx.translate(-canvas.width / 2, -canvas.height / 2)
                drawScaledImage(0, 0, canvas.width, canvas.height)
                ctx.restore()
                break
            // V118 Phase 2: 集中線（三角形の放射状線＋揺れ＋周辺ぼかし）
            case 'concentrationLines': {
                // 元画像を描画
                drawScaledImage(0, 0, canvas.width, canvas.height)

                // 透過部分を保持するため、source-atopモードでエフェクトを描画
                ctx.save()
                ctx.globalCompositeOperation = 'source-atop'

                // 周辺のぼかし（ビネット風）強め
                const clVigGrad = ctx.createRadialGradient(
                    canvas.width / 2, canvas.height / 2, canvas.width * 0.15,
                    canvas.width / 2, canvas.height / 2, canvas.width * 0.8
                )
                clVigGrad.addColorStop(0, 'transparent')
                clVigGrad.addColorStop(0.5, 'rgba(0, 0, 0, 0.3)')
                clVigGrad.addColorStop(1, 'rgba(0, 0, 0, 0.8)')
                ctx.fillStyle = clVigGrad
                ctx.fillRect(0, 0, canvas.width, canvas.height)

                // 三角形の放射状線（漫画の集中線風）
                const rayCount = 40
                const shake = Math.sin(progress * Math.PI * 6) * 3
                const centerX = canvas.width / 2
                const centerY = canvas.height / 2

                // オプションによる半径調整
                // weak: 外向け（半径大）、medium: 中、strong: 中心向け（半径小、線が長い）
                let baseRadiusRatio = 0.25 // default (medium)
                if (effectOption === 'weak') baseRadiusRatio = 0.4 // 外向け：中心が広く空く
                if (effectOption === 'strong') baseRadiusRatio = 0.1 // 中心向け：中心まで線が来る

                const innerRadius = canvas.width * baseRadiusRatio + shake
                const outerRadius = Math.max(canvas.width, canvas.height) * 0.9

                ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
                for (let i = 0; i < rayCount; i++) {
                    const baseAngle = (i / rayCount) * Math.PI * 2
                    const angleWidth = (Math.PI * 2 / rayCount) * 0.3 // 線の太さ
                    const jitter = Math.sin(i * 3 + progress * Math.PI * 4) * 0.02 // 揺らぎ

                    const angle1 = baseAngle - angleWidth / 2 + jitter
                    const angle2 = baseAngle + angleWidth / 2 + jitter

                    ctx.beginPath()
                    ctx.moveTo(centerX + Math.cos(baseAngle) * innerRadius, centerY + Math.sin(baseAngle) * innerRadius)
                    ctx.lineTo(centerX + Math.cos(angle1) * outerRadius, centerY + Math.sin(angle1) * outerRadius)
                    ctx.lineTo(centerX + Math.cos(angle2) * outerRadius, centerY + Math.sin(angle2) * outerRadius)
                    ctx.closePath()
                    ctx.fill()
                }
                ctx.restore()
                break
            }
            case 'glitch': {
                // グリッチ: effectOptionで強度を決定（weak=0.1, medium=0.2, strong=0.4）
                const glitchBase = effectOption === 'weak' ? 0.1 : effectOption === 'strong' ? 0.4 : 0.2
                ctx.globalAlpha = 1
                for (let s = 0; s < 10; s++) {
                    const srcSliceY = s * (sourceImage.height / 10)
                    const dstSliceY = s * (canvas.height / 10)
                    const srcSliceH = sourceImage.height / 10
                    const dstSliceH = canvas.height / 10
                    const glitchOff = (Math.random() - 0.5) * canvas.width * glitchBase * Math.sin(progress * Math.PI * 4)
                    ctx.drawImage(sourceImage, 0, srcSliceY, sourceImage.width, srcSliceH, glitchOff, dstSliceY, canvas.width, dstSliceH)
                }
                break
            }
            // V118: カード回転ループ
            case 'cardFlipLoop': {
                ctx.save()
                const flipProgress = Math.sin(progress * Math.PI * 2) // -1 to 1
                const scaleX = Math.abs(flipProgress)
                ctx.translate(canvas.width / 2, 0)
                ctx.scale(scaleX, 1)
                ctx.translate(-canvas.width / 2, 0)
                drawScaledImage(0, 0, canvas.width, canvas.height)
                ctx.restore()
                break
            }
            // V119: シルエット
            case 'silhouette': {
                drawScaledImage(0, 0, canvas.width, canvas.height)

                // シルエット解除モードの場合、progress=1で元画像
                const isSilhouetteRelease = effectIntensity === 'from-silhouette'

                if (isSilhouetteRelease && progress === 1) break
                if (!isSilhouetteRelease && progress === 0) break

                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
                const data = imageData.data

                // シルエットの色を決定
                const colorMap: { [key: string]: [number, number, number] } = {
                    white: [255, 255, 255],
                    black: [0, 0, 0],
                    red: [255, 0, 0],
                }

                // シルエット解除の場合は「ため」を追加してから progress を反転
                let silhouetteIntensity: number
                if (isSilhouetteRelease) {
                    // 最初の30%はシルエット状態を維持、残り70%でフェード
                    const holdDuration = 0.3
                    if (progress < holdDuration) {
                        silhouetteIntensity = 1 // シルエット状態を維持
                    } else {
                        silhouetteIntensity = 1 - ((progress - holdDuration) / (1 - holdDuration))
                    }
                } else {
                    silhouetteIntensity = progress
                }

                if (effectOption === 'outline-black' || effectOption === 'outline-white') {
                    // 縁取りモード: エッジ検出（黒縁 or 白縁）
                    const outlineColor = effectOption === 'outline-white' ? 255 : 0
                    const edgeData = new Uint8ClampedArray(data.length)
                    for (let y = 1; y < canvas.height - 1; y++) {
                        for (let x = 1; x < canvas.width - 1; x++) {
                            const i = (y * canvas.width + x) * 4
                            const iUp = ((y - 1) * canvas.width + x) * 4
                            const iDown = ((y + 1) * canvas.width + x) * 4
                            const iLeft = (y * canvas.width + (x - 1)) * 4
                            const iRight = (y * canvas.width + (x + 1)) * 4

                            const alphaCenter = data[i + 3]
                            const alphaUp = data[iUp + 3]
                            const alphaDown = data[iDown + 3]
                            const alphaLeft = data[iLeft + 3]
                            const alphaRight = data[iRight + 3]

                            // 隣接ピクセルとのアルファ差をチェック
                            const isEdge = (alphaCenter > 128 && (alphaUp < 128 || alphaDown < 128 || alphaLeft < 128 || alphaRight < 128))

                            if (isEdge) {
                                // エッジ部分: 元の色から黒/白へ変化
                                const blend = silhouetteIntensity
                                edgeData[i] = Math.floor(data[i] * (1 - blend) + outlineColor * blend)
                                edgeData[i + 1] = Math.floor(data[i + 1] * (1 - blend) + outlineColor * blend)
                                edgeData[i + 2] = Math.floor(data[i + 2] * (1 - blend) + outlineColor * blend)
                                edgeData[i + 3] = data[i + 3] // アルファは維持
                            } else {
                                // 非エッジ部分: 元の色を維持しつつ徐々に透明に
                                edgeData[i] = data[i]
                                edgeData[i + 1] = data[i + 1]
                                edgeData[i + 2] = data[i + 2]
                                edgeData[i + 3] = Math.floor(data[i + 3] * (1 - silhouetteIntensity))
                            }
                        }
                    }
                    const edgeImageData = new ImageData(edgeData, canvas.width, canvas.height)
                    ctx.putImageData(edgeImageData, 0, 0)
                } else {
                    const [r, g, b] = colorMap[effectOption || 'black'] || colorMap.black

                    // 不透明ピクセルを単色に変換
                    for (let i = 0; i < data.length; i += 4) {
                        if (data[i + 3] > 0) { // 不透明なら
                            const blend = silhouetteIntensity
                            data[i] = Math.floor(data[i] * (1 - blend) + r * blend)
                            data[i + 1] = Math.floor(data[i + 1] * (1 - blend) + g * blend)
                            data[i + 2] = Math.floor(data[i + 2] * (1 - blend) + b * blend)
                            // アルファは維持
                        }
                    }
                    ctx.putImageData(imageData, 0, 0)
                }
                break
            }
            default:
                drawScaledImage(0, 0, canvas.width, canvas.height)
                break
        }
    }, [sourceImage, transition, effectDirection, effectOption, effectIntensity])

    // プレビュー描画のuseEffect
    useEffect(() => {
        if (sourceImage && previewCanvasRef.current) {
            drawPreviewFrame(previewProgress)
        }
    }, [previewProgress, drawPreviewFrame, sourceImage])

    // 初期表示・終了後表示用
    useEffect(() => {
        if (sourceImage && previewCanvasRef.current && !isPlaying) {
            // すべてのエフェクトで progress=1 で完成状態を表示
            drawPreviewFrame(1)
        }
    }, [sourceImage, drawPreviewFrame, isPlaying, transition, effectDirection, previewProgress, isLooping])

    // isLoopingRefを最新の値に同期
    useEffect(() => {
        isLoopingRef.current = isLooping
    }, [isLooping])

    // playbackSpeedRefを最新の値に同期
    useEffect(() => {
        playbackSpeedRef.current = playbackSpeed
    }, [playbackSpeed])

    // ループ設定変更時にプレビューを再開（ONに切り替えた時は自動再生開始）
    useEffect(() => {
        if (sourceImage) {
            if (isPlaying) {
                stopPreview()
                const timer = setTimeout(() => startPreview(), 50)
                return () => clearTimeout(timer)
            } else if (isLooping) {
                // ループONに切り替えた時、停止中なら自動再生開始
                const timer = setTimeout(() => startPreview(), 50)
                return () => clearTimeout(timer)
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLooping])

    const handleTransitionChange = (newTransition: string) => {
        setTransition(newTransition)
        setOptimizedSize(null)
        setCompressionInfo(null)

        // 効果に応じてデフォルト方向を設定
        const effect = findEffectByName(newTransition)
        if (effect?.hasDirection && effect.directions) {
            // 4方向効果の場合はleftをデフォルトに
            if (effect.directions.includes('left')) {
                setEffectDirection('left')
            }
            // 縦横効果の場合はhorizontalをデフォルトに
            else if (effect.directions.includes('horizontal')) {
                setEffectDirection('horizontal')
            }
        }

        // エフェクトごとのループ設定を確認
        if (loopSettingsPerEffect.hasOwnProperty(newTransition)) {
            // ユーザーがこのエフェクトのループ設定を変更したことがある
            setIsLooping(loopSettingsPerEffect[newTransition])
        } else {
            // 初めて選ぶエフェクトはカテゴリに応じたデフォルト
            const category = findCategoryByEffectName(newTransition)
            // 演出エフェクトはループON、ただし以下は除く
            const noLoopEffects = ['enlarge', 'minimize', 'rgbShift', 'pulsation', 'silhouette']
            if (category === '演出（Effects）' && !noLoopEffects.includes(newTransition)) {
                setIsLooping(true)
            } else {
                setIsLooping(false)
            }
        }

        // エフェクトごとの再生スピード設定を確認
        if (speedSettingsPerEffect.hasOwnProperty(newTransition)) {
            const savedSpeed = speedSettingsPerEffect[newTransition]
            setPlaybackSpeed(savedSpeed)
            playbackSpeedRef.current = savedSpeed // refも即時更新
        } else {
            // 初めて選ぶエフェクトはデフォルト速度
            setPlaybackSpeed(1.0)
            playbackSpeedRef.current = 1.0 // refも即時更新
        }

        // 既存のアニメーションをキャンセルして再開（少し遅延させて状態更新を待つ）
        stopPreview()
        setTimeout(() => startPreview(), 100)
        if (imageSize) {
            estimateAPNGSize(imageSize.width, imageSize.height)
        }
    }

    const findOptimalScaleFactor = (
        originalWidth: number,
        originalHeight: number,
        frameCount: number,
        targetSizeInBytes: number
    ): number => {
        let low = 0
        let high = 1
        const tolerance = 0.01 // 1%の許容誤差

        while (high - low > tolerance) {
            const mid = (low + high) / 2
            const scaledWidth = Math.floor(originalWidth * mid)
            const scaledHeight = Math.floor(originalHeight * mid)
            const estimatedSize = (scaledWidth * scaledHeight * 4 * frameCount) / (1024 * 1024) // サイズをMBで推定

            if (estimatedSize < targetSizeInBytes) {
                low = mid
            } else {
                high = mid
            }
        }

        return low // 最適なスケールファクター
    }

    const generateAPNG = async () => {
        if (!sourceImage || !canvasRef.current) {
            setError('画像が選択されていません。画像を選択してからAPNGを生成してください。')
            return
        }

        setGenerationState('generating')
        setGenerationProgress(0)
        setGenerationPhase('measuring')  // 即座にフェーズ表示
        setError(null)

        // UIに制御を戻してモーダルを表示
        await new Promise(resolve => setTimeout(resolve, 10))

        const canvas = canvasRef.current
        const ctx = canvas.getContext('2d', { willReadFrequently: true })
        if (!ctx) {
            setError('キャンバスのコンテキストを取得できませんでした。ブラウザをリロードして再試行してください。')
            setGenerationState('idle')
            setGenerationPhase('idle')
            return
        }

        try {
            let frameCount = getFrameCount()

            // 高画質Base Scale（V121.4: 制限ギリギリを狙う）
            let baseScale = 1.0
            if (sizeLimit !== null) {
                // V121.23: 10MB以上の場合は高解像度(2000px)を許容
                // 5MB → 1200px, 1MB → 1000px
                const maxDimension = sizeLimit >= 10 ? 2000 : (sizeLimit >= 5 ? 1200 : 1000)
                const longerSide = Math.max(sourceImage.width, sourceImage.height)
                if (longerSide > maxDimension) {
                    baseScale = maxDimension / longerSide
                    console.log(`高画質Base Scale: ${longerSide}px → ${maxDimension}px (${(baseScale * 100).toFixed(0)}%)`)
                }
            }

            // 圧縮ステップ定義 (V121.4 フルカラー対応・高画質優先)
            const COMPRESSION_STEPS = [
                { colorNum: 0, scale: 1.0, name: 'フルカラー100%' },
                { colorNum: 0, scale: 0.85, name: 'フルカラー85%' },
                { colorNum: 0, scale: 0.70, name: 'フルカラー70%' },
                { colorNum: 256, scale: 1.0, name: '256色100%' },
                { colorNum: 256, scale: 0.85, name: '256色85%' },
                { colorNum: 256, scale: 0.70, name: '256色70%' },
                { colorNum: 128, scale: 0.60, name: '128色60%' },
                { colorNum: 64, scale: 0.50, name: '64色50%' },
                { colorNum: 64, scale: 0.30, name: '64色30%' },
            ]

            // 縮小版実測で最適な圧縮設定を決定（V121.4）
            let selectedStep = COMPRESSION_STEPS[0]
            let selectedStepIndex = 0  // V121.12: リトライ用にインデックス追跡
            let estimatedSizeBytes = 0
            const targetBytes = sizeLimit !== null ? sizeLimit * 1024 * 1024 : Infinity
            // ココフォリアは制限より少し大きくても許容するため、バッファを設ける
            // 5MB制限: 5.3MBまで許容（6%オーバー）、1MB制限: 1.2MBまで許容（20%オーバー）
            const allowedOverage = sizeLimit !== null ? (sizeLimit >= 5 ? 1.06 : 1.2) : 1.0
            const allowedBytes = targetBytes * allowedOverage

            // エフェクトカテゴリ定義（圧縮係数決定用）- 関数より先に定義
            const LIGHT_EFFECTS = ['fadeIn', 'fadeOut', 'slideIn', 'slideOut', 'wipeIn', 'wipeOut', 'blindIn', 'blindOut', 'none']
            const MEDIUM_EFFECTS = ['zoomUp', 'zoomUpOut', 'irisIn', 'irisOut', 'pageFlipIn', 'pageFlipOut', 'cardFlipIn', 'cardFlipOut', 'swordSlashOut', 'focusIn', 'focusOut', 'sliceIn', 'sliceOut', 'tileIn', 'tileOut']
            const COMPLEX_EFFECTS = ['rgbShift', 'pixelate', 'pixelateIn', 'pixelateOut', 'glitch', 'glitchIn', 'glitchOut', 'tvStatic', 'tvStaticIn', 'tvStaticOut', 'pulsation', 'silhouette']
            const effectCategory: 'light' | 'medium' | 'complex' = LIGHT_EFFECTS.includes(transition) ? 'light' : MEDIUM_EFFECTS.includes(transition) ? 'medium' : COMPLEX_EFFECTS.includes(transition) ? 'complex' : 'medium'
            const isComplexEffect = effectCategory === 'complex'
            const categoryLabel = effectCategory === 'light' ? '軽量' : effectCategory === 'medium' ? '中程度' : '複雑'

            // フレーム生成ヘルパー（テスト専用キャンバスを使用）
            // V121.20: フレーム生成のみ（エンコードは別途Workerで実行）
            const generateFramesOnly = (testScale: number): { frames: ArrayBuffer[], delays: number[], width: number, height: number } => {
                const testWidth = Math.floor(sourceImage.width * testScale)
                const testHeight = Math.floor(sourceImage.height * testScale)

                // テスト専用の独立したキャンバスを作成（本番キャンバスとの干渉を防ぐ）
                const testCanvas = document.createElement('canvas')
                testCanvas.width = testWidth
                testCanvas.height = testHeight
                const testCtx = testCanvas.getContext('2d', { willReadFrequently: true })!

                const testFrames: ArrayBuffer[] = []
                const testDelays: number[] = []

                const drawTestImage = (x: number, y: number, w: number, h: number) => {
                    testCtx.drawImage(sourceImage, 0, 0, sourceImage.width, sourceImage.height, x, y, w, h)
                }

                for (let i = 0; i < frameCount; i++) {
                    const progress = i / (frameCount - 1)
                    testCtx.clearRect(0, 0, testCanvas.width, testCanvas.height)

                    // V121.13: テスト描画を本番エフェクトと同様に変更
                    // これにより係数推定精度が大幅向上
                    switch (transition) {
                        case 'fadeIn':
                            testCtx.globalAlpha = progress
                            drawTestImage(0, 0, testCanvas.width, testCanvas.height)
                            testCtx.globalAlpha = 1
                            break
                        case 'fadeOut':
                            if (effectIntensity !== 'none' || effectOption !== 'none') {
                                if (progress >= 0.95) break
                            }
                            testCtx.globalAlpha = 1 - progress
                            drawTestImage(0, 0, testCanvas.width, testCanvas.height)
                            testCtx.globalAlpha = 1
                            break
                        case 'none':
                            drawTestImage(0, 0, testCanvas.width, testCanvas.height)
                            break
                        // --- 登場エフェクト（実際の描画） ---
                        case 'slideIn': {
                            let offsetX = 0, offsetY = 0
                            switch (effectDirection) {
                                case 'left': offsetX = Math.floor((1 - progress) * testCanvas.width); break
                                case 'right': offsetX = Math.floor((progress - 1) * testCanvas.width); break
                                case 'up': offsetY = Math.floor((1 - progress) * testCanvas.height); break
                                case 'down': default: offsetY = Math.floor((progress - 1) * testCanvas.height); break
                            }
                            drawTestImage(offsetX, offsetY, testCanvas.width, testCanvas.height)
                            break
                        }
                        case 'wipeIn': {
                            testCtx.save()
                            testCtx.beginPath()
                            switch (effectDirection) {
                                case 'left': testCtx.rect(Math.floor(testCanvas.width * (1 - progress)), 0, Math.ceil(testCanvas.width * progress), testCanvas.height); break
                                case 'right': testCtx.rect(0, 0, Math.ceil(testCanvas.width * progress), testCanvas.height); break
                                case 'up': testCtx.rect(0, Math.floor(testCanvas.height * (1 - progress)), testCanvas.width, Math.ceil(testCanvas.height * progress)); break
                                case 'down': default: testCtx.rect(0, 0, testCanvas.width, Math.ceil(testCanvas.height * progress)); break
                            }
                            testCtx.clip()
                            drawTestImage(0, 0, testCanvas.width, testCanvas.height)
                            testCtx.restore()
                            break
                        }
                        case 'zoomUp': {
                            const isUp = effectOption === 'up'
                            const scaleIn = isUp ? (0.5 + progress * 0.5) : (1.5 - progress * 0.5)
                            const w = Math.floor(testCanvas.width * scaleIn)
                            const h = Math.floor(testCanvas.height * scaleIn)
                            const x = Math.floor(testCanvas.width / 2 - w / 2)
                            const y = Math.floor(testCanvas.height / 2 - h / 2)
                            testCtx.drawImage(sourceImage, 0, 0, sourceImage.width, sourceImage.height, x, y, w, h)
                            break
                        }
                        case 'doorClose': {
                            const halfW = Math.floor(testCanvas.width / 2)
                            testCtx.drawImage(sourceImage, 0, 0, Math.floor(sourceImage.width / 2), sourceImage.height,
                                Math.floor(-halfW + progress * halfW), 0, halfW, testCanvas.height)
                            testCtx.drawImage(sourceImage, Math.floor(sourceImage.width / 2), 0, Math.floor(sourceImage.width / 2), sourceImage.height,
                                Math.floor(testCanvas.width - progress * halfW), 0, halfW, testCanvas.height)
                            break
                        }
                        case 'tvStaticIn': {
                            drawTestImage(0, 0, testCanvas.width, testCanvas.height)
                            const staticData = testCtx.getImageData(0, 0, testCanvas.width, testCanvas.height)
                            const staticIntensity = 1 - progress
                            for (let p = 0; p < staticData.data.length; p += 4) {
                                if (Math.random() < staticIntensity) {
                                    const noise = Math.random() * 255
                                    staticData.data[p] = staticData.data[p + 1] = staticData.data[p + 2] = noise
                                }
                            }
                            testCtx.putImageData(staticData, 0, 0)
                            break
                        }
                        case 'blindIn': {
                            const blindCount = effectOption ? parseInt(effectOption as string) : 7
                            const isVertical = effectDirection === 'horizontal'
                            for (let bi = 0; bi < blindCount; bi++) {
                                const start = Math.floor(bi * (isVertical ? testCanvas.height : testCanvas.width) / blindCount)
                                const next = Math.floor((bi + 1) * (isVertical ? testCanvas.height : testCanvas.width) / blindCount)
                                const size = next - start
                                const openAmount = Math.ceil(progress * size)
                                testCtx.save()
                                testCtx.beginPath()
                                if (isVertical) { testCtx.rect(0, start, testCanvas.width, openAmount) }
                                else { testCtx.rect(start, 0, openAmount, testCanvas.height) }
                                testCtx.clip()
                                drawTestImage(0, 0, testCanvas.width, testCanvas.height)
                                testCtx.restore()
                            }
                            break
                        }
                        case 'irisIn': {
                            const radius = Math.max(testCanvas.width, testCanvas.height) * progress
                            testCtx.save()
                            testCtx.beginPath()
                            testCtx.arc(testCanvas.width / 2, testCanvas.height / 2, radius, 0, Math.PI * 2)
                            testCtx.clip()
                            drawTestImage(0, 0, testCanvas.width, testCanvas.height)
                            testCtx.restore()
                            break
                        }
                        case 'tileIn': {
                            const tileCount = effectOption ? parseInt(effectOption as string) : 4
                            for (let ty = 0; ty < tileCount; ty++) {
                                for (let tx = 0; tx < tileCount; tx++) {
                                    const tileIndex = ty * tileCount + tx
                                    const tileProgress = Math.max(0, Math.min(1, progress * tileCount * tileCount - tileIndex))
                                    if (tileProgress > 0) {
                                        const tw = testCanvas.width / tileCount
                                        const th = testCanvas.height / tileCount
                                        testCtx.save()
                                        testCtx.beginPath()
                                        testCtx.rect(tx * tw, ty * th, tw, th)
                                        testCtx.clip()
                                        testCtx.globalAlpha = tileProgress
                                        drawTestImage(0, 0, testCanvas.width, testCanvas.height)
                                        testCtx.globalAlpha = 1
                                        testCtx.restore()
                                    }
                                }
                            }
                            break
                        }
                        // --- 追加の登場エフェクト（V121.22追加） ---
                        case 'glitchIn': {
                            const glitchInBase = effectOption === 'weak' ? 0.15 : effectOption === 'strong' ? 0.5 : 0.3
                            const glitchInIntensity = 1 - progress
                            testCtx.globalAlpha = progress
                            for (let s = 0; s < 10; s++) {
                                const sliceY = Math.floor(s * testCanvas.height / 10)
                                const nextSliceY = Math.floor((s + 1) * testCanvas.height / 10)
                                const sliceH = nextSliceY - sliceY
                                const srcSliceY = Math.floor(s * sourceImage.height / 10)
                                const srcSliceH = Math.floor(sourceImage.height / 10)
                                const offsetX = Math.floor((Math.random() - 0.5) * testCanvas.width * glitchInBase * glitchInIntensity)
                                if (sliceH > 0 && srcSliceH > 0) {
                                    testCtx.drawImage(sourceImage, 0, srcSliceY, sourceImage.width, srcSliceH, offsetX, sliceY, testCanvas.width, sliceH)
                                }
                            }
                            testCtx.globalAlpha = 1
                            break
                        }
                        case 'focusIn': {
                            testCtx.filter = `blur(${(1 - progress) * 20}px)`
                            drawTestImage(0, 0, testCanvas.width, testCanvas.height)
                            testCtx.filter = 'none'
                            break
                        }
                        case 'sliceIn': {
                            const sliceInCount = effectOption ? parseInt(effectOption as string) : 4
                            testCtx.globalAlpha = progress
                            for (let s = 0; s < sliceInCount; s++) {
                                const dstY = Math.floor(s * testCanvas.height / sliceInCount)
                                const dstNextY = Math.floor((s + 1) * testCanvas.height / sliceInCount)
                                const dstH = dstNextY - dstY
                                const srcY = Math.floor(s * sourceImage.height / sliceInCount)
                                const srcNextY = Math.floor((s + 1) * sourceImage.height / sliceInCount)
                                const srcH = srcNextY - srcY
                                const offsetX = (s % 2 === 0 ? -1 : 1) * (1 - progress) * testCanvas.width * 0.5
                                if (dstH > 0 && srcH > 0) {
                                    testCtx.drawImage(sourceImage, 0, srcY, sourceImage.width, srcH, offsetX, dstY, testCanvas.width, dstH)
                                }
                            }
                            testCtx.globalAlpha = 1
                            break
                        }
                        case 'pixelateIn': {
                            const maxPixelSize = 32
                            const pixelSize = Math.max(1, Math.floor(maxPixelSize * (1 - progress)))
                            const tempCanvas = document.createElement('canvas')
                            const smallW = Math.max(1, Math.floor(testCanvas.width / pixelSize))
                            const smallH = Math.max(1, Math.floor(testCanvas.height / pixelSize))
                            tempCanvas.width = smallW
                            tempCanvas.height = smallH
                            const tempCtx = tempCanvas.getContext('2d', { willReadFrequently: true })!
                            tempCtx.drawImage(sourceImage, 0, 0, smallW, smallH)
                            testCtx.imageSmoothingEnabled = false
                            testCtx.drawImage(tempCanvas, 0, 0, testCanvas.width, testCanvas.height)
                            testCtx.imageSmoothingEnabled = true
                            break
                        }
                        case 'cardFlipIn': {
                            testCtx.save()
                            const flipInCount = effectOption ? parseInt((effectOption as string).replace('x', '')) : 1
                            const startAngleIn = (flipInCount - 1) * Math.PI + (Math.PI / 2)
                            const currentAngleIn = startAngleIn * (1 - progress)
                            const cardInScale = Math.cos(currentAngleIn)
                            testCtx.translate(testCanvas.width / 2, testCanvas.height / 2)
                            testCtx.scale(cardInScale, 1)
                            testCtx.translate(-testCanvas.width / 2, -testCanvas.height / 2)
                            drawTestImage(0, 0, testCanvas.width, testCanvas.height)
                            testCtx.restore()
                            break
                        }
                        case 'pageFlipIn': {
                            const isRightFlipIn = effectOption === 'right'
                            testCtx.save()
                            const flipInSkew = (1 - progress) * 0.5
                            if (isRightFlipIn) {
                                testCtx.transform(progress, 0, -flipInSkew, 1, testCanvas.width * (1 - progress), 0)
                            } else {
                                testCtx.transform(progress, 0, flipInSkew, 1, 0, 0)
                            }
                            testCtx.globalAlpha = Math.max(0, Math.min(1, progress * 1.5))
                            drawTestImage(0, 0, testCanvas.width, testCanvas.height)
                            testCtx.restore()
                            break
                        }
                        case 'swordSlashIn': {
                            if (progress < 0.3) {
                                const flashProg = progress / 0.3
                                testCtx.globalAlpha = flashProg * 0.8
                                testCtx.fillStyle = 'white'
                                testCtx.fillRect(0, 0, testCanvas.width, testCanvas.height)
                                testCtx.globalAlpha = 1
                            } else if (progress < 0.5) {
                                const slashProg = (progress - 0.3) / 0.2
                                testCtx.globalAlpha = 1 - slashProg * 0.2
                                testCtx.fillStyle = 'white'
                                testCtx.fillRect(0, 0, testCanvas.width, testCanvas.height)
                                testCtx.globalAlpha = slashProg
                                drawTestImage(0, 0, testCanvas.width, testCanvas.height)
                                testCtx.globalAlpha = 1
                            } else {
                                const fadeProg = (progress - 0.5) / 0.5
                                const numSlices = 4
                                for (let s = 0; s < numSlices; s++) {
                                    const sliceH = testCanvas.height / numSlices
                                    const sliceY = s * sliceH
                                    const offsetX = (s % 2 === 0 ? -1 : 1) * (1 - fadeProg) * testCanvas.width * 0.3
                                    testCtx.globalAlpha = 0.5 + fadeProg * 0.5
                                    testCtx.drawImage(sourceImage, 0, Math.floor(s * sourceImage.height / numSlices), sourceImage.width, Math.floor(sourceImage.height / numSlices),
                                        offsetX, sliceY, testCanvas.width, sliceH)
                                }
                                testCtx.globalAlpha = 1
                            }
                            break
                        }
                        // --- 退場エフェクト（V121.21追加） ---
                        case 'slideOut': {
                            let offsetX = 0, offsetY = 0
                            switch (effectDirection) {
                                case 'left': offsetX = Math.floor(-progress * testCanvas.width); break
                                case 'right': offsetX = Math.floor(progress * testCanvas.width); break
                                case 'up': offsetY = Math.floor(-progress * testCanvas.height); break
                                case 'down': default: offsetY = Math.floor(progress * testCanvas.height); break
                            }
                            drawTestImage(offsetX, offsetY, testCanvas.width, testCanvas.height)
                            break
                        }
                        case 'wipeOut': {
                            testCtx.save()
                            testCtx.beginPath()
                            switch (effectDirection) {
                                case 'left': testCtx.rect(0, 0, Math.ceil(testCanvas.width * (1 - progress)), testCanvas.height); break
                                case 'right': testCtx.rect(Math.floor(testCanvas.width * progress), 0, Math.ceil(testCanvas.width * (1 - progress)), testCanvas.height); break
                                case 'up': testCtx.rect(0, 0, testCanvas.width, Math.ceil(testCanvas.height * (1 - progress))); break
                                case 'down': default: testCtx.rect(0, Math.floor(testCanvas.height * progress), testCanvas.width, Math.ceil(testCanvas.height * (1 - progress))); break
                            }
                            testCtx.clip()
                            drawTestImage(0, 0, testCanvas.width, testCanvas.height)
                            testCtx.restore()
                            break
                        }
                        case 'zoomUpOut':
                        case 'zoomDownOut': {
                            const isUp = transition === 'zoomUpOut'
                            const scaleOut = isUp ? (1 + progress * 0.5) : (1 - progress * 0.5)
                            const w = Math.floor(testCanvas.width * scaleOut)
                            const h = Math.floor(testCanvas.height * scaleOut)
                            const x = Math.floor(testCanvas.width / 2 - w / 2)
                            const y = Math.floor(testCanvas.height / 2 - h / 2)
                            testCtx.globalAlpha = 1 - progress
                            testCtx.drawImage(sourceImage, 0, 0, sourceImage.width, sourceImage.height, x, y, w, h)
                            testCtx.globalAlpha = 1
                            break
                        }
                        case 'doorOpen': {
                            const halfW = Math.floor(testCanvas.width / 2)
                            const openProgress = 1 - progress
                            testCtx.drawImage(sourceImage, 0, 0, Math.floor(sourceImage.width / 2), sourceImage.height,
                                Math.floor(-halfW + openProgress * halfW), 0, halfW, testCanvas.height)
                            testCtx.drawImage(sourceImage, Math.floor(sourceImage.width / 2), 0, Math.floor(sourceImage.width / 2), sourceImage.height,
                                Math.floor(testCanvas.width - openProgress * halfW), 0, halfW, testCanvas.height)
                            break
                        }
                        case 'tvStaticOut': {
                            drawTestImage(0, 0, testCanvas.width, testCanvas.height)
                            const staticData = testCtx.getImageData(0, 0, testCanvas.width, testCanvas.height)
                            const staticIntensity = progress
                            for (let p = 0; p < staticData.data.length; p += 4) {
                                if (Math.random() < staticIntensity) {
                                    const noise = Math.random() * 255
                                    staticData.data[p] = staticData.data[p + 1] = staticData.data[p + 2] = noise
                                }
                            }
                            testCtx.putImageData(staticData, 0, 0)
                            break
                        }
                        case 'blindOut': {
                            const blindCount = effectOption ? parseInt(effectOption as string) : 7
                            const isVertical = effectDirection === 'horizontal'
                            for (let bi = 0; bi < blindCount; bi++) {
                                const start = Math.floor(bi * (isVertical ? testCanvas.height : testCanvas.width) / blindCount)
                                const next = Math.floor((bi + 1) * (isVertical ? testCanvas.height : testCanvas.width) / blindCount)
                                const size = next - start
                                const openAmount = Math.ceil((1 - progress) * size)
                                testCtx.save()
                                testCtx.beginPath()
                                if (isVertical) { testCtx.rect(0, start, testCanvas.width, openAmount) }
                                else { testCtx.rect(start, 0, openAmount, testCanvas.height) }
                                testCtx.clip()
                                drawTestImage(0, 0, testCanvas.width, testCanvas.height)
                                testCtx.restore()
                            }
                            break
                        }
                        case 'irisOut': {
                            const maxRadius = Math.max(testCanvas.width, testCanvas.height)
                            const radius = maxRadius * (1 - progress)
                            testCtx.save()
                            testCtx.beginPath()
                            testCtx.arc(testCanvas.width / 2, testCanvas.height / 2, radius, 0, Math.PI * 2)
                            testCtx.clip()
                            drawTestImage(0, 0, testCanvas.width, testCanvas.height)
                            testCtx.restore()
                            break
                        }
                        case 'tileOut': {
                            const tileCount = effectOption ? parseInt(effectOption as string) : 4
                            for (let ty = 0; ty < tileCount; ty++) {
                                for (let tx = 0; tx < tileCount; tx++) {
                                    const tileIndex = ty * tileCount + tx
                                    const tileProgress = Math.max(0, Math.min(1, progress * tileCount * tileCount - tileIndex))
                                    const tileAlpha = 1 - tileProgress
                                    if (tileAlpha > 0) {
                                        const tw = testCanvas.width / tileCount
                                        const th = testCanvas.height / tileCount
                                        testCtx.save()
                                        testCtx.beginPath()
                                        testCtx.rect(tx * tw, ty * th, tw, th)
                                        testCtx.clip()
                                        testCtx.globalAlpha = tileAlpha
                                        drawTestImage(0, 0, testCanvas.width, testCanvas.height)
                                        testCtx.globalAlpha = 1
                                        testCtx.restore()
                                    }
                                }
                            }
                            break
                        }
                        // --- 追加の退場エフェクト（V121.22） ---
                        case 'glitchOut': {
                            if (effectIntensity !== 'none' || effectOption !== 'none') {
                                if (progress >= 0.95) break
                            }
                            const glitchOutBase = effectOption === 'weak' ? 0.15 : effectOption === 'strong' ? 0.5 : 0.3
                            const glitchOutIntensity = progress
                            testCtx.globalAlpha = 1 - progress
                            for (let s = 0; s < 10; s++) {
                                const sliceY = Math.floor(s * testCanvas.height / 10)
                                const nextSliceY = Math.floor((s + 1) * testCanvas.height / 10)
                                const sliceH = nextSliceY - sliceY
                                const srcSliceY = Math.floor(s * sourceImage.height / 10)
                                const srcSliceH = Math.floor(sourceImage.height / 10)
                                const offsetX = Math.floor((Math.random() - 0.5) * testCanvas.width * glitchOutBase * glitchOutIntensity)
                                if (sliceH > 0 && srcSliceH > 0) {
                                    testCtx.drawImage(sourceImage, 0, srcSliceY, sourceImage.width, srcSliceH, offsetX, sliceY, testCanvas.width, sliceH)
                                }
                            }
                            testCtx.globalAlpha = 1
                            break
                        }
                        case 'focusOut': {
                            if (effectOption !== 'none' && progress >= 0.99) break
                            if (effectOption === 'fade') testCtx.globalAlpha = 1 - progress
                            testCtx.filter = `blur(${progress * 20}px)`
                            drawTestImage(0, 0, testCanvas.width, testCanvas.height)
                            testCtx.filter = 'none'
                            if (effectOption === 'fade') testCtx.globalAlpha = 1
                            break
                        }
                        case 'sliceOut': {
                            if (effectIntensity !== 'none' || effectOption !== 'none') {
                                if (progress >= 0.95) break
                            }
                            const sliceOutCount = effectOption ? parseInt(effectOption as string) : 4
                            testCtx.globalAlpha = 1 - progress
                            for (let s = 0; s < sliceOutCount; s++) {
                                const dstY = Math.floor(s * testCanvas.height / sliceOutCount)
                                const dstNextY = Math.floor((s + 1) * testCanvas.height / sliceOutCount)
                                const dstH = dstNextY - dstY
                                const srcY = Math.floor(s * sourceImage.height / sliceOutCount)
                                const srcNextY = Math.floor((s + 1) * sourceImage.height / sliceOutCount)
                                const srcH = srcNextY - srcY
                                const offsetX = (s % 2 === 0 ? -1 : 1) * progress * testCanvas.width * 0.5
                                if (dstH > 0 && srcH > 0) {
                                    testCtx.drawImage(sourceImage, 0, srcY, sourceImage.width, srcH, offsetX, dstY, testCanvas.width, dstH)
                                }
                            }
                            testCtx.globalAlpha = 1
                            break
                        }
                        case 'cardFlipOut': {
                            if (effectIntensity !== 'none' || effectOption !== 'none') {
                                if (progress >= 0.95) break
                            }
                            testCtx.save()
                            const flipOutCount = effectOption ? parseInt((effectOption as string).replace('x', '')) : 1
                            const endAngleOut = (flipOutCount - 1) * Math.PI + (Math.PI / 2)
                            const currentAngleOut = endAngleOut * progress
                            const cardOutScale = Math.cos(currentAngleOut)
                            testCtx.translate(testCanvas.width / 2, testCanvas.height / 2)
                            testCtx.scale(cardOutScale, 1)
                            testCtx.translate(-testCanvas.width / 2, -testCanvas.height / 2)
                            drawTestImage(0, 0, testCanvas.width, testCanvas.height)
                            testCtx.restore()
                            break
                        }
                        case 'pageFlipOut': {
                            if (effectIntensity !== 'none' || effectOption !== 'none') {
                                if (progress >= 0.98) break
                            }
                            const isRightFlipOut = effectOption === 'right'
                            testCtx.save()
                            const flipOutSkew = progress * 0.5
                            if (isRightFlipOut) {
                                testCtx.transform(1 - progress, 0, flipOutSkew, 1, testCanvas.width * progress, 0)
                            } else {
                                testCtx.transform(1 - progress, 0, -flipOutSkew, 1, 0, 0)
                            }
                            testCtx.globalAlpha = Math.max(0, Math.min(1, (1 - progress) * 1.5))
                            drawTestImage(0, 0, testCanvas.width, testCanvas.height)
                            testCtx.restore()
                            break
                        }
                        case 'swordSlashOut': {
                            if (effectIntensity !== 'none' || effectOption !== 'none') {
                                if (progress >= 0.95) break
                            }
                            if (progress < 0.3) {
                                drawTestImage(0, 0, testCanvas.width, testCanvas.height)
                            } else if (progress < 0.5) {
                                const slashProg = (progress - 0.3) / 0.2
                                testCtx.globalAlpha = slashProg * 0.8
                                testCtx.fillStyle = 'white'
                                testCtx.fillRect(0, 0, testCanvas.width, testCanvas.height)
                                testCtx.globalAlpha = 1
                                drawTestImage(0, 0, testCanvas.width, testCanvas.height)
                            } else {
                                const fadeProg = (progress - 0.5) / 0.5
                                const numSlices = 4
                                for (let s = 0; s < numSlices; s++) {
                                    const sliceH = testCanvas.height / numSlices
                                    const sliceY = s * sliceH
                                    const offsetX = (s % 2 === 0 ? -1 : 1) * fadeProg * testCanvas.width * 0.3
                                    testCtx.globalAlpha = 1 - fadeProg
                                    testCtx.drawImage(sourceImage, 0, Math.floor(s * sourceImage.height / numSlices), sourceImage.width, Math.floor(sourceImage.height / numSlices),
                                        offsetX, sliceY, testCanvas.width, sliceH)
                                }
                                testCtx.globalAlpha = 1
                            }
                            break
                        }
                        case 'pixelateOut': {
                            if (effectIntensity !== 'none' || effectOption !== 'none') {
                                if (progress >= 0.95) break
                            }
                            const maxPixelSizeOut = 32
                            const pixelSizeOut = Math.max(1, Math.floor(maxPixelSizeOut * progress))
                            const tempCanvasOut = document.createElement('canvas')
                            const smallWOut = Math.max(1, Math.floor(testCanvas.width / pixelSizeOut))
                            const smallHOut = Math.max(1, Math.floor(testCanvas.height / pixelSizeOut))
                            tempCanvasOut.width = smallWOut
                            tempCanvasOut.height = smallHOut
                            const tempCtxOut = tempCanvasOut.getContext('2d', { willReadFrequently: true })!
                            tempCtxOut.drawImage(sourceImage, 0, 0, smallWOut, smallHOut)
                            testCtx.imageSmoothingEnabled = false
                            testCtx.globalAlpha = 1 - progress * 0.5
                            testCtx.drawImage(tempCanvasOut, 0, 0, testCanvas.width, testCanvas.height)
                            testCtx.globalAlpha = 1
                            testCtx.imageSmoothingEnabled = true
                            break
                        }
                        // === 演出エフェクト ===
                        case 'rotate': {
                            const rotateDir = effectOption === 'right' ? 1 : -1
                            testCtx.save()
                            testCtx.translate(testCanvas.width / 2, testCanvas.height / 2)
                            testCtx.rotate(progress * Math.PI * 2 * rotateDir)
                            testCtx.translate(-testCanvas.width / 2, -testCanvas.height / 2)
                            drawTestImage(0, 0, testCanvas.width, testCanvas.height)
                            testCtx.restore()
                            break
                        }
                        case 'spiral': {
                            const spiralDir = effectOption === 'right' ? 1 : -1
                            testCtx.save()
                            testCtx.translate(testCanvas.width / 2, testCanvas.height / 2)
                            testCtx.rotate(progress * Math.PI * 4 * spiralDir)
                            testCtx.scale(1 - progress * 0.5, 1 - progress * 0.5)
                            testCtx.translate(-testCanvas.width / 2, -testCanvas.height / 2)
                            drawTestImage(0, 0, testCanvas.width, testCanvas.height)
                            testCtx.restore()
                            break
                        }
                        case 'bounce': {
                            const bounceProgress = Math.sin(progress * Math.PI)
                            const bounceOffset = Math.floor(bounceProgress * testCanvas.height * 0.05)
                            drawTestImage(0, bounceOffset, testCanvas.width, testCanvas.height)
                            break
                        }
                        case 'vibration': {
                            const intensityVal = effectIntensity === 'weak' ? 5 : effectIntensity === 'strong' ? 20 : 10
                            let vOffsetX = 0, vOffsetY = 0
                            if (effectDirection === 'vertical') {
                                vOffsetY = Math.floor((Math.random() - 0.5) * intensityVal * 2)
                            } else if (effectDirection === 'horizontal') {
                                vOffsetX = Math.floor((Math.random() - 0.5) * intensityVal * 2)
                            } else {
                                vOffsetX = Math.floor((Math.random() - 0.5) * intensityVal * 2)
                                vOffsetY = Math.floor((Math.random() - 0.5) * intensityVal * 2)
                            }
                            drawTestImage(vOffsetX, vOffsetY, testCanvas.width, testCanvas.height)
                            break
                        }
                        case 'glitch': {
                            // effectOptionで強度を決定（本番と同じ: weak=0.05, medium=0.1, strong=0.2）
                            const glitchBase = effectOption === 'weak' ? 0.05 : effectOption === 'strong' ? 0.2 : 0.1
                            drawTestImage(0, 0, testCanvas.width, testCanvas.height)
                            const glitchIntensity = 1 - progress
                            for (let j = 0; j < 10; j++) {
                                const y = Math.floor(Math.random() * testCanvas.height)
                                const height = Math.ceil(Math.random() * testCanvas.height * 0.1)
                                const offset = Math.floor((Math.random() - 0.5) * testCanvas.width * glitchBase * glitchIntensity)

                                const srcY = Math.floor((y / testCanvas.height) * sourceImage.height)
                                const srcH = Math.ceil((height / testCanvas.height) * sourceImage.height)

                                if (height > 0 && srcH > 0) {
                                    testCtx.drawImage(sourceImage, 0, srcY, sourceImage.width, srcH, offset, y, testCanvas.width, height)
                                }
                            }
                            break
                        }
                        case 'tvStatic': {
                            drawTestImage(0, 0, testCanvas.width, testCanvas.height)
                            const tvData = testCtx.getImageData(0, 0, testCanvas.width, testCanvas.height)
                            // ループ時は常に一定の砂嵐を表示（progressを使わない）
                            const noiseIntensity = 0.5
                            for (let p = 0; p < tvData.data.length; p += 4) {
                                if (Math.random() < noiseIntensity) {
                                    const noise = Math.random() * 255
                                    tvData.data[p] = (tvData.data[p] + noise) / 2
                                    tvData.data[p + 1] = (tvData.data[p + 1] + noise) / 2
                                    tvData.data[p + 2] = (tvData.data[p + 2] + noise) / 2
                                }
                            }
                            testCtx.putImageData(tvData, 0, 0)
                            break
                        }
                        case 'enlarge': {
                            const enlargeScale = 1 + progress * 4
                            const ew = Math.floor(testCanvas.width * enlargeScale)
                            const eh = Math.floor(testCanvas.height * enlargeScale)
                            const ex = Math.floor((testCanvas.width - ew) / 2)
                            const ey = Math.floor((testCanvas.height - eh) / 2)
                            testCtx.drawImage(sourceImage, 0, 0, sourceImage.width, sourceImage.height, ex, ey, ew, eh)
                            break
                        }
                        case 'minimize': {
                            const minimizeScale = 5 - progress * 4
                            const mw = Math.floor(testCanvas.width * minimizeScale)
                            const mh = Math.floor(testCanvas.height * minimizeScale)
                            const mx = Math.floor((testCanvas.width - mw) / 2)
                            const my = Math.floor((testCanvas.height - mh) / 2)
                            testCtx.drawImage(sourceImage, 0, 0, sourceImage.width, sourceImage.height, mx, my, mw, mh)
                            break
                        }
                        case 'cardFlipLoop': {
                            testCtx.save()
                            const flipProg = Math.sin(progress * Math.PI * 2)
                            const loopScale = Math.abs(flipProg)
                            testCtx.translate(testCanvas.width / 2, testCanvas.height / 2)
                            testCtx.scale(Math.max(0.01, loopScale), 1)
                            testCtx.translate(-testCanvas.width / 2, -testCanvas.height / 2)
                            drawTestImage(0, 0, testCanvas.width, testCanvas.height)
                            testCtx.restore()
                            break
                        }
                        case 'concentrationLines': {
                            drawTestImage(0, 0, testCanvas.width, testCanvas.height)

                            // 透過部分を保持するため、source-atopモードでエフェクトを描画
                            testCtx.save()
                            testCtx.globalCompositeOperation = 'source-atop'

                            // 周辺のぼかし強め
                            const clVigGrad = testCtx.createRadialGradient(
                                testCanvas.width / 2, testCanvas.height / 2, testCanvas.width * 0.15,
                                testCanvas.width / 2, testCanvas.height / 2, testCanvas.width * 0.8
                            )
                            clVigGrad.addColorStop(0, 'transparent')
                            clVigGrad.addColorStop(0.5, 'rgba(0, 0, 0, 0.3)')
                            clVigGrad.addColorStop(1, 'rgba(0, 0, 0, 0.8)')
                            testCtx.fillStyle = clVigGrad
                            testCtx.fillRect(0, 0, testCanvas.width, testCanvas.height)

                            // 三角形の放射状線
                            const rayCount = 40
                            const shake = Math.sin(progress * Math.PI * 6) * 3
                            const centerX = testCanvas.width / 2
                            const centerY = testCanvas.height / 2

                            // オプションによる半径調整
                            let baseRadiusRatio = 0.25 // default
                            if (effectOption === 'weak') baseRadiusRatio = 0.4
                            if (effectOption === 'strong') baseRadiusRatio = 0.1

                            const inRadius = testCanvas.width * baseRadiusRatio + shake
                            const outRadius = Math.max(testCanvas.width, testCanvas.height) * 0.9

                            testCtx.fillStyle = 'rgba(255, 255, 255, 0.9)'
                            for (let j = 0; j < rayCount; j++) {
                                const baseAngle = (j / rayCount) * Math.PI * 2
                                const angleWidth = (Math.PI * 2 / rayCount) * 0.3
                                const jitter = Math.sin(j * 3 + progress * Math.PI * 4) * 0.02

                                const angle1 = baseAngle - angleWidth / 2 + jitter
                                const angle2 = baseAngle + angleWidth / 2 + jitter

                                testCtx.beginPath()
                                testCtx.moveTo(centerX + Math.cos(baseAngle) * inRadius, centerY + Math.sin(baseAngle) * inRadius)
                                testCtx.lineTo(centerX + Math.cos(angle1) * outRadius, centerY + Math.sin(angle1) * outRadius)
                                testCtx.lineTo(centerX + Math.cos(angle2) * outRadius, centerY + Math.sin(angle2) * outRadius)
                                testCtx.closePath()
                                testCtx.fill()
                            }
                            testCtx.restore()
                            break
                        }
                        case 'flash': {
                            drawTestImage(0, 0, testCanvas.width, testCanvas.height)
                            const flashInt = Math.sin(progress * Math.PI)
                            testCtx.save()
                            testCtx.globalCompositeOperation = 'source-atop'
                            testCtx.fillStyle = `rgba(255, 255, 255, ${flashInt * 0.8})`
                            testCtx.fillRect(0, 0, testCanvas.width, testCanvas.height)
                            testCtx.restore()
                            break
                        }
                        case 'vignette': {
                            drawTestImage(0, 0, testCanvas.width, testCanvas.height)
                            const vigGrad = testCtx.createRadialGradient(
                                testCanvas.width / 2, testCanvas.height / 2, 0,
                                testCanvas.width / 2, testCanvas.height / 2, Math.max(testCanvas.width, testCanvas.height) * 0.7
                            )
                            vigGrad.addColorStop(0, 'rgba(0, 0, 0, 0)')
                            vigGrad.addColorStop(0.5, 'rgba(0, 0, 0, 0)')
                            vigGrad.addColorStop(1, `rgba(0, 0, 0, ${0.3 + progress * 0.5})`)
                            // 透過部分を保持するため、source-atopモードでビネットを描画
                            testCtx.save()
                            testCtx.globalCompositeOperation = 'source-atop'
                            testCtx.fillStyle = vigGrad
                            testCtx.fillRect(0, 0, testCanvas.width, testCanvas.height)
                            testCtx.restore()
                            break
                        }
                        // === 複雑なエフェクト（ピクセル操作） ===
                        case 'rgbShift': {
                            const baseShift = effectOption === 'small' ? 2 : effectOption === 'large' ? 12 : 6
                            const shiftAmt = Math.sin(progress * Math.PI) * testCanvas.width * (baseShift / 100)

                            drawTestImage(0, 0, testCanvas.width, testCanvas.height)
                            const rgbData = testCtx.getImageData(0, 0, testCanvas.width, testCanvas.height)
                            const tempData = new Uint8ClampedArray(rgbData.data)
                            const newData = testCtx.createImageData(testCanvas.width, testCanvas.height)
                            const out = newData.data

                            // R, G, Bのオフセット計算（120度間隔）- Y軸も含める
                            const rOffsetX = Math.round(Math.sin(0) * shiftAmt)
                            const rOffsetY = Math.round(-Math.cos(0) * shiftAmt)
                            const gOffsetX = Math.round(Math.sin(Math.PI * 4 / 3) * shiftAmt)
                            const gOffsetY = Math.round(-Math.cos(Math.PI * 4 / 3) * shiftAmt)
                            const bOffsetX = Math.round(Math.sin(Math.PI * 2 / 3) * shiftAmt)
                            const bOffsetY = Math.round(-Math.cos(Math.PI * 2 / 3) * shiftAmt)

                            for (let y = 0; y < testCanvas.height; y++) {
                                for (let x = 0; x < testCanvas.width; x++) {
                                    const idx = (y * testCanvas.width + x) * 4
                                    const rX = Math.min(Math.max(x - rOffsetX, 0), testCanvas.width - 1)
                                    const rY = Math.min(Math.max(y - rOffsetY, 0), testCanvas.height - 1)
                                    const rIdx = (rY * testCanvas.width + rX) * 4
                                    out[idx] = tempData[rIdx]

                                    const gX = Math.min(Math.max(x - gOffsetX, 0), testCanvas.width - 1)
                                    const gY = Math.min(Math.max(y - gOffsetY, 0), testCanvas.height - 1)
                                    const gIdx = (gY * testCanvas.width + gX) * 4
                                    out[idx + 1] = tempData[gIdx + 1]

                                    const bX = Math.min(Math.max(x - bOffsetX, 0), testCanvas.width - 1)
                                    const bY = Math.min(Math.max(y - bOffsetY, 0), testCanvas.height - 1)
                                    const bIdx = (bY * testCanvas.width + bX) * 4
                                    out[idx + 2] = tempData[bIdx + 2]

                                    out[idx + 3] = tempData[idx + 3] // アルファチャンネルをコピー
                                }
                            }
                            testCtx.putImageData(newData, 0, 0)
                            break
                        }
                        case 'pulsation': {
                            // 脈動: エッジ部分に色のフリンジ（本番と同じ実装）
                            const pulsationSize = effectOption === 'small' ? 3 : effectOption === 'large' ? 12 : 6
                            const aberAmt = Math.sin(progress * Math.PI) * pulsationSize
                            // 元画像を先に描画
                            drawTestImage(0, 0, testCanvas.width, testCanvas.height)

                            // エッジに色を乗せる
                            testCtx.globalCompositeOperation = 'screen'
                            testCtx.globalAlpha = 0.3

                            // 赤（左上にズレ）
                            testCtx.save()
                            testCtx.translate(-aberAmt, -aberAmt)
                            drawTestImage(0, 0, testCanvas.width, testCanvas.height)
                            testCtx.restore()

                            // シアン（右下にズレ）
                            testCtx.save()
                            testCtx.translate(aberAmt, aberAmt)
                            drawTestImage(0, 0, testCanvas.width, testCanvas.height)
                            testCtx.restore()

                            testCtx.globalAlpha = 1
                            testCtx.globalCompositeOperation = 'source-over'
                            break
                        }
                        case 'scanlines': {
                            drawTestImage(0, 0, testCanvas.width, testCanvas.height)

                            const scanlineThickness = effectOption === 'thin' ? 1 : effectOption === 'thick' ? 4 : 2
                            const scanlineSpacing = scanlineThickness * 2

                            // effectIntensityで色を決定（gray/blue/green）
                            const scanlineColor = effectIntensity === 'blue' ? 'rgba(0, 100, 255, 0.3)' :
                                effectIntensity === 'green' ? 'rgba(0, 200, 100, 0.3)' :
                                    'rgba(0, 0, 0, 0.3)'

                            // 透過部分を保持するため、source-atopモードでスキャンラインを描画
                            testCtx.save()
                            testCtx.globalCompositeOperation = 'source-atop'
                            testCtx.fillStyle = scanlineColor
                            for (let y = 0; y < testCanvas.height; y += scanlineSpacing) {
                                testCtx.fillRect(0, y, testCanvas.width, scanlineThickness)
                            }

                            // 動く光のライン効果
                            const scanOffset = (progress * testCanvas.height) % testCanvas.height
                            const scanGrad = testCtx.createLinearGradient(0, scanOffset - 30, 0, scanOffset + 30)
                            scanGrad.addColorStop(0, 'rgba(255, 255, 255, 0)')
                            scanGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.15)')
                            scanGrad.addColorStop(1, 'rgba(255, 255, 255, 0)')
                            testCtx.fillStyle = scanGrad
                            testCtx.fillRect(0, scanOffset - 30, testCanvas.width, 60)
                            testCtx.restore()
                            break
                        }
                        case 'silhouette': {
                            drawTestImage(0, 0, testCanvas.width, testCanvas.height)
                            const isSilhouetteRelease = effectIntensity === 'from-silhouette'

                            let silInt: number
                            if (isSilhouetteRelease) {
                                const holdDuration = 0.3
                                if (progress < holdDuration) {
                                    silInt = 1
                                } else {
                                    silInt = 1 - ((progress - holdDuration) / (1 - holdDuration))
                                }
                            } else {
                                silInt = progress
                            }

                            const silData = testCtx.getImageData(0, 0, testCanvas.width, testCanvas.height)
                            const colorMap: { [key: string]: [number, number, number] } = {
                                white: [255, 255, 255],
                                black: [0, 0, 0],
                                red: [255, 0, 0],
                            }
                            const baseColor = effectOption?.startsWith('outline-') ? effectOption.replace('outline-', '') : (effectOption || 'black')
                            const silColor = colorMap[baseColor] || [0, 0, 0]

                            for (let i = 0; i < silData.data.length; i += 4) {
                                if (silData.data[i + 3] > 0) {
                                    silData.data[i] = Math.round(silData.data[i] * (1 - silInt) + silColor[0] * silInt)
                                    silData.data[i + 1] = Math.round(silData.data[i + 1] * (1 - silInt) + silColor[1] * silInt)
                                    silData.data[i + 2] = Math.round(silData.data[i + 2] * (1 - silInt) + silColor[2] * silInt)
                                }
                            }
                            testCtx.putImageData(silData, 0, 0)
                            break
                        }
                        default:
                            // その他のエフェクト: フェード近似
                            if (transition.endsWith('Out')) {
                                if (effectIntensity !== 'none' || effectOption !== 'none') {
                                    if (progress >= 0.95) break
                                }
                                testCtx.globalAlpha = 1 - progress
                                drawTestImage(0, 0, testCanvas.width, testCanvas.height)
                                testCtx.globalAlpha = 1
                            } else if (transition.endsWith('In')) {
                                testCtx.globalAlpha = progress
                                drawTestImage(0, 0, testCanvas.width, testCanvas.height)
                                testCtx.globalAlpha = 1
                            } else {
                                drawTestImage(0, 0, testCanvas.width, testCanvas.height)
                            }
                            break
                    }

                    testFrames.push(testCtx.getImageData(0, 0, testCanvas.width, testCanvas.height).data.buffer)
                    testDelays.push(Math.round(1000 / fps))
                }

                // V121.20: エンコードせずフレームデータのみ返す（エンコードは呼び出し側でWorker使用）
                return {
                    frames: testFrames,
                    delays: testDelays,
                    width: testCanvas.width,
                    height: testCanvas.height
                }
            }

            // V121.20: トップダウン方式 - 常にフルカラー100%から開始
            // baseScaleのみ適用（stepScaleとの二重縮小を廃止）
            console.time('⏱総生成時間')
            if (sizeLimit !== null) {
                selectedStep = COMPRESSION_STEPS[0] // フルカラー100%
                selectedStepIndex = 0
                console.log(`トップダウン方式開始（V121.20）... エフェクト: ${transition} [${categoryLabel}]`)
                setGenerationPhase('generating')
            } else {
                // 容量制限なしはフルカラー
                selectedStep = { colorNum: 0, scale: 1.0, name: 'フルカラー' }
                console.log(`容量制限なし... エフェクト: ${transition}`)
            }

            // V121.20: baseScaleのみ適用（stepScaleは使わない）
            const finalScale = baseScale
            const scaledWidth = Math.floor(sourceImage.width * finalScale)
            const scaledHeight = Math.floor(sourceImage.height * finalScale)

            console.log(`トップダウン生成: baseScale=${baseScale.toFixed(3)}, サイズ=${scaledWidth}x${scaledHeight}`)
            console.log(`元画像: ${sourceImage.width}x${sourceImage.height} → 生成サイズ: ${scaledWidth}x${scaledHeight}`)

            setOptimizedSize({ width: scaledWidth, height: scaledHeight })
            // 推定容量を計算
            const estimatedMB = (sizeLimit !== null && estimatedSizeBytes > 0)
                ? estimatedSizeBytes / 1024 / 1024
                : (scaledWidth * scaledHeight * 4 * frameCount * 1.1) / 1024 / 1024  // フルカラーの場合の概算
            setCompressionInfo({ colorNum: selectedStep.colorNum, estimatedMB })

            // キャンバスを本番サイズに明示的にリセット
            canvas.width = scaledWidth
            canvas.height = scaledHeight
            ctx.clearRect(0, 0, scaledWidth, scaledHeight)

            console.log(`最終設定: ${selectedStep.name} (${canvas.width}x${canvas.height})`)

            const drawScaledImage = (x: number, y: number, width: number, height: number) => {
                ctx.drawImage(sourceImage, 0, 0, sourceImage.width, sourceImage.height, x, y, width, height)
            }

            // フレーム生成（選択したスケールで1回のみ）
            console.time('⏱フレーム生成')
            let frames: ArrayBuffer[] = []
            let delays: number[] = []


            for (let i = 0; i < frameCount; i++) {
                const progress = i / (frameCount - 1)
                ctx.clearRect(0, 0, canvas.width, canvas.height)

                switch (transition) {
                    case 'fadeIn':
                        ctx.globalAlpha = progress
                        drawScaledImage(0, 0, canvas.width, canvas.height)
                        break
                    case 'fadeOut':
                        if (effectIntensity !== 'none' || effectOption !== 'none') {
                            if (progress >= 0.95) break // 最終フレームは完全透明（効果のみ以外）
                        }
                        ctx.globalAlpha = 1 - progress
                        drawScaledImage(0, 0, canvas.width, canvas.height)
                        break
                    case 'slideIn':
                        // 方向に応じてスライドイン（整数化）
                        switch (effectDirection) {
                            case 'left':
                                // 左矢印：右から左へ移動
                                ctx.drawImage(sourceImage, 0, 0, sourceImage.width, sourceImage.height, Math.floor((1 - progress) * canvas.width), 0, canvas.width, canvas.height)
                                break
                            case 'right':
                                // 右矢印：左から右へ移動
                                ctx.drawImage(sourceImage, 0, 0, sourceImage.width, sourceImage.height, Math.floor((1 - progress) * -canvas.width), 0, canvas.width, canvas.height)
                                break
                            case 'up':
                                // 上矢印：下から上へ移動
                                ctx.drawImage(sourceImage, 0, 0, sourceImage.width, sourceImage.height, 0, Math.floor((1 - progress) * canvas.height), canvas.width, canvas.height)
                                break
                            case 'down':
                            default:
                                // 下矢印：上から下へ移動
                                ctx.drawImage(sourceImage, 0, 0, sourceImage.width, sourceImage.height, 0, Math.floor((1 - progress) * -canvas.height), canvas.width, canvas.height)
                                break
                        }
                        break
                    case 'slideOut':
                        if (effectIntensity !== 'none' || effectOption !== 'none') {
                            if (progress >= 0.95) break // 最終フレームは完全透明（効果のみ以外）
                        }
                        // 方向に応じてスライドアウト（整数化）
                        switch (effectDirection) {
                            case 'left':
                                // 左矢印：左方向へ退場
                                ctx.drawImage(sourceImage, 0, 0, sourceImage.width, sourceImage.height, Math.floor(progress * -canvas.width), 0, canvas.width, canvas.height)
                                break
                            case 'right':
                                // 右矢印：右方向へ退場
                                ctx.drawImage(sourceImage, 0, 0, sourceImage.width, sourceImage.height, Math.floor(progress * canvas.width), 0, canvas.width, canvas.height)
                                break
                            case 'up':
                                // 上矢印：上方向へ退場
                                ctx.drawImage(sourceImage, 0, 0, sourceImage.width, sourceImage.height, 0, Math.floor(progress * -canvas.height), canvas.width, canvas.height)
                                break
                            case 'down':
                            default:
                                // 下矢印：下方向へ退場
                                ctx.drawImage(sourceImage, 0, 0, sourceImage.width, sourceImage.height, 0, Math.floor(progress * canvas.height), canvas.width, canvas.height)
                                break
                        }
                        break
                    // 後方互換性のため旧名も維持
                    case 'slideRight':
                        ctx.drawImage(sourceImage, 0, 0, sourceImage.width, sourceImage.height,
                            Math.min(progress, 1) * canvas.width - canvas.width,
                            0,
                            canvas.width,
                            canvas.height
                        )
                        break
                    case 'slideLeft':
                        ctx.drawImage(sourceImage, 0, 0, sourceImage.width, sourceImage.height, canvas.width - progress * canvas.width, 0, canvas.width, canvas.height)
                        break
                    case 'slideDown':
                        ctx.drawImage(sourceImage, 0, 0, sourceImage.width, sourceImage.height,
                            0,
                            Math.min(progress, 1) * canvas.height - canvas.height,
                            canvas.width,
                            canvas.height
                        )
                        break
                    case 'slideUp':
                        ctx.drawImage(sourceImage, 0, 0, sourceImage.width, sourceImage.height, 0, canvas.height - progress * canvas.height, canvas.width, canvas.height)
                        break
                    case 'wipeIn':
                        ctx.save()
                        ctx.beginPath()
                        switch (effectDirection) {
                            case 'left':
                                ctx.rect(Math.floor(canvas.width * (1 - progress)), 0, Math.ceil(canvas.width * progress), canvas.height)
                                break
                            case 'right':
                                ctx.rect(0, 0, Math.ceil(canvas.width * progress), canvas.height)
                                break
                            case 'up':
                                ctx.rect(0, Math.floor(canvas.height * (1 - progress)), canvas.width, Math.ceil(canvas.height * progress))
                                break
                            case 'down':
                            default:
                                ctx.rect(0, 0, canvas.width, Math.ceil(canvas.height * progress))
                                break
                        }
                        ctx.clip()
                        drawScaledImage(0, 0, canvas.width, canvas.height)
                        ctx.restore()
                        break
                    case 'wipeOut':
                        if (effectIntensity !== 'none' || effectOption !== 'none') {
                            if (progress >= 0.95) break // 最終フレームは完全透明（効果のみ以外）
                        }
                        ctx.save()
                        ctx.beginPath()
                        switch (effectDirection) {
                            case 'left':
                                ctx.rect(0, 0, Math.floor(canvas.width * (1 - progress)), canvas.height)
                                break
                            case 'right':
                                ctx.rect(Math.ceil(canvas.width * progress), 0, Math.floor(canvas.width * (1 - progress)), canvas.height)
                                break
                            case 'up':
                                ctx.rect(0, 0, canvas.width, Math.floor(canvas.height * (1 - progress)))
                                break
                            case 'down':
                            default:
                                ctx.rect(0, Math.ceil(canvas.height * progress), canvas.width, Math.floor(canvas.height * (1 - progress)))
                                break
                        }
                        ctx.clip()
                        drawScaledImage(0, 0, canvas.width, canvas.height)
                        ctx.restore()
                        break
                    // 後方互換性のため旧名も維持
                    case 'wipeRight':
                        ctx.save()
                        ctx.beginPath()
                        ctx.rect(0, 0, Math.ceil(canvas.width * progress), canvas.height)
                        ctx.clip()
                        drawScaledImage(0, 0, canvas.width, canvas.height)
                        ctx.restore()
                        break
                    case 'wipeLeft':
                        ctx.save()
                        ctx.beginPath()
                        ctx.rect(Math.floor(canvas.width * (1 - progress)), 0, Math.ceil(canvas.width * progress), canvas.height)
                        ctx.clip()
                        drawScaledImage(0, 0, canvas.width, canvas.height)
                        ctx.restore()
                        break
                    case 'wipeDown':
                        ctx.save()
                        ctx.beginPath()
                        ctx.rect(0, 0, canvas.width, Math.ceil(canvas.height * progress))
                        ctx.clip()
                        drawScaledImage(0, 0, canvas.width, canvas.height)
                        ctx.restore()
                        break
                    case 'wipeUp':
                        ctx.save()
                        ctx.beginPath()
                        ctx.rect(0, Math.floor(canvas.height * (1 - progress)), canvas.width, Math.ceil(canvas.height * progress))
                        ctx.clip()
                        drawScaledImage(0, 0, canvas.width, canvas.height)
                        ctx.restore()
                        break
                    case 'zoomUp': {
                        const isUp = effectOption === 'up'
                        const scaleIn = isUp ? (0.5 + progress * 0.5) : (1.5 - progress * 0.5)
                        const w = Math.floor(canvas.width * scaleIn)
                        const h = Math.floor(canvas.height * scaleIn)
                        const x = Math.floor(canvas.width / 2 - w / 2)
                        const y = Math.floor(canvas.height / 2 - h / 2)

                        ctx.drawImage(sourceImage, 0, 0, sourceImage.width, sourceImage.height, x, y, w, h)
                        break
                    }
                    case 'zoomUpOut': {
                        if (effectIntensity !== 'none' || effectOption !== 'none') {
                            if (progress >= 0.95) break // 最終フレームは完全透明（効果のみ以外）
                        }
                        const isUpOut = effectOption === 'up'
                        const scaleOut = isUpOut ? (1.0 + progress * 0.5) : (1.0 - progress * 0.5)
                        const w = Math.floor(canvas.width * scaleOut)
                        const h = Math.floor(canvas.height * scaleOut)
                        const x = Math.floor(canvas.width / 2 - w / 2)
                        const y = Math.floor(canvas.height / 2 - h / 2)

                        ctx.globalAlpha = 1.0 - progress
                        ctx.drawImage(sourceImage, 0, 0, sourceImage.width, sourceImage.height, x, y, w, h)
                        ctx.globalAlpha = 1.0
                        break
                    }
                    case 'rotate':
                        const rotateDir = effectOption === 'right' ? 1 : -1
                        ctx.save()
                        ctx.translate(canvas.width / 2, canvas.height / 2)
                        ctx.rotate(progress * Math.PI * 2 * rotateDir)
                        ctx.translate(-canvas.width / 2, -canvas.height / 2)
                        ctx.drawImage(sourceImage, 0, 0, sourceImage.width, sourceImage.height, 0, 0, canvas.width, canvas.height)
                        ctx.restore()
                        break

                    case 'tvStatic':
                        ctx.drawImage(sourceImage, 0, 0, sourceImage.width, sourceImage.height, 0, 0, canvas.width, canvas.height)
                        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
                        // ループ時は常に一定の砂嵐を表示（progressを使わない）
                        const staticIntensity = 0.5
                        for (let i = 0; i < imageData.data.length; i += 4) {
                            if (Math.random() < staticIntensity) {
                                const noise = Math.random() * 255
                                imageData.data[i] = (imageData.data[i] + noise) / 2
                                imageData.data[i + 1] = (imageData.data[i + 1] + noise) / 2
                                imageData.data[i + 2] = (imageData.data[i + 2] + noise) / 2
                            }
                        }
                        ctx.putImageData(imageData, 0, 0)
                        break
                    case 'enlarge':
                        const enlargeScale = 1 + progress * 4
                        const enW = Math.floor(canvas.width * enlargeScale)
                        const enH = Math.floor(canvas.height * enlargeScale)
                        const enX = Math.floor(canvas.width / 2 - enW / 2)
                        const enY = Math.floor(canvas.height / 2 - enH / 2)

                        ctx.drawImage(sourceImage, 0, 0, sourceImage.width, sourceImage.height, enX, enY, enW, enH)
                        break
                    case 'minimize':
                        const minimizeScale = 5 - progress * 4
                        const minW = Math.floor(canvas.width * minimizeScale)
                        const minH = Math.floor(canvas.height * minimizeScale)
                        const minX = Math.floor(canvas.width / 2 - minW / 2)
                        const minY = Math.floor(canvas.height / 2 - minH / 2)

                        ctx.drawImage(sourceImage, 0, 0, sourceImage.width, sourceImage.height, minX, minY, minW, minH)
                        break
                    case 'spiral':
                        const spiralDir = effectOption === 'right' ? 1 : -1
                        ctx.save()
                        ctx.translate(canvas.width / 2, canvas.height / 2)
                        ctx.rotate(progress * Math.PI * 4 * spiralDir)
                        ctx.scale(1 - progress * 0.5, 1 - progress * 0.5)
                        ctx.translate(-canvas.width / 2, -canvas.height / 2)
                        ctx.drawImage(sourceImage, 0, 0, sourceImage.width, sourceImage.height, 0, 0, canvas.width, canvas.height)
                        ctx.restore()
                        break
                    // V118 Phase 2: 集中線（三角形の放射状線）
                    case 'concentrationLines': {
                        drawScaledImage(0, 0, canvas.width, canvas.height)

                        // 透過部分を保持するため、source-atopモードでエフェクトを描画
                        ctx.save()
                        ctx.globalCompositeOperation = 'source-atop'

                        // 周辺のぼかし強め
                        const clVigGrad = ctx.createRadialGradient(
                            canvas.width / 2, canvas.height / 2, canvas.width * 0.15,
                            canvas.width / 2, canvas.height / 2, canvas.width * 0.8
                        )
                        clVigGrad.addColorStop(0, 'transparent')
                        clVigGrad.addColorStop(0.5, 'rgba(0, 0, 0, 0.3)')
                        clVigGrad.addColorStop(1, 'rgba(0, 0, 0, 0.8)')
                        ctx.fillStyle = clVigGrad
                        ctx.fillRect(0, 0, canvas.width, canvas.height)

                        // 三角形の放射状線
                        const rayCount = 40
                        const shake = Math.sin(progress * Math.PI * 6) * 3
                        const centerX = canvas.width / 2
                        const centerY = canvas.height / 2

                        // オプションによる半径調整
                        let baseRadiusRatio = 0.25 // default
                        if (effectOption === 'weak') baseRadiusRatio = 0.4
                        if (effectOption === 'strong') baseRadiusRatio = 0.1

                        const inRadius = canvas.width * baseRadiusRatio + shake
                        const outRadius = Math.max(canvas.width, canvas.height) * 0.9

                        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'
                        for (let j = 0; j < rayCount; j++) {
                            const baseAngle = (j / rayCount) * Math.PI * 2
                            const angleWidth = (Math.PI * 2 / rayCount) * 0.3
                            const jitter = Math.sin(j * 3 + progress * Math.PI * 4) * 0.02

                            const angle1 = baseAngle - angleWidth / 2 + jitter
                            const angle2 = baseAngle + angleWidth / 2 + jitter

                            ctx.beginPath()
                            ctx.moveTo(centerX + Math.cos(baseAngle) * inRadius, centerY + Math.sin(baseAngle) * inRadius)
                            ctx.lineTo(centerX + Math.cos(angle1) * outRadius, centerY + Math.sin(angle1) * outRadius)
                            ctx.lineTo(centerX + Math.cos(angle2) * outRadius, centerY + Math.sin(angle2) * outRadius)
                            ctx.closePath()
                            ctx.fill()
                        }
                        ctx.restore()
                        break
                    }
                    case 'bounce':
                        const bounceProgress = Math.sin(progress * Math.PI)
                        const bounceOffset = Math.floor(bounceProgress * canvas.height * 0.05)
                        ctx.drawImage(sourceImage, 0, 0, sourceImage.width, sourceImage.height,
                            0,
                            bounceOffset,
                            canvas.width,
                            canvas.height
                        )
                        break
                    case 'verticalVibration':
                        const verticalOffset = Math.floor(Math.sin(progress * Math.PI * 10) * canvas.height * 0.05)
                        ctx.drawImage(sourceImage, 0, 0, sourceImage.width, sourceImage.height, 0, verticalOffset, canvas.width, canvas.height)
                        break
                    case 'horizontalVibration':
                        const horizontalOffset = Math.floor(Math.sin(progress * Math.PI * 10) * canvas.width * 0.05)
                        ctx.drawImage(sourceImage, 0, 0, sourceImage.width, sourceImage.height, horizontalOffset, 0, canvas.width, canvas.height)
                        break
                    case 'glitch': {
                        // effectOptionで強度を決定（weak=0.05, medium=0.1, strong=0.2）
                        const glitchBase = effectOption === 'weak' ? 0.05 : effectOption === 'strong' ? 0.2 : 0.1
                        drawScaledImage(0, 0, canvas.width, canvas.height)
                        const glitchIntensity = 1 - progress
                        for (let j = 0; j < 10; j++) {
                            const y = Math.floor(Math.random() * canvas.height)
                            const height = Math.ceil(Math.random() * canvas.height * 0.1)
                            const offset = Math.floor((Math.random() - 0.5) * canvas.width * glitchBase * glitchIntensity)

                            // glitch用にsourceImageを直接使う
                            const srcY = Math.floor((y / canvas.height) * sourceImage.height)
                            const srcH = Math.ceil((height / canvas.height) * sourceImage.height)

                            if (height > 0 && srcH > 0) {
                                ctx.drawImage(sourceImage, 0, srcY, sourceImage.width, srcH, offset, y, canvas.width, height)
                            }
                        }
                        break
                    }
                    case 'doorOpen':
                        const doorProgress = Math.min(progress * 2, 1)
                        const halfWidth = Math.floor(canvas.width / 2)
                        // 左扉
                        ctx.drawImage(sourceImage, 0, 0, Math.floor(sourceImage.width / 2), sourceImage.height,
                            Math.floor(-doorProgress * halfWidth), 0, halfWidth, canvas.height)
                        // 右扉
                        ctx.drawImage(sourceImage, Math.floor(sourceImage.width / 2), 0, Math.floor(sourceImage.width / 2), sourceImage.height,
                            Math.floor(canvas.width - halfWidth + doorProgress * halfWidth), 0, halfWidth, canvas.height)
                        break

                    // ========== V114 新規効果 ==========

                    // 振動（方向統合: 縦/横/ランダム）
                    case 'vibration': {
                        // effectIntensityで振動幅を決定（weak=5, medium=10, strong=20）
                        const vibBase = effectIntensity === 'weak' ? 5 : effectIntensity === 'strong' ? 20 : 10
                        const vibAmp = Math.sin(progress * Math.PI * 8) * vibBase

                        let offX = 0, offY = 0
                        if (effectDirection === 'vertical') {
                            offY = (Math.random() - 0.5) * vibAmp
                        } else if (effectDirection === 'horizontal') {
                            offX = (Math.random() - 0.5) * vibAmp
                        } else {
                            offX = (Math.random() - 0.5) * vibAmp
                            offY = (Math.random() - 0.5) * vibAmp
                        }

                        ctx.drawImage(sourceImage, 0, 0, sourceImage.width, sourceImage.height, Math.floor(offX), Math.floor(offY), canvas.width, canvas.height)
                        break
                    }


                    // 閉扉（登場）
                    case 'doorClose':
                        const doorCloseProgress = progress
                        const halfW = Math.floor(canvas.width / 2)
                        // 左扉
                        ctx.drawImage(sourceImage, 0, 0, Math.floor(sourceImage.width / 2), sourceImage.height,
                            Math.floor(-halfW + doorCloseProgress * halfW), 0, halfW, canvas.height)
                        // 右扉
                        ctx.drawImage(sourceImage, Math.floor(sourceImage.width / 2), 0, Math.floor(sourceImage.width / 2), sourceImage.height,
                            Math.floor(canvas.width - doorCloseProgress * halfW), 0, halfW, canvas.height)
                        break

                    // 砂嵐イン
                    case 'tvStaticIn': {
                        ctx.drawImage(sourceImage, 0, 0, canvas.width, canvas.height)
                        const staticInData = ctx.getImageData(0, 0, canvas.width, canvas.height)
                        const staticInIntensity = 1 - progress
                        for (let p = 0; p < staticInData.data.length; p += 4) {
                            if (Math.random() < staticInIntensity) {
                                const noise = Math.random() * 255
                                staticInData.data[p] = staticInData.data[p + 1] = staticInData.data[p + 2] = noise
                            }
                            // fadeオプションの場合、透明度も変化
                            if (effectOption === 'fade') {
                                staticInData.data[p + 3] = staticInData.data[p + 3] * progress
                            }
                        }
                        ctx.putImageData(staticInData, 0, 0)
                        break
                    }

                    // 砂嵐アウト
                    case 'tvStaticOut':
                        if (effectOption !== 'none' && progress >= 0.99) break // 最終フレームは完全透明（効果のみ以外）
                        drawScaledImage(0, 0, canvas.width, canvas.height)
                        const tvOutGenData = ctx.getImageData(0, 0, canvas.width, canvas.height)
                        for (let p = 0; p < tvOutGenData.data.length; p += 4) {
                            if (Math.random() < progress) {
                                const noise = Math.random() * 255
                                tvOutGenData.data[p] = tvOutGenData.data[p + 1] = tvOutGenData.data[p + 2] = noise
                            }
                            if (effectOption === 'fade') {
                                tvOutGenData.data[p + 3] = tvOutGenData.data[p + 3] * (1 - progress)
                            }
                        }
                        ctx.putImageData(tvOutGenData, 0, 0)
                        break

                    // グリッチイン
                    case 'glitchIn': {
                        // effectOptionで強度を決定（weak=0.15, medium=0.3, strong=0.5）
                        const glitchInBase = effectOption === 'weak' ? 0.15 : effectOption === 'strong' ? 0.5 : 0.3
                        const glitchInIntensity = 1 - progress
                        ctx.globalAlpha = progress
                        for (let s = 0; s < 10; s++) {
                            const sliceY = Math.floor(s * (canvas.height / 10))
                            const nextSliceY = Math.floor((s + 1) * (canvas.height / 10))
                            const sliceH = nextSliceY - sliceY

                            const srcSliceY = Math.floor(s * (sourceImage.height / 10))
                            const nextSrcSliceY = Math.floor((s + 1) * (sourceImage.height / 10))
                            const srcSliceH = nextSrcSliceY - srcSliceY

                            const offsetX = Math.floor((Math.random() - 0.5) * canvas.width * glitchInBase * glitchInIntensity)

                            if (sliceH > 0 && srcSliceH > 0) {
                                ctx.drawImage(sourceImage, 0, srcSliceY, sourceImage.width, srcSliceH, offsetX, sliceY, canvas.width, sliceH)
                            }
                        }
                        ctx.globalAlpha = 1
                        break
                    }

                    // グリッチアウト
                    case 'glitchOut': {
                        if (effectIntensity !== 'none' || effectOption !== 'none') {
                            if (progress >= 0.95) break // 最終フレームは完全透明（効果のみ以外）
                        }
                        // effectOptionで強度を決定（weak=0.15, medium=0.3, strong=0.5）
                        const glitchOutBase = effectOption === 'weak' ? 0.15 : effectOption === 'strong' ? 0.5 : 0.3
                        const glitchOutIntensity = progress
                        ctx.globalAlpha = 1 - progress
                        for (let s = 0; s < 10; s++) {
                            const sliceY = Math.floor(s * (canvas.height / 10))
                            const nextSliceY = Math.floor((s + 1) * (canvas.height / 10))
                            const sliceH = nextSliceY - sliceY

                            const srcSliceY = Math.floor(s * (sourceImage.height / 10))
                            const nextSrcSliceY = Math.floor((s + 1) * (sourceImage.height / 10))
                            const srcSliceH = nextSrcSliceY - srcSliceY

                            const offsetX = Math.floor((Math.random() - 0.5) * canvas.width * glitchOutBase * glitchOutIntensity)

                            if (sliceH > 0 && srcSliceH > 0) {
                                ctx.drawImage(sourceImage, 0, srcSliceY, sourceImage.width, srcSliceH, offsetX, sliceY, canvas.width, sliceH)
                            }
                        }
                        ctx.globalAlpha = 1
                        break
                    }

                    // フォーカスイン
                    case 'focusIn':
                        if (effectOption === 'fade') ctx.globalAlpha = progress
                        ctx.filter = `blur(${(1 - progress) * 20}px)`
                        ctx.drawImage(sourceImage, 0, 0, sourceImage.width, sourceImage.height, 0, 0, canvas.width, canvas.height)
                        ctx.filter = 'none'
                        if (effectOption === 'fade') ctx.globalAlpha = 1
                        break
                    case 'focusOut':
                        if (effectOption !== 'none' && progress >= 0.99) break // 最終フレームは完全透明（効果のみ以外）
                        if (effectOption === 'fade') ctx.globalAlpha = 1 - progress
                        ctx.filter = `blur(${progress * 20}px)`
                        ctx.drawImage(sourceImage, 0, 0, sourceImage.width, sourceImage.height, 0, 0, canvas.width, canvas.height)
                        ctx.filter = 'none'
                        if (effectOption === 'fade') ctx.globalAlpha = 1
                        break

                    // スライスイン
                    case 'sliceIn': {
                        const sliceInCount = effectOption ? parseInt(effectOption) : 4
                        for (let s = 0; s < sliceInCount; s++) {
                            // 描画先Y座標（整数化）
                            const dstY = Math.floor(s * canvas.height / sliceInCount)
                            const dstNextY = Math.floor((s + 1) * canvas.height / sliceInCount)
                            const dstH = dstNextY - dstY

                            // 参照元Y座標（整数化）
                            const srcY = Math.floor(s * sourceImage.height / sliceInCount)
                            const srcNextY = Math.floor((s + 1) * sourceImage.height / sliceInCount)
                            const srcH = srcNextY - srcY

                            const offsetX = (s % 2 === 0 ? -1 : 1) * (1 - progress) * canvas.width * 0.5

                            if (dstH > 0 && srcH > 0) {
                                ctx.drawImage(sourceImage, 0, srcY, sourceImage.width, srcH, offsetX, dstY, canvas.width, dstH)
                            }
                        }
                        break
                    }

                    // スライスアウト
                    case 'sliceOut': {
                        if (effectIntensity !== 'none' || effectOption !== 'none') {
                            if (progress >= 0.95) break // 最終フレームは完全透明（効果のみ以外）
                        }
                        const sliceOutCount = effectOption ? parseInt(effectOption) : 4
                        ctx.globalAlpha = 1 - progress
                        for (let s = 0; s < sliceOutCount; s++) {
                            // 描画先Y座標（整数化）
                            const dstY = Math.floor(s * canvas.height / sliceOutCount)
                            const dstNextY = Math.floor((s + 1) * canvas.height / sliceOutCount)
                            const dstH = dstNextY - dstY

                            // 参照元Y座標（整数化）
                            const srcY = Math.floor(s * sourceImage.height / sliceOutCount)
                            const srcNextY = Math.floor((s + 1) * sourceImage.height / sliceOutCount)
                            const srcH = srcNextY - srcY

                            const offsetX = (s % 2 === 0 ? -1 : 1) * progress * canvas.width * 0.5

                            if (dstH > 0 && srcH > 0) {
                                ctx.drawImage(sourceImage, 0, srcY, sourceImage.width, srcH, offsetX, dstY, canvas.width, dstH)
                            }
                        }
                        ctx.globalAlpha = 1
                        break
                    }

                    // V118: ブラインドイン
                    // V118: ブラインドイン
                    case 'blindIn': {
                        const blindCount = effectOption ? parseInt(effectOption) : 7
                        const isVertical = effectDirection === 'horizontal' // 逆にする

                        for (let i = 0; i < blindCount; i++) {
                            // 領域計算（整数化）
                            const start = Math.floor(i * (isVertical ? canvas.height : canvas.width) / blindCount)
                            const next = Math.floor((i + 1) * (isVertical ? canvas.height : canvas.width) / blindCount)
                            const size = next - start

                            const openAmount = Math.ceil(progress * size)

                            ctx.save()
                            ctx.beginPath()
                            if (isVertical) {
                                ctx.rect(0, start, canvas.width, openAmount)
                            } else {
                                ctx.rect(start, 0, openAmount, canvas.height)
                            }
                            ctx.clip()
                            ctx.drawImage(sourceImage, 0, 0, sourceImage.width, sourceImage.height, 0, 0, canvas.width, canvas.height)
                            ctx.restore()
                        }
                        break
                    }

                    // V118: ブラインドアウト
                    // V118: ブラインドアウト
                    case 'blindOut': {
                        if (effectIntensity !== 'none' || effectOption !== 'none') {
                            if (progress >= 0.95) break // 最終フレームは完全透明（効果のみ以外）
                        }
                        const blindOutCount = effectOption ? parseInt(effectOption) : 7
                        const isVerticalOut = effectDirection === 'horizontal' // 逆にする

                        for (let i = 0; i < blindOutCount; i++) {
                            // 領域計算（整数化）
                            const start = Math.floor(i * (isVerticalOut ? canvas.height : canvas.width) / blindOutCount)
                            const next = Math.floor((i + 1) * (isVerticalOut ? canvas.height : canvas.width) / blindOutCount)
                            const size = next - start

                            const closeAmount = Math.floor((1 - progress) * size)

                            ctx.save()
                            ctx.beginPath()
                            if (isVerticalOut) {
                                ctx.rect(0, start, canvas.width, closeAmount)
                            } else {
                                ctx.rect(start, 0, closeAmount, canvas.height)
                            }
                            ctx.clip()
                            ctx.drawImage(sourceImage, 0, 0, sourceImage.width, sourceImage.height, 0, 0, canvas.width, canvas.height)
                            ctx.restore()
                        }
                        break
                    }

                    // V118: 斬撃効果（斜めに斬られて上下がスライドして消える）
                    case 'swordSlashOut': {
                        if (effectIntensity !== 'none' || effectOption !== 'none') {
                            if (progress >= 0.95) break // 最終フレームは完全透明（効果のみ以外）
                        }
                        const isRightSlash = effectOption !== 'left' // デフォルトは右斬り（╲）
                        ctx.save()

                        // 斬撃フラッシュ効果（0-15%のプログレス）
                        const flashPhase = progress < 0.15
                        if (flashPhase) {
                            // 斬撃線を描画
                            ctx.drawImage(sourceImage, 0, 0, sourceImage.width, sourceImage.height, 0, 0, canvas.width, canvas.height)
                            const flashIntensity = Math.sin((progress / 0.15) * Math.PI)
                            ctx.strokeStyle = `rgba(255, 255, 255, ${flashIntensity})`
                            ctx.lineWidth = Math.max(4, canvas.width * 0.02)
                            ctx.beginPath()
                            if (isRightSlash) {
                                ctx.moveTo(0, 0)
                                ctx.lineTo(canvas.width, canvas.height)
                            } else {
                                ctx.moveTo(canvas.width, 0)
                                ctx.lineTo(0, canvas.height)
                            }
                            ctx.stroke()
                        } else {
                            // スライドフェーズ
                            const slideProgress = (progress - 0.15) / 0.85
                            const slideAmount = slideProgress * canvas.width * 0.6
                            const fadeAlpha = 1 - slideProgress

                            ctx.globalAlpha = fadeAlpha

                            // 上三角形（対角線の上側）
                            ctx.save()
                            ctx.beginPath()
                            if (isRightSlash) {
                                // 右斬り（╲）：上三角形 = (0,0), (w,h), (w,0)
                                ctx.moveTo(0, 0)
                                ctx.lineTo(canvas.width, canvas.height)
                                ctx.lineTo(canvas.width, 0)
                                ctx.closePath()
                                ctx.clip()
                                ctx.drawImage(sourceImage, 0, 0, sourceImage.width, sourceImage.height,
                                    -slideAmount, -slideAmount * 0.5, canvas.width, canvas.height)
                            } else {
                                // 左斬り（╱）：上三角形 = (w,0), (0,h), (0,0)
                                ctx.moveTo(canvas.width, 0)
                                ctx.lineTo(0, canvas.height)
                                ctx.lineTo(0, 0)
                                ctx.closePath()
                                ctx.clip()
                                ctx.drawImage(sourceImage, 0, 0, sourceImage.width, sourceImage.height,
                                    slideAmount, -slideAmount * 0.5, canvas.width, canvas.height)
                            }
                            ctx.restore()

                            // 下三角形（対角線の下側）
                            ctx.save()
                            ctx.beginPath()
                            if (isRightSlash) {
                                // 右斬り（╲）：下三角形 = (0,0), (0,h), (w,h)
                                ctx.moveTo(0, 0)
                                ctx.lineTo(0, canvas.height)
                                ctx.lineTo(canvas.width, canvas.height)
                                ctx.closePath()
                                ctx.clip()
                                ctx.drawImage(sourceImage, 0, 0, sourceImage.width, sourceImage.height,
                                    slideAmount, slideAmount * 0.5, canvas.width, canvas.height)
                            } else {
                                // 左斬り（╱）：下三角形 = (w,0), (w,h), (0,h)
                                ctx.moveTo(canvas.width, 0)
                                ctx.lineTo(canvas.width, canvas.height)
                                ctx.lineTo(0, canvas.height)
                                ctx.closePath()
                                ctx.clip()
                                ctx.drawImage(sourceImage, 0, 0, sourceImage.width, sourceImage.height,
                                    -slideAmount, slideAmount * 0.5, canvas.width, canvas.height)
                            }
                            ctx.restore()
                        }

                        ctx.globalAlpha = 1
                        ctx.restore()
                        break
                    }

                    // タイルイン（ランダム順）
                    case 'tileIn':
                        const tileInCount = effectOption ? parseInt(effectOption) : 9
                        const tileCols = Math.sqrt(tileInCount), tileRows = Math.sqrt(tileInCount)
                        const tileTotal = tileCols * tileRows
                        const currentTileInOrder = tileOrders[tileInCount] || tileOrders[9]
                        const tileVisible = Math.floor(progress * tileTotal)

                        for (let t = 0; t < tileVisible; t++) {
                            const idx = currentTileInOrder[t]
                            if (idx === undefined) continue
                            const col = idx % tileCols, row = Math.floor(idx / tileCols)

                            // 描画先領域（整数化）
                            const dstX = Math.floor(col * canvas.width / tileCols)
                            const dstNextX = Math.floor((col + 1) * canvas.width / tileCols)
                            const dstW = dstNextX - dstX

                            const dstY = Math.floor(row * canvas.height / tileRows)
                            const dstNextY = Math.floor((row + 1) * canvas.height / tileRows)
                            const dstH = dstNextY - dstY

                            // 参照元領域（整数化）
                            const srcX = Math.floor(col * sourceImage.width / tileCols)
                            const srcNextX = Math.floor((col + 1) * sourceImage.width / tileCols)
                            const srcW = srcNextX - srcX

                            const srcY = Math.floor(row * sourceImage.height / tileRows)
                            const srcNextY = Math.floor((row + 1) * sourceImage.height / tileRows)
                            const srcH = srcNextY - srcY

                            if (dstW > 0 && dstH > 0 && srcW > 0 && srcH > 0) {
                                ctx.drawImage(sourceImage, srcX, srcY, srcW, srcH, dstX, dstY, dstW, dstH)
                            }
                        }
                        break

                    // タイルアウト（ランダム順）
                    case 'tileOut':
                        if (effectIntensity !== 'none' || effectOption !== 'none') {
                            if (progress >= 0.95) break // 最終フレームは完全透明（効果のみ以外）
                        }
                        const tileOutCount = effectOption ? parseInt(effectOption) : 9
                        const tileOutCols = Math.sqrt(tileOutCount), tileOutRows = Math.sqrt(tileOutCount)
                        const tileOutTotal = tileOutCols * tileOutRows
                        const currentTileOutOrder = tileOrders[tileOutCount] || tileOrders[9]
                        const tileOutVisible = Math.floor((1 - progress) * tileOutTotal)

                        for (let t = 0; t < tileOutVisible; t++) {
                            const idx = currentTileOutOrder[t]
                            if (idx === undefined) continue
                            const col = idx % tileOutCols, row = Math.floor(idx / tileOutCols)

                            // 描画先領域（整数化）
                            const dstX = Math.floor(col * canvas.width / tileOutCols)
                            const dstNextX = Math.floor((col + 1) * canvas.width / tileOutCols)
                            const dstW = dstNextX - dstX

                            const dstY = Math.floor(row * canvas.height / tileOutRows)
                            const dstNextY = Math.floor((row + 1) * canvas.height / tileOutRows)
                            const dstH = dstNextY - dstY

                            // 参照元領域（整数化）
                            const srcX = Math.floor(col * sourceImage.width / tileOutCols)
                            const srcNextX = Math.floor((col + 1) * sourceImage.width / tileOutCols)
                            const srcW = srcNextX - srcX

                            const srcY = Math.floor(row * sourceImage.height / tileOutRows)
                            const srcNextY = Math.floor((row + 1) * sourceImage.height / tileOutRows)
                            const srcH = srcNextY - srcY

                            if (dstW > 0 && dstH > 0 && srcW > 0 && srcH > 0) {
                                ctx.drawImage(sourceImage, srcX, srcY, srcW, srcH, dstX, dstY, dstW, dstH)
                            }
                        }
                        break

                    // ピクセレートイン
                    case 'pixelateIn': {
                        // effectOptionでブロックサイズを決定
                        const maxPixelSize = effectOption === 'small' ? 15 : effectOption === 'large' ? 60 : 30
                        const pixelSize = Math.max(1, Math.floor((1 - progress) * maxPixelSize))
                        const tempIn = document.createElement('canvas')
                        tempIn.width = Math.floor(canvas.width / pixelSize)
                        tempIn.height = Math.floor(canvas.height / pixelSize)
                        const tempInCtx = tempIn.getContext('2d', { willReadFrequently: true })!
                        tempInCtx.drawImage(sourceImage, 0, 0, sourceImage.width, sourceImage.height, 0, 0, tempIn.width, tempIn.height)
                        ctx.imageSmoothingEnabled = false
                        // fadeオプションの場合、透明度も変化
                        if (effectIntensity === 'fade') {
                            ctx.globalAlpha = progress
                        }
                        ctx.drawImage(tempIn, 0, 0, canvas.width, canvas.height)
                        ctx.globalAlpha = 1
                        ctx.imageSmoothingEnabled = true
                        break
                    }

                    // ピクセレートアウト
                    case 'pixelateOut': {
                        if (effectIntensity !== 'none' && progress >= 0.9) break // 最終フレームは完全透明（効果のみ以外）閾値を緩和
                        // effectOptionでブロックサイズを決定
                        const maxPixelOut = effectOption === 'small' ? 15 : effectOption === 'large' ? 60 : 30
                        const pixelOutSize = Math.max(1, Math.floor(progress * maxPixelOut))
                        const tempOut = document.createElement('canvas')
                        tempOut.width = Math.floor(canvas.width / pixelOutSize)
                        tempOut.height = Math.floor(canvas.height / pixelOutSize)
                        const tempOutCtx = tempOut.getContext('2d', { willReadFrequently: true })!
                        tempOutCtx.drawImage(sourceImage, 0, 0, tempOut.width, tempOut.height)
                        ctx.imageSmoothingEnabled = false
                        // fadeオプションの場合、透明度も変化
                        if (effectIntensity === 'fade') {
                            ctx.globalAlpha = 1 - progress
                        }
                        ctx.drawImage(tempOut, 0, 0, canvas.width, canvas.height)
                        ctx.globalAlpha = 1
                        ctx.imageSmoothingEnabled = true
                        break
                    }

                    // アイリスイン
                    case 'irisIn': {
                        ctx.save()
                        ctx.beginPath()
                        const irisInRadius = Math.max(canvas.width, canvas.height) * progress
                        const irisInCx = canvas.width / 2
                        const irisInCy = canvas.height / 2
                        if (effectOption === 'square') {
                            const halfSize = irisInRadius * 0.7
                            ctx.rect(irisInCx - halfSize, irisInCy - halfSize, halfSize * 2, halfSize * 2)
                        } else if (effectOption === 'diamond') {
                            const halfSize = irisInRadius * 0.7
                            ctx.moveTo(irisInCx, irisInCy - halfSize)
                            ctx.lineTo(irisInCx + halfSize, irisInCy)
                            ctx.lineTo(irisInCx, irisInCy + halfSize)
                            ctx.lineTo(irisInCx - halfSize, irisInCy)
                            ctx.closePath()
                        } else {
                            ctx.arc(irisInCx, irisInCy, irisInRadius, 0, Math.PI * 2)
                        }
                        ctx.clip()
                        drawScaledImage(0, 0, canvas.width, canvas.height)
                        ctx.restore()
                        break
                    }

                    // アイリスアウト
                    case 'irisOut': {
                        if (effectIntensity !== 'none' || effectOption !== 'none') {
                            if (progress >= 0.95) break // 最終フレームは完全透明（効果のみ以外）
                        }
                        ctx.save()
                        ctx.beginPath()
                        const irisOutRadius = Math.max(canvas.width, canvas.height) * (1 - progress)
                        const irisOutCx = canvas.width / 2
                        const irisOutCy = canvas.height / 2
                        if (effectOption === 'square') {
                            const halfSize = irisOutRadius * 0.7
                            ctx.rect(irisOutCx - halfSize, irisOutCy - halfSize, halfSize * 2, halfSize * 2)
                        } else if (effectOption === 'diamond') {
                            const halfSize = irisOutRadius * 0.7
                            ctx.moveTo(irisOutCx, irisOutCy - halfSize)
                            ctx.lineTo(irisOutCx + halfSize, irisOutCy)
                            ctx.lineTo(irisOutCx, irisOutCy + halfSize)
                            ctx.lineTo(irisOutCx - halfSize, irisOutCy)
                            ctx.closePath()
                        } else {
                            ctx.arc(irisOutCx, irisOutCy, irisOutRadius, 0, Math.PI * 2)
                        }
                        ctx.clip()
                        drawScaledImage(0, 0, canvas.width, canvas.height)
                        ctx.restore()
                        break
                    }

                    // 本めくりイン（2Dスキュー効果）
                    case 'pageFlipIn': {
                        const isRightFlip = effectOption === 'right'
                        if (progress > 0.98) {
                            drawScaledImage(0, 0, canvas.width, canvas.height)
                            break
                        }
                        ctx.save()
                        const flipInSkew = (1 - progress) * 0.5
                        if (isRightFlip) {
                            ctx.transform(progress, 0, -flipInSkew, 1, 0, 0)
                        } else {
                            ctx.transform(progress, 0, flipInSkew, 1, canvas.width * (1 - progress), 0)
                        }
                        ctx.globalAlpha = Math.max(0, Math.min(1, progress * 1.5))
                        drawScaledImage(0, 0, canvas.width, canvas.height)
                        ctx.restore()
                        break
                    }

                    // 本めくりアウト（2Dスキュー効果）
                    case 'pageFlipOut': {
                        const isRightFlipOut = effectOption === 'right'
                        if (effectIntensity !== 'none' || effectOption !== 'none') {
                            if (progress > 0.98) {
                                break
                            }
                        }
                        ctx.save()
                        const flipOutSkew = progress * 0.5
                        if (isRightFlipOut) {
                            ctx.transform(1 - progress, 0, flipOutSkew, 1, canvas.width * progress, 0)
                        } else {
                            ctx.transform(1 - progress, 0, -flipOutSkew, 1, 0, 0)
                        }
                        ctx.globalAlpha = Math.max(0, Math.min(1, (1 - progress) * 1.5))
                        drawScaledImage(0, 0, canvas.width, canvas.height)
                        ctx.restore()
                        break
                    }

                    // カード回転イン（3D風Y軸回転で登場）
                    case 'cardFlipIn': {
                        ctx.save()
                        const flipInCount = effectOption ? parseInt(effectOption.replace('x', '')) : 1
                        const startAngleIn = (flipInCount - 1) * Math.PI + (Math.PI / 2)
                        const currentAngleIn = startAngleIn * (1 - progress)
                        const cardInScale = Math.cos(currentAngleIn)
                        ctx.translate(canvas.width / 2, canvas.height / 2)
                        ctx.scale(cardInScale, 1)
                        ctx.translate(-canvas.width / 2, -canvas.height / 2)
                        drawScaledImage(0, 0, canvas.width, canvas.height)
                        ctx.restore()
                        break
                    }

                    // カード回転アウト（3D風Y軸回転で退場）
                    case 'cardFlipOut': {
                        if (effectIntensity !== 'none' || effectOption !== 'none') {
                            if (progress >= 0.95) break // 最終フレームは完全透明（効果のみ以外）
                        }
                        ctx.save()
                        const flipOutCount = effectOption ? parseInt(effectOption.replace('x', '')) : 1
                        const endAngleOut = (flipOutCount - 1) * Math.PI + (Math.PI / 2)
                        const currentAngleOut = endAngleOut * progress
                        const cardOutScale = Math.cos(currentAngleOut)
                        ctx.translate(canvas.width / 2, canvas.height / 2)
                        ctx.scale(cardOutScale, 1)
                        ctx.translate(-canvas.width / 2, -canvas.height / 2)
                        drawScaledImage(0, 0, canvas.width, canvas.height)
                        ctx.restore()
                        break
                    }

                    // カード回転ループ（演出）
                    case 'cardFlipLoop': {
                        ctx.save()
                        // sin関数で往復回転（-1 ～ 1）
                        const flipProg = Math.sin(progress * Math.PI * 2)
                        const loopScale = Math.abs(flipProg)
                        ctx.translate(canvas.width / 2, canvas.height / 2)
                        ctx.scale(Math.max(0.01, loopScale), 1)
                        ctx.translate(-canvas.width / 2, -canvas.height / 2)
                        drawScaledImage(0, 0, canvas.width, canvas.height)
                        ctx.restore()
                        break
                    }

                    // RGBずれ
                    case 'rgbShift': {
                        // effectOptionで強度を決定（small=2, medium=6, large=12）
                        const baseShift = effectOption === 'small' ? 2 : effectOption === 'large' ? 12 : 6
                        const shiftAmt = Math.sin(progress * Math.PI) * canvas.width * (baseShift / 100)

                        // R, G, Bのオフセット計算（120度間隔）
                        const rOffsetX = Math.round(Math.sin(0) * shiftAmt)
                        const rOffsetY = Math.round(-Math.cos(0) * shiftAmt)
                        const gOffsetX = Math.round(Math.sin(Math.PI * 4 / 3) * shiftAmt)
                        const gOffsetY = Math.round(-Math.cos(Math.PI * 4 / 3) * shiftAmt)
                        const bOffsetX = Math.round(Math.sin(Math.PI * 2 / 3) * shiftAmt)
                        const bOffsetY = Math.round(-Math.cos(Math.PI * 2 / 3) * shiftAmt)

                        drawScaledImage(0, 0, canvas.width, canvas.height)
                        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height)
                        const data = imgData.data
                        const newData = ctx.createImageData(canvas.width, canvas.height)
                        const out = newData.data

                        for (let y = 0; y < canvas.height; y++) {
                            for (let x = 0; x < canvas.width; x++) {
                                const i = (y * canvas.width + x) * 4
                                const rX = Math.min(Math.max(x - rOffsetX, 0), canvas.width - 1)
                                const rY = Math.min(Math.max(y - rOffsetY, 0), canvas.height - 1)
                                const rI = (rY * canvas.width + rX) * 4
                                out[i] = data[rI]

                                const gX = Math.min(Math.max(x - gOffsetX, 0), canvas.width - 1)
                                const gY = Math.min(Math.max(y - gOffsetY, 0), canvas.height - 1)
                                const gI = (gY * canvas.width + gX) * 4
                                out[i + 1] = data[gI + 1]

                                const bX = Math.min(Math.max(x - bOffsetX, 0), canvas.width - 1)
                                const bY = Math.min(Math.max(y - bOffsetY, 0), canvas.height - 1)
                                const bI = (bY * canvas.width + bX) * 4
                                out[i + 2] = data[bI + 2]

                                out[i + 3] = data[i + 3]
                            }
                        }
                        ctx.putImageData(newData, 0, 0)
                        break
                    }

                    // 走査線
                    case 'scanlines': {
                        drawScaledImage(0, 0, canvas.width, canvas.height)

                        const scanlineThickness = effectOption === 'thin' ? 1 : effectOption === 'thick' ? 4 : 2
                        const scanlineSpacing = scanlineThickness * 2

                        // effectIntensityで色を決定（gray/blue/green）
                        const scanlineColor = effectIntensity === 'blue' ? 'rgba(0, 100, 255, 0.3)' :
                            effectIntensity === 'green' ? 'rgba(0, 200, 100, 0.3)' :
                                'rgba(0, 0, 0, 0.3)'

                        // 透過部分を保持するため、source-atopモードでスキャンラインを描画
                        ctx.save()
                        ctx.globalCompositeOperation = 'source-atop'
                        ctx.fillStyle = scanlineColor
                        for (let y = 0; y < canvas.height; y += scanlineSpacing) {
                            ctx.fillRect(0, y, canvas.width, scanlineThickness)
                        }

                        // 動く光のライン効果
                        const scanOffset = (progress * canvas.height) % canvas.height
                        const scanGrad = ctx.createLinearGradient(0, scanOffset - 30, 0, scanOffset + 30)
                        scanGrad.addColorStop(0, 'rgba(255, 255, 255, 0)')
                        scanGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.15)')
                        scanGrad.addColorStop(1, 'rgba(255, 255, 255, 0)')
                        ctx.fillStyle = scanGrad
                        ctx.fillRect(0, scanOffset - 30, canvas.width, 60)
                        ctx.restore()
                        break
                    }

                    // ビネット
                    case 'vignette':
                        drawScaledImage(0, 0, canvas.width, canvas.height)
                        const vigGrad = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, Math.max(canvas.width, canvas.height) * 0.7)
                        vigGrad.addColorStop(0, 'rgba(0, 0, 0, 0)')
                        vigGrad.addColorStop(0.5, 'rgba(0, 0, 0, 0)')
                        vigGrad.addColorStop(1, `rgba(0, 0, 0, ${0.3 + progress * 0.5})`)
                        // 透過部分を保持するため、source-atopモードでビネットを描画
                        ctx.save()
                        ctx.globalCompositeOperation = 'source-atop'
                        ctx.fillStyle = vigGrad
                        ctx.fillRect(0, 0, canvas.width, canvas.height)
                        ctx.restore()
                        break

                    // 脈動
                    case 'pulsation': {
                        // 脈動: エッジ部分に色のフリンジ
                        const pulsationSize = effectOption === 'small' ? 3 : effectOption === 'large' ? 12 : 6
                        const aberAmt = Math.sin(progress * Math.PI) * pulsationSize
                        // 元画像を先に描画
                        drawScaledImage(0, 0, canvas.width, canvas.height)

                        // エッジに色を乗せる
                        ctx.globalCompositeOperation = 'screen'
                        ctx.globalAlpha = 0.3

                        // 赤（左上にズレ）
                        ctx.save()
                        ctx.translate(-aberAmt, -aberAmt)
                        drawScaledImage(0, 0, canvas.width, canvas.height)
                        ctx.restore()

                        // シアン（右下にズレ）
                        ctx.save()
                        ctx.translate(aberAmt, aberAmt)
                        drawScaledImage(0, 0, canvas.width, canvas.height)
                        ctx.restore()

                        ctx.globalAlpha = 1
                        ctx.globalCompositeOperation = 'source-over'
                        break
                    }

                    // 閃光
                    case 'flash':
                        drawScaledImage(0, 0, canvas.width, canvas.height)
                        const flashInt = Math.sin(progress * Math.PI)
                        // 透過部分を保持するため、source-atopモードで閃光を描画
                        ctx.save()
                        ctx.globalCompositeOperation = 'source-atop'
                        ctx.fillStyle = `rgba(255, 255, 255, ${flashInt * 0.8})`
                        ctx.fillRect(0, 0, canvas.width, canvas.height)
                        ctx.restore()
                        break

                    // V119: シルエット
                    case 'silhouette': {
                        drawScaledImage(0, 0, canvas.width, canvas.height)

                        // シルエット解除モードの場合、progress=1で元画像
                        const isSilhouetteReleaseGen = effectIntensity === 'from-silhouette'

                        if (isSilhouetteReleaseGen && progress === 1) break
                        if (!isSilhouetteReleaseGen && progress === 0) break

                        const genImageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
                        const genData = genImageData.data

                        // シルエットの色を決定
                        const colorMapGen: { [key: string]: [number, number, number] } = {
                            white: [255, 255, 255],
                            black: [0, 0, 0],
                            red: [255, 0, 0],
                        }

                        // シルエット解除の場合は「ため」を追加してから progress を反転
                        let silhouetteInt: number
                        if (isSilhouetteReleaseGen) {
                            // 最初の30%はシルエット状態を維持、残り70%でフェード
                            const holdDuration = 0.3
                            if (progress < holdDuration) {
                                silhouetteInt = 1 // シルエット状態を維持
                            } else {
                                silhouetteInt = 1 - ((progress - holdDuration) / (1 - holdDuration))
                            }
                        } else {
                            silhouetteInt = progress
                        }

                        if (effectOption === 'outline-black' || effectOption === 'outline-white') {
                            // 縁取りモード: エッジ検出（黒縁 or 白縁）
                            const outlineColorGen = effectOption === 'outline-white' ? 255 : 0
                            const edgeDataGen = new Uint8ClampedArray(genData.length)
                            for (let y = 1; y < canvas.height - 1; y++) {
                                for (let x = 1; x < canvas.width - 1; x++) {
                                    const i = (y * canvas.width + x) * 4
                                    const iUp = ((y - 1) * canvas.width + x) * 4
                                    const iDown = ((y + 1) * canvas.width + x) * 4
                                    const iLeft = (y * canvas.width + (x - 1)) * 4
                                    const iRight = (y * canvas.width + (x + 1)) * 4

                                    const alphaCenter = genData[i + 3]
                                    const alphaUp = genData[iUp + 3]
                                    const alphaDown = genData[iDown + 3]
                                    const alphaLeft = genData[iLeft + 3]
                                    const alphaRight = genData[iRight + 3]

                                    // 隣接ピクセルとのアルファ差をチェック
                                    const isEdge = (alphaCenter > 128 && (alphaUp < 128 || alphaDown < 128 || alphaLeft < 128 || alphaRight < 128))

                                    if (isEdge) {
                                        // エッジ部分: 元の色から黒/白へ変化
                                        const blend = silhouetteInt
                                        edgeDataGen[i] = Math.floor(genData[i] * (1 - blend) + outlineColorGen * blend)
                                        edgeDataGen[i + 1] = Math.floor(genData[i + 1] * (1 - blend) + outlineColorGen * blend)
                                        edgeDataGen[i + 2] = Math.floor(genData[i + 2] * (1 - blend) + outlineColorGen * blend)
                                        edgeDataGen[i + 3] = genData[i + 3] // アルファは維持
                                    } else {
                                        // 非エッジ部分: 元の色を維持しつつ徐々に透明に
                                        edgeDataGen[i] = genData[i]
                                        edgeDataGen[i + 1] = genData[i + 1]
                                        edgeDataGen[i + 2] = genData[i + 2]
                                        edgeDataGen[i + 3] = Math.floor(genData[i + 3] * (1 - silhouetteInt))
                                    }
                                }
                            }
                            const edgeImageDataGen = new ImageData(edgeDataGen, canvas.width, canvas.height)
                            ctx.putImageData(edgeImageDataGen, 0, 0)
                        } else {
                            const [r, g, b] = colorMapGen[effectOption || 'black'] || colorMapGen.black

                            // 不透明ピクセルを単色に変換
                            for (let i = 0; i < genData.length; i += 4) {
                                if (genData[i + 3] > 0) { // 不透明なら
                                    const blend = silhouetteInt
                                    genData[i] = Math.floor(genData[i] * (1 - blend) + r * blend)
                                    genData[i + 1] = Math.floor(genData[i + 1] * (1 - blend) + g * blend)
                                    genData[i + 2] = Math.floor(genData[i + 2] * (1 - blend) + b * blend)
                                    // アルファは維持
                                }
                            }
                            ctx.putImageData(genImageData, 0, 0)
                        }
                        break
                    }

                    default:
                        drawScaledImage(0, 0, canvas.width, canvas.height)
                        break
                }

                frames.push(ctx.getImageData(0, 0, canvas.width, canvas.height).data.buffer)
                delays.push(1000 / fps)

                setGenerationProgress((i + 1) / frameCount * 0.8)
                // 毎フレームUIに制御を戻す（アニメーション継続のため）
                await new Promise(resolve => setTimeout(resolve, 0))
            }

            if (!isLooping) {
                frames.push(frames[frames.length - 1]);
                delays.push(3600000);
            }

            console.timeEnd('⏱フレーム生成')
            setGenerationProgress(0.9)
            setGenerationPhase('encoding')
            // エンコード前にUIに制御を戻す
            await new Promise(resolve => setTimeout(resolve, 16))

            // エンコード直前の寸法確認（デバッグ用）
            console.log(`エンコード前: canvas=${canvas.width}x${canvas.height}, 期待値=${scaledWidth}x${scaledHeight}`)

            // 寸法が異なる場合は強制リセット
            if (canvas.width !== scaledWidth || canvas.height !== scaledHeight) {
                console.warn('キャンバスサイズ不一致！強制リセット')
                canvas.width = scaledWidth
                canvas.height = scaledHeight
            }

            // V121.20: 共通のWorkerエンコード関数を使用
            console.log(`Worker送信 loop設定: isLooping=${isLooping}, loop=${isLooping ? 0 : 1}`)

            // V121.32: 初回エンコードスキップ最適化（実験的）
            const SKIP_INITIAL_ENCODE = false  // trueにすると高速化（精度低下）
            const rawSize = scaledWidth * scaledHeight * 4 * frameCount

            // エフェクト別の推定圧縮率（フルカラー100%時）
            const EFFECT_COMPRESSION_RATIOS: Record<string, number> = {
                // 軽量エフェクト（圧縮が効きやすい）
                fadeIn: 0.15, fadeOut: 0.15,
                slideIn: 0.10, slideOut: 0.10,
                wipeIn: 0.10, wipeOut: 0.10,
                blindIn: 0.10, blindOut: 0.10,
                tileIn: 0.08, tileOut: 0.08,
                irisIn: 0.08, irisOut: 0.08,
                sliceIn: 0.16, sliceOut: 0.16,
                // 中程度
                rotate: 0.19, spiral: 0.12, bounce: 0.18,
                enlarge: 0.22, minimize: 0.22,
                zoomUp: 0.17, zoomUpOut: 0.17,
                doorClose: 0.07, doorOpen: 0.07,
                cardFlipIn: 0.14, cardFlipOut: 0.14, cardFlipLoop: 0.13,
                pageFlipIn: 0.09, pageFlipOut: 0.09,
                focusIn: 0.13, focusOut: 0.13,
                pixelateIn: 0.05, pixelateOut: 0.05,
                // 演出エフェクト
                rgbShift: 0.20, pulsation: 0.20, scanlines: 0.19,
                vignette: 0.20, flash: 0.15, silhouette: 0.14,
                concentrationLines: 0.21, vibration: 0.16, glitch: 0.20,
                // 高負荷（圧縮が効きにくい）
                tvStaticIn: 0.21, tvStaticOut: 0.21, tvStatic: 0.35,
                glitchIn: 0.15, glitchOut: 0.15,
            }
            const estimatedRatio = EFFECT_COMPRESSION_RATIOS[transition] || 0.20
            const estimatedFullColorSize = rawSize * estimatedRatio
            const estimatedSizeMB = estimatedFullColorSize / 1024 / 1024

            let skipInitialEncode = false
            let finalApng: ArrayBuffer

            // サイズ制限があり、推定サイズが許容の2倍以上なら初回スキップ
            if (SKIP_INITIAL_ENCODE && sizeLimit !== null && estimatedFullColorSize > allowedBytes * 2) {
                skipInitialEncode = true
                console.log(`⚡ 初回エンコードスキップ: 推定${estimatedSizeMB.toFixed(1)}MB > 許容${(allowedBytes / 1024 / 1024).toFixed(1)}MBの2倍`)
                // ダミーのArrayBufferを設定（後でリトライで上書き）
                finalApng = new ArrayBuffer(0)
            } else {
                console.time('⏱初回エンコード')
                try {
                    finalApng = await encodeApngWithWorker({
                        frames,
                        width: canvas.width,
                        height: canvas.height,
                        colorNum: selectedStep.colorNum,
                        delays,
                        loop: isLooping ? 0 : 1,
                        onProgress: setGenerationProgress
                    })
                } catch (workerError) {
                    // Workerが失敗した場合はフォールバック（同期処理）
                    console.warn('Worker failed, falling back to main thread:', workerError)
                    finalApng = UPNG.encode(frames, canvas.width, canvas.height, selectedStep.colorNum, delays, { loop: isLooping ? 0 : 1 })
                }
                console.timeEnd('⏱初回エンコード')
            }

            // エンコード完了後、UIに制御を戻す（アニメーション継続のため）
            await new Promise(resolve => setTimeout(resolve, 16))

            const finalSizeMB = skipInitialEncode ? estimatedSizeMB : finalApng.byteLength / 1024 / 1024
            const actualFullColorSize = skipInitialEncode ? estimatedFullColorSize : finalApng.byteLength
            console.log(`フルカラー100%結果: ${finalSizeMB.toFixed(2)}MB (許容: ${(allowedBytes / 1024 / 1024).toFixed(2)}MB)${skipInitialEncode ? ' [推定]' : ''}`)

            // 実際のファイルサイズを記録
            setCompressionInfo(prev => prev ? { ...prev, actualMB: finalSizeMB } : null)

            // V121.22: 圧縮効率ベースの動的係数 + フルカラー70%ルール
            if (sizeLimit !== null && (skipInitialEncode || finalApng.byteLength > allowedBytes)) {
                console.time('⏱圧縮リトライ')
                setGenerationPhase('optimizing')
                // UIに制御を戻す
                await new Promise(resolve => setTimeout(resolve, 16))

                const fullColorSize = actualFullColorSize
                if (!skipInitialEncode) {
                    console.log(`サイズ超過: ${finalSizeMB.toFixed(2)}MB > ${(allowedBytes / 1024 / 1024).toFixed(2)}MB`)
                }

                // 圧縮効率を算出（低いほど圧縮が効いている）
                const compressionRatio = skipInitialEncode ? estimatedRatio : fullColorSize / rawSize
                console.log(`圧縮効率: ${(compressionRatio * 100).toFixed(1)}% (${(rawSize / 1024 / 1024).toFixed(1)}MB → ${finalSizeMB.toFixed(2)}MB)${skipInitialEncode ? ' [推定]' : ''}`)

                // 圧縮効率から色数別係数を動的に計算
                // 圧縮が効いている（ratio低い）→ 256色でさらに圧縮される
                // 圧縮が効いていない（ratio高い）→ 256色でもあまり変わらない
                const color256Factor = 0.15 + (compressionRatio * 0.8)
                const color128Factor = 0.10 + (compressionRatio * 0.6)
                const color64Factor = 0.08 + (compressionRatio * 0.5)
                console.log(`動的係数: 256色=${color256Factor.toFixed(2)}, 128色=${color128Factor.toFixed(2)}, 64色=${color64Factor.toFixed(2)}`)

                // V121.23: エフェクト別デルタ圧縮効率の補正係数
                // fadeIn: デルタ圧縮が非常に効く（推測37-64%）→ 0.5で補正
                // tvStaticIn: ノイズでデルタ圧縮が効かない（推測134-205%）→ 2.0で補正
                const EFFECT_DELTA_FACTORS: Record<string, number> = {
                    // 入退場エフェクト（V121.31: In/Out同期）
                    fadeIn: 0.63, fadeOut: 0.63,
                    wipeIn: 1.13, wipeOut: 1.13,
                    slideIn: 1.13, slideOut: 1.13,
                    sliceIn: 0.49, sliceOut: 0.49,
                    tileIn: 1.33, tileOut: 1.33,
                    blindIn: 1.18, blindOut: 1.18,
                    irisIn: 0.7, irisOut: 0.7,
                    focusIn: 0.78, focusOut: 0.78,
                    pageFlipIn: 1.11, pageFlipOut: 1.11,
                    cardFlipIn: 1.12, cardFlipOut: 1.12,
                    swordSlashIn: 1.71, swordSlashOut: 1.71,
                    zoomUp: 0.64, zoomUpOut: 0.64,
                    doorClose: 0.60, doorOpen: 0.60,
                    pixelateIn: 1.0, pixelateOut: 1.0,
                    lightLeakIn: 1.0, lightLeakOut: 1.0,
                    // 演出エフェクト
                    rgbShift: 0.68,
                    pulsation: 0.88,
                    scanlines: 0.80,
                    vignette: 0.89,
                    concentrationLines: 0.83,
                    flash: 0.95,
                    glitch: 1.00,
                    silhouette: 0.88,
                    cardFlipLoop: 1.14,
                    rotate: 1.04,
                    enlarge: 0.96,
                    minimize: 0.96,
                    spiral: 1.19,
                    bounce: 1.05,
                    vibration: 1.31,
                    // 特殊（ノイズ系）
                    tvStaticIn: 1.80, tvStaticOut: 1.80,
                    tvStatic: 1.17,
                    glitchIn: 0.69, glitchOut: 0.69,
                }
                const effectDeltaFactor = EFFECT_DELTA_FACTORS[transition] || 1.0
                console.log(`エフェクト補正: ${transition} → ${effectDeltaFactor}`)

                // 推測サイズを計算
                const estimateSize = (step: typeof COMPRESSION_STEPS[0]): number => {
                    const areaRatio = step.scale * step.scale
                    let colorFactor = 1.0
                    if (step.colorNum === 256) colorFactor = color256Factor
                    else if (step.colorNum === 128) colorFactor = color128Factor
                    else if (step.colorNum === 64) colorFactor = color64Factor
                    // エフェクト別補正を適用
                    colorFactor *= effectDeltaFactor
                    return fullColorSize * areaRatio * colorFactor
                }

                // フルカラー70%ルール: 70%までならフルカラー、それ以上縮小なら256色へ
                const fc70Size = fullColorSize * 0.70 * 0.70  // 70%スケール
                const color256Size = estimateSize({ colorNum: 256, scale: 1.0, name: '256色100%' })

                // V121.25: ログ簡略化（開発時のみ詳細出力）
                const isDev = process.env.NODE_ENV === 'development'
                if (isDev) {
                    console.log(`【フルカラー70%ルール判定】FC70%推測: ${(fc70Size / 1024 / 1024).toFixed(2)}MB, 256色100%推測: ${(color256Size / 1024 / 1024).toFixed(2)}MB`)
                }

                let useFullColor70Rule = false
                if (fc70Size <= allowedBytes) {
                    useFullColor70Rule = true
                    if (isDev) console.log(`  → フルカラー70%で収まる見込み、フルカラー優先`)
                } else {
                    if (isDev) console.log(`  → フルカラー70%でも超過、256色へ移行`)
                }

                // V121.25: 安全マージン15%追加でリトライ削減
                const SAFETY_MARGIN = 0.85  // 推測サイズの85%以下なら採用（15%マージン）
                const safeAllowedBytes = allowedBytes * SAFETY_MARGIN

                // 最適ステップを決定（安全マージン付き）
                let optimalStepIndex: number

                if (useFullColor70Rule) {
                    // フルカラー優先: 85% → 70% の順で試す、見つからなければ70%をデフォルトに
                    optimalStepIndex = 2  // デフォルト: フルカラー70%
                    for (let i = 1; i <= 2; i++) {
                        const estimated = estimateSize(COMPRESSION_STEPS[i])
                        if (estimated <= safeAllowedBytes) {
                            optimalStepIndex = i
                            break
                        }
                    }
                } else {
                    // 256色へ移行: 256色100%から試す
                    optimalStepIndex = 3  // デフォルト: 256色100%
                    for (let i = 3; i < COMPRESSION_STEPS.length; i++) {
                        const estimated = estimateSize(COMPRESSION_STEPS[i])
                        if (estimated <= safeAllowedBytes) {
                            optimalStepIndex = i
                            break
                        }
                    }
                }

                console.log(`最適ステップ: ${COMPRESSION_STEPS[optimalStepIndex].name} (推測${(estimateSize(COMPRESSION_STEPS[optimalStepIndex]) / 1024 / 1024).toFixed(2)}MB, 許容${(allowedBytes / 1024 / 1024).toFixed(2)}MB)`)

                // 推測したステップで生成
                let currentStepIndex = optimalStepIndex
                const MAX_RETRIES = 4

                for (let retry = 0; retry < MAX_RETRIES && currentStepIndex < COMPRESSION_STEPS.length; retry++) {
                    const step = COMPRESSION_STEPS[currentStepIndex]
                    const tryScale = baseScale * step.scale
                    console.log(`試行${retry + 1}: ${step.name} (scale=${tryScale.toFixed(3)})`)

                    // リトライごとにプログレスを更新（90%から95%の間で進行）
                    setGenerationProgress(0.9 + (retry / MAX_RETRIES) * 0.05)
                    // UIに制御を戻す（アニメーション継続のため）
                    await new Promise(resolve => setTimeout(resolve, 16))

                    // V121.20: フレーム生成 + 非同期Workerエンコード
                    const frameData = generateFramesOnly(tryScale)
                    console.log(`UPNG.encode loop設定: isLooping=${isLooping}, loop=${isLooping ? 0 : 1}`)

                    let tryApng: ArrayBuffer
                    try {
                        tryApng = await encodeApngWithWorker({
                            frames: frameData.frames,
                            width: frameData.width,
                            height: frameData.height,
                            colorNum: step.colorNum,
                            delays: frameData.delays,
                            loop: isLooping ? 0 : 1,
                            onProgress: (p) => setGenerationProgress(0.9 + (retry / MAX_RETRIES) * 0.05 + p * 0.01)
                        })
                    } catch (workerError) {
                        console.warn('Worker failed in retry, falling back:', workerError)
                        tryApng = UPNG.encode(frameData.frames, frameData.width, frameData.height, step.colorNum, frameData.delays, { loop: isLooping ? 0 : 1 })
                    }

                    const trySizeMB = tryApng.byteLength / 1024 / 1024
                    const estimatedMB = estimateSize(step) / 1024 / 1024
                    console.log(`  結果: ${trySizeMB.toFixed(2)}MB (推測: ${estimatedMB.toFixed(2)}MB)`)

                    if (tryApng.byteLength <= allowedBytes) {
                        finalApng = tryApng
                        selectedStep = step
                        console.log(`→ ${step.name}を採用`)
                        console.timeEnd('⏱圧縮リトライ')
                        setCompressionInfo({ colorNum: step.colorNum, estimatedMB: trySizeMB, actualMB: trySizeMB })
                        break
                    } else {
                        console.log(`  超過 → 次のステップへ`)
                        currentStepIndex++
                    }
                }

                // 最終的に収まらなかった場合は最後のステップを使用
                if (finalApng.byteLength > allowedBytes) {
                    const lastStep = COMPRESSION_STEPS[COMPRESSION_STEPS.length - 1]
                    const lastScale = baseScale * lastStep.scale
                    console.log(`最終フォールバック: ${lastStep.name}`)

                    const lastFrameData = generateFramesOnly(lastScale)
                    try {
                        finalApng = await encodeApngWithWorker({
                            frames: lastFrameData.frames,
                            width: lastFrameData.width,
                            height: lastFrameData.height,
                            colorNum: lastStep.colorNum,
                            delays: lastFrameData.delays,
                            loop: isLooping ? 0 : 1
                        })
                    } catch (workerError) {
                        console.warn('Worker failed in fallback, falling back:', workerError)
                        finalApng = UPNG.encode(lastFrameData.frames, lastFrameData.width, lastFrameData.height, lastStep.colorNum, lastFrameData.delays, { loop: isLooping ? 0 : 1 })
                    }

                    selectedStep = lastStep
                    const lastSizeMB = finalApng.byteLength / 1024 / 1024
                    setCompressionInfo({ colorNum: lastStep.colorNum, estimatedMB: lastSizeMB, actualMB: lastSizeMB })
                }
            } else if (sizeLimit !== null) {
                console.log(`→ フルカラー100%を採用（制限内）`)
            }

            console.timeEnd('⏱総生成時間')

            if (sizeLimit !== null && finalApng.byteLength > targetBytes) {
                console.warn(`警告: 目標サイズ(${sizeLimit}MB)を超過: ${(finalApng.byteLength / 1024 / 1024).toFixed(2)}MB`)
            }

            // ループなしの場合、acTLチャンクのnum_playsを1に修正
            // UPNGは常にnum_plays=0（無限ループ）でエンコードするため、バイナリを直接修正
            if (!isLooping) {
                finalApng = setApngLoopCount(finalApng, 1)
                console.log('ループなし設定を適用: num_plays=1')
            }

            const blob = new Blob([finalApng], { type: 'image/png' })
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `apng-${transition}-${isLooping ? 'loop' : 'noloop'}.png`

            setGenerationProgress(1)
            setGenerationPhase('completing')

            // UIに制御を戻す（短い待機）
            await new Promise(resolve => setTimeout(resolve, 100))

            a.click()
            URL.revokeObjectURL(url)

            // ダウンロード開始後、少し待ってから完了状態に
            await new Promise(resolve => setTimeout(resolve, 100))

            setGenerationState('completed')
            setGenerationPhase('idle')
        } catch (error) {
            console.error('APNG生成中に詳細なエラーが発生しました:', error)
            setError(`APNG生成中に詳細なエラーが発生しました: ${error instanceof Error ? error.message : String(error)}`)
            setGenerationState('idle')
            setGenerationPhase('idle')
        }
    }

    const getPreviewStyle = () => {
        if (!sourceImage || !previewContainerRef.current) return {}

        const containerRect = previewContainerRef.current.getBoundingClientRect()
        const containerAspectRatio = containerRect.width / containerRect.height
        const imageAspectRatio = sourceImage.width / sourceImage.height

        let width, height
        if (containerAspectRatio > imageAspectRatio) {
            height = containerRect.height
            width = height * imageAspectRatio
        } else {
            width = containerRect.width
            height = width / imageAspectRatio
        }

        const baseStyle = {
            width: `${width}px`,
            height: `${height}px`,
            position: 'absolute' as const,
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
        }

        if (!isPlaying) {
            return baseStyle
        }

        switch (transition) {
            case 'fadeIn':
                return { ...baseStyle, opacity: previewProgress }
            case 'fadeOut':
                return { ...baseStyle, opacity: 1 - previewProgress }
            case 'slideRight':
                return { ...baseStyle, transform: `translate(calc(-50% + ${previewProgress * 100}%), -50%)` }
            case 'slideLeft':
                return { ...baseStyle, transform: `translate(calc(-50% - ${previewProgress * 100}%), -50%)` }
            case 'slideDown':
                return { ...baseStyle, transform: `translate(-50%, calc(-50% + ${previewProgress * 100}%))` }
            case 'slideUp':
                return { ...baseStyle, transform: `translate(-50%, calc(-50% - ${previewProgress * 100}%))` }
            case 'wipeRight':
                return { ...baseStyle, clipPath: `inset(0 ${100 - previewProgress * 100}% 0 0)` }
            case 'wipeLeft':
                return { ...baseStyle, clipPath: `inset(0 0 0 ${100 - previewProgress * 100}%)` }
            case 'wipeDown':
                return { ...baseStyle, clipPath: `inset(0 0 ${100 - previewProgress * 100}% 0)` }
            case 'wipeUp':
                return { ...baseStyle, clipPath: `inset(${100 - previewProgress * 100}% 0 0 0)` }
            case 'zoomUp': {
                // アップ: 小→通常, ダウン: 大→通常
                const isUp = effectOption === 'up'
                const scaleZoomUp = isUp ? (0.5 + previewProgress * 0.5) : (1.5 - previewProgress * 0.5)
                return { ...baseStyle, transform: `translate(-50%, -50%) scale(${scaleZoomUp})` }
            }
            case 'zoomUpOut': {
                // アップ: 通常→大 + フェードアウト, ダウン: 通常→小 + フェードアウト
                const isUpOut = effectOption === 'up'
                const scaleZoomUpOut = isUpOut ? (1.0 + previewProgress * 0.5) : (1.0 - previewProgress * 0.5)
                return { ...baseStyle, transform: `translate(-50%, -50%) scale(${scaleZoomUpOut})`, opacity: 1 - previewProgress }
            }
            case 'rotate':
                const rotDir = effectOption === 'right' ? 1 : -1
                return { ...baseStyle, transform: `translate(-50%, -50%) rotate(${previewProgress * 360 * rotDir}deg)` }

            case 'tvStatic':
                return {
                    ...baseStyle,
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 150 150' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='${1 - previewProgress}'/%3E%3C/svg%3E")`,
                    backgroundBlendMode: 'overlay',
                }
            case 'enlarge':
                const enlargeScale = 1 + previewProgress * 4
                return { ...baseStyle, transform: `translate(-50%, -50%) scale(${enlargeScale})` }
            case 'minimize':
                const minimizeScale = 5 - previewProgress * 4
                return { ...baseStyle, transform: `translate(-50%, -50%) scale(${minimizeScale})` }
            // V118 Phase 2: 集中線
            case 'concentrationLines':
                return {
                    ...baseStyle,
                    boxShadow: 'inset 0 0 50px rgba(0,0,0,0.6)',
                }
            case 'spiral':
                const spDir = effectOption === 'right' ? 1 : -1
                return {
                    ...baseStyle,
                    transform: `translate(-50%, -50%) rotate(${previewProgress * 720 * spDir}deg) scale(${1 - previewProgress * 0.5})`,
                }
            case 'bounce':
                const bounceProgress = Math.sin(previewProgress * Math.PI)
                return {
                    ...baseStyle,
                    transform: `translate(-50%, calc(-50% - ${bounceProgress * 5}%))`,
                }
            case 'verticalVibration':
                const verticalOffset = Math.sin(previewProgress * Math.PI * 10) * 5
                return { ...baseStyle, transform: `translate(-50%, calc(-50% + ${verticalOffset}%))` }
            case 'horizontalVibration':
                const horizontalOffset = Math.sin(previewProgress * Math.PI * 10) * 5
                return { ...baseStyle, transform: `translate(calc(-50% + ${horizontalOffset}%), -50%)` }
            case 'glitch':
                return {
                    ...baseStyle,
                    clipPath: `inset(0 0 0 ${(1 - previewProgress) * 100}%)`,
                    filter: `url(#glitch)`,
                    transform: `translate(-50%, -50%) skew(${Math.sin(previewProgress * Math.PI * 10) * 5}deg)`,
                }
            case 'doorOpen':
                const doorProgress = Math.min(previewProgress * 2, 1)
                return {
                    ...baseStyle,
                    clipPath: 'none',
                    '&::before, &::after': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        height: '100%',
                        width: '50%',
                        backgroundImage: `url(${sourceImage?.src})`,
                        backgroundSize: 'cover',
                        transition: 'transform 0.3s ease-out',
                    },
                    '&::before': {
                        left: 0,
                        backgroundPosition: 'left',
                        transform: `translateX(${-doorProgress * 100}%)`,
                    },
                    '&::after': {
                        right: 0,
                        backgroundPosition: 'right',
                        transform: `translateX(${doorProgress * 100}%)`,
                    },
                }

            // ========== V114 新規効果プレビュー ==========

            // スライドイン（方向対応）
            case 'slideIn':
                // 矢印の方向へ移動するスライドイン
                switch (effectDirection) {
                    case 'left':
                        // 左矢印：右から左へ移動
                        return { ...baseStyle, transform: `translate(calc(-50% + ${(1 - previewProgress) * 100}%), -50%)` }
                    case 'right':
                        // 右矢印：左から右へ移動
                        return { ...baseStyle, transform: `translate(calc(-50% + ${(1 - previewProgress) * -100}%), -50%)` }
                    case 'up':
                        // 上矢印：下から上へ移動
                        return { ...baseStyle, transform: `translate(-50%, calc(-50% + ${(1 - previewProgress) * 100}%))` }
                    case 'down':
                    default:
                        // 下矢印：上から下へ移動
                        return { ...baseStyle, transform: `translate(-50%, calc(-50% + ${(1 - previewProgress) * -100}%))` }
                }

            // スライドアウト（方向対応）
            case 'slideOut':
                // 矢印の方向へ退場するスライドアウト
                switch (effectDirection) {
                    case 'left':
                        // 左矢印：左方向へ退場
                        return { ...baseStyle, transform: `translate(calc(-50% + ${previewProgress * -100}%), -50%)` }
                    case 'right':
                        // 右矢印：右方向へ退場
                        return { ...baseStyle, transform: `translate(calc(-50% + ${previewProgress * 100}%), -50%)` }
                    case 'up':
                        // 上矢印：上方向へ退場
                        return { ...baseStyle, transform: `translate(-50%, calc(-50% + ${previewProgress * -100}%))` }
                    case 'down':
                    default:
                        // 下矢印：下方向へ退場
                        return { ...baseStyle, transform: `translate(-50%, calc(-50% + ${previewProgress * 100}%))` }
                }

            // ワイプイン（方向対応）
            case 'wipeIn':
                switch (effectDirection) {
                    case 'left':
                        return { ...baseStyle, clipPath: `inset(0 0 0 ${(1 - previewProgress) * 100}%)` }
                    case 'right':
                        return { ...baseStyle, clipPath: `inset(0 ${(1 - previewProgress) * 100}% 0 0)` }
                    case 'up':
                        return { ...baseStyle, clipPath: `inset(0 0 ${(1 - previewProgress) * 100}% 0)` }
                    case 'down':
                    default:
                        return { ...baseStyle, clipPath: `inset(${(1 - previewProgress) * 100}% 0 0 0)` }
                }

            // ワイプアウト（方向対応）
            case 'wipeOut':
                switch (effectDirection) {
                    case 'left':
                        return { ...baseStyle, clipPath: `inset(0 ${previewProgress * 100}% 0 0)` }
                    case 'right':
                        return { ...baseStyle, clipPath: `inset(0 0 0 ${previewProgress * 100}%)` }
                    case 'up':
                        return { ...baseStyle, clipPath: `inset(${previewProgress * 100}% 0 0 0)` }
                    case 'down':
                    default:
                        return { ...baseStyle, clipPath: `inset(0 0 ${previewProgress * 100}% 0)` }
                }

            // 振動（方向対応）
            case 'vibration':
                const vibOffset = Math.sin(previewProgress * Math.PI * 8) * 5
                if (effectDirection === 'vertical') {
                    return { ...baseStyle, transform: `translate(-50%, calc(-50% + ${vibOffset}%))` }
                } else {
                    return { ...baseStyle, transform: `translate(calc(-50% + ${vibOffset}%), -50%)` }
                }

            // 閉扉（DoorClosePreviewコンポーネントを使用するため元画像は非表示）
            case 'doorClose':
                return { ...baseStyle, opacity: 0 }

            // 砂嵐イン/アウト（砂嵐ノイズから徐々に画像が現れる）
            case 'tvStaticIn':
                // 生成: ランダムピクセルにノイズを乗せる
                // CSS: SVGフィルターでノイズ感を表現 + 高コントラスト
                const staticInIntensity = 1 - previewProgress
                return {
                    ...baseStyle,
                    opacity: 0.3 + previewProgress * 0.7,
                    filter: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' result='noise'/%3E%3CfeDisplacementMap in='SourceGraphic' in2='noise' scale='${staticInIntensity * 30}' xChannelSelector='R' yChannelSelector='G'/%3E%3C/filter%3E%3C/svg%3E#n") contrast(${1 + staticInIntensity * 2})`,
                }
            case 'tvStaticOut':
                const staticOutIntensity = previewProgress
                return {
                    ...baseStyle,
                    opacity: 1 - previewProgress * 0.7,
                    filter: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' result='noise'/%3E%3CfeDisplacementMap in='SourceGraphic' in2='noise' scale='${staticOutIntensity * 30}' xChannelSelector='R' yChannelSelector='G'/%3E%3C/filter%3E%3C/svg%3E#n") contrast(${1 + staticOutIntensity * 2})`,
                }

            // グリッチイン/アウト（横スライスがランダムにズレる）
            case 'glitchIn':
                // 10個のスライスがランダムにズレて入ってくる
                const glitchInSkew = Math.sin(previewProgress * Math.PI * 8) * (1 - previewProgress) * 15
                return {
                    ...baseStyle,
                    opacity: 0.3 + previewProgress * 0.7,
                    transform: `translate(calc(-50% + ${Math.sin(previewProgress * Math.PI * 6) * (1 - previewProgress) * 20}px), -50%) skewX(${glitchInSkew}deg)`,
                    filter: `hue-rotate(${(1 - previewProgress) * 30}deg)`,
                }
            case 'glitchOut':
                const glitchOutSkew = Math.sin(previewProgress * Math.PI * 8) * previewProgress * 15
                return {
                    ...baseStyle,
                    opacity: 1 - previewProgress * 0.7,
                    transform: `translate(calc(-50% + ${Math.sin(previewProgress * Math.PI * 6) * previewProgress * 20}px), -50%) skewX(${glitchOutSkew}deg)`,
                    filter: `hue-rotate(${previewProgress * 30}deg)`,
                }

            // フォーカスイン/アウト
            case 'focusIn':
                return { ...baseStyle, filter: `blur(${(1 - previewProgress) * 20}px)` }
            case 'focusOut':
                return { ...baseStyle, filter: `blur(${previewProgress * 20}px)`, opacity: 1 - previewProgress * 0.5 }

            // スライスイン（横スライス - 5つの横帯が交互に左右からスライドイン）
            case 'sliceIn':
                // 生成: 5つのスライスが交互に左右から入ってくる
                // CSS: スライスの収束を横方向の移動とスケールで表現
                const sliceOffset = (1 - previewProgress) * 30
                return {
                    ...baseStyle,
                    opacity: previewProgress,
                    transform: `translate(calc(-50% + ${Math.sin(previewProgress * Math.PI * 3) * sliceOffset}px), -50%) scaleY(${0.8 + previewProgress * 0.2})`,
                }
            case 'sliceOut':
                const sliceOutOffset = previewProgress * 30
                return {
                    ...baseStyle,
                    opacity: 1 - previewProgress,
                    transform: `translate(calc(-50% + ${Math.sin(previewProgress * Math.PI * 3) * sliceOutOffset}px), -50%) scaleY(${1 - previewProgress * 0.2})`,
                }

            // V118: ブラインドイン
            case 'blindIn':
                return {
                    ...baseStyle,
                    opacity: previewProgress,
                    clipPath: `inset(0 0 ${(1 - previewProgress) * 100}% 0)`,
                }

            // V118: ブラインドアウト
            case 'blindOut':
                return {
                    ...baseStyle,
                    opacity: 1 - previewProgress,
                    clipPath: `inset(${previewProgress * 100}% 0 0 0)`,
                }

            // V118: 斬撃効果
            case 'swordSlashOut': {
                // CSSプレビューでは斜め分割の簡易表現
                const slashProgress = previewProgress
                const slideAmount = slashProgress * 30
                return {
                    ...baseStyle,
                    opacity: 1 - slashProgress * 0.8,
                    transform: `translate(calc(-50% + ${slideAmount}px), calc(-50% + ${slideAmount * 0.3}px)) rotate(${slashProgress * 5}deg)`,
                    clipPath: slashProgress > 0.15
                        ? `polygon(0 0, 100% ${50 - slashProgress * 30}%, 100% 0)`
                        : 'none',
                }
            }

            // V118: カード回転ループ
            case 'cardFlipLoop': {
                const flipProg = Math.sin(previewProgress * Math.PI * 2)
                const scaleX = Math.abs(flipProg)
                return {
                    ...baseStyle,
                    transform: `translate(-50%, -50%) scaleX(${Math.max(0.01, scaleX)})`,
                }
            }

            // タイルイン/アウト（4x4グリッドで順番に登場）
            case 'tileIn':
                // 生成: 4x4=16タイルが順番に現れる
                // CSS: タイル感を表現するためstep関数的なopacity変化
                const tileCount = 16
                const visibleTiles = Math.floor(previewProgress * tileCount)
                // タイルが徐々に埋まるイメージ - ステップ的なopacity
                const stepOpacity = visibleTiles / tileCount
                return {
                    ...baseStyle,
                    opacity: stepOpacity,
                    transform: `translate(-50%, -50%) scale(${0.9 + previewProgress * 0.1})`,
                }
            case 'tileOut':
                const tileOutCount = 16
                const visibleTilesOut = Math.floor((1 - previewProgress) * tileOutCount)
                const stepOpacityOut = visibleTilesOut / tileOutCount
                return {
                    ...baseStyle,
                    opacity: stepOpacityOut,
                    transform: `translate(-50%, -50%) scale(${1 - previewProgress * 0.1})`,
                }

            // ピクセレートイン/アウト（ピクセルから鮮明に）
            case 'pixelateIn':
                // 生成: 低解像度を拡大表示してピクセル化
                // CSS: image-rendering + contrastでピクセル感を強調
                return {
                    ...baseStyle,
                    // ピクセル感を出すためのcontrast調整
                    filter: `contrast(${1.5 - previewProgress * 0.5}) saturate(${0.5 + previewProgress * 0.5})`,
                    imageRendering: 'pixelated' as React.CSSProperties['imageRendering'],
                    transform: `translate(-50%, -50%) scale(${0.95 + previewProgress * 0.05})`,
                }
            case 'pixelateOut':
                const pixelBlurOut = previewProgress * 8
                return {
                    ...baseStyle,
                    opacity: 1 - previewProgress * 0.3,
                    filter: `contrast(${1 + previewProgress * 0.5}) saturate(${1 - previewProgress * 0.5})`,
                    imageRendering: 'pixelated' as React.CSSProperties['imageRendering'],
                    transform: `translate(-50%, -50%) scale(${1 - previewProgress * 0.05})`,
                }

            // アイリスイン/アウト
            case 'irisIn':
                return { ...baseStyle, clipPath: `circle(${previewProgress * 100}% at 50% 50%)` }
            case 'irisOut':
                return { ...baseStyle, clipPath: `circle(${(1 - previewProgress) * 100}% at 50% 50%)` }

            // 本めくりイン/アウト（2Dスキュー風 - ページがめくれるように登場）
            case 'pageFlipIn':
                // 生成: ctx.transform(progress, 0, flipInSkew, 1, ...)
                // CSS: perspective + rotateYでページめくりを表現
                const flipInAngle = (1 - previewProgress) * 90
                return {
                    ...baseStyle,
                    opacity: previewProgress,
                    transform: `translate(-50%, -50%) perspective(800px) rotateY(${flipInAngle}deg) scaleX(${0.5 + previewProgress * 0.5})`,
                    transformOrigin: 'left center',
                }
            case 'pageFlipOut':
                const flipOutAngle = previewProgress * 90
                return {
                    ...baseStyle,
                    opacity: 1 - previewProgress,
                    transform: `translate(-50%, -50%) perspective(800px) rotateY(${-flipOutAngle}deg) scaleX(${1 - previewProgress * 0.5})`,
                    transformOrigin: 'right center',
                }

            // カード回転イン/アウト（3D風回転）
            case 'cardFlipIn':
                return {
                    ...baseStyle,
                    opacity: previewProgress,
                    transform: `translate(-50%, -50%) perspective(1000px) rotateY(${(1 - previewProgress) * -90}deg)`,
                }
            case 'cardFlipOut':
                return {
                    ...baseStyle,
                    opacity: 1 - previewProgress,
                    transform: `translate(-50%, -50%) perspective(1000px) rotateY(${previewProgress * 90}deg)`,
                }

            // RGBずれ（3重描画色ずれ）
            case 'rgbShift':
                const shiftAmt = Math.sin(previewProgress * Math.PI) * 4
                return {
                    ...baseStyle,
                    filter: `
                        drop-shadow(${-shiftAmt}px 0 0 rgba(255, 0, 0, 0.4))
                        drop-shadow(${shiftAmt}px 0 0 rgba(0, 255, 255, 0.4))
                    `,
                }

            // 走査線
            case 'scanlines': {
                // effectOption で太さを決定（thin=2px, medium=4px, thick=8px）
                const scanThickness = effectOption === 'thin' ? 2 : effectOption === 'thick' ? 8 : 4
                // effectIntensityで色を決定（gray/blue/green）
                const scanColorPreview = effectIntensity === 'blue' ? 'rgba(0, 100, 255, 0.3)' :
                    effectIntensity === 'green' ? 'rgba(0, 200, 100, 0.3)' :
                        'rgba(0, 0, 0, 0.3)'
                // 動く光のY位置
                const scanY = (previewProgress * 100) % 100
                return {
                    ...baseStyle,
                    backgroundImage: `
                        linear-gradient(
                            0deg,
                            transparent 0%,
                            transparent 50%,
                            ${scanColorPreview} 50%,
                            ${scanColorPreview} 100%
                        )
                    `,
                    backgroundSize: `100% ${scanThickness}px`,
                    backgroundBlendMode: 'multiply' as const,
                    boxShadow: `inset 0 ${scanY}px 40px -20px rgba(255, 255, 255, 0.2)`,
                }
            }

            // ビネット
            case 'vignette':
                return { ...baseStyle, filter: `brightness(${1 - previewProgress * 0.3})` }

            // 脈動
            case 'pulsation': {
                const pulsationSizePreview = effectOption === 'small' ? 1.5 : effectOption === 'large' ? 6 : 3
                const aberAmtPreview = Math.sin(previewProgress * Math.PI) * pulsationSizePreview
                return {
                    ...baseStyle,
                    filter: `
                        drop-shadow(${-aberAmtPreview}px ${-aberAmtPreview}px 0 rgba(255, 0, 0, 0.3))
                        drop-shadow(${aberAmtPreview}px ${aberAmtPreview}px 0 rgba(0, 0, 255, 0.3))
                    `,
                }
            }

            // 閃光
            case 'flash':
                const flashOpacity = Math.sin(previewProgress * Math.PI)
                return { ...baseStyle, filter: `brightness(${1 + flashOpacity * 0.8})` }

            default:
                return baseStyle
        }
    }

    useEffect(() => {
        return () => {
            stopPreview()
        }
    }, [])

    // 方向が変更された時にプレビューを再起動
    useEffect(() => {
        if (isPlaying && sourceImage) {
            stopPreview()
            setTimeout(() => startPreview(), 50)
        }
    }, [effectDirection])

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800 py-1 px-4 sm:px-6 lg:px-8 relative">
            {/* Feedback Floating Button */}
            <div className="absolute top-4 right-4 z-50">
                <button
                    onClick={() => setIsFeedbackModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 rounded-full shadow-sm transition-all hover:scale-105 active:scale-95 group"
                >
                    <MessageSquare className="w-4 h-4" />
                    <span className="text-sm font-medium">意見を送る</span>
                </button>
            </div>
            <div className="container mx-auto px-4 py-0 max-w-7xl">
                <div className="flex flex-col items-center mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 80" className="w-full max-w-lg h-auto">
                        <defs>
                            <linearGradient id="gradient3" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" style={{ stopColor: "#2C3E50", stopOpacity: 1 }} />
                                <stop offset="100%" style={{ stopColor: "#3498DB", stopOpacity: 1 }} />
                            </linearGradient>
                        </defs>

                        <path d="M20,40 L30,23.4 L50,23.4 L60,40 L50,56.6 L30,56.6 Z"
                            fill="none"
                            stroke="url(#gradient3)"
                            strokeWidth="3" />

                        <rect x="35" y="35" width="10" height="10" fill="#3498DB" opacity="0.3">
                            <animate attributeName="opacity" values="0.3;1;0.3" dur="2s" repeatCount="indefinite" />
                        </rect>
                        <rect x="40" y="30" width="10" height="10" fill="#3498DB" opacity="0.6">
                            <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" />
                        </rect>
                        <rect x="45" y="25" width="10" height="10" fill="#3498DB">
                            <animate attributeName="opacity" values="1;0.8;1" dur="2s" repeatCount="indefinite" />
                        </rect>

                        <text x="80" y="53" fontFamily="Arial, sans-serif" fontSize="36" fontWeight="bold" fill="#2C3E50" dominantBaseline="auto">
                            <tspan style={{ letterSpacing: "1px" }}>APNG</tspan>
                            <tspan dx="5" style={{ fontSize: "32px", fontWeight: "normal" }}>Generator</tspan>
                        </text>
                    </svg>
                    <p className="text-xs text-gray-500 text-center -mt-5">
                        画像からトランジション効果付きのアニメーションPNG作成ツール
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-sm font-semibold text-gray-700">画像選択 & プレビュー</h3>
                                <Popover.Root>
                                    <Popover.Trigger asChild>
                                        <button className="text-sm font-medium text-blue-600 hover:text-blue-500 flex items-center">
                                            <Info className="w-4 h-4 mr-1" />
                                            使い方を表示
                                        </button>
                                    </Popover.Trigger>
                                    <Popover.Portal>
                                        <Popover.Content className="bg-white p-4 rounded-xl shadow-xl border border-gray-200 max-w-xs z-[60]">
                                            <h4 className="text-sm font-bold text-gray-700 mb-3 text-center">使い方（クイックガイド）</h4>
                                            <div className="space-y-2.5 mb-3">
                                                <div className="flex items-start gap-2">
                                                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                                        <span className="text-white font-bold text-xs">1</span>
                                                    </div>
                                                    <div>
                                                        <p className="text-base font-semibold text-gray-800">画像を選択</p>
                                                        <p className="text-xs text-gray-500">PNG/JPG画像をドラッグ＆ドロップ</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-2">
                                                    <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                                        <span className="text-white font-bold text-xs">2</span>
                                                    </div>
                                                    <div>
                                                        <p className="text-base font-semibold text-gray-800">効果・設定を選択</p>
                                                        <p className="text-xs text-gray-500 mb-1">登場・退場・演出から選択し、効果オプションや共通設定を調整</p>
                                                        <div className="text-xs text-gray-600 space-y-0.5 pl-2">
                                                            <p>・ループ設定：ON / OFF</p>
                                                            <p>・容量制限：制限なし / 1MB / 5MB / 10MB</p>
                                                            <p>・スピードやフレームレート</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-2">
                                                    <div className="w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                                        <span className="text-white font-bold text-xs">3</span>
                                                    </div>
                                                    <div>
                                                        <p className="text-base font-semibold text-gray-800">APNG生成</p>
                                                        <p className="text-xs text-gray-500">ボタンクリックでダウンロード</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <a
                                                href="/manual"
                                                className="flex items-center justify-center gap-1 w-full py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors"
                                            >
                                                📖 詳細マニュアルを見る
                                            </a>
                                            <Popover.Arrow className="fill-white" />
                                        </Popover.Content>
                                    </Popover.Portal>
                                </Popover.Root>
                            </div>

                            {/* First set of buttons - directly under the header */}
                            <div className="flex space-x-2 mb-4">
                                <button
                                    onClick={handlePreview}
                                    className="flex-1 bg-white hover:bg-blue-50 text-blue-500 font-medium py-2 px-4 rounded-lg transition duration-300 ease-in-out flex items-center justify-center border-2 border-blue-500"
                                >
                                    {isPlaying ? <Pause className="w-5 h-5 mr-2" /> : <Play className="w-5 h-5 mr-2" />}
                                    {isPlaying ? '停止' : 'プレビュー'}
                                </button>
                                <button
                                    onClick={generateAPNG}
                                    disabled={generationState !== 'idle' || !sourceImage}
                                    className="flex-1 bg-white hover:bg-green-50 text-green-500 font-medium py-2 px-4 rounded-lg transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center border-2 border-green-500"
                                >
                                    <Download className="w-5 h-5 mr-2" />
                                    APNG生成
                                </button>
                            </div>

                            {/* Image upload area */}
                            <div
                                ref={previewContainerRef}
                                className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center relative overflow-hidden cursor-pointer mb-4"
                                onClick={() => fileInputRef.current?.click()}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    handleFileUpload(e);
                                }}
                                style={{ padding: '10% 0' }} // 上下に10%のパディングを追加
                            >
                                {sourceImage ? (
                                    <>
                                        <canvas
                                            ref={previewCanvasRef}
                                            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 max-w-full max-h-full"
                                            style={{ imageRendering: 'auto' }}
                                        />
                                        {error && (
                                            <div className="absolute bottom-2 left-2 right-2 bg-red-100 border border-red-400 text-red-700 text-sm p-2 rounded-lg">
                                                {error}
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div className="text-center p-4">
                                        <Upload className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                                        {error && (
                                            <div className="text-orange-500 text-sm mb-2">
                                                ※ 画像をセットしてからプレビューしてください
                                            </div>
                                        )}
                                        <span className="text-gray-400">クリックまたはドラッグ&ドロップで画像を選択</span>
                                    </div>
                                )}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleFileUpload}
                                />
                            </div>
                        </div>

                        {/* Third set of buttons - outside the container */}
                        <div className="flex space-x-2">
                            <button
                                onClick={handlePreview}
                                className="flex-1 bg-white hover:bg-blue-50 text-blue-500 font-medium py-2 px-4 rounded-lg transition duration-300 ease-in-out flex items-center justify-center border-2 border-blue-500"
                            >
                                {isPlaying ? <Pause className="w-5 h-5 mr-2" /> : <Play className="w-5 h-5 mr-2" />}
                                {isPlaying ? '停止' : 'プレビュー'}
                            </button>
                            <button
                                onClick={generateAPNG}
                                disabled={generationState !== 'idle' || !sourceImage}
                                className="flex-1 bg-white hover:bg-green-50 text-green-500 font-medium py-2 px-4 rounded-lg transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center border-2 border-green-500"
                            >
                                <Download className="w-5 h-5 mr-2" />
                                APNG生成
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {/* トランジション効果選択 */}
                        <TransitionEffectsSelector
                            transition={transition}
                            setTransition={handleTransitionChange}
                            effectDirection={effectDirection}
                            setEffectDirection={setEffectDirection}
                            onDirectionChange={() => {
                                setOptimizedSize(null)
                                setCompressionInfo(null)
                                stopPreview()
                                setTimeout(() => startPreview(), 50)
                            }}
                            effectOption={effectOption}
                            setEffectOption={setEffectOption}
                            effectIntensity={effectIntensity}
                            setEffectIntensity={setEffectIntensity}
                            onOptionChange={() => {
                                setOptimizedSize(null)
                                setCompressionInfo(null)
                                stopPreview()
                                setTimeout(() => startPreview(), 50)
                            }}
                        />

                        {/* 共通設定カード */}
                        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200 divide-y divide-gray-100">
                            <h3 className="text-sm font-semibold text-gray-700 pb-2">共通設定</h3>

                            {/* V118: ループトグル（トグルスイッチ） */}
                            <div className="flex items-center gap-3 py-2.5">
                                <span className="text-sm font-medium text-gray-700">ループ</span>
                                <button
                                    onClick={() => {
                                        const newValue = !isLooping
                                        setIsLooping(newValue)
                                        setLoopSettingsPerEffect(prev => ({ ...prev, [transition]: newValue }))
                                        setOptimizedSize(null)
                                        setCompressionInfo(null)
                                    }}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${isLooping ? 'bg-blue-500' : 'bg-gray-300'
                                        }`}
                                    role="switch"
                                    aria-checked={isLooping}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${isLooping ? 'translate-x-6' : 'translate-x-1'
                                            }`}
                                    />
                                </button>
                                <span className="text-sm text-gray-600">
                                    {isLooping ? '現在：ループあり' : '現在：ループなし'}
                                </span>
                            </div>

                            {/* V118: 容量制限セグメント（制限なし/1MB/5MB/10MB） */}
                            <div className="flex items-center gap-3 py-2.5">
                                <span className="text-sm font-medium text-gray-700">容量制限</span>
                                <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50">
                                    {[
                                        { value: null, label: '制限なし' },
                                        { value: 1, label: '1MB' },
                                        { value: 5, label: '5MB' },
                                        { value: 10, label: '10MB' },
                                    ].map((option, index) => (
                                        <button
                                            key={option.label}
                                            onClick={() => {
                                                setSizeLimit(option.value)
                                                setOptimizedSize(null)
                                                setCompressionInfo(null)
                                            }}
                                            className={`px-4 py-1.5 text-sm font-medium transition-all duration-200 ${index === 0 ? 'rounded-l-lg' : ''
                                                } ${index === 3 ? 'rounded-r-lg' : ''
                                                } ${sizeLimit === option.value
                                                    ? 'bg-blue-500 text-white shadow-sm'
                                                    : 'text-gray-600 hover:bg-gray-100'
                                                }`}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* V118: 再生スピードスライダー */}
                            <div className="flex items-center gap-4 py-2.5">
                                <label htmlFor="speed-range" className="text-sm font-medium text-gray-700 whitespace-nowrap min-w-[120px]">
                                    再生スピード ({playbackSpeed.toFixed(2)}x)
                                </label>
                                <div className="flex-1 flex items-center gap-2">
                                    <span className="text-xs text-gray-400">0.25x</span>
                                    <input
                                        id="speed-range"
                                        type="range"
                                        min="0.25"
                                        max="2"
                                        step="0.05"
                                        value={playbackSpeed}
                                        onChange={(e) => {
                                            const newSpeed = Number(e.target.value)
                                            setPlaybackSpeed(newSpeed)
                                            playbackSpeedRef.current = newSpeed // refも即時更新
                                            setSpeedSettingsPerEffect(prev => ({ ...prev, [transition]: newSpeed }))
                                            stopPreview()
                                            setTimeout(() => startPreview(), 50)
                                        }}
                                        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                    />
                                    <span className="text-xs text-gray-400">2.0x</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 py-2.5">
                                <label htmlFor="fps-range" className="text-sm font-medium text-gray-700 whitespace-nowrap min-w-[120px]">
                                    フレームレート ({fps} fps)
                                </label>
                                <div className="flex-1 flex items-center gap-2">
                                    <span className="text-xs text-gray-400">10</span>
                                    <input
                                        id="fps-range"
                                        type="range"
                                        min="10"
                                        max="40"
                                        value={fps}
                                        onChange={(e) => {
                                            setFps(Number(e.target.value))
                                            setOptimizedSize(null)
                                            setCompressionInfo(null)
                                        }}
                                        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                    />
                                    <span className="text-xs text-gray-400">40</span>
                                </div>
                            </div>

                            {imageSize && (
                                <div className="pt-2.5 space-y-1">
                                    <p className="text-xs text-gray-600">元の画像サイズ: {imageSize.width} x {imageSize.height} px</p>
                                    {estimatedSize !== null && (
                                        <p className="text-xs text-gray-600">
                                            予想APNG容量: {estimatedSize.toFixed(2)} MB
                                            {sizeLimit !== null && estimatedSize > sizeLimit && (
                                                <span className="text-yellow-600 ml-2">
                                                    ({sizeLimit}MB以下に自動調整されます)
                                                </span>
                                            )}
                                        </p>
                                    )}
                                    {optimizedSize && sizeLimit !== null && (
                                        <p className="text-xs text-gray-600">
                                            最適化後: {optimizedSize.width} x {optimizedSize.height} px
                                            {compressionInfo && (
                                                <>
                                                    <span className="mx-1">|</span>
                                                    {compressionInfo.colorNum === 0 ? 'フルカラー' : `${compressionInfo.colorNum}色`}
                                                    <span className="mx-1">|</span>
                                                    {compressionInfo.actualMB !== undefined ? (
                                                        <>
                                                            <span className="text-green-600 font-semibold">{compressionInfo.actualMB.toFixed(2)} MB</span>
                                                            <span className="text-gray-400 text-xs ml-1">(推定: {compressionInfo.estimatedMB.toFixed(2)} MB)</span>
                                                        </>
                                                    ) : (
                                                        <>推定: {compressionInfo.estimatedMB.toFixed(2)} MB</>
                                                    )}
                                                </>
                                            )}
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div >



                <canvas ref={canvasRef} style={{ display: 'none' }} />

                {
                    generationState !== 'idle' && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                            <div className="bg-white p-8 rounded-lg shadow-xl max-w-sm w-full">
                                {generationState === 'generating' ? (
                                    <>
                                        <h2 className="text-2xl font-bold mb-4 text-gray-800">APNG生成中</h2>
                                        <div className="mb-6">
                                            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                                <div
                                                    className="h-2 bg-blue-600 rounded-full transition-all duration-300 ease-in-out"
                                                    style={{ width: generationPhase === 'completing' ? '100%' : `${generationProgress * 100}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-center">
                                            <Settings className="w-8 h-8 text-blue-600 animate-spin" />
                                        </div>
                                        <p className="mt-4 text-sm text-gray-600 text-center">
                                            {generationPhase === 'measuring' && (
                                                <>最適な圧縮設定を測定中...</>
                                            )}
                                            {generationPhase === 'generating' && (
                                                <>フレーム生成中... ({Math.floor(generationProgress * 100)}%)</>
                                            )}
                                            {generationPhase === 'encoding' && (
                                                <>APNGエンコード中...</>
                                            )}
                                            {generationPhase === 'optimizing' && (
                                                <>サイズ最適化中... ({Math.floor(generationProgress * 100)}%)</>
                                            )}
                                            {generationPhase === 'completing' && (
                                                <>ダウンロード準備中...</>
                                            )}
                                            {generationPhase === 'idle' && (
                                                <>準備中...</>
                                            )}
                                            <br />
                                            <span className="text-xs text-gray-400">画像サイズやエフェクトによって時間がかかる場合があります</span>
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <h2 className="text-2xl font-bold mb-4 text-gray-800 flex items-center justify-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-8 h-8 mr-2 text-green-500">
                                                <path d="M21,16.5C21,16.88 20.79,17.21 20.47,17.38L12.57,21.82C12.41,21.94 12.21,22 12,22C11.79,22 11.59,21.94 11.43,21.82L3.53,17.38C3.21,17.21 3,16.88 3,16.5V7.5C3,7.12 3.21,6.79 3.53,6.62L11.43,2.18C11.59,2.06 11.79,2 12,2C12.21,2 12.41,2.06 12.57,2.18L20.47,6.62C20.79,6.79 21,7.12 21,7.5V16.5M12,4.15L6.04,7.5L12,10.85L17.96,7.5L12,4.15M5,15.91L11,19.29V12.58L5,9.21V15.91M19,15.91V9.21L13,12.58V19.29L19,15.91Z" fill="currentColor" />
                                                <path d="M14,14.5L11,12.5L9,14.5L11,16.5L14,14.5Z" fill="currentColor" />
                                            </svg>
                                            生成完了
                                        </h2>
                                        <p className="mb-4 text-gray-600 text-center">APNGの生成が完了しました。ダウンロードを確認してください。</p>
                                        {optimizedSize && compressionInfo && (
                                            <p className="mb-6 text-sm text-gray-500 text-center">
                                                {optimizedSize.width} x {optimizedSize.height} px |
                                                {compressionInfo.colorNum === 0 ? 'フルカラー' : `${compressionInfo.colorNum}色`} |
                                                {compressionInfo.actualMB !== undefined ? (
                                                    <>
                                                        <span className="text-green-600 font-semibold">{compressionInfo.actualMB.toFixed(2)} MB</span>
                                                        <span className="text-gray-400 text-xs ml-1">(推定: {compressionInfo.estimatedMB.toFixed(2)} MB)</span>
                                                    </>
                                                ) : (
                                                    <>推定: {compressionInfo.estimatedMB.toFixed(2)} MB</>
                                                )}
                                            </p>
                                        )}
                                        <button
                                            onClick={() => setGenerationState('idle')}
                                            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                                        >
                                            OK
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    )
                }

                {/* 注意書き */}
                <div className="mt-8 mb-12 text-sm text-gray-500 text-center">
                    <p>※本WEBツールは試験的に作成し、テスト公開しているものとなります。</p>
                    <p>
                        不具合や改善点、ご意見ございましたら、お手数ですが
                        <button
                            onClick={() => setIsFeedbackModalOpen(true)}
                            className="text-blue-600 hover:text-blue-800 underline font-medium mx-1"
                        >
                            意見を送る
                        </button>
                        からフィードバックをお寄せください。今後の参考にさせていただきます。
                    </p>
                </div>
            </div >
            {/* SVGフィルターの追加 */}
            < svg className="hidden" >
                <filter id="glitch">
                    <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" result="noise" />
                    <feDisplacementMap in="SourceGraphic" in2="noise" scale="5" xChannelSelector="R" yChannelSelector="G" />
                    <feColorMatrix type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 1 0" />
                    <feComposite operator="in" in2="SourceGraphic" />
                </filter>
            </svg >
            <canvas ref={canvasRef} style={{ display: 'none' }} />
            <FeedbackModal isOpen={isFeedbackModalOpen} onClose={() => setIsFeedbackModalOpen(false)} version="V121" />
        </div >
    )
}